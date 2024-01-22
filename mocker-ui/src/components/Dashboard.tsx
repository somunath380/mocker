import { useState, useEffect } from 'react';
import { useNavigate} from "react-router-dom"
import { useUserContext } from './UserContext';
import { addUrlOfUser, getAccessToken, getAllUrlsOfUser, getDetailsOfAUser } from './apiCalls';


const Dashboard = () => {
    const [accessToken, setAccessToken] = useState("")
    const [userId, setUserId] = useState("")
    const [userName, setUserName] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [urlResponse, setUrlResponse] = useState<any[]>([]);
    const { user, setUser } = useUserContext();
    const navigate = useNavigate()
    const getAndSetNewAccessToken = async () => {
        // makes api call with refreshToken cookies to get new access token        
        try {
            const response = await getAccessToken()
            if (response.status === 200){
                setAccessToken(response.data.accesstoken)
                return response.data.accesstoken
            }
        } catch (error: any) {
            // if status code is 302 means re-login
            const respData = error.response.data
            if (error.response.status === 302) {
                alert("session expired please re-login")
                navigate("/login")
            }
            // if other error occurs for providing wrong userid
            else if (error.response.status === 401) {
                console.log(respData.error);
                setErrorMsg(respData.error)
            }
        }
    } 

    const getAllUrls = async () => {
        try {
            const response = await getAllUrlsOfUser(userId, accessToken)
            setUrlResponse([...response.data.url]);
            if (response.data.url.length == 0) {
                setNoUrlMsg("No Url is mocked right now.")
            }
        } catch (error: any) {
            const respData = error.response.data
            console.log(respData);
            if (error.response.status === 401) {
                // get new access token
                await getAndSetNewAccessToken()
                await getAllUrls()
            }
        }
    }

    // return Error component
    const Error = () => {
        return <><div>
            <h2>Error</h2>
            <h3>{errorMsg}</h3>
            </div>
            </>
        }

    // return SetUrl form
    const SetUrlForm = () => {
        const [mockUrl, setMockUrl] = useState("")
        const [mockMethod, setMockMethod] = useState("")
        const [mockBody, setMockBody] = useState("")
        const [mockResp, setMockResp] = useState("")
        const [mockHeader, setMockHeader] = useState("")
        const [mockStatus, setMockStatus] = useState("")
        const createUrl = async (event: any) => {
            try {
                event.preventDefault();
                const data = {
                    userid: userId,
                    url: mockUrl,
                    method: mockMethod,
                    body: (mockBody === "")? {} : JSON.parse(mockBody),
                    response: mockResp === ""? {} : JSON.parse(mockResp),
                    headers: mockHeader === ""? {} : JSON.parse(mockHeader),
                    status_code: mockStatus === ""? 200 : Number(mockStatus),
                    user_details: {
                        id: userId,
                        username: user.username
                    }
                }
                const response = await addUrlOfUser(userId, accessToken, data)
                if (response.status == 200 && !response.data.isModified) {
                    // means new url is added
                    alert(response.data.message)
                    
                }
                else if (response.status == 200 && response.data.isModified) {
                    // means updated the newly added url just now
                    alert(response.data.message)
                }
                await getAllUrls()
            } catch (error: any) {
                alert(`Some Error occured: ${error}`)
                const errMsg = error?.response.data.error
                console.log(errMsg);
                if (error.response.status === 401) {
                    // means token is expired
                    await getAndSetNewAccessToken()
                    await createUrl(event)
                }
                else if (error.response.status === 400) {
                    console.log(errMsg);
                    setErrorMsg(errMsg)
                }
            }
        }
        return (
            <>
                <form onSubmit={createUrl}>
                    <div className="form-group">
                        <label htmlFor="url">mock endpoint</label>
                        <input className="form-control" name="url" required id="url" placeholder='enter mock url endpoint' value={mockUrl} onChange={(event) => setMockUrl(event.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="method">mock method</label>
                        <input className="form-control" name="method" id="method" required placeholder='enter mock method' value={mockMethod} onChange={(event) => setMockMethod(event.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="body">mock payload</label>
                        <input value={mockBody} className="form-control" onChange={(e) => setMockBody(e.target.value)} placeholder='enter mock payload in json format'/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="response">mock response</label>
                        <input value={mockResp} className="form-control" required onChange={(e) => setMockResp(e.target.value)} placeholder='enter mock response in json format'/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="headers">mock headers</label>
                        <input value={mockHeader} className="form-control" onChange={(e) => setMockHeader(e.target.value)} placeholder='enter mock headers in json format'/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">mock HTTP status code</label>
                        <input value={mockStatus} className="form-control" onChange={(e) => setMockStatus(e.target.value)} placeholder='enter mock HTTP status code'/>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Add url
                    </button>
                </form>
            </>
        )
    }

    const setUserDetails = async (userData: any) => {
        // required user id, username and access token
        setUserId(userData.id),
        setUserName(userData.username)
        setAccessToken(userData.accesstoken)
        setUser(userData)
    }

    const getAndSetUserDetails = async () => {
        const accesstoken = await getAndSetNewAccessToken()
        try {
            const response = await getDetailsOfAUser(accesstoken)
            if (response.status === 200) {
                const userDetails = {
                    id: response.data.user.id,
                    username: response.data.user.username,
                    accesstoken: response.data.user.accesstoken
                }
                setUserDetails(userDetails)
            }
        } catch (error: any) {
            const errMsg = error.response.data.error
            setErrorMsg(errMsg)
        }
    }

    const fetchUserAndSetContext = async () => {
        console.log(accessToken);
        if (!user) {
            // set the user context by calling get user details api
            await getAndSetUserDetails()
        } else {
            await setUserDetails(user)
        }
    }
    // should run globally

    const [noUrlMsg, setNoUrlMsg] = useState("")
    
    return (
        <>
            {useEffect(() => {
                fetchUserAndSetContext()
            }, [])}
            <h1> Hi {userName} </h1>
            <div>
                <h1>Get all mocked urls</h1>
                <button type="button" className="btn btn-warning" onClick={getAllUrls}>Get</button>
                {urlResponse.length > 0 ? (
                    <ul>
                        {urlResponse.map((url: any, index) => (
                        <li key={index}>
                            <div>
                                URL: {url.url} <br />
                                METHOD: {url.method} <br />
                                HEADERS: {url?.headers ? JSON.stringify(url.headers, null, 2) : JSON.stringify({}, null, 2)} <br />
                                PAYLOAD: {url?.body ? JSON.stringify(url.body, null, 2) : JSON.stringify({}, null, 2)} <br />
                                RESPONSE: {JSON.stringify(url.response, null, 2)} <br />
                                HTTP STATUS: {url.status_code}
                            </div>
                        </li>
                        ))}
                    </ul>
                ) : (<h4>{noUrlMsg}</h4>)}
            </div>
            <div>
                <h1>Set a mock url</h1>
                <SetUrlForm/>
            </div>
            {errorMsg && <Error/>}
        </>
    )
}

export default Dashboard