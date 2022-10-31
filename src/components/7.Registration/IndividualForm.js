import React from "react";
import CommonFormFields from "./CommonFormFields";

const IndividualForm = ({
  formData,
  validationDetails,
  onInputChange,
  onInputBlur,
}) => {
  const {
    aadhaarValidationMessage,
    panValidationMessage,
    aadhaarValidationColor,
    panValidationColor,
    emailValidationColor,
    landlineValidationColor,
    mobileValidationColor,
  } = validationDetails;

  const onIndividualFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // alert("This is the Individual's Form");
    if (
      aadhaarValidationColor === "danger" ||
      panValidationColor === "danger" ||
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
      id="individualForm"
      onSubmit={onIndividualFormSubmit}
      action=""
      className="row IndividualForm"
    >
      <div className="col-lg-12 mt-3">
        {/* Full Name */}
        <div className="row fullNameRow">
          <div className="col-lg-2 mb-lg-0 mb-2">Full Name</div>
          <div className="col-lg-2 mb-lg-0 mb-2">
            <input
              onChange={onInputChange}
              name="firstName"
              type="text"
              placeholder="First Name"
              className="form-control"
              required
            />
          </div>
          <div className="col-lg-2 mb-lg-0 mb-2">
            <input
              onChange={onInputChange}
              name="middleName"
              type="text"
              placeholder="Middle Name"
              className="form-control"
              required
            />
          </div>
          <div className="col-lg-2">
            <input
              name="lastName"
              onChange={onInputChange}
              type="text"
              placeholder="Last Name"
              className="form-control"
              required
            />
          </div>
        </div>
        {/* Aadhaar Pan */}
        <div className="row aadhaarPanRow mt-lg-3 mt-4">
          <div className="col-lg-2 mb-lg-0 mb-2">Aadhaar Number</div>
          <div className="col-lg-2 mb-lg-0 mb-3">
            <input
              onChange={onInputChange}
              name="aadhaarNumber"
              type="Number"
              placeholder="•••• •••• •••• ••••"
              required
              className={`form-control border-${aadhaarValidationColor}`}
            />
            {aadhaarValidationMessage ? (
              <span className={`pe-1 text-${aadhaarValidationColor}`}>
                {aadhaarValidationMessage}
              </span>
            ) : (
              <span className="d-none"></span>
            )}
            <span className="form-text">
              <small>(Please enter 12 digit aadhar number)</small>
            </span>
          </div>
          <div className="col-lg-2 mb-lg-0 mb-2">PAN Number</div>
          <div className="col-lg-2 mb-lg-0">
            <input
              onChange={onInputChange}
              name="panNumber"
              type="text"
              placeholder="PAN Number"
              required
              className={`form-control text-uppercase border-${panValidationColor}`}
            />
            {panValidationMessage ? (
              <span className={`pe-1 text-${panValidationColor}`}>
                {panValidationMessage}
              </span>
            ) : (
              <span className="d-none"></span>
            )}
            <span className="form-text">
              <small>(Please refer ex:ERTYG1235E pan number)</small>
            </span>
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

export default IndividualForm;
