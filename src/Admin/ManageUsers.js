import React from "react";
import AdminSideBar from "./AdminSideBar";

const ManageUsers = () => {
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <AdminSideBar />
        <div className="col-xl-10 col-md-9 wrapper">
          <h1 className="text-center">Manage Users</h1>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
