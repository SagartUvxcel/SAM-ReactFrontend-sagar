import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { rootTitle } from "../CommonFunctions";

const AccessDeniedPage = () => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const checkIsUserLoggedIn = () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
      setUserLoggedIn(true);
    } else {
      setUserLoggedIn(false);
    }
  };
  useEffect(() => {
    rootTitle.textContent = "ACCESS DENIED";
    checkIsUserLoggedIn();
  }, []);

  return (
    <section className="access-denied-wrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-7 col-lg-6 col-md-8 text-center">
            <h1 className="fw-bold text-danger">
              <i className="bi bi-slash-circle me-1"></i> Access Denied
            </h1>
            <span className="text-secondary">
              You currently does not have access to this page.
            </span>
            <div className="mt-md-3 mt-2">
              <NavLink to="/" className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-arrow-left pe-1"></i> Back to home
              </NavLink>
              <NavLink
                to="/login"
                className={`btn btn-sm btn-outline-secondary ${
                  userLoggedIn ? "d-none" : ""
                }`}
              >
                Back to Login <i className="bi bi-arrow-right ps-1"></i>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccessDeniedPage;
