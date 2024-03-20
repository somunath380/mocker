<template>
    <div class="snackbar">
        <v-snackbar v-model="showNotification" :timeout="timeout" :color="color" location="top">
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
    <div class="test-url">
        <v-btn
            color="blue"
            ariant="text"
            @click="Logout">
            Logout 😟
        </v-btn>
    </div>
</template>


<script>
import { logoutAPI, validateAccessTokenAPI } from '../API';
import { getAccessToken } from '../common/token'
export default {
    data() {
        return {
            showLogout: false,
            showNotification: false,
            msg: '',
            color: 'error',
            timeout: 2000,
        }
    },
    methods: {
        async Logout() {
            let token = await getAccessToken()
            let userid = this.getUserId()
            const response = await logoutAPI(token, userid)
            if (response?.error){
                this.showNotification = true
                this.color = 'error'
                this.msg = response.errMsg
            } else {
                this.msg = 'logout successful'
                this.showNotification = true
                this.color = 'success'
                let user = JSON.parse(localStorage.getItem('user'))
                user.login = false
                localStorage.setItem('user', JSON.stringify(user))
                this.$router.push('/');
                setTimeout(() => {
                    this.$router.push('/');
                }, 1000);
            }
        },
        getUserId() {
            const storedUser = localStorage.getItem('user');
            return storedUser.id
        },
    }
}
</script>