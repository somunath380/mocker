import { useNavigate } from "react-router-dom"
import { useState } from "react";
import axios from "axios"


const Login = () => {
  // for signup page router
  const navigate = useNavigate()
  function handleClick() {
    navigate("/signup")
  }

  // for login submit
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [responseData, setResponseData] = useState(null)

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      const url = 'http://localhost:3000/api/v1/auth/login'
      const username = event.target.elements.username.value
      const password = event.target.elements.password.value
      if (username && password) {
        const response = await axios.post(url, {"username": username, "password": password}, {withCredentials: true})
        if (response.status === 200){
          setResponseData(response.data)
        }
      };
    } catch (error) {
      console.log(error);
    }
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
          ></input>
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
      </form>
      {responseData && (
        <div>
          <h2>API response: </h2>
        </div>
      )}
    </>
  );
};

export default Login;


