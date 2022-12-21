import React from "react";
import { NavLink } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import Layout from "../components/1.CommonLayout/Layout";

const AdminHomePage = () => {
  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh">
          <AdminSideBar />
          <div className="col-xl-10 col-md-9">
            <div className="container-fluid wrapper admin-home-wrapper">
              <div className="row">
                <div className="col-xl-3 col-lg-4 col-md-6">
                  <NavLink
                    to="/admin/view-properties"
                    className="card py-3 admin-top-cards"
                  >
                    <span className="me-xl-5 me-md-4">
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
                <div className="col-xl-3 col-lg-4 col-md-6 mt-4 mt-md-0">
                  <NavLink
                    to="/admin/users"
                    className="card py-3 admin-top-cards"
                  >
                    <span className="me-xl-5 me-md-4">
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
                <div className="col-xl-3 col-lg-4 col-md-6 mt-4 mt-lg-0">
                  <div className="card py-3  admin-top-cards">
                    <span className="me-xl-5 me-md-4">
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

                <div className="col-xl-3 col-lg-4 col-md-6 mt-4 mt-xl-0">
                  <NavLink
                    to="/admin/users"
                    className="card py-3 admin-top-cards"
                  >
                    <span className="me-xl-5 me-md-4">
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
    </Layout>
  );
};

export default AdminHomePage;
