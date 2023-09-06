import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CommonNavLinks from "./CommonNavLinks";
import { checkLoginSession } from "../../CommonFunctions";

let isBank = false;
function Header() {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
  }
  // This useState will store data from localStorage such as login-status, role and email of user.
  const [allUseStates, setAllUseStates] = useState({
    loginStatus: false,
    roleId: null,
    userEmail: "",
    userId: null,
  });

  const { loginStatus, userEmail, roleId } = allUseStates;

  // To navigate to particular route.
  const goTo = useNavigate();

  // Logout function.
  const logOut = () => {
    // Clear localStorage.
    localStorage.clear();
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

  useEffect(() => {
    if (data) {
      setAllUseStates({
        loginStatus: true,
        roleId: data.roleId,
        userEmail: data.user,
        userId: data.userId,
        isBank: data.isBank,
      });
    }
    setStatusOfLogin();
    // eslint-disable-next-line
  }, []);

  return (
    <header className="header-wrapper">
      <nav className="navbar navbar-expand-md fixed-top">
        <div className="container-fluid">
          <button
            className={`navbar-toggler ${window.location.href.includes(`${isBank ? "/bank" : "/admin"}`)
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
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand px-lg-4">Assets Class</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse mt-2 mt-md-0" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li>
                <NavLink to="/" className="nav-link">
                  <i className="bi bi-house me-2 text-light"></i>
                  Home
                </NavLink>
              </li>

              <li className={`nav-item ps-md-2 ${loginStatus ? "d-none" : ""}`}>
                <NavLink to="/login" className="nav-link">
                  <i className="bi bi-box-arrow-in-right me-2 text-light"></i>
                  Login
                </NavLink>
              </li>
              <li className={`nav-item ps-md-2 ${loginStatus ? "d-none" : ""}`}>
                <NavLink to="/register" className="nav-link">
                  <i className="bi bi-person-vcard me-2 text-light"></i>
                  Register
                </NavLink>
              </li>

              <li className={`nav-item ps-md-2 ${loginStatus ? "" : "d-none"}`}>
                <NavLink to="/user-enquiries" className="nav-link">
                  <i className="bi bi-chat-text me-2 text-light"></i>
                  Enquiries
                </NavLink>
              </li>
              <li className={`nav-item ps-md-2 ${loginStatus ? "" : "d-none"}`}>
                <span className="nav-link">
                  <i className="bi bi-person-circle me-2 text-light"></i>
                  {userEmail}
                </span>
              </li>
              {/* If user is loggedIn then show these navbar links in dropdown */}
              {roleId === 3 && isBank===false || loginStatus=== false ? (
                <li>
                  <NavLink to="/subscription" className="nav-link">
                    <i className="bi bi-wallet2 me-2 text-light"></i>
                    Subscribe
                  </NavLink>
                </li>
              ) : (
                ""
              )}
              {/* <li
                className={`nav-item subscribe-btn-wrapper ps-md-2 ${loginStatus ? "" : ""
                  }`}
              >
                <NavLink to="/subscription" className="nav-link">
                  <i className="bi bi-wallet2 me-2 text-light"></i>
                  Subscribe
                </NavLink>
              </li> */}

              {/* If user is not loggedIn then show these navbar links in dropdown */}
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
                  className="dropdown-menu main-nav-dropdown-menu bg-primary"
                  data-bs-popper="static"
                >
                  <CommonNavLinks allUseStates={allUseStates} logOut={logOut} />
                </ul>
              </li>
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
