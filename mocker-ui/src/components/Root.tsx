import { useNavigate} from "react-router-dom"
import { useEffect, useState } from "react"
// import Cookies from 'js-cookie';
import axios from "axios";
import { useUserContext } from "./UserContext";

const Root = () => {
  const { setUser } = useUserContext();

  const navigate = useNavigate()
  const [isValidToken, setValidToken] = useState(false)
  const [isLoggedIn, setLoggedIn] = useState(false)

  const getAccessToken = async () => {
    const url = "http://127.0.0.1:3000/api/v1/auth/access/token"
    const response = await axios.get(url, {
      withCredentials: true})
    if (response.status === 200) {
      return response.data.accessToken
    } else {
      console.log("failed to get access token maybe refresh token expired")
      navigate("/login")
    }
  }

  const checkTokenValidity = async () => {
    const url = 'http://127.0.0.1:3000/api/v1/auth/validate/token'
    const response = await axios.get(url, {
      withCredentials: true})
    if (response.status === 200) {
      setValidToken(true)
      checkLogInStatus(response.data)
      const accesstoken = await getAccessToken()
      const userData = {
        success: true,
        userResponse: {
          id: response.data.user.id,
          username: response.data.user.username,
          accesstoken
        }
      }
      setUser(userData)
      navigate("/profile")
    }
    else {
      navigate("/login")
    }
  }

  const checkLogInStatus = async (data: any) => {
    // check user is logged or not
    console.log(`data received: ${data}`);
    if (data?.user?.logIn) {
      setLoggedIn(true)
    } else {
      navigate("/login")
    }
  }

  // this will always run
  useEffect(() => {
    checkTokenValidity()
    // make axios api request with withCredentials: true. so the refreshToken will be included in the api
    if (isValidToken) {
      console.log("user is logged in");
    } else {
      navigate("/login")
    }

  }, [isValidToken]);

  return (
      <>
      </>
  );
}

export default Root