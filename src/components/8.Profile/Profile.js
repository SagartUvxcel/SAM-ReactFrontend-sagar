import React from "react";
import Layout from "../1.CommonLayout/Layout";

const Profile = () => {
  return (
    <Layout>
      <section className="profile-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-11">
              <div className="row border p-xl-4 shadow">
                {/* Profile image */}
                <div className="col-xl-3">
                  <img src="profile.png" alt="Profile Pic" />
                </div>
                <div className="col-xl-9">
                  {/* Name & designation */}
                  <div className="row">
                    <div className="col-xl-12">
                      <span className="fw-bold fs-3 text-success">
                        John Butler
                      </span>
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
                      className="progress-bar bg-warning"
                      title="25%"
                      role="progressbar"
                      style={{ width: "75%" }}
                      aria-valuenow="25"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                    >
                      75%
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-5">
                <div className="col-xl-3 ps-xl-0">
                  <div className="border border-2 shadow profile-details-div p-xl-3">
                    <div className="row justify-content-center">
                      <div className="col-1">
                        <i className="bi bi-mortarboard-fill"></i>
                      </div>
                      <div className="col-11">
                        <small className="text-muted">Some details</small>
                        <br />
                        <small className="text-muted">Heading1: </small>
                        <small>Description1</small>
                        <br />
                        <small className="text-muted">Heading2: </small>
                        <small>Description2</small>
                        <br />
                        <small className="text-muted">Heading3: </small>
                        <small>Description3</small>
                        <br />
                        <small className="text-muted">Heading4: </small>
                        <small>Description4</small>
                        <br />
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-1">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div className="col-11">
                        <small className="text-muted">
                          Personal Information
                        </small>
                        <br />
                        <small className="text-muted">Birth Date: </small>
                        <small>March 17, 1989</small>
                        <br />
                        <small className="text-muted">Gender: </small>
                        <small>Male</small>
                        <br />
                        <small className="text-muted">Nationality: </small>
                        <small>Indian</small>
                        <br />
                        <small className="text-muted">Marital Status: </small>
                        <small>Married</small>
                        <br />
                        <small className="text-muted">DL Number: </small>
                        <small>HS0952363723</small>
                        <br />
                        <small className="text-muted">User Id: </small>
                        <small>ABCD28998</small>w
                        <br />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3">
                  <div className="border border-2 shadow profile-details-div p-xl-3">
                    <div className="row justify-content-center">
                      <div className="col-1">
                        <i className="bi bi-person-workspace"></i>
                      </div>
                      <div className="col-11">
                        <small className="">Other details</small>
                      </div>
                      <div className="col-1">
                        <i className="bi bi-circle-fill"></i>
                      </div>
                      <div className="col-11">
                        <small className="text-muted">Some details</small>
                        <br />
                        <small className="text-muted">detail 1 example</small>
                        <br />
                        <small className="text-muted">
                          detail 2 example Lorem ipsum dolor sit.
                        </small>
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-1">
                        <i className="bi bi-circle-fill"></i>
                      </div>
                      <div className="col-11">
                        <small className="text-muted">Some details</small>
                        <br />
                        <small className="text-muted">detail 1 example</small>
                        <br />
                        <small className="text-muted">
                          detail 2 example Lorem ipsum dolor sit.
                        </small>
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-1">
                        <i className="bi bi-circle-fill"></i>
                      </div>
                      <div className="col-11">
                        <small className="text-muted">Some details</small>
                        <br />
                        <small className="text-muted">detail 1 example</small>
                        <br />
                        <small className="text-muted">
                          detail 2 example Lorem ipsum dolor sit.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3">
                  <div className="border border-2 shadow profile-details-div p-xl-3">
                    <span className="fw-bolder">Some Heading</span>
                    <br />
                    <div className="row justify-content-center">
                      <div className="col-6 mt-3">
                        <div class="progress circled-div">
                          <div
                            class="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: "89%" }}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            +89%
                          </div>
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <span className="text-muted">
                          Lorem ipsum dolor sit:{" "}
                        </span>
                        <span>5</span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-warning text-dark">
                          text1
                        </span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-outline-warning text-dark">
                          text2
                        </span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-warning text-dark">
                          text3
                        </span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-outline-warning text-dark">
                          text4
                        </span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-warning text-dark">
                          text1
                        </span>
                      </div>
                      <div className="col-6 mt-2 text-center">
                        <span class="badge rounded-pill bg-outline-warning text-dark">
                          text2
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 pe-xl-0">
                  <div className="border border-2 shadow profile-details-div p-xl-3">
                    div1
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
