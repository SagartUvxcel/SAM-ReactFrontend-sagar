import React, { useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import IndividualForm from "./IndividualForm";
import OrganizationForm from "./OrganizationForm";
import axios from "axios";

const Registration = () => {
  const toggleIndividualForm = useRef();
  const toggleOrganizationForm = useRef();
  const individualCheck = useRef();
  const organizationCheck = useRef();

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

  const [validationDetails, setValidationDetails] = useState({
    aadhaarValidationMessage: "",
    panValidationMessage: "",
    emailValidationMessage: "",
    landlineValidationMessage: "",
    mobileValidationMessage: "",
    aadhaarValidationColor: "",
    panValidationColor: "",
    emailValidationColor: "",
    landlineValidationColor: "",
    mobileValidationColor: "",
  });

  const onInputBlur = async (e) => {
    const { name, value } = e.target;
    if (name === "emailAddress") {
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/email-validation`,
          JSON.stringify({ email: value }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          // if (res.data.msg_to_return === "Email ID already exists") {
          setValidationDetails({
            ...validationDetails,
            emailValidationMessage: res.data.status,
            emailValidationColor: "danger",
          });
          // }
        });
    } else if (name === "mobileNumber") {
      await axios
        .post(
          `http://host.docker.internal:3000/sam/v1/customer-registration/mobilenumber-validation`,
          JSON.stringify({ mobile_number: value }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          console.log(res.data.status);
          if (res.data.status === 1 || res.data.status === 2) {
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage:
                validationDetails.mobileValidationMessage !== ""
                  ? validationDetails.mobileValidationMessage
                  : "Mobile number already exists",

              mobileValidationColor: "danger",
            });
          }
        });
    }
  };

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const { name, value } = e.target;
    if (name === "aadhaarNumber") {
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
    }
  };

  const onTopCheckLabelClick = (e) => {
    const attrOfForm = e.target.getAttribute("name");
    if (attrOfForm === "organization") {
      setValidationDetails({});
      document.getElementById("individualForm").reset();
      individualCheck.current.classList.remove(
        "individual-and-organization-check"
      );
      organizationCheck.current.classList.add(
        "individual-and-organization-check"
      );
      toggleOrganizationForm.current.classList.remove("d-none");
      toggleIndividualForm.current.classList.add("d-none");
    } else if (attrOfForm === "individual") {
      setValidationDetails({});
      document.getElementById("organizationForm").reset();
      individualCheck.current.classList.add(
        "individual-and-organization-check"
      );
      organizationCheck.current.classList.remove(
        "individual-and-organization-check"
      );
      toggleOrganizationForm.current.classList.add("d-none");
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
