const bcrypt = require("bcryptjs")

// create hash of the password
async function encryptPassword(password) {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword.toString()
    } catch (error) {
        console.log(`error while generating hash: ${error}`);
    }
}

async function isAuthorized(password, dbPassword) {
    try {
        const match = await bcrypt.compare(password, dbPassword)
        if (match){
            return true
        }
        return false
    } catch (error) {
        console.log(`error while checking authorization: ${error}`);
    }
}

module.exports = {
    encryptPassword,
    isAuthorized
}