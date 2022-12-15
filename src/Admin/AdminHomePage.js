import React from "react";
import AdminSideBar from "./AdminSideBar";

const AdminHomePage = () => {
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <AdminSideBar />
        <div className="col-xl-10 col-md-9">
          <div className="mt-5 wrapper">
            <div className="container">
              <h1 className="text-center py-5">
                Home Page or Dashboard of Admin
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
