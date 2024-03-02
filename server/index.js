require('dotenv').config();
const config = require("../config")

const port = config?.server?.port || 3000

function initServer() {
    const app = require("./server")
    app.listen(port, ()=>{
        console.log(`server is listening on ${port}`);
    })
    process.on("unhandledRejection", err => {
        console.log(`An error occurred: ${err.message}`)
    })
}

initServer()