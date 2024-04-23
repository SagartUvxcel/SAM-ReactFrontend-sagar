import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { rootTitle } from "../CommonFunctions";

const PageNotFound = () => {
  useEffect(() => {
    rootTitle.textContent = "PAGE NOT FOUND";
  }, []);

  return (
    <section className="page-not-found-wrapper">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-xl-6">
            <h1 className="text-center fw-bolder">Page Not Found</h1>
            <div className="text-center">
              <NavLink to="/" className="btn btn-home mt-md-3 mt-2">
                Back to home <i className="bi bi-arrow-right ps-2"></i>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound; 
