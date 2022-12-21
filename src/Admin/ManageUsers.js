import React from "react";
import Layout from "../components/1.CommonLayout/Layout";
import AdminSideBar from "./AdminSideBar";
import users from "./users.json";

const ManageUsers = () => {
  return (
    <Layout>
      <div className="container-fluid admin-users-wrapper section-padding">
        <div className="row min-100vh">
          <AdminSideBar />
          <div className="col-xl-10 col-md-9 wrapper">
            <h1 className="text-center">Users</h1>
            <div className="table-wrapper">
              <table className="table table-bordered table-dark table-striped text-center">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, Index) => {
                    return (
                      <tr key={Index}>
                        <td>{Index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.company.name}</td>
                        <td>
                          <li className="nav-item dropdown list-unstyled">
                            <span
                              className="nav-link dropdown-toggle"
                              id="navbarDropdown"
                              role="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Select
                            </span>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="navbarDropdown"
                            >
                              <span className="dropdown-item">
                                <i className="bi bi-eye pe-1"></i> View
                              </span>

                              <span className="dropdown-item">
                                <i className="bi bi-pencil pe-1"></i> Edit
                              </span>

                              <span className="dropdown-item">
                                <i className="bi bi-trash pe-1"></i> Delete
                              </span>
                            </ul>
                          </li>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageUsers;
