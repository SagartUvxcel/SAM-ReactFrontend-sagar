import { NavLink } from "react-router-dom";

// Receiving validationDetails, onInputChange, onInputBlur as a props from organization/individual main form.
const CommonFormFields = ({
  resetValues,
  validationDetails,
  addressValues,
  onInputBlur,
  onInputChange,
}) => {
  const { emailValidationMessage, mobileValidationMessage } = validationDetails;
  const { addressValue, labelValue, textAreaVisibility } = addressValues;

  return (
    <>
      {/* Address Row 1 */}
      <div className="row addressRow1 mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">Address</div>
        <div className="col-lg-6 mb-lg-0 mb-2">
          <a
            href="/anyValue"
            id="address-modal-label"
            style={{ cursor: "pointer" }}
            className="address-label"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            {labelValue}
          </a>
          <textarea
            style={{ resize: "none" }}
            value={addressValue}
            readOnly
            className={`form-control ${textAreaVisibility}`}
            cols="30"
            rows="4"
          ></textarea>
        </div>
      </div>

      {/* Email */}
      <div className="row emailRow mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Email Address<span className="text-danger">*</span>
        </div>
        <div className="col-lg-2">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="email"
            type="email"
            className="form-control"
            placeholder="XXX@YYY.com"
            required
          />
          <span
            className={`pe-1 ${
              emailValidationMessage ? "text-danger" : "d-none"
            }`}
          >
            {emailValidationMessage}
          </span>
        </div>
      </div>
      {/* Contact */}
      <div className="row contactRow mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Contact Number
          {/* <span className="text-danger">*</span> */}
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onBlur={onInputBlur}
            name="landline_number"
            type="Number"
            placeholder="Landline Number (Optional)"
            className="form-control "
          />
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="mobile_number"
            type="Number"
            placeholder="Mobile Number"
            required
            className="form-control"
          />
          <span
            className={`pe-1 ${
              mobileValidationMessage ? "text-danger" : "d-none"
            }`}
          >
            {mobileValidationMessage}
          </span>

          <span className="form-text d-none"></span>
        </div>
      </div>
      {/* SAM T & C */}
      <div className="row register-links mt-3">
        <div className="offset-lg-2 col-lg-4">
          <NavLink to="/">SAM Terms and Conditions</NavLink>
        </div>
      </div>
      {/* Agree T & C */}
      <div className="row agreeTermsConditionsRow mt-3">
        <div className="col-lg-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="agreeTermsConditions"
            required
          />
          <label
            className="form-check-label ms-3"
            htmlFor="agreeTermsConditions"
          >
            I Agree to the Terms and Conditions
          </label>
        </div>
      </div>
      {/* Form submit or Cancel */}
      <div className="row submitCancelRow mt-4 mb-4 mb-md-0">
        <div className="offset-lg-2 col-lg-2 col-md-4 col-6">
          <button className="btn btn-primary text-white common-btn-font">
            <i className="me-1 bi bi-check-lg"></i>
            Submit
          </button>
        </div>
        <div className="col-lg-2 col-md-4 col-6">
          <button
            className="btn btn-secondary text-dark"
            onClick={(e) => {
              e.preventDefault();
              e.target.closest("form").reset();
              resetValues();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default CommonFormFields;
