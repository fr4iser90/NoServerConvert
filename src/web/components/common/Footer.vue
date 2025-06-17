<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <img src="/ChatGPTICON.png" alt="NoServerConvert" class="footer-logo-img" />
          <span class="footer-title">NoServerConvert</span>
        </div>
        <p class="footer-description">
          Convert files privately in your browser. No uploads, no tracking, no data collection.
        </p>
      </div>

      <div class="footer-section">
        <h3>Converters</h3>
        <ul class="footer-links">
          <li><router-link to="/convert/pdf">PDF Converter</router-link></li>
          <li><router-link to="/convert/image">Image Converter</router-link></li>
          <li><router-link to="/convert/audio">Audio Converter</router-link></li>
          <li><router-link to="/convert/video">Video Converter</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Privacy</h3>
        <ul class="footer-links">
          <li><a href="#" @click.prevent>Privacy Policy</a></li>
          <li><a href="#" @click.prevent>How it Works</a></li>
          <li><a href="#" @click.prevent>Security</a></li>
          <li><a href="#" @click.prevent>Open Source</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Features</h3>
        <ul class="footer-features">
          <li>🔒 100% Private</li>
          <li>⚡ Lightning Fast</li>
          <li>🌐 Works Offline</li>
          <li>📱 Mobile Friendly</li>
          <li>🆓 Completely Free</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; 2024 NoServerConvert. Built with privacy in mind.</p>
        <div class="footer-badges">
          <span class="badge">No Tracking</span>
          <span class="badge">No Cookies</span>
          <span class="badge">No Data Collection</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No setup needed
</script>

<style lang="scss" scoped>
.footer {
  background: #2c3e50;
  color: #ecf0f1;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 2rem 1rem 1rem;
  }
}

.footer-section {
  h3 {
    color: #42b883;
    margin: 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-logo-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #42b883;
}

.footer-description {
  color: #bdc3c7;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #bdc3c7;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;

    &:hover {
      color: #42b883;
    }
  }
}

.footer-features {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: #bdc3c7;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding: 1.5rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }

  p {
    margin: 0;
    color: #95a5a6;
    font-size: 0.875rem;
  }
}

.footer-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.badge {
  background: #42b883;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>