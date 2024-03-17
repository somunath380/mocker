<template>
    <v-snackbar v-model="error" :color="color" :timeout="timeout" location="top">
        {{ msg }}
        <template v-slot:action="{ close }">
            <v-btn flat color="white" text @click="close">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <v-btn color="secondary" @click="openDialog">
        Login 🤘
    </v-btn>
    <v-row justify="center">
        <v-dialog v-model="showDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h5">Login</v-card-title>
                <v-card-text>
                    <v-text-field label="Username" required v-model="username"></v-text-field>
                    <v-text-field 
                    label="Password" 
                    required 
                    v-model="password"
                    :type="'password'"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="green" text @click="logInUser">Login</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>

import { logInUserAPI} from '../API';
import { getAccessToken } from '../common/token'
import Signup from './Signup.vue';
    export default {
        components: {
            'signup': Signup
        },
        props: {
            generateRefreshToken: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                username: null,
                password: null,
                msg: '',
                error: false,
                profilePage: '/profile',
                accessToken: null,
                color: 'error',
                timeout: 2000,
                showDialog: false,
            };
        },
        methods: {
            openDialog() {
                this.showDialog = true
            },
            closeDialog() {
                this.showDialog = false
            },
            async logInUser() {
                try {
                    let accessToken
                    if (this.generateRefreshToken) {
                        // means login user without access token
                        accessToken = null
                    } else {
                        accessToken = await getAccessToken()
                    }
                    const response = await logInUserAPI(this.username, this.password, accessToken)
                    if (response?.error) {
                        // show error dialog box
                        this.error = true
                        this.color = 'error'
                        if (response?.status === 405){
                            this.msg = "Can not find your details..."
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
                        this.error = true
                        this.color = 'success'
                        this.msg = 'login successful'
                        this.closeDialog()
                        let user = {
                            id: response.user.id,
                            username: response.user.username,
                            login: true
                        }
                        // set user in local storage
                        localStorage.setItem('user', JSON.stringify(user))
                        // set accesstoken in local storage
                        localStorage.setItem('accessToken', response.user.accesstoken)
                        this.goToProfilePage(user.id)
                    }
                    this.closeDialog()
                } catch (err) {
                    this.error = true
                    this.color = 'error'
                    this.msg = err.message
                    console.error('error occured at logInUser: ', err)
                }
            },
            goToProfilePage(id) {
                setTimeout(() => {
                    this.$router.push({name: 'Profile', params: { userid: id }});
                }, 1500);
            },
        },
    };

</script>

<style>

</style>