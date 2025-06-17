<script setup lang="ts">
import BoltBadge from '@web/components/common/BoltBadge.vue'
import Footer from '@web/components/common/Footer.vue'
</script>

<template>
  <div class="app">
    <!-- Bolt Badge Component -->
    <BoltBadge />

    <nav class="nav">
      <router-link to="/" class="nav-logo">
        <img src="/ChatGPTICON.png" alt="NoServerConvert" class="nav-logo-img" />
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

    <Footer />
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
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #42b883;
  }
}

.nav-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }

  a {
    color: #666;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      color: #42b883;
      background: #f0f9f4;
    }

    &.router-link-active {
      color: #42b883;
      background: #e8f5e9;
      font-weight: 600;
    }
  }
}

.main {
  flex: 1;
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

// Responsive navigation
@media (max-width: 768px) {
  .nav {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav-logo {
    font-size: 1.1rem;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
    
    a {
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
    }
  }
}
</style>