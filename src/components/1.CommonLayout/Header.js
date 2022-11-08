import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkStatus } from "../../redux/ActionTypes";
import { useState } from "react";

function Header() {
  // It is to dispatch actions to the redux store
  const dispatch = useDispatch();
  // Initial state from redux
  let InitialStatus = useSelector((state) => state.login_status);
  // To save status of login i.e. true or false
  const [loginStatus, setLoginStatus] = useState(InitialStatus);
  // To navigate to particular route
  const goTo = useNavigate();
  // Logout function
  const logOut = () => {
    alert("Logged Out Successfully");
    // false -  means user is logged out so that we are setting logged in status as false
    dispatch(checkStatus(false));
    goTo("/");
  };

  // Save status of login
  const saveLoginStatus = () => {
    if (localStorage.getItem("isLoggedIn") === "false") {
      setLoginStatus(false);
    } else if (localStorage.getItem("isLoggedIn") === "true") {
      setLoginStatus(true);
    }
  };

  useEffect(() => {
    saveLoginStatus();
  });

  return (
    <header className="header-wrapper">
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
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
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink to="/search" className="nav-link">
                  Search
                </NavLink>
              </li>
              <li className="nav-item ps-lg-2">
                <a className="nav-link" href="/">
                  About
                </a>
              </li>
              <li className="nav-item ps-lg-2">
                <a className="nav-link" href="/">
                  Contact
                </a>
              </li>
              <li className="nav-item ps-lg-2">
                <a className="nav-link" href="/">
                  Account
                </a>
              </li>
              {!loginStatus ? (
                <>
                  <li className="nav-item ps-lg-2">
                    <NavLink to="/login" className="nav-link">
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item ps-lg-2">
                    <NavLink to="/register" className="nav-link">
                      Registration
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item ps-lg-2">
                    <span style={{ cursor: "pointer" }} className="nav-link">
                      Profile
                    </span>
                  </li>
                  <li className="nav-item ps-lg-2">
                    <span
                      style={{ cursor: "pointer" }}
                      className="nav-link"
                      onClick={logOut}
                    >
                      Logout
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
export default Header;
