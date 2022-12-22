import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const EditUserDetails = () => {
  const [defaultUser, setDefaultUser] = useState({
    defaultAddress: "Not Availabe",
  });

  const {
    defaultAddress,
    first_name,
    middle_name,
    last_name,
    mobile_number,
    pan_number,
    aadhar_number,
    email_address,
    zip: defaultZip,
    state: defaultState,
    city: defaultCity,
    locality: defaultLocality,
  } = defaultUser;

  const defaultValues = {
    address: defaultAddress,
    locality: defaultLocality,
    city: defaultCity,
    state: defaultState,
    state_id: 1,
    zip: defaultZip,
  };

  const [userDetails, setUserDetails] = useState({
    address: "",
    locality: "",
    city: "",
    state: "",
    zip: "",
    email: "",
  });

  const { address, locality, city, state, zip, email } = userDetails;

  const goTo = useNavigate();

  const [allUseStates, setAllUseStates] = useState({
    isReadOnly: true,
    editClassName: "editable-values",
    cancelUpdateBtnClassName: "d-none",
    lableVisibility: "",
    selectStateClassName: "d-none",
    statesFromApi: [],
    citiesFromApi: [],
    cityVisiblity: "d-none",
    state_id: defaultValues.state_id,
  });

  const [validation, setValidation] = useState({
    zipCodeValidationColor: "",
    zipCodeValidationMessage: "",
  });

  const { zipCodeValidationColor, zipCodeValidationMessage } = validation;
  const {
    isReadOnly,
    editClassName,
    cancelUpdateBtnClassName,
    lableVisibility,
    selectStateClassName,
    statesFromApi,
    citiesFromApi,
    cityVisiblity,
    state_id,
  } = allUseStates;

  const setHeaderAndUrl = () => {
    const loginToken = localStorage.getItem("logintoken");
    let headers = { Authorization: loginToken };
    let url = `/sam/v1/property/auth`;
    let customer_reg_url = `/sam/v1/customer-registration`;
    return [headers, url, customer_reg_url];
  };

  const getUserToEdit = async () => {
    const [headers] = setHeaderAndUrl();
    const userId = localStorage.getItem("userId");
    const user = await axios.get(`/sam/v1/user-registration/auth/${userId}`, {
      headers: headers,
    });
    setDefaultUser(user.data);
    const { locality, city, state, zip, email_address } = user.data;
    setUserDetails({
      address: defaultAddress,
      locality: locality,
      city: city,
      state: state,
      zip: zip,
      email: email_address,
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

  const getStatesAndCityFromApi = async () => {
    const [headers, url] = setHeaderAndUrl();
    // Get all states from api.
    const allStates = await axios.get(`${url}/by-state`, {
      headers: headers,
    });
    const cityByState = await axios.post(
      `${url}/by-city`,
      { state_id: defaultValues.state_id },
      { headers: headers }
    );

    setAllUseStates({
      ...allUseStates,
      statesFromApi: allStates.data,
      citiesFromApi: cityByState.data,
    });
  };

  const onInputChange = async (e) => {
    const { name, value } = e.target;
    const [headers, url, customer_reg_url] = setHeaderAndUrl();
    // If input is state then post selected state id to api for getting cities based on selected state.
    if (name === "state") {
      const cityByState = await axios.post(
        `${url}/by-city`,
        { state_id: parseInt(value) },
        { headers: headers }
      );
      setAllUseStates({
        ...allUseStates,
        citiesFromApi: cityByState.data,
        state_id: parseInt(value),
      });

      zipValidationByState(zip, parseInt(value), customer_reg_url);
      let stateName = "";
      let getStateName = document.getElementById(`state-name-${value}`);
      if (getStateName) {
        stateName = getStateName.innerText;
      }
      setUserDetails({
        ...userDetails,
        city: cityByState.data[0].city_name,
        state: stateName,
      });
      document.getElementById("city").firstChild.selected = true;
    } else if (name === "zip") {
      setUserDetails({ ...userDetails, zip: parseInt(value) });
      if (state_id !== "" && value !== "") {
        zipValidationByState(value, parseInt(state_id), customer_reg_url);
      }
    } else if (name === "address") {
      setUserDetails({ ...userDetails, [name]: value });
    } else if (name === "city") {
      setUserDetails({ ...userDetails, [name]: value });
    } else if (name === "locality") {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const editDetails = () => {
    // console.log(defaultUser);
    setAllUseStates({
      ...allUseStates,
      isReadOnly: false,
      editClassName: "",
      cancelUpdateBtnClassName: "",
      lableVisibility: "d-none",
      selectStateClassName: "",
      cityVisiblity: "",
    });
    statesFromApi.forEach((i) => {
      if (i.state_name === state) {
        document.getElementById(`state-name-${i.state_id}`).selected = true;
      }
    });
    citiesFromApi.forEach((i) => {
      if (i.city_name === city) {
        document.getElementById(`${i.city_name}`).selected = true;
      }
    });
  };

  const cancelEditing = () => {
    setAllUseStates({
      ...allUseStates,
      isReadOnly: true,
      editClassName: "editable-values",
      cancelUpdateBtnClassName: "d-none",
      lableVisibility: "",
      selectStateClassName: "d-none",
      cityVisiblity: "d-none",
      state_id: defaultValues.state_id,
    });

    setValidation({
      zipCodeValidationColor: "",
      zipCodeValidationMessage: "",
    });

    let samp = document.querySelectorAll("input");
    for (let i of samp) {
      document.getElementById(i.name).value = defaultValues[i.name]
        ? defaultValues[i.name]
        : "Not Available";
    }
  };

  const updateDetails = async (e) => {
    e.preventDefault();
    const [headers, url, customer_reg_url] = setHeaderAndUrl();
    console.log(userDetails);
    if (!zipCodeValidationColor) {
      await axios
        .post(`${customer_reg_url}/auth/edit-details`, userDetails, {
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

              state_id: defaultValues.state_id,
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
    getStatesAndCityFromApi();
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
                  <div className="row gutters">
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
                        <label htmlFor="eMail" className="form-label">
                          Email
                        </label>
                        <p>{email_address}</p>
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
                          defaultValue={defaultAddress}
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
                          defaultValue={defaultLocality}
                          readOnly={isReadOnly}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="state" className="form-label">
                          State
                        </label>
                        <p className={`${lableVisibility}`}>{defaultState}</p>
                        <select
                          name="state"
                          id="state"
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
                        <p className={`${lableVisibility}`}>{defaultCity}</p>
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
                          defaultValue={defaultZip}
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
