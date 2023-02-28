import React, { useEffect, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import CommonFormFields from "./CommonFormFields";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";
import { rootTitle } from "../../CommonFunctions";

const Registration = () => {
  const goTo = useNavigate();
  const deselectStateInput = useRef();

  // useState to store ID of state so that we can validate zipCodes for each state.
  const [IdOfState, SetIdOfState] = useState("");

  // useState to store all states coming from api.
  const [states, setStates] = useState([]);
  // Function to get all states from api so that we can map states in select state field.
  const getAllSates = async () => {
    const allStates = await axios.get(`/sam/v1/property/by-state`);
    setStates(allStates.data);
  };

  // useState to store address Details.
  const [addressDetails, setAddressDetails] = useState({ zip: "" });

  // useState to store/remove and hide/show cities data.
  const [cityUseState, setCityUseState] = useState({
    citiesByState: [],
    cityVisibilityClass: "d-none",
  });

  // useState to store/remove and hide/show address details.
  const [addressValues, setAddressValues] = useState({
    addressValue: "",
    labelValue: "Add Details",
    textAreaVisibility: "d-none",
  });

  // Object destructuring.
  const {
    flat_number,
    building_name,
    society_name,
    plot_number,
    locality,
    landmark,
    village,
    state,
    city,
    zip,
  } = addressDetails;

  // useState to store each field's data from form.
  const [formData, setFormData] = useState({
    contact_details: {
      user_type: "Individual User",
      role_id: 2,
    },
  });

  // Store validation message and validation color based on input field.
  const [validationDetails, setValidationDetails] = useState({});

  const { citiesByState, cityVisibilityClass } = cityUseState;

  // Object destructuring.
  const {
    aadhaarValidationMessage,
    panValidationMessage,
    gstValidationMessage,
    tanValidationMessage,
    cinValidationMessage,
    zipCodeValidationColor,
    zipCodeValidationMessage,
  } = validationDetails;

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

  // Function to reset values.
  const resetValues = () => {
    let allInputs = document.querySelectorAll(".form-control");
    allInputs.forEach((i) => {
      i.style.borderColor = "";
      i.value = "";
    });
    setAddressDetails({
      flat_number: "",
      building_name: "",
      society_name: "",
      plot_number: "",
      locality: "",
      village: "",
      landmark: "",
      state: "",
      city: "",
      zip: "",
    });
    deselectStateInput.current.selected = true;
    setAddressValues({
      addressValue: "",
      labelValue: "Add Details",
      textAreaVisibility: "d-none",
    });
    setValidationDetails({});
    SetIdOfState("");
    setCityUseState({ citiesByState: [], cityVisibilityClass: "d-none" });
  };

  // Function will run on click of save button of address
  const onAddressFormSubmit = (e) => {
    e.preventDefault();
    let valuesArray = [
      flat_number ? `Flat No: ${flat_number}` : "",
      building_name ? `Building Name: ${building_name}` : "",
      society_name ? `Society Name: ${society_name}` : "",
      plot_number ? `Plot No: ${plot_number}` : "",
      `Locality: ${locality}`,
      `Landmark: ${landmark}`,
      `Village: ${village}`,
      `State: ${state}`,
      `City: ${city}`,
      `Zip Code: ${zip}`,
    ];

    let mainArray = [];
    for (let i of valuesArray) {
      if (i !== "") {
        mainArray.push(i);
      }
    }
    setAddressValues({
      addressValue: mainArray.join(", "),
      labelValue: "Edit Details",
      textAreaVisibility: "",
    });
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

  const showOrganizationForm = () => {
    resetValues();
    setFormData({
      ...formData,
      contact_details: { user_type: "Organizational User" },
    });

    // Reset form fields and validations.
    document.getElementById("individualForm").reset();
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
    resetValues();
    document.getElementById("organizationForm").reset();

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

  // Function to show backend validation on outside click of input filed.
  const onInputBlur = async (e) => {
    const { name, value, style } = e.target;
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
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          aadhaarValidationMessage: "Invalid Aadhaar Number.",
        });
        style.borderColor = "red";
      }
    } else if (name === "pan_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      // Pan frontend validation.
      let panFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (panFormat.test(value)) {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "",
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          panValidationMessage: "Invalid Pan Number.",
        });
        style.borderColor = "red";
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
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          gstValidationMessage: "Invalid GST Number Entered",
        });
        style.borderColor = "red";
      }
    } else if (name === "tan_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let tan_format = /^[a-zA-Z]{4}[0-9]{5}[a-zA-Z]{1}$/;
      if (tan_format.test(value)) {
        setValidationDetails({
          ...validationDetails,
          tanValidationMessage: "",
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          tanValidationMessage: "Invalid TAN Number Entered",
        });
        style.borderColor = "red";
      }
    } else if (name === "cin_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      let cin_format =
        /^[a-zA-Z]{1}[0-9]{5}[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{3}[0-9]{6}$/;
      if (cin_format.test(value)) {
        setValidationDetails({
          ...validationDetails,
          cinValidationMessage: "",
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          cinValidationMessage: "Invalid CIN Number Entered",
        });
        style.borderColor = "red";
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
    } else if (name === "state") {
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
          var emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          if (res.data.status === 1) {
            setValidationDetails({
              ...validationDetails,
              emailValidationMessage: "Email id already exists.",
            });
            style.borderColor = "red";
          } else if (!emailFormat.test(value)) {
            setValidationDetails({
              ...validationDetails,
              emailValidationMessage: "Invalid email Id.",
            });
            style.borderColor = "red";
          } else {
            setValidationDetails({
              ...validationDetails,
              emailValidationMessage: "",
            });
            style.borderColor = "";
          }
        });
    } else if (name === "landline_number") {
      if (value) {
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            [name]: parseInt(value),
          },
        });
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
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Mobile number already exists.",
            });
            style.borderColor = "red";
          } else if (res.data.status === 2) {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Invalid Mobile Number Entered.",
            });
            style.borderColor = "red";
          } else {
            // Store validation message and validation color.
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "",
            });
            style.borderColor = "";
          }
        });
    }
  };

  // Function to store address Details in a useState => addressDetails
  const setValues = (name, value) => {
    setAddressDetails({ ...addressDetails, [name]: value });
  };

  // This will run onchange of input field.
  const onInputChange = async (e) => {
    const { name, value, style } = e.target;
    if (name === "aadhar_number") {
      setValidationDetails({
        ...validationDetails,
        aadhaarValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "pan_number") {
      setValidationDetails({
        ...validationDetails,
        panValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "gst_number") {
      setValidationDetails({
        ...validationDetails,
        gstValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "tan_number") {
      setValidationDetails({
        ...validationDetails,
        tanValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "cin_number") {
      setValidationDetails({
        ...validationDetails,
        cinValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "flat_number") {
      setValues(name, value);
    } else if (name === "building_name") {
      setValues(name, value);
    } else if (name === "society_name") {
      setValues(name, value);
    } else if (name === "plot_number") {
      setValues(name, value);
    } else if (name === "locality") {
      setValues(name, value);
    } else if (name === "landmark") {
      setValues(name, value);
    } else if (name === "village") {
      setValues(name, value);
    } else if (name === "zip") {
      if (zipCodeValidationColor !== "danger") {
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            [name]: parseInt(value),
          },
        });
        setValues(name, value);
      }
      if (IdOfState !== "" && value !== "") {
        zipValidationByState(value, parseInt(IdOfState));
      }
    } else if (name === "email") {
      setValidationDetails({
        ...validationDetails,
        emailValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "mobile_number") {
      setValidationDetails({
        ...validationDetails,
        mobileValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "state") {
      addressDetails.city = "";
      if (value) {
        document.getElementById("selectedCity").selected = true;
        let stateName = "";
        let getStateName = document.getElementById(`state-name-${value}`);
        if (getStateName) {
          stateName = getStateName.innerText;
          setValues(name, stateName);
        }
        setFormData({
          ...formData,
          contact_details: { ...formData.contact_details, [name]: stateName },
        });
        const allCities = await axios.post(`/sam/v1/property/by-city`, {
          state_id: parseInt(value),
        });
        setCityUseState({
          citiesByState: allCities.data,
          cityVisibilityClass: "",
        });
        if (String(zip) !== "") {
          zipValidationByState(String(zip), parseInt(value));
        }
      }
    } else if (name === "city") {
      setValues(name, value);
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
          address: value,
        },
      });
    } else if (name === "flat_number") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
    } else if (name === "building_name") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "society_name") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "landmark") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "plot_number") {
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
    }
  };

  // Function will run after Individual Form submit button is clicked.
  const onIndividualFormSubmit = async (e) => {
    e.preventDefault();
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
    console.log(formData);

    if (addressValues.labelValue === "Add Details") {
      toast.error("Please Fill Address Details");
    } else {
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
    }
  };

  // Function will run after Organization Form submit button is clicked.
  const onOrganizationFormSubmit = async (e) => {
    e.preventDefault();
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
    console.log(formData);

    if (addressValues.labelValue === "Add Details") {
      toast.error("Please Fill Address Details");
    } else {
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
    }
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - REGISTER";
    resetValues();
    getAllSates();
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
                              type="Number"
                              placeholder="•••• •••• •••• ••••"
                              required
                              className="form-control"
                            />
                            <span
                              className={`pe-1 ${
                                aadhaarValidationMessage
                                  ? "text-danger"
                                  : "d-none"
                              } `}
                            >
                              {aadhaarValidationMessage}
                            </span>
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
                              className="form-control text-uppercase"
                            />
                            <span
                              className={`pe-1 ${
                                panValidationMessage ? "text-danger" : "d-none"
                              }`}
                            >
                              {panValidationMessage}
                            </span>

                            <span className="form-text">
                              <small>
                                (Please refer ex:ERTYG1235E pan number)
                              </small>
                            </span>
                          </div>
                        </div>
                        <CommonFormFields
                          validationDetails={validationDetails}
                          resetValues={resetValues}
                          addressValues={addressValues}
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
                              type="text"
                              placeholder="GST Number"
                              className="form-control text-uppercase"
                              required
                            />
                            <span
                              className={`pe-1 ${
                                gstValidationMessage ? "text-danger" : "d-none"
                              }`}
                            >
                              {gstValidationMessage}
                            </span>
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
                              className="form-control text-uppercase"
                              required
                            />
                            <span
                              className={`pe-1 ${
                                tanValidationMessage ? "text-danger" : "d-none"
                              }`}
                            >
                              {tanValidationMessage}
                            </span>
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
                              className="form-control text-uppercase"
                              required
                            />
                            <span
                              className={`pe-1 ${
                                cinValidationMessage ? "text-danger" : "d-none"
                              }`}
                            >
                              {cinValidationMessage}
                            </span>
                          </div>
                        </div>
                        <CommonFormFields
                          validationDetails={validationDetails}
                          resetValues={resetValues}
                          addressValues={addressValues}
                          onInputChange={onInputChange}
                          onInputBlur={onInputBlur}
                        />
                      </div>
                    </form>
                  </div>
                </div>
                <small className="token-verify-link">
                  Already registered?
                  <NavLink to="/register/verify" className="fw-bold ps-1">
                    click here to verify
                  </NavLink>
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <div
          className="modal fade registration-address-modal"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Address
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="flat_number"
                        name="flat_number"
                        type="number"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Flat Number"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="building_name"
                        name="building_name"
                        type="text"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Building Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="society_name"
                        name="society_name"
                        type="text"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Society Name"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="plot_number"
                        name="plot_number"
                        type="number"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Plot Number"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <input
                      onBlur={onInputBlur}
                      id="locality"
                      name="locality"
                      type="text"
                      className="form-control "
                      onChange={onInputChange}
                      placeholder="Locality, Area"
                    />
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="landmark"
                        name="landmark"
                        type="text"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Landmark"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        id="village"
                        name="village"
                        type="text"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Village"
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <select
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        id="state"
                        name="state"
                        type="text"
                        className="form-select"
                        placeholder="State"
                      >
                        <option
                          ref={deselectStateInput}
                          value=""
                          style={{ color: "gray" }}
                        >
                          State
                        </option>
                        {states
                          ? states.map((state, Index) => {
                              return (
                                <option
                                  id={`state-name-${state.state_id}`}
                                  key={Index}
                                  value={state.state_id}
                                >
                                  {state.state_name}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                  <div className={`col-md-4 ${cityVisibilityClass}`}>
                    <div className="form-group mb-3">
                      <select
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        id="city"
                        name="city"
                        type="text"
                        className="form-select"
                        placeholder="city"
                      >
                        <option
                          id="selectedCity"
                          value=""
                          style={{ color: "gray" }}
                        >
                          City
                        </option>
                        {citiesByState
                          ? citiesByState.map((city, Index) => {
                              return (
                                <option key={Index} value={city.city_name}>
                                  {city.city_name}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        onChange={onInputChange}
                        id="zip"
                        onBlur={onInputBlur}
                        placeholder="Zipcode"
                        name="zip"
                        className={`form-control border-${zipCodeValidationColor}`}
                      ></input>
                      <span
                        className={`pe-1 ${
                          zipCodeValidationMessage ? "text-danger" : "d-none"
                        }`}
                      >
                        {zipCodeValidationMessage}
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={onAddressFormSubmit}
                      className={`btn btn-primary ${
                        locality &&
                        village &&
                        landmark &&
                        state &&
                        city &&
                        zip &&
                        zipCodeValidationColor !== "danger"
                          ? ""
                          : "disabled"
                      }`}
                      data-bs-dismiss="modal"
                    >
                      Save
                    </button>
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
