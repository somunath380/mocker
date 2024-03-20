import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { useUserStore } from './common/user';

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(useUserStore).use(router).use(vuetify).mount('#app')
