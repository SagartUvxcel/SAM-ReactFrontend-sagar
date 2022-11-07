import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/2.HomePage/Home";
import ViewPropertyDetails from "./components/2.HomePage/ViewPropertyDetails";
import LoginMainPage from "./components/6.Login/LoginMainPage";
import ResetPassword from "./components/7.Registration/ResetPassword";
import Registration from "./components/7.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const something = "ok";
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/property" element={<ViewPropertyDetails />} />
          <Route path="/register/*" element={<Registration />} />
          <Route path="/login" element={<LoginMainPage simple={something} />} />
          <Route path="/register/reset-password" element={<ResetPassword />} />
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
