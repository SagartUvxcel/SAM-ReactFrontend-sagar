import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/2.HomePage/Home";
import ViewPropertyDetails from "./components/2.HomePage/ViewPropertyDetails";
import LoginMainPage from "./components/6.Login/LoginMainPage";
import ResetPassword from "./components/7.Registration/ResetPassword";
import Registration from "./components/7.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";
import VerifyToken from "./components/7.Registration/VerifyToken";
import Profile from "./components/8.Profile/Profile";
import Protected from "./Protected";
import { ToastContainer } from "react-toastify";
import { createContext, useState } from "react";
export const AlertDetails = createContext();

function App() {
  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  return (
    <>
      <ToastContainer className="toast-container" autoClose="1500" />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/property" element={<ViewPropertyDetails />} />
          <Route path="/register/*" element={<Registration />} />
          <Route
            path="/register/verify"
            element={
              <AlertDetails.Provider value={alertDetails}>
                <VerifyToken setAlertDetails={setAlertDetails} />
              </AlertDetails.Provider>
            }
          />
          <Route path="/login" element={<LoginMainPage />} />
          <Route path="/register/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
        </Routes>
      </ScrollToTop>
    </>
  );
}

export default App;
