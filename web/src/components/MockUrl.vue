<template>
    <div class="snackbar">
        <v-snackbar v-model="showNotification" :timeout="2000" :color=color location="top">
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
    <v-card v-if="!url" class="loading-state">
        <v-card-text>
        <div class="text-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <h3 class="mt-3">Loading Mock Details...</h3>
        </div>
        </v-card-text>
    </v-card>
    <div class="show-url" v-if="url">
        <h1>Mocked API</h1>
        <h3>API route: {{ mockUrl }}</h3>
        <h3>method: {{ mockMethod }}</h3>
        <h3>Response Header Type: {{ mockHeader }}</h3>
        <h3>API Response: {{ mockResponse }}</h3>
        <h3>Response HTTP code: {{ mockStatus }}</h3>
        <h3>Response Url Payload: {{ mockPayload }}</h3>
        <h3 v-if="mockFile">File: {{ mockFile }}</h3>
        <h3 v-if="mockExecuteFile">The file will be executed when this api will be called</h3>
        <h4>This was created on {{ url.createdDate }}</h4>
    </div>
    <div class="buttons">
        <div class="delete-url">
            <h3>Delete this Mock</h3>
            <v-btn
                color="red"
                @click="deleteUrl"
                ariant="text">
                Delete
            </v-btn>
        </div>
        <div class="update-url">
            <h3>Update this Url</h3>
            <v-btn
                color="orange"
                ariant="text"
                @click="openUpdateDialog"
                >
                Update
            </v-btn>
        </div>
        <div class="test-url">
            <h3>Test this Api</h3>
            <v-btn
                color="green"
                ariant="text"
                @click="runningTest">
                Test
            </v-btn>
        </div>
    </div>
    <v-dialog v-model="showDialog" width="1024">
        <v-card>
            <v-card-title>
                <span class="text-h5">Update URL</span>
            </v-card-title>
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
                            <v-select :items="supportedMethods" v-model="mockMethod" persistent density="compact" hint="The API method"></v-select>
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
                            v-model="mockHeader" 
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
                        :placeholder="url.payload"
                        hint="The payload of the request required if the HTTP method is a POST type"
                        >
                        </v-textarea>
                    </v-col>
                    <v-col cols="12" v-if="url.filepath == null">
                        <h3>HTTP response</h3>
                        <v-textarea 
                        v-model="mockResponse"
                        density="comfortable"
                        rows="10"
                        :placeholder="url.response"
                        hint="The response that you will get when you make request to this mock"
                        >
                        </v-textarea>
                    </v-col>
                    <v-col v-if="mockFile">
                        <h3>This mock currently executes this below file</h3>
                        <v-textarea v-model="mockFile" v-if="mockFile" :placeholder="mockFile" rows="1"></v-textarea>
                        <v-col cols="2">
                            <v-file-input 
                            label="Upload a new File" 
                            v-model="newfile"
                            accept=".js, .py, .pdf"
                            :rules="[v => !!v || 'You must select a file of type .pdf or .js or .py type']"
                            show-size
                            hint="If the file is a executable then add print or log the output to get the API"
                            >
                            </v-file-input>
                        </v-col>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
                <v-btn color="red" text @click="showDialog = false">
                Close
                </v-btn>
                <v-btn color="green" text @click="updateUrl">
                Update
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showTest" width="1024">
        <v-card>
            <v-card-title>
                <span class="text-h5">Test the mock</span>
            </v-card-title>
            <v-card v-if="!runTest" class="loading-state">
                <v-card-text>
                    <div class="text-center">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                        <h3 class="mt-3">Testing Mock...</h3>
                    </div>
                </v-card-text>
            </v-card>
            <v-col cols="12">
                <v-card v-if="apiResponse" class="api-response">
                    <v-card-text>
                    <pre>{{ apiResponse }}</pre>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-card-actions>
                <v-btn color="red" text @click="showTest = false">
                Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { getUrlAPI, getUserDetailsAPI, deleteUrlAPI, updateUrlAPI, testMockAPI } from '../API';
    import { getAccessToken, validateRefreshToken } from '../common/token'
    export default {
        data(){
            return {
                userId: this.$route.params.userid,
                urlId: this.$route.params.urlid,
                url: null,
                success: false,
                msg: '',
                color: 'error',
                showNotification: false,
                user: null,
                showDialog: false,
                supportedStatusCodes: [ 200, 201, 400, 401, 403, 404, 500, 501],
                supportedHeadersItems: ['application/octet-stream', 'application/pdf', 'application/json'],
                newfile: null,
                displayHeader: "",
                mockUrl: null,
                mockStatus: null,
                mockMethod: null,
                mockHeader: null,
                mockFile: null,
                mockPayload: null,
                mockResponse: null,
                mockExecuteFile: null,
                mockCreatedDate: null,
                supportedMethods: ['GET', 'POST', 'PUT'],
                showTest: false,
                runTest: false,
                apiResponse: null,
                accessToken: null,
            }
        },
        methods: {
            openUpdateDialog() {
                this.showDialog = true
            },
            closeUpdateDialog() {
                this.showDialog = false
            },
            async updateUrl() {
                try {
                    let payload = this.getPayload();
                    let accessToken = await getAccessToken()
                    const response = await updateUrlAPI(this.userId, this.urlId, accessToken, payload);
                    if (response.error){
                        this.success = false
                        this.msg = response.errMsg
                        this.showNotification = true
                    } else {
                        this.showNotification = true;
                        this.success = true;
                        this.msg = response.message;
                        this.dialog = false;
                    }
                    this.closeUpdateDialog()
                } catch (error) {
                    this.showNotification = true
                    this.color = 'error'
                    this.msg = error.message
                    console.error('Error occured at updateUrl: ', error)
                }
            },
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            async deleteUrl() {
                try {
                    let accessToken = await getAccessToken()
                    const response = await deleteUrlAPI(this.userId, this.urlId, accessToken);
                    if (response?.error){
                        this.showNotification = true
                        this.success = false
                        this.msg = response.errMsg
                    } else {
                        this.showNotification = true,
                        this.msg = "Url deleted successfully",
                        this.$router.push(`/profile/${this.userId}`)
                    }
                } catch (error) {
                    this.showNotification = true
                    this.color = 'error'
                    this.msg = error.message
                    console.error('Error occured at deleteUrl: ', error)
                }
            },
            async runningTest(){
                this.showTest = true;
                await this.sleep(2000);
                this.apiResponse = await testMockAPI(this.mockUrl, this.mockMethod, this.mockPayload)
                this.runTest = true
            },
            async checkRefreshToken() {
                try {
                    let istoken = await validateRefreshToken() 
                    if (istoken === 'signup') {
                        // if refreshtoken is not found redirect to root
                        this.showNotification = true
                        this.msg = 'you need to signup'
                        this.color = 'success'
                        this.loginWithoutAccessToken = true
                    } else {
                        await this.fetchAccessToken()
                    }
                } catch (err) {
                    this.error = true
                    this.msg = err.message
                    this.color = 'error'
                    console.error('Error occured at checkRefreshToken: ', err)
                }
            },
            async fetchAccessToken() {
                try {
                    let token = await getAccessToken()
                    this.showNotification = true
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
                    this.showNotification = false
                    this.color = 'success'
                    this.accessToken = token
                    await this.fetchUserDetails()
                } catch (err) {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'token expired'
                    console.error('some error occured on fetchAccessToken: ', err);
                }
            },
            async fetchUserDetails() {
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        this.user = JSON.parse(storedUser)
                    } else {
                        await this.getSetUserDetails()
                    }
                    //here
                    await this.fetchUrl()
                } catch (err) {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'unable to get user details'
                    console.error('some error occured on fetchUserDetails: ', err);
                }
            },
            async getSetUserDetails() {
                try {
                    const response = await getUserDetailsAPI(this.accessToken)
                    if (response?.error){
                        this.error = true
                        this.msg = response.errMsg
                        this.color = 'error'
                    } else {
                        let user = {
                            id: response.user.id,
                            username: response.user.username,
                            login: response.user.login
                        }
                        this.user = user
                        // storing in local storage
                        localStorage.setItem('user', JSON.stringify(user))
                    }
                } catch (err) {
                    this.error = true
                    this.color = 'error'
                    this.msg = 'get user details api failed'
                    console.error('some error occured on getSetUserDetails: ', err);
                }
            },
            async fetchUrl() {
                try {
                    let accessToken = await getAccessToken()
                    const response = await getUrlAPI(this.userId, this.urlId, accessToken)
                    this.url = response.url;
                    await this.displayContents()
                } catch (error) {
                    this.showNotification = true
                    this.color = 'error'
                    this.msg = error.message
                    console.error('Error occured at fetchUrl: ', error)
                }
            },
            async displayContents(){
                this.mockUrl = this.url.url;
                this.mockStatus = this.url.status_code;
                this.mockMethod = this.url.method;
                const headersObject = { ...this.url.headers };
                this.mockHeader = headersObject['Content-Type'];
                this.mockPayload = JSON.stringify(this.url?.body ? this.url.body : {}, null, 2);
                this.mockResponse = JSON.stringify(this.url?.response? this.url.response : {}, null, 2);
                this.mockFile = this.url?.filepath? this.url.filepath : null;
                this.mockExecuteFile = this.url?.execute_file ? this.url.execute_file : false;
                this.mockCreatedDate = this.url.createdDate
            },
            getPayload() {
                console.log();
                const data = {
                    url: String(this.mockUrl),
                    method: String(this.mockMethod),
                    body: JSON.parse(this.mockPayload),
                    response: JSON.parse(this.mockResponse),
                    headers: JSON.stringify({'Content-Type': this.mockHeader}),
                    status_code: this.mockStatus,
                    filepath: this.mockFile ? this.url.filepath : null,
                }
                return data
            },
        },
        created() {
            this.checkRefreshToken();
        },
    }
</script>

<style scoped>

body {
    font-family: sans-serif;
    margin: 40px;
    }

    /* Show-url container */
    .show-url {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 20px;
    }

    .show-url h1 {
    margin-bottom: 15px;
    }

    .show-url > h3 {
    margin-bottom: 5px; /* Adjust spacing between h3 elements */
    }
.buttons{
    display: flex; /* Arrange child elements horizontally */
    align-items: center; /* Vertically align child elements */
    justify-content: space-between; /* Evenly distribute child elements with space on sides */
    padding: 1rem; /* Add padding for spacing around content */
    border-radius: 5px; /* Round the corners */
    background-color: #f5f5f5; /* Set a light gray background */
    margin-bottom: 15px; /* Add a bottom margin for spacing */
    gap: 50px;
    .delete-url,
    .update-url,
    .test-url {
        flex-basis: 33%; /* Ensure equal width for each child div */
        text-align: center; /* Center text within each div */
    }

    h3 {
        margin-bottom: 5px; /* Add a bottom margin to separate from button */
    }
}

.loading-state {
    /* Adjust styles for the loading state card */
    background-color: #ececec;
    padding: 20px;
    border-radius: 5px;
}
.mt-3 {
    /* Margin top for the h3 element */
    margin-top: 20px;
}

.api-response {
    background-color: #000;
    color: #fff;
    padding: 10px;
    overflow-y: auto; /* Enable scrolling for large responses */
    max-height: 400px; /* Adjust max-height as needed */
    }
</style>