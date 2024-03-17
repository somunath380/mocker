const {checkAndDeleteAccessToken} = require('./server/tokens/generate')

async function runCrons() {
    await checkAndDeleteAccessToken()
}

setInterval(runCrons, 1000)