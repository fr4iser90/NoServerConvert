<template>
  <div class="privacy-page">
    <div class="container">
      <h1>Privacy Policy</h1>
      
      <div class="privacy-content">
        <section class="privacy-section">
          <h2>🔒 Our Privacy Philosophy</h2>
          <p>
            NoServerConvert was built with one core principle: <strong>Your data stays with you. Always.</strong>
          </p>
          <p>
            We believe privacy is a fundamental right, not a luxury. That's why we designed our entire system 
            to process files locally in your browser without any server communication.
          </p>
        </section>

        <section class="privacy-section">
          <h2>📋 What We Do</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🖥️</div>
              <h3>Local Processing</h3>
              <p>All file conversions happen directly in your browser using WebAssembly and Web Workers.</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🚫</div>
              <h3>No Data Collection</h3>
              <p>We don't collect, store, or analyze any personal data, usage statistics, or file metadata.</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🌐</div>
              <h3>Works Offline</h3>
              <p>Once loaded, the app works completely offline. No internet connection required for conversions.</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔐</div>
              <h3>No Tracking</h3>
              <p>No cookies, no analytics, no fingerprinting, no third-party trackers of any kind.</p>
            </div>
          </div>
        </section>

        <section class="privacy-section">
          <h2>❌ What We DON'T Do</h2>
          <div class="dont-list">
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Upload your files to any server</span>
            </div>
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Store any personal information</span>
            </div>
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Track your browsing behavior</span>
            </div>
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Use cookies or local storage for tracking</span>
            </div>
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Share data with third parties</span>
            </div>
            <div class="dont-item">
              <span class="dont-icon">🚫</span>
              <span>Require account registration</span>
            </div>
          </div>
        </section>

        <section class="privacy-section">
          <h2>🔧 How It Works</h2>
          <div class="how-it-works">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>You Select Files</h3>
                <p>Files are loaded into your browser's memory only</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Browser Processes</h3>
                <p>Conversion happens using WebAssembly libraries in your browser</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>You Download Results</h3>
                <p>Converted files are saved directly to your device</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Memory Cleared</h3>
                <p>All temporary data is automatically cleared from browser memory</p>
              </div>
            </div>
          </div>
        </section>

        <section class="privacy-section">
          <h2>🛡️ Technical Security</h2>
          <div class="security-features">
            <div class="security-item">
              <h3>Browser Sandboxing</h3>
              <p>All processing happens within your browser's secure sandbox environment.</p>
            </div>
            <div class="security-item">
              <h3>No Network Communication</h3>
              <p>After the initial page load, no data is sent over the internet.</p>
            </div>
            <div class="security-item">
              <h3>Memory Management</h3>
              <p>Files are automatically cleared from memory after processing.</p>
            </div>
            <div class="security-item">
              <h3>Open Source</h3>
              <p>Our code is open source and available for security audits on GitHub.</p>
            </div>
          </div>
        </section>

        <section class="privacy-section">
          <h2>📱 Browser Storage</h2>
          <p>
            The only data we store locally in your browser are your conversion preferences 
            (like quality settings and format choices) to improve your user experience. 
            This data:
          </p>
          <ul>
            <li>Never leaves your device</li>
            <li>Can be cleared anytime through your browser settings</li>
            <li>Contains no personal information</li>
            <li>Is not shared with anyone</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>🌍 International Privacy</h2>
          <p>
            Since we don't collect any data, we automatically comply with privacy regulations worldwide, including:
          </p>
          <div class="compliance-badges">
            <span class="compliance-badge">GDPR Compliant</span>
            <span class="compliance-badge">CCPA Compliant</span>
            <span class="compliance-badge">PIPEDA Compliant</span>
          </div>
        </section>

        <section class="privacy-section">
          <h2>📞 Contact</h2>
          <p>
            If you have any questions about our privacy practices, please contact us through our 
            <a href="https://github.com/fr4iser/NoServerConvert" target="_blank" rel="noopener">GitHub repository</a>.
          </p>
        </section>

        <div class="last-updated">
          <p><strong>Last updated:</strong> January 2025</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup needed
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: calc(100vh - 140px);
  background: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.privacy-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.privacy-section {
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    border-bottom: 2px solid #42b883;
    padding-bottom: 0.5rem;
  }

  p {
    line-height: 1.7;
    color: #4a5568;
    margin-bottom: 1rem;
  }

  ul {
    color: #4a5568;
    line-height: 1.7;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.dont-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.dont-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #fff5f5;
  border-radius: 6px;
  border-left: 4px solid #e53e3e;

  .dont-icon {
    font-size: 1.25rem;
  }
}

.how-it-works {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f0f9f4;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.step-number {
  background: #42b883;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  h3 {
    color: #2c3e50;
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: #4a5568;
  }
}

.security-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.security-item {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.compliance-badges {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.compliance-badge {
  background: #42b883;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.last-updated {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

a {
  color: #42b883;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .privacy-content {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .security-features {
    grid-template-columns: 1fr;
  }

  .compliance-badges {
    justify-content: center;
  }
}
</style>
</template>

<script setup lang="ts">
// No setup needed
</script>