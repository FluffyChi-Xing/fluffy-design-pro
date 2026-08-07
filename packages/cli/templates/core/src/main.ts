import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './locales'
import App from './App.vue'
import router from './router'
import './styles/main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .mount('#app')
