<template>
    <h1>Mocked API</h1>
    <h3>API route: {{ url.url }}</h3>
    <h3>method: {{ url.method }}</h3>
    <h3>Response Headers: {{ url.headers }}</h3>
    <h3>API Response: {{ url.response }}</h3>
    <h3>Response HTTP code: {{ url.status_code }}</h3>
    <h3>Response Url Payload: {{ url.payload }}</h3>
    <h3>File: {{ url.filepath }}</h3>
    <h3 v-if="url.execute_file">The file will be executed when this api will be called</h3>
</template>

<script>
    import { getUrlAPI, getAccessTokenAPI, validateRefreshTokenAPI, validateAccessTokenAPI } from '../API';
    export default {
        components: {

        },
        data(){
            return {
                userId: this.$route.params.userid,
                urlId: this.$route.params.urlid,
                url: null,
                success: false,
                msg: '',
                showNotification: false,
            }
        },
        methods: {
            async getRefreshToken() {
                // this checks for the validity of the refresh token
                // if it is valid then it will store the token in the browser cookies and gets the accessToken
                // else it will redirect to the login page
                const response = await validateRefreshTokenAPI()
                if (response?.error){
                    // show error dialog box
                    this.showNotification = true
                    if (response.status === 400 || response.status === 302){
                        //"no cookie set" or "session expired, please re login"
                        this.msg = "Please login again"
                    }
                    else if (response.status === 401){
                        thishis.msg = 'wrong user'
                    }
                    // show login and signup button
                    this.showLoginSignup = true
                    this.$router.push("/login")
                } else {
                    this.getAccessToken();
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
            async fetchUrl(){
                const accessToken = localStorage.getItem('accessToken')
                const response = await getUrlAPI(this.userId, this.urlId, accessToken)
                if (response.error?.response.data.message == "jwt expired"){
                    this.getNewAccessToken()
                } else {
                    this.url = response.url
                    // modifying response url data
                    if (!response.url.payload){
                        response.url.payload = {}
                    }
                    if (!response.url.headers){
                        response.url.headers = {}
                    }
                    if (!response.url.filepath){
                        response.url.filepath = "No file is saved for this"
                    }
                    if (!response.url.response){
                        response.url.response = {}
                    }
                }
            },
        },
        created() {
            this.getRefreshToken();
            this.fetchUrl();
        }
    }
</script>

<style scoped>

</style>