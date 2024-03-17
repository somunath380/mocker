
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
    const accessToken = localStorage.getItem('accessToken');
    // if not present
    if (!accessToken){
        // call the API to get new access token and save in the local storage
        let newAccessToken = await getNewAccessToken()
        return newAccessToken
    } else {
        // if accessToken is present in the browser local storage
        // check if the token is valid or not
        const response = await validateAccessTokenAPI(accessToken);
        if (response?.error){
            // if the access token is invalid then get new access token and save in browser
            let newAccessToken = await getNewAccessToken()
            return newAccessToken
        } else {
            return accessToken
        }
    }
}

export async function getNewAccessToken() {
    // gets new access token and saves it in the browser local storage
    // check if refreshToken is present or not
    const isCookie = await isCookieSet()
    if (!isCookie) {
        return 'relogin' // returning string because access token is also string
    }
    const response = await getAccessTokenAPI()
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
        localStorage.setItem('accessToken', response.accesstoken) // do not save the token as JSON.stringify because the accesstoken is in str format
        return response.accesstoken
    }
}

async function isCookieSet() {
    return await checkCookieAPI()
}


export async function validateRefreshToken() {
    // returns true/false/relogin only
    const cookie = await isCookieSet()
    if (!cookie) {
        return 'signup'
    }
    const response = await validateRefreshTokenAPI()
    if (response?.error){
        throw new Error(response.errMsg)
    } else {
        return true
    }
}


export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

