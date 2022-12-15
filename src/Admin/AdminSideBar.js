import React from "react";
import { Link, NavLink } from "react-router-dom";

const AdminSideBar = () => {
  return (
    <div className="col-xl-2 col-md-3 admin-sidebar">
      <div className="py-3">
        <Link
          to="/admin/home"
          className="offcanvas-header text-decoration-none text-white"
        >
          <h4 className="offcanvas-title" id="offcanvasExampleLabel">
            Admin Panel
          </h4>
        </Link>
        <div className="offcanvas-body mt-5">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/view-properties">
                <span className="mx-2">
                  <i className="bi bi-buildings-fill text-dark"></i>
                </span>
                All Properties
              </NavLink>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                <i className="bi bi-box-arrow-right text-dark mx-2"></i>Logout
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
