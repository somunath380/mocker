# mocker
api mocking application

https://excalidraw.com/#json=Gl1D63q7a7-jW-6h02wLP,jVNEPR15-GbYnLsdliKqFQ

ToDo
delete cookie on logout from ui

when user access / root url ui will request at endpoint /validate/api to validate if the refresh token is valid or not
if not valid the ui will take user to /login point
else will show user details in the ui

in the backend get the user details from the refresh token and give response

sed -i -e 's/\r$//' yourScript.sh