import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/pivot.css'
import './assets/tailwind.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialiser l'auth avant de monter l'app
const auth = useAuthStore()
auth.init().then(() => {
  app.mount('#app')
})
