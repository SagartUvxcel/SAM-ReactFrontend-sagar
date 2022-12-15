import React from "react";
import { Link, NavLink } from "react-router-dom";

const AdminSideBar = () => {
  return (
    <div className="col-xl-2 col-md-3 bg-info">
      <div className="admin-sidebar py-3">
        <Link to="/" className="offcanvas-header nav-link">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            Admin Panel
          </h5>
        </Link>
        <div className="offcanvas-body mt-5">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/view-properties">
                <span className="mx-2">
                  <i className="bi bi-buildings-fill"></i>
                </span>
                All Properties
              </NavLink>
            </li>
          </ul>
          <hr></hr>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
