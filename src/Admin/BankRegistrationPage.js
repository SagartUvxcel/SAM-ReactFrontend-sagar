import React, { useState, useEffect, useRef } from 'react'
import Layout from "../components/1.CommonLayout/Layout";
// import CommonFormFields from "../components/7.Registration/CommonFormFields";
import axios from "axios";
import { NavLink, useNavigate, } from "react-router-dom";
import "react-phone-input-2/lib/style.css";
import bankRegistrationLinkPage from "../images/bankRegistrationLinkPage.svg";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import { rootTitle } from "../CommonFunctions";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Loader from "../components/1.CommonLayout/Loader";


const bankNameRegularExp = /^[A-Za-z0-9&\s.-]+$/
const branchNameRegularExp = /^[A-Za-z0-9\s\-&.,'()]+/
const branchCodeRegularExp = /^\d{1,5}$/
const ifscCodeRegularExp = /^[A-Z]{4}0\d{6}$/
const branchSftpRegularExp = /^[A-Za-z0-9_-]+$/
const branchUUIDRegularExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const landlineNumberRegularExp = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/



const BankRegistrationPage = () => {


    const goTo = useNavigate();
    const deselectStateInput = useRef();
    const navigate = useNavigate();


    const [validationDetails, setValidationDetails] = useState({});
    // Object destructuring.
    const {
        bankNameValidationMessage,
        branchNameValidationMessage,
        branchCodeValidationMessage,
        ifscCodeValidationMessage,
        branchSftpValidationMessage,
        branchUUIDValidationMessage,
        zipCodeValidationMessage,
        zipCodeValidationColor,
        landlineNumberValidationMessage,
        landlineNumberValidationColor,
    } = validationDetails;
    const [showLoader, setShowLoader] = useState(true);
    const { emailValidationMessage, mobileValidationMessage } = validationDetails;
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alertDetails, setAlertDetails] = useState({
        alertVisible: false,
        alertMsg: "",
        alertClr: "",
    });
    const { alertMsg, alertClr, alertVisible } = alertDetails;
    const [bankEmailFromURL, setBankEmailFromURL] = useState(null);
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
        // village,
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
        console.log(tokenFromEmailUrl);
        if (tokenFromEmailUrl) {
            const emailToken = tokenFromEmailUrl;

            // posting data 
            const dataToPost = JSON.stringify({ token: emailToken })
            console.log(dataToPost);

            try {
                await axios.post(`/sam/v1/bank-registration/branch/token/verify`, dataToPost)
                    .then((res) => {
                        console.log(res.data);

                        if (res.data) {
                            const emailValue = res.data.email;
                            const bank_name_value = res.data.bank_name;

                            if (emailValue && bank_name_value) {
                                console.log(bank_name_value, emailValue);
                                setBankEmailFromURL({ bank_name_value, emailValue });
                                setFormData({ ...formData, bank_name: bank_name_value, email: emailValue });
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
                            localStorage.setItem("bankRegistrationEmail", emailValue);
                        }
                    });
            } catch (error) {
                setShowLoader(false);
                console.log("failed to send token data for link validation.")
                console.log(error);
            }

        } else {

            setShowLoader(false);
            navigate("/access-denied");
        }

    };

    // Function to get all states from api so that we can map states in select state field.
    const getAllSates = async () => {
        try {
            const allStates = await axios.get(`/sam/v1/property/by-state`);
            setStates(allStates.data);
        } catch (error) { }
    };

    // get bank data from api
    const getDataFromApi = async () => {
        const bankRes = await axios.get(`/sam/v1/property/by-bank`);
        setBanks(bankRes.data);
    };

    // Function to show backend validation on outside click of input filed.
    const onInputBlur = async (e) => {
        const { name, value, style } = e.target;
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
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "zip") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "city") {
            setFormData({
                ...formData,
                contact_details: { ...formData.contact_details, [name]: parseInt(value) },
            });
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
                contact_details: { ...formData.contact_details, [name]: value },
            });
        } else if (name === "state") {
            SetIdOfState(value);
        } else if (name === "email") {
            // console.log(name,value);
            setFormData({ ...formData, [name]: value }
            );
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

    const onMobileNumberInputChange = () => {
        setValidationDetails({
            ...validationDetails,
            mobileValidationMessage: "",
        });
    };

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
                // console.log("Valid From UI Library");
                validateMobileFromBackend(finalValue);
            }
        }

        setFormData({ ...formData, mobile_number: finalValue, });
    };

    const validateMobileFromBackend = async (mobileValue) => {
        console.log("--------- From backend --------");
        console.log("Mobile validation function called", mobileValue);
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
        } else if (name === "building_name") {
            setValues(name, value);
        } else if (name === "society_name") {
            setValues(name, value);
        } else if (name === "plot_number") {
            setValues(name, value);
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
            // } else if (name === "village") {
            //   setValues(name, value);
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
            setFormData({ ...formData, [name]: value })
            setValidationDetails({
                ...validationDetails,
                emailValidationMessage: "",
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
                    contact_details: {
                        ...formData.contact_details,
                        [name]: parseInt(value),
                    },
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
            let cityName = "";
            let getCityName = document.getElementById(`city-name-${value}`);
            if (getCityName) {
                cityName = getCityName.innerText;
                setValues(name, cityName);
            }
            setFormData({
                ...formData,
                contact_details: {
                    ...formData.contact_details,
                    [name]: parseInt(value),
                    address: cityName,
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
            console.log(formData);
            setFormData({
                ...formData,
                contact_details: {
                    ...formData.contact_details,
                    [name]: parseInt(value),
                },
            });
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
            // village: "",
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
        // const fieldsToDelete = [
        //     "bank_name",
        //     "branch_name",
        //     "branch_code",
        //     "ifsc_code",
        //     "branch_sftp",
        //     "branch_UUID",
        // ];
        // fieldsToDelete.forEach((field) => {
        //     delete formData[field];
        // });

        if (addressValues.labelValue === "Add Details") {
            setAlertDetails({
                alertVisible: true,
                alertMsg: "Please fill the address details",
                alertClr: "danger",
            });
        } else {
            setLoading(true);
            try {
                console.log(formData);
                console.log(formData.bank_name);
                await axios
                    .post(`/sam/v1/bank-registration/branch`, formData)
                    .then(async (res) => {
                        if (res.data.status === 0) {
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




    // useEffect functions
    useEffect(() => {
        rootTitle.textContent = "SAM TOOL - REGISTER";
        resetValues();
        getAllSates();
        getDataFromApi();
        getEmailTokenFromURL();
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
                                    <div className="col-lg-12 mt-4">
                                        <div className="card form-wrapper-card shadow pt-3 pb-5 ps-lg-3 ps-0">
                                            <div className="container-fluid registration-form-container">
                                                <div className="row">
                                                    {/* Bank User Registration Form Heading */}
                                                    <div className="col-lg-12">
                                                        <h4 className="fw-bold">Bank User Registration Form</h4>
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
                                                    // className={`row ${bankDisplay} BankForm`}
                                                    >
                                                        <div className="col-lg-12">
                                                            <div className="row bank-type-row">
                                                                {/* Bank Name */}
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Bank Name
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="bank_name"
                                                                        type="text"
                                                                        placeholder="Bank Name"
                                                                        className="form-control"
                                                                        value={bankEmailFromURL.bank_name_value}
                                                                        disabled
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${bankNameValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {bankNameValidationMessage}
                                                                    </span>
                                                                </div>
                                                                {/* branch_name*/}
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Branch Name
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="branch_name"
                                                                        type="text"
                                                                        placeholder="Branch Name"
                                                                        className="form-control"
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${branchNameValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {branchNameValidationMessage}
                                                                    </span>
                                                                </div>
                                                                {/* Branch Code */}
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Branch Code
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="branch_code"
                                                                        type="text"
                                                                        placeholder="Branch Code"
                                                                        className="form-control"
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${branchCodeValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {branchCodeValidationMessage}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="row branch_sftp mt-lg-3 mt-2">
                                                                {/* ifsc_code */}
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    IFSC code
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="ifsc_code"
                                                                        type="text"
                                                                        placeholder=" IFSC code"
                                                                        className="form-control"
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${ifscCodeValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {ifscCodeValidationMessage}
                                                                    </span>
                                                                </div>
                                                                {/* branch_sftp */}
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Branch SFTP
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="branch_sftp"
                                                                        type="text"
                                                                        placeholder=" Branch SFTP"
                                                                        className="form-control"
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${branchSftpValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {branchSftpValidationMessage}
                                                                    </span>
                                                                </div>
                                                                {/* branch_UUID */}
                                                                {/* <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Branch UUID
                                                                    <span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="branch_UUID"
                                                                        type="text"
                                                                        placeholder="Branch UUID"
                                                                        className="form-control "
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${branchUUIDValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {branchUUIDValidationMessage}
                                                                    </span>
                                                                </div> */}
                                                            </div>

                                                            {/* Address Row 1 */}
                                                            <div className="row addressRow1 mt-lg-3 mt-4">
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Address<span className="text-danger fw-bold">*</span>
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
                                                            {/* Email */}
                                                            <div className="row emailRow mt-lg-3 mt-4">
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Email Address<span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-2">
                                                                    <input
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        name="email"
                                                                        type="email"
                                                                        className="form-control"
                                                                        placeholder="XXX@YYY.com"
                                                                        value={formData.email}
                                                                        required
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${emailValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {emailValidationMessage}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Contact */}
                                                            <div className="row contactRow mt-lg-3 mt-4">
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Landline<span className="ps-1 text-muted">(optional)</span>
                                                                    {/* <span className="text-danger">*</span> */}
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    <input
                                                                        onBlur={onInputBlur}
                                                                        onChange={onInputChange}
                                                                        name="landline_number"
                                                                        type="Number"
                                                                        placeholder="Landline"
                                                                        className={`form-control border-${landlineNumberValidationColor}`}
                                                                    />
                                                                    <span
                                                                        className={`pe-1 ${landlineNumberValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {landlineNumberValidationMessage}
                                                                    </span>
                                                                </div>
                                                                <div className="col-lg-2 mb-lg-0 mb-2">
                                                                    Mobile Number<span className="text-danger fw-bold">*</span>
                                                                </div>
                                                                <div className="col-lg-3 mb-lg-0 mb-2">
                                                                    {/* <input
            onChange={onInputChange}
            onBlur={onInputBlur}
            name="mobile_number"
            type="Number"
            placeholder="Mobile Number"
            required
            className="form-control"
          /> */}

                                                                    <PhoneInput
                                                                        country={"in"}
                                                                        // value={phoneNumber}
                                                                        onBlur={(e) => onMobileNumberInputBlur(e)}
                                                                        onChange={onMobileNumberInputChange}
                                                                    />

                                                                    <span
                                                                        className={`pe-1 ${mobileValidationMessage ? "text-danger" : "d-none"
                                                                            }`}
                                                                    >
                                                                        {mobileValidationMessage}
                                                                    </span>

                                                                    <span className="form-text d-none"></span>
                                                                </div>
                                                            </div>
                                                            {/* SAM T & C */}
                                                            <div className="row register-links mt-3">
                                                                <div className="offset-lg-2 col-lg-4">
                                                                    <NavLink to="/register">SAM Terms and Conditions</NavLink>
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
                                                            <div className="row submitCancelRow mt-4 mb-4 mb-md-0">
                                                                <div className="offset-lg-2 col-lg-2 col-md-4 col-6">
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
                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="flat_number"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Flat Number
                                                            <span className="ps-1 text-muted">(optional)</span>
                                                        </label>
                                                        <input
                                                            id="flat_number"
                                                            name="flat_number"
                                                            type="number"
                                                            className="form-control "
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            placeholder="Flat Number"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="building_name"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Building Name
                                                            <span className="ps-1 text-muted">(optional)</span>
                                                        </label>
                                                        <input
                                                            id="building_name"
                                                            name="building_name"
                                                            type="text"
                                                            className="form-control "
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            placeholder="Building Name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="society_name"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Society Name
                                                            <span className="ps-1 text-muted">(optional)</span>
                                                        </label>
                                                        <input
                                                            id="society_name"
                                                            name="society_name"
                                                            type="text"
                                                            className="form-control "
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            placeholder="Society Name"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="plot_number"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Plot Number
                                                            <span className="ps-1 text-muted">(optional)</span>
                                                        </label>
                                                        <input
                                                            id="plot_number"
                                                            name="plot_number"
                                                            type="number"
                                                            className="form-control "
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            placeholder="Plot Number"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="locality"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Locality
                                                            <span className="text-danger fw-bold">*</span>
                                                        </label>
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
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="landmark"
                                                            className="form-label common-btn-font"
                                                        >
                                                            Landmark
                                                            <span className="text-danger fw-bold">*</span>
                                                        </label>
                                                        <input
                                                            id="landmark"
                                                            name="landmark"
                                                            type="text"
                                                            className="form-control "
                                                            onChange={onInputChange}
                                                            onBlur={onInputBlur}
                                                            placeholder="Landmark"
                                                        />
                                                    </div>
                                                </div>

                                                {/* <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label
                        htmlFor="village"
                        className="form-label common-btn-font"
                      >
                        Village
                        <span className="text-danger fw-bold">*</span>
                      </label>
                      <input
                        id="village"
                        name="village"
                        type="text"
                        className="form-control "
                        onChange={onInputChange}
                        placeholder="Village"
                      />
                    </div>
                  </div> */}
                                                <hr />
                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="state"
                                                            className="form-label common-btn-font"
                                                        >
                                                            State
                                                            <span className="text-danger fw-bold">*</span>
                                                        </label>
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
                                                                Select state
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
                                                        <label
                                                            htmlFor="city"
                                                            className="form-label common-btn-font"
                                                        >
                                                            City
                                                            <span className="text-danger fw-bold">*</span>
                                                        </label>
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
                                                                Select city
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
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group mb-3">
                                                        <label
                                                            htmlFor="zip"
                                                            className="form-label common-btn-font"
                                                        >
                                                            ZIP Code
                                                            <span className="text-danger fw-bold">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            onChange={onInputChange}
                                                            id="zip"
                                                            onBlur={onInputBlur}
                                                            placeholder="Zipcode"
                                                            name="zip"
                                                            className={`form-control border-${zipCodeValidationColor}`}
                                                        ></input>
                                                        <span
                                                            className={`pe-1 ${zipCodeValidationMessage ? "text-danger" : "d-none"
                                                                }`}
                                                        >
                                                            {zipCodeValidationMessage}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
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