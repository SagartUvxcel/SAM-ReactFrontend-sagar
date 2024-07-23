import React, { useState, useEffect, useRef } from 'react'
import Layout from "../../components/1.CommonLayout/Layout";
import axios from "axios";
import { NavLink, useNavigate, } from "react-router-dom";
import "react-phone-input-2/lib/style.css";
import bankRegistrationLinkPage from "../../images/bankRegistrationLinkPage.svg";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import { rootTitle } from "../../CommonFunctions";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Loader from "../../components/1.CommonLayout/Loader";


const bankNameRegularExp = /^[A-Za-z0-9&\s.-]+$/
const branchNameRegularExp = /^[A-Za-z0-9\s\-&.,'()]+/
const emailUserNameRegularExp = /^[a-zA-Z0-9._]+$/
const branchCodeRegularExp = /^\d{1,5}$/
const ifscCodeRegularExp = /^[A-Z]{4}0\d{6}$/
const branchSftpRegularExp = /^[A-Za-z0-9_-]+$/
const branchUUIDRegularExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const landlineNumberRegularExp = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/



const BankRegistrationPage = () => {

    const goTo = useNavigate();
    const deselectStateInput = useRef();
    const navigate = useNavigate();
    const updatedCountry = localStorage.getItem("location");

    // on input focus
    const handleFocus = (e) => {
        e.target.nextSibling.classList.add('active');
    };
    // on input click
    const handleClick = (inputId) => {
        const input = document.getElementById(inputId);
        input.focus();
    };
    const [validationDetails, setValidationDetails] = useState({});
    // Object destructuring.
    const {
        zipCodeValidationMessage,
        zipCodeValidationColor,
        landlineNumberValidationMessage,
        landlineNumberValidationColor,
    } = validationDetails;
    const [showLoader, setShowLoader] = useState(true);
    const { emailValidationMessage, mobileValidationMessage } = validationDetails;
    const [loading, setLoading] = useState(false);
    const [alertDetails, setAlertDetails] = useState({
        alertVisible: false,
        alertMsg: "",
        alertClr: "",
    });
    const { alertMsg, alertClr, alertVisible } = alertDetails;
    const [bankEmailFromURL, setBankEmailFromURL] = useState(null);
    const [splittedBankEmailId, setSplittedBankEmailId] = useState({
        userName: "",
        domain: ""
    });
    const [bankRegistrationPageDisplay, setBankRegistrationPageDisplay] = useState({
        display: false,
    });

    // useState to store each field's data from form.
    const [formData, setFormData] = useState({
        contact_details: {
        },
    });
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
    const { addressValue, labelValue, textAreaVisibility } = addressValues;
    // useState to store ID of state so that we can validate zipCodes for each state.
    const [IdOfState, SetIdOfState] = useState("");

    // useState to store all states coming from api.
    const [states, setStates] = useState([]);


    // get email Token From URL
    let tokenFromEmailUrl = "";
    const getEmailTokenFromURL = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        tokenFromEmailUrl = urlParams.get("token");
        if (tokenFromEmailUrl) {
            const emailToken = tokenFromEmailUrl;
            // posting data 
            const dataToPost = JSON.stringify({ token: emailToken })
            try {
                await axios.post(`/sam/v1/bank-registration/branch/token/verify`, dataToPost)
                    .then((res) => {

                        if (res.data) {
                            const email = res.data.email;
                            const bank_name = res.data.bank_name;
                            const branch_code = res.data.branch_code;
                            const branch_name = res.data.branch_name;
                            const branch_sftp = res.data.branch_sftp
                            const ifsc_code = res.data.ifsc_code;
                            const is_bank_admin = res.data.is_bank_admin;
                            if (email && bank_name) {
                                const splitedEmail = email.split('@')
                                const emailDomainPart = "@" + splitedEmail[1];
                                setSplittedBankEmailId({ userName: splitedEmail[0], domain: emailDomainPart });
                                setBankEmailFromURL({ bank_name, email, branch_code, branch_name, branch_sftp, ifsc_code, is_bank_admin });
                                setFormData({ ...formData, bank_name, email, branch_code, branch_name, branch_sftp, ifsc_code, is_bank_admin });
                                setBankRegistrationPageDisplay({
                                    display: true,
                                });
                                setShowLoader(false);

                            } else {
                                setBankRegistrationPageDisplay({
                                    display: false,
                                });
                                setShowLoader(false);
                                navigate("/access-denied");
                            }
                            localStorage.setItem("bankRegistrationEmail", email);
                        }
                    });
            } catch (error) {
                setShowLoader(false);
                toast.error("failed to send token data for link validation.")
            }
        } else {
            setShowLoader(false);
            navigate("/access-denied");
        }

    };

    // Function to get all states from api so that we can map states in select state field.
    const getAllSates = async () => {
        const countryId = updatedCountry === "india" ? 1 : 11;
        const postData = { "country_id": countryId }
        try {
            const allStates = await axios.post(`/sam/v1/property/by-state`, postData);
            setStates(allStates.data);
        } catch (error) { }
    };

    // Function to show backend validation on outside click of input filed.
    const onInputBlur = async (e) => {
        const { name, value, style } = e.target;
        if (!value) {
            e.target.nextSibling.classList.remove('active');
        }
        if (name === "bank_name") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "branch_name") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "branch_code") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "ifsc_code") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "branch_sftp") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "branch_UUID") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "branch_address") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "locality") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "plot_number") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: parseInt(value) },
            });
        } else if (name === "zip") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: parseInt(value) },
            });
        } else if (name === "city") { 
            if (value !== "") {
                setFormData({
                    ...formData,
                    contact_details: { ...formData.contact_details, [name]: parseInt(value) },
                });
            } else {
                setFormData({
                    ...formData,
                    contact_details: { ...formData.contact_details, [name]: value },
                });
            }

        } else if (name === "society_name") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "building_name") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "landmark") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "flat_number") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: parseInt(value) },
            });
        } else if (name === "state") {
            SetIdOfState(value);
        } else if (name === "email") {
            const emailValue = value + splittedBankEmailId.domain;
            setSplittedBankEmailId({ ...splittedBankEmailId, userName: value })
            setFormData({ ...formData, [name]: emailValue }
            );
            // If input field is email then post its value to api for validating.
            try {
                await axios
                    .post(
                        `/sam/v1/customer-registration/email-validation`,
                        JSON.stringify({ email: emailValue })
                    )
                    .then((res) => {
                        var emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
                        if (res.data.status === 1) {
                            setValidationDetails({
                                ...validationDetails,
                                emailValidationMessage: "Email id already exists.",
                            });
                            style.borderColor = "red";
                        } else if (!emailFormat.test(emailValue)) {
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
                setFormData({ ...formData, [name]: value });
            }
        }
    }; 
    // Function to store address Details in a useState => addressDetails
    const setValues = (name, value) => { 
        setAddressDetails({ ...addressDetails, [name]: value });
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

    // onMobile Number Input Change
    const onMobileNumberInputChange = () => {
        setValidationDetails({
            ...validationDetails,
            mobileValidationMessage: "",
        });
    };

    // onMobile Number Input Blur
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
        setFormData({ ...formData, mobile_number: finalValue, });
    };

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

    // Function to validate zipCodes.
    const zipValidationByState = async (zipValue, stateId) => {
        let zipCodeValue = zipValue;
        await axios
            .post(`/sam/v1/customer-registration/zipcode-validation`, {
                zipcode: zipCodeValue,
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

    // This will run onchange of input field.
    const onInputChange = async (e) => {
        const { name, value, style } = e.target;
        if (name === "bank_name") {
            if (bankNameRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    bankNameValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    bankNameValidationMessage: "Invalid Bank Name Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "branch_name") {
            if (branchNameRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchNameValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchNameValidationMessage: "Invalid Branch Name Entered",
                });
                style.borderColor = "red";
            }

        } else if (name === "branch_code") {
            if (branchCodeRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchCodeValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchCodeValidationMessage: "Invalid Branch code Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "ifsc_code") {
            if (ifscCodeRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    ifscCodeValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    ifscCodeValidationMessage: "Invalid IFSC code Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "branch_sftp") {
            if (branchSftpRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchSftpValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchSftpValidationMessage: "Invalid SFTP code Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "branch_UUID") {
            if (branchUUIDRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchUUIDValidationMessage: "",
                });
                style.borderColor = "";
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchUUIDValidationMessage: "Invalid UUID Number Entered",
                });
                style.borderColor = "red";
            }
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
        } else if (name === "landline_number") {
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
            setFormData({
                ...formData,
                contact_details: {
                    ...formData.contact_details,
                    [name]: parseInt(value),
                },
            });
            setValues(name, value);

            if (IdOfState !== "" && value !== "") {
                zipValidationByState(value, parseInt(IdOfState));
            }
        } else if (name === "email") {
            const emailValue = value + splittedBankEmailId.domain;
            setSplittedBankEmailId({ ...splittedBankEmailId, userName: value })

            if (emailUserNameRegularExp.test(value)) {
                setValidationDetails({
                    ...validationDetails,
                    emailValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: emailValue })
            } else {
                setValidationDetails({
                    ...validationDetails,
                    emailValidationMessage: "Invalid email Id.",
                });
                style.borderColor = "red";
            }
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
                if (value !== "") {
                    setFormData({
                        ...formData,
                        contact_details: {
                            ...formData.contact_details,
                            [name]: parseInt(value),
                        },
                    });
                } else {
                    setValues(name, stateName);
                    setFormData({
                        ...formData,
                        contact_details: {
                            ...formData.contact_details,
                            [name]: value,
                        },
                    });
                }
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
            let cityName = "";
            let getCityName = document.getElementById(`city-name-${value}`);
            if (getCityName) {
                cityName = getCityName.innerText;
                console.log(cityName);
                setValues(name, cityName);
            }
            if (value !== "") {
                setFormData({
                    ...formData,
                    contact_details: {
                        ...formData.contact_details,
                        [name]: parseInt(value),
                        address: cityName,
                    },
                });
            } else {
                setValues(name, cityName);
                setFormData({
                    ...formData,
                    contact_details: {
                        ...formData.contact_details,
                        [name]: value,
                        address: cityName,
                    },
                });
            }

        }
    };

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
            landmark: "",
            state: "",
            city: "",
            zip: "",
        });
        // deselectStateInput.current.selected = true;
        setAddressValues({
            addressValue: "",
            labelValue: "Add Details",
            textAreaVisibility: "d-none",
        });
        setValidationDetails({});
        SetIdOfState("");
        setCityUseState({ citiesByState: [], cityVisibilityClass: "d-none" });
    };

    // Function will run after Individual Form submit button is clicked.
    const onBankFormSubmit = async (e) => {

        e.preventDefault();
        if (!formData.contact_details.flat_number) {
            delete formData.contact_details["flat_number"]
        }
        if (!formData.contact_details.plot_number) {
            delete formData.contact_details["plot_number"]
        }
        if (!formData.contact_details.society_name) {
            delete formData.contact_details["society_name"]
        }
        if (!formData.contact_details.building_name) {
            delete formData.contact_details["building_name"]
        }
        if (addressValues.labelValue === "Add Details") {
            return setAlertDetails({
                alertVisible: true,
                alertMsg: "Please fill the address details",
                alertClr: "danger",
            });
        }
        // mobile number validation
        if (!formData.mobile_number || mobileValidationMessage !== "") {
            if (mobileValidationMessage !== "") {
                return setValidationDetails({
                    ...validationDetails,
                    mobileValidationMessage: "Invalid Mobile Number Entered",
                });
            } else {
                return setValidationDetails({
                    ...validationDetails,
                    mobileValidationMessage: "Please fill the mobile number",
                });
            }
        }
        setLoading(true);
        if (formData.email.length !== 0) {
            try {
                // checking email exist or not 
                const { data } = await axios.post(`/sam/v1/customer-registration/email-validation`,
                    JSON.stringify({ email: formData.email })
                )
                if (data.status === 1) {
                    setValidationDetails({
                        ...validationDetails,
                        emailValidationMessage: "Email id already exists.",
                    });
                    setLoading(false);
                    return toast.error(`error: Email already exists.`);
                }
                // posting data for registration
                const { data: bankCreateRes } = await axios.post(`/sam/v1/bank-registration/branch`, formData)
                if (bankCreateRes.status === 0) {
                    setLoading(false);
                    document.getElementById("registration-alert").scrollIntoView(true);
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

            } catch (error) {
                toast.error("Server error while validating email");
                toast.error(error);
                setLoading(false);
            }
        }

    };

    // useEffect functions
    useEffect(() => {
        rootTitle.textContent = "SAM TOOL - REGISTER";
        resetValues();
        getAllSates();
        getEmailTokenFromURL();
        // eslint-disable-next-line
    }, []);


    return (
        <Layout>
            {showLoader ? <>
                <Loader />
            </>
                : <>
                    <section className="registration-wrapper min-100vh section-padding">
                        {bankRegistrationPageDisplay.display === true ? <>
                            <div className="container-fluid">
                                <div className="row justify-content-center ">
                                    <div className="col-lg-12 my-4">
                                        <div className="card form-wrapper-card shadow pt-3 pb-5 ps-lg-3 ps-0">
                                            <div className="container-fluid registration-form-container">
                                                <div className="row">
                                                    {/* Bank User Registration Form Heading */}
                                                    <div className="col-lg-12 mb-3">
                                                        <h4 className="fw-bold heading-text-primary all-page-heading-color">{bankEmailFromURL.is_bank_admin === true ? "Bank" : "Branch"} User Registration Form</h4>
                                                        <hr />
                                                    </div>
                                                    {/* registration-alert */}
                                                    <div className="col-12" id="registration-alert">
                                                        <div className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? "" : "d-none"
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

                                                    {/* Bank Main Form */}
                                                    <form
                                                        id="bankForm"
                                                        onSubmit={onBankFormSubmit}
                                                        action=""
                                                    >
                                                        <div className="col-lg-12">
                                                            <div className="row bank-type-row">
                                                                {/* Bank Name */}
                                                                <div className="col-lg-4 mb-2">
                                                                    <label htmlFor="form-label " className='fw-bold mb-1'>Bank Name</label>
                                                                    <p>{bankEmailFromURL.bank_name}</p>
                                                                </div>

                                                                {bankEmailFromURL.is_bank_admin === false ? (<>
                                                                    {/* branch_name*/}
                                                                    <div className="col-lg-3 mb-4">
                                                                        <label htmlFor="form-label " className='fw-bold mb-1'>Branch Name</label>
                                                                        <p>{bankEmailFromURL.branch_name}</p>
                                                                    </div>
                                                                    {/* Branch Code */}
                                                                    <div className="col-lg-3 mb-4">
                                                                        <label htmlFor="form-label " className='fw-bold mb-1'>Branch Code</label>
                                                                        <p>{bankEmailFromURL.branch_code}</p>
                                                                    </div>
                                                                    {/* ifsc_code */}
                                                                    <div className="col-lg-3 mb-4">
                                                                        <label htmlFor="form-label " className='fw-bold mb-1'>IFSC code</label>
                                                                        <p>{bankEmailFromURL.ifsc_code}</p>
                                                                    </div>
                                                                    {/* branch_sftp */}
                                                                    <div className="col-lg-3 mb-4">
                                                                        <label htmlFor="form-label " className='fw-bold mb-1'> Branch SFTP</label>
                                                                        <p>{bankEmailFromURL.branch_sftp}</p>
                                                                    </div>
                                                                </>) : ""}

                                                                {/* Email */}
                                                                <div className="col-lg-4 mb-2">
                                                                    <label htmlFor="form-label " className='fw-bold mb-1'>Email Address</label>
                                                                    <span className="text-danger fw-bold">*</span>
                                                                    <div className="input-group custom-class-form-div flex-nowrap ">
                                                                        <input
                                                                            onChange={onInputChange}
                                                                            onBlur={onInputBlur}
                                                                            type="text"
                                                                            name="email"
                                                                            className="form-control custom-input" placeholder="UserName"
                                                                            value={splittedBankEmailId.userName}
                                                                            required
                                                                        />
                                                                        <span className="input-group-text custom-input" id="basic-addon2">{splittedBankEmailId.domain}</span>
                                                                    </div>
                                                                    {/* </div> */}
                                                                    <span
                                                                        className={`pe-1 ${emailValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {emailValidationMessage}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Contact */}
                                                            <div className="row contactRow mt-lg-3 my-4">
                                                                {/* Mobile Number */}
                                                                <div className="col-lg-4 mb-lg-0 mb-2">

                                                                    <PhoneInput
                                                                        country={"in"}
                                                                        onBlur={(e) => onMobileNumberInputBlur(e)}
                                                                        onChange={onMobileNumberInputChange}
                                                                        required
                                                                    />

                                                                    <span
                                                                        className={`pe-1 ${mobileValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {mobileValidationMessage}
                                                                    </span>

                                                                    <span className="form-text d-none"></span>
                                                                </div>
                                                                {/* Landline */}
                                                                <div className="col-lg-4 mb-lg-0 mb-2 custom-class-form-div">
                                                                    <input
                                                                        onBlur={onInputBlur}
                                                                        onChange={onInputChange}
                                                                        onFocus={handleFocus}
                                                                        name="landline_number"
                                                                        id="landline_number"
                                                                        type="Number"
                                                                        className={`form-control border-${landlineNumberValidationColor} custom-input`}
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
                                                            <div className="row addressRow1 mt-lg-3 my-4">
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <label htmlFor="form-label " className='fw-bold mb-1'>Address</label>
                                                                    <span className="text-danger fw-bold">*</span>
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
                                                            {/* SAM T & C */}
                                                            <div className="row register-links mt-5 align-items-center ">
                                                                <div className="col-lg-4">
                                                                    <NavLink to="/">SAM Terms and Conditions</NavLink>
                                                                </div>
                                                            </div>
                                                            {/* Agree T & C */}
                                                            <div className="row agreeTermsConditionsRow mt-3 mb-4">
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
                                                            <div className="row submitCancelRow mt-5 mb-4 mb-md-0">
                                                                <div className=" col-lg-2 col-md-4 col-6">
                                                                    <button
                                                                        className={`btn btn-primary text-white common-btn-font  `}
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
                                                                        className="btn btn-secondary "
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.target.closest("form").reset();
                                                                            resetValues();
                                                                            goTo("/");
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
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
                                                            className="form-control custom-input"
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            onFocus={handleFocus}
                                                        />
                                                        <label className="px-2" htmlFor="flat_number" onClick={() => handleClick('flat_number')} >  Flat Number </label>
                                                    </div>
                                                </div>
                                                {/* Building Name */}
                                                <div className="col-md-6 my-md-2 my-4">
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <input
                                                            id="building_name"
                                                            name="building_name"
                                                            type="text"
                                                            className="form-control custom-input"
                                                            onChange={onInputChange}
                                                            onFocus={handleFocus}
                                                            onBlur={onInputBlur}
                                                        />
                                                        <label className="px-2" htmlFor="building_name" onClick={() => handleClick('building_name')} > Building Name </label>
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
                                                        <label className="px-2" htmlFor="society_name" onClick={() => handleClick('society_name')} > Society Name </label>
                                                    </div>
                                                </div>
                                                {/*  Plot Number */}
                                                <div className="col-md-6 my-md-2 my-4">
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <input
                                                            id="plot_number"
                                                            name="plot_number"
                                                            type="number"
                                                            className="form-control custom-input"
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            onFocus={handleFocus}
                                                        />
                                                        <label className="px-2" htmlFor="plot_number" onClick={() => handleClick('plot_number')} > Plot Number </label>
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
                                                            className="form-control custom-input"
                                                            onChange={onInputChange}
                                                            onFocus={handleFocus}
                                                        />
                                                        <label className="px-2" htmlFor="locality" onClick={() => handleClick('locality')} >Locality <span className="text-danger">*</span> </label>
                                                    </div>
                                                </div>
                                                {/* Landmark */}
                                                <div className="col-md-6 my-md-2 my-4">
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <input
                                                            id="landmark"
                                                            name="landmark"
                                                            type="text"
                                                            className="form-control custom-input"
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            onFocus={handleFocus}
                                                        />
                                                        <label className="px-2" htmlFor="landmark" onClick={() => handleClick('landmark')} >Landmark <span className="text-danger">*</span> </label>
                                                    </div>
                                                </div>
                                                {/* State */}
                                                <div className="col-md-6 my-md-2 my-4">
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <select
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            onFocus={handleFocus}
                                                            id="state"
                                                            name="state"
                                                            type="text"
                                                            className="form-select custom-input"
                                                        >
                                                            <option
                                                                ref={deselectStateInput}
                                                                value=""
                                                                style={{ color: "gray" }}
                                                            >
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
                                                        <label className="px-2" htmlFor="state" onClick={() => handleClick('state')} >State <span className="text-danger">*</span></label>
                                                    </div>
                                                </div>
                                                {/* city */}
                                                <div className={`col-md-6 my-md-2 my-4 ${cityVisibilityClass}`}>
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <select
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            onFocus={handleFocus}
                                                            id="city"
                                                            name="city"
                                                            type="text"
                                                            className="form-select custom-input"
                                                        >
                                                            <option
                                                                id="selectedCity"
                                                                value=""
                                                                style={{ color: "gray" }}
                                                            >
                                                            </option>
                                                            {citiesByState
                                                                ? citiesByState.map((city, Index) => {
                                                                    return (
                                                                        <option
                                                                            id={`city-name-${city.city_id}`}
                                                                            key={Index}
                                                                            value={city.city_id}
                                                                        >
                                                                            {city.city_name}
                                                                        </option>
                                                                    );
                                                                })
                                                                : ""}
                                                        </select>
                                                        <label className="px-2" htmlFor="city" onClick={() => handleClick('city')} >City <span className="text-danger">*</span> </label>
                                                    </div>
                                                </div>
                                                {/* ZIP Code */}
                                                <div className="col-md-6 my-md-2 my-4">
                                                    <div className="form-group mb-3 custom-class-form-div">
                                                        <input
                                                            type="number"
                                                            onChange={onInputChange}
                                                            onFocus={handleFocus}
                                                            id="zip"
                                                            onBlur={onInputBlur}
                                                            name="zip"
                                                            className={`form-control custom-input border-${zipCodeValidationColor}`}
                                                        />
                                                        <label className="px-2" htmlFor="zip" onClick={() => handleClick('zip')} >ZIP Code <span className="text-danger">*</span> </label>
                                                        <span
                                                            className={`pe-1 ${zipCodeValidationMessage ? "text-danger" : "d-none"
                                                                }`}
                                                        >
                                                            {zipCodeValidationMessage}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* save button */}
                                                <div className="modal-footer justify-content-between">
                                                    <p className='text-secondary'>All fields marked with an asterisk (<span className="text-danger fw-bold">*</span>) are mandatory.</p>
                                                    <button
                                                        onClick={onAddressFormSubmit}
                                                        className={`btn btn-primary ${locality &&
                                                            landmark &&
                                                            state &&
                                                            city  &&
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


                        </> : <>
                            <div className="container mt-5">
                                <div className="row justify-content-lg-between justify-content-center mt-5">
                                    <div className="col-xl-5 col-lg-5 col-md-8 order-2 order-lg-1 mt-lg-0 mt-5">
                                        <h1 className="text-bold mt-5 common-secondary-color">Oops! This link has expired.</h1><br></br>
                                        <h3 className="">Please <a href="/contact" className="text-decoration-none">contact </a>support for assistance.
                                        </h3>
                                    </div>
                                    <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2 mt-5 ">
                                        <img src={bankRegistrationLinkPage} alt="" className="set-pass-img" />
                                    </div>

                                </div>
                            </div>
                        </>
                        }
                    </section>
                </> 
            }
        </Layout >
    )
}

export default BankRegistrationPage