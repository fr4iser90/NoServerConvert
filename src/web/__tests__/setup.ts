import { vi } from 'vitest'

// Mock DOMMatrix
class MockDOMMatrix implements DOMMatrix {
  a = 1
  b = 0
  c = 0
  d = 1
  e = 0
  f = 0
  m11 = 1
  m12 = 0
  m13 = 0
  m14 = 0
  m21 = 0
  m22 = 1
  m23 = 0
  m24 = 0
  m31 = 0
  m32 = 0
  m33 = 1
  m34 = 0
  m41 = 0
  m42 = 0
  m43 = 0
  m44 = 1
  is2D = true
  isIdentity = true

  constructor(init?: string | number[]) {
    if (init) {
      // Parse initialization if provided
      if (typeof init === 'string') {
        const values = init.split(',').map(Number)
        if (values.length === 6) {
          this.a = values[0]
          this.b = values[1]
          this.c = values[2]
          this.d = values[3]
          this.e = values[4]
          this.f = values[5]
        }
      } else if (Array.isArray(init)) {
        if (init.length === 6) {
          this.a = init[0]
          this.b = init[1]
          this.c = init[2]
          this.d = init[3]
          this.e = init[4]
          this.f = init[5]
        }
      }
    }
  }

  // Required methods
  multiply(other: DOMMatrix): DOMMatrix {
    return new MockDOMMatrix()
  }
  translate(tx: number, ty: number, tz?: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  scale(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  rotate(rotX: number, rotY?: number, rotZ?: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  rotateFromVector(x: number, y: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  rotateAxisAngle(x: number, y: number, z: number, angle: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  skewX(sx: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  skewY(sy: number): DOMMatrix {
    return new MockDOMMatrix()
  }
  flipX(): DOMMatrix {
    return new MockDOMMatrix()
  }
  flipY(): DOMMatrix {
    return new MockDOMMatrix()
  }
  inverse(): DOMMatrix {
    return new MockDOMMatrix()
  }
  transformPoint(point?: DOMPoint): DOMPoint {
    return new DOMPoint()
  }
  toFloat32Array(): Float32Array {
    return new Float32Array(16)
  }
  toFloat64Array(): Float64Array {
    return new Float64Array(16)
  }
  toString(): string {
    return 'matrix(1, 0, 0, 1, 0, 0)'
  }

  // Additional required methods
  invertSelf(): DOMMatrix {
    return this
  }
  multiplySelf(other: DOMMatrix): DOMMatrix {
    return this
  }
  preMultiplySelf(other: DOMMatrix): DOMMatrix {
    return this
  }
  rotateAxisAngleSelf(x: number, y: number, z: number, angle: number): DOMMatrix {
    return this
  }
  rotateFromVectorSelf(x: number, y: number): DOMMatrix {
    return this
  }
  rotateSelf(rotX: number, rotY?: number, rotZ?: number): DOMMatrix {
    return this
  }
  scale3dSelf(scale: number, originX?: number, originY?: number, originZ?: number): DOMMatrix {
    return this
  }
  scaleSelf(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix {
    return this
  }
  skewXSelf(sx: number): DOMMatrix {
    return this
  }
  skewYSelf(sy: number): DOMMatrix {
    return this
  }
  translateSelf(tx: number, ty: number, tz?: number): DOMMatrix {
    return this
  }
  setMatrixValue(transformList: string): DOMMatrix {
    return this
  }

  // Add missing required methods
  scale3d(scale: number, originX?: number, originY?: number, originZ?: number): DOMMatrix {
    return new MockDOMMatrix()
  }

  scaleNonUniform(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix {
    return new MockDOMMatrix()
  }

  toJSON(): { a: number; b: number; c: number; d: number; e: number; f: number; m11: number; m12: number; m13: number; m14: number; m21: number; m22: number; m23: number; m24: number; m31: number; m32: number; m33: number; m34: number; m41: number; m42: number; m43: number; m44: number; is2D: boolean; isIdentity: boolean } {
    return {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f,
      m11: this.m11,
      m12: this.m12,
      m13: this.m13,
      m14: this.m14,
      m21: this.m21,
      m22: this.m22,
      m23: this.m23,
      m24: this.m24,
      m31: this.m31,
      m32: this.m32,
      m33: this.m33,
      m34: this.m34,
      m41: this.m41,
      m42: this.m42,
      m43: this.m43,
      m44: this.m44,
      is2D: this.is2D,
      isIdentity: this.isIdentity
    }
  }
}

// Mock canvas element
class MockCanvasElement {
  width = 0
  height = 0
  style: CSSStyleDeclaration = {} as CSSStyleDeclaration

  getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null
  getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null
  getContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null
  getContext(contextId: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null
  getContext(contextId: string, options?: any): RenderingContext | null {
    if (contextId === '2d') {
      return new MockCanvasRenderingContext2D(this as unknown as HTMLCanvasElement)
    }
    return null
  }

  toDataURL(): string {
    return 'data:image/png;base64,'
  }

  toBlob(callback: (blob: Blob | null) => void): void {
    callback(new Blob())
  }

  captureStream = vi.fn()
  transferControlToOffscreen = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

// Mock canvas context
class MockCanvasRenderingContext2D implements CanvasRenderingContext2D {
  canvas: HTMLCanvasElement
  fillStyle = '#000000'
  strokeStyle = '#000000'
  lineWidth = 1
  lineCap = 'butt' as CanvasLineCap
  lineJoin = 'miter' as CanvasLineJoin
  miterLimit = 10
  lineDashOffset = 0
  font = '10px sans-serif'
  textAlign = 'start' as CanvasTextAlign
  textBaseline = 'alphabetic' as CanvasTextBaseline
  direction = 'inherit' as CanvasDirection
  globalAlpha = 1
  globalCompositeOperation = 'source-over' as GlobalCompositeOperation
  shadowBlur = 0
  shadowColor = 'rgba(0, 0, 0, 0)'
  shadowOffsetX = 0
  shadowOffsetY = 0
  filter = 'none'
  imageSmoothingEnabled = true
  imageSmoothingQuality = 'low' as ImageSmoothingQuality
  fontKerning = 'auto' as CanvasFontKerning
  fontStretch = 'normal' as CanvasFontStretch
  fontVariantCaps = 'normal' as CanvasFontVariantCaps
  letterSpacing = 'normal'
  textRendering = 'auto' as CanvasTextRendering
  wordSpacing = 'normal'

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  // Required methods
  fillRect = vi.fn()
  clearRect = vi.fn()
  getImageData = vi.fn(() => new ImageData(1, 1))
  putImageData = vi.fn()
  createImageData(width: number, height: number): ImageData
  createImageData(imagedata: ImageData): ImageData
  createImageData(widthOrImagedata: number | ImageData, height?: number): ImageData {
    if (typeof widthOrImagedata === 'number') {
      return new ImageData(widthOrImagedata, height || 1)
    }
    return new ImageData(widthOrImagedata.width, widthOrImagedata.height)
  }
  setTransform = vi.fn()
  getTransform = vi.fn(() => new MockDOMMatrix())
  resetTransform = vi.fn()
  save = vi.fn()
  restore = vi.fn()
  beginPath = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  closePath = vi.fn()
  rect = vi.fn()
  roundRect = vi.fn()
  arc = vi.fn()
  arcTo = vi.fn()
  ellipse = vi.fn()
  quadraticCurveTo = vi.fn()
  bezierCurveTo = vi.fn()
  fill = vi.fn()
  stroke = vi.fn()
  clip = vi.fn()
  isPointInPath = vi.fn(() => false)
  isPointInStroke = vi.fn(() => false)
  fillText = vi.fn()
  strokeText = vi.fn()
  measureText = vi.fn(() => new MockTextMetrics())
  drawImage = vi.fn()
  createPattern = vi.fn(() => null)
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  } as CanvasGradient))
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  } as CanvasGradient))
  createConicGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  } as CanvasGradient))
  translate = vi.fn()
  rotate = vi.fn()
  scale = vi.fn()
  transform = vi.fn()
  drawFocusIfNeeded(path: Path2D, element: Element): void
  drawFocusIfNeeded(element: Element): void
  drawFocusIfNeeded(pathOrElement: Path2D | Element, element?: Element): void {
    // Mock implementation
  }
  scrollPathIntoView = vi.fn()
  addHitRegion = vi.fn()
  removeHitRegion = vi.fn()
  clearHitRegions = vi.fn()

  // Add missing required methods
  getContextAttributes = vi.fn(() => ({
    alpha: true,
    desynchronized: false,
    colorSpace: 'srgb' as PredefinedColorSpace,
    willReadFrequently: false
  }))
  getLineDash = vi.fn(() => [])
  setLineDash = vi.fn()
  strokeRect = vi.fn()
  isContextLost = vi.fn(() => false)
  reset = vi.fn()
}

// Mock document.createElement (consolidated)
const originalCreateElement = document.createElement
document.createElement = function(tagName: string, options?: ElementCreationOptions): HTMLElement {
  if (tagName.toLowerCase() === 'canvas') {
    const mockCanvas = new MockCanvasElement()
    return mockCanvas as unknown as HTMLCanvasElement
  }
  return originalCreateElement.call(document, tagName, options)
}

// Mock DOMMatrix
global.DOMMatrix = MockDOMMatrix as any

// Mock ImageData
class MockImageData implements ImageData {
  readonly colorSpace: PredefinedColorSpace = 'srgb'
  readonly height: number = 1
  readonly width: number = 1
  readonly data: Uint8ClampedArray

  constructor(width: number = 1, height: number = 1) {
    this.width = width
    this.height = height
    this.data = new Uint8ClampedArray(width * height * 4)
  }
}

// Mock TextMetrics
class MockTextMetrics implements TextMetrics {
  readonly actualBoundingBoxAscent: number = 0
  readonly actualBoundingBoxDescent: number = 0
  readonly actualBoundingBoxLeft: number = 0
  readonly actualBoundingBoxRight: number = 0
  readonly fontBoundingBoxAscent: number = 0
  readonly fontBoundingBoxDescent: number = 0
  readonly width: number = 0
  readonly alphabeticBaseline: number = 0
  readonly emHeightAscent: number = 0
  readonly emHeightDescent: number = 0
  readonly hangingBaseline: number = 0
  readonly ideographicBaseline: number = 0
}

// Mock canvas
const mockCanvas = new MockCanvasElement()
const mockContext = new MockCanvasRenderingContext2D(mockCanvas as unknown as HTMLCanvasElement)
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function(contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null {
  if (contextId === '2d') {
    return mockContext
  }
  return null
} as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,')
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => callback(new Blob()))

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

document.body.appendChild = vi.fn()
document.body.removeChild = vi.fn()

// Mock PDF.js worker
vi.mock('pdfjs-dist', async () => {
  const actual = await vi.importActual('pdfjs-dist')
  return {
    ...actual,
    GlobalWorkerOptions: {
      workerSrc: vi.fn()
    },
    getDocument: vi.fn().mockImplementation(() => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockImplementation(() => ({
          getViewport: vi.fn().mockReturnValue({ width: 595, height: 842 }),
          render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
          getTextContent: vi.fn().mockReturnValue(Promise.resolve({ items: [] }))
        }))
      })
    }))
  }
}) 