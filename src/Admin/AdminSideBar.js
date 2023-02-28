import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const AdminSideBar = () => {
  const [toggleClasses, setToggleClasses] = useState({
    sideBarOnSmallScreen: "d-none",
    icon: "bi-list",
  });

  const { sideBarOnSmallScreen, icon } = toggleClasses;

  // Close and open sidebar on small screen.
  const toggleSideBarVisibility = () => {
    if (sideBarOnSmallScreen === "") {
      setToggleClasses({ sideBarOnSmallScreen: "d-none", icon: "bi-list" });
    } else {
      setToggleClasses({ sideBarOnSmallScreen: "", icon: "bi-x-lg" });
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    // Remove active class of link 'Dashboard' if we switch to other link.
    if (path !== "/admin") {
      document.querySelector(".admin-home-link").classList.remove("active");
    }
    // collapse of property section on sidebar will remain open until we are on 'admin/property' path.
    if (path.includes("/admin/property")) {
      document.getElementById("propertyCollapse").classList.add("show");
    }
  });

  return (
    <>
      <button
        onClick={toggleSideBarVisibility}
        className="btn btn-primary sidebar-toggle-btn-sm d-block d-md-none"
      >
        <i className={`bi ${icon}`}></i>
      </button>
      <div
        className={`col-xl-2 col-md-4 admin-sidebar d-md-block ${sideBarOnSmallScreen}`}
      >
        <div className="py-3">
          <span className="offcanvas-header text-white">
            <h4 className="offcanvas-title ps-4" id="offcanvasExampleLabel">
              Admin
            </h4>
          </span>

          <div className="offcanvas-body mt-md-4">
            <ul className="navbar-nav">
              <hr className="text-white" />
              <li className="nav-item">
                <NavLink className="nav-link admin-home-link" to="/admin">
                  <span className="mx-2">
                    <i className="bi bi-house-fill text-light"></i>
                  </span>
                  Dashboard
                </NavLink>
              </li>

              <li className="nav-item">
                <span
                  className="nav-link"
                  data-bs-toggle="collapse"
                  data-bs-target="#propertyCollapse"
                >
                  <span className="mx-2">
                    <i className="bi bi-building-fill text-light"></i>
                  </span>
                  Property
                  <i className="bi bi-chevron-down ms-1"></i>
                </span>

                <div className="collapse" id="propertyCollapse">
                  <div className="card card-body bg-primary">
                    <ul className="list-unstyled">
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="/admin/property/properties"
                        >
                          <i className="bi bi-buildings text-light me-2"></i>
                          Properties
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="/admin/property/add-property"
                        >
                          <i className="bi bi-plus-circle text-light me-2"></i>
                          Add
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="/admin/property/upload-properties"
                        >
                          <i className="bi bi-upload me-2 text-light"></i>Upload
                          Properties
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="nav-item">
                <NavLink to="/admin/users" className="nav-link">
                  <span className="mx-2">
                    <i className="bi bi-person-fill text-light"></i>
                  </span>
                  Users
                </NavLink>
              </li>
              <hr className="text-white" />
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
