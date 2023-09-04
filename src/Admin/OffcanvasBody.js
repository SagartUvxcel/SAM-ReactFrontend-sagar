import React from "react";
import { NavLink } from "react-router-dom";

const OffcanvasBody = ({ canvasNumber, propertiesLinkDisabled, isBank }) => {
  return (
    <div className={`offcanvas-body ${canvasNumber ? "pt-0" : ""}`}>
      <ul className="navbar-nav">
        <hr className="text-white" />
        <li className="nav-item">
          <NavLink
            className="nav-link admin-home-link sidebar-link"
            to={`${isBank ? "/bank" : "/admin"}`}
          >
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
            data-bs-target={`${
              canvasNumber ? "#propertyCollapse2" : "#propertyCollapse"
            }`}
          >
            <span className="mx-2">
              <i className="bi bi-building-fill text-light"></i>
            </span>
            Property
            <i className="bi bi-chevron-down ms-1"></i>
          </span>

          <div
            className="collapse propertyCollapse"
            id={`${canvasNumber ? "propertyCollapse2" : "propertyCollapse"}`}
          >
            <div className="card card-body bg-primary">
              <ul className="list-unstyled">
                <li className="nav-item">
                  {propertiesLinkDisabled.propertiesLinkDisabled ? (
                    <span
                      style={{ cursor: "pointer" }}
                      className="nav-link sidebar-link"
                      onClick={propertiesLinkDisabled.backToAllPropertiesPage}
                    >
                      <i className="bi bi-buildings text-light me-2"></i>
                      Properties
                    </span>
                  ) : (
                    <NavLink
                      className="nav-link sidebar-link"
                      to={`${isBank ? "/bank" : "/admin"}/property/properties`}
                    >
                      <i className="bi bi-buildings text-light me-2"></i>
                      Properties
                    </NavLink>
                  )}
                </li>

                <li className="nav-item">
                  <NavLink
                    className="nav-link sidebar-link"
                    to={`${isBank ? "/bank" : "/admin"}/property/add-property`}
                  >
                    <i className="bi bi-plus-circle text-light me-2"></i>
                    Add
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link sidebar-link"
                    to={`${
                      isBank ? "/bank" : "/admin"
                    }/property/upload-properties`}
                  >
                    <i className="bi bi-upload me-2 text-light"></i>Bulk Upload
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </li>
        {!isBank ? (
          <li className="nav-item">
            <span
              className="nav-link"
              data-bs-toggle="collapse"
              data-bs-target={`${
                canvasNumber ? "#usersCollapse2" : "#usersCollapse"
              }`}
            >
              <span className="mx-2">
                <i className="bi bi-person-fill text-light"></i>
              </span>
              Users
              <i className="bi bi-chevron-down ms-1"></i>
            </span>

            <div
              className="collapse usersCollapse"
              id={`${canvasNumber ? "usersCollapse2" : "usersCollapse"}`}
            >
              <div className="card card-body bg-primary">
                <ul className="list-unstyled">
                  <li className="nav-item">
                    <NavLink
                      className="nav-link sidebar-link"
                      to="/admin/users/individual-users"
                    >
                      <i className="bi bi-person-circle text-light me-2"></i>
                      Individual
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className="nav-link sidebar-link"
                      to="/admin/users/organizational-users"
                    >
                      <i className="bi bi-laptop me-2 text-light"></i>
                      Organizational
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        ) : (
          <></>
        )}
        <hr className="text-white" />
      </ul>
    </div>
  );
};

export default OffcanvasBody;
