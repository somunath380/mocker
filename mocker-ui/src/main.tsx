import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> // making Strict mode off for disabling reloading 2 times for reducing api calls
    <App />
  // </React.StrictMode>,
)
