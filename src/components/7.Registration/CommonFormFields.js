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
  handleFocus,
  handleClick,
  countryId,
}) => {
  const { emailValidationMessage, mobileValidationMessage, landlineNumberValidationMessage, landlineNumberValidationColor } = validationDetails;
  const { addressValue, labelValue, textAreaVisibility } = addressValues; 
  return (
    <>
      {/* Email */}
      <div className="row emailRow align-items-center">
        <div className="col-lg-4 mb-4 custom-class-form-div">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="email"
            id="email"
            onFocus={handleFocus}
            type="email"
            className="form-control custom-input"
            required
          />
          <label className="px-2" htmlFor="email" onClick={() => handleClick('email')} >Email <span className="text-danger">*</span> </label>
          <span
            className={`pe-1 ${emailValidationMessage ? "text-danger" : "d-none"
              }`}
          >
            {emailValidationMessage}
          </span>
        </div>
        <div className="col-lg-4  mb-4 ">
          <PhoneInput
            country={countryId}
            onBlur={(e) => onMobileNumberInputBlur(e)}
            onChange={onMobileNumberInputChange}
            onFocus={handleFocus}
          />
          <span
            className={`pe-1 ${mobileValidationMessage ? "text-danger" : "d-none"
              }`}
          >
            {mobileValidationMessage}
          </span>

          <span className="form-text d-none"></span>
        </div>
        <div className="col-lg-4 mb-4 custom-class-form-div">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="landline_number"
            id="landline_number"
            type="Number"
            onFocus={handleFocus}
            className={`form-control custom-input border-${landlineNumberValidationColor}`}
          />
          <label className="px-2" htmlFor="landline_number" onClick={() => handleClick('landline_number')} >Landline (optional)</label>
          <span
            className={`pe-1 ${landlineNumberValidationMessage ? "text-danger" : "d-none"
              }`}
          >
            {landlineNumberValidationMessage}
          </span>
        </div>
      </div>
      {/* Address Row 1 */}
      <div className="row addressRow1 align-items-center">
        <div className="col-lg-1 col-md-2 pe-md-0 mb-4">
          Address<span className="text-danger fw-bold">*</span>
        </div>
        <div className="col-lg-8  mb-4 custom-class-form-div">
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

      {/* SAM T & C */}
      <div className="row register-links mt-3 align-items-center">
        <div className=" col-lg-4">
          <NavLink to="/register">SAM Terms and Conditions</NavLink>
        </div>
      </div>
      {/* Agree T & C */}
      <div className="row agreeTermsConditionsRow mt-3 align-items-center">
        <div className="col-lg-8">
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
      <div className="row submitCancelRow mt-5 mb-4 mb-md-0 align-items-center">
        <div className=" col-lg-2 col-md-4 col-6 ">
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
