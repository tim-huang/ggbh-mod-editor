import 'ant-design-vue/dist/reset.css';

// vue devtools
// if (process.env.NODE_ENV == 'development') {
//   const devtools = await import('@vue/devtools')
//   devtools.connect("localhost", 8098)
// }

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import "./style.css"
import App from './App.vue'
import { routers } from '@/router'
import './samples/node-api'

const pina = createPinia()
const app = createApp(App)

app.use(Antd)
app.use(pina)
app.use(routers)
app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

if (process.env.NODE_ENV === "development") {

  if (!import.meta.env.VITE_DEVTOOLS_PATH) {
    console.warn("To enable vue devtools, please specified VITE_DEVTOOLS_PATH in .env file")
  } else {
    console.info("Vue devtools is enabled, using", import.meta.env.VITE_DEVTOOLS_PATH)
  }
}
