import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CommonNavLinks from "./CommonNavLinks";
import { checkLoginSession } from "../../CommonFunctions";
import axios from "axios";

let isBank = false;
let isLoggedIn = false;
let subscription_plan_id = 0;
let userRoleId = null;
let country_id = "india";

function Header() {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
    subscription_plan_id = data.subscription_plan_id;
    country_id = data.country_id;
    isLoggedIn = data.isLoggedIn;
    userRoleId = data.roleId;
  }
  // This useState will store data from localStorage such as login-status, role and email of user.
  const [allUseStates, setAllUseStates] = useState({
    loginStatus: false,
    roleId: null,
    userEmail: "",
    userId: null,
  });
  const { loginStatus, userEmail, roleId } = allUseStates;
  const [uploadDocumentPage, setUploadDocumentPage] = useState(false);
  const [activeLocation, setActiveLocation] = useState("");

  // To navigate to particular route.
  const goTo = useNavigate();

  // Logout function.
  const logOut = () => {
    const currentLocation = localStorage.getItem("location");
    // Clear localStorage.
    localStorage.clear();
    localStorage.setItem("location", currentLocation);
    setAllUseStates({ ...allUseStates, loginStatus: false });
    goTo("/");
    window.location.reload();
  };

  // Save status of login.
  const setStatusOfLogin = async () => {
    if (!window.location.href.includes("/login")) {
      localStorage.removeItem("userSession");
    }

    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res !== "Valid") {
          setAllUseStates({
            loginStatus: false,
            roleId: null,
            userEmail: "",
            userId: null,
            isBank: false,
          });
          // goTo("/login");
        }
      });
    }
  };

  // location url path selection 
  const pathLocation = () => {
    const path = window.location.pathname;
    const hrefPath = window.location.href;
    if (path.includes("/property/single-property-documents-upload") || path.includes("/property/bulk-documents-upload")) {
      setUploadDocumentPage(true);
    }
    const fixedPart = "/list-of-properties?data=";
    if (hrefPath.includes(fixedPart)) {
      setUploadDocumentPage(true);
    }
  }

  // set current country 
  const setCountry = async (country) => {
    localStorage.setItem("location", country);
    try {
      const { data } = await axios.get(`/sam/v1/property/change-country/${country === "india" ? 1 : 11}`)
    } catch (error) {
      console.log(error);
    }
    setActiveLocation(country);
    if (roleId === 1) {
      goTo("/admin");
      window.location.reload();
    } else if (roleId === 2 || roleId === 6) {
      goTo(`${roleId === 2 ? "/branch" : "/bank"}`);
    } else {
      goTo("/");
      window.location.reload();
    }
    // setActiveLocation(country);
  }

  useEffect(() => {
    if (data) {
      setAllUseStates({
        loginStatus: true,
        roleId: data.roleId,
        userEmail: data.user,
        userId: data.userId,
        isBank: data.isBank,
      });
      pathLocation();
    }
    setStatusOfLogin();
    const currentLocation = localStorage.getItem("location");
    if (currentLocation) {
      if (country_id !== null && isLoggedIn && userRoleId !== 3 && userRoleId !== 1) {
        setActiveLocation(`${country_id === 1 ? "india" : "malaysia"}`);
        localStorage.setItem("location", `${country_id === 1 ? "india" : "malaysia"}`);
      } else {
        setActiveLocation(currentLocation);
      }
    } else {
      if (country_id !== null && isLoggedIn) {
        localStorage.setItem("location", `${country_id === 1 ? "india" : "malaysia"}`);
        setActiveLocation(`${country_id === 1 ? "india" : "malaysia"}`);
      } else {
        localStorage.setItem("location", `india`);
        setActiveLocation("india");
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <header className="header-wrapper">
      <nav className="navbar navbar-expand-md fixed-top">
        <div className="container-fluid">
          <button
            className={`navbar-toggler ${window.location.href.includes(`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"}`)
              ? ""
              : "d-none"
              }`}
            onClick={() => {
              let offcanvasBackdrop = document.querySelector(
                ".offcanvas-backdrop"
              );
              if (offcanvasBackdrop) {
                offcanvasBackdrop.classList.add("d-none");
              }
            }}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-controls="offcanvasExample"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          {/* <span className="navbar-brand px-lg-4">Assets Class</span> */}
          <span className="navbar-brand px-lg-4 ">Stressed Assets Management</span>
          <button
            className="navbar-toggler "
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="collapse navbar-collapse mt-2 mt-md-0" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Home */}
              <li>
                <NavLink to="/" className={`nav-link ${roleId !== 2 && roleId !== 6 && !uploadDocumentPage ? "" : "d-none"} `}>
                  <i className="bi bi-house me-2 text-light"></i>
                  Home
                </NavLink>
              </li>
              {/* Login */}
              <li className={`nav-item ps-md-2 ${loginStatus ? "d-none" : ""} `}>
                <NavLink to="/login" className="nav-link">
                  <i className="bi bi-box-arrow-in-right me-2 text-light"></i>
                  Login
                </NavLink>
              </li>
              {/* Register */}
              <li className={`nav-item ps-md-2 ${loginStatus ? "d-none" : ""} `}>
                <NavLink to="/register" className="nav-link">
                  <i className="bi bi-person-vcard me-2 text-light"></i>
                  Register
                </NavLink>
              </li>
              {/* Enquiries */}
              {(subscription_plan_id !== 0 || roleId === 2) && (loginStatus && roleId !== 1 && roleId !== 6) ? <li className={`nav-item ps-md-2 ${loginStatus && roleId !== 1 && roleId !== 6 && !uploadDocumentPage ? "" : "d-none"} `}>
                <NavLink to="/user-enquiries" className="nav-link">
                  <i className="bi bi-chat-text me-2 text-light"></i>
                  Enquiries
                </NavLink>
              </li> : ""}
              {/* userEmail */}
              <li className={`nav-item ps-md-2 ${loginStatus ? "" : "d-none"} `}>
                <span className="nav-link">
                  <i className="bi bi-person-circle me-2 text-light"></i>
                  {userEmail}
                </span>
              </li>
              {/* If user is loggedIn then show these  Bank Registration links in dropdown */}
              {roleId === 1 && isBank === false && !uploadDocumentPage ? (
                <li>
                  <NavLink to="/bank-registration-link" className="nav-link">
                    <i className="bi bi-bank2 me-2 text-light"></i>
                    Bank Registration
                  </NavLink>
                </li>
              ) : (
                ""
              )}
              {/* If user is loggedIn then show these Subscribe links in dropdown */}
              {(roleId === 3 && isBank === false && !uploadDocumentPage) || loginStatus === false ? (
                <li>
                  <NavLink to="/subscription" className="nav-link">
                    <i className="bi bi-wallet2 me-2 text-light"></i>
                    Subscribe
                  </NavLink>
                </li>
              ) : (
                ""
              )}
              {/* country */}
              <div className={`d-flex ${loginStatus && roleId !== 1 ? "" : "d-none"} `}>
                <li title="To choose a country, logout first and select the country.">
                  <span className={`nav-link locationList md-me-0 sm-me-2 `}
                  >
                    <i className="bi bi-geo-alt me-2 text-light"></i>
                    {activeLocation === "india" ? "India" : "Malaysia"}
                  </span> </li>
              </div>
              <div className={`d-flex ${!loginStatus || roleId === 1 ? "" : "d-none"} `}>
                <li className="nav-item dropdown">
                  <span
                    className="nav-link countryLocationDropDown"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-geo-alt me-2 text-light"></i>
                    {activeLocation === "india" ? "India" : "Malaysia"}
                    <i className="bi bi-caret-down"></i>
                  </span>
                  <ul
                    className="dropdown-menu main-nav-dropdown-menu bg-box-primary"
                    data-bs-popper="static"
                  >
                    <li>
                      <span className={`nav-link locationList md-me-0 sm-me-2 ${activeLocation === "india" ? "activeLocation" : ""} `} onClick={() => setCountry("india")}>
                        <i className="bi bi-geo-alt me-2 text-light"></i>
                        India
                      </span>
                    </li>
                    <li>
                      <span className={`nav-link locationList md-me-0 sm-me-2 ${activeLocation === "malaysia" ? "activeLocation" : ""} `} onClick={() => setCountry("malaysia")}>
                        <i className="bi bi-geo-alt me-2 text-light"></i>
                        Malaysia
                      </span>
                    </li>
                  </ul>
                </li>
              </div>
              {/* If user is not loggedIn then show these logOut links in dropdown */}
              {!uploadDocumentPage ?
                <li className="nav-item dropdown ps-md-2 d-md-block d-none">
                  <span
                    className="nav-link"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-caret-down-square-fill"></i>
                  </span>
                  <ul
                    className="dropdown-menu main-nav-dropdown-menu bg-box-primary"
                    data-bs-popper="static"
                  >
                    <CommonNavLinks allUseStates={allUseStates} logOut={logOut} />
                  </ul>
                </li> : ""}
              <div className="d-md-none">
                <CommonNavLinks allUseStates={allUseStates} logOut={logOut} />
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
export default Header;
