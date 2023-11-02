import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/2.HomePage/Home";
import LoginMainPage from "./components/6.Login/LoginMainPage";
import SetPassword from "./components/7.Registration/SetPassword";
import Registration from "./components/7.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";
import VerifyToken from "./components/7.Registration/VerifyToken";
import Profile from "./components/8.Profile/Profile";
import ProtectedForLoggedInUser from "./components/ProtectedForLoggedInUser";
import EditUserDetails from "./components/8.Profile/EditUserDetails";
import ScrollButton from "./components/ScrollButton";
import Contact from "./components/5.Contact/Contact";
import PageNotFound from "./components/PageNotFound";
import AdminHomePage from "./Admin/AdminHomePage";
import BankRegistrationLinkPage from "./Admin/BankRegistrationLinkPage";
import BankRegistrationPage from "./Admin/BankRegistrationPage";
import ViewEditDeleteProperties from "./Admin/Property/ViewEditDeleteProperties";
import ViewProperty from "./Admin/Property/ViewProperty";
import UploadProperties from "./Admin/Property/UploadProperties";
import ChangePassword from "./components/6.Login/ChangePassword";
import AboutUs from "./components/4.About/AboutUs";
import AddProperty from "./Admin/Property/AddProperty";
import ForgotPassword from "./components/6.Login/ForgotPassword";
import AdminProtected from "./components/AdminProtected";
import UserProtected from "./components/UserProtected";
import AccessDeniedPage from "./components/AccessDeniedPage";
import ForgotAndResetPassword from "./components/9.ForgotAndResetPassword/ForgotAndResetPassword";
import SinglePropertyDocumentsUpload from "./Admin/Property/SinglePropertyDocumentsUpload";
import ProtectedPages from "./components/ProtectedPages";
import ProtectSetPasswordPage from "./components/ProtectSetPasswordPage";
import ProtectForgotPasswordPage from "./components/ProtectForgotPasswordPage";
import { ToastContainer, toast } from "react-toastify";
import ManageUsers from "./Admin/User/ManageUsers";
import { useEffect } from "react";
import axios from "axios";
import ViewSearchResults from "./components/3.Properties with filters/ViewSearchResults";
import ListOfProperties from "./components/3.Properties with filters/ListOfProperties";
import ViewEnquiryLists from "./components/10.User Enquiries/ViewEnquiryLists";
import Subscription from "./components/11.Subscription/Subscription";
import UpgradeSubscriptionPage from "./components/11.Subscription/UpgradeSubscriptionPage";
import PaymentInformation from "./components/11.Subscription/PaymentInformation";
import CommonSubscriptionNotificationMsg from "./components/11.Subscription/CommonSubscriptionNotificationMsg";



// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe("pk_test_51Nk4qfSHRy9SkqBTfWc49bExrTp3Q5k6ZEwAjFcPHnqKn6MZ8D0ekQvimsKpJh47iig7hx2BNK8rFwx9D1LK1uxk00xu0jvJqs");



let isBank = false;
function App() {
  const MINUTE_MS = 1000;
  const goTo = useNavigate();
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
  }
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = JSON.parse(localStorage.getItem("data"));
      if (data) {
        try {
          let res = await axios.get(`/sam/v1/user-registration/logout`, {
            headers: { Authorization: data.loginToken },
          });

          if (res.data !== "Session expired or invalid user") {
            let remainingTime = parseInt(res.data.TimeRemaining);
            // console.log("Time Remaining = ", remainingTime);
            if (remainingTime === 5) {
              const sessionTimeRemaining =
                localStorage.getItem("remainingTime");
              if (sessionTimeRemaining === null) {
                toast.warn("Your session will expire in 5 minutes");
                localStorage.setItem("remainingTime", 5);
              }
            }
          } else {
            localStorage.setItem("userSession", "invalid");
            goTo("/login");
          }
        } catch (error) {
          console.log("error");
        }
      }
    }, MINUTE_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <ToastContainer autoClose="3000" />
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/property-search-results"
            element={<ViewSearchResults />}
          />
          <Route path="/list-of-properties" element={<ListOfProperties />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/register/*"
            element={
              <ProtectedPages>
                <Registration />
              </ProtectedPages>
            }
          />
          <Route
            path="/register/verify"
            element={
              <ProtectedPages>
                <VerifyToken />
              </ProtectedPages>
            }
          />
          <Route
            path="/login"
            element={
              // <ProtectedPages>
              <LoginMainPage />
              // </ProtectedPages>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedForLoggedInUser>
                <ChangePassword />
              </ProtectedForLoggedInUser>
            }
          />
          <Route
            path="/register/set-password"
            element={
              <ProtectSetPasswordPage>
                <SetPassword />
              </ProtectSetPasswordPage>
            }
          />
          <Route
            path="/forgot-password/reset-password"
            element={
              // <ProtectForgotPasswordPage>
              <ForgotAndResetPassword />
              // </ProtectForgotPasswordPage>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedForLoggedInUser>
                <Profile />
              </ProtectedForLoggedInUser>
            }
          />
          <Route
            path="/edit-details"
            element={
              <ProtectedForLoggedInUser>
                <EditUserDetails />
              </ProtectedForLoggedInUser>
            }
          />

          <Route path="/forgot-password/*" element={<ForgotPassword />} />

          <Route
            path="/user-enquiries"
            element={
              <ProtectedForLoggedInUser>
                <ViewEnquiryLists />
              </ProtectedForLoggedInUser>
            }
          />

          {/* Admin */}
          <Route
            path={`${isBank ? "/bank" : "/admin"}`}
            element={
              <AdminProtected>
                <AdminHomePage />
              </AdminProtected>
            }
          />
          <Route
            path={`${isBank ? "/bank" : "/admin"}/property/properties/*`}
            element={
              <AdminProtected>
                <ViewEditDeleteProperties />
              </AdminProtected>
            }
          />
          <Route
            path={`${isBank ? "/bank" : "/admin"}/property/add-property`}
            element={
              <AdminProtected>
                <AddProperty />
              </AdminProtected>
            }
          />
          {/* <Route path="/bank-registration" element={<BankRegistrationPage />} /> */}
          <Route
            path={`/admin/bank-registration-link`}
            element={
              <AdminProtected>
                <BankRegistrationLinkPage />
              </AdminProtected>
            }
          />
          <Route
            path={`/bank-registration`}
            element={<BankRegistrationPage />}
          />

          <Route
            path="/admin/users/individual-users"
            element={
              <AdminProtected>
                <ManageUsers key={"Individual User"} userType={0} />
              </AdminProtected>
            }
          />

          <Route
            path="/admin/users/organizational-users"
            element={
              <AdminProtected>
                <ManageUsers key={"Organizational User"} userType={1} />
              </AdminProtected>
            }
          />

          <Route
            path={`${isBank ? "/bank" : "/admin"
              }/property/single-property-documents-upload`}
            element={
              <AdminProtected>
                <SinglePropertyDocumentsUpload />
              </AdminProtected>
            }
          />
          <Route
            path={`${isBank ? "/bank" : "/admin"
              }/property/properties/view-property/:id`}
            element={
              <AdminProtected>
                <ViewProperty />
              </AdminProtected>
            }
          />
          <Route
            path={`${isBank ? "/bank" : "/admin"}/property/upload-properties`}
            element={
              <AdminProtected>
                <UploadProperties />
              </AdminProtected>
            }
          />
          <Route path="/subscription/*" element={
            <UserProtected>
              <Subscription />
            </UserProtected>
          } />
          <Route path="/subscription/upgrade-plan" element={
            <UserProtected>
              <UpgradeSubscriptionPage />
            </UserProtected>
          } />
          <Route path="/subscription/payment" element={
            <UserProtected>
              <PaymentInformation />
            </UserProtected>} />

          <Route path="*" element={<PageNotFound />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

        </Routes>
      </ScrollToTop>
      <ScrollButton /> <CommonSubscriptionNotificationMsg />
    </>
  );
}

export default App;
