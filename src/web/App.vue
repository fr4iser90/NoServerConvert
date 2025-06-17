<script setup lang="ts">
// No setup needed for now
</script>

<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/" class="nav-logo">
        NoServerConvert
      </router-link>
      <div class="nav-links">
        <router-link to="/convert/pdf">PDF</router-link>
        <router-link to="/convert/image">Image</router-link>
        <router-link to="/convert/audio">Audio</router-link>
        <router-link to="/convert/video">Video</router-link>
      </div>
    </nav>

    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>NoServerConvert - Convert files directly in your browser</p>
        <div class="footer-badges">
          <a 
            href="https://bolthackathonbadge.bolt.army/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="bolt-badge"
            title="Built with Bolt - Hackathon Project"
          >
            <img 
              src="https://bolthackathonbadge.bolt.army/badge.svg" 
              alt="Built with Bolt - Hackathon Badge"
              class="badge-image"
            />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
// Global styles
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: #f8f9fa;
}

// App styles
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  background: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;

  &:hover {
    color: #42b883;
  }
}

.nav-links {
  display: flex;
  gap: 1.5rem;

  a {
    color: #666;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;

    &:hover {
      color: #42b883;
    }

    &.router-link-active {
      color: #42b883;
      font-weight: 500;
    }
  }
}

.main {
  flex: 1;
}

.footer {
  background: #fff;
  padding: 1rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 0.875rem;
  color: #666;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

.footer-badges {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bolt-badge {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.badge-image {
  height: 32px;
  width: auto;
  display: block;
  transition: all 0.3s ease;

  .bolt-badge:hover & {
    filter: brightness(1.1);
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>