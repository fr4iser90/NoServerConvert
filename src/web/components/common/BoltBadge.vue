<template>
  <div class="bolt-badge-container">
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="bolt-badge-link"
    >
      <img 
        src="https://storage.bolt.army/white_circle_360x360.png" 
        alt="Built with Bolt.new badge" 
        class="bolt-badge bolt-badge-intro"
        @animationend="handleAnimationEnd"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
function handleAnimationEnd(event: AnimationEvent) {
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.classList.add('animated')
  }
}
</script>

<style scoped>
.bolt-badge-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}

.bolt-badge-link {
  display: block;
  transition: all 0.3s ease;
}

.bolt-badge-link:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.bolt-badge-container img {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .bolt-badge-container img {
    width: 7rem;
    height: 7rem;
  }
}

@keyframes badgeIntro {
  0% { 
    transform: rotateY(-90deg); 
    opacity: 0; 
  }
  100% { 
    transform: rotateY(0deg); 
    opacity: 1; 
  }
}

.bolt-badge-intro {
  animation: badgeIntro 0.8s ease-out 1s both;
}

.bolt-badge-intro.animated {
  animation: none;
}

@keyframes badgeHover {
  0% { 
    transform: scale(1) rotate(0deg); 
  }
  50% { 
    transform: scale(1.1) rotate(22deg); 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
  }
}

.bolt-badge:hover {
  animation: badgeHover 0.6s ease-in-out;
}
</style>