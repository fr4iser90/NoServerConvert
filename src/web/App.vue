<script setup lang="ts">
// Component logic will be added here
</script>

<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/" class="nav-logo">NoServerConvert</router-link>
      <div class="nav-links">
        <router-link to="/pdf">PDF</router-link>
        <router-link to="/image">Image</router-link>
        <router-link to="/video">Video</router-link>
        <router-link to="/audio">Audio</router-link>
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
// Reset and base styles
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
  background: #f5f7fa;
}

// App layout
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Navigation
.nav {
  background: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    a {
      color: #666;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #2c3e50;
      }

      &.router-link-active {
        color: #42b883;
      }
    }
  }
}

// Main content
.main {
  flex: 1;
  padding: 2rem 0;
}

// Footer
.footer {
  background: #fff;
  padding: 1.5rem;
  text-align: center;
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
