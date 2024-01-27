import axios from 'axios'

const domain = 'http://127.0.0.1'
const port = 3000
const path = '/api/v1'

const baseUrl = domain + `:${port}` + path

export const validateRefreshTokenAPI = async () => {
    // checks refresh token validity

    // 200 response 
    //      {success: true, 
    //      message: "valid token", 
    //      user: {
    //     id: user._id,
    //     username: user.username,
    //     logIn: user.logIn
    // }}
    // 302 responses
        // success: false,
        // reLogin: true,
        // error: "user session expired"

        // success: false,
        // reLogin: true,
        // error: "provide cookie in request"
    // 401 response
    //     success: false,
    //     message: "error",
    //     error: error.message
    try {
        const endpoint = baseUrl + '/auth/validate/token'
        const response = await axios.get(endpoint, {withCredentials: true})
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }    
}

export const logInUserAPI = async (username, password, accesstoken=null) => {
    // logs in user and sets refresh token
    // 401 {success: false, message: err.message}
    // 403 success: false, message: "incorrect login details given"
    // 200 success: true, 
        // user: id: user._id,
        // username: user.username,
        // accesstoken: accessToken, 
        // reLogin
    // 400 { success: false, error: error.message}
    const endpoint = baseUrl + '/auth/login'
    const options = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json'}
    }
    if (accesstoken){
        options.headers["Authorization"] = accesstoken
    }
    try {
        const response = await axios.post(endpoint, { username, password}, options)
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }
}

export const registerUserAPI = async (username, email, password) => {
    // register user
    // 400 {success: false, error: err.message}
    // 401 {success: false, error: "user already exists"}
    // 200 {success: true, user: {id, username, accesstoken}, reLogin: true,}
    const endpoint = baseUrl + '/users/register'
    try {
        const response = await axios.post(endpoint, {username, password, email}, {withCredentials: true})
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }
}

export const getUserDetailsAPI = async (accesstoken) => {
    // gets a users details
    // 401 {success: false, message: err.message}
    // 401 {success: false, message: "Not Authorized"}
    // 401 {success: false, message: "Access token is required"}
    // 400 success: false, message: "no user found"
    // 200 success: true, "user": {id: user._id,"username": user.username,"login": user.logIn,"accesstoken": req.headers['authorization']}
    // 400 {success: false, message: "error occured", error: error.message}
    const endpoint = baseUrl + `/users/get`
    const options = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    try {
        const response = await axios.get(endpoint, options)
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }
}

export const getAccessTokenAPI = async () => {
    // gets access token from the refresh token
    // 200 {success: true, accesstoken}
    // 302 response 
        // success: false,
        // reLogin: true,
        // error: "provide cookie in request"

        // success: false,
        // reLogin: true,
        // error: "user session expired"
    // 401 response
    // success: false,
    // error: "wrong user is trying to access resource"
    const endpoint = baseUrl + '/auth/access/token'
    try {
        const response = await axios.get(endpoint, {
            withCredentials: true})
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }
}

export const getAllUrlsAPI = async (userid, accesstoken) => {
    // gets all urls of a user
    // success: 
    // 401 false, message: "Not Authorized"
    // 200 {success: true, url: urls}
    // 403 success: false, message: error.message
    const endpoint = baseUrl + `/urls/${userid}/getall`
    const options = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    try {
        const response = await axios.get(endpoint, options)
        return response.data
    } catch (error) {
        const status = error.response.status
        const errMsg = error.response.data.error
        return {error, status, errMsg}
    }
}

export const registerUrlAPI = async (userid, accesstoken, payload) => {
    // adds a new mock url of a user
    // 401 {success: false, message: "Not Authorized"}
    // 400 {success: false, error: err.message}
    // 400 {success: false, message: "Url already exists"}
    // 200 {success: true, message: "Url updated", isModified: true, urlData: url, updatedData: difference}
    // 400 {success: false, message: "Url not updated"}
    // 200 {success: true, message: "url added", isModified: false}
    // 403 success: false, message: error.message
    const endpoint = baseUrl + `/urls/${userid}/add`
    const options = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    try {
        const response = await axios.post(endpoint, payload, options)
        return response.data
    } catch (error) {
        const status = error.response.status
        let errMsg
        if (error.response.data?.message){
            errMsg = error.response.data?.message
        } else {
            errMsg = error.response.data.error
        }
        return {error, status, errMsg}
    }
}