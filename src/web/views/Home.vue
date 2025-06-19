<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <div class="logo-container">
          <img src="/ChatGPTICON.png" alt="NoServerConvert Logo" class="main-logo" />
        </div>
        <h1>NoServerConvert</h1>
        <p class="subtitle">Convert your files without uploading to a server</p>
        <p class="description">
          🔒 <strong>100% Private</strong> - All processing happens in your browser<br>
          ⚡ <strong>Fast & Secure</strong> - No file uploads, no data collection<br>
          🌐 <strong>Works Offline</strong> - No internet required after loading
        </p>
      </div>
    </div>

    <div class="features-section">
      <h2>Choose Your Converter</h2>
      <div class="converter-grid">
        <router-link to="/convert/pdf" class="converter-card">
          <div class="icon">📄</div>
          <h3>PDF Converter</h3>
          <p>Convert PDFs to images, text, or HTML</p>
          <div class="features">
            <span class="feature">✓ PDF to PNG/JPG</span>
            <span class="feature">✓ Extract Text</span>
            <span class="feature">✓ Batch Processing</span>
          </div>
        </router-link>

        <router-link to="/convert/image" class="converter-card">
          <div class="icon">🖼️</div>
          <h3>Image Converter</h3>
          <p>Convert between image formats</p>
          <div class="features">
            <span class="feature">✓ JPG/PNG/WebP</span>
            <span class="feature">✓ Quality Control</span>
            <span class="feature">✓ Batch Processing</span>
          </div>
        </router-link>

        <router-link to="/convert/audio" class="converter-card">
          <div class="icon">🎵</div>
          <h3>Audio Converter</h3>
          <p>Convert between audio formats</p>
          <div class="features">
            <span class="feature">✓ MP3/WAV/OGG</span>
            <span class="feature">✓ Quality Settings</span>
            <span class="feature">✓ Audio Compression</span>
          </div>
        </router-link>

        <router-link to="/convert/video" class="converter-card">
          <div class="icon">🎥</div>
          <h3>Video Converter</h3>
          <p>Convert between video formats</p>
          <div class="features">
            <span class="feature">✓ MP4/WebM</span>
            <span class="feature">✓ Extract Audio</span>
            <span class="feature">✓ Video Compression</span>
          </div>
        </router-link>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">100%</div>
          <div class="stat-label">Private</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">Data Collection</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">∞</div>
          <div class="stat-label">File Limit</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">4</div>
          <div class="stat-label">Converters</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-cards">
        <div class="info-card">
          <div class="info-icon">🔒</div>
          <h3>Privacy First</h3>
          <p>Your files never leave your device. All processing happens locally in your browser using WebAssembly and Web Workers.</p>
        </div>
        <div class="info-card">
          <div class="info-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>No upload/download delays. Convert files instantly with our optimized processing engine and smart queue system.</p>
        </div>
        <div class="info-card">
          <div class="info-icon">🌐</div>
          <h3>Works Offline</h3>
          <p>Once loaded, the app works completely offline. Perfect for sensitive documents or when you have limited internet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup needed for now
</script>

<style lang="scss" scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.logo-container {
  margin-bottom: 2rem;
}

.main-logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05) rotate(5deg);
  }
}

h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.subtitle {
  font-size: 1.5rem;
  margin: 0 0 2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto;
}

.features-section {
  padding: 0 2rem 4rem;
  text-align: center;

  h2 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 3rem;
    font-weight: 600;
  }
}

.converter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.converter-card {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #42b883, #3aa876);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

    &::before {
      transform: scaleX(1);
    }
  }

  .icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    display: block;
  }

  h3 {
    color: #2c3e50;
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    color: #666;
    margin: 0 0 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
  }
}

.features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  font-size: 0.875rem;
  color: #42b883;
  font-weight: 500;
  text-align: left;
}

.stats-section {
  background: #f8f9fa;
  padding: 3rem 2rem;
  margin-bottom: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.info-section {
  padding: 0 2rem 4rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.info-card {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.info-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.info-card h3 {
  color: #2c3e50;
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-card p {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;
  }

  .features-section {
    padding: 0 1rem 3rem;
  }

  .converter-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
  }

  .stats-section {
    padding: 2rem 1rem;
  }

  .info-section {
    padding: 0 1rem 3rem;
  }

  .info-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

// 🎯 ENHANCED MOBILE RESPONSIVENESS
@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0.75rem;
    
    .main-logo {
      width: 100px;
      height: 100px;
    }
  }
  
  h1 {
    font-size: 2rem !important;
    margin-bottom: 0.75rem;
  }
  
  .subtitle {
    font-size: 1.125rem !important;
    margin-bottom: 1.5rem;
  }
  
  .description {
    font-size: 1rem;
    padding: 0 0.5rem;
  }
  
  .features-section {
    padding: 0 0.75rem 2rem;
    
    h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  }
  
  .converter-grid {
    gap: 1rem;
    padding: 0;
  }
  
  .converter-card {
    padding: 2rem 1.5rem;
    
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 1.25rem;
    }
    
    p {
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  }
  
  .stats-section {
    padding: 1.5rem 0.75rem;
    margin-bottom: 2rem;
  }
  
  .stats-grid {
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .info-section {
    padding: 0 0.75rem 2rem;
  }
  
  .info-cards {
    gap: 1rem;
  }
  
  .info-card {
    padding: 2rem 1.5rem;
    
    .info-icon {
      font-size: 2.5rem;
    }
    
    h3 {
      font-size: 1.125rem;
    }
    
    p {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
}

// 🎯 TOUCH DEVICE OPTIMIZATIONS
@media (hover: none) and (pointer: coarse) {
  .converter-card {
    // Better touch feedback
    &:active {
      transform: translateY(-4px) scale(0.98);
    }
  }
  
  .main-logo {
    // Disable hover effects on touch devices
    &:hover {
      transform: none;
    }
  }
}
</style>