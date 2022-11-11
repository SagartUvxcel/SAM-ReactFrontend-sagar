import React from "react";
import Layout from "../1.CommonLayout/Layout";

const Profile = () => {
  return (
    <Layout>
      <section className="profile-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-11">
              <div className="row border p-xl-3">
                {/* Profile image */}
                <div className="col-xl-3">
                  <img src="profile.png" alt="Profile Pic" />
                </div>
                <div className="col-xl-9">
                  {/* Name & designation */}
                  <div className="row">
                    <div className="col-xl-12">
                      <span className="fw-bold fs-3">John Butler</span>
                      <br />
                      <span className="text-muted">
                        Xyz Designation of user
                      </span>
                    </div>
                  </div>
                  {/* Other details */}
                  <div className="row mt-xl-4">
                    <div className="col-xl-4">
                      <p className="text-muted">About</p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Nam corporis eos architecto, ducimus, consectetur
                      </p>
                    </div>
                    <div className="offset-xl-1 col-xl-3">
                      <div>
                        <p className="text-muted">Some Heading</p>
                        <p>Lorem ipsum dolor sit.</p>
                      </div>
                      <div className="mt-5">
                        <p className="text-muted">Some Heading</p>
                        <p>Lorem ipsum dolor sit.</p>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div>
                        <p className="text-muted">Some Heading</p>
                        <p>Lorem ipsum dolor sit.</p>
                      </div>
                      <div className="mt-5">
                        <p className="text-muted">Some Heading</p>
                        <p>Lorem ipsum dolor sit.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <p className="text-muted">
                    some text Lorem ipsum dolor sit amet.
                  </p>

                  <div className="progress mt-4">
                    <div
                      className="progress-bar bg-success"
                      title="25%"
                      role="progressbar"
                      style={{ width: "75%" }}
                      aria-valuenow="25"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                    >75%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
