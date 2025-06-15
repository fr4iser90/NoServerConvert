export interface ConverterOptions {
  format?: string;
  quality?: number;
  [key: string]: any;
}

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  error?: string;
}

export abstract class BaseConverter {
  protected abstract readonly supportedFormats: string[];
  protected abstract readonly maxFileSize: number;
  protected abstract readonly maxFiles: number;

  abstract convert(file: File, options: ConverterOptions): Promise<ConversionResult>;
  
  validate(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`Datei zu groß. Maximale Größe: ${this.formatFileSize(this.maxFileSize)}`);
    }

    // Check file type
    const fileType = file.type.split('/')[1];
    if (!this.supportedFormats.includes(fileType)) {
      throw new Error(`Nicht unterstütztes Format. Erlaubte Formate: ${this.supportedFormats.join(', ')}`);
    }

    return true;
  }

  getSupportedFormats(): string[] {
    return this.supportedFormats;
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  getMaxFiles(): number {
    return this.maxFiles;
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected async downloadFile(blob: Blob, fileName: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
} 