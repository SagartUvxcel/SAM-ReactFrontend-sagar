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
                    <i className="bi bi-buildings-fill text-primary fs-1 white-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary text-end white-on-hover">
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
                    <i className="bi bi-person-fill text-primary fs-1 white-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">110</span>
                    <h5 className="text-primary text-end white-on-hover">
                      Users
                    </h5>
                  </div>
                </NavLink>
              </div>
              <div className="col-xl-3">
                <div className="card py-3  admin-top-cards">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-primary fs-1 white-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary text-end white-on-hover">
                      Properties
                    </h5>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="card py-3  admin-top-cards">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-primary fs-1 white-on-hover"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary text-end white-on-hover">
                      Properties
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
