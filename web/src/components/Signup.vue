<template>
    <h2>Sign up to use Mocker</h2>
    <form @submit.prevent="signUpUser">
        <Notify :success="this.success" :message="this.msg" v-if="showNotification"/>
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" v-model="username" required class="form-control" value="">
        </div>
        <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" v-model="email" required class="form-control">
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" v-model="password" required class="form-control">
        </div>
        <button type="submit" class="btn btn-success">Register</button>
    </form>
</template>

<script>

import { registerUserAPI } from '../API';
import Notify from '../common/Notify.vue';

    export default {
        components: {
            Notify
        },
        data() {
            return {
                username: null,
                email: null,
                password: null,
                success: false, // this is for sending error message to Notify
                msg: '',
                loginPage: '/login',
                showNotification: false
            };
        },
        methods: {
            async signUpUser() {
                const response = await registerUserAPI(this.username, this.email, this.password)
                    if (response?.error) {
                    // show error dialog box
                        this.showNotification = true
                        this.success = false
                        this.msg = response.errMsg
                } else {
                    // go to the dashboard
                    this.showNotification = true
                    this.success = true
                    this.msg = 'user registered successfully'
                    if (response?.reLogin) {
                        // set in localstorage
                        localStorage.setItem('accessToken', JSON.stringify(response.user.accesstoken))
                        // set in store
                        this.$store.commit('setAccessToken', response.user.accesstoken);
                        this.goToLogin()
                    }
                }
            },
            goToLogin() {
                setTimeout(() => {
                    this.$router.push({
                        name: 'Login',
                        query: { message: 'Please login Again' }
                    });
                }, 1000);
            },
        }
    };

</script>

<style>

</style>