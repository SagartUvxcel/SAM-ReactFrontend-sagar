import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/2.HomePage/Home";
import ViewPropertyDetails from "./components/2.HomePage/ViewPropertyDetails";
import LoginMainPage from "./components/6.Login/LoginMainPage";
import ResetPassword from "./components/7.Registration/ResetPassword";
import Registration from "./components/7.Registration/RegistrationMainPage";
import ScrollToTop from "./components/ScrollToTop";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
// export const MainContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoggedIn(Boolean(localStorage.getItem("loggedIn")));
    } else {
      localStorage.setItem("loggedIn", isLoggedIn);
      setIsLoggedIn(isLoggedIn);
    }
  });
  return (
    <BrowserRouter>
      <ScrollToTop>
        {/* <MainContext.Provider value={isLoggedIn}> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/property" element={<ViewPropertyDetails />} />
          <Route path="/register/*" element={<Registration />} />
          <Route
            path="/login"
            element={<LoginMainPage setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/register/reset-password" element={<ResetPassword />} />
        </Routes>
        {/* </MainContext.Provider> */}
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
