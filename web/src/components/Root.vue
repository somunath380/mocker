<template lang="">
    <div>
        <div class="snackbar">
            <v-snackbar v-model="showNotification" :timeout="2000" color="success" location="top">
                <span>{{this.msg}}</span>
                <template v-slot:actions>
                    <v-btn
                    color="white"
                    variant="text"
                    @click="showNotification = false"
                    >
                    Close
                    </v-btn>
                </template>
            </v-snackbar>
        </div>
        <div class="root">
            <h1>Hello And Welcome to Mocker</h1>
        </div>
        <div class="login-or-register" v-if="showLoginSignup">
            <button type="button" class="btn btn-primary" @click="goToLogin">Login</button>
            <button type="button" class="btn btn-success" @click="goToSignup">Signup</button>
        </div>
    </div>
</template>


<script>

import { validateRefreshTokenAPI, getUserDetailsAPI, getAccessTokenAPI } from '../API';
export default {
    data() {
        return {
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
                if (response.status === 400 || response.status === 302){
                    //"no cookie set" or "session expired, please re login"
                    this.msg = "Please login again"
                }
                else if (response.status === 401){
                    this.msg = 'wrong user'
                }
                // show login and signup button
                this.showLoginSignup = true
            } else {
                // get access token
                this.accessToken = await this.getAccessToken()
                // get user details
                await this.getSetUserDetails()
                this.showNotification = true
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
                if (response.status === 302){
                    this.msg = "please login again"
                }
                else if (response.status === 401){
                    this.msg = "wrong user"
                }
                else if (response.status === 500){
                    this.msg = response.errMsg
                }
                // show login and signup button
                this.showLoginSignup = true
            } else {
                // set in localstorage
                localStorage.setItem('accessToken', response.accesstoken)
                // set in store
                this.$store.commit('setAccessToken', response.accesstoken);
                return response.accesstoken
            }
        },
        async getSetUserDetails() {
            const response = await getUserDetailsAPI(this.accessToken)
            if (response?.error){
                this.showNotification = true
                if (response.status === 401){
                    this.accessToken = await this.getAccessToken()
                    // refresh the page
                    this.msg = "reloading page"
                    location.reload()
                }
                else if (response.status === 400){
                    this.accessToken = await this.getAccessToken()
                    // refresh the page
                    this.msg = "no user found"
                }
                else if (response.status === 500){
                    this.accessToken = await this.getAccessToken()
                    // refresh the page
                    this.msg = response.errMsg
                }
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