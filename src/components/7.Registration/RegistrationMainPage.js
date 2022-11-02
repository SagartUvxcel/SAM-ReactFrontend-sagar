import React, { useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import IndividualForm from "./IndividualForm";
import OrganizationForm from "./OrganizationForm";
import axios from "axios";

const Registration = () => {
  // These are used for the functionality of selecting either individual form or organization form.
  const toggleIndividualForm = useRef();
  const toggleOrganizationForm = useRef();
  const individualCheck = useRef();
  const organizationCheck = useRef();

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
          console.log(res.data.status);
          if (res.data.status === 1) {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Mobile number already exists",
              mobileValidationColor: "danger",
            });
          }
        });
    }
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
          emailValidationMessage: "Invalid Email Format.",
          emailValidationColor: "danger",
        });
      }
    } else if (name === "landlineNumber") {
      // Landline frontend validation.
      let landlineNumberLength = value.length;
      if (landlineNumberLength >= 7 && landlineNumberLength <= 11) {
        setValidationDetails({
          ...validationDetails,
          landlineValidationMessage: "",
          landlineValidationColor: "success",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          landlineValidationMessage:
            "Landline No. is not valid, Please Enter 7 to 11 Digit.",
          landlineValidationColor: "danger",
        });
      }
    } else if (name === "mobileNumber") {
      // Mobile frontend validation.
      let mobileNumberLength = value.length;
      if (mobileNumberLength === 10) {
        setValidationDetails({
          ...validationDetails,
          mobileValidationMessage: "",
          mobileValidationColor: "success",
        });
      } else {
        setValidationDetails({
          ...validationDetails,
          mobileValidationMessage: "Please Enter Valid Mobile Number.",
          mobileValidationColor: "danger",
        });
      }
    } else if (name === "zipCode") {
      // ZipCode backend validation.
      // Post value of zipCode to api.
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/zipcode-validation`,
          JSON.stringify({ zipcode: value }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          if (res.data.status !== 1) {
            setValidationDetails({
              ...validationDetails,
              zipCodeValidationMessage: "Invalid Zipcode",
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
              <div className="card form-wrapper-card shadow pt-3 pb-5 ps-3">
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
                      <IndividualForm
                        formData={formData}
                        validationDetails={validationDetails}
                        onInputChange={onInputChange}
                        onInputBlur={onInputBlur}
                      />
                    </div>
                    {/* Organization Main Form */}
                    <div
                      className="col-lg-12 d-none organization-form-wrapper"
                      ref={toggleOrganizationForm}
                    >
                      <OrganizationForm
                        formData={formData}
                        validationDetails={validationDetails}
                        onInputChange={onInputChange}
                        onInputBlur={onInputBlur}
                      />
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

export default Registration;
