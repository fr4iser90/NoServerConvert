import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import JSZip from 'jszip'

export interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused'
  progress: number
  error?: string
  convertedBlob?: Blob
  convertedName?: string
  converter: string
  options?: Record<string, any>
  priority: number
  addedAt: Date
  startedAt?: Date
  completedAt?: Date
  downloadedAt?: Date // 🎯 Track download status
}

export const useQueueStore = defineStore('queue', () => {
  const files = ref<QueuedFile[]>([])
  const isProcessing = ref(false)
  const maxConcurrent = ref(3) // Process 3 files simultaneously
  const maxMemoryUsage = ref(1024 * 1024 * 1024) // 1GB limit
  const bulkDownloadMode = ref<'pack10' | 'all'>('pack10') // 🎯 BULK DOWNLOAD MODE!
  const bulkCounter = ref(1) // 🎯 Counter for consistent naming - EXPOSED!

  // 🎯 FFmpeg instances for queue processing
  const ffmpegInstances = ref<Map<string, any>>(new Map())

  // Computed properties
  const pendingFiles = computed(() => 
    files.value.filter(f => f.status === 'pending').sort((a, b) => b.priority - a.priority)
  )
  
  const processingFiles = computed(() => 
    files.value.filter(f => f.status === 'processing')
  )
  
  const completedFiles = computed(() => 
    files.value.filter(f => f.status === 'completed')
  )
  
  const errorFiles = computed(() => 
    files.value.filter(f => f.status === 'error')
  )

  const canProcessMore = computed(() => 
    processingFiles.value.length < maxConcurrent.value && pendingFiles.value.length > 0
  )

  const totalProgress = computed(() => {
    if (files.value.length === 0) return 0
    const total = files.value.reduce((sum, file) => sum + file.progress, 0)
    return Math.round(total / files.value.length)
  })

  // Actions
  function addFiles(newFiles: File[], converter: string, options: Record<string, any> = {}) {
    console.log(`[Queue] Adding ${newFiles.length} files to queue for ${converter} converter`)
    
    const queuedFiles = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0,
      converter,
      options,
      priority: 5, // Default priority
      addedAt: new Date()
    }))
    
    files.value.push(...queuedFiles)
    console.log(`[Queue] Total files in queue: ${files.value.length}`)
  }

  function removeFile(id: string) {
    const index = files.value.findIndex(f => f.id === id)
    if (index !== -1) {
      console.log(`[Queue] Removing file: ${files.value[index].file.name}`)
      files.value.splice(index, 1)
    }
  }

  function updateFileStatus(id: string, status: QueuedFile['status'], progress = 0, error?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      console.log(`[Queue] Updating ${file.file.name}: ${file.status} -> ${status} (${progress}%)`)
      file.status = status
      file.progress = progress
      if (error) file.error = error
      if (status === 'processing' && !file.startedAt) file.startedAt = new Date()
      if (status === 'completed' || status === 'error') file.completedAt = new Date()
    }
  }

  function setConvertedFile(id: string, blob: Blob, name?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.convertedBlob = blob
      file.convertedName = name
      file.status = 'completed'
      file.progress = 100
      file.completedAt = new Date()
      
      console.log(`[Queue] ✅ Conversion completed: ${file.file.name} -> ${name}`)
      
      // 🎯 WICHTIG: BULK DOWNLOAD LOGIC!
      checkForBulkDownload()
    }
  }

  // 🎯 BULK DOWNLOAD CHECKER
  function checkForBulkDownload() {
    const completed = completedFiles.value.filter(f => !f.downloadedAt)
    
    if (bulkDownloadMode.value === 'pack10') {
      // Download in 10er-Paketen
      if (completed.length >= 10) {
        const pack = completed.slice(0, 10)
        console.log(`[Queue] 📦 Creating 10-pack download with ${pack.length} files`)
        downloadBulk(pack, `Pack-${bulkCounter.value}`)
        bulkCounter.value++
        
        // Mark as downloaded
        pack.forEach(file => {
          file.downloadedAt = new Date()
        })
      }
    } else if (bulkDownloadMode.value === 'all') {
      // Warten bis alle fertig sind, dann alle downloaden
      if (pendingFiles.value.length === 0 && processingFiles.value.length === 0 && completed.length > 0) {
        console.log(`[Queue] 📦 Creating complete download with ${completed.length} files`)
        downloadBulk(completed, 'Complete')
        
        // Mark as downloaded
        completed.forEach(file => {
          file.downloadedAt = new Date()
        })
      }
    }
  }

  // 🎯 BULK DOWNLOAD FUNCTION - FIXED ZIP-IN-ZIP!
  async function downloadBulk(files: QueuedFile[], packName: string) {
    try {
      console.log(`[Queue] 🎯 Starting ${packName} bulk download for ${files.length} files`)
      
      if (files.length === 1) {
        // Single file - direct download
        const file = files[0]
        if (file.convertedBlob && file.convertedName) {
          const url = URL.createObjectURL(file.convertedBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.convertedName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          console.log(`[Queue] 📥 Downloaded single file: ${file.convertedName}`)
        }
        return
      }

      // Multiple files - create ZIP
      const zip = new JSZip()
      let validFiles = 0

      for (const file of files) {
        if (file.convertedBlob && file.convertedName) {
          // 🎯 WICHTIG: Check if converted file is already a ZIP and extract it!
          const isZipFile = file.convertedName.endsWith('.zip')
          
          if (isZipFile) {
            console.log(`[Queue] 📦 Extracting ZIP contents from: ${file.convertedName}`)
            try {
              // Load the ZIP and extract its contents
              const existingZip = await JSZip.loadAsync(file.convertedBlob)
              const baseName = file.file.name.split('.')[0]
              
              // Add each file from the ZIP to our main ZIP
              for (const [fileName, zipEntry] of Object.entries(existingZip.files)) {
                if (!zipEntry.dir) {
                  const content = await zipEntry.async('blob')
                  // Prefix with original filename to avoid conflicts
                  const newFileName = `${baseName}_${fileName}`
                  zip.file(newFileName, content)
                  console.log(`[Queue] 📄 Extracted: ${fileName} -> ${newFileName}`)
                }
              }
            } catch (zipError) {
              console.warn(`[Queue] ⚠️ Could not extract ZIP ${file.convertedName}, adding as-is:`, zipError)
              // If extraction fails, add the ZIP as-is
              const baseName = file.file.name.split('.')[0]
              const zipName = `${baseName}_converted.zip`
              zip.file(zipName, file.convertedBlob)
            }
          } else {
            // Regular file - add directly
            // Avoid name conflicts by checking for duplicates
            let fileName = file.convertedName
            let counter = 1
            while (zip.files[fileName]) {
              const nameParts = file.convertedName.split('.')
              const extension = nameParts.pop()
              const baseName = nameParts.join('.')
              fileName = `${baseName}_${counter}.${extension}`
              counter++
            }
            
            zip.file(fileName, file.convertedBlob)
            console.log(`[Queue] 📄 Added: ${fileName}`)
          }
          validFiles++
        }
      }

      if (validFiles === 0) {
        console.warn('[Queue] ⚠️ No valid files to download')
        return
      }

      console.log(`[Queue] 📦 Creating ZIP with ${validFiles} files...`)
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      // 🎯 CONSISTENT NAMING!
      const zipName = `Converted_${packName}.zip`
      
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = zipName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`[Queue] 🎉 Bulk download completed: ${zipName} (${validFiles} files)`)
      
      // Show user notification
      showBulkDownloadNotification(validFiles, zipName)
      
    } catch (error) {
      console.error('[Queue] ❌ Bulk download failed:', error)
    }
  }

  function showBulkDownloadNotification(fileCount: number, zipName: string) {
    // Create temporary notification
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui;
      font-weight: 500;
    `
    notification.innerHTML = `
      🎉 Bulk Download Complete!<br>
      📦 ${fileCount} files in ${zipName}
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  // 🎯 FFMPEG INITIALIZATION FOR QUEUE
  async function initFFmpegForQueue(converterType: 'audio' | 'video') {
    if (ffmpegInstances.value.has(converterType)) {
      console.log(`[Queue] FFmpeg already initialized for ${converterType}`)
      return ffmpegInstances.value.get(converterType)
    }

    try {
      console.log(`[Queue] Initializing FFmpeg for ${converterType}...`)
      
      // Dynamic import to avoid loading FFmpeg unless needed
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm'
      
      const ffmpeg = new FFmpeg()
      
      // Add event listeners
      ffmpeg.on('log', ({ message }) => {
        console.log(`[Queue FFmpeg ${converterType}]`, message)
      })
      
      ffmpeg.on('progress', ({ progress }) => {
        console.log(`[Queue FFmpeg ${converterType}] Progress:`, progress)
      })
      
      // Load FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      })
      
      if (!ffmpeg.loaded) {
        throw new Error('FFmpeg failed to load properly')
      }
      
      ffmpegInstances.value.set(converterType, ffmpeg)
      console.log(`[Queue] ✅ FFmpeg initialized for ${converterType}`)
      
      return ffmpeg
      
    } catch (error) {
      console.error(`[Queue] ❌ Failed to initialize FFmpeg for ${converterType}:`, error)
      throw error
    }
  }

  async function startProcessing() {
    if (isProcessing.value) {
      console.log('[Queue] Already processing, skipping start')
      return
    }
    
    console.log('[Queue] 🚀 Starting queue processing...')
    isProcessing.value = true
    
    try {
      // 🎯 WICHTIG: Kontinuierliche Verarbeitung bis Queue leer ist!
      while (pendingFiles.value.length > 0) {
        console.log(`[Queue] 📋 Processing batch: ${pendingFiles.value.length} files remaining`)
        
        // Starte bis zu maxConcurrent Dateien gleichzeitig
        const batch = pendingFiles.value.slice(0, maxConcurrent.value)
        console.log(`[Queue] ⚙️ Starting batch of ${batch.length} files`)
        
        // Alle Dateien im Batch parallel verarbeiten
        const processingPromises = batch.map(file => processFile(file))
        
        // Warten bis alle Dateien im Batch fertig sind
        await Promise.allSettled(processingPromises)
        
        console.log(`[Queue] ✅ Batch completed, checking for more files...`)
        
        // Kurze Pause zwischen Batches für UI-Updates
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log('[Queue] 🎉 All queue processing completed!')
      
      // 🎯 FINAL BULK DOWNLOAD CHECK
      if (bulkDownloadMode.value === 'all') {
        checkForBulkDownload()
      }
      
    } catch (error) {
      console.error('[Queue] ❌ Error during queue processing:', error)
    } finally {
      isProcessing.value = false
      console.log('[Queue] 🏁 Queue processing finished')
    }
  }

  async function processFile(queuedFile: QueuedFile) {
    console.log(`[Queue] 🔄 Starting processing: ${queuedFile.file.name}`)
    updateFileStatus(queuedFile.id, 'processing', 0)
    
    try {
      // Import the appropriate converter dynamically
      let result
      switch (queuedFile.converter) {
        case 'pdf': {
          const { PdfConverter } = await import('@shared/converters/modules/document/pdf/PdfConverter')
          const converter = new PdfConverter()
          result = await converter.convert(queuedFile.file, queuedFile.options)
          break
        }
        case 'image': {
          const format = queuedFile.options?.format || 'png'
          if (format === 'jpg' || format === 'jpeg') {
            const { JpgConverter } = await import('@shared/converters/modules/image/basic/jpg/JpgConverter')
            const converter = new JpgConverter()
            result = await converter.convert(queuedFile.file, queuedFile.options)
          } else if (format === 'webp') {
            const { WebpConverter } = await import('@shared/converters/modules/image/basic/webp/WebpConverter')
            const converter = new WebpConverter()
            result = await converter.convert(queuedFile.file, queuedFile.options)
          } else {
            const { PngConverter } = await import('@shared/converters/modules/image/basic/png/PngConverter')
            const converter = new PngConverter()
            result = await converter.convert(queuedFile.file, queuedFile.options)
          }
          break
        }
        case 'audio': {
          // 🎯 FFMPEG AUDIO PROCESSING IN QUEUE!
          result = await processAudioInQueue(queuedFile)
          break
        }
        case 'video': {
          // 🎯 FFMPEG VIDEO PROCESSING IN QUEUE!
          result = await processVideoInQueue(queuedFile)
          break
        }
        default:
          throw new Error(`Unknown converter: ${queuedFile.converter}`)
      }
      
      if (result.error) {
        console.error(`[Queue] ❌ Conversion failed for ${queuedFile.file.name}:`, result.error)
        updateFileStatus(queuedFile.id, 'error', 0, result.error)
      } else {
        console.log(`[Queue] ✅ Conversion successful for ${queuedFile.file.name} -> ${result.fileName}`)
        // 🎯 WICHTIG: Nur als completed markieren, KEIN einzelner Download!
        setConvertedFile(queuedFile.id, result.blob, result.fileName)
      }
      
    } catch (error) {
      console.error(`[Queue] ❌ Error processing ${queuedFile.file.name}:`, error)
      updateFileStatus(queuedFile.id, 'error', 0, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // 🎯 AUDIO PROCESSING IN QUEUE
  async function processAudioInQueue(queuedFile: QueuedFile) {
    try {
      console.log(`[Queue] 🎵 Processing audio: ${queuedFile.file.name}`)
      
      // Initialize FFmpeg for audio if needed
      const ffmpeg = await initFFmpegForQueue('audio')
      
      // Progress tracking
      let progressValue = 10
      const progressInterval = setInterval(() => {
        const currentFile = files.value.find(f => f.id === queuedFile.id)
        if (currentFile && currentFile.status === 'processing') {
          progressValue = Math.min(progressValue + 15, 90)
          currentFile.progress = progressValue
        }
      }, 500)
      
      const { fetchFile } = await import('@ffmpeg/util')
      
      // Prepare file names
      const inputFileName = 'input' + queuedFile.file.name.substring(queuedFile.file.name.lastIndexOf('.'))
      const format = queuedFile.options?.format || 'mp3'
      const outputFileName = 'output.' + format
      
      // Write input file
      await ffmpeg.writeFile(inputFileName, await fetchFile(queuedFile.file))
      
      // FFmpeg options based on format and operation
      let ffmpegArgs: string[]
      
      if (queuedFile.options?.format === 'compress') {
        // Compression
        ffmpegArgs = [
          '-i', inputFileName,
          '-c:a', 'libmp3lame',
          '-q:a', '4', // Lower quality for compression
          '-ar', '44100',
          '-ac', '2',
          'output.mp3'
        ]
      } else {
        // Format conversion
        const quality = queuedFile.options?.quality || 2
        if (format === 'mp3') {
          ffmpegArgs = ['-i', inputFileName, '-c:a', 'libmp3lame', '-q:a', quality.toString(), outputFileName]
        } else if (format === 'wav') {
          ffmpegArgs = ['-i', inputFileName, '-c:a', 'pcm_s16le', outputFileName]
        } else if (format === 'ogg') {
          ffmpegArgs = ['-i', inputFileName, '-c:a', 'libvorbis', '-q:a', quality.toString(), outputFileName]
        } else {
          throw new Error(`Unsupported audio format: ${format}`)
        }
      }
      
      // Run FFmpeg conversion
      await ffmpeg.exec(ffmpegArgs)
      
      // Read output file
      const data = await ffmpeg.readFile(outputFileName.includes('.') ? outputFileName : 'output.mp3')
      const outputFormat = queuedFile.options?.format === 'compress' ? 'mp3' : format
      const blob = new Blob([data], { type: `audio/${outputFormat}` })
      
      clearInterval(progressInterval)
      
      // Generate output filename
      const baseName = queuedFile.file.name.split('.')[0]
      const extension = queuedFile.options?.format === 'compress' ? 'mp3' : outputFormat
      const fileName = queuedFile.options?.format === 'compress' 
        ? `compressed_${baseName}.${extension}`
        : `${baseName}.${extension}`
      
      return {
        blob,
        fileName
      }
      
    } catch (error) {
      console.error(`[Queue] ❌ Audio processing failed:`, error)
      return {
        blob: new Blob(),
        fileName: queuedFile.file.name,
        error: error instanceof Error ? error.message : 'Audio conversion failed'
      }
    }
  }

  // 🎯 VIDEO PROCESSING IN QUEUE
  async function processVideoInQueue(queuedFile: QueuedFile) {
    try {
      console.log(`[Queue] 🎥 Processing video: ${queuedFile.file.name}`)
      
      // Initialize FFmpeg for video if needed
      const ffmpeg = await initFFmpegForQueue('video')
      
      // Progress tracking
      let progressValue = 10
      const progressInterval = setInterval(() => {
        const currentFile = files.value.find(f => f.id === queuedFile.id)
        if (currentFile && currentFile.status === 'processing') {
          progressValue = Math.min(progressValue + 10, 90)
          currentFile.progress = progressValue
        }
      }, 1000) // Slower for video
      
      const { fetchFile } = await import('@ffmpeg/util')
      
      // Prepare file names
      const inputFileName = 'input' + queuedFile.file.name.substring(queuedFile.file.name.lastIndexOf('.'))
      const format = queuedFile.options?.format || 'mp4'
      const outputFileName = 'output.' + format
      
      // Write input file
      await ffmpeg.writeFile(inputFileName, await fetchFile(queuedFile.file))
      
      // FFmpeg options based on operation
      let ffmpegArgs: string[]
      let outputFormat = format
      let fileName: string
      
      if (queuedFile.options?.format === 'extract-audio') {
        // Extract audio
        ffmpegArgs = [
          '-i', inputFileName,
          '-vn', // No video
          '-acodec', 'libmp3lame',
          '-q:a', '2',
          'output.mp3'
        ]
        outputFormat = 'mp3'
        fileName = `${queuedFile.file.name.split('.')[0]}.mp3`
      } else if (queuedFile.options?.format === 'compress') {
        // Compress video
        ffmpegArgs = [
          '-i', inputFileName,
          '-c:v', 'libx264',
          '-crf', '28', // Higher CRF for compression
          '-preset', 'medium',
          '-c:a', 'aac',
          '-b:a', '128k',
          outputFileName
        ]
        fileName = `compressed_${queuedFile.file.name}`
      } else {
        // Format conversion
        const quality = queuedFile.options?.quality || 23
        if (format === 'mp4') {
          ffmpegArgs = ['-i', inputFileName, '-c:v', 'libx264', '-crf', quality.toString(), '-c:a', 'aac', outputFileName]
        } else if (format === 'webm') {
          ffmpegArgs = ['-i', inputFileName, '-c:v', 'libvpx-vp9', '-crf', quality.toString(), '-c:a', 'libopus', outputFileName]
        } else {
          throw new Error(`Unsupported video format: ${format}`)
        }
        fileName = `${queuedFile.file.name.split('.')[0]}.${format}`
      }
      
      // Run FFmpeg conversion
      await ffmpeg.exec(ffmpegArgs)
      
      // Read output file
      const outputFile = queuedFile.options?.format === 'extract-audio' ? 'output.mp3' : outputFileName
      const data = await ffmpeg.readFile(outputFile, 'binary') as Uint8Array
      const mimeType = queuedFile.options?.format === 'extract-audio' ? 'audio/mp3' : `video/${outputFormat}`
      const blob = new Blob([data], { type: mimeType })
      
      clearInterval(progressInterval)
      
      return {
        blob,
        fileName
      }
      
    } catch (error) {
      console.error(`[Queue] ❌ Video processing failed:`, error)
      return {
        blob: new Blob(),
        fileName: queuedFile.file.name,
        error: error instanceof Error ? error.message : 'Video conversion failed'
      }
    }
  }

  function pauseProcessing() {
    console.log('[Queue] ⏸️ Pausing processing')
    isProcessing.value = false
  }

  function clearCompleted() {
    const completedCount = completedFiles.value.length
    files.value = files.value.filter(f => f.status !== 'completed')
    console.log(`[Queue] 🗑️ Cleared ${completedCount} completed files`)
  }

  function clearErrors() {
    const errorCount = errorFiles.value.length
    files.value = files.value.filter(f => f.status !== 'error')
    console.log(`[Queue] 🗑️ Cleared ${errorCount} error files`)
  }

  function clearAll() {
    console.log('[Queue] 🗑️ Clearing all files')
    files.value = []
    isProcessing.value = false
    bulkCounter.value = 1 // Reset counter
    
    // Clean up FFmpeg instances
    ffmpegInstances.value.clear()
  }

  function retryFile(id: string) {
    const file = files.value.find(f => f.id === id)
    if (file && file.status === 'error') {
      console.log(`[Queue] 🔄 Retrying file: ${file.file.name}`)
      file.status = 'pending'
      file.progress = 0
      file.error = undefined
      
      if (!isProcessing.value) {
        startProcessing()
      }
    }
  }

  function setPriority(id: string, priority: number) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.priority = Math.max(1, Math.min(10, priority))
      console.log(`[Queue] 📋 Set priority for ${file.file.name}: ${file.priority}`)
    }
  }

  function updateQueueOptions(converter: string, newOptions: Record<string, any>) {
    console.log(`[Queue] ⚙️ Updating options for ${converter} files:`, newOptions)
    files.value
      .filter(f => f.converter === converter && f.status === 'pending')
      .forEach(f => {
        f.options = { ...f.options, ...newOptions }
      })
  }

  // 🎯 BULK DOWNLOAD MODE SETTER
  function setBulkDownloadMode(mode: 'pack10' | 'all') {
    bulkDownloadMode.value = mode
    console.log(`[Queue] 📦 Bulk download mode set to: ${mode}`)
    
    // Reset counter when changing mode
    if (mode === 'pack10') {
      bulkCounter.value = 1
    }
  }

  // 🎯 MANUAL BULK DOWNLOAD TRIGGER
  function triggerBulkDownload() {
    const completed = completedFiles.value.filter(f => !f.downloadedAt)
    if (completed.length > 0) {
      downloadBulk(completed, 'Manual')
      completed.forEach(file => {
        file.downloadedAt = new Date()
      })
    }
  }

  return {
    // State
    files,
    isProcessing,
    maxConcurrent,
    maxMemoryUsage,
    bulkDownloadMode,
    bulkCounter, // 🎯 EXPOSED for PDF store!
    
    // Computed
    pendingFiles,
    processingFiles,
    completedFiles,
    errorFiles,
    canProcessMore,
    totalProgress,
    
    // Actions
    addFiles,
    removeFile,
    updateFileStatus,
    setConvertedFile,
    startProcessing,
    pauseProcessing,
    clearCompleted,
    clearErrors,
    clearAll,
    retryFile,
    setPriority,
    updateQueueOptions,
    setBulkDownloadMode,
    triggerBulkDownload
  }
})