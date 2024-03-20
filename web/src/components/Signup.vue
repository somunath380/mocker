<template>
    <v-snackbar v-model="error" :color="color" :timeout="timeout" location="top">
        {{ msg }}
        <template v-slot:action="{ close }">
            <v-btn flat color="white" text @click="close">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <v-btn color="green" @click="openDialog">
        Signup 😍
    </v-btn>
    <v-row justify="center">
        <v-dialog v-model="showDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h5">Signup</v-card-title>
                <v-card-text>
                    <v-text-field label="Username" required v-model="username"></v-text-field>
                    <v-text-field label="Email" required v-model="email"></v-text-field>
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
                    <v-btn color="green" text @click="signUpUser">Signup</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import {sleep} from '../common/token'
import { registerUserAPI } from '../API';
import { useUserStore } from '../common/user';
    export default {
        data() {
            return {
                username: null,
                email: null,
                password: null,
                msg: '',
                color: 'error',
                error: false,
                timeout: 2000,
                showDialog: false,
                openLoginDialog: false
            };
        },
        methods: {
            openDialog() {
                this.showDialog = true
            },
            closeDialog() {
                this.showDialog = false
            },
            async signUpUser() {
                try {
                    const response = await registerUserAPI(this.username, this.email, this.password)
                    if (response?.error) {
                    // show error dialog box
                        this.error = true
                        this.color = 'error'
                        if (response.status === 401){
                            this.msg = "user already exists, please login"
                        }
                        else if (response.status === 501 || response.status === 500){
                            this.msg = response.errMsg
                        }
                    } else {
                        // go to the dashboard
                        this.error = true
                        this.color = 'success'
                        this.msg = 'user registered successfully'
                        let user = {
                            id: response.user.id,
                            username: response.user.username,
                            login: response?.login,
                            accesstoken: response.user.accesstoken
                        }
                        localStorage.setItem('user', JSON.stringify(user))
                        // useUserStore.commit('setUser', user)
                        if (!response?.login) {
                            this.msg = 'please login again'
                        }
                    }
                    this.closeDialog()
                } catch (err) {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'some error occured'
                    console.error('some error in registering user: ', err.message)
                }
            }
        }
    };

</script>

<style>

</style>