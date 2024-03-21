const config = require("../config")
const mongoose = require("mongoose")

const dbUrl = config.db_url

async function connectToDB(){
    console.log(`using db connection ${dbUrl}`);
    await mongoose.connect(dbUrl, {autoIndex: false})
    console.log('connected to db!');
}

connectToDB().catch(err => console.log(`error while connecting to db: ${err}`))
