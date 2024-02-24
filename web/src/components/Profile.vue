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
    <h1>Welcome {{ user.username }}</h1>
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
    <div class="create-url">
        <h1>Add below details to create a Mock Url</h1>
        <form>
            <div className="form-group" class="form-container">
                <div class="url-container">
                    <label htmlFor="url">HTTP url</label>
                    <small>The API endpoint that you will call</small>
                    <span class="required">Required</span>
                    <input className="form-control" class="mock-url" name="url" id="url" placeholder='enter/url/endpoint' v-model="mockUrl" type="url"/>
                </div>
            </div>
            <div className="form-group" class="form-container">
                <div class="url-container">
                    <label htmlFor="method">HTTP method</label>
                    <small>The API method</small>
                    <span class="optional">Optional</span>
                    <v-select :items="['GET', 'POST']" v-model="mockMethod" density="compact">
                    </v-select>
                </div>
            </div>
            <div className="form-group" class="form-container">
                <div class="json-container">
                    <label htmlFor="body">HTTP payload</label>
                    <small>The payload of the request required if the HTTP method is a POST type</small>
                    <span class="optional">Optional</span>
                    <v-col cols="14">
                        <v-textarea 
                            v-model="mockPayload"
                            density="comfortable"
                            rows="10"
                            :placeholder="jsonPayloadPlaceHolder"
                        >
                        </v-textarea>
                    </v-col>
                </div>
            </div>
            <div className="form-group" class="form-container">
                <div class="json-container">
                    <label htmlFor="response">HTTP response body</label>
                    <small>The response body that you will get</small>
                    <span class="required">Required</span>
                    <v-col cols="14">
                        <v-textarea 
                            v-model="mockResponse"
                            density="comfortable"
                            rows="10"
                            :placeholder="jsonResponsePlaceHolder"
                        >
                        </v-textarea>
                    </v-col>
                </div>
            </div>
            <div className="form-group" class="form-container">
                <div class="json-container">
                    <label htmlFor="headers">HTTP response headers</label>
                    <small>The Content-Type header that will be sent with the response.</small>
                    <span class="optional">Optional</span>
                    <v-select 
                        :items="supportedHeadersItems" 
                        v-model="mockHeaders" 
                        density="compact" 
                        >
                    </v-select>
                </div>
            </div>
            <div className="form-group" class="form-container">
                <div class="json-container">
                    <label htmlFor="status">mock HTTP status code</label>
                    <small>The HTTP Code of the HTTP response you'll receive.</small>
                    <span class="required">Required</span>
                    <v-select 
                        :items="supportedStatusCodes"
                        v-model="mockStatus" 
                        density="compact" 
                        >
                    </v-select>
                </div>
            </div>
        </form>
        <button type="submit" class="btn btn-primary add-url" @click="addUrl">Add url</button>
    </div>
</template>

<script>
import { getUserDetailsAPI, getAccessTokenAPI, getAllUrlsAPI, registerUrlAPI, validateRefreshTokenAPI, validateAccessTokenAPI } from '../API';

export default {
    components: {

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
            supportedHeadersItems: ['application/json', 'multipart/form-data', 'application/octet-stream', 'application/pdf'],
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
    created() {
        this.getRefreshToken();
        this.fetchUserDetails(); // this will set the user and accessToken
        this.fetchAllUrls();
    },
    methods: {
        itemProps (item){
            return {
                title: item.name,
                subtitle: item.desc
            }
        },
        getPayload() {
            const data = {
                userid: this.user.id,
                url: String(this.mockUrl),
                method: String(this.mockMethod),
                body: (this.mockPayload === null)? {} : JSON.parse(this.mockPayload),
                response: this.mockResponse === null? {} : JSON.parse(this.mockResponse),
                headers: this.mockHeaders === null? {} : JSON.parse(this.mockHeaders),
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
        async addUrl() {
            // transform all data to correct format
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
                alert(`${this.msg}`)
            } else {
                this.showNotification = true
                this.success = true
                this.msg = response.message
                await this.fetchAllUrls()
                this.resetValues()
            }
        },
        resetValues() {
            this.mockUrl = null,
            this.mockMethod = 'GET',
            this.mockPayload = null,
            this.mockResponse = null,
            this.mockHeaders = "application/json",
            this.mockStatus = 200
        },
        async fetchAllUrls() {
            // check userid and accesstoken
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

/* common */

.create-url{
    margin-top: 5%;
    padding-top: 3%;
}
.form-container{
    margin-top: 10px;
    margin-bottom: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
}
.url-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* border-style:solid;
    border-radius: 20px;
    border-width: 0.11px; */
    padding-bottom: 20px;
}
small {
    color: #0e8ae9;
    line-height: 18px;
}
.required {
    font-size: 12px;
    float: right;
    color: red;
    /* text-align: right; */
}
.optional {
    font-size: 12px;
    float: right;
    color: rgb(102, 92, 86);
}
.add-url{
    /* border-style: solid; */
    border-color: black;
    border-width: 2px;
    background-color: #2374ab;
    color: #fff;
}

/* for each */

.json-container{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.mock-url {
    border-style: solid;
    border-color: #adaca9;
    border-radius: 4px;
    width: 500px;
    height: 40px;
    text-align: center;
}

.mock-payload{
    border-style: solid;
    border-color: #adaca9;
    border-radius: 4px;
    width: 400px;
    height: 320px;
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
