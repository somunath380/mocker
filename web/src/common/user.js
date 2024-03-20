import { createStore } from 'vuex';

export const useUserStore = createStore({
    state() {
        return {
            id: null,
            username: null,
            login: null,
        }
    },
    getters: {
        getUser(state) {
            return {
                id: state.id,
                username: state.username,
                login: state.login
            }
        },
        
    },
    mutations: {
        setUser(state, user) {
            state.id = user.id;
            state.username = user.username;
            state.login = user.login;
        }
    },
    actions: {
        setUserInfo({ commit }, userInfo) {
            commit('setUser', userInfo);
        }
    }
});