import { useNavigate } from "react-router-dom"

const Signup = () => {
    const navigate = useNavigate()
    function handleClick() {
        navigate("/")
    }
  return (
    <>
      <form action="">
        <div className="form-group">
          <label htmlFor="exampleInputUsername">Username</label>
          <input
              type="text"
              className="form-control"
              id="username"
              aria-describedby="emailHelp"
              placeholder="Enter username"
          ></input>
          <small id="emailHelp" className="form-text text-muted"></small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
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
            className="form-control"
            id="exampleInputPassword1"
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
    </>
  )
}

export default Signup