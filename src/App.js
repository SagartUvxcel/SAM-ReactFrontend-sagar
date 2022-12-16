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
import Protected from "../src/components/Protected";
import { ToastContainer } from "react-toastify";
import EditUserDetails from "./components/8.Profile/EditUserDetails";
import ProtectAfterLogin from "../src/components/ProtectAfterLogin";
import ScrollButton from "./components/ScrollButton";
import Contact from "./components/4.Contact/Contact";
import PageNotFound from "./components/PageNotFound";
import AdminHomePage from "./Admin/AdminHomePage";
import ViewAllProperties from "./Admin/ViewAllProperties";
import ViewEditProperty from "./Admin/ViewEditProperty";
import UploadProperties from "./Admin/UploadProperties";
import ManageUsers from "./Admin/ManageUsers";

function App() {
  return (
    <>
      <ToastContainer className="toast-container" autoClose="1000" />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
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
            path="/profile/edit-details"
            element={
              // <Protected>
              <EditUserDetails />
              // </Protected>
            }
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route
            path="/admin/view-properties"
            element={<ViewAllProperties />}
          />
          <Route
            path="/admin/edit-property/:id"
            element={<ViewEditProperty />}
          />
          <Route
            path="/admin/upload-properties"
            element={<UploadProperties />}
          />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ScrollToTop>
      <ScrollButton />
    </>
  );
}

export default App;
