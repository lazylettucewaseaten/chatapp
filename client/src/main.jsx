import { createRoot } from 'react-dom/client'
import {CssBaseline} from "@mui/material"
import React from 'react';
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import AppRoutes from './routes.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <CssBaseline/>
    {/* <App /> */}
    <AppRoutes/>
  </>
)
