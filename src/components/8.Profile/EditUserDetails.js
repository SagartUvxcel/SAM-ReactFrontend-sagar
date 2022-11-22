import React, { useState } from "react";
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

  const [allStates, setAllStates] = useState({
    isDisabled: false,
    editClassName: "editable-values",
    cancelUpdateBtnClassName: "d-none",
  });

  const { isDisabled, editClassName, cancelUpdateBtnClassName } = allStates;

  const editDetails = () => {
    setAllStates({
      ...allStates,
      isDisabled: true,
      editClassName: "",
      cancelUpdateBtnClassName: "",
    });
  };

  const cancelEditing = () => {
    setAllStates({
      ...allStates,
      isDisabled: false,
      editClassName: "editable-values",
      cancelUpdateBtnClassName: "d-none",
    });
  };

  return (
    <Layout>
      <section className="edit-details-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
              <div className="card h-100">
                <div className="card-body">
                  <div className="row gutters">
                    <div className="col-8">
                      <h6 className="mb-2 text-primary">Personal Details</h6>
                    </div>
                    <div className="col-4 text-end">
                      <i
                        onClick={editDetails}
                        className="bi bi-pencil-square"
                      ></i>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          name="first_name"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="firstName"
                          defaultValue={firstName}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="middleName">Middle Name</label>
                        <input
                          name="middle_name"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="middleName"
                          defaultValue={middleName}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          name="last_name"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="lastName"
                          defaultValue={lastName}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="eMail">Email</label>
                        <input
                          name="email"
                          type="email"
                          className={`form-control ${editClassName}`}
                          id="eMail"
                          defaultValue={email}
                          disabled={isDisabled}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="phone">Phone</label>
                        <input
                          name="mobile_number"
                          type="number"
                          className={`form-control ${editClassName}`}
                          id="phone"
                          defaultValue={phone}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="pan">PAN Number</label>
                        <input
                          type="text"
                          name="pan_number"
                          className={`form-control ${editClassName}`}
                          id="pan"
                          defaultValue={pan}
                          disabled={isDisabled}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="aadhaar">Aadhaar Number</label>
                        <input
                          name="aadhar_number"
                          type="number"
                          className={`form-control ${editClassName}`}
                          id="aadhaar"
                          defaultValue={aadhaar}
                          disabled={isDisabled}
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
                        <label htmlFor="Street">Street/Locality</label>
                        <input
                          name="address"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="Street"
                          defaultValue={street}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="ciTy">City</label>
                        <input
                          name="city"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="ciTy"
                          defaultValue={city}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="sTate">State</label>
                        <input
                          name="state"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="sTate"
                          defaultValue={state}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="zIp">Zip Code</label>
                        <input
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="zIp"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`row mt-4 ${cancelUpdateBtnClassName}`}
                    id="update-cancel"
                  >
                    <div className="col-12">
                      <div className="text-end">
                        <button
                          onClick={cancelEditing}
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
