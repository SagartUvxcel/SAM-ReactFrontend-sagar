import React from "react";
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
                <div className="card justify-content-center d-flex flex-row align-items-center py-3">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-primary fs-1"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary">Properties</h5>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="card justify-content-center d-flex flex-row align-items-center py-3">
                  <span className="me-5">
                    <i className="bi bi-person-fill text-primary fs-1"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">110</span>
                    <h5 className="text-primary">Users</h5>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="card justify-content-center d-flex flex-row align-items-center py-3">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-primary fs-1"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary">Properties</h5>
                  </div>
                </div>
              </div>

              <div className="col-xl-3">
                <div className="card justify-content-center d-flex flex-row align-items-center py-3">
                  <span className="me-5">
                    <i className="bi bi-buildings-fill text-primary fs-1"></i>
                  </span>
                  <div>
                    <span className="admin-dashboard-count">180</span>
                    <h5 className="text-primary">Properties</h5>
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
