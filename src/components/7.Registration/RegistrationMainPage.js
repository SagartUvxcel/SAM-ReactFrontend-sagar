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

  const [IdOfState, SetIdOfState] = useState("");
  const goTo = useNavigate();

  // useState to store each field's data from form.
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    aadhaarNumber: "",
    panNumber: "",
    houseNumber: "",
    locality: "",
    city: "",
    zipCode: "",
    state: "",
    emailAddress: "",
    landlineNumber: "",
    mobileNumber: "",
  });

  // const {
  //   firstName,
  //   middleName,
  //   lastName,
  //   aadhaarNumber,
  //   panNumber,
  //   houseNumber,
  //   locality,
  //   city,
  //   zipCode,
  //   state,
  //   emailAddress,
  //   landlineNumber,
  //   mobileNumber,
  // } = formData;

  // Store validation message and validation color based on input field.
  const [validationDetails, setValidationDetails] = useState({
    aadhaarValidationMessage: "",
    panValidationMessage: "",
    emailValidationMessage: "",
    landlineValidationMessage: "",
    mobileValidationMessage: "",
    zipCodeValidationMessage: "",
    aadhaarValidationColor: "",
    panValidationColor: "",
    emailValidationColor: "",
    landlineValidationColor: "",
    mobileValidationColor: "",
    zipCodeValidationColor: "",
  });

  const {
    aadhaarValidationMessage,
    panValidationMessage,
    // emailValidationMessage,
    // landlineValidationMessage,
    // mobileValidationMessage,
    // zipCodeValidationMessage,
    aadhaarValidationColor,
    panValidationColor,
    emailValidationColor,
    mobileValidationColor,
    // zipCodeValidationColor,
  } = validationDetails;

  // Function to show backend validation on outside click of input filed.
  const onInputBlur = async (e) => {
    const { name, value } = e.target;
    if (name === "emailAddress") {
      // If input field is email then post its value to api for validating.
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/email-validation`,
          JSON.stringify({ email: value })
        )
        .then((res) => {
          if (res.data.status === 1) {
            setValidationDetails({
              ...validationDetails,
              emailValidationMessage: "Email id already exists.",
              emailValidationColor: "danger",
            });
          }
        });
    } else if (name === "mobileNumber") {
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
              mobileValidationMessage: "Mobile number already exists",
              mobileValidationColor: "danger",
            });
          } else if (res.data.status === 2) {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Invalid Mobile Number Entered",
              mobileValidationColor: "danger",
            });
          } else {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "",
              mobileValidationColor: "success",
            });
          }
        });
    } else if (name === "zipCode") {
      if (IdOfState === "" && value !== "") {
        alert("Please select State");
      }
    }
  };

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
            zipCodeValidationMessage: "Invalid ZipCode",
            zipCodeValidationColor: "danger",
          });
        } else {
          setValidationDetails({
            ...validationDetails,
            zipCodeValidationMessage: "",
            zipCodeValidationColor: "success",
          });
        }
      });
  };

  // This will run onchange of input field.
  const onInputChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const { name, value } = e.target;
    if (name === "aadhaarNumber") {
      // Aadhaar frontend validation.
      let aadhaarFormat = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
      if (aadhaarFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          aadhaarValidationMessage: "",
          aadhaarValidationColor: "success",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          aadhaarValidationMessage: "Invalid Aadhaar Number.",
          aadhaarValidationColor: "danger",
        });
      }
    } else if (name === "panNumber") {
      // Pan frontend validation.
      let panFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (panFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "",
          panValidationColor: "success",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "Invalid Pan Number.",
          panValidationColor: "danger",
        });
      }
    } else if (name === "emailAddress") {
      // Email frontend validation.
      let emailFormat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;
      if (emailFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          emailValidationMessage: "",
          emailValidationColor: "success",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          emailValidationMessage: "Invalid Email Id.",
          emailValidationColor: "danger",
        });
      }
    }
    // else if (name === "landlineNumber") {
    //   // Landline frontend validation.
    //   let landlineNumberLength = value.length;
    //   if (landlineNumberLength >= 7 && landlineNumberLength <= 11) {
    //     setValidationDetails({
    //       ...validationDetails,
    //       landlineValidationMessage: "",
    //       landlineValidationColor: "success",
    //     });
    //   } else {
    //     setValidationDetails({
    //       ...validationDetails,
    //       landlineValidationMessage:
    //         "Landline No. is not valid, Please Enter 7 to 11 Digit.",
    //       landlineValidationColor: "danger",
    //     });
    //   }
    // }
    else if (name === "zipCode") {
      setFormData({ ...formData, zipCode: value });
      if (IdOfState !== "") {
        zipValidationByState(value, parseInt(IdOfState));
      }
    } else if (name === "state") {
      SetIdOfState(value);
      if (formData.zipCode !== "") {
        zipValidationByState(formData.zipCode, parseInt(value));
      }
    }
  };

  const onIndividualFormSubmit = (e) => {
    e.preventDefault();
    if (
      aadhaarValidationColor === "danger" ||
      panValidationColor === "danger" ||
      emailValidationColor === "danger" ||
      mobileValidationColor === "danger"
    ) {
      alert("form is not Valid");
    } else {
      alert("Registration Successful Please Check Your Email For Token !");
      setToken(formData.emailAddress + "1234");
      localStorage.setItem("token", formData.emailAddress + "1234");
      goTo("/register/verify");
    }
  };

  const onOrganizationFormSubmit = (e) => {
    e.preventDefault();
    if (
      emailValidationColor === "danger" ||
      mobileValidationColor === "danger"
    ) {
      alert("form is not Valid");
    } else {
      alert("Form is valid");
    }
  };

  // Function to show individual form or organization from on click of label.
  const onTopCheckLabelClick = (e) => {
    const attrOfForm = e.target.getAttribute("name");
    if (attrOfForm === "organization") {
      // Reset from fields and validations.
      setValidationDetails({});
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
      setValidationDetails({});
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
                          onClick={onTopCheckLabelClick}
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
                          onClick={onTopCheckLabelClick}
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
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              Aadhaar Number
                            </div>
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
                                name="panNumber"
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
                                type="text"
                                placeholder="GST Number"
                                className="form-control"
                                required
                              />
                            </div>
                          </div>

                          {/* TAN & CIN */}
                          <div className="row AadhaarPanRow  mt-lg-3 mt-2">
                            <div className="col-lg-2 mb-lg-0 mb-2">
                              TAN Number
                            </div>
                            <div className="col-lg-2">
                              <input
                                type="text"
                                placeholder="TAN Number"
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="col-lg-2 my-lg-0 my-2">
                              CIN Number
                            </div>
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
