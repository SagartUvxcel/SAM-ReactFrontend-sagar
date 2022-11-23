import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const EditOrganizationDetails = () => {
  const company_name = "uvXcel";
  const organization_type = "Private Limited";
  const gst_number = "06BZASM6385P6Z2";
  const email = "arvinds@uvxcel.com";
  const phone = "9897868789";
  const tan_number = "DCOU55465C";
  const cin_number = "U12345DL2020PLC067876";
  const street = "Katraj Kondhawa Road, Katraj";
  const city = "Pune";
  const state = "Maharashtra";
  const zip = "411015";

  const goTo = useNavigate();

  const [allStates, setAllStates] = useState({
    isReadOnly: true,
    isDisabled: false,
    editClassName: "editable-values",
    cancelUpdateBtnClassName: "d-none",
    defaultStateClassName: "",
    selectStateClassName: "d-none",
  });

  const {
    isReadOnly,
    isDisabled,
    editClassName,
    cancelUpdateBtnClassName,
    defaultStateClassName,
    selectStateClassName,
  } = allStates;

  const editDetails = () => {
    setAllStates({
      ...allStates,
      isReadOnly: false,
      isDisabled: true,
      editClassName: "",
      cancelUpdateBtnClassName: "",
      defaultStateClassName: "d-none",
      selectStateClassName: "",
    });
  };

  const cancelEditing = () => {
    window.location.reload();
    // setAllStates({
    //   ...allStates,
    //   isReadOnly: true,
    //   isDisabled: false,
    //   editClassName: "editable-values",
    //   cancelUpdateBtnClassName: "d-none",
    //   defaultStateClassName: "",
    //   selectStateClassName: "d-none",
    // });
  };

  const updateDetails = (e) => {
    e.preventDefault();
    toast.success("Details Updated Successfully");
    setTimeout(() => {
      goTo("/profile");
    }, 3000);
  };

  return (
    <Layout>
      <section className="edit-details-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
              <form onSubmit={updateDetails} className="card h-100">
                <div className="card-body">
                  <div className="row gutters">
                    <div className="col-8">
                      <h6 className="mb-2 text-primary">
                        Organization Details
                      </h6>
                    </div>
                    <div className="col-4 text-end">
                      <i
                        onClick={editDetails}
                        className="bi bi-pencil-square"
                      ></i>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="organization_type">
                          Organization Type
                        </label>
                        <input
                          name="organization_type"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="organization_type"
                          defaultValue={organization_type}
                          readOnly={isReadOnly}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="company_name">Company Name</label>
                        <input
                          name="company_name"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="company_name"
                          defaultValue={company_name}
                          readOnly={isReadOnly}
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
                          readOnly
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
                          disabled={isDisabled}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="gst_number">GST Number</label>
                        <input
                          name="gst_number"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="gst_number"
                          defaultValue={gst_number}
                          disabled={isDisabled}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="tan_number">TAN Number</label>
                        <input
                          type="text"
                          name="tan_number"
                          className={`form-control ${editClassName}`}
                          id="tan_number"
                          defaultValue={tan_number}
                          disabled={isDisabled}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="cin_number">CIN Number</label>
                        <input
                          name="cin_number"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="cin_number"
                          defaultValue={cin_number}
                          disabled={isDisabled}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <h6 className="mt-3 mb-2 text-primary">
                        Organization Address
                      </h6>
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
                          readOnly={isReadOnly}
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
                          readOnly={isReadOnly}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div
                        className={`form-group mb-3 ${defaultStateClassName}`}
                      >
                        <label htmlFor="sTate1">State</label>
                        <input
                          className={`form-control ${editClassName}`}
                          id="sTate1"
                          defaultValue={state}
                          readOnly
                        />
                      </div>
                      <div
                        className={`form-group mb-3 ${selectStateClassName}`}
                      >
                        <label htmlFor="sTate">State</label>
                        <select name="state" id="sTate" className="form-select">
                          <option defaultValue={state}>{state}</option>
                          <option value="Goa">Goa</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujrat">Gujrat</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="zIp">Zip Code</label>
                        <input
                          name="zip"
                          type="number"
                          className={`form-control ${editClassName}`}
                          id="zIp"
                          defaultValue={zip}
                          readOnly={isReadOnly}
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
                          className="btn btn-secondary me-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
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
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EditOrganizationDetails;
