import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "./UserContext";
import { registerUser } from "./apiCalls";

const Signup = () => {
  const navigate = useNavigate()

  const [username, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const saveUserName = (event: any) => {
    setUserName(event.target.value)
  }

  const saveEmail = (event: any) => {
    setEmail(event.target.value)
  }

  const savePassword = (event: any) => {
    setPassword(event.target.value)
  }

  const { setUser } = useUserContext();
  
  const createUser = async (event: any) => {
    try {
      event.preventDefault();
      const response = await registerUser(username, email, password)
      if (response.status === 200){
        // going to /login page for re-login
        const user = {
            id: response.data.user.id,
            username: response.data.user.username,
            accesstoken: response.data.user.accesstoken,
            reLogin: response.data.reLogin
        }
        setUser(user)
        if (response.data.reLogin){
          alert("user registered successfully, please re-login")
          navigate("/login")
        }
      } else {
        setErrorMsg(response.data.error)
      }
    } catch (error: any) {
      setErrorMsg(String(error.response.data.error))      
    }
  }

  // go to login page
    function handleClick() {
        navigate("/login")
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
      <form action="" onSubmit={createUser}>
        <div className="form-group">
          <label htmlFor="exampleInputUsername">Username</label>
          <input
              type="text"
              className="form-control"
              id="username"
              required
              value={username}
              onChange={saveUserName}
              aria-describedby="emailHelp"
              placeholder="Enter username"
          ></input>
          <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={saveEmail}
            className="form-control"
            id="email"
            aria-describedby="emailHelp"
            placeholder="Enter email"
          ></input>
          <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            required
            className="form-control"
            id="password"
            value={password}
            onChange={savePassword}
            placeholder="Password"
          ></input>
        </div>
        <div>
            <button type="submit" className="btn btn-success">Continue</button>
        </div>
      </form>
      <div>
          <h4>or Log in</h4>
          <button 
              type="submit" 
              className="btn btn-primary"
              onClick={handleClick}
              >
                Log in
          </button>
      </div>
      {errorMsg && <Error/>}
    </>
  )
}

export default Signup