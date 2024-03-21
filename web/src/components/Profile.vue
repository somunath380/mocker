<template>
    <v-snackbar v-model="error" :color="color" :timeout="timeout" location="top">
        {{ msg }}
        <template v-slot:action="{ close }">
            <v-btn flat color="white" text @click="close">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <div v-if="success">
        <div class="welcome">
            <h1>Welcome {{ user.username }} 🤩</h1>
            <logout></logout>
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
        <h2 v-if="noUrls">You Have Not Created Any Mocks Till Now 🥺</h2>
    </div>
</template>

<script>
import { getUserDetailsAPI, getAllUrlsAPI} from '../API';
import FileUpload from './FileUpload.vue';
import RegisterMock from './RegisterMock.vue';
import Logout from './Logout.vue';
import { getAccessToken, validateRefreshToken } from '../common/token'
export default {
    components: {
        'file-upload': FileUpload,
        'url-upload': RegisterMock,
        'logout': Logout,
    },
    data() {
        return {
            mockUrl: null,
            mockMethod: "GET",
            mockPayload: null,
            mockResponse: null,
            mockHeaders: "application/json",
            mockStatus: 200,
            accessToken: null,
            user: null,
            error: false,
            msg: '',
            timeout: 2000,
            color: 'error',
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
            supportedStatusCodes: [ 200, 201, 400, 401, 403, 404, 500, 501],
            all_urls: null,
            success: false
        }
    },
    created() {
        this.checkRefreshToken();
    },
    methods: {
        async checkRefreshToken() {
            try {
                let istoken = await validateRefreshToken() 
                if (istoken === 'signup') {
                    // if refreshtoken is not found redirect to root
                    this.error = true
                    this.msg = 'you need to signup'
                    this.color = 'success'
                    this.goToRoot()
                } else {
                    await this.fetchAccessToken()
                }
            } catch (err) {
                this.error = true
                this.msg = err.message
                this.color = 'error'
                console.error('Error occured at checkRefreshToken: ', err)
                this.goToRoot()
            }
        },
        async fetchAccessToken() {
            try {
                let token = await getAccessToken()
                this.error = true
                this.color = 'error'
                if (token == "relogin") {
                    this.msg = 'please re-login to your account'
                    this.goToRoot()
                }
                if (token == "Unauthorized user") {
                    this.msg = 'Sorry you are not authorized'
                    this.goToRoot()
                }
                if (token == "error") {
                    this.msg = 'token expired'
                    this.goToRoot()
                }
                this.error = false
                this.color = 'success'
                this.accessToken = token
                await this.getSetUserDetails()
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'token expired'
                console.error('some error occured on fetchAccessToken: ', err);
                this.goToRoot()
            }
        },
        async getSetUserDetails() {
            try {
                const response = await getUserDetailsAPI(this.accessToken)
                if (response?.error){
                    this.error = true
                    this.msg = response.errMsg
                    this.color = 'error'
                    this.goToRoot()
                } else {
                    let user = {
                        id: response.user.id,
                        username: response.user.username,
                        login: response.user.login,
                        accesstoken: response.user.accesstoken
                    }
                    this.user = user
                    if (!user.login) {
                        this.error = true
                        this.color = 'error'
                        this.msg = 'you need to login'
                        this.success = false
                        // go to root page
                        await this.goToRoot()
                    } else {
                        this.success = true
                        this.failure = false
                        // storing in local storage
                        localStorage.setItem('user', JSON.stringify(user))
                        await this.fetchAllUrls()
                    }
                }
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'get user details api failed'
                console.error('some error occured on getSetUserDetails: ', err);
                this.goToRoot()
            }
        },
        async fetchAllUrls() {
            try {
                const response = await getAllUrlsAPI(this.user.id, this.accessToken)
                if (response?.error) {
                    this.error = true
                    this.color = 'error'
                    this.msg = response.errMsg
                } else {
                    if (!response.url.length) {
                        this.noUrls = true
                        this.showUrls = false
                    } else {
                        this.showUrls = true;
                        this.urls = response.url;
                    }
                }
            } catch (err) {
                this.error = true
                this.color = 'error'
                this.msg = 'get mocks api failed'
                console.error('some error occured on fetchAllUrls: ', err);
            }
        },
        async getUrlDetails(urlId) {
            this.$router.push({name: 'MockDetails', params: { userid: this.user.id, urlid: urlId }});
        },
        async goToRoot() {
            this.$router.push('/')
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

.welcome {
    display: flex; /* Enable flexbox layout */
    align-items: center; /* Align elements vertically */
    justify-content:space-between;
}

.welcome h1 {
    margin-left: 10px; /* Add space between logout button and text */
}

</style>
