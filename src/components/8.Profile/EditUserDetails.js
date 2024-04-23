import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { checkLoginSession, rootTitle, calculateDays } from "../../CommonFunctions";
import Layout from "../1.CommonLayout/Layout";
import CommonSpinner from "../../CommonSpinner"; 

let authHeaders = ""; 
let planStatus = false;
let planEndDate = "";

const EditUserDetails = () => {
  // To store original details of user. It is required when user click on cancel button of edit form.
  const [originalValuesToShow, SetOriginalValuesToShow] = useState({});
  const [idOfState, setIdOfState] = useState(0);
  const [userType, setUserType] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [daysCount, setDaysCount] = useState(null);

  // To store updated user details.
  const [commonUserDetails, setCommonUserDetails] = useState({});

  // Object destructuring.
  const {
    user_type,
    mobile_number,
    locality,
    address,
    city,
    state_name,
    zip,
    email,
     building_name, 
    flat_number,
    landmark,
    plot_number,
    society_name, 
  } = commonUserDetails;

  const [orgUserDetails, setOrgUserDetails] = useState({});

  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);
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

  // useStates to enable or disable editing and hide or unhide required fields.
  const [allUseStates, setAllUseStates] = useState({
    isReadOnly: true,
    editClassName: "editable-values",
    editBtnClassName: "",
    cancelUpdateBtnClassName: "d-none",
    lableVisibility: "",
    selectStateClassName: "d-none",
    statesFromApi: [],
    citiesFromApi: [],
    cityVisiblity: "d-none",
  });

  // Object destructuring.
  const {
    isReadOnly,
    editClassName,
    editBtnClassName,
    cancelUpdateBtnClassName,
    lableVisibility,
    selectStateClassName,
    statesFromApi,
    citiesFromApi,
    cityVisiblity,
  } = allUseStates;

  // useState for validation.
  const [validation, setValidation] = useState({
    zipCodeValidationColor: "",
    zipCodeValidationMessage: "",
  });

  // Object destructuring.
  const { zipCodeValidationColor, zipCodeValidationMessage } = validation;

  // To navigate to particular route.
  const goTo = useNavigate();
  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");

  if (data) {
    authHeaders = { Authorization: data.loginToken }; 
    planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
    planEndDate = data.subscription_end_date;
  }
 
  // Function will get the data of user whose details are to be edited.
  const getUserToEdit = async () => {
    if (data) {
      const userId = data.userId;
      try {
        await axios
          .get(`/sam/v1/user-registration/auth/${userId}`, {
            headers: authHeaders,
          })
          .then(async (res) => { 
            console.log(res.data);
            const { individual_user, org_user, user_details } = res.data;
            if (individual_user) {
              const {
                first_name,
                middle_name,
                last_name,
                pan_number,
                aadhar_number,
              } = individual_user;
              setIndividualUserDetails({
                first_name: first_name,
                middle_name: middle_name,
                last_name: last_name,
                pan_number: pan_number,
                aadhar_number: aadhar_number,
              });
            } else if (org_user) {
              const {
                cin_number,
                company_name,
                gst_number,
                organization_type,
                tan_number,
              } = org_user;
              setOrgUserDetails({
                cin_number: cin_number,
                company_name: company_name,
                gst_number: gst_number,
                organization_type: organization_type,
                tan_number: tan_number,
              });
            }
            const {
              user_type,
              mobile_number,
              locality,
              city,
              state_name,
              state_id,
              zip,
              email_address, 
              building_name,
              contact_number,
              flat_number,
              landmark,
              plot_number,
              society_name,
              user_id
            } = user_details; 
            setUserType(user_type);
            setIdOfState(parseInt(state_id));
            setCommonUserDetails({
              state_id: parseInt(state_id),
              address: locality,
              mobile_number: mobile_number,
              locality: locality,
              city: city,
              state_name: state_name,
              zip: zip,
              email: email_address,
              user_type: user_type,
              building_name: building_name,
              contact_number: contact_number,
              flat_number: flat_number,
              landmark: landmark,
              plot_number: plot_number,
              society_name: society_name,
              user_id: user_id
            });
            // Get Cities using state_id from api.
            const cityByState = await axios.post(`/sam/v1/property/by-city`, {
              state_id: state_id,
            });
            // Get States from api.
            const allStates = await axios.get(`/sam/v1/property/by-state`);
            setAllUseStates({
              ...allUseStates,
              citiesFromApi: cityByState.data,
              statesFromApi: allStates.data,
            });
            SetOriginalValuesToShow(user_details);
            setMainPageLoading(false);
          });
      } catch (error) {
        setMainPageLoading(false);
      }
    }
  };

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
          setValidation({
            ...validation,
            zipCodeValidationMessage: "Invalid ZipCode.",
            zipCodeValidationColor: "danger",
          });
        } else {
          setValidation({
            ...validation,
            zipCodeValidationMessage: "",
            zipCodeValidationColor: "",
          });
        }
      });
  };

  const onInputChange = async (e) => {
    const { name, value } = e.target;
    // If input is state then post selected state id to api for getting cities based on selected state.
    if (name === "state_name") {
      const cityByState = await axios.post(`/sam/v1/property/by-city`, {
        state_id: parseInt(value),
      });
      setAllUseStates({
        ...allUseStates,
        citiesFromApi: cityByState.data,
      });

      setIdOfState(parseInt(value));
      zipValidationByState(zip, parseInt(value));
      let stateName = "";
      let getStateName = document.getElementById(`state-name-${value}`);
      if (getStateName) {
        stateName = getStateName.innerText;
      }
      setCommonUserDetails({
        ...commonUserDetails,
        city: cityByState.data[0].city_name,
        state_name: stateName,
      });
      document.getElementById("city").firstChild.selected = true;
    } else if (name === "zip") {
      setCommonUserDetails({ ...commonUserDetails, zip: parseInt(value) });
      if (idOfState !== 0 && value !== "") {
        zipValidationByState(value, idOfState);
      }
    } else if (name === "city") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    } else if (name === "locality") {
      setCommonUserDetails({ ...commonUserDetails, address: value });
    }else if (name === "flat_number") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }else if (name === "building_name") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }else if (name === "plot_number") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }else if (name === "society_name") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }else if (name === "landmark") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }
  };

  // Function will run when user click on edit icon / button.
  const editDetails = async () => {
    const { city, state_id, state_name } = originalValuesToShow;
    try {
      await axios
        .post(`/sam/v1/property/by-city`, {
          state_id: state_id,
        })
        .then((res) => {
          if (res.data) {
            setAllUseStates({
              ...allUseStates,
              isReadOnly: false,
              citiesFromApi: res.data,
              editClassName: "",
              editBtnClassName: "d-none",
              cancelUpdateBtnClassName: "",
              lableVisibility: "d-none",
              selectStateClassName: "",
              cityVisiblity: "",
            });
            // User's original state will be selected on state select input.
            statesFromApi.forEach((i) => {
              if (i.state_name === state_name) {
                document.getElementById(
                  `state-name-${i.state_id}`
                ).selected = true;
              }
            });

            // User's original city will be selected on city select input.
            citiesFromApi.forEach((i) => {
              if (i.city_name === city) {
                document.getElementById(`${i.city_name}`).selected = true;
              }
            });
          } else {
            toast.error("Internal server error");
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  // Function will run when user click on cancel button.
  const cancelEditing = async () => {
    setValidation({
      zipCodeValidationColor: "",
      zipCodeValidationMessage: "",
    });

    const { city, state_id, state_name, zip, locality } = originalValuesToShow;
    setCommonUserDetails({
      ...commonUserDetails,
      address: locality,
      zip: zip,
      locality: locality,
      city: city,
      state_id: state_id,
      state_name: state_name,
    });

    setAllUseStates({
      ...allUseStates,
      isReadOnly: true,
      editClassName: "editable-values",
      editBtnClassName: "",
      cancelUpdateBtnClassName: "d-none",
      lableVisibility: "",
      selectStateClassName: "d-none",
      cityVisiblity: "d-none",
    });

    // Show original values of user.
    let samp = document.querySelectorAll("input");
    for (let i of samp) {
      const target = document.getElementById(i.name);
      target.value = originalValuesToShow[i.name]
        ? originalValuesToShow[i.name]
        : "Not Available";
    }
  };

  // Function will run on update button click.
  const updateDetails = async (e) => {
    e.preventDefault();
    const dataToPost = {
      address: address,
      locality: address,
      city: city,
      zip: zip,
      state: state_name,
      email: email,
      building_name: building_name, 
      flat_number: flat_number,
      landmark: landmark,
      plot_number: plot_number,
      society_name: society_name,
    }; 
    setUpdateBtnLoading(true);
    try {
      await axios
        .post(`/sam/v1/customer-registration/auth/edit-details`, dataToPost, {
          headers: authHeaders,
        })
        .then((res) => { 
          if (res.data.status === 0) {
            setUpdateBtnLoading(false);
            toast.success("Details Updated Successfully");
            setAllUseStates({
              ...allUseStates,
              isReadOnly: true,
              editClassName: "editable-values",
              editBtnClassName: "",
              cancelUpdateBtnClassName: "d-none",
              lableVisibility: "",
              selectStateClassName: "d-none",
              cityVisiblity: "d-none",
            });
            goTo("/profile");
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
    if (planEndDate) {
      calculateDays(planEndDate);
      setDaysCount(calculateDays(planEndDate));
    }
// eslint-disable-next-line
  }, [planEndDate])

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - EDIT DETAILS";
    setMainPageLoading(true);
    // subscription Plan Expiry date
    setExpiryDate(new Date(planEndDate));
    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getUserToEdit();
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="edit-details-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper position-relative">
          <div className={`row justify-content-center ${planStatus && expiryDate && daysCount <= 7 ? "mt-4" : ""}`}>
            <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
              <form onSubmit={updateDetails} className="card h-100">
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
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8 col-6">
                        <h6 className="mb-2 heading-text-primary">
                          {user_type === 0
                            ? "Personal Details"
                            : user_type === 1
                              ? "Organization Details"
                              : ""}
                        </h6>
                      </div>
                      {/* View Profile */}
                      <div className="col-md-4 col-6 text-end">
                        <NavLink
                          to="/profile"
                          className="ms-4 text-decoration-none"
                        >
                          View Profile <i className="bi bi-arrow-right"></i>
                        </NavLink>
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
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="row mt-3">
                      {/* Address */}
                      <div className="col-12">
                        <h6 className="heading-text-primary">
                          Address
                          <i
                            onClick={editDetails}
                            className={`bi bi-pencil-square text-secondary ms-4 ${editBtnClassName}`}
                          ></i>
                        </h6>
                      </div>
                      {/* flat_number */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="flat_number" className="form-label">
                          Flat Number
                          </label>
                          <input
                            onChange={onInputChange}
                            name="flat_number"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="flat_number"
                            defaultValue={flat_number}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div>
                      {/* building_name */}<div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="building_name" className="form-label">
                          Building Name
                          </label>
                          <input
                            onChange={onInputChange}
                            name="building_name"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="building_name"
                            defaultValue={building_name}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div> 
                      {/* society_name */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="society_name" className="form-label">
                          Society Name
                          </label>
                          <input
                            onChange={onInputChange}
                            name="society_name"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="society_name"
                            defaultValue={society_name}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div>
                      {/* plot_number */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="plot_number" className="form-label">
                          Plot Number
                          </label>
                          <input
                            onChange={onInputChange}
                            name="plot_number"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="plot_number"
                            defaultValue={plot_number}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div>
                      {/* Landmark */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="Landmark" className="form-label">
                          Landmark
                          </label>
                          <input
                            onChange={onInputChange}
                            name="landmark"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="landmark"
                            defaultValue={landmark}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div>
                      {/* Locality */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="locality" className="form-label">
                            Locality
                          </label>
                          <input
                            onChange={onInputChange}
                            name="locality"
                            type="text"
                            className={`form-control ${editClassName}`}
                            id="locality"
                            defaultValue={locality}
                            readOnly={isReadOnly}
                            required
                          />
                        </div>
                      </div>
                      {/* State */}
                      <div className="col-xl-3 col-lg-3 col-md-4  col-12">
                        <div className="form-group mb-3">
                          <label className="form-label">State</label>
                          <p className={`${lableVisibility} testing`}>
                            {state_name}
                          </p>
                          <select
                            name="state_name"
                            id="state_name"
                            className={`form-select ${selectStateClassName}`}
                            onChange={onInputChange}
                            required
                          >
                            {statesFromApi
                              ? statesFromApi.map((i, Index) => {
                                return (
                                  <option
                                    id={`state-name-${i.state_id}`}
                                    key={Index}
                                    value={i.state_id}
                                  >
                                    {i.state_name}
                                  </option>
                                );
                              })
                              : ""}
                          </select>
                        </div>
                      </div>
                      {/* City */}
                      <div className="col-xl-3 col-lg-3 col-md-4 col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="city" className="form-label">
                            City
                          </label>
                          <p className={`${lableVisibility}`}>{city}</p>
                          <select
                            onChange={onInputChange}
                            name="city"
                            id="city"
                            className={`form-select  ${cityVisiblity}`}
                            required
                          >
                            {citiesFromApi
                              ? citiesFromApi.map((i, Index) => {
                                return (
                                  <option
                                    id={i.city_name}
                                    key={Index}
                                    value={i.city_name}
                                  >
                                    {i.city_name}
                                  </option>
                                );
                              })
                              : ""}
                          </select>
                        </div>
                      </div>
                      {/* Zip Code */}
                      <div className="col-xl-3 col-lg-3 col-md-4 col-12">
                        <div className="form-group mb-3">
                          <label htmlFor="zip" className="form-label">
                            Zip Code
                          </label>
                          <input
                            onChange={onInputChange}
                            name="zip"
                            type="number"
                            className={`form-control ${editClassName} border-${zipCodeValidationColor}`}
                            id="zip"
                            defaultValue={zip}
                            readOnly={isReadOnly}
                            required
                          />
                          <span
                            className={`pe-1 ${zipCodeValidationMessage ? "" : "d-none"
                              } text-danger`}
                          >
                            {zipCodeValidationMessage}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Cancel and Update button */}
                    <div
                      className={`row mt-4 ${cancelUpdateBtnClassName}`}
                      id="update-cancel"
                    >
                      <div className="col-12">
                        <div className="d-flex justify-content-between justify-content-md-end">
                          <button
                            style={{ width: "150px" }}
                            onClick={cancelEditing}
                            type="button"
                            className={`btn btn-secondary me-2 ${updateBtnLoading ? "disabled" : ""
                              }`}
                          >
                            Cancel
                          </button>
                          <button
                            disabled={
                              zipCodeValidationColor || updateBtnLoading
                                ? true
                                : false
                            }
                            style={{ width: "150px" }}
                            type="submit"
                            id="submit"
                            name="submit"
                            className="btn btn-primary"
                          >
                            {updateBtnLoading ? (
                              <>
                                <span
                                  className="spinner-grow spinner-grow-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Updating....
                              </>
                            ) : (
                              "Update"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EditUserDetails;
