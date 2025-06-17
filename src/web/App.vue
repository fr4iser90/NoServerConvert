<script setup lang="ts">
// No setup needed for now
</script>

<template>
  <div class="app">
    <!-- Custom Bolt.new Badge Configuration (Pure CSS) -->
    <style>
      .bolt-badge-container {
        position: fixed; top: 1rem; right: 1rem; z-index: 50;
      }
      
      .bolt-badge-link {
        display: block; transition: all 0.3s ease;
      }
      
      .bolt-badge-link:hover {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      
      .bolt-badge-container img {
        width: 5rem; height: 5rem; border-radius: 50%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }

      @media (min-width: 768px) {
        .bolt-badge-container img {
          width: 7rem;
          height: 7rem;
        }
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
    </style>
    <div class="bolt-badge-container">
      <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" 
         class="bolt-badge-link">
        <img src="https://storage.bolt.army/white_circle_360x360.png" 
             alt="Built with Bolt.new badge" 
             class="bolt-badge bolt-badge-intro"
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