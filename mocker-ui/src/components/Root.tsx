import { useNavigate} from "react-router-dom"
import { useEffect } from "react"
import { useUserContext } from "./UserContext";
import { verifyRefreshToken, getAccessToken } from "./apiCalls";

const Root = () => {
  const { setUser } = useUserContext();
  const navigate = useNavigate()
  const fetchAccessToken = async () => {
    try {
      const response = await getAccessToken()
      if (response.status === 200) {
        return response.data.accesstoken
      }
    } catch (error: any) {
      const status = error.response.status
      const errMsg = error.response.data.error
      if (status === 302) {
        alert(`you need to login: ${errMsg}`)
        navigate("/login")
      }
      else if (status === 401) {
        alert(`Error: ${errMsg}`)
        navigate("/login")
      }
    }
  }
  const checkTokenValidity = async () => {
    try {
      const response = await verifyRefreshToken()
      if (response.status === 200) {
        const accesstoken = await fetchAccessToken()
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
      const status = error.response.status
      const errMsg = error.response.data.error
      if (status === 302) {
        alert(errMsg)
        navigate("/login")
      }
      else if (status === 401) {
        alert(`Error: ${errMsg}`)
        navigate("/")
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