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
import EditUserDetails from "./components/8.Profile/EditUserDetails";
import EditOrganizationDetails from "./components/8.Profile/EditOrganizationDetails";
import ProtectAfterLogin from "./ProtectAfterLogin";
import ScrollButton from "./components/ScrollButton";

function App() {
  return (
    <>
      <ToastContainer className="toast-container" autoClose="1500" />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/property" element={<ViewPropertyDetails />} />
          <Route
            path="/register/*"
            element={
              <ProtectAfterLogin>
                <Registration />
              </ProtectAfterLogin>
            }
          />
          <Route
            path="/register/verify"
            element={
              <ProtectAfterLogin>
                <VerifyToken />
              </ProtectAfterLogin>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectAfterLogin>
                <LoginMainPage />
              </ProtectAfterLogin>
            }
          />
          <Route
            path="/register/reset-password"
            element={
              <ProtectAfterLogin>
                <ResetPassword />
              </ProtectAfterLogin>
            }
          />
          <Route
            path="/profile/*"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/profile/edit-individual"
            element={
              // <Protected>
              <EditUserDetails />
              // </Protected>
            }
          />
          <Route
            path="/profile/edit-organization"
            element={
              // <Protected>
              <EditOrganizationDetails />
              // </Protected>
            }
          />
        </Routes>
      </ScrollToTop>
      <ScrollButton />
    </>
  );
}

export default App;
