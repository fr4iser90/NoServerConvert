<template>
  <div class="how-it-works-page">
    <div class="container">
      <h1>How NoServerConvert Works</h1>
      
      <div class="intro-section">
        <p class="intro-text">
          NoServerConvert uses cutting-edge browser technologies to convert your files 
          completely locally. Here's the technical magic behind our privacy-first approach.
        </p>
      </div>

      <div class="content">
        <section class="section">
          <h2>🏗️ Architecture Overview</h2>
          <div class="architecture-diagram">
            <div class="arch-step">
              <div class="arch-icon">📁</div>
              <h3>Your Files</h3>
              <p>Stay on your device</p>
            </div>
            <div class="arch-arrow">→</div>
            <div class="arch-step">
              <div class="arch-icon">🌐</div>
              <h3>Browser</h3>
              <p>Processes everything locally</p>
            </div>
            <div class="arch-arrow">→</div>
            <div class="arch-step">
              <div class="arch-icon">💾</div>
              <h3>Download</h3>
              <p>Converted files to your device</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>⚙️ Core Technologies</h2>
          <div class="tech-grid">
            <div class="tech-item">
              <div class="tech-icon">🔧</div>
              <h3>WebAssembly (WASM)</h3>
              <p>
                Enables near-native performance for complex file processing operations 
                directly in your browser. Libraries like FFmpeg and PDF.js run at full speed.
              </p>
            </div>
            <div class="tech-item">
              <div class="tech-icon">⚡</div>
              <h3>Web Workers</h3>
              <p>
                Process files in background threads to keep the interface responsive. 
                Multiple files can be converted simultaneously without freezing your browser.
              </p>
            </div>
            <div class="tech-item">
              <div class="tech-icon">🧠</div>
              <h3>Smart Memory Management</h3>
              <p>
                Automatically manages memory usage, processes files in batches, and 
                cleans up resources to prevent browser crashes with large files.
              </p>
            </div>
            <div class="tech-item">
              <div class="tech-icon">📦</div>
              <h3>Modular Converters</h3>
              <p>
                Each file format has its own optimized converter module, loaded only 
                when needed to keep the app fast and lightweight.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🔄 Conversion Process</h2>
          <div class="process-flow">
            <div class="process-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>File Selection</h3>
                <p>You select files using drag & drop or file picker. Files are loaded into browser memory only.</p>
                <div class="step-details">
                  <span class="detail-tag">✓ Format validation</span>
                  <span class="detail-tag">✓ Size checking</span>
                  <span class="detail-tag">✓ Queue management</span>
                </div>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Converter Loading</h3>
                <p>The appropriate converter module is loaded dynamically based on your file type.</p>
                <div class="step-details">
                  <span class="detail-tag">📄 PDF.js for PDFs</span>
                  <span class="detail-tag">🎥 FFmpeg for media</span>
                  <span class="detail-tag">🖼️ Canvas API for images</span>
                </div>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Background Processing</h3>
                <p>Files are processed in Web Workers to keep the interface responsive during conversion.</p>
                <div class="step-details">
                  <span class="detail-tag">⚡ Parallel processing</span>
                  <span class="detail-tag">📊 Progress tracking</span>
                  <span class="detail-tag">🛡️ Error handling</span>
                </div>
              </div>
            </div>

            <div class="process-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Download & Cleanup</h3>
                <p>Converted files are automatically downloaded and all temporary data is cleared from memory.</p>
                <div class="step-details">
                  <span class="detail-tag">📥 Auto-download</span>
                  <span class="detail-tag">📦 Bulk ZIP packaging</span>
                  <span class="detail-tag">🧹 Memory cleanup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🔒 Security & Privacy</h2>
          <div class="security-grid">
            <div class="security-item">
              <h3>🏰 Browser Sandbox</h3>
              <p>All processing happens within your browser's secure sandbox environment, isolated from your system.</p>
            </div>
            <div class="security-item">
              <h3>🚫 No Network Calls</h3>
              <p>After the initial page load, absolutely no data is transmitted over the internet.</p>
            </div>
            <div class="security-item">
              <h3>🧠 Memory Isolation</h3>
              <p>Each conversion runs in its own memory space and is automatically cleaned up afterward.</p>
            </div>
            <div class="security-item">
              <h3>🔍 Open Source</h3>
              <p>Our entire codebase is open source and available for security audits on GitHub.</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>📊 Performance Optimizations</h2>
          <div class="performance-features">
            <div class="perf-item">
              <div class="perf-icon">🚀</div>
              <h3>Smart Queue System</h3>
              <p>Automatically manages large batches of files, processing them in optimal chunks to prevent memory issues.</p>
            </div>
            <div class="perf-item">
              <div class="perf-icon">⚡</div>
              <h3>Lazy Loading</h3>
              <p>Converter modules are loaded only when needed, keeping the initial app size small and fast.</p>
            </div>
            <div class="perf-item">
              <div class="perf-icon">🧮</div>
              <h3>Memory Monitoring</h3>
              <p>Continuously monitors memory usage and automatically adjusts processing to prevent browser crashes.</p>
            </div>
            <div class="perf-item">
              <div class="perf-icon">🔄</div>
              <h3>Worker Pool</h3>
              <p>Reuses Web Workers efficiently to minimize overhead and maximize conversion speed.</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🌐 Browser Compatibility</h2>
          <div class="browser-support">
            <div class="browser-item supported">
              <div class="browser-icon">🌐</div>
              <h3>Chrome/Edge</h3>
              <p>Full support for all features</p>
            </div>
            <div class="browser-item supported">
              <div class="browser-icon">🦊</div>
              <h3>Firefox</h3>
              <p>Full support for all features</p>
            </div>
            <div class="browser-item supported">
              <div class="browser-icon">🧭</div>
              <h3>Safari</h3>
              <p>Full support for all features</p>
            </div>
            <div class="browser-item limited">
              <div class="browser-icon">📱</div>
              <h3>Mobile Browsers</h3>
              <p>Limited by device memory</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>❓ Frequently Asked Questions</h2>
          <div class="faq-list">
            <div class="faq-item">
              <h3>How can you convert files without a server?</h3>
              <p>
                Modern browsers are incredibly powerful! We use WebAssembly to run the same 
                conversion libraries that servers use, but directly in your browser. It's like 
                having a mini-server running locally on your device.
              </p>
            </div>
            <div class="faq-item">
              <h3>Is it really as fast as server-based conversion?</h3>
              <p>
                Often faster! There's no upload/download time, and modern devices are very powerful. 
                Plus, we can process multiple files simultaneously using Web Workers.
              </p>
            </div>
            <div class="faq-item">
              <h3>What happens if I close my browser during conversion?</h3>
              <p>
                The conversion will stop, but no data is lost since everything is local. 
                Simply restart the conversion when you're ready.
              </p>
            </div>
            <div class="faq-item">
              <h3>Can I use this offline?</h3>
              <p>
                Yes! Once the page loads, you can disconnect from the internet and continue 
                converting files. The app works completely offline.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup needed
</script>

<style lang="scss" scoped>
.how-it-works-page {
  min-height: calc(100vh - 140px);
  background: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.intro-section {
  text-align: center;
  margin-bottom: 3rem;
}

.intro-text {
  font-size: 1.2rem;
  color: #4a5568;
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

.content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section {
  margin-bottom: 4rem;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    border-bottom: 3px solid #42b883;
    padding-bottom: 0.5rem;
  }
}

.architecture-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.arch-step {
  text-align: center;
  padding: 1.5rem;
  background: #f0f9f4;
  border-radius: 12px;
  border: 2px solid #42b883;
  min-width: 150px;

  .arch-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }
}

.arch-arrow {
  font-size: 2rem;
  color: #42b883;
  font-weight: bold;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tech-item {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;

  .tech-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
}

.process-flow {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 5px solid #42b883;
}

.step-number {
  background: #42b883;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
}

.step-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-tag {
  background: #e6fffa;
  color: #234e52;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #b2f5ea;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.security-item {
  padding: 1.5rem;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    font-size: 0.9rem;
  }
}

.performance-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.perf-item {
  text-align: center;
  padding: 1.5rem;

  .perf-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    font-size: 0.9rem;
  }
}

.browser-support {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.browser-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid;

  &.supported {
    background: #f0f9f4;
    border-color: #42b883;
  }

  &.limited {
    background: #fff8e1;
    border-color: #ffa726;
  }

  .browser-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b883;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .content {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .architecture-diagram {
    flex-direction: column;
    gap: 1rem;
  }

  .arch-arrow {
    transform: rotate(90deg);
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .process-step {
    flex-direction: column;
    text-align: center;
  }

  .security-grid {
    grid-template-columns: 1fr;
  }

  .performance-features {
    grid-template-columns: 1fr;
  }

  .browser-support {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>