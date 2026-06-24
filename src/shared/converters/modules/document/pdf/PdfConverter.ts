import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

type PdfCompressionPreset = 'high' | 'balanced' | 'small'

type PdfCompressionCandidate = {
  label: string
  scale: number
  jpegQuality: number
}

const PDF_COMPRESSION_PRESETS: Record<PdfCompressionPreset, {
  label: string
  scale: number
  jpegQuality: number
}> = {
  high: {
    label: 'High Quality',
    scale: 1.5,
    jpegQuality: 0.85
  },
  balanced: {
    label: 'Balanced',
    scale: 1.2,
    jpegQuality: 0.7
  },
  small: {
    label: 'Small File',
    scale: 0.9,
    jpegQuality: 0.5
  }
}

const PDF_COMPRESSION_FALLBACKS: Record<PdfCompressionPreset, PdfCompressionPreset[]> = {
  high: ['high', 'balanced', 'small'],
  balanced: ['balanced', 'small'],
  small: ['small']
}

const PDF_TARGET_COMPRESSION_CANDIDATES: PdfCompressionCandidate[] = [
  { label: 'Target 45%', scale: 0.8, jpegQuality: 0.45 },
  { label: 'Target 40%', scale: 0.7, jpegQuality: 0.4 },
  { label: 'Target 35%', scale: 0.6, jpegQuality: 0.35 },
  { label: 'Target 30%', scale: 0.5, jpegQuality: 0.3 },
  { label: 'Target 25%', scale: 0.4, jpegQuality: 0.25 }
]

export class PdfConverter extends BaseConverter {
  protected readonly supportedFormats = ['pdf']
  protected readonly maxFileSize = 100 * 1024 * 1024 // 100MB
  protected readonly maxFiles = 10

  constructor() {
    super()
    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/proxy/unpkg/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs'
  }

  async convert(file: File, options: ConverterOptions): Promise<ConversionResult> {
    try {
      this.validate(file)

      switch (options.format) {
        case 'image':
          return await this.convertToImages(file, options)
        case 'text':
          return await this.convertToText(file)
        case 'html':
          return await this.convertToHtml(file)
        case 'compress':
          return await this.compressPdf(file, options)
        default:
          throw new Error('Nicht unterstütztes Konvertierungsformat')
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Konvertierung fehlgeschlagen'
      }
    }
  }

  private async convertToImages(file: File, options: ConverterOptions): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const zip = new JSZip()
    const pageImages: Blob[] = []
    const imageFormat = options.imageFormat || 'png'

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 2.0 })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not get canvas context')
      
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else throw new Error('Could not create image blob')
        }, `image/${imageFormat}`)
      })

      pageImages.push(blob)
    }

    if (options.useZip) {
      // Add all images to zip
      pageImages.forEach((blob, index) => {
        const fileName = `${file.name.split('.')[0]}_page_${index + 1}.${imageFormat}`
        zip.file(fileName, blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      return {
        blob: zipBlob,
        fileName: 'pdf_images.zip'
      }
    } else {
      // Return first image if not zipping
      return {
        blob: pageImages[0],
        fileName: `${file.name.split('.')[0]}_page_1.${imageFormat}`
      }
    }
  }

  private async convertToText(file: File): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = `=== ${file.name} ===\n\n`
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
      text += `Page ${i}\n${pageText}\n\n`
    }

    const blob = new Blob([text], { type: 'text/plain' })
    return {
      blob,
      fileName: `${file.name.split('.')[0]}.txt`
    }
  }

  private async convertToHtml(file: File): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${file.name}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; }
          .page { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; }
          .page-number { color: #666; font-size: 0.8rem; }
        </style>
      </head>
      <body>
    `
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      
      html += `<div class="page">`
      html += `<div class="page-number">Page ${i}</div>`
      
      const textContent = content.items
        .map((item: any) => {
          const style = item.transform ? `style="position: absolute; left: ${item.transform[4]}px; top: ${item.transform[5]}px;"` : ''
          return `<span ${style}>${item.str}</span>`
        })
        .join('')
      
      html += textContent
      html += `</div>`
    }

    html += `</body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    return {
      blob,
      fileName: `${file.name.split('.')[0]}.html`
    }
  }

  private async compressPdf(file: File, options: ConverterOptions): Promise<ConversionResult> {
    const presetName = this.getCompressionPreset(options.compressionPreset)
    const originalBytes = new Uint8Array(await file.arrayBuffer())
    const originalSize = originalBytes.byteLength
    const sourcePdf = await pdfjsLib.getDocument({ data: new Uint8Array(originalBytes) }).promise
    const selectedPages = this.parsePageSelection(options.pageSelection, sourcePdf.numPages)
    const targetSizeBytes = options.useTargetSize
      ? Math.max(1, Number(options.targetSizeMb) || 1) * 1024 * 1024
      : undefined
    const candidates = this.getCompressionCandidates(presetName, Boolean(options.useTargetSize))
    let bestBlob: Blob | null = null

    for (const candidate of candidates) {
      const candidateBlob = await this.createCompressedPdfCandidate(sourcePdf, originalBytes, selectedPages, candidate)
      let optimizedCandidate = candidateBlob

      if (options.useQpdfOptimization) {
        const { optimizePdfWithQpdf } = await import('./qpdfOptimize')
        const qpdfBlob = await optimizePdfWithQpdf(candidateBlob)
        if (qpdfBlob.size < optimizedCandidate.size) {
          optimizedCandidate = qpdfBlob
        }
      }

      if (!bestBlob || optimizedCandidate.size < bestBlob.size) {
        bestBlob = optimizedCandidate
      }

      if (targetSizeBytes && optimizedCandidate.size <= targetSizeBytes && optimizedCandidate.size < originalSize) {
        return {
          blob: optimizedCandidate,
          fileName: `compressed_${file.name}`
        }
      }
    }

    if (!bestBlob) {
      throw new Error('Compression failed: no PDF output was created.')
    }

    if (options.useQpdfOptimization) {
      const { optimizePdfWithQpdf } = await import('./qpdfOptimize')
      const optimizedCompressedBlob = await optimizePdfWithQpdf(bestBlob)
      if (optimizedCompressedBlob.size < bestBlob.size) {
        bestBlob = optimizedCompressedBlob
      }

      const optimizedOriginalBlob = await optimizePdfWithQpdf(originalBytes)
      if (optimizedOriginalBlob.size < bestBlob.size) {
        bestBlob = optimizedOriginalBlob
      }

      if (targetSizeBytes && bestBlob.size <= targetSizeBytes && bestBlob.size < originalSize) {
        return {
          blob: bestBlob,
          fileName: `compressed_${file.name}`
        }
      }
    }

    if (targetSizeBytes && bestBlob.size > targetSizeBytes) {
      throw new Error(`Target size not reached: smallest result is ${this.formatFileSize(bestBlob.size)}, target is ${this.formatFileSize(targetSizeBytes)}. Try selecting fewer pages or accept stronger quality loss.`)
    }

    if (bestBlob.size >= originalSize) {
      throw new Error(`Compression skipped: this PDF is already smaller than the compressed result (${this.formatFileSize(originalSize)} original vs ${this.formatFileSize(bestBlob.size)} compressed). Try the "Small File" preset for scanned PDFs.`)
    }

    return {
      blob: bestBlob,
      fileName: `compressed_${file.name}`
    }
  }

  private async createCompressedPdfCandidate(
    sourcePdf: any,
    originalBytes: Uint8Array,
    selectedPages: Set<number>,
    candidate: PdfCompressionCandidate
  ) {
    const outputPdf = await PDFDocument.create()
    const originalPdf = selectedPages.size < sourcePdf.numPages
      ? await PDFDocument.load(new Uint8Array(originalBytes))
      : null

    for (let i = 1; i <= sourcePdf.numPages; i++) {
      if (!selectedPages.has(i)) {
        if (!originalPdf) continue
        const [copiedPage] = await outputPdf.copyPages(originalPdf, [i - 1])
        outputPdf.addPage(copiedPage)
        continue
      }

      const page = await sourcePdf.getPage(i)
      const outputViewport = page.getViewport({ scale: 1 })
      const renderViewport = page.getViewport({ scale: candidate.scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not get canvas context')

      canvas.width = Math.ceil(renderViewport.width)
      canvas.height = Math.ceil(renderViewport.height)

      await page.render({
        canvasContext: context,
        viewport: renderViewport
      }).promise

      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else throw new Error('Could not create compressed page image')
        }, 'image/jpeg', candidate.jpegQuality)
      })

      const imageBytes = await imageBlob.arrayBuffer()
      const image = await outputPdf.embedJpg(imageBytes)
      const compressedPage = outputPdf.addPage([outputViewport.width, outputViewport.height])
      compressedPage.drawImage(image, {
        x: 0,
        y: 0,
        width: outputViewport.width,
        height: outputViewport.height
      })
    }

    const bytes = await outputPdf.save({
      useObjectStreams: true,
      addDefaultPage: false
    })
    const blobPart = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    return new Blob([blobPart], { type: 'application/pdf' })
  }

  private getCompressionCandidates(presetName: PdfCompressionPreset, useTargetSize: boolean): PdfCompressionCandidate[] {
    const presetCandidates = PDF_COMPRESSION_FALLBACKS[presetName].map((fallbackPresetName) => ({
      label: PDF_COMPRESSION_PRESETS[fallbackPresetName].label,
      scale: PDF_COMPRESSION_PRESETS[fallbackPresetName].scale,
      jpegQuality: PDF_COMPRESSION_PRESETS[fallbackPresetName].jpegQuality
    }))

    return useTargetSize
      ? [...presetCandidates, ...PDF_TARGET_COMPRESSION_CANDIDATES]
      : presetCandidates
  }

  private parsePageSelection(value: unknown, pageCount: number) {
    const selectedPages = new Set<number>()
    const selection = typeof value === 'string' ? value.trim() : ''

    if (!selection) {
      for (let page = 1; page <= pageCount; page++) selectedPages.add(page)
      return selectedPages
    }

    for (const part of selection.split(',')) {
      const trimmedPart = part.trim()
      if (!trimmedPart) continue

      const [startValue, endValue] = trimmedPart.split('-').map(partValue => Number.parseInt(partValue.trim(), 10))
      const start = Math.max(1, Math.min(pageCount, startValue))
      const end = Math.max(1, Math.min(pageCount, endValue || startValue))

      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error('Invalid page selection. Use formats like "1,3-5".')
      }

      for (let page = Math.min(start, end); page <= Math.max(start, end); page++) {
        selectedPages.add(page)
      }
    }

    if (selectedPages.size === 0) {
      throw new Error('Invalid page selection. Use formats like "1,3-5".')
    }

    return selectedPages
  }

  private getCompressionPreset(value: unknown): PdfCompressionPreset {
    if (value === 'high' || value === 'small') {
      return value
    }

    return 'balanced'
  }
} 