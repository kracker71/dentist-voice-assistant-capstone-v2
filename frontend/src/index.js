import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthContextProvider } from "./store/auth-context";
import "./custom_bootstrap.scss";

const changeTitle = (newTitle) => {
  document.title = newTitle;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  
    
    <AuthContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </AuthContextProvider>
  
  // </React.StrictMode>
)

changeTitle("Dentist Voice Assistant V2");
