import { useState, useEffect } from 'react';
import { useUserContext } from './UserContext';
import axios from 'axios';


const Dashboard = () => {
    const { user } = useUserContext();

    const [accessToken, setAccessToken] = useState("")
    const [userId, setUserId] = useState("")
    const [urls, setUrls] = useState([]);

    const getAllUrls = async () => {
        const url = 'http://localhost:3000/api/v1/urls/' + userId + '/getall'
        const headers = {
            'Authorization': accessToken
        }
        const response = await axios.get(url, {withCredentials: true, headers})
        setUrls(response.data); 
    }

    useEffect(() => {
        setUserId(user.userResponse.id),
        setAccessToken(user.userResponse.accesstoken)
      }, []);
    
    return (
        <>
            <h1> Hi {user.userResponse.username} </h1>
            <div>
                <h1>Get all mocked urls</h1>
                <button type="button" className="btn btn-warning" onClick={getAllUrls}>Get</button>
                {urls.length > 0 && (
                <ul>
                    {urls.map((url, index) => (
                    <li key={index}>{url}</li>
                    ))}
                </ul>
                )}
            </div>
            <div>
                <h1>Set a mock url</h1>
                
            </div>
        </>
    )
}

export default Dashboard