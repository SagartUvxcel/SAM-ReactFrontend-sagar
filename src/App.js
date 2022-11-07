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

function App() {
  const mainContext = createContext();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  return (
    <BrowserRouter>
      <ScrollToTop>
        <mainContext.Provider value={setIsLoggedIn}>
          <Routes>
            <Route path="/" element={<Home setIsLoggedIn={setIsLoggedIn} />} />
            <Route
              path="/search"
              element={<Home setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/property" element={<ViewPropertyDetails />} />
            <Route path="/register/*" element={<Registration />} />
            <Route path="/login" element={<LoginMainPage />} />
            <Route
              path="/register/reset-password"
              element={<ResetPassword />}
            />
          </Routes>
        </mainContext.Provider>
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
