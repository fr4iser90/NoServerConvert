<template>
  <div class="home">
    <h1>NoServerConvert</h1>
    <p class="subtitle">Convert your files without uploading to a server</p>

    <div class="converter-grid">
      <router-link to="/convert/pdf" class="converter-card">
        <div class="icon">📄</div>
        <h2>PDF Converter</h2>
        <p>Convert PDFs to images, text, or HTML</p>
      </router-link>

      <router-link to="/convert/image" class="converter-card">
        <div class="icon">🖼️</div>
        <h2>Image Converter</h2>
        <p>Convert between image formats</p>
      </router-link>

      <router-link to="/convert/audio" class="converter-card">
        <div class="icon">🎵</div>
        <h2>Audio Converter</h2>
        <p>Convert between audio formats</p>
      </router-link>

      <router-link to="/convert/video" class="converter-card">
        <div class="icon">🎥</div>
        <h2>Video Converter</h2>
        <p>Convert between video formats</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup needed for now
</script>

<style lang="scss" scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 3rem;
}

.converter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.converter-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h2 {
    color: #2c3e50;
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 0.875rem;
  }
}
</style> 