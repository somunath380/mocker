const pathLib = require('path')
const { spawn } = require('child_process');
const {UrlModel} = require("../models/url_schema")

const availableExtensions = ['.py', '.js']
const extLangs = {
    '.py': 'python',
    '.js': 'node'
}

async function mockHandler(req, res, next) {
    const host = req.headers.host;
    const path = req.path;
    const queryParams = new URLSearchParams(req.url.split('?')[1]);
    const url = await UrlModel.findOne({"url": path}).lean()
    // if the url is not found
    if (!url){
        return res.status(404).json({success: false, message: 'Url not found'})
    }
    // check if method is same or not
    if (req.method !== url.method) {
        return res.status(404).json({success: false, message: 'Wrong HTTP method called'})
    }
    const headers = url.headers
    // if its a normal url means if execute_file is false
    if (!url.filepath) {
        // check the headers of url
        
        // if no headers found or if it is {}
        if (!headers) {
            return res.status(url.status_code).json(url.response)
        }
        // else take the Content-Type key and send send response accordingly
        const resType = headers["Content-Type"]
        res.type(resType);
        return res.send(url.response)
    } else {
        // check if the file has to be executed or not
        // if not to be executed
        const filepath = url.filepath
        const extname = pathLib.extname(filepath)
        if (!url.execute_file) {
            if (!headers) {
                return res.status(500).json({success: false, message: `response headers required for ${extname} type file, please update the headers field of the mock`})
            }
            const resType = headers["Content-Type"]
            res.setHeader('Content-Type', resType)
            return res.sendFile(url.filepath)
        }
        // if it has to be executed
        // check the extension of the files, currently available extensions: [.py, .js]
        if (!availableExtensions.includes(extname)) {
            return res.status(500).json({success: false, message: `currntly available extensions are ${availableExtensions}`})
        }
        const langType = extLangs[extname]
        let output = await executeProcess(langType, filepath)
        if (!output){
            res.send({success: false, message: `file execution not successful`})
        }
        try {
            res.send({'success': output})
        } catch (error) {
            res.status(500).json({success: false, message: error.message})
        }
    }
}

async function executeProcess(langType, filepath) {
    try {
        const process = spawn(langType, [filepath]);
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        await new Promise((resolve, reject) => {
            process.on('close', (code) => {
                if (code === 0) {
                    new Promise(resolve => setTimeout(resolve, 10));
                    output = output.replace('\n', '')
                    resolve(output);
                } else {
                    reject(new Error(`Child process exited with code ${code}`));
                }
            });
            process.on('error', (err) => {
                console.log("error occured at executing file: ", filepath);
                console.error(err);
                reject(err);
            });
        });

        return output;
    } catch (error) {
        console.error('Error collecting data:', error);
    }
}

module.exports = mockHandler


