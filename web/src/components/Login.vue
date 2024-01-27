<template>
    <h2>{{ message? $route.query.message : this.message }}</h2>
    <Notify :success="this.success" :message="this.msg" v-if="showNotification"/>
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
import Notify from '../common/Notify.vue';
// import Signup from './Signup.vue';

    export default {
        components: {
            Notify,
        },
        data() {
            return {
                username: null,
                password: null,
                success: false, // this is for sending error message to Notify
                message: 'Login to use Mocker',
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
                    this.success = false
                    this.msg = response.errMsg
                    if (response?.status === 401){
                        // if no user is found then show signup page button
                        this.showSignUpButton = true
                    }
                } else {
                    // go to the dashboard
                    this.showNotification = true
                    this.success = true
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