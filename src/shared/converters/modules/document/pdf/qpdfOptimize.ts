const QPDF_TIMEOUT_MS = 60000

export async function optimizePdfWithQpdf(input: Blob | Uint8Array | ArrayBuffer) {
  const [{ createQpdfRunner }, workerUrl, qpdfJsUrl, wasmUrl] = await Promise.all([
    import('qpdf-run'),
    import('qpdf-run/worker?url'),
    import('qpdf-run/qpdf.js?url'),
    import('qpdf-run/qpdf.wasm?url')
  ])

  const qpdf = await createQpdfRunner({
    workerUrl: workerUrl.default,
    qpdfJsUrl: qpdfJsUrl.default,
    wasmUrl: wasmUrl.default,
    timeoutMs: QPDF_TIMEOUT_MS
  })

  try {
    const inputBytes = await copyToUint8Array(input)
    const outputBytes = await qpdf.runOne({
      input: inputBytes,
      inputName: 'input.pdf',
      outputName: 'optimized.pdf',
      args: [
        '--linearize',
        '--object-streams=generate',
        '--compress-streams=y',
        '--',
        'input.pdf',
        'optimized.pdf'
      ]
    })
    const outputCopy = new Uint8Array(outputBytes)

    return new Blob([outputCopy], { type: 'application/pdf' })
  } finally {
    await qpdf.destroy()
  }
}

async function copyToUint8Array(input: Blob | Uint8Array | ArrayBuffer) {
  if (input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer())
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input.slice(0))
  }

  return new Uint8Array(input)
}
