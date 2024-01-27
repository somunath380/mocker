<template lang="">
    <div>
        <div class="root">
            <h1>Hello And Welcome to Mocker</h1>
        </div>
        <Notify :success="this.success" :message="this.msg" v-if="showNotification"/>
        <div class="login-or-register" v-if="showLoginSignup">
            <button type="button" class="btn btn-primary" @click="goToLogin">Login</button>
            <button type="button" class="btn btn-success" @click="goToSignup">Signup</button>
        </div>
    </div>
</template>


<script>
import Notify from '../common/Notify.vue';

import { validateRefreshTokenAPI, getUserDetailsAPI, getAccessTokenAPI } from '../API';
export default {
    components: {
        Notify
    },
    data() {
        return {
            success: false,
            msg: '',
            loginPage: '/login',
            signUpPage: '/signup',
            showNotification: false,
            showLoginSignup: false,
            accessToken: null,
            user: null
        }
    },
    created() {
        this.validateRefreshToken();
    },
    methods: {
        async validateRefreshToken() {
            const response = await validateRefreshTokenAPI()
            if (response?.error){
                // show error dialog box
                this.showNotification = true
                this.success = false
                this.msg = response.errMsg
                // show login and signup button
                this.showLoginSignup = true
            } else {
                // get access token
                this.accessToken = await this.getAccessToken()
                // get user details
                await this.getSetUserDetails()
                this.showNotification = true
                this.success = true
                this.msg = `welcome ${this.user.username}`
                setTimeout(() => {
                    this.goToProfilePage(this.user.id)
                }, 1500);
            }
        },
        async getAccessToken() {
            const response = await getAccessTokenAPI()
            if (response?.error){
                this.showNotification = true
                this.success = false
                this.msg = response.errMsg
            } else {
                // set in localstorage
                localStorage.setItem('accessToken', JSON.stringify(response.accesstoken))
                // set in store
                this.$store.commit('setAccessToken', response.accesstoken);
                return response.accesstoken
            }
        },
        async getSetUserDetails() {
            const response = await getUserDetailsAPI(this.accessToken)
            if (response?.error){
                this.showNotification = true
                this.success = false
                this.msg = response.errMsg
            } else {
                let user = {
                    id: response.user.id,
                    username: response.user.username,
                    login: response.user.login
                }
                this.user = user
                // storing in local storage
                localStorage.setItem('user', JSON.stringify(user))
                // storing in store
                this.$store.commit('setUser', user);
                return response.accesstoken
            }
        },
        goToLogin() {
            this.$router.push(this.loginPage)
        },
        goToSignup() {
            this.$router.push(this.signUpPage)
        },
        goToProfilePage(id) {
            this.$router.push({name: 'Profile', params: { userid: id }});
        }
    }
}
</script>


<style lang="">
    
</style>