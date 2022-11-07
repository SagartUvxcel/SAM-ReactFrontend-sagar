import React from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkStatus } from "../../redux/ActionTypes";

function Header() {
  const dispatch = useDispatch();
  const loginStatus = useSelector((state) => state.login_status);
  const goTo = useNavigate();
  const logOut = () => {
    alert("Logged Out Successfully");
    dispatch(checkStatus(false));
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
