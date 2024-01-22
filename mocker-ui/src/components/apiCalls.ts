import axios from "axios";

const domain = 'http://127.0.0.1'
const port = 3000
const path = '/api/v1'

const baseUrl = domain + `:${port}` + path

export const verifyRefreshToken = async () => {
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
    const endpoint = baseUrl + '/auth/validate/token'
    const response = await axios.get(endpoint, {withCredentials: true})
    return response
}

export const getAccessToken = async () => {
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
    const response = await axios.get(endpoint, {
        withCredentials: true})
    return response
}

export const logInUser = async (username: string, password: string, accesstoken?: string) => {
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
    const options: any = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json'}
    }
    if (accesstoken){
        options.headers["Authorization"] = accesstoken
    }
    const response = await axios.post(endpoint, { username, password}, options)
    return response
}

export const registerUser = async (username: string, email: string, password: string) => {
    // register user
    // 400 {success: false, error: err.message}
    // 401 {success: false, error: "user already exists"}
    // 200 {success: true, user: {id, username, accesstoken}, reLogin: true,}
    const endpoint = baseUrl + '/users/register'
    const response = await axios.post(endpoint, {username, password, email}, {withCredentials: true})
    return response
}

export const getDetailsOfAUser = async (accesstoken: string) => {
    // gets a users details
    // 401 {success: false, message: err.message}
    // 401 {success: false, message: "Not Authorized"}
    // 401 {success: false, message: "Access token is required"}
    // 400 success: false, message: "no user found"
    // 200 success: true, "user": {id: user._id,"username": user.username,"login": user.logIn,"accesstoken": req.headers['authorization']}
    // 400 {success: false, message: "error occured", error: error.message}
    const endpoint = baseUrl + `/users/get`
    const options: any = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    const response = await axios.get(endpoint, options)
    return response
}

export const getAllUrlsOfUser = async (userid: string, accesstoken: string) => {
    // gets all urls of a user
    // success: 
    // 401 false, message: "Not Authorized"
    // 200 {success: true, url: urls}
    // 403 success: false, message: error.message
    const endpoint = baseUrl + `/urls/${userid}/getall`
    const options: any = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    const response = await axios.get(endpoint, options)
    return response
}

export const addUrlOfUser = async (userid: string, accesstoken: string, payload: any) => {
    // adds a new mock url of a user
    // 401 {success: false, message: "Not Authorized"}
    // 400 {success: false, error: err.message}
    // 400 {success: false, message: "Url already exists"}
    // 200 {success: true, message: "Url updated", isModified: true, urlData: url, updatedData: difference}
    // 400 {success: false, message: "Url not updated"}
    // 200 {success: true, message: "url added", isModified: false}
    // 403 success: false, message: error.message
    const endpoint = baseUrl + `/urls/${userid}/add`
    const options: any = {
        withCredentials: true,
        headers: {'Content-Type': 'application/json', 'Authorization': accesstoken}
    }
    const response = await axios.post(endpoint, payload, options)
    return response
}