import axios from "axios";
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const EditUserDetails = () => {
  // To store original details of user. It is required when user click on cancel button of edit form.
  const [originalValuesToShow, SetOriginalValuesToShow] = useState({});
  const [idOfState, setIdOfState] = useState(0);
  const [userType, setUserType] = useState("");

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
  } = commonUserDetails;

  const [orgUserDetails, setOrgUserDetails] = useState({});

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
  // const goTo = useNavigate();

  // Function will provide login token of user from localStorage and also some urls are stored in this function.
  const setHeaderAndUrl = () => {
    const loginToken = localStorage.getItem("logintoken");
    let headers = { Authorization: loginToken };
    let url = `/sam/v1/property/auth`;
    let customer_reg_url = `/sam/v1/customer-registration`;
    return [headers, url, customer_reg_url];
  };

  // Function will get the data of user whose details are to be edited.
  const getUserToEdit = async () => {
    const [headers] = setHeaderAndUrl();
    const userEmail = localStorage.getItem("user");
    await axios
      .post(
        `/sam/v1/user-registration/auth/getuser`,
        JSON.stringify({ email: userEmail }),
        {
          headers: headers,
        }
      )
      .then(async (res) => {
        const [headers, url] = setHeaderAndUrl();
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
          address,
        } = user_details;
        setUserType(user_type);
        setIdOfState(parseInt(state_id));
        setCommonUserDetails({
          state_id: parseInt(state_id),
          address: address,
          mobile_number: mobile_number,
          locality: locality,
          city: city,
          state_name: state_name,
          zip: zip,
          email: email_address,
          user_type: user_type,
        });
        // Get Cities using state_id from api.
        const cityByState = await axios.post(
          `${url}/by-city`,
          { state_id: state_id },
          { headers: headers }
        );
        // Get States from api.
        const allStates = await axios.get(`${url}/by-state`, {
          headers: headers,
        });
        setAllUseStates({
          ...allUseStates,
          citiesFromApi: cityByState.data,
          statesFromApi: allStates.data,
        });
        SetOriginalValuesToShow(user_details);
      });
  };

  // Function to validate zipCodes.
  const zipValidationByState = async (zipValue, stateId, customerUrl) => {
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
    const [headers, url, customer_reg_url] = setHeaderAndUrl();
    // If input is state then post selected state id to api for getting cities based on selected state.
    if (name === "state_name") {
      const cityByState = await axios.post(
        `${url}/by-city`,
        { state_id: parseInt(value) },
        { headers: headers }
      );
      setAllUseStates({
        ...allUseStates,
        citiesFromApi: cityByState.data,
      });

      setIdOfState(parseInt(value));
      zipValidationByState(zip, parseInt(value), customer_reg_url);
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
        zipValidationByState(value, idOfState, customer_reg_url);
      }
    } else if (name === "address") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    } else if (name === "city") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    } else if (name === "locality") {
      setCommonUserDetails({ ...commonUserDetails, [name]: value });
    }
  };

  // Function will run when user click on edit icon / button.
  const editDetails = () => {
    setAllUseStates({
      ...allUseStates,
      isReadOnly: false,
      editClassName: "",
      cancelUpdateBtnClassName: "",
      lableVisibility: "d-none",
      selectStateClassName: "",
      cityVisiblity: "",
    });

    // User's original state will be selected on state select input.
    statesFromApi.forEach((i) => {
      if (i.state_name === state_name) {
        document.getElementById(`state-name-${i.state_id}`).selected = true;
      }
    });

    // User's original city will be selected on city select input.
    citiesFromApi.forEach((i) => {
      if (i.city_name === city) {
        document.getElementById(`${i.city_name}`).selected = true;
      }
    });
  };

  // Function will run when user click on cancel button.
  const cancelEditing = async () => {
    const [headers, url] = setHeaderAndUrl();
    setValidation({
      zipCodeValidationColor: "",
      zipCodeValidationMessage: "",
    });

    const { city, state_id, state_name } = originalValuesToShow;

    // Get Cities using state_id from api.
    const cityByState = await axios.post(
      `${url}/by-city`,
      { state_id: state_id },
      { headers: headers }
    );

    setCommonUserDetails({
      ...commonUserDetails,
      city: city,
      state_id: state_id,
      state_name: state_name,
    });

    setAllUseStates({
      ...allUseStates,
      citiesFromApi: cityByState.data,
      isReadOnly: true,
      editClassName: "editable-values",
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
    const [headers, , customer_reg_url] = setHeaderAndUrl();
    const dataToPost = {
      address: address,
      locality: locality,
      city: city,
      zip: zip,
      state: state_name,
      email: email,
    };
    console.log(dataToPost);
    if (!zipCodeValidationColor) {
      await axios
        .post(`${customer_reg_url}/auth/edit-details`, dataToPost, {
          headers: headers,
        })
        .then((res) => {
          if (res.data.status === 0) {
            toast.success("Details Updated Successfully");
            setAllUseStates({
              ...allUseStates,
              isReadOnly: true,
              editClassName: "editable-values",
              cancelUpdateBtnClassName: "d-none",
              lableVisibility: "",
              selectStateClassName: "d-none",
              cityVisiblity: "d-none",
            });
            // setTimeout(() => {
            //   goTo("/profile");
            // }, 3000);
          } else {
            toast.error("Some Error Occured");
          }
        });
    } else {
      toast.error("Invalid Form");
    }
  };

  useEffect(() => {
    getUserToEdit();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="edit-details-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10 col-md-12 col-sm-12 col-12">
              <form onSubmit={updateDetails} className="card h-100">
                <div className="card-body">
                  <div className="row">
                    <div className="col-8">
                      <h6 className="mb-2 text-primary">Personal Details</h6>
                    </div>

                    <div className="col-4 text-end">
                      <i
                        onClick={editDetails}
                        className="bi bi-pencil-square"
                      ></i>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="userType" className="form-label">
                          User Type:
                        </label>
                        <p>{user_type ? user_type : "NA"}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="eMail" className="form-label">
                          Email
                        </label>
                        <p>{email}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone
                        </label>
                        <p>{mobile_number}</p>
                      </div>
                    </div>

                    {userType === "Individual User" ? (
                      <>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="firstName" className="form-label">
                              First Name
                            </label>
                            <p>{first_name}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="middleName" className="form-label">
                              Middle Name
                            </label>
                            <p>{middle_name}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="lastName" className="form-label">
                              Last Name
                            </label>
                            <p>{last_name}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="pan" className="form-label">
                              PAN Number
                            </label>
                            <p>{pan_number}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="aadhaar" className="form-label">
                              Aadhaar Number
                            </label>
                            <p>{aadhar_number}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="gst_number" className="form-label">
                              GST Number
                            </label>
                            <p>{gst_number}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="tan_number" className="form-label">
                              TAN Number
                            </label>
                            <p>{tan_number}</p>
                          </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                          <div className="form-group mb-3">
                            <label htmlFor="cin_number" className="form-label">
                              CIN Number
                            </label>
                            <p>{cin_number}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <h6 className="mt-3 mb-2 text-primary">Address</h6>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="address" className="form-label">
                          Block / House No.
                        </label>
                        <input
                          onChange={onInputChange}
                          name="address"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="address"
                          defaultValue={address}
                          readOnly={isReadOnly}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
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

                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
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

                    <div className="col-xl-4 col-lg-4 col-md-6 col-12">
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

                    <div className="col-xl-4 col-lg-4 col-md-6 col-12">
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
                          className={`pe-1 ${
                            zipCodeValidationMessage ? "" : "d-none"
                          } text-danger`}
                        >
                          {zipCodeValidationMessage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`row mt-4 ${cancelUpdateBtnClassName}`}
                    id="update-cancel"
                  >
                    <div className="col-12">
                      <div className="text-end">
                        <button
                          onClick={cancelEditing}
                          type="button"
                          className="btn btn-secondary me-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          id="submit"
                          name="submit"
                          className="btn btn-primary"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EditUserDetails;
