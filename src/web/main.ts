import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@web/App.vue'
import Home from '@web/views/Home.vue'
import './style.css'

// Create app instance
const app = createApp(App)

// Setup Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Setup Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/convert/pdf',
      component: () => import('@web/views/converters/PdfConverter.vue')
    },
    {
      path: '/convert/image',
      component: () => import('@web/views/converters/ImageConverter.vue')
    },
    {
      path: '/convert/audio',
      component: () => import('@web/views/converters/AudioConverter.vue')
    },
    {
      path: '/convert/video',
      component: () => import('@web/views/converters/VideoConverter.vue')
    }
  ]
})
app.use(router)

// Setup head management
const head = createHead()
app.use(head)

// Mount app
app.mount('#app')
