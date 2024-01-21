import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'
// import Root from './components/Root'
import Signup from './components/Signup'
import Login from './components/Login'
import Root from './components/Root'
import Dashboard from './components/Dashboard'
import { UserProvider } from './components/UserContext';

function App() {
  return <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Root/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/profile" element={<Dashboard/>}></Route>
      </Routes>
    </BrowserRouter>
  </UserProvider>
}

export default App
