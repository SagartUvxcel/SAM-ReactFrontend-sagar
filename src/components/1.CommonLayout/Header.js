import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
import { toast } from "react-toastify";

function Header() {
  // To save status of login i.e. true or false.
  const [loginStatus, setLoginStatus] = useState(false);
  // To navigate to particular route.
  const goTo = useNavigate();
  // Logout function.
  const logOut = () => {
    // alert("Logged Out Successfully");
    toast.success("Logged Out Successfully");
    // Clear localStorage.
    localStorage.clear();
    setLoginStatus(false);
    setTimeout(() => {
      window.location.reload();
    }, 2500);
    goTo("/");
  };

  // Save status of login.
  const setStatusOfLogin = () => {
    const statusOfLogin = localStorage.getItem("isLoggedIn");
    if (statusOfLogin) {
      setLoginStatus(true);
    }
  };

  useEffect(() => {
    setStatusOfLogin();
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
                <NavLink to="/" className="nav-link">
                  Search
                </NavLink>
              </li>
              <li className="nav-item ps-lg-2">
                <Link
                  style={{ cursor: "pointer" }}
                  className="nav-link"
                  to="about"
                >
                  About
                </Link>
              </li>
              <li className="nav-item ps-lg-2">
                <Link
                  style={{ cursor: "pointer" }}
                  className="nav-link"
                  to="contact"
                >
                  Contact
                </Link>
              </li>
              <li className="nav-item ps-lg-2">
                <span className="nav-link">Account</span>
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
                    <NavLink to="/profile" className="nav-link">
                      Profile
                    </NavLink>
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
