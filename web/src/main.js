import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import { createStore} from 'vuex'

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

createApp(App).use(router).use(store).mount('#app')
