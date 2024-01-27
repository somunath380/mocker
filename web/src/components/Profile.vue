<template>
<h1>Welcome {{ user.username }}</h1>
</template>

<script>
import { getUserDetailsAPI, getAccessTokenAPI, getAllUrlsAPI } from '../API';
export default {
    data(){
        return {
            accessToken: this.$store.state.accessToken,
            user: null,
            success: false,
            msg: '',
            showNotification: false,
        }
    },
    created() {
        this.fetchUserDetails();
    },
    methods: {
        async fetchUserDetails() {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                this.user = JSON.parse(storedUser)
            } else {
                await this.getSetUserDetails()
            }
        },
        async getSetUserDetails() {
            await this.getAccessToken()
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

    }
}
</script>

<style scoped>

</style>