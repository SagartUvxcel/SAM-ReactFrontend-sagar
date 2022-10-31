import React from "react";
import CommonFormFields from "./CommonFormFields";

const OrganizationForm = ({
  formData,
  validationDetails,
  onInputChange,
  onInputBlur,
}) => {
  const {
    emailValidationColor,
    landlineValidationColor,
    mobileValidationColor,
  } = validationDetails;

  const onOrganizationFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // alert("This is the Organization's Form");
    if (
      emailValidationColor === "danger" ||
      landlineValidationColor === "danger" ||
      mobileValidationColor === "danger"
    ) {
      alert("form is not Valid");
    } else {
      alert("Form is valid");
    }
  };

  return (
    <form
      id="organizationForm"
      onSubmit={onOrganizationFormSubmit}
      action=""
      className="row OrganizationForm"
    >
      <div className="col-lg-12 mt-3">
        <div className="row organization-type-row">
          <div className="col-lg-2 mb-lg-0 mb-2">Organization Type</div>
          <div className="col-lg-2">
            <select
              className="form-select"
              aria-label="Default select example"
              required
            >
              <option value="">Select Type</option>
              <option value="Proprietor">Proprietor</option>
              <option value="LLP">LLP</option>
              <option value="Partnership/Joint Venture">
                Partnership/Joint Venture
              </option>
              <option value="Private Limited">Private Limited</option>
              <option value="Limited">Limited</option>
            </select>
          </div>
        </div>
        {/* Organization Name & GST & Type */}
        <div className="row nameGstRow  mt-lg-3 mt-2">
          <div className="col-lg-2 mb-lg-0 mb-2">Organization Name</div>
          <div className="col-lg-2 mb-lg-0 mb-2">
            <input
              type="text"
              placeholder="Company Name"
              className="form-control"
              required
            />
          </div>
          <div className="col-lg-2 mb-lg-0 mb-2">GST Number</div>
          <div className="col-lg-2">
            <input
              type="text"
              placeholder="GST Number"
              className="form-control"
              required
            />
          </div>
        </div>

        {/* TAN & CIN */}
        <div className="row AadhaarPanRow  mt-lg-3 mt-2">
          <div className="col-lg-2 mb-lg-0 mb-2">TAN Number</div>
          <div className="col-lg-2">
            <input
              type="text"
              placeholder="TAN Number"
              className="form-control"
              required
            />
          </div>
          <div className="col-lg-2 my-lg-0 my-2">CIN Number</div>
          <div className="col-lg-2">
            <input
              type="text"
              placeholder="CIN Number"
              className="form-control"
              required
            />
          </div>
        </div>
        <CommonFormFields
          validationDetails={validationDetails}
          onInputChange={onInputChange}
          onInputBlur={onInputBlur}
        />
      </div>
    </form>
  );
};

export default OrganizationForm;
