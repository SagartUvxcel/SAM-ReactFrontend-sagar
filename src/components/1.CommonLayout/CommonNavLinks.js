import React from "react";
import { NavLink } from "react-router-dom";

const CommonNavLinks = ({ allUseStates, logOut }) => {
  const { loginStatus, roleId, isBank } = allUseStates;
  return (
    <>
    {/* About */}
      <li>
        <NavLink className="nav-link" to="/about">
          <i className="bi bi-info-circle text-white me-2"></i>
          About
        </NavLink>
      </li>
      {/* Contact */}
      <li>
        <NavLink className="nav-link" to="/contact">
          <i className="bi bi-telephone text-white me-2"></i>
          Contact
        </NavLink>
      </li>
      {/* If user is loggedIn then show these navbar links in dropdown */}
      {roleId === 1 || isBank ? (
        <li>
          <NavLink to={`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"}`} className="nav-link">
            <i
              className={`bi bi-${isBank ? "bank" : "person-fill-check"
                } text-white me-2`}
            ></i>
            {isBank ? `${roleId === 6 ? "Bank" : "Branch"}` : "Administration"}
          </NavLink>
        </li>
      ) : (
        ""
      )}
      {loginStatus ? (
        <>
        {/* Profile */}
          <li className={`${isBank ? "d-none" : ""}`}>
            <NavLink to="/profile" className="nav-link">
              <i className="bi bi-person-square text-white me-2"></i>
              Profile
            </NavLink>
          </li>
          {/* Logout */}
          <li>
            <span
              style={{ cursor: "pointer" }}
              className="nav-link"
              onClick={logOut}
            >
              <i className="bi bi-box-arrow-right text-white me-2"></i>
              Logout
            </span>
          </li>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default CommonNavLinks;
