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
    <>
      <div className="col-xl-2 col-md-3 admin-sidebar d-md-block d-none">
        <div className="py-3">
          <span className="offcanvas-header text-white">
            <h4 className="offcanvas-title ps-4" id="offcanvasExampleLabel">
              Admin
            </h4>
          </span>

          <div className="offcanvas-body mt-4">
            <ul className="navbar-nav">
              <hr className="text-white" />
              <li className="nav-item">
                <NavLink className="nav-link admin-home-link" to="/admin">
                  <span className="mx-2">
                    <i className="bi bi-house-fill text-secondary"></i>
                  </span>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/view-properties">
                  <span className="mx-2">
                    <i className="bi bi-buildings-fill text-secondary"></i>
                  </span>
                  Properties
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/admin/users" className="nav-link">
                  <span className="mx-2">
                    <i className="bi bi-person-fill text-secondary"></i>
                  </span>
                  Users
                </NavLink>
              </li>
              <hr className="text-white" />
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/upload-properties">
                  <span className="mx-2">
                    <i className="bi bi-upload text-secondary"></i>
                  </span>
                  Upload Properties
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
