import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
// import axios from "axios";

// let startTime = "";
// axios.interceptors.request.use((req) => {
//   startTime = new Date().getTime() / 1000;
//   return req;
// });

// axios.interceptors.response.use((res) => {
//   let endTime = new Date().getTime() / 1000;
//   console.log(res.request.responseURL, res.config.method);
//   console.log("Response Time: ", (endTime - startTime).toFixed(4), "sec");
//   return res;
// });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
