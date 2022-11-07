import React from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const [IsLoggedIn, setIsLoggedIn] = useState(false);

  const goTo = useNavigate();

  const login = () => {
    setIsLoggedIn(true);
    goTo("/");
  };

  const logout = () => {
    setIsLoggedIn(false);
    goTo("/");
  };
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
              {!IsLoggedIn ? (
                <>
                  <li className="nav-item ps-lg-2">
                    <span onClick={login} className="nav-link">
                      Login
                    </span>
                  </li>
                  <li className="nav-item ps-lg-2">
                    <NavLink to="/register" className="nav-link">
                      Registration
                    </NavLink>
                  </li>
                </>
              ) : (
                <li className="nav-item ps-lg-2">
                  <span onClick={logout} className="nav-link">
                    Logout
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
export default Header;
