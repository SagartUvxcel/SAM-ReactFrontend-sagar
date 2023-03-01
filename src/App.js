import { Routes, Route } from "react-router-dom";
import Home from "./components/2.HomePage/Home";
import ViewPropertyDetails from "./components/2.HomePage/ViewPropertyDetails";
import LoginMainPage from "./components/5.Login/LoginMainPage";
import SetPassword from "./components/6.Registration/SetPassword";
import Registration from "./components/6.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";
import VerifyToken from "./components/6.Registration/VerifyToken";
import Profile from "./components/7.Profile/Profile";
import Protected from "../src/components/Protected";
import { ToastContainer } from "react-toastify";
import EditUserDetails from "./components/7.Profile/EditUserDetails";
import ProtectAfterLogin from "../src/components/ProtectAfterLogin";
import ScrollButton from "./components/ScrollButton";
import Contact from "./components/4.Contact/Contact";
import PageNotFound from "./components/PageNotFound";
import AdminHomePage from "./Admin/AdminHomePage";
import ViewAllProperties from "./Admin/Property/ViewAllProperties";
import ViewEditProperty from "./Admin/Property/ViewEditProperty";
import UploadProperties from "./Admin/Property/UploadProperties";
import ViewAllUsers from "./Admin/User/ViewAllUsers";
import ViewCurrentUser from "./Admin/User/ViewCurrentUser";
import ChangePassword from "./components/5.Login/ChangePassword";
import AboutUs from "./components/3.About/AboutUs";
import AddProperty from "./Admin/Property/AddProperty";
import ForgotPassword from "./components/5.Login/ForgotPassword";
import AdminProtected from "./components/AdminProtected";
import AccessDeniedPage from "./components/AccessDeniedPage";
import ForgotAndResetPassword from "./components/8.ForgotAndResetPassword/ForgotAndResetPassword";

function App() {
  return (
    <>
      <ToastContainer autoClose="2000" />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
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
            path="/reset-password"
            element={
              <Protected>
                <ChangePassword />
              </Protected>
            }
          />
          <Route path="/register/set-password" element={<SetPassword />} />
          <Route
            path="/forgot-password/reset-password"
            element={<ForgotAndResetPassword />}
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/edit-details"
            element={
              <Protected>
                <EditUserDetails />
              </Protected>
            }
          />
          <Route path="/forgot-password/*" element={<ForgotPassword />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminProtected>
                <AdminHomePage />
              </AdminProtected>
            }
          />
          <Route
            path="/admin/property/properties/*"
            element={
              <AdminProtected>
                <ViewAllProperties />
              </AdminProtected>
            }
          />
          <Route
            path="/admin/property/add-property"
            element={
              <AdminProtected>
                <AddProperty />
              </AdminProtected>
            }
          />
          <Route
            path="/admin/property/properties/edit-property/:id"
            element={
              <AdminProtected>
                <ViewEditProperty />
              </AdminProtected>
            }
          />
          <Route
            path="/admin/property/upload-properties"
            element={
              <AdminProtected>
                <UploadProperties />
              </AdminProtected>
            }
          />
          <Route
            path="/admin/users/*"
            element={
              <AdminProtected>
                <ViewAllUsers />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/users/view-user/:id"
            element={
              <AdminProtected>
                <ViewCurrentUser />
              </AdminProtected>
            }
          />

          <Route path="*" element={<PageNotFound />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Routes>
      </ScrollToTop>
      <ScrollButton />
    </>
  );
}

export default App;
