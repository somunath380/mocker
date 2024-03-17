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
                                hint="The response that you will get when you make request to this mock"
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
import { getAccessToken, validateRefreshToken } from '../common/token'
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
            accessToken: null,
            user: JSON.parse(localStorage.getItem('user')),
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
    methods: {
        async addUrl() {
            // transform all data to correct format
            const data = this.getPayload()
            if (!data.success) {
                this.showNotification = true
                this.success = false
                this.msg = 'Incorrect details passed!'
            }
            // make api call
            this.accessToken = await this.fetchAccessToken()
            const response = await registerUrlAPI(this.user.id, this.accessToken, data.data)
            if (response?.error){
                this.success = false
                this.msg = response.errMsg
                this.showNotification = true
            } else {
                this.showNotification = true;
                this.success = true;
                this.msg = response.message;
                this.dialog = false;
                await this.sleep(2000);
                this.$router.go();
            }
        },
        async fetchAccessToken() {
            try {
                let token = await getAccessToken()
                this.error = true
                this.color = 'error'
                if (token == "relogin") {
                    this.msg = 'please re-login to your account'
                }
                if (token == "Unauthorized user") {
                    this.msg = 'Sorry you are not authorized'
                }
                if (token == "error") {
                    this.msg = 'token expired'
                }
                this.error = false
                this.color = 'success'
                return token
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'token expired'
                console.error('some error occured on fetchAccessToken: ', err);
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
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },
}

</script>

