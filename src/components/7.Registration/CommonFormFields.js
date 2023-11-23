import { NavLink } from "react-router-dom";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

// Receiving validationDetails, onInputChange, onInputBlur as a props from organization/individual main form.
const CommonFormFields = ({
  resetValues,
  validationDetails,
  addressValues,
  onInputBlur,
  onInputChange,
  loading,
  onMobileNumberInputBlur,
  onMobileNumberInputChange,
}) => {
  const { emailValidationMessage, mobileValidationMessage,landlineNumberValidationMessage, landlineNumberValidationColor } = validationDetails;
  const { addressValue, labelValue, textAreaVisibility } = addressValues;

  return (
    <>
      {/* Address Row 1 */}
      <div className="row addressRow1 mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Address<span className="text-danger fw-bold">*</span>
        </div>
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
            className={`form-control ${textAreaVisibility} mt-2`}
            cols="30"
            rows="4"
          ></textarea>
        </div>
      </div>

      {/* Email */}
      <div className="row emailRow mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Email Address<span className="text-danger fw-bold">*</span>
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
            className={`pe-1 ${emailValidationMessage ? "text-danger" : "d-none"
              }`}
          >
            {emailValidationMessage}
          </span>
        </div>
      </div>
      {/* Contact */}
      <div className="row contactRow mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Landline<span className="ps-1 text-muted">(optional)</span>
          {/* <span className="text-danger">*</span> */}
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="landline_number"
            type="Number"
            placeholder="Landline"
            className={`form-control border-${landlineNumberValidationColor}`}
          />
           <span
            className={`pe-1 ${landlineNumberValidationMessage ? "text-danger" : "d-none"
              }`}
          >
            {landlineNumberValidationMessage}
          </span>
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          Mobile Number<span className="text-danger fw-bold">*</span>
        </div>
        <div className="col-lg-3 mb-lg-0 mb-2">
          {/* <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="mobile_number"
            type="Number"
            placeholder="Mobile Number"
            required
            className="form-control"
          /> */}

          <PhoneInput
            country={"in"}
            // value={phoneNumber}
            onBlur={(e) => onMobileNumberInputBlur(e)}
            onChange={onMobileNumberInputChange}
          />

          <span
            className={`pe-1 ${mobileValidationMessage ? "text-danger" : "d-none"
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
          <NavLink to="/register">SAM Terms and Conditions</NavLink>
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
          <button
            className="btn btn-primary text-white common-btn-font"
            style={{ width: "100px" }}
            disabled={loading ? true : false}
          >
            {loading ? (
              <>
                <span
                  className="spinner-grow spinner-grow-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              </>
            ) : (
              <>
                <i className="me-1 bi bi-check-lg"></i>Submit
              </>
            )}
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
