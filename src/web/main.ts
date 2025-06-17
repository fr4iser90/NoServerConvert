import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import router from '@web/router'
import App from '@web/App.vue'
import './style.css'

// Create app instance
const app = createApp(App)

// Setup Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Setup Vue Router
app.use(router)

// Setup head management
const head = createHead()
app.use(head)

// Mount app
app.mount('#app')