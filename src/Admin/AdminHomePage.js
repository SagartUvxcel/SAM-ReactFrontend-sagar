import React from "react";
import { NavLink } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";

const AdminHomePage = () => {
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <AdminSideBar />
        <div className="col-xl-10 col-md-9">
          <div className="container-fluid wrapper admin-home-wrapper">
            <div className="row">
              <div className="col-xl-3">
                <NavLink
                  to="/admin/view-properties"
                  className="card py-3 admin-top-cards"
                >
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-white fs-1 blue-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-white text-end blue-on-hover fw-bold">
                      Properties
                    </h5>
                  </div>
                </NavLink>
              </div>
              <div className="col-xl-3">
                <NavLink
                  to="/admin/users"
                  className="card py-3 admin-top-cards"
                >
                  <span className="me-5">
                    <i className="bi bi-person-fill text-white fs-1 blue-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">110</span>
                    <h5 className="text-white text-end blue-on-hover fw-bold">
                      Users
                    </h5>
                  </div>
                </NavLink>
              </div>
              <div className="col-xl-3">
                <div className="card py-3  admin-top-cards">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-white fs-1 blue-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-white text-end blue-on-hover fw-bold">
                      Properties
                    </h5>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <NavLink
                  to="/admin/users"
                  className="card py-3 admin-top-cards"
                >
                  <span className="me-5">
                    <i className="bi bi-person-fill text-white fs-1 blue-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">110</span>
                    <h5 className="text-white text-end blue-on-hover fw-bold">
                      Users
                    </h5>
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
