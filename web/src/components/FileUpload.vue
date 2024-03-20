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
                    Upload File
                </v-btn>
            </template>
                <v-card>
                <v-card-title>
                    <span class="text-h5">Upload File</span>
                    <v-container>
                        <small>You can also mock a url and Upload a PDF file or a python/javascript file, </small><br>
                        <small>so that when the mocked API is called you will get the response accordingly.</small>
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
                                    <v-select :items="['GET', 'POST']" v-model="mockMethod" persistent density="compact" hint="The API method"></v-select>
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
                            <v-col cols="4">
                                <v-file-input 
                                label="Upload a File" 
                                v-model="file"
                                accept=".js, .py, .pdf"
                                :rules="[v => !!v || 'You must select a file']"
                                show-size
                                hint="If the file is a executable then add print or log the output to get the API"
                                >
                                </v-file-input>
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
import { uploadFileAPI, getAccessTokenAPI, validateAccessTokenAPI } from '../API';
import { getAccessToken, validateRefreshToken } from '../common/token'

export default {
    data() {
        return {
            dialog: false,
            mockUrl: null,
            mockMethod: "GET",
            msg: "",
            supportedStatusCodes: [ 200, 201, 400, 401, 403, 404, 500, 501],
            mockStatus: 200,
            mockResponse: null,
            showNotification: false,
            supportedHeadersItems: ['application/octet-stream', 'application/pdf', 'application/json'],
            mockHeaders: "application/pdf",
            mockPayload: null,
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
            file: null,
            user: JSON.parse(localStorage.getItem('user')),
            accessToken: null,
            isError: false,
            response: null,
            errorMessage: null,
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
            this.accessToken = await this.fetchAccessToken()
            let currentUser = {id: this.user.id, username: this.user.username};
            const formData = new FormData();
            formData.append('file', this.file[0]);
            formData.append('userid', currentUser.id);
            formData.append('url', this.mockUrl);
            formData.append('method', this.mockMethod);
            formData.append('body', JSON.stringify(this.mockPayload === null ? {} : JSON.parse(this.mockPayload)))
            formData.append('response', JSON.stringify(this.mockResponse === null? {} : JSON.parse(this.mockResponse))); // this is not required
            formData.append('headers', JSON.stringify({"Content-Type": this.mockHeaders}));
            formData.append('status_code', this.mockStatus);
            formData.append('user_details', JSON.stringify(currentUser));
            const response = await uploadFileAPI(this.user.id, this.accessToken, formData);
            if (response?.error){
                // this.showNotification = true
                this.errorMessage = response.errMsg
                this.isError = true;
            } else {
                this.showNotification = true;
                this.success = true;
                this.msg = response.message;
                this.response = response.data;
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
                else if (token == "Unauthorized user") {
                    this.msg = 'Sorry you are not authorized'
                }
                else if (token == "error") {
                    this.msg = 'token expired'
                }
                else {
                    this.error = false
                    this.color = 'success'
                    this.accessToken = token
                    return token
                }
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'token expired'
                console.error('some error occured on fetchAccessToken: ', err);
            }
        },
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },
    created(){
        // this.getAccessToken()
    }
}
</script>