import React, { useEffect, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import CommonFormFields from "./CommonFormFields";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Registration = () => {
  // useState to store ID of state so that we can validate zipCodes for each state.
  const [IdOfState, SetIdOfState] = useState("");

  // Navigate to the particular route.
  const goTo = useNavigate();

  // useState to store contact details as well as other required details from form.
  const [formData, setFormData] = useState({
    contact_details: {
      user_type: "Individual User",
      address: "",
      locality: "",
      city: "",
      zip: "",
      state: "",
      email: "",
      mobile_number: "",
      landline_number: "",
    },
  });

  // Store validation message and validation color for zipCode field.
  const [validationDetails, setValidationDetails] = useState({
    zipCodeValidationMessage: "",
    zipCodeValidationColor: "",
  });

  // Things to be changed when we change form i.e. either individual or organization.
  const [toggleForms, setToggleForms] = useState({
    individualSelected: true,
    organizationSelected: false,
    individualDisplay: "",
    organizationDisplay: "d-none",
  });

  // Object destructuring.
  const {
    individualSelected,
    organizationSelected,
    individualDisplay,
    organizationDisplay,
  } = toggleForms;

  // Function to reset validation details and id of state
  const resetValues = () => {
    setValidationDetails({});
    SetIdOfState("");
  };

  const showOrganizationForm = () => {
    setFormData({
      ...formData,
      contact_details: { user_type: "Organizational User" },
    });
    // Reset form fields and validations.
    document.getElementById("individualForm").reset();
    resetValues();
    // Toggle checkbox and visibility of forms.
    setToggleForms({
      ...toggleForms,
      organizationSelected: true,
      organizationDisplay: "",
      individualSelected: false,
      individualDisplay: "d-none",
    });
  };

  const showIndividualForm = () => {
    setFormData({
      ...formData,
      contact_details: { user_type: "Individual User" },
    });
    // Reset form fields and validations.
    document.getElementById("organizationForm").reset();
    resetValues();

    // Toggle checkbox and visibility of forms.
    setToggleForms({
      ...toggleForms,
      individualSelected: true,
      individualDisplay: "",
      organizationSelected: false,
      organizationDisplay: "d-none",
    });
  };

  // Function to show individual form or organization form on click of label.
  const changeForm = (e) => {
    const attrOfForm = e.target.getAttribute("name");
    if (attrOfForm === "organization") {
      showOrganizationForm();
    } else if (attrOfForm === "individual") {
      showIndividualForm();
    }
  };

  // Function to remove Validation details.
  const removeValidations = (selectedInput, errMsg) => {
    selectedInput.style.borderColor = "";
    errMsg.classList.add("d-none");
    errMsg.textContent = "";
  };

  // Function to add Validation details.
  const addValidations = (selectedInput, errMsg) => {
    selectedInput.style.borderColor = "red";
    errMsg.classList.remove("d-none");
  };

  // Function to validate zipCodes.
  const zipValidationByState = async (zipValue, stateId) => {
    await axios
      .post(`/sam/v1/customer-registration/zipcode-validation`, {
        zipcode: zipValue,
        state_id: stateId,
      })
      .then((res) => {
        if (res.data.status === 0) {
          setValidationDetails({
            zipCodeValidationColor: "danger",
            zipCodeValidationMessage: "Invalid Zipcode.",
          });
        } else {
          setValidationDetails({
            zipCodeValidationColor: "",
            zipCodeValidationMessage: "",
          });
        }
      });
  };

  // Function to show backend validation on outside click of input filed.
  const onInputBlur = async (e) => {
    const { name, value } = e.target;
    // Get selected input box using its id. Note* - id is same as the name of input field.
    const selectedInput = document.getElementById(name);
    let errMsg = "";
    // errMsg Means its a span tag just after all the input fields to show error message.
    selectedInput ? (errMsg = selectedInput.nextElementSibling) : (errMsg = "");
    if (name === "first_name") {
      // Saving field's value into formData useState.
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
        removeValidations(selectedInput, errMsg);
      } else {
        addValidations(selectedInput, errMsg);
        errMsg.textContent = "Invalid Aadhaar Number.";
      }
    } else if (name === "pan_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      // Pan frontend validation.
      let panFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (panFormat.test(value)) {
        removeValidations(selectedInput, errMsg);
      } else {
        addValidations(selectedInput, errMsg);
        errMsg.textContent = "Invalid Pan Number.";
      }
    } else if (name === "organization_type") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "company_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "gst_number") {
      // Gst frontend validation.
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let gst_format =
        /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/;
      if (gst_format.test(value)) {
        removeValidations(selectedInput, errMsg);
      } else {
        addValidations(selectedInput, errMsg);
        errMsg.textContent = "Invalid GST Number Entered.";
      }
    } else if (name === "tan_number") {
      // Tan frontend validation.
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let tan_format = /^[a-zA-Z]{4}[0-9]{5}[a-zA-Z]{1}$/;
      if (tan_format.test(value)) {
        removeValidations(selectedInput, errMsg);
      } else {
        addValidations(selectedInput, errMsg);
        errMsg.textContent = "Invalid TAN Number Entered.";
      }
    } else if (name === "cin_number") {
      // Cin frontend validation.
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let cin_format =
        /^[a-zA-Z]{1}[0-9]{5}[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{3}[0-9]{6}$/;
      if (cin_format.test(value)) {
        removeValidations(selectedInput, errMsg);
      } else {
        addValidations(selectedInput, errMsg);
        errMsg.textContent = "Invalid CIN Number Entered.";
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
      // If state is not selected and Zip code is entered the showing message to select state.
      if (IdOfState === "" && value !== "") {
        toast.error("Please select State");
        // If state is selected and then zip code is entered then calling zipValidationByState function.
      } else if (IdOfState !== "" && value !== "") {
        zipValidationByState(value, parseInt(IdOfState));
      }
    } else if (name === "state") {
      let stateName = "";
      let getStateName = document.getElementById(`state-name-${value}`);
      if (getStateName) {
        stateName = getStateName.innerText;
      }
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: stateName },
      });
      // Saving state Id in IdOfState variable.
      SetIdOfState(value);
    } else if (name === "email") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
      // If input field is email then post its value to api for validating.
      await axios
        .post(
          `/sam/v1/customer-registration/email-validation`,
          JSON.stringify({ email: value })
        )
        .then((res) => {
          var emailFormat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;
          if (res.data.status === 1) {
            addValidations(selectedInput, errMsg);
            errMsg.textContent = "Email id already exists.";
          } else if (!emailFormat.test(value)) {
            addValidations(selectedInput, errMsg);
            errMsg.textContent = "Invalid email Id.";
          } else {
            removeValidations(selectedInput, errMsg);
          }
        });
    } else if (name === "landline_number") {
      if (value !== "") {
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            [name]: parseInt(value),
          },
        });
      } else {
        delete formData.contact_details.landline_number;
      }
    } else if (name === "mobile_number") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
      // If input field is mobile then post its value to api for validating.
      await axios
        .post(
          `/sam/v1/customer-registration/mobilenumber-validation`,
          JSON.stringify({ mobile_number: value })
        )
        .then((res) => {
          if (res.data.status === 1) {
            // Show validation message and set validation color for border and error message.
            addValidations(selectedInput, errMsg);
            errMsg.textContent = "Mobile number already exists.";
          } else if (res.data.status === 2) {
            addValidations(selectedInput, errMsg);
            errMsg.textContent = "Invalid Mobile Number Entered.";
          } else {
            // Remove validation details.
            removeValidations(selectedInput, errMsg);
          }
        });
    }
  };

  // This will run onchange of input field.
  const onInputChange = async (e) => {
    const { name, value } = e.target;
    const selectedInput = document.getElementById(name);
    let errMsg = "";
    selectedInput ? (errMsg = selectedInput.nextElementSibling) : (errMsg = "");
    if (name === "aadhar_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "pan_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "gst_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "tan_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "cin_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "zip") {
      setValidationDetails({
        zipCodeValidationColor: "",
        zipCodeValidationMessage: "",
      });
    } else if (name === "email") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "mobile_number") {
      removeValidations(selectedInput, errMsg);
    } else if (name === "state") {
      // If zipcode is entered and then state is selected then calling zipValidationByState function.
      if (String(formData.contact_details.zip) !== "") {
        zipValidationByState(
          String(formData.contact_details.zip),
          parseInt(value)
        );
      }
    }
  };

  // Function will run after Individual Form submit button is clicked.
  const onIndividualFormSubmit = async (e) => {
    e.preventDefault();
    // Removing organization form fields from formData useState.
    const fieldsToDelete = [
      "organization_type",
      "company_name",
      "gst_number",
      "tan_number",
      "cin_number",
    ];
    fieldsToDelete.forEach((field) => {
      delete formData[field];
    });
    // Posting form data to api.
    await axios
      .post(`/sam/v1/customer-registration/individual-customer`, formData)
      .then(async (res) => {
        if (res.data.status === 0) {
          toast.success(`Success: Please check your email for verification.`);
          e.target.reset();
          resetValues();
          setTimeout(() => {
            goTo("/register/verify");
          }, 3000);
        } else {
          toast.error("Form is Invalid");
        }
      });
  };

  // Function will run after Organization Form submit button is clicked.
  const onOrganizationFormSubmit = async (e) => {
    e.preventDefault();
    // Removing Individual form fields from formData useState.
    const fieldsToDelete = [
      "first_name",
      "middle_name",
      "last_name",
      "aadhar_number",
      "pan_number",
    ];
    fieldsToDelete.forEach((field) => {
      delete formData[field];
    });

    // Posting form data to api.
    await axios
      .post(`/sam/v1/customer-registration/org-customer`, formData)
      .then(async (res) => {
        if (res.data.status === 0) {
          toast.success(`Success: Please check your email for verification.`);
          e.target.reset();
          resetValues();
          setTimeout(() => {
            goTo("/register/verify");
          }, 3000);
        } else {
          toast.error("Form is Invalid");
        }
      });
  };

  useEffect(() => {
    resetValues();
  }, []);

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
                          className="form-check-input"
                          type="checkbox"
                          id="individual"
                          value="individual"
                          readOnly
                          checked={individualSelected}
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
                          readOnly
                          checked={organizationSelected}
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
                    <form
                      id="individualForm"
                      onSubmit={onIndividualFormSubmit}
                      action=""
                      className={`row ${individualDisplay} IndividualForm`}
                    >
                      <div className="col-lg-12 mt-3">
                        {/* Full Name */}
                        <div className="row fullNameRow">
                          <div className="col-lg-2 mb-lg-0 mb-2">Full Name</div>
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
                              id="aadhar_number"
                              type="Number"
                              placeholder="•••• •••• •••• ••••"
                              required
                              className="form-control"
                            />
                            <span className="pe-1 text-danger d-none"></span>
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
                              id="pan_number"
                              type="text"
                              placeholder="PAN Number"
                              required
                              className="form-control text-uppercase"
                            />
                            <span className="pe-1 text-danger d-none"></span>
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

                    {/* Organization Main Form */}
                    <form
                      id="organizationForm"
                      onSubmit={onOrganizationFormSubmit}
                      action=""
                      className={`row ${organizationDisplay} OrganizationForm`}
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
                              id="gst_number"
                              type="text"
                              placeholder="GST Number"
                              className="form-control text-uppercase"
                              required
                            />
                            <span className="pe-1 text-danger d-none"></span>
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
                              id="tan_number"
                              type="text"
                              placeholder="TAN Number"
                              className="form-control text-uppercase"
                              required
                            />
                            <span className="pe-1 text-danger d-none"></span>
                          </div>
                          <div className="col-lg-2 my-lg-0 my-2">
                            CIN Number
                          </div>
                          <div className="col-lg-2">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              name="cin_number"
                              id="cin_number"
                              type="text"
                              placeholder="CIN Number"
                              className="form-control text-uppercase"
                              required
                            />
                            <span className="pe-1 text-danger d-none"></span>
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
