export enum ErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  MEMORY_ERROR = 'MEMORY_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  WORKER_ERROR = 'WORKER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  details?: string
  file?: string
  timestamp: Date
  recoverable: boolean
  retryable: boolean
  userMessage: string
}

export class ErrorHandler {
  private static errors: AppError[] = []
  private static maxErrors = 50

  static createError(
    type: ErrorType,
    message: string,
    details?: string,
    file?: string
  ): AppError {
    const error: AppError = {
      type,
      message,
      details,
      file,
      timestamp: new Date(),
      recoverable: this.isRecoverable(type),
      retryable: this.isRetryable(type),
      userMessage: this.getUserMessage(type, file)
    }

    this.addError(error)
    return error
  }

  private static addError(error: AppError) {
    this.errors.unshift(error)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
  }

  private static isRecoverable(type: ErrorType): boolean {
    return ![
      ErrorType.BROWSER_NOT_SUPPORTED,
      ErrorType.MEMORY_ERROR
    ].includes(type)
  }

  private static isRetryable(type: ErrorType): boolean {
    return [
      ErrorType.CONVERSION_FAILED,
      ErrorType.NETWORK_ERROR,
      ErrorType.WORKER_ERROR
    ].includes(type)
  }

  private static getUserMessage(type: ErrorType, file?: string): string {
    const fileName = file ? ` (${file})` : ''
    
    switch (type) {
      case ErrorType.FILE_TOO_LARGE:
        return `File is too large${fileName}. Please choose a smaller file or compress it first.`
      
      case ErrorType.INVALID_FORMAT:
        return `Invalid file format${fileName}. Please check that your file is supported.`
      
      case ErrorType.CONVERSION_FAILED:
        return `Conversion failed${fileName}. This might be due to a corrupted file or unsupported features.`
      
      case ErrorType.MEMORY_ERROR:
        return `Not enough memory to process this file${fileName}. Try closing other browser tabs or processing smaller files.`
      
      case ErrorType.NETWORK_ERROR:
        return `Network error occurred. Please check your internet connection and try again.`
      
      case ErrorType.BROWSER_NOT_SUPPORTED:
        return `Your browser doesn't support this feature. Please update to a modern browser.`
      
      case ErrorType.WORKER_ERROR:
        return `Processing error occurred${fileName}. Please try again.`
      
      default:
        return `An unexpected error occurred${fileName}. Please try again or contact support.`
    }
  }

  static getErrors(): AppError[] {
    return [...this.errors]
  }

  static clearErrors() {
    this.errors = []
  }

  static getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(error => error.type === type)
  }

  static handleFileError(file: File, error: unknown): AppError {
    console.error(`Error processing file ${file.name}:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('memory') || error.message.includes('Memory')) {
        return this.createError(ErrorType.MEMORY_ERROR, error.message, undefined, file.name)
      }
      
      if (error.message.includes('format') || error.message.includes('invalid')) {
        return this.createError(ErrorType.INVALID_FORMAT, error.message, undefined, file.name)
      }
      
      if (error.message.includes('size') || error.message.includes('large')) {
        return this.createError(ErrorType.FILE_TOO_LARGE, error.message, undefined, file.name)
      }
      
      return this.createError(ErrorType.CONVERSION_FAILED, error.message, error.stack, file.name)
    }
    
    return this.createError(ErrorType.UNKNOWN_ERROR, 'Unknown error occurred', String(error), file.name)
  }

  static handleWorkerError(error: unknown): AppError {
    console.error('Worker error:', error)
    
    if (error instanceof Error) {
      return this.createError(ErrorType.WORKER_ERROR, error.message, error.stack)
    }
    
    return this.createError(ErrorType.WORKER_ERROR, 'Worker failed', String(error))
  }

  static checkBrowserSupport(): AppError | null {
    const features = {
      webAssembly: typeof WebAssembly !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      fileAPI: typeof File !== 'undefined' && typeof FileReader !== 'undefined',
      canvas: typeof HTMLCanvasElement !== 'undefined'
    }

    const missing = Object.entries(features)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature)

    if (missing.length > 0) {
      return this.createError(
        ErrorType.BROWSER_NOT_SUPPORTED,
        `Missing browser features: ${missing.join(', ')}`,
        'Please update your browser to use this application'
      )
    }

    return null
  }

  static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
      
      console.log(`Memory usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB`)
      
      if (usedMB / limitMB > 0.9) {
        this.createError(
          ErrorType.MEMORY_ERROR,
          'High memory usage detected',
          `Using ${usedMB.toFixed(1)}MB of ${limitMB.toFixed(1)}MB available`
        )
      }
    }
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  ErrorHandler.createError(
    ErrorType.UNKNOWN_ERROR,
    event.message,
    `${event.filename}:${event.lineno}:${event.colno}`
  )
})

window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.createError(
    ErrorType.UNKNOWN_ERROR,
    'Unhandled promise rejection',
    String(event.reason)
  )
})