
import {getAccessTokenAPI, validateAccessTokenAPI, validateRefreshTokenAPI, checkCookieAPI} from '../API/index'

export async function getAccessToken() {

    // either returns accesstoken or 'relogin' to indicate refresh token is missing

    // checks accessToken in the browser local storage
    // if it is found then it makes an API call to check if it is valid or not
    // if response is true then it sets accessToken in the local storage and in the store
    // otherwise it makes an api call with the refresh token to get new access token and set it in the local storage and store
    // if refreshToken is not set in the cookie then it returns relogin to indicatate re-login
    // so the new refresh token can be set and used
    // checks if the 'accessToken' is present in the local storage
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
        return "relogin"
    }
    let accesstoken = user.accesstoken
    // if not present
    if (!accesstoken){
        // call the API to get new access token and save in the local storage
        let newAccessToken = await getNewAccessToken(user.id)
        return newAccessToken
    } else {
        // if accessToken is present in the browser local storage
        // check if the token is valid or not
        const response = await validateAccessTokenAPI(accesstoken, user.id);
        if (response?.error){
            // if the access token is invalid then get new access token and save in browser
            let newAccessToken = await getNewAccessToken(user.id)
            return newAccessToken
        } else {
            return accesstoken
        }
    }
}

export async function getNewAccessToken(id) {
    // gets new access token and saves it in the browser local storage
    // check if refreshToken is present or not
    let isCookie = await isCookieSet()
    if (!isCookie) {
        return 'relogin' // returning string because access token is also string
    }
    const response = await getAccessTokenAPI(id)
    if (response?.error){
        if (response.status == 302) {
            return 'relogin'
        }
        if (response.status == 401) {
            return 'Unauthorized user'
        }
        if (response.status == 500) {
            return 'error'
        }
    } else {
        // set in localstorage
        let user = JSON.parse(localStorage.getItem('user'))
        user.accesstoken = response.accesstoken
        localStorage.setItem('user', JSON.stringify(user))
        return response.accesstoken
    }
}

async function isCookieSet() {
    let user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
        return false
    } else {
        return checkCookieAPI(user.id)
    }
}

export async function validateRefreshToken() {
    try {
        // first check if cookie is set or not
        let isCookie = await isCookieSet()
        if (!isCookie) {
            return "signup"
        }
        let user = JSON.parse(localStorage.getItem('user'))
        const response = await validateRefreshTokenAPI(user.id)
        if (response?.error){
            throw new Error(response.errMsg)
        } else {
            return true
        }
    } catch (error) {
        throw new Error('Some error occured')
    }
}


export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

