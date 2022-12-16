import React from "react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

const AdminSideBar = () => {
  useEffect(() => {
    if (window.location.pathname !== "/admin") {
      document.querySelector(".admin-home-link").classList.remove("active");
    }
  });

  return (
    <div className="col-xl-2 col-md-3 admin-sidebar">
      <div className="py-3">
        <span className="offcanvas-header text-white">
          <h4 className="offcanvas-title" id="offcanvasExampleLabel">
            Admin Panel
          </h4>
        </span>
        <div className="offcanvas-body mt-5">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link admin-home-link" to="/admin">
                <span className="mx-2">
                  <i className="bi bi-house-fill text-dark"></i>
                </span>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/view-properties">
                <span className="mx-2">
                  <i className="bi bi-buildings-fill text-dark"></i>
                </span>
                Properties
              </NavLink>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                <i className="bi bi-person-fill text-dark mx-2"></i>Users
              </span>
            </li>
          </ul>
          <hr></hr>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
