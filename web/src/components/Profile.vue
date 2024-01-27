<template>
    <Notify :success="this.success" :message="this.msg" v-if="showNotification"/>
    <h1>Welcome {{ user.username }}</h1>
    <h2 v-if="noUrls">You Have Not Created Any Mocks Till Now</h2>
    <div class="create-url">
        <form>
            <div className="form-group">
                <label htmlFor="url">mock endpoint</label>
                <input className="form-control" name="url" required id="url" placeholder='enter mock url endpoint' v-model="mockUrl"/>
            </div>
            <div className="form-group">
                <label htmlFor="method">mock method</label>
                <input className="form-control" name="method" id="method" required placeholder='enter mock method' v-model="mockMethod"/>
            </div>
            <div className="form-group">
                <label htmlFor="body">mock payload</label>
                <input value={mockBody} className="form-control" placeholder='enter mock payload in json format' v-model="mockPayload"/>
            </div>
            <div className="form-group">
                <label htmlFor="response">mock response</label>
                <input value={mockResp} className="form-control" required placeholder='enter mock response in json format' v-model="mockResponse"/>
            </div>
            <div className="form-group">
                <label htmlFor="headers">mock headers</label>
                <input value={mockHeader} className="form-control" placeholder='enter mock headers in json format' v-model="mockHeaders"/>
            </div>
            <div className="form-group">
                <label htmlFor="status">mock HTTP status code</label>
                <input value={mockStatus} className="form-control" placeholder='enter mock HTTP status code' v-model="mockStatus"/>
            </div>
            <button type="submit" className="btn btn-primary" @click="addUrl">Add url</button>
        </form>
    </div>
    <div class="urls" v-if="showUrls">
        <h2>All Mocked Urls</h2>
        <ul>
            <li v-for="(item, index) in urls" :key="index">
                <div>
                    {{ 'Mock-' + index }}
                    URL: {{item.url}} <br />
                    METHOD: {{item.method}} <br />
                    HEADERS: {{ item?.headers ? JSON.stringify(item.headers, null, 2) : JSON.stringify({}, null, 2) }} <br />
                    PAYLOAD: {{ item?.body ? JSON.stringify(item.body, null, 2) : JSON.stringify({}, null, 2) }} <br />
                    RESPONSE: {{ JSON.stringify(item.response, null, 2) }} <br />
                    HTTP STATUS: {{ item.status_code }}
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { getUserDetailsAPI, getAccessTokenAPI, getAllUrlsAPI, registerUrlAPI } from '../API';
import Notify from '../common/notify.vue';
export default {
    components: {
        Notify,
    },
    data(){
        return {
            mockUrl: null,
            mockMethod: null,
            mockPayload: null,
            mockResponse: null,
            mockHeaders: null,
            mockStatus: null,
            accessToken: JSON.parse(localStorage.getItem('accessToken')) || this.$store.state.accessToken,
            user: null,
            success: false,
            msg: '',
            showNotification: false,
            showUrls: false, // change when fetchAllUrls called
            noUrls: false, // change when user has some mocks
            urls: []
        }
    },
    created() {
        this.fetchUserDetails(); // this will set the user and accessToken
        this.fetchAllUrls();
    },
    methods: {
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
            this.mockMethod = null,
            this.mockPayload = null,
            this.mockResponse = null,
            this.mockHeaders = null,
            this.mockStatus = null
        },
        async fetchAllUrls() {
            // check userid and accesstoken
            if (this.accessToken && this.user) {
                const response = await getAllUrlsAPI(this.user.id, this.accessToken)
                if (response?.error){
                    this.showNotification = true
                    this.success = false
                    this.msg = response.errMsg
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