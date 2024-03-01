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
    <v-row justify="center">
        <v-dialog
            v-model="dialog"
            width="1024"
        >
            <template v-slot:activator="{ props }">
                <v-btn
                    color="primary"
                    v-bind="props"
                >
                    Add Mock Url
                </v-btn>
            </template>
                <v-card>
                <v-card-title>
                    <span class="text-h5">Upload File</span>
                    <v-container>
                        <small>Add Below Details to create a Mock Url</small>
                    </v-container>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            >
                                <h3>HTTP Url</h3>
                                <v-text-field
                                    label="Add url"
                                    required
                                    v-model="mockUrl"
                                    hint="The API endpoint that you will call"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            >
                                <v-card-text>
                                    <h3>HTTP method</h3>
                                    <v-select :items="['GET', 'POST', 'PUT']" v-model="mockMethod" persistent density="compact" hint="The API method"></v-select>
                                </v-card-text>
                            </v-col>
                            <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            >
                                <v-card-text>
                                    <h3>HTTP Status Code</h3>
                                    <v-select 
                                    :items="supportedStatusCodes"
                                    v-model="mockStatus" 
                                    density="compact" 
                                    hint="The HTTP Code of the HTTP response you'll receive"
                                    >
                                    </v-select>
                                </v-card-text>
                            </v-col>
                            <v-col cols="12">
                                <v-card-text>
                                    <h3>HTTP response headers</h3>
                                    <v-select 
                                    :items="supportedHeadersItems"
                                    v-model="mockHeaders" 
                                    density="compact" 
                                    hint="The Content-Type header that will be sent with the response"
                                    >
                                    </v-select>
                                </v-card-text>
                            </v-col>
                            <v-col cols="12">
                                <h3>HTTP payload body</h3>
                                <v-textarea 
                                v-model="mockPayload"
                                density="comfortable"
                                rows="10"
                                :placeholder="jsonPayloadPlaceHolder"
                                hint="The payload of the request required if the HTTP method is a POST type"
                                >
                                </v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <h3>HTTP Response body</h3>
                                <v-textarea 
                                v-model="mockResponse"
                                density="comfortable"
                                rows="10"
                                :placeholder="jsonResponsePlaceHolder"
                                hint="The payload of the request required if the HTTP method is a POST type"
                                >
                                </v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="dialog = false"
                        >
                            Close
                        </v-btn>
                        <v-btn
                        color="primary"
                        variant="text"
                        @click="addUrl"
                        >
                            Add Url
                        </v-btn>
                    </v-card-actions>
                </v-card>
        </v-dialog>
    </v-row>
</template>


<script>
import { registerUrlAPI, getAccessTokenAPI, validateAccessTokenAPI, getUserDetailsAPI } from '../API';

export default {
    data() {
        return {
            dialog: false,
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
    computed: {
        jsonPayloadPlaceHolder(){
            return JSON.stringify(this.payloadPlaceHolder, null, 2)
        },
        jsonResponsePlaceHolder(){
            return JSON.stringify(this.responsePlaceHolder, null, 2)
        }
    },
    created(){
        this.getAccessToken();
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
        async addUrl() {
            // transform all data to correct format
            this.accessToken = await this.getAccessToken()
            const data = this.getPayload()
            if (!data.success) {
                this.showNotification = true
                this.success = false
                this.msg = 'Incorrect details passed!'
            }
            // make api call
            const response = await registerUrlAPI(this.user.id, this.accessToken, data.data)
            if (response?.error){
                // this.showNotification = true
                this.success = false
                this.msg = response.errMsg
                // alert(`${this.msg}`)
                this.showNotification = true
            } else {
                this.showNotification = true
                this.success = true
                this.msg = response.message
            }
        },
        getPayload() {
            const data = {
                userid: this.user.id,
                url: String(this.mockUrl),
                method: String(this.mockMethod),
                body: (this.mockPayload === null)? {} : JSON.parse(this.mockPayload),
                response: this.mockResponse === null? {} : JSON.parse(this.mockResponse),
                headers: this.mockHeaders === null? {} : JSON.stringify({"Content-Type": this.mockHeaders}),
                status_code: this.mockStatus === null? 200 : Number(this.mockStatus),
                user_details: {
                    id: this.user.id,
                    username: this.user.username
                }
            }
            if (!this.mockUrl || !this.mockMethod || !this.mockResponse) {
                return {success: false}
            } else {
                return {success: true, data}
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
    },
}

</script>

