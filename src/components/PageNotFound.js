import React from "react";

const PageNotFound = () => {
  return (
    <section className="page-not-found-wrapper">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-xl-6">
            <h1 className="text-center fw-bolder">Page Not Found</h1>
            <div className="text-center">
              <button className="btn btn-home">
                Back to home <i className="bi bi-arrow-right ps-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;
