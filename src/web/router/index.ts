import { createRouter, createWebHistory } from 'vue-router'
import Home from '@web/views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/convert/pdf',
      name: 'PdfConverter',
      component: () => import('@web/views/converters/PdfConverter.vue')
    },
    {
      path: '/convert/image',
      name: 'ImageConverter',
      component: () => import('@web/views/converters/ImageConverter.vue')
    },
    {
      path: '/convert/audio',
      name: 'AudioConverter',
      component: () => import('@web/views/converters/AudioConverter.vue')
    },
    {
      path: '/convert/video',
      name: 'VideoConverter',
      component: () => import('@web/views/converters/VideoConverter.vue')
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import('@web/views/Privacy.vue')
    },
    {
      path: '/how-it-works',
      name: 'HowItWorks',
      component: () => import('@web/views/HowItWorks.vue')
    },
    {
      path: '/security',
      name: 'Security',
      component: () => import('@web/views/Security.vue')
    }
  ]
})

export default router