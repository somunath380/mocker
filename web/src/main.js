import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import { createStore} from 'vuex'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import PrimeVue from 'primevue/config';

const vuetify = createVuetify({
  components,
  directives,
})

const store = createStore({
    state() {
        return {
            accessToken: null,
            user: null,
        }
    },
    mutations: {
        setAccessToken(state, newValue) {
            state.accessToken = newValue;
        },
        setUser(state, newValue) {
            state.user = newValue
        }
    }
})

createApp(App).use(router).use(store).use(vuetify).use(PrimeVue).mount('#app')
