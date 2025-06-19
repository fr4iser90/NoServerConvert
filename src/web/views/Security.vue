<template>
  <div class="security-page">
    <div class="container">
      <h1>Security & Trust</h1>
      
      <div class="hero-section">
        <div class="security-badge">
          <div class="badge-icon">🛡️</div>
          <h2>Zero Trust Architecture</h2>
          <p>Your files never leave your device. Ever.</p>
        </div>
      </div>

      <div class="content">
        <section class="section">
          <h2>🔒 Security Principles</h2>
          <div class="principles-grid">
            <div class="principle-item">
              <div class="principle-icon">🏠</div>
              <h3>Local-First</h3>
              <p>All processing happens on your device. No cloud, no servers, no external dependencies.</p>
            </div>
            <div class="principle-item">
              <div class="principle-icon">🚫</div>
              <h3>Zero Data Collection</h3>
              <p>We don't collect, store, or analyze any data. Not even anonymous usage statistics.</p>
            </div>
            <div class="principle-item">
              <div class="principle-icon">🔍</div>
              <h3>Open Source</h3>
              <p>Our entire codebase is open source and available for security audits.</p>
            </div>
            <div class="principle-item">
              <div class="principle-icon">🧠</div>
              <h3>Memory Safe</h3>
              <p>Automatic memory management prevents data leaks and ensures complete cleanup.</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🛡️ Technical Security Measures</h2>
          <div class="security-measures">
            <div class="measure-item">
              <div class="measure-header">
                <div class="measure-icon">🏰</div>
                <h3>Browser Sandboxing</h3>
              </div>
              <p>
                All file processing happens within your browser's secure sandbox environment. 
                This isolates our application from your operating system and other applications, 
                providing multiple layers of security.
              </p>
              <div class="measure-details">
                <span class="detail-badge">✓ Process isolation</span>
                <span class="detail-badge">✓ Memory protection</span>
                <span class="detail-badge">✓ File system isolation</span>
              </div>
            </div>

            <div class="measure-item">
              <div class="measure-header">
                <div class="measure-icon">🌐</div>
                <h3>No Network Communication</h3>
              </div>
              <p>
                After the initial page load, our application makes zero network requests. 
                Your files and data never travel over the internet, eliminating the risk 
                of interception or unauthorized access.
              </p>
              <div class="measure-details">
                <span class="detail-badge">✓ Offline capable</span>
                <span class="detail-badge">✓ No API calls</span>
                <span class="detail-badge">✓ No telemetry</span>
              </div>
            </div>

            <div class="measure-item">
              <div class="measure-header">
                <div class="measure-icon">🧹</div>
                <h3>Automatic Memory Cleanup</h3>
              </div>
              <p>
                All file data is automatically cleared from memory after processing. 
                We implement aggressive cleanup routines to ensure no traces of your 
                files remain in browser memory.
              </p>
              <div class="measure-details">
                <span class="detail-badge">✓ Immediate cleanup</span>
                <span class="detail-badge">✓ Memory monitoring</span>
                <span class="detail-badge">✓ Garbage collection</span>
              </div>
            </div>

            <div class="measure-item">
              <div class="measure-header">
                <div class="measure-icon">🔐</div>
                <h3>Content Security Policy</h3>
              </div>
              <p>
                We implement strict Content Security Policy (CSP) headers that prevent 
                code injection attacks and ensure only authorized scripts can run.
              </p>
              <div class="measure-details">
                <span class="detail-badge">✓ Script restrictions</span>
                <span class="detail-badge">✓ XSS protection</span>
                <span class="detail-badge">✓ Resource validation</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🔍 Security Audit</h2>
          <div class="audit-section">
            <div class="audit-item">
              <h3>📋 What We Audit</h3>
              <ul>
                <li>All source code is publicly available on GitHub</li>
                <li>No hidden network requests or data collection</li>
                <li>Memory usage and cleanup verification</li>
                <li>Third-party library security assessment</li>
                <li>Browser compatibility and security features</li>
              </ul>
            </div>
            <div class="audit-item">
              <h3>🔬 How to Verify</h3>
              <ul>
                <li>Check browser developer tools for network activity</li>
                <li>Monitor memory usage during file processing</li>
                <li>Review our open source code on GitHub</li>
                <li>Test offline functionality after page load</li>
                <li>Verify no persistent data storage</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🚨 Threat Model</h2>
          <div class="threat-analysis">
            <div class="threat-item protected">
              <div class="threat-header">
                <span class="threat-status">✅ Protected</span>
                <h3>Data Interception</h3>
              </div>
              <p>
                <strong>Risk:</strong> Files being intercepted during transmission.<br>
                <strong>Protection:</strong> No transmission occurs - all processing is local.
              </p>
            </div>

            <div class="threat-item protected">
              <div class="threat-header">
                <span class="threat-status">✅ Protected</span>
                <h3>Server Breaches</h3>
              </div>
              <p>
                <strong>Risk:</strong> Server compromise exposing user data.<br>
                <strong>Protection:</strong> No servers involved - everything runs in your browser.
              </p>
            </div>

            <div class="threat-item protected">
              <div class="threat-header">
                <span class="threat-status">✅ Protected</span>
                <h3>Data Mining</h3>
              </div>
              <p>
                <strong>Risk:</strong> Analysis of user files for commercial purposes.<br>
                <strong>Protection:</strong> No data collection or storage of any kind.
              </p>
            </div>

            <div class="threat-item mitigated">
              <div class="threat-header">
                <span class="threat-status">⚠️ Mitigated</span>
                <h3>Browser Vulnerabilities</h3>
              </div>
              <p>
                <strong>Risk:</strong> Browser security flaws affecting our application.<br>
                <strong>Mitigation:</strong> We rely on browser security and recommend keeping browsers updated.
              </p>
            </div>

            <div class="threat-item mitigated">
              <div class="threat-header">
                <span class="threat-status">⚠️ Mitigated</span>
                <h3>Malicious Files</h3>
              </div>
              <p>
                <strong>Risk:</strong> Processing malicious files that exploit converter libraries.<br>
                <strong>Mitigation:</strong> Browser sandboxing and format validation provide protection.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>📜 Compliance & Standards</h2>
          <div class="compliance-grid">
            <div class="compliance-item">
              <div class="compliance-icon">🇪🇺</div>
              <h3>GDPR Compliant</h3>
              <p>
                Since we don't process personal data, we're inherently GDPR compliant. 
                No consent needed because no data is collected.
              </p>
            </div>
            <div class="compliance-item">
              <div class="compliance-icon">🇺🇸</div>
              <h3>CCPA Compliant</h3>
              <p>
                California Consumer Privacy Act compliance through zero data collection. 
                No personal information is processed or stored.
              </p>
            </div>
            <div class="compliance-item">
              <div class="compliance-icon">🇨🇦</div>
              <h3>PIPEDA Compliant</h3>
              <p>
                Personal Information Protection and Electronic Documents Act compliance 
                through our privacy-by-design architecture.
              </p>
            </div>
            <div class="compliance-item">
              <div class="compliance-icon">🌍</div>
              <h3>Global Privacy Laws</h3>
              <p>
                Our zero-data approach ensures compliance with privacy regulations 
                worldwide without requiring legal analysis.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🔧 Security Best Practices</h2>
          <div class="best-practices">
            <div class="practice-category">
              <h3>For Users</h3>
              <ul>
                <li>Keep your browser updated to the latest version</li>
                <li>Use the latest version of our application</li>
                <li>Verify you're on the correct domain before uploading sensitive files</li>
                <li>Check browser developer tools to confirm no network activity</li>
                <li>Clear browser cache if processing highly sensitive documents</li>
              </ul>
            </div>
            <div class="practice-category">
              <h3>For Developers</h3>
              <ul>
                <li>Regular security audits of all dependencies</li>
                <li>Automated testing for memory leaks and cleanup</li>
                <li>Strict Content Security Policy implementation</li>
                <li>Regular updates to converter libraries</li>
                <li>Continuous monitoring of browser security features</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🚨 Report Security Issues</h2>
          <div class="security-contact">
            <div class="contact-info">
              <h3>Found a Security Vulnerability?</h3>
              <p>
                We take security seriously. If you discover a security vulnerability, 
                please report it responsibly:
              </p>
              <div class="contact-methods">
                <a href="https://github.com/fr4iser/NoServerConvert/security" class="contact-btn">
                  🔒 GitHub Security Advisory
                </a>
                <a href="https://github.com/fr4iser/NoServerConvert/issues" class="contact-btn">
                  🐛 Public Issue (for non-sensitive bugs)
                </a>
              </div>
              <p class="contact-note">
                Please do not disclose security vulnerabilities publicly until we've had 
                a chance to address them. We'll work with you to understand and fix the issue.
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
.security-page {
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

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.security-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  .badge-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 2rem;
  }

  p {
    margin: 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }
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

.principles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.principle-item {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .principle-icon {
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

.security-measures {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.measure-item {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 5px solid #42b883;

  .measure-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;

    .measure-icon {
      font-size: 2rem;
    }

    h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.3rem;
    }
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .measure-details {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .detail-badge {
    background: #e6fffa;
    color: #234e52;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #b2f5ea;
  }
}

.audit-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.audit-item {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  ul {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
}

.threat-analysis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.threat-item {
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid;

  &.protected {
    background: #f0f9f4;
    border-color: #42b883;
  }

  &.mitigated {
    background: #fff8e1;
    border-color: #ffa726;
  }

  .threat-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;

    .threat-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.1rem;
    }
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.compliance-item {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .compliance-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    font-size: 0.9rem;
  }
}

.best-practices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.practice-category {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  ul {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
}

.security-contact {
  background: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 12px;
  padding: 2rem;
}

.contact-info {
  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
}

.contact-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.contact-btn {
  background: #42b883;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #3aa876;
  }
}

.contact-note {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
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

  .hero-section {
    .security-badge {
      padding: 2rem 1rem;

      .badge-icon {
        font-size: 3rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      p {
        font-size: 1rem;
      }
    }
  }

  .principles-grid {
    grid-template-columns: 1fr;
  }

  .audit-section {
    grid-template-columns: 1fr;
  }

  .compliance-grid {
    grid-template-columns: 1fr;
  }

  .best-practices {
    grid-template-columns: 1fr;
  }

  .contact-methods {
    flex-direction: column;
  }
}

// 🎯 ENHANCED MOBILE RESPONSIVENESS
@media (max-width: 480px) {
  .security-page {
    padding: 1rem 0;
  }
  
  .container {
    padding: 0 0.75rem;
  }
  
  h1 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  .hero-section {
    margin-bottom: 2rem;
  }
  
  .security-badge {
    padding: 1.5rem 1rem !important;
    border-radius: 12px;
    
    .badge-icon {
      font-size: 2.5rem !important;
      margin-bottom: 0.75rem;
    }
    
    h2 {
      font-size: 1.25rem !important;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.875rem !important;
    }
  }
  
  .content {
    padding: 1rem;
    border-radius: 8px;
  }
  
  .section {
    margin-bottom: 2.5rem;
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }
  
  .principle-item {
    padding: 1.5rem;
    
    .principle-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    
    h3 {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
  
  .measure-item {
    padding: 1.5rem;
    
    .measure-header {
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      
      .measure-icon {
        font-size: 1.75rem;
      }
      
      h3 {
        font-size: 1.125rem;
      }
    }
    
    p {
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }
    
    .detail-badge {
      font-size: 0.75rem;
      padding: 0.1875rem 0.625rem;
    }
  }
  
  .audit-item {
    padding: 1.5rem;
    
    h3 {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }
    
    ul {
      font-size: 0.875rem;
      
      li {
        margin-bottom: 0.375rem;
      }
    }
  }
  
  .threat-item {
    padding: 1.25rem;
    
    .threat-header {
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      
      .threat-status {
        font-size: 0.75rem;
        padding: 0.1875rem 0.625rem;
      }
      
      h3 {
        font-size: 1rem;
      }
    }
    
    p {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
  
  .compliance-item {
    padding: 1.5rem;
    
    .compliance-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    
    h3 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.8125rem;
      line-height: 1.5;
    }
  }
  
  .practice-category {
    padding: 1.5rem;
    
    h3 {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }
    
    ul {
      font-size: 0.875rem;
      
      li {
        margin-bottom: 0.375rem;
      }
    }
  }
  
  .security-contact {
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .contact-info {
    h3 {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  }
  
  .contact-methods {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .contact-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    border-radius: 6px;
    text-align: center;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .contact-note {
    font-size: 0.8125rem;
  }
}

// 🎯 TOUCH DEVICE OPTIMIZATIONS
@media (hover: none) and (pointer: coarse) {
  .principle-item, .measure-item, .audit-item, .threat-item, .compliance-item, .practice-category {
    // Better touch feedback
    transition: transform 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .contact-btn {
    // Better touch feedback
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>