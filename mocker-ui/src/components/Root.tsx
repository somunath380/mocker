import { useNavigate} from "react-router-dom"
import { useEffect } from "react"
// import Cookies from 'js-cookie';
import axios from "axios";
import { useUserContext } from "./UserContext";

const Root = () => {
  const { setUser } = useUserContext();
  const navigate = useNavigate()
  const getAccessToken = async () => {
    try {
      const url = "http://127.0.0.1:3000/api/v1/auth/access/token"
      const response = await axios.get(url, {
        withCredentials: true})
      if (response.status === 200) {
        return response.data.accessToken
      }
    } catch (error: any) {
      console.log("failed to get access token maybe refresh token expired, error message: ", error.response.data.error)
      navigate("/login")
    }
  }
  const checkTokenValidity = async () => {
    try {
      const url = 'http://127.0.0.1:3000/api/v1/auth/validate/token'
      const response = await axios.get(url, {
        withCredentials: true})
      if (response.status === 200) {
        const accesstoken = await getAccessToken()
        const userData = {
          success: true,
          id: response.data.user.id,
          username: response.data.user.username,
          accesstoken
        }
        setUser(userData)
        navigate("/profile")
      }
    } catch (error: any) {
      console.log("redirecting to login page");
      const errResponse = error.response.data
      if (errResponse && errResponse?.reLogin) {
        console.log(`error msg: ${errResponse.error}`);
        navigate("/login")
      }
    }
  }
  useEffect(() => {
    checkTokenValidity()
  }, [])

  return (
    <></>
  );
}

export default Root