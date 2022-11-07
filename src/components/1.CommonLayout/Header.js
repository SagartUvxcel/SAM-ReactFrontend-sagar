import React from "react";
import { NavLink } from "react-router-dom";

function Header() {
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
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
export default Header;
