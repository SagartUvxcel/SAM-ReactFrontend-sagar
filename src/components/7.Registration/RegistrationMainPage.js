import React, { useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import CommonFormFields from "./CommonFormFields";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

const Registration = ({ setToken }) => {
  // These are used for the functionality of selecting either individual form or organization form.
  const toggleIndividualForm = useRef();
  const toggleOrganizationForm = useRef();
  const individualCheck = useRef();
  const organizationCheck = useRef();

  // useState to store ID of state so that we can validate zipCodes for each state.
  const [IdOfState, SetIdOfState] = useState("");

  // To navigate to particular route.
  const goTo = useNavigate();

  // useState to store each field's data from form.
  const [formData, setFormData] = useState({
    user_type: "Individual User",
    first_name: "",
    middle_name: "",
    last_name: "",
    aadhar_number: "",
    pan_number: "",
    organization_type: "",
    company_name: "",
    gst_number: "",
    tan_number: "",
    cin_number: "",
    contact_details: {
      address: "",
      locality: "",
      city: "",
      zip: "",
      state: "",
      email: "",
      landline_number: "",
      mobile_number: "",
    },
  });

  // Store validation message and validation color based on input field.
  const [validationDetails, setValidationDetails] = useState({
    aadhaarValidationMessage: "",
    panValidationMessage: "",
    gstValidationMessage: "",
    cinValidationMessage: "",
    tanValidationMessage: "",
    zipCodeValidationMessage: "",
    emailValidationMessage: "",
    mobileValidationMessage: "",

    aadhaarValidationColor: "",
    panValidationColor: "",
    gstValidationColor: "",
    cinValidationColor: "",
    tanValidationColor: "",
    zipCodeValidationColor: "",
    emailValidationColor: "",
    mobileValidationColor: "",
  });

  // Object destructuring.
  const {
    aadhaarValidationMessage,
    panValidationMessage,
    gstValidationMessage,
    tanValidationMessage,
    cinValidationMessage,
    aadhaarValidationColor,
    panValidationColor,
    gstValidationColor,
    tanValidationColor,
    cinValidationColor,
  } = validationDetails;

  const resetValues = () => {
    setValidationDetails({});
    SetIdOfState("");
  };

  // Function to show individual form or organization form on click of label.
  const changeForm = (e) => {
    const attrOfForm = e.target.getAttribute("name");
    if (attrOfForm === "organization") {
      resetValues();
      setFormData({
        ...formData,
        user_type: "Organizational User",
        first_name: "",
        middle_name: "",
        last_name: "",
        aadhar_number: "",
        pan_number: "",
      });
      // Reset form fields and validations.
      document.getElementById("individualForm").reset();
      // Make checkbox of label organization checked.
      individualCheck.current.classList.remove(
        "individual-and-organization-check"
      );
      organizationCheck.current.classList.add(
        "individual-and-organization-check"
      );
      // Unhide organization form.
      toggleOrganizationForm.current.classList.remove("d-none");
      // Hide Individual form.
      toggleIndividualForm.current.classList.add("d-none");
    } else if (attrOfForm === "individual") {
      setFormData({
        ...formData,
        user_type: "Individual User",
        organization_type: "",
        company_name: "",
        gst_number: "",
        tan_number: "",
        cin_number: "",
      });
      // Reset form fields and validations.
      resetValues();
      document.getElementById("organizationForm").reset();
      // Make checkbox of label individual checked.
      individualCheck.current.classList.add(
        "individual-and-organization-check"
      );
      organizationCheck.current.classList.remove(
        "individual-and-organization-check"
      );
      // Hide organization form.
      toggleOrganizationForm.current.classList.add("d-none");
      // Unhide Individual form.
      toggleIndividualForm.current.classList.remove("d-none");
    }
  };

  // Function to validate zipCodes.
  const zipValidationByState = async (zipValue, stateId) => {
    await axios
      .post(
        `http://host.docker.internal:3000/sam/v1/customer-registration/zipcode-validation`,
        { zipcode: zipValue, state_id: stateId }
      )
      .then((res) => {
        if (res.data.status === 0) {
          setValidationDetails({
            ...validationDetails,
            zipCodeValidationMessage: "Invalid ZipCode.",
            zipCodeValidationColor: "danger",
          });
        } else {
          setValidationDetails({
            ...validationDetails,
            zipCodeValidationMessage: "",
            zipCodeValidationColor: "",
          });
        }
      });
  };

  // Function to show backend validation on outside click of input filed.
  const onInputBlur = async (e) => {
    const { name, value } = e.target;
    if (name === "first_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "middle_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "last_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "aadhar_number") {
      setFormData({ ...formData, [name]: value });
      // Aadhaar frontend validation.
      let aadhaarFormat = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
      if (aadhaarFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          aadhaarValidationMessage: "",
          aadhaarValidationColor: "",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          aadhaarValidationMessage: "Invalid Aadhaar Number.",
          aadhaarValidationColor: "danger",
        });
      }
    } else if (name === "pan_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      // Pan frontend validation.
      let panFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (panFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "",
          panValidationColor: "",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "Invalid Pan Number.",
          panValidationColor: "danger",
        });
      }
    } else if (name === "organization_type") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "company_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "gst_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let gst_format =
        /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/;
      if (gst_format.test(value)) {
        setValidationDetails({
          ...validationDetails,
          gstValidationMessage: "",
          gstValidationColor: "",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          gstValidationMessage: "Invalid GST Number Entered",
          gstValidationColor: "danger",
        });
      }
    } else if (name === "tan_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let tan_format = /^[a-zA-Z]{4}[0-9]{5}[a-zA-Z]{1}$/;
      if (tan_format.test(value)) {
        setValidationDetails({
          ...validationDetails,
          tanValidationMessage: "",
          tanValidationColor: "",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          tanValidationMessage: "Invalid TAN Number Entered",
          tanValidationColor: "danger",
        });
      }
    } else if (name === "cin_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let cin_format =
        /^[a-zA-Z]{1}[0-9]{5}[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{3}[0-9]{6}$/;
      if (cin_format.test(value)) {
        setValidationDetails({
          ...validationDetails,
          cinValidationMessage: "",
          cinValidationColor: "",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          cinValidationMessage: "Invalid CIN Number Entered",
          cinValidationColor: "danger",
        });
      }
    } else if (name === "address") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
    } else if (name === "locality") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
    } else if (name === "city") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
    } else if (name === "zip") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
      if (IdOfState === "" && value !== "") {
        alert("Please select State");
      } else if (IdOfState !== "" && value !== "") {
        zipValidationByState(value, parseInt(IdOfState));
      }
    } else if (name === "state") {
      let stateName = "";
      let getStateName = document.getElementById(
        `state-name-${value}`
      ).innerText;
      if (getStateName !== "") {
        stateName = getStateName;
      }
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: stateName },
      });
      // If we selected state then we are saving state Id in IdOfState variable and if zipCode value is also available then we are calling zipValidationByState Function.
      SetIdOfState(value);
      // If zip value is entered then call zipValidationByState function.
      if (String(formData.contact_details.zip) !== "") {
        zipValidationByState(
          String(formData.contact_details.zip),
          parseInt(value)
        );
      }
    } else if (name === "email") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
      // If input field is email then post its value to api for validating.
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/email-validation`,
          JSON.stringify({ email: value })
        )
        .then((res) => {
          var emailFormat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;
          if (res.data.status === 1) {
            setValidationDetails({
              ...validationDetails,
              emailValidationMessage: "Email id already exists.",
              emailValidationColor: "danger",
            });
          } else if (!emailFormat.test(value)) {
            setValidationDetails({
              ...validationDetails,
              emailValidationColor: "danger",
              emailValidationMessage: "Invalid email Id.",
            });
          } else {
            setValidationDetails({
              ...validationDetails,
              emailValidationColor: "",
              emailValidationMessage: "",
            });
          }
        });
    } else if (name === "landline_number") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
    } else if (name === "mobile_number") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
      // If input field is mobile then post its value to api for validating.
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/mobilenumber-validation`,
          JSON.stringify({ mobile_number: value })
        )
        .then((res) => {
          if (res.data.status === 1) {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Mobile number already exists.",
              mobileValidationColor: "danger",
            });
          } else if (res.data.status === 2) {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Invalid Mobile Number Entered.",
              mobileValidationColor: "danger",
            });
          } else {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "",
              mobileValidationColor: "",
            });
          }
        });
    }
  };

  // This will run onchange of input field.
  const onInputChange = async (e) => {
    const { name } = e.target;
    if (name === "aadhar_number") {
      setValidationDetails({
        ...validationDetails,
        aadhaarValidationColor: "",
        aadhaarValidationMessage: "",
      });
    } else if (name === "pan_number") {
      setValidationDetails({
        ...validationDetails,
        panValidationColor: "",
        panValidationMessage: "",
      });
    } else if (name === "gst_number") {
      setValidationDetails({
        ...validationDetails,
        gstValidationColor: "",
        gstValidationMessage: "",
      });
    } else if (name === "tan_number") {
      setValidationDetails({
        ...validationDetails,
        tanValidationColor: "",
        tanValidationMessage: "",
      });
    } else if (name === "cin_number") {
      setValidationDetails({
        ...validationDetails,
        cinValidationColor: "",
        cinValidationMessage: "",
      });
    } else if (name === "zip") {
      setValidationDetails({
        ...validationDetails,
        zipCodeValidationColor: "",
        zipCodeValidationMessage: "",
      });
    } else if (name === "email") {
      setValidationDetails({
        ...validationDetails,
        emailValidationColor: "",
        emailValidationMessage: "",
      });
    } else if (name === "mobile_number") {
      setValidationDetails({
        ...validationDetails,
        mobileValidationColor: "",
        mobileValidationMessage: "",
      });
    }
  };

  const deleteLandlineNumberIfEmpty = () => {
    let landlineNumber = formData.contact_details.landline_number;
    if (landlineNumber === "") {
      delete formData.contact_details.landline_number;
    }
  };

  // Function will run after Individual Form submit button is clicked.
  const onIndividualFormSubmit = async (e) => {
    e.preventDefault();
    deleteLandlineNumberIfEmpty();
    console.log(formData);
    await axios
      .post(
        `http://host.docker.internal:3000/sam/v1/customer-registration/individual-customer`,
        formData
      )
      .then((res) => {
        if (res.data.status === 0) {
          alert(`${formData.user_type} Added Successfully !`);
          e.target.reset();
          resetValues();
        } else {
          alert("Form is Invalid");
        }
      });

    // setToken(formData.contact_details.email + "1234");
    // localStorage.setItem("token", formData.emailAddress + "1234");
    // goTo("/register/verify");
  };

  // Function will run after Organization Form submit button is clicked.
  const onOrganizationFormSubmit = async (e) => {
    e.preventDefault();
    deleteLandlineNumberIfEmpty();
    console.log(formData);
    await axios
      .post(
        `http://host.docker.internal:3000/sam/v1/customer-registration/org-customer`,
        formData
      )
      .then((res) => {
        if (res.data.status === 0) {
          alert(`${formData.user_type} Added Successfully !`);
          e.target.reset();
          resetValues();
        } else {
          alert("Form is Invalid");
        }
      });
  };

  return (
    <Layout>
      <section className="registration-wrapper min-100vh section-padding">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="card form-wrapper-card shadow pt-3 pb-5 ps-lg-3 ps-0">
                <div className="container-fluid registration-form-container">
                  <div className="row">
                    {/* Individual Form Heading */}
                    <div className="col-lg-12">
                      <h4 className="fw-bold">New Customer Register</h4>
                      <hr />
                    </div>
                    {/*  Checkboxes - Individual & Organization */}
                    <div className="col-lg-12">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input individual-and-organization-check"
                          type="checkbox"
                          id="individual"
                          value="individual"
                          ref={individualCheck}
                          readOnly
                          checked={false}
                        />
                        <label
                          className="form-check-label toggle-label"
                          htmlFor="individual"
                          name="individual"
                          onClick={changeForm}
                        >
                          Individual
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="organization"
                          value="organization"
                          ref={organizationCheck}
                          readOnly
                          checked={false}
                        />
                        <label
                          className="form-check-label toggle-label"
                          htmlFor="organization"
                          name="organization"
                          onClick={changeForm}
                        >
                          Organization
                        </label>
                      </div>
                    </div>
                    {/* Individual Main Form */}
                    <div
                      className="col-lg-12 individual-form-wrapper"
                      ref={toggleIndividualForm}
                    >
                      <form
                        id="individualForm"
                        onSubmit={onIndividualFormSubmit}
                        action=""
                        className="row IndividualForm"
                      >
                        <div className="col-lg-12 mt-3">
                          {/* Full Name */}
                          <div className="row fullNameRow">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              Full Name
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="first_name"
                                type="text"
                                placeholder="First Name"
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="middle_name"
                                type="text"
                                placeholder="Middle Name"
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="col-lg-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="last_name"
                                type="text"
                                placeholder="Last Name"
                                className="form-control"
                                required
                              />
                            </div>
                          </div>
                          {/* Aadhaar Pan */}
                          <div className="row aadhaarPanRow mt-lg-3 mt-4">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              Aadhaar Number
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-3">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="aadhar_number"
                                type="Number"
                                placeholder="•••• •••• •••• ••••"
                                required
                                className={`form-control border-${aadhaarValidationColor}`}
                              />
                              {aadhaarValidationMessage ? (
                                <span
                                  className={`pe-1 text-${aadhaarValidationColor}`}
                                >
                                  {aadhaarValidationMessage}
                                </span>
                              ) : (
                                <span className="d-none"></span>
                              )}
                              <span className="form-text">
                                <small>
                                  (Please enter 12 digit aadhar number)
                                </small>
                              </span>
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              PAN Number
                            </div>
                            <div className="col-lg-2 mb-lg-0">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="pan_number"
                                type="text"
                                placeholder="PAN Number"
                                required
                                className={`form-control text-uppercase border-${panValidationColor}`}
                              />
                              {panValidationMessage ? (
                                <span
                                  className={`pe-1 text-${panValidationColor}`}
                                >
                                  {panValidationMessage}
                                </span>
                              ) : (
                                <span className="d-none"></span>
                              )}
                              <span className="form-text">
                                <small>
                                  (Please refer ex:ERTYG1235E pan number)
                                </small>
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
                    </div>
                    {/* Organization Main Form */}
                    <div
                      className="col-lg-12 d-none organization-form-wrapper"
                      ref={toggleOrganizationForm}
                    >
                      <form
                        id="organizationForm"
                        onSubmit={onOrganizationFormSubmit}
                        action=""
                        className="row OrganizationForm"
                      >
                        <div className="col-lg-12 mt-3">
                          <div className="row organization-type-row">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              Organization Type
                            </div>
                            <div className="col-lg-2">
                              <select
                                onBlur={onInputBlur}
                                name="organization_type"
                                className="form-select"
                                aria-label="Default select example"
                                required
                              >
                                <option value="" style={{ color: "gray" }}>
                                  Select Type
                                </option>
                                <option value="Proprietor">Proprietor</option>
                                <option value="LLP">LLP</option>
                                <option value="Partnership/Joint Venture">
                                  Partnership/Joint Venture
                                </option>
                                <option value="Private Limited">
                                  Private Limited
                                </option>
                                <option value="Limited">Limited</option>
                              </select>
                            </div>
                          </div>
                          {/* Organization Name & GST & Type */}
                          <div className="row nameGstRow  mt-lg-3 mt-2">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              Organization Name
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              <input
                                onBlur={onInputBlur}
                                name="company_name"
                                type="text"
                                placeholder="Company Name"
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              GST Number
                            </div>
                            <div className="col-lg-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="gst_number"
                                type="text"
                                placeholder="GST Number"
                                className={`form-control text-uppercase border-${gstValidationColor}`}
                                required
                              />
                              {gstValidationMessage ? (
                                <span
                                  className={`pe-1 text-${gstValidationColor}`}
                                >
                                  {gstValidationMessage}
                                </span>
                              ) : (
                                <span className="d-none"></span>
                              )}
                            </div>
                          </div>

                          {/* TAN & CIN */}
                          <div className="row AadhaarPanRow  mt-lg-3 mt-2">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              TAN Number
                            </div>
                            <div className="col-lg-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="tan_number"
                                type="text"
                                placeholder="TAN Number"
                                className={`form-control text-uppercase border-${tanValidationColor}`}
                                required
                              />
                              {tanValidationMessage ? (
                                <span
                                  className={`pe-1 text-${tanValidationColor}`}
                                >
                                  {tanValidationMessage}
                                </span>
                              ) : (
                                <span className="d-none"></span>
                              )}
                            </div>
                            <div className="col-lg-2 my-lg-0 my-2">
                              CIN Number
                            </div>
                            <div className="col-lg-2">
                              <input
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                                name="cin_number"
                                type="text"
                                placeholder="CIN Number"
                                className={`form-control text-uppercase border-${cinValidationColor}`}
                                required
                              />
                              {cinValidationMessage ? (
                                <span
                                  className={`pe-1 text-${cinValidationColor}`}
                                >
                                  {cinValidationMessage}
                                </span>
                              ) : (
                                <span className="d-none"></span>
                              )}
                            </div>
                          </div>
                          <CommonFormFields
                            validationDetails={validationDetails}
                            onInputChange={onInputChange}
                            onInputBlur={onInputBlur}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <small className="token-verify-link">
                  Already have Token?
                  <NavLink to="/register/verify" className="fw-bold ps-1">
                    click here to verify
                  </NavLink>
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Registration;
