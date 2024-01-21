import { useNavigate } from "react-router-dom"
import { useState } from "react";
import axios from "axios"
import { useUserContext } from "./UserContext";


const Login = () => {

  const { setUser, user } = useUserContext();

  // for signup page router
  const navigate = useNavigate()
  function handleClick() {
    navigate("/signup")
  }

  // for login submit
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [response, setResponse] = useState({})
  const [errorMsg, setErrorMsg] = useState("")

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      const url = 'http://127.0.0.1:3000/api/v1/auth/login'
      const username = event.target.elements.username.value
      const password = event.target.elements.password.value
      if (username && password) {
        let headers: object = {}
        if (user?.accesstoken) {
          headers = {"Authorization": user.accesstoken}
        }
        const response = await axios.post(url, {"username": username, "password": password}, {withCredentials: true, headers})
        if (response.status === 200){
          setResponse(response.data)
          setUser(user)
          alert("Login successful")
          navigate("/profile")
        }
      };
    } catch (error: any) {
      const errResponse = error.response.data
      console.log(errResponse.error);
      // have to catch the error and display it on screen
      setErrorMsg(errResponse.error)
    }
  }

  // display error on screen
  const Error = () => {
    return <><div>
        <h2>Error</h2>
        <h3>{errorMsg}</h3>
      </div>
      </>
  }

  return (
    <>
      {/* <Common/> */}
      <form action="" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            placeholder="Enter username"
            onChange={handleUsernameChange}
          ></input>
          <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Password"
          />
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Log in
          </button>
          <div>
            <h4>New here?</h4>
            <button
              type="submit"
              className="btn btn-success"
              onClick={handleClick}
            >
              Sign up
            </button>
          </div>
        </div>
        <div>
        </div>
      </form>
      {errorMsg && <Error/>}
    </>
  );
};

export default Login;

