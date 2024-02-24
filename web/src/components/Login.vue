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

import { logInUserAPI } from '../API';
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
                this.accessToken = this.$store.state.accessToken || JSON.parse(localStorage.getItem('accessToken'))
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