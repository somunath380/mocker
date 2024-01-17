import { useNavigate} from "react-router-dom"
import { useEffect } from "react"
// import Cookies from 'js-cookie';
import axios from "axios";

const isTokenValid = async () => {
  const url = 'http://localhost:3000/api/v1/auth/validate/token'
  const response = await axios.get(url, {withCredentials: true})
  return response
}

const Root = () => {
  const navigate = useNavigate()
  
  // const checkCookie = () => {
    useEffect(() => {
      // make axios api request with withCredentials: true. so the refreshToken will be included in the api
      isTokenValid()
      .then(
        (resp) => {
          if (resp.status === 200) {
            console.log("token is valid");
          }
          if (resp.status === 302) {
            console.log(resp.data);
            navigate("/login")
          }
        }
      )
      .catch((err) => {
        console.log(err);
        navigate("/login")
      })
    }, [navigate]);
  // }

  return (
      <>
      </>
  );
}

export default Root