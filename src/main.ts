import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
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
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/pdf',
      component: () => import('@/views/converters/PdfConverter.vue')
    },
    {
      path: '/image',
      component: () => import('@/views/converters/ImageConverter.vue')
    },
    {
      path: '/video',
      component: () => import('@/views/converters/VideoConverter.vue')
    },
    {
      path: '/audio',
      component: () => import('@/views/converters/AudioConverter.vue')
    }
  ]
})
app.use(router)

// Setup head management
const head = createHead()
app.use(head)

// Mount app
app.mount('#app')
