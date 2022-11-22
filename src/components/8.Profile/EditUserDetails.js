import React from "react";
import Layout from "../1.CommonLayout/Layout";

const EditUserDetails = () => {
  const firstName = "Arvind";
  const middleName = "Rahul";
  const lastName = "Sawant";
  const email = "arvinds@uvxcel.com";
  const phone = "9897868789";
  const pan = "DCOUU5465C";
  const aadhaar = "898767567564";
  const street = "Katraj Kondhawa Road, Katraj";
  const city = "Pune";
  const state = "Maharashtra";
  const zip = "411015";
  return (
    <Layout>
      <section className="profile-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
              <div className="card h-100">
                <div className="card-body">
                  <div className="row gutters">
                    <div className="col-12">
                      <h6 className="mb-2 text-primary">Personal Details</h6>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="firstName">First Name</label>
                        <input
                          name="first_name"
                          type="text"
                          className="form-control"
                          id="firstName"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="middleName">Middle Name</label>
                        <input
                          name="middle_name"
                          type="text"
                          className="form-control"
                          id="middleName"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="lastName">Last Name</label>
                        <input
                          name="last_name"
                          type="text"
                          className="form-control"
                          id="lastName"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="eMail">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="eMail"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="phone">Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="website">PAN Number</label>
                        <input
                          type="url"
                          className="form-control"
                          id="website"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="website">Aadhaar Number</label>
                        <input
                          type="url"
                          className="form-control"
                          id="website"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <h6 className="mt-3 mb-2 text-primary">Address</h6>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="Street">Street/Locality</label>
                        <input
                          type="name"
                          className="form-control"
                          id="Street"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="ciTy">City</label>
                        <input type="name" className="form-control" id="ciTy" />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="sTate">State</label>
                        <input
                          type="text"
                          className="form-control"
                          id="sTate"
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label for="zIp">Zip Code</label>
                        <input type="text" className="form-control" id="zIp" />
                      </div>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="text-end">
                        <button
                          type="button"
                          id="submit"
                          name="submit"
                          className="btn btn-secondary me-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          id="submit"
                          name="submit"
                          className="btn btn-primary"
                        >
                          Update
                        </button>
                      </div>
                    </div>
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

export default EditUserDetails;
