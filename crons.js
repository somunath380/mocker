const {checkAndDeleteAccessToken} = require('./server/tokens/generate')

async function runCrons() {
    // await checkAndDeleteAccessToken()
    return
}

setInterval(runCrons, 1000)