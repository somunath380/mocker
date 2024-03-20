<template lang="">
    <div>
        <v-snackbar v-model="error" :color="color" :timeout="timeout" location="top">
            {{ msg }}
            <template v-slot:action="{ close }">
                <v-btn flat color="white" text @click="close">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
        <h1>Hello And Welcome to Mocker 🥳</h1>
        <p>Where you can mock any API, upload files, execute scripts to get responses 🔥</p>
        <div class="login-or-register">
            <div class="login"><login ref="loginref" :generateRefreshToken="loginWithoutAccessToken"></login></div>
            <div class="signup"><signup></signup></div>
        </div>
    </div>
</template>


<script>

import { getUserDetailsAPI } from '../API';
import { getAccessToken, validateRefreshToken } from '../common/token'
import Login from './Login.vue';
import Signup from './Signup.vue';

export default {
    components: {
        'login': Login,
        'signup': Signup,
    },
    data() {
        return {
            accessToken: null,
            user: null,
            error: false,
            msg: '',
            color: 'error',
            timeout: 2000,
            loginWithoutAccessToken: false,
        }
    },
    created() {
        this.checkRefreshToken();
    },
    methods: {
        async checkRefreshToken() {
            try {
                let token = await validateRefreshToken()
                if (token === 'signup') {
                    // if refreshtoken is not found show login
                    this.loginWithoutAccessToken = true
                    this.error = true
                    this.msg = 'new to mocker? you need to signup'
                    this.color = 'success'
                }
                else {
                    await this.fetchAccessToken()
                }
            } catch (error) {
                // if refreshtoken is invalid/expired show login
                this.loginWithoutAccessToken = true
                this.error = true
                this.msg = error.message || 'Please login'
                this.color = 'error'
            }
        },
        async fetchAccessToken() {
            try {
                let token = await getAccessToken()
                if (token == "relogin") {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'please re-login to your account'
                }
                if (token == "Unauthorized user") {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'Sorry you are not authorized'
                }
                if (token == "error") {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'token expired'
                } else {
                    this.error = false
                    this.color = 'success'
                    this.accessToken = token
                    await this.getSetUserDetails()
                }
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'token expired'
                console.error('some error occured on fetchAccessToken: ', err);
            }
        },
        async getSetUserDetails() {
            try {
                const response = await getUserDetailsAPI(this.accessToken)
                if (response?.error) {
                    this.error = true
                    this.color = 'error'
                    if (response.status === 405) {
                        this.msg = "no user found"
                    } else {
                        this.msg = "some error occured while getting user details"
                        console.error(`Some error occured in getSetUserDetails:`, JSON.parse(response))
                    }
                } else {
                    let user = {
                        id: response.user.id,
                        username: response.user.username,
                        login: response.user.login,
                        accesstoken: response.accesstoken
                    }
                    this.user = user
                    localStorage.setItem('user', JSON.stringify(user))
                    if (!user.login) {
                        this.error = true
                        this.color = 'error'
                        this.msg = 'you need to login'
                    } else {
                        localStorage.setItem('user', JSON.stringify(user))
                        this.error = true
                        this.color = 'success'
                        this.msg = 'login successful'
                        this.goToProfilePage(user.id)
                    }
                }
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'some problem occured'
                console.error('error on getSetUserDetails', err)
            }
        },
        goToProfilePage(id) {
            this.$router.push({ name: 'Profile', params: { userid: id } });
        },
    }
}
</script>

<style>
.login-or-register {
    display: flex; /* Arrange buttons horizontally */
    justify-content: space-evenly; /* Space evenly */
    height: 50px;
    margin-top: 40px;
    padding-top: 30px;
}

</style>