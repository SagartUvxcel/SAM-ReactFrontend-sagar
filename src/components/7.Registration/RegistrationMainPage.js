import React, { useEffect, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import CommonFormFields from "./CommonFormFields";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";
import { rootTitle } from "../../CommonFunctions";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import ReactSelect from "react-select";

// regular expression
const landlineNumberRegularExp = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

const Registration = () => {
  const [zipCity, setZipCity] = useState(""); // City input value
  const [zipCodes, setZipCodes] = useState([]); // List of zip codes based on entered city 
  const [isCustomZip, setIsCustomZip] = useState(false);
  const [customZip, setCustomZip] = useState("");
  const goTo = useNavigate();
  const deselectStateInput = useRef();

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const updatedCountry = localStorage.getItem("location");
  const country_ID = updatedCountry === "india" ? 1 : 11;
  const [countryId, setCountryId] = useState(country_ID);
  const [countryFlag, setCountryFlag] = useState(
    updatedCountry === "india" ? "in" : "my"
  );
  const [loading, setLoading] = useState(false);

  const { alertMsg, alertClr, alertVisible } = alertDetails;
  // useState to store all states coming from api.
  const [states, setStates] = useState([]);
  // Function to get all states from api so that we can map states in select state field.
  const getAllSates = async () => {
    const postData = { country_id: parseInt(countryId) };
    try {
      const allStates = await axios.post(`/sam/v1/property/by-state`, postData);
      setStates(allStates.data);
    } catch (error) {
      console.log(error);
    }
  };

  // useState to store address Details.
  const [addressDetails, setAddressDetails] = useState({ zip: "" });
  // Object destructuring.
  const {
    flat_number,
    building_name,
    society_name,
    plot_number,
    locality,
    landmark,
    state,
    city,
    zip,
  } = addressDetails;

  //fetch zip code
  const fetchZipCodes = async (zipCity) => {
    if (zipCity) {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/postoffice/${zipCity}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); 

        if (data && data[0] && data[0].PostOffice) {
          const postOffices = data[0].PostOffice;
          const pinCodes = postOffices.map((po) => po.Pincode);           
          setZipCodes(pinCodes); // Set the zip codes in state 
        } else {
          setZipCodes([]); // Reset zip codes if no post office found 
        }
      } catch (error) {
        console.error("Error fetching zip codes:", error.message);
        setZipCodes([]); // Reset zip codes on error
      }
    } else {
      console.log("Please enter a valid city.");
    }
  };

  // useState to store/remove and hide/show cities data.
  const [cityUseState, setCityUseState] = useState({
    citiesByState: [],
    cityVisibilityClass: "d-none",
  });
  const { citiesByState, cityVisibilityClass } = cityUseState;

  // useState to store/remove and hide/show address details.
  const [addressValues, setAddressValues] = useState({
    addressValue: "",
    labelValue: "Add Details",
    textAreaVisibility: "d-none",
  });

  // useState to store each field's data from form.
  const [formData, setFormData] = useState({
    contact_details: {
      user_type: "Individual User",
    },
    country_id: countryId,
  });

  // Store validation message and validation color based on input field.
  const [validationDetails, setValidationDetails] = useState({});

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
    individualActiveClass: "active",
    organizationActiveClass: "",
    individualDisplay: "",
    organizationDisplay: "d-none",
  });

  // Object destructuring.
  const {
    individualActiveClass,
    organizationActiveClass,
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
      // village: "",
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
      `State: ${state}`,
      `City: ${city}`,
      zip === "other" ? `Zip Code: ${customZip}` : `Zip Code: ${zip}`,
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

  // show Individual Form
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
      individualActiveClass: "active",
      organizationActiveClass: "",
      individualDisplay: "",
      organizationDisplay: "d-none",
    });
  };

  // show Organization Form  
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
      individualActiveClass: "",
      organizationActiveClass: "active",
      individualDisplay: "d-none",
      organizationDisplay: "",
    });
  };

  // Function to show individual form or organization or bank form on click of label.
  const changeForm = (e) => {
    const attrOfForm = e.target.getAttribute("name");
    if (attrOfForm === "organization") {
      showOrganizationForm();
    } else if (attrOfForm === "individual") {
      showIndividualForm();
    }
  };

  // handle Focus
  const handleFocus = (e) => {
    const refTarget = e.target.nextSibling;
    if (refTarget) {
      refTarget.classList.add("active");
    }
  };
  const handleInputFocus = (e) => {
    const Tra = e.target.closest(".custom-input").nextSibling;
    if (Tra) {
      Tra.classList.add("active");
    }
  };

  // handle Click
  const handleClick = (inputId) => {
    const input = document.getElementById(inputId);
    input.focus();
  };

  // Function to show backend validation on outside click of input filed.
  const onInputBlur = async (e) => {
    const { name, value, style } = e.target;
    if (!value) {
      const target = e.target.nextSibling;
      if (target) {
        target.classList.add("active");
      }
    }
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
    } else if (name === "country_id") {
      setFormData({ ...formData, [name]: value });
      setCountryId(value);
      const flag = `${parseInt(value) === 1 ? "in" : "my"}`;
      setCountryFlag(flag);
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
    } else if (name === "landmark") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
    } else if (name === "locality") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
    } else if (name === "email") {
      setFormData({
        ...formData,
        contact_details: { ...formData.contact_details, [name]: value },
      });
      // If input field is email then post its value to api for validating.
      try {
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
      } catch (error) {
        toast.error("Server error while validating email");
      }
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
    }
  };

  // Function to store address Details in a useState => addressDetails
  const setValues = (name, value) => {
    setAddressDetails({ ...addressDetails, [name]: value });
  };

  // on Mobile Number Input Change
  const onMobileNumberInputChange = () => {
    setValidationDetails({
      ...validationDetails,
      mobileValidationMessage: "",
    });
  };

  // on Mobile Number Input Blur
  const onMobileNumberInputBlur = (e) => {
    let parsedPhoneNumber = parsePhoneNumberFromString(e.target.value);
    let isValid = parsedPhoneNumber ? parsedPhoneNumber.isValid() : false;
    let finalValue = parsedPhoneNumber ? parsedPhoneNumber.number : null;
    if (!isValid) {
      setValidationDetails({
        ...validationDetails,
        mobileValidationMessage: "Invalid Mobile Number Entered.",
      });
    } else {
      if (finalValue) {
        validateMobileFromBackend(finalValue);
      }
    }

    setFormData({
      ...formData,
      contact_details: {
        ...formData.contact_details,
        mobile_number: finalValue,
      },
    });
  };

  // validate Mobile From Backend
  const validateMobileFromBackend = async (mobileValue) => {
    try {
      await axios
        .post(
          `/sam/v1/customer-registration/mobilenumber-validation`,
          JSON.stringify({ mobile_number: mobileValue })
        )
        .then((res) => {
          let status = res.data.status;
          if (status === 4) {
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Invalid Mobile Number Entered.",
            });
          } else if (status === 2) {
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "Mobile number already exists.",
            });
          } else if (status === 0) {
            setValidationDetails({
              ...validationDetails,
              mobileValidationMessage: "",
            });
          }
        });
    } catch (error) {
      toast.error("Server error while validating mobile");
      setValidationDetails({
        ...validationDetails,
        mobileValidationMessage: "",
      });
    }
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
    } else if (name === "country_id") {
      const flag = `${parseInt(value) === 1 ? "in" : "my"}`;
      setFormData({ ...formData, [name]: value });
      setCountryId(value);
      setCountryFlag(flag);
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
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      }); 
    } else if (name === "building_name") {
      setValues(name, value);
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "society_name") {
      setValues(name, value);
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "plot_number") {
      setValues(name, value);
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
    } else if (name === "locality") {
      setValues(name, value);
    } else if (name === "landmark") {
      setValues(name, value);
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "zip") {
      // Handle the "Other" ZIP option 
      if (value === "other") {
        setIsCustomZip(true);
        setCustomZip("");
      } else {
        // Hide the custom ZIP input and set selected ZIP
        setIsCustomZip(false);

        // Update form data with the selected ZIP code
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            [name]: parseInt(value),
          },
        });
      }

      // Update form state
      setValues(name, value);
    } else if (name === "customZip") {
      setCustomZip(value);

      // Validate the custom ZIP code (assuming a 6-digit ZIP is required)
      if (value.length !== 6 || isNaN(value)) {
        setValidationDetails({
          ...validationDetails,
          zipCodeValidationMessage: "Invalid ZipCode.",
          zipCodeValidationColor: "danger",
        });
      } else {
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            zip: parseInt(value),
          },
        });
        setValidationDetails({
          ...validationDetails,
          zipCodeValidationMessage: "",
          zipCodeValidationColor: "",
        });
      }
    } else if (name === "email") {
      setValidationDetails({
        ...validationDetails,
        emailValidationMessage: "",
      });
      style.borderColor = "";
    } else if (name === "state") {
      addressDetails.city = "";

      if (value) {
        let stateName =
          states.find((state) => state.state_id === parseInt(value))
            ?.state_name || "";

        if (stateName) {
          setValues(name, stateName);
        }

        // Update form data with the selected state
        setFormData((prevData) => ({
          ...prevData,
          contact_details: {
            ...prevData.contact_details,
            [name]: parseInt(value),
          },
        }));

        // Fetch cities for the selected state
        const allCities = await axios.post(`/sam/v1/property/by-city`, {
          state_id: parseInt(value),
        });

        setCityUseState({
          citiesByState: allCities.data,
          cityVisibilityClass: "",
        });
      }
    } else if (name === "city") {
      let cityName =
        citiesByState.find((city) => city.city_id === parseInt(value))
          ?.city_name || "";

      if (cityName) {
        setZipCity(cityName);
        setValues(name, cityName);
      }

      if (value !== "") {
        setFormData((prevData) => ({
          ...prevData,
          contact_details: {
            ...prevData.contact_details,
            [name]: parseInt(value),
          },
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          contact_details: {
            ...prevData.contact_details,
            [name]: value,
          },
        }));
      }
    }
    else if (name === "landline_number") {
      if (landlineNumberRegularExp.test(value) || value.length === 0) {
        setValidationDetails({
          ...validationDetails,
          landlineNumberValidationMessage: "",
        });
        style.borderColor = "";
      } else {
        setValidationDetails({
          ...validationDetails,
          landlineNumberValidationMessage: "Invalid Landline Number Entered",
        });
        style.borderColor = "red";
      }
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

    if (addressValues.labelValue === "Add Details") {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Please fill the address details",
        alertClr: "danger",
      });
    } else {
      setLoading(true);

      console.log(formData);
      try {
        await axios
          .post(`/sam/v1/customer-registration/individual-customer`, formData)
          .then(async (res) => {
            if (res.data.status === 0) {
              setLoading(false);
              document
                .getElementById("registration-alert")
                .scrollIntoView(true);
              toast.success(
                `Success: Please check your email for verification.`
              );
              e.target.reset();
              resetValues();
              goTo("/register/verify");
            } else {
              setLoading(false);
              setAlertDetails({
                alertVisible: true,
                alertMsg: "Internal server error",
                alertClr: "warning",
              });
            }
          });
      } catch (error) {
        setLoading(false);
        setAlertDetails({
          alertVisible: true,
          alertMsg: "Internal server error",
          alertClr: "warning",
        });
      }
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

    if (addressValues.labelValue === "Add Details") {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Please fill the address details",
        alertClr: "danger",
      });
    } else {
      setLoading(true);
      console.log(formData);
      try {
        await axios
          .post(`/sam/v1/customer-registration/org-customer`, formData)
          .then(async (res) => {
            if (res.data.status === 0) {
              document
                .getElementById("registration-alert")
                .scrollIntoView(true);
              setLoading(false);
              toast.success(
                `Success: Please check your email for verification.`
              );
              e.target.reset();
              resetValues();
              goTo("/register/verify");
            } else {
              setLoading(false);
              setAlertDetails({
                alertVisible: true,
                alertMsg: "Internal server error",
                alertClr: "warning",
              });
            }
          });
      } catch (error) {
        setLoading(false);
        setAlertDetails({
          alertVisible: true,
          alertMsg: "Internal server error",
          alertClr: "warning",
        });
      }
    }
  };

  useEffect(() => {
    getAllSates();
    // eslint-disable-next-line
  }, [countryId]);

  useEffect(() => {
    if (zipCity) {
      fetchZipCodes(zipCity); // Fetch ZIP codes when the city is selected
    }
  }, [zipCity]);

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - REGISTER";
    resetValues();
    getAllSates();
    // eslint-disable-next-line
  }, []); 
  

  return (
    <Layout>
      <section className="registration-wrapper min-100vh section-padding">
        <div className="container-fluid">
          <div className="row justify-content-center ">
            <div className="col-lg-12 mt-4">
              <div className="card form-wrapper-card shadow pt-3 pb-5 px-lg-4 ps-0">
                <div className="container-fluid registration-form-container mb-5">
                  <div className="row">
                    {/* Individual Form Heading */}
                    <div className="col-lg-12">
                      <h4 className="fw-bold">New Customer Register</h4>
                      <hr />
                    </div>
                    {/*  Checkboxes - Individual & Organization */}
                    <div className="col-lg-12 d-flex">
                      <div
                        className={`individual-label common-btn-font ${individualActiveClass}`}
                        name="individual"
                        onClick={changeForm}
                      >
                        Individual
                      </div>
                      <div className="mx-2">|</div>
                      <div
                        className={`organization-label common-btn-font ${organizationActiveClass}`}
                        name="organization"
                        onClick={changeForm}
                      >
                        Organization
                      </div>
                    </div>
                    <div className="col-12">
                      <hr />
                    </div>
                    <div className="col-12" id="registration-alert">
                      <div
                        className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? "" : "d-none"
                          }`}
                        role="alert"
                      >
                        <span>
                          <i
                            className={`bi bi-exclamation-triangle-fill me-2 ${alertClr === "danger" || alertClr === "warning"
                              ? ""
                              : "d-none"
                              }`}
                          ></i>
                        </span>
                        <small className="fw-bold">{alertMsg}</small>
                        <i
                          onClick={() =>
                            setAlertDetails({ alertVisible: false })
                          }
                          className="bi bi-x login-alert-close-btn close"
                        ></i>
                      </div>
                    </div>

                    {/* Individual Main Form */}
                    <form
                      id="individualForm"
                      onSubmit={onIndividualFormSubmit}
                      className={`row ${individualDisplay} IndividualForm`}
                    >
                      <div className="col-lg-12">
                        {/* Full Name */}
                        <div className="row fullNameRow mb-2">
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="first_name"
                              type="text"
                              id="first_name"
                              className="form-control custom-input "
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="first_name"
                              onClick={() => handleClick("first_name")}
                            >
                              First Name<span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="middle_name"
                              type="text"
                              id="middle_name"
                              className="form-control custom-input "
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="middle_name"
                              onClick={() => handleClick("middle_name")}
                            >
                              Middle Name<span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              id="last_name"
                              onFocus={handleFocus}
                              name="last_name"
                              type="text"
                              className="form-control custom-input "
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="last_name"
                              onClick={() => handleClick("last_name")}
                            >
                              Last Name<span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        {/* Aadhaar Pan */}
                        <div className="row aadhaarPanRow mt-2">
                        {/* Aadhaar */}
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="aadhar_number"
                              type="Number"
                              id="aadhar_number"
                              required
                              className="form-control custom-input "
                            />
                            <label
                              className="px-2"
                              htmlFor="aadhar_number"
                              onClick={() => handleClick("aadhar_number")}
                            >
                              Aadhaar Number
                              <span className="text-danger">*</span>
                            </label>
                            <span
                              className={`pe-1 ${aadhaarValidationMessage
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
                          {/* Pan */}
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="pan_number"
                              id="pan_number"
                              type="text"
                              required
                              className="form-control text-uppercase custom-input"
                            />
                            <label
                              className="px-2"
                              htmlFor="pan_number"
                              onClick={() => handleClick("pan_number")}
                            >
                              PAN Number<span className="text-danger">*</span>
                            </label>
                            <span
                              className={`pe-1 ${panValidationMessage ? "text-danger" : "d-none"
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
                          {/* country selection */}
                          <div className="col-lg-4 mb-4 custom-class-form-div ">
                            <select
                              onChange={onInputChange}
                              onFocus={handleFocus}
                              onBlur={onInputBlur}
                              id="country"
                              name="country_id"
                              type="text"
                              className="form-select custom-input"
                              value={formData.country_id}
                              required
                            >
                              <option
                                ref={deselectStateInput}
                                value=""
                                style={{ color: "gray" }}
                              ></option>
                              <option value={1}> India </option>
                              <option value={11}> Malaysia </option>
                              {/* {states
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
                          : ""} */}
                            </select>
                            <label
                              className="px-2 active"
                              htmlFor="country"
                              onClick={() => handleClick("country_id")}
                            >
                              Country <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <CommonFormFields
                          validationDetails={validationDetails}
                          resetValues={resetValues}
                          addressValues={addressValues}
                          onInputChange={onInputChange}
                          onInputBlur={onInputBlur}
                          handleFocus={handleFocus}
                          handleClick={handleClick}
                          loading={loading}
                          countryId={countryFlag}
                          onMobileNumberInputBlur={onMobileNumberInputBlur}
                          onMobileNumberInputChange={onMobileNumberInputChange}
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
                      <div className="col-lg-12">
                        <div className="row organization-type-row align-items-center">
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <select
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="organization_type"
                              id="organization_type"
                              className="form-select custom-input "
                              aria-label="Default select example"
                              required
                            >
                              <option value="" style={{ color: "gray" }}>
                                {/* Select Type */}
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
                            <label
                              className="px-2"
                              htmlFor="organization_type"
                              onClick={() => handleClick("organization_type")}
                            >
                              Select Organization Type
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="company_name"
                              id="company_name"
                              type="text"
                              className="form-control custom-input"
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="company_name"
                              onClick={() => handleClick("company_name")}
                            >
                              Organization Name
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="gst_number"
                              id="gst_number"
                              type="text"
                              className="form-control text-uppercase  custom-input"
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="gst_number"
                              onClick={() => handleClick("gst_number")}
                            >
                              GST Number<span className="text-danger">*</span>
                            </label>
                            <span
                              className={`pe-1 ${gstValidationMessage ? "text-danger" : "d-none"
                                }`}
                            >
                              {gstValidationMessage}
                            </span>
                          </div>
                        </div>

                        {/* TAN & CIN */}
                        <div className="row  mt-lg-3 mt-2 align-items-center">
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="tan_number"
                              id="tan_number"
                              type="text"
                              className="form-control text-uppercase  custom-input"
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="tan_number"
                              onClick={() => handleClick("tan_number")}
                            >
                              TAN Number<span className="text-danger">*</span>
                            </label>
                            <span
                              className={`pe-1 ${tanValidationMessage ? "text-danger" : "d-none"
                                }`}
                            >
                              {tanValidationMessage}
                            </span>
                          </div>
                          <div className="col-lg-4 mb-4 custom-class-form-div">
                            <input
                              onChange={onInputChange}
                              onBlur={onInputBlur}
                              onFocus={handleFocus}
                              name="cin_number"
                              id="cin_number"
                              type="text"
                              className="form-control text-uppercase  custom-input"
                              required
                            />
                            <label
                              className="px-2"
                              htmlFor="cin_number"
                              onClick={() => handleClick("cin_number")}
                            >
                              CIN Number<span className="text-danger">*</span>
                            </label>
                            <span
                              className={`pe-1 ${cinValidationMessage ? "text-danger" : "d-none"
                                }`}
                            >
                              {cinValidationMessage}
                            </span>
                          </div>
                          {/* country selection */}
                          <div className="col-lg-4 mb-4 custom-class-form-div ">
                            <select
                              onChange={onInputChange}
                              onFocus={handleFocus}
                              onBlur={onInputBlur}
                              id="country"
                              name="country_id"
                              type="text"
                              className="form-select custom-input"
                              value={formData.country_id}
                              required
                            >
                              <option
                                ref={deselectStateInput}
                                value=""
                                style={{ color: "gray" }}
                              ></option>
                              <option value={1}> India </option>
                              <option value={11}> Malaysia </option>
                              {/* {states
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
                          : ""} */}
                            </select>
                            <label
                              className="px-2 active"
                              htmlFor="country"
                              onClick={() => handleClick("country_id")}
                            >
                              Country <span className="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <CommonFormFields
                          validationDetails={validationDetails}
                          resetValues={resetValues}
                          addressValues={addressValues}
                          onInputChange={onInputChange}
                          onInputBlur={onInputBlur}
                          handleFocus={handleFocus}
                          handleClick={handleClick}
                          loading={loading}
                          countryId={countryFlag}
                          onMobileNumberInputBlur={onMobileNumberInputBlur}
                          onMobileNumberInputChange={onMobileNumberInputChange}
                        />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Already registered? */}
                <small className="token-verify-link ">
                  <div>
                    {" "}
                    Already registered?
                    <NavLink to="/register/verify" className="fw-bold ps-1">
                      click here to verify
                    </NavLink>
                  </div>
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
                  {/* Flat Number */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        id="flat_number"
                        name="flat_number"
                        type="number"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                      />
                      <label
                        className="px-2"
                        htmlFor="flat_number"
                        onClick={() => handleClick("flat_number")}
                      >
                        Flat Number{" "}
                      </label>
                    </div>
                  </div>
                  {/* Building Name */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        id="building_name"
                        name="building_name"
                        type="text"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                      />
                      <label
                        className="px-2"
                        htmlFor="building_name"
                        onClick={() => handleClick("building_name")}
                      >
                        Building Name{" "}
                      </label>
                    </div>
                  </div>
                  {/* Society Name */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        id="society_name"
                        name="society_name"
                        type="text"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                      />

                      <label
                        className="px-2"
                        htmlFor="society_name"
                        onClick={() => handleClick("society_name")}
                      >
                        Society Name{" "}
                      </label>
                    </div>
                  </div>
                  {/*  Plot Number */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        id="plot_number"
                        name="plot_number"
                        type="number"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                      />

                      <label
                        className="px-2"
                        htmlFor="plot_number"
                        onClick={() => handleClick("plot_number")}
                      >
                        {" "}
                        Plot Number{" "}
                      </label>
                    </div>
                  </div>
                  {/* Locality */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        onBlur={onInputBlur}
                        id="locality"
                        name="locality"
                        type="text"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onFocus={handleFocus}
                      />
                      <label
                        className="px-2"
                        htmlFor="locality"
                        onClick={() => handleClick("locality")}
                      >
                        Locality<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  {/* Landmark */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <input
                        id="landmark"
                        name="landmark"
                        type="text"
                        className="form-control custom-input "
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                      />
                      <label
                        className="px-2"
                        htmlFor="landmark"
                        onClick={() => handleClick("landmark")}
                      >
                        Landmark <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  {/* State Code */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <ReactSelect
                        id="state"
                        name="state"
                        className="custom-input"
                        options={states?.map((state) => ({
                          value: state.state_id,
                          label: state.state_name,
                        }))}
                        onChange={(selectedOption) => {
                          onInputChange({
                            target: {
                              name: "state",
                              value: selectedOption.value,
                              label: selectedOption.label,
                            },
                          });
                        }}
                        onFocus={handleInputFocus}
                        onBlur={onInputBlur}
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            color: "transparent",
                          }),
                        }}
                      />
                      <label
                        className="px-2"
                        htmlFor="state"
                        onClick={() => handleClick("state")}
                      >
                        State <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  {/* City Code */}
                  <div
                    className={`col-md-6 my-md-2 my-4 ${cityVisibilityClass}`}
                  >
                    <div className="form-group mb-3 custom-class-form-div">
                      <ReactSelect
                        id="city"
                        name="city"
                        className="custom-input"
                        options={citiesByState?.map((city) => ({
                          value: city.city_id, // Value sent to the onChange function (city ID)
                          label: city.city_name, // Displayed label for the dropdown (city name)
                        }))}
                        onChange={(selectedOption) => {
                          if (selectedOption) {
                            // Pass the city ID and name to onInputChange
                            onInputChange({
                              target: {
                                name: "city",
                                value: selectedOption.value, // Store city ID
                              },
                            });
                            setZipCity(selectedOption.label); // Store the city name
                          }
                        }}
                        onFocus={handleInputFocus}
                        onBlur={onInputBlur}
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            color: "transparent",
                          }),
                        }}
                      />
                      <label
                        className="px-2"
                        htmlFor="city"
                        onClick={() => handleClick("city")}
                      >
                        City <span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  {/* ZIP Code */}
                  <div className="col-md-6 my-md-2 my-4">
                    <div className="form-group mb-3 custom-class-form-div">
                      <ReactSelect
                        id="zip"
                        name="zip"
                        className={`custom-input border-${zipCodeValidationColor}`}
                        options={[
                          ...zipCodes.map((zip) => ({
                            value: zip,
                            label: zip,
                          })),
                          { value: "other", label: "Other" },
                        ]}
                        onChange={(selectedOption) => {
                          onInputChange({
                            target: {
                              name: "zip",
                              value: selectedOption.value,
                            },
                          });
                        }}
                        onFocus={handleInputFocus}
                        onBlur={onInputBlur}
                        // Customize the placeholder color
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            color: "transparent",
                          }),
                        }}
                      />
                      <label
                        className="px-2"
                        htmlFor="zip"
                        onClick={() => handleClick("zip")}
                      >
                        Zip Code <span className="text-danger">*</span>
                      </label>

                      {/* Show custom ZIP input when "Other" is selected */}
                      {isCustomZip && (
                        <input
                          type="text"
                          name="customZip"
                          value={customZip}
                          onChange={onInputChange}
                          className={`form-control mt-2 border-${zipCodeValidationColor}`}
                          placeholder="Enter your ZIP code"
                        />
                      )}
                      {/* Validation message for the ZIP code */}
                      <span
                        className={`pe-1 ${zipCodeValidationMessage ? "text-danger" : "d-none"
                          }`}
                      >
                        {zipCodeValidationMessage}
                      </span>
                    </div>
                  </div>

                  <div className="modal-footer justify-content-between">
                    <p className="text-secondary">
                      All fields marked with an asterisk (
                      <span className="text-danger fw-bold">*</span>) are
                      mandatory.
                    </p>
                    <button
                      onClick={onAddressFormSubmit}
                      className={`btn btn-primary ${locality &&
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
