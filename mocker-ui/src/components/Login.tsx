import { useNavigate } from "react-router-dom"
import { useState } from "react";
import { logInUser } from "./apiCalls";
import { useUserContext } from './UserContext';


const Login = () => {
  const { user } = useUserContext();
  // for signup page router
  const navigate = useNavigate()
  function handleClick() {
    navigate("/signup")
  }

  // for login submit
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (event: any) => {
    let response
    let accessToken
    try {
      event.preventDefault();
      if (user) {
        accessToken = user.accesstoken
      }
      const username = event.target.elements.username.value
      const password = event.target.elements.password.value
      if (accessToken) {
        response = await logInUser(username, password, accessToken)
      }
      else {
        response = await logInUser(username, password)
      }
      if (response.status === 200){
        navigate("/profile")
      }
    } catch (error: any) {
      alert(`Error: ${error.response.data.error}`)
      navigate("/")
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
            required
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
            required
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
    </>
  );
};

export default Login;

