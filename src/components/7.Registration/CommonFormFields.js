import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

// Receiving validationDetails, onInputChange, onInputBlur as a props from organization/individual main form.
const CommonFormFields = ({
  validationDetails,
  onInputChange,
  onInputBlur,
}) => {
  const {
    emailValidationMessage,
    landlineValidationMessage,
    mobileValidationMessage,
    zipCodeValidationMessage,
    emailValidationColor,
    landlineValidationColor,
    mobileValidationColor,
    zipCodeValidationColor,
  } = validationDetails;

  const [states, setStates] = useState([]);
  const getAllSates = async () => {
    const allStates = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-state`
    );
    setStates(allStates.data);
  };

  useEffect(() => {
    getAllSates();
  }, []);

  return (
    <>
      {/* Address Row 1 */}
      <div className="row addressRow1 mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">Address</div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            name="houseNumber"
            type="text"
            className="form-control"
            placeholder="Block-House No Street"
            required
          />
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            name="locality"
            type="text"
            className="form-control"
            placeholder="Locality, Area"
            required
          />
        </div>
      </div>
      {/* Address Row 2 */}
      <div className="row addressRow2 mt-lg-3 mt-md-0">
        <div className="offset-lg-2 col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            name="city"
            type="text"
            className="form-control"
            placeholder="City"
            required
          />
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <select
            onChange={onInputChange}
            name="state"
            type="text"
            className="form-select"
            placeholder="State"
            required
          >
            <option value="" style={{ color: "grey" }}>
              State
            </option>
            {states
              ? states.map((state, Index) => {
                  return (
                    <option key={Index} value={state.state_id}>
                      {state.state_name}
                    </option>
                  );
                })
              : ""}
          </select>
        </div>
        <div className="col-lg-2">
          <input
            type="text"
            onChange={onInputChange}
            // onBlur={onInputBlur}
            placeholder="Zipcode"
            name="zipCode"
            className={`form-control border-${zipCodeValidationColor}`}
            required
          ></input>
          {zipCodeValidationMessage ? (
            <span className={`pe-1 text-${zipCodeValidationColor}`}>
              {zipCodeValidationMessage}
            </span>
          ) : (
            <span className="d-none"></span>
          )}
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
            name="emailAddress"
            type="email"
            className={`form-control border-${emailValidationColor}`}
            placeholder="XXX@YYY.com"
            required
          />
          {emailValidationMessage ? (
            <span className={`pe-1 text-${emailValidationColor}`}>
              {emailValidationMessage}
            </span>
          ) : (
            <span className="d-none"></span>
          )}
          <span className="form-text d-none"></span>
        </div>
      </div>
      {/* Contact */}
      <div className="row contactRow mt-lg-3 mt-4">
        <div className="col-lg-2 mb-lg-0 mb-2">
          Contact Number<span className="text-danger">*</span>
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            name="landlineNumber"
            type="Number"
            placeholder="Landline Number"
            required
            className={`form-control border-${landlineValidationColor}`}
          />
          {landlineValidationMessage ? (
            <span className={`pe-1 text-${landlineValidationColor}`}>
              {landlineValidationMessage}
            </span>
          ) : (
            <span className="d-none"></span>
          )}
        </div>
        <div className="col-lg-2 mb-lg-0 mb-2">
          <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="mobileNumber"
            type="Number"
            placeholder="Mobile Number"
            required
            className={`form-control border-${mobileValidationColor}`}
          />
          {mobileValidationMessage ? (
            <span className={`pe-1 text-${mobileValidationColor}`}>
              {mobileValidationMessage}
            </span>
          ) : (
            <span className="d-none"></span>
          )}
          <span className="form-text d-none"></span>
        </div>
      </div>
      {/* SAM T & C */}
      <div className="row SamTermsConditionsRow mt-3">
        <div className="offset-lg-2 col-lg-4">
          <a href="/">SAM Terms and Conditions</a>
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
      <div className="row submitCancelRow mt-4">
        <div className="offset-lg-2 col-lg-2 col-md-4 col-6">
          <button className="btn btn-primary text-white">
            <FaCheck className="me-1" />
            Submit
          </button>
        </div>
        <div className="col-lg-2 col-md-4 col-6">
          <button className="btn btn-secondary text-dark">Cancel</button>
        </div>
      </div>
    </>
  );
};

export default CommonFormFields;
