<template>
  <div class="home">
    <header class="header">
      <h1>NoServerConvert</h1>
      <p class="subtitle">Convert files directly in your browser - no server needed</p>
    </header>

    <main class="main">
      <div class="converter-grid">
        <router-link to="/pdf" class="converter-card">
          <h2>PDF Converter</h2>
          <p>Convert PDFs to images, text, and more</p>
        </router-link>

        <router-link to="/image" class="converter-card">
          <h2>Image Converter</h2>
          <p>Convert between image formats and edit images</p>
        </router-link>

        <router-link to="/video" class="converter-card">
          <h2>Video Converter</h2>
          <p>Convert video formats and extract frames</p>
        </router-link>

        <router-link to="/audio" class="converter-card">
          <h2>Audio Converter</h2>
          <p>Convert audio formats and edit audio files</p>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Component logic will be added here
</script>

<style lang="scss" scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #666;
  }
}

.converter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.converter-card {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0;
  }
}
</style> 