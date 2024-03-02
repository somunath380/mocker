<template>
    <h1>{{ 'Login to use Mocker' }}</h1> <br>
    <div class="snackbar">
        <v-snackbar v-model="showNotification" :timeout="2000" color="success" location="top">
            <span>{{this.msg}}</span>
            <template v-slot:actions>
                <v-btn color="white" variant="text" @click="showNotification = false">Close</v-btn>
            </template>
        </v-snackbar>
    </div>
    <form @submit.prevent="logInUser">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" v-model="username" required class="form-control" value="">
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" v-model="password" required class="form-control">
        </div>
        <button type="submit" class="btn btn-success">Login</button>
    </form>
    <div class="signup" v-if="showSignUpButton">
        <h2>Would you like to Sign up?</h2>
        <button type="button" class="btn btn-success" @click="goToSignup">Signup</button>
    </div>
</template>

<script>

import { logInUserAPI, validateAccessTokenAPI, getAccessTokenAPI } from '../API';
// import Signup from './Signup.vue';

    export default {
        data() {
            return {
                username: null,
                password: null,
                msg: '',
                signUpPage: '/signup',
                profilePage: '/profile',
                showNotification: false,
                showSignUpButton: false,
                accessToken: null
            };
        },
        methods: {
            async logInUser() {
                this.accessToken = await this.getAccessToken()
                const response = await logInUserAPI(this.username, this.password, this.accessToken)
                    if (response?.error) {
                    // show error dialog box
                    this.showNotification = true
                    if (response?.status === 405){
                        // if no user is found then show signup page button
                        this.msg = "no user found"
                        this.showSignUpButton = true
                    }
                    else if (response.status === 403){
                        this.msg = "not authorized"
                    }
                    else if (response.status === 400){
                        this.msg = "incorrect username or password"
                    }
                    else if (response.status === 500){
                        this.msg = response.errMsg
                    }
                } else {
                    // go to the dashboard
                    this.showNotification = true
                    this.msg = 'login successful'
                    let user = {
                        id: response.user.id,
                        username: response.user.username,
                        login: true
                    }
                    // set user in local storage
                    localStorage.setItem('user', JSON.stringify(user))
                    // set user in store
                    this.$store.commit('setUser', user)
                    this.goToProfilePage(user.id)
                }
            },
            async getAccessToken() {
                // checks accessToken in the browser local storage
                // if it is found then it makes an API call to check if it is valid or not
                // if response is true then it sets accessToken in the local storage and in the store
                // otherwise it makes an api call with the refresh token to get new access token and set it in the local storage and store
                
                // checks if the 'accessToken' is present in the local storage
                const accessToken = localStorage.getItem('accessToken');
                // if not present
                if (!accessToken){
                    // call the API to get new access token and save in the local storage
                    let newAccessToken = this.getNewAccessToken()
                    return newAccessToken
                } else {
                    // if accessToken is present in the browser local storage
                    // check if the token is valid or not
                    const response = await validateAccessTokenAPI(accessToken);
                    if (response?.error){
                        // if the access token is invalid then get new access token and save in browser
                        this.showNotification = true
                        this.msg = response.errMsg
                        let newAccessToken = this.getNewAccessToken()
                        return newAccessToken
                    } else {
                        return accessToken
                    }
                }
            },
            async getNewAccessToken() {
                // gets new access token and saves it in the browser local storage
                const response = await getAccessTokenAPI()
                    if (response?.error){
                        this.showNotification = true
                        this.success = false
                        this.msg = response.errMsg
                        if (response?.status === 302){
                            // need to redirect to the login page
                            // this.$router.push("/login")
                            this.showNotification = true
                            this.msg = "something wrong occured while getting token"
                        }
                    } else {
                        // set in localstorage
                        localStorage.setItem('accessToken', response.accesstoken) // do not save the token as JSON.stringify because the accesstoken is in str format
                        return response.accesstoken
                    }
            },
            goToSignup() {
                this.$router.push(this.signUpPage)
            },
            goToProfilePage(id) {
                setTimeout(() => {
                    this.$router.push({name: 'Profile', params: { userid: id }});
                }, 1500);
            },
        }
    };

</script>

<style>

</style>