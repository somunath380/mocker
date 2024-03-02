<template>
    <div class="snackbar">
        <v-snackbar v-model="showNotification" :timeout="2000" color="success" location="top">
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
    <div class="welcome">
        <h1>Welcome {{ user.username }}</h1>
    </div>
    <div class="buttons">
        <div class="create-url">
            <div class="show-text">
                <h3>Create Your Own Normal JSON mock url</h3>
            </div>
            <div class="top-right">
                <url-upload></url-upload>
            </div>
        </div>
        <div class="create-url">
            <div class="show-text">
                <h3>Upload a PDF file or python/JS script to get mocked response</h3>
            </div>
            <div class="top-right">
                <file-upload></file-upload>
            </div>
        </div>
    </div>
    <div class="whole-page">
        <div class="all-urls" v-if="showUrls">
            <h2>All Mocked Urls by you</h2>
            <table>
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Url</th>
                    <th>File Response</th>
                    <th>Is Executable</th>
                    <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in urls" :key="index" class="one-url" @click="getUrlDetails(item._id)">
                    <td>{{ item._id }}</td>
                    <td>{{ item.method }}</td>
                    <td>{{ item.status_code }}</td>
                    <td>{{ item.url }}</td>
                    <td>{{ item.filepath? "true" : "None" }}</td>
                    <td>{{ item.execute_file? item.execute_file : "false" }}</td>
                    <td>{{ item.createdDate }}</td>
                    </tr>
                </tbody>
                </table>
        </div>
    </div>
    <h2 v-if="noUrls">You Have Not Created Any Mocks Till Now</h2>
</template>

<script>
import { getUserDetailsAPI, getAccessTokenAPI, getAllUrlsAPI, validateRefreshTokenAPI, validateAccessTokenAPI } from '../API';

import FileUpload from './FileUpload.vue';
import RegisterMock from './RegisterMock.vue';

export default {
    components: {
        'file-upload': FileUpload,
        'url-upload': RegisterMock,
    },
    data(){
        return {
            mockUrl: null,
            mockMethod: "GET",
            mockPayload: null,
            mockResponse: null,
            mockHeaders: "application/json",
            mockStatus: 200,
            accessToken: localStorage.getItem('accessToken'),
            user: null,
            success: false,
            msg: '',
            showNotification: false,
            showUrls: false, // change when fetchAllUrls called
            noUrls: false, // change when user has some mocks
            urls: [],
            payloadPlaceHolder: {
                "id": "abc123"
            },
            responsePlaceHolder: {
                "id": "abc123",
                "name": "Somu Nath",
                "age": 27,
                "hasAPet": true,
                "gender": "male",
                "country": "India"
            },
            supportedHeadersItems: ['application/json'],
            supportedStatusCodes: [ 200, 201, 400, 401, 403, 404, 500, 501]
        }
    },
    created() {
        this.getRefreshToken();
        this.fetchUserDetails(); // this will set the user and accessToken
    },
    mounted() {
        this.fetchAllUrls();
    },
    methods: {
        async fetchAllUrls() {
            // check userid and accesstoken
            // PENDING: store all mocked urls in the browser local storage
            if (this.accessToken && this.user) {
                const response = await getAllUrlsAPI(this.user.id, this.accessToken)
                if (response?.error){
                    this.showNotification = true
                    this.success = false
                    this.msg = response.errMsg
                    if (response.error.response.data.message == "jwt expired"){
                        this.getAccessToken()
                        console.log("error occured");
                    }
                } else {
                    if (!response.url.length) {
                        this.noUrls = true
                        this.showUrls = false
                        return
                    }
                    this.showUrls = true
                    this.urls = response.url
                }
            } else {
                this.fetchUserDetails()
                this.getAccessToken()
                console.log("error occured");
            }
        },
        async fetchUserDetails() {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                this.user = JSON.parse(storedUser)
            } else {
                await this.getSetUserDetails()
            }
        },
        async getSetUserDetails() {
            let token = await this.getAccessToken()
            const response = await getUserDetailsAPI(token)
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
        async getUrlDetails(urlId) {
            this.$router.push({name: 'MockDetails', params: { userid: this.user.id, urlid: urlId }});
        },
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
        }
    }
}
</script>

<style scoped>

.create-url{
    display: flex;
    justify-content:space-around;
    align-items:center;
    height: 50px;
    margin-top: 15px;
    margin-bottom: 10px;
}

.one-url {
    transition: box-shadow 0.3s ease;
    margin-bottom: 10px;
    border-radius: 5px;
    &:hover {
        box-shadow: 0 0 10px rgb(0, 0, 0);
        cursor: pointer;
    }
}

.buttons{
    margin-bottom: 8%;
}

table {
    border-collapse: collapse;
    width: 100%;
    }

th, td {
    padding: 8px;
    }

th {
    text-align: center;
    background-color: #ddd;
}

</style>
