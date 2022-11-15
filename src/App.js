import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/2.HomePage/Home";
import ViewPropertyDetails from "./components/2.HomePage/ViewPropertyDetails";
import LoginMainPage from "./components/6.Login/LoginMainPage";
import ResetPassword from "./components/7.Registration/ResetPassword";
import Registration from "./components/7.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";
import { useState } from "react";
import VerifyToken from "./components/7.Registration/VerifyToken";
import Profile from "./components/8.Profile/Profile";
import Protected from "./Protected";

function App() {
  const [token, setToken] = useState("");

  return (
    <>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/property" element={<ViewPropertyDetails />} />
          <Route
            path="/register/*"
            element={<Registration setToken={setToken} />}
          />
          <Route
            path="/register/verify"
            element={<VerifyToken token={token} />}
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
