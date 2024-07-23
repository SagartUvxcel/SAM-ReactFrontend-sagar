import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { rootTitle, calculateDays } from "../../CommonFunctions";
import Layout from "../1.CommonLayout/Layout";
import CommonSpinner from "../../CommonSpinner";
import LinkExpiredPasswordResetImage from "../../images/LinkExpiredPasswordResetImage.svg";

let planEndDate = "";

const InactiveUserDetails = () => {

  const goTo = useNavigate();
  const deselectStateInput = useRef();
  const [inactiveUserToken, setInactiveUserToken] = useState("");
  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);
  const updatedCountry = localStorage.getItem("location");

  const [displayInactiveUserDetailsPage, setDisplayInactiveUserDetailsPage] = useState({
    display: false,
  });
  // Store validation message and validation color based on input field.
  const [validationDetails, setValidationDetails] = useState({});
  // Object destructuring.
  const {
    zipCodeValidationColor,
    zipCodeValidationMessage,
  } = validationDetails;

  // useState to store each field's data from form.
  const [formData, setFormData] = useState({
    contact_details: {
    },
  });

  // useState to store all states coming from api.
  const [states, setStates] = useState([]);
  // Function to get all states from api.
  const getAllSates = async () => {

    const countryId = updatedCountry === "india" ? 1 : 11;
    const postData = { "country_id": countryId }
    try {
      const allStates = await axios.post(`/sam/v1/property/by-state`, postData);
      setStates(allStates.data);
    } catch (error) { }
  };
  // useState to store/remove and hide/show cities data.
  const [cityUseState, setCityUseState] = useState({
    citiesByState: [],
    cityVisibilityClass: "",
  });
  const { citiesByState } = cityUseState;

  // useState to store/remove and hide/show address details.
  const [addressValues, setAddressValues] = useState({
    addressValue: "",
    labelValue: "Add Details",
    textAreaVisibility: "d-none",
  });

  const { addressValue, textAreaVisibility } = addressValues;

  // useState to store address Details.
  const [addressDetails, setAddressDetails] = useState({ zip: "" });
  const [idOfState, setIdOfState] = useState("");
  const [userType, setUserType] = useState("");

  // Object destructuring.
  const {
    user_type,
    mobile_number,
    locality,
    city_name,
    state_name,
    zip,
    email,
    landmark,
  } = addressDetails;

  const [orgUserDetails, setOrgUserDetails] = useState({});
  const [mainPageLoading, setMainPageLoading] = useState(false);

  // Object destructuring.
  const {
    cin_number,
    company_name,
    gst_number,
    organization_type,
    tan_number,
  } = orgUserDetails;

  const [individualUserDetails, setIndividualUserDetails] = useState({});

  // Object destructuring.
  const { first_name, middle_name, last_name, pan_number, aadhar_number } =
    individualUserDetails;

  const [bankUserDetails, setBankUserDetails] = useState({});

  // Object destructuring.
  const { bank_name, branch_name, branch_code, ifsc_code, branch_sftp } = bankUserDetails;

  // useStates to enable or disable editing and hide or unhide required fields.
  const [allUseStates, setAllUseStates] = useState({ editBtnClassName: "" });

  // Object destructuring.
  const { editBtnClassName } = allUseStates;



  // To navigate to particular route.
  const data = JSON.parse(localStorage.getItem("data"));

  if (data) {
    planEndDate = data.subscription_end_date;
  }

  // Function to validate zipCodes.
  const zipValidationByState = async (zipValue, stateId) => {
    let customerUrl = `/sam/v1/customer-registration`;
    await axios
      .post(`${customerUrl}/zipcode-validation`, {
        zipcode: zipValue.toString(),
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

  useEffect(() => {
    if (planEndDate) {
      calculateDays(planEndDate);
    }
    // eslint-disable-next-line
  }, [planEndDate])


  // verify token from database and take user data
  const getUserDataWithToken = async (token) => {
    setMainPageLoading(true);
    try {
      const { data } = await axios.put(`/sam/v1/customer-registration/activate-account/token/verify`, {
        "token": token
      })

      if (data) {
        const userType = parseInt(data.contact_details.user_type);
        if (userType === 0) {
          setIndividualUserDetails({
            first_name: data.first_name,
            middle_name: data.middle_name,
            last_name: data.last_name,
            pan_number: data.pan_number,
            aadhar_number: data.aadhar_number,
          });
        } else if (userType === 1) {
          setOrgUserDetails({
            cin_number: data.cin_number,
            company_name: data.company_name,
            gst_number: data.gst_number,
            organization_type: data.organization_type,
            tan_number: data.tan_number,
          });
        } else if (userType === 2) {
          setBankUserDetails({
            bank_name: data.bank_name,
            branch_name: data.branch_name,
            branch_code: data.branch_code,
            ifsc_code: data.ifsc_code,
            branch_sftp: data.branch_sftp,
          });
        }

        const userContactDetails = data.contact_details;

        setUserType(parseInt(userContactDetails.user_type));
        setIdOfState(parseInt(userContactDetails.state));
        setAddressDetails({
          user_type: parseInt(userContactDetails.user_type),
          mobile_number: userContactDetails.mobile_number,
          email: userContactDetails.email,
          state_id: parseInt(userContactDetails.state),
          zip: userContactDetails.zip,
          address: userContactDetails.landmark,
          city: userContactDetails.city,
          city_name: userContactDetails.city_name,
          locality: userContactDetails.locality,
          state_name: userContactDetails.state_name,
          building_name: userContactDetails.building_name,
          flat_number: userContactDetails.flat_number,
          landmark: userContactDetails.landmark,
          plot_number: userContactDetails.plot_number,
          society_name: userContactDetails.society_name,
        });
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            user_type: parseInt(userContactDetails.user_type),
            mobile_number: userContactDetails.mobile_number,
            email: userContactDetails.email,
            state_id: parseInt(userContactDetails.state),
            zip: userContactDetails.zip,
            address: userContactDetails.landmark,
            city: userContactDetails.city,
            city_name: userContactDetails.city_name,
            locality: userContactDetails.locality,
            state_name: userContactDetails.state_name,
            building_name: userContactDetails.building_name,
            flat_number: userContactDetails.flat_number,
            landmark: userContactDetails.landmark,
            plot_number: userContactDetails.plot_number,
            society_name: userContactDetails.society_name,
          },
        });
        setDisplayInactiveUserDetailsPage({
          display: true,
        });

        //  for address we storing value address if it is not blank
        let valuesArray = [
          userContactDetails.flat_number ? `Flat No: ${userContactDetails.flat_number}` : "",
          userContactDetails.building_name ? `Building Name: ${userContactDetails.building_name}` : "",
          userContactDetails.society_name ? `Society Name: ${userContactDetails.society_name}` : "",
          userContactDetails.plot_number ? `Plot No: ${userContactDetails.plot_number}` : "",
          userContactDetails.locality ? `Locality: ${userContactDetails.locality}` : "",
          userContactDetails.landmark ? `Landmark: ${userContactDetails.landmark}` : "",
          userContactDetails.state_name ? `State: ${userContactDetails.state_name}` : "",
          userContactDetails.city_name ? `City: ${userContactDetails.city_name}` : "",
          userContactDetails.zip ? `Zip Code: ${userContactDetails.zip}` : "",
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

        // Get Cities using state_id from api.
        const cityByState = await axios.post(`/sam/v1/property/by-city`, {
          state_id: parseInt(userContactDetails.state),
        });

        setCityUseState({
          citiesByState: cityByState.data,
          cityVisibilityClass: "",
        });
        const countryId = updatedCountry === "india" ? 1 : 11;
        const postData = { "country_id": countryId }
        // Get States from api.
        const allStates = await axios.post(`/sam/v1/property/by-state`, postData);
        setAllUseStates({
          ...allUseStates,
          citiesFromApi: cityByState.data,
          statesFromApi: allStates.data,
        });
        setMainPageLoading(false);


      } else {
        setMainPageLoading(false);
        setDisplayInactiveUserDetailsPage({
          display: false,
        });
      }

    } catch (error) {
      setMainPageLoading(false);
      setDisplayInactiveUserDetailsPage({
        display: false,
      });
    }

  }

  // This will run onchange of input field.
  const onInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "flat_number") {
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
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: value,
        },
      });
    } else if (name === "landmark") {
      setValues(name, value);
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
      setValues(name, value);

      if (idOfState !== "" && value !== "") {
        zipValidationByState(value, parseInt(idOfState));
      }
    } else if (name === "state_id") {
      setIdOfState(value);
      addressDetails.city = "";
      if (value) {
        document.getElementById("selectedCity").selected = true;
        let stateName = "";
        let getStateName = document.getElementById(`state-name-${value}`);
        if (getStateName) {
          stateName = getStateName.innerText;
          setValues("state_name", stateName);
        }
        setFormData({
          ...formData,
          contact_details: {
            ...formData.contact_details,
            [name]: parseInt(value),
            state_name: stateName,
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
        setValues("city_name", cityName);
      }
      setFormData({
        ...formData,
        contact_details: {
          ...formData.contact_details,
          [name]: parseInt(value),
        },
      });
    }
  };

  // Function will run on click of save button of address
  const onAddressFormSubmit = (e) => {
    e.preventDefault();
    let valuesArray = [
      addressDetails.flat_number ? `Flat No: ${addressDetails.flat_number}` : "",
      addressDetails.building_name ? `Building Name: ${addressDetails.building_name}` : "",
      addressDetails.society_name ? `Society Name: ${addressDetails.society_name}` : "",
      addressDetails.plot_number ? `Plot No: ${addressDetails.plot_number}` : "",
      addressDetails.locality ? `Locality: ${addressDetails.locality}` : "",
      addressDetails.landmark ? `Landmark: ${addressDetails.landmark}` : "",
      addressDetails.state_name ? `State: ${addressDetails.state_name}` : "",
      addressDetails.city_name ? `City: ${addressDetails.city_name}` : "",
      addressDetails.zip ? `Zip Code: ${addressDetails.zip}` : "",
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
  // Function to store address Details in a useState => addressDetails
  const setValues = (name, value) => {
    setAddressDetails({ ...addressDetails, [name]: value });
  };


  // Function will run on update button click.
  const updateDetails = async (e) => {
    e.preventDefault();

    const dataToPost = {
      building_name: formData.contact_details.building_name ? formData.contact_details.building_name : "",
      plot_number: formData.contact_details.plot_number ? formData.contact_details.plot_number : 0,
      society_name: formData.contact_details.society_name ? formData.contact_details.society_name : "",
      flat_number: formData.contact_details.flat_number ? formData.contact_details.flat_number : 0,
      locality: formData.contact_details.locality,
      landmark: formData.contact_details.landmark,
      state: formData.contact_details.state_id,
      city: formData.contact_details.city,
      zip: formData.contact_details.zip,
      email: formData.contact_details.email,
      token: inactiveUserToken
    }
    setUpdateBtnLoading(true);
    try {
      await axios
        .put(`/sam/v1/customer-registration/activate-account/activate`, dataToPost)
        .then((res) => {
          if (res.data.token) {
            setUpdateBtnLoading(false);
            setAllUseStates({ editBtnClassName: "" });
            goTo(`/register/verify?token=${res.data.token}`);
          } else {
            setUpdateBtnLoading(false);
            toast.error("Internal server error!");
          }
        });
    } catch (error) {
      setUpdateBtnLoading(false);
      toast.error("Internal server error!");
    }
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - USER DETAILS";
    if (window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      if (token) {
        getUserDataWithToken(token);
        setInactiveUserToken(token);
        getAllSates();
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="edit-details-wrapper section-padding min-100vh">

        {mainPageLoading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "70vh" }}
          >
            <CommonSpinner
              spinnerColor="primary"
              height="4rem"
              width="4rem"
              spinnerType="grow"
            />
          </div>
        ) : (
          <>
            {
              displayInactiveUserDetailsPage.display === true ?
                <div className="container-fluid wrapper position-relative">

                  <div className={`row justify-content-center`}>
                    <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
                      <form onSubmit={updateDetails} className="card h-100">

                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-12 col-8">
                              <h6 className="mb-2 heading-text-primary">
                                {user_type === 0
                                  ? "Personal Details"
                                  : user_type === 1
                                    ? "Organization Details"
                                    : ""}
                              </h6>
                            </div>

                            {/* User Type: */}
                            <div className="col-xl-4 col-lg-4 col-md-6 col-12">
                              <div className="form-group mb-3">
                                <label htmlFor="userType" className="form-label">
                                  User Type:
                                </label>
                                <p>
                                  {user_type === 0
                                    ? "Individual User"
                                    : user_type === 1
                                      ? "Organizational User"
                                      : user_type === 2
                                        ? "Bank User"
                                        : ""}
                                </p>
                              </div>
                            </div>
                            {/* Email */}
                            <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                              <div className="form-group mb-3">
                                <label htmlFor="eMail" className="form-label">
                                  Email
                                </label>
                                <p>{email}</p>
                              </div>
                            </div>
                            {/* Phone */}
                            <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                              <div className="form-group mb-3">
                                <label htmlFor="phone" className="form-label">
                                  Phone
                                </label>
                                <p>{mobile_number}</p>
                              </div>
                            </div>
                            {/* Individual  user */}
                            {userType === 0 ? (
                              <>
                                {/* First Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label htmlFor="firstName" className="form-label">
                                      First Name
                                    </label>
                                    <p>{first_name}</p>
                                  </div>
                                </div>
                                {/* middle Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="middleName"
                                      className="form-label"
                                    >
                                      Middle Name
                                    </label>
                                    <p>{middle_name}</p>
                                  </div>
                                </div>
                                {/* last Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label htmlFor="lastName" className="form-label">
                                      Last Name
                                    </label>
                                    <p>{last_name}</p>
                                  </div>
                                </div>
                                {/*  PAN Number */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label htmlFor="pan" className="form-label">
                                      PAN Number
                                    </label>
                                    <p>{pan_number}</p>
                                  </div>
                                </div>
                                {/* Aadhaar Number */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label htmlFor="aadhaar" className="form-label">
                                      Aadhaar Number
                                    </label>
                                    <p>{aadhar_number}</p>
                                  </div>
                                </div>
                              </>
                            ) : userType === 1 ? (
                              <>
                                {/*  Organization Type */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="organization_type"
                                      className="form-label"
                                    >
                                      Organization Type
                                    </label>
                                    <p>{organization_type}</p>
                                  </div>
                                </div>
                                {/* Company Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="company_name"
                                      className="form-label"
                                    >
                                      Company Name
                                    </label>
                                    <p>{company_name}</p>
                                  </div>
                                </div>
                                {/* GST Number */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="gst_number"
                                      className="form-label"
                                    >
                                      GST Number
                                    </label>
                                    <p>{gst_number}</p>
                                  </div>
                                </div>
                                {/* TAN Number */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="tan_number"
                                      className="form-label"
                                    >
                                      TAN Number
                                    </label>
                                    <p>{tan_number}</p>
                                  </div>
                                </div>
                                {/* CIN Number */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="cin_number"
                                      className="form-label"
                                    >
                                      CIN Number
                                    </label>
                                    <p>{cin_number}</p>
                                  </div>
                                </div>
                              </>
                            ) : userType === 2 ? (
                              <>
                                {/*  Bank Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="bank_name"
                                      className="form-label"
                                    >
                                      Bank Name
                                    </label>
                                    <p>{bank_name}</p>
                                  </div>
                                </div>
                                {/* Branch Name */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="branch_name"
                                      className="form-label"
                                    >
                                      Branch Name
                                    </label>
                                    <p>{branch_name}</p>
                                  </div>
                                </div>
                                {/* Branch Code */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="branch_code"
                                      className="form-label"
                                    >
                                      Branch Code
                                    </label>
                                    <p>{branch_code}</p>
                                  </div>
                                </div>
                                {/* IFSC code */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="ifsc_code"
                                      className="form-label"
                                    >
                                      IFSC code
                                    </label>
                                    <p>{ifsc_code}</p>
                                  </div>
                                </div>
                                {/* Branch SFTP */}
                                <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                                  <div className="form-group mb-3">
                                    <label
                                      htmlFor="branch_sftp"
                                      className="form-label"
                                    >
                                      Branch SFTP
                                    </label>
                                    <p>{branch_sftp}</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                          {/* Address Row 1 */}
                          <div className="row mt-3">
                            <div className="col-lg-12 mb-lg-0 form-group mb-3">
                              <label htmlFor="eMail" className="form-label heading-text-primary">
                                Address
                              </label>
                              <a
                                href="/anyValue"
                                id="address-modal-label"
                                style={{ cursor: "pointer" }}
                                className=" text-decoration-none"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                              >
                                <i className={`bi bi-pencil-square text-secondary ms-3 ${editBtnClassName}`}
                                ></i>
                              </a>
                            </div>
                            <div className="col-lg-8 mb-lg-0 mb-2">

                              <textarea
                                style={{ resize: "none" }}
                                value={addressValue}
                                readOnly
                                className={`form-control ${textAreaVisibility} mt-2`}
                                cols="30"
                                rows="3"
                              ></textarea>
                            </div>
                          </div>
                        </div>

                        {/* submit button */}
                        <div className="row my-3 me-3 ">

                          <div className="col-12">
                            <div className="d-flex justify-content-md-end justify-content-sm-center">
                              <button
                                style={{ width: "150px" }}
                                disabled={updateBtnLoading ? true : false}
                                type="submit"
                                id="submit"
                                name="submit"
                                className="btn btn-primary"
                              > {updateBtnLoading ? (
                                <>
                                  <span className="spinner-grow spinner-grow-sm me-2"></span>
                                  Updating...
                                </>
                              ) : (
                                "Update"
                              )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
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
                              <div className="col-md-4">
                                <div className="form-group mb-3">
                                  <label
                                    htmlFor="flat_number"
                                    className="form-label common-btn-font"
                                  >
                                    Flat Number
                                  </label>
                                  <input
                                    id="flat_number"
                                    name="flat_number"
                                    type="number"
                                    className="form-control "
                                    onChange={onInputChange}
                                    placeholder="Flat Number"
                                    value={formData.contact_details.flat_number}
                                  />
                                </div>
                              </div>
                              {/* Building Name */}
                              <div className="col-md-4">
                                <div className="form-group mb-3">
                                  <label
                                    htmlFor="building_name"
                                    className="form-label common-btn-font"
                                  >
                                    Building Name

                                  </label>
                                  <input
                                    id="building_name"
                                    name="building_name"
                                    type="text"
                                    className="form-control "
                                    onChange={onInputChange}
                                    placeholder="Building Name"
                                    value={formData.contact_details.building_name}
                                  />
                                </div>
                              </div>
                              {/* Society Name */}
                              <div className="col-md-4">
                                <div className="form-group mb-3">
                                  <label
                                    htmlFor="society_name"
                                    className="form-label common-btn-font"
                                  >
                                    Society Name

                                  </label>
                                  <input
                                    id="society_name"
                                    name="society_name"
                                    type="text"
                                    className="form-control "
                                    onChange={onInputChange}
                                    placeholder="Society Name"
                                    value={formData.contact_details.society_name}

                                  />
                                </div>
                              </div>
                              {/*  Plot Number */}
                              <div className="col-md-4">
                                <div className="form-group mb-3">
                                  <label
                                    htmlFor="plot_number"
                                    className="form-label common-btn-font"
                                  >
                                    Plot Number
                                  </label>
                                  <input
                                    id="plot_number"
                                    name="plot_number"
                                    type="number"
                                    className="form-control "
                                    onChange={onInputChange}
                                    placeholder="Plot Number"
                                    value={formData.contact_details.plot_number}
                                  />
                                </div>
                              </div>
                              {/* Locality */}
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
                                    id="locality"
                                    name="locality"
                                    type="text"
                                    className="form-control "
                                    onChange={onInputChange}
                                    placeholder="Locality, Area"
                                    value={formData.contact_details.locality}
                                  />
                                </div>
                              </div>
                              {/* Landmark */}
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
                                    placeholder="Landmark"
                                    value={formData.contact_details.landmark}
                                  />
                                </div>
                              </div>
                              {/* State */}
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
                                    id="state_name"
                                    name="state_id"
                                    type="text"
                                    className="form-select"
                                    placeholder="State"
                                    value={formData.contact_details.state_id}
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
                              {/* city */}
                              <div className={`col-md-4 `}>
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
                                    id="city"
                                    name="city"
                                    type="text"
                                    className="form-select"
                                    placeholder="city"
                                    value={formData.contact_details.city}
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
                              {/* ZIP Code */}
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
                                    placeholder="Zipcode"
                                    name="zip"
                                    value={zip}
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
                              {/* save button */}
                              <div className="modal-footer justify-content-between">
                                <p className='text-secondary'>All fields marked with an asterisk (<span className="text-danger fw-bold">*</span>) are mandatory.</p>
                                <button
                                  onClick={onAddressFormSubmit}
                                  className={`btn btn-primary ${locality &&
                                    landmark &&
                                    state_name &&
                                    city_name &&
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

                  </div>
                </div> : <>
                  <div className="container mt-5">
                    <div className="row justify-content-lg-between justify-content-center mt-5">
                      <div className="col-xl-5 col-lg-5 col-md-8 order-2 order-lg-1 mt-lg-0 mt-5">
                        <h1 className="text-bold mt-5 common-secondary-color">Oops! This link has expired.</h1><br></br>
                        <h3 className="">Please request a <a href="/forgot-password" className="text-decoration-none"> new link</a> or <a href="/contact" className="text-decoration-none">contact </a>support for assistance.
                        </h3>
                      </div>
                      <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2 mt-5 ">
                        <img src={LinkExpiredPasswordResetImage} alt="" className="set-pass-img" />
                      </div>

                    </div>
                  </div>
                </>
            } </>
        )}

      </section>
    </Layout>
  );
};

export default InactiveUserDetails;
