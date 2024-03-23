# mocker
api mocking application

https://excalidraw.com/#json=Gl1D63q7a7-jW-6h02wLP,jVNEPR15-GbYnLsdliKqFQ


sed -i -e 's/\r$//' yourScript.sh

#**Project: Mocker**
## Description
This project provides a mock server and an UI client that allows for file streaming and dynamic responses, making it ideal for testing applications that require such functionality. With this server, developers/QA/QE's can easily simulate different scenarios and test their applications' ability to handle various types of input and output.

## Features of Mocker include:
    * File streaming capabilities
    * .js and .py script file execution on mock responses
    * Support for various HTTP methods (GET, POST, PUT, DELETE)
    * Easy setup and configuration

## Upcoming feature
    * Dynamic response generation
    It means you can set a variable of declared type when defining mock URL so the url can be dynamic

To get started, simply follow the instructions in the Getting Started section below.

I hope that this project helps you to streamline your testing process and ensures that your applications work as expected.

If you have found any Bug in the application or have an Idea to improvise the project then connect with me on my LinkedIn profile https://www.linkedin.com/in/somu-nath-7a4a72181/


### Getting Started
1. Install Docker on local machine
2. Clone the repository: `git clone https://github.com/somunath380/mocker`
3. Navigate to the project directory: `cd mocker` where you have downloaded the project
4. for WINDOWS OS
    Please enable the WSL feature on your system and install LINUX bash
    1. go to the mocker project and open up a new bash terminal
    2. locate your shell interpreter using command `which bash` and copy the output
    3. in the mocker folder locate the mocker.sh file
    4. paste the copied output on line 1
    5. make the mocker.sh file executable using the command `chmod +x mocker.sh`
    6. then run command on terminal `sed -i -e 's/\r$//' yourScript.sh`
5. for MAC/LINUX OS
    1. go to the mocker project and open up a new bash terminal
    2. locate your shell interpreter using command `which bash` and copy the output
    3. in the mocker folder locate the mocker.sh file
    4. paste the copied output on line 1
    5. make the mocker.sh file executable using the command `chmod +x mocker.sh`

6. now run `./mocker.sh start` command.
7. the above command will create docker image of mocker and pull up mongo and redis image from docker registory
8. thats all you need to get your server up and running

### Mocker commands
1. ./mocker.sh start - starts mocker all images for production
2. ./mocker.sh stop - stops all mocker images for production
3. ./mocker.sh shared - starts only the mongo and redis docker images and starts vue app for client, run `npm start` to start the backend server this is for local development
4. ./mocker.sh shared-stop - stops the mongo and redis docker images
5. ./mocker.sh clear - clears all stopped docker images, use it with caution!

Holaa!!! 🤩

### API Documentation and Usage

| Column 1 Method | Column 2 Endpoint | Description |
| --- | --- | --- |
| Auth API's |
| POST | /api/v1/auth/validate/refresh/token | validates the refresh token of a user |
| POST | /api/v1/auth/validate/access/token | validates the access token of a user |
| POST | /api/v1/auth/login | Logs in a user |
| POST | /api/v1/auth/logout | Logs out a user |
| POST | /api/v1/auth/access/token | generates new access token of a user from valid refresh token |
| POST | /api/v1/auth/check/refreshtoken | Checks if refresh token is present in the Cookie or not |

| User API's |

| POST | /api/v1/users/register | Register a new user |
| PUT | /api/v1/users/updaterole | Updates the role of a user (basic/super for superuser) |
| POST | /api/v1/users/delete | Deletes the user (for superuser) |
| GET | /api/v1/users/getall | Get all details of all users (for superuser)|

| Url API's |

| GET | /api/v1/urls/:userid/getall | Get a list of all urls of a user |
| GET | /api/v1/urls/:userid/get/:urlid | Get information about a specific url |
| POST | /api/v1/urls/:userid/add | Add a new url |
| PUT | /api/v1/urls/:userid/update/:urlid | Update a specific url data|
| POST | /api/v1/urls/:userid/upload/file | Upload file |
| DELETE | /api/v1/urls/:userid/delete/:urlid | Delete a Mock url |
| DELETE | /api/v1/urls/delete/files | Delete all files (for superuser) |

use [method] /mocker/<created url> to get the saved response.

