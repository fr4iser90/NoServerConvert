<script setup lang="ts">
// No setup needed for now
</script>

<template>
  <div class="app">
    <!-- Custom Bolt.new Badge Configuration -->
    <div class="fixed top-4 right-4 z-50">
      <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" 
         class="block transition-all duration-300 hover:shadow-2xl">
        <img src="https://storage.bolt.army/white_circle_360x360.png" 
             alt="Built with Bolt.new badge" 
             class="w-20 h-20 md:w-28 md:h-28 rounded-full shadow-lg bolt-badge bolt-badge-intro"
             onanimationend="this.classList.add('animated')" />
      </a>
    </div>

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
      <p>NoServerConvert - Convert files directly in your browser</p>
    </footer>
  </div>
</template>

<style lang="scss">
// Custom Bolt.new Badge Configuration
.bolt-badge {
  transition: all 0.3s ease;
}

@keyframes badgeIntro {
  0% { transform: rotateY(-90deg); opacity: 0; }
  100% { transform: rotateY(0deg); opacity: 1; }
}

.bolt-badge-intro {
  animation: badgeIntro 0.8s ease-out 1s both;
}

.bolt-badge-intro.animated {
  animation: none;
}

@keyframes badgeHover {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(22deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.bolt-badge:hover {
  animation: badgeHover 0.6s ease-in-out;
}

// Tailwind-like utilities for the badge
.fixed {
  position: fixed;
}

.top-4 {
  top: 1rem;
}

.right-4 {
  right: 1rem;
}

.z-50 {
  z-index: 50;
}

.block {
  display: block;
}

.transition-all {
  transition-property: all;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .md\:w-28 {
    width: 7rem;
  }
  
  .md\:h-28 {
    height: 7rem;
  }
}

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
  text-align: center;
  font-size: 0.875rem;
  color: #666;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
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