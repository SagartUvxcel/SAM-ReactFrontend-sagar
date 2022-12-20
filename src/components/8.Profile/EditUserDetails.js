import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const EditUserDetails = () => {
  const defaultValues = {
    firstName: "Arvind",
    middleName: "Rahul",
    lastName: "Sawant",
    email: "arvinds@uvxcel.com",
    phone: "9897868789",
    pan: "DCOUU5465C",
    aadhaar: "898767567564",
    address: "545, WXYZ Apartments",
    locality: "Kondhawa Road, Katraj",
    city: "Pune",
    state: "Maharashtra",
    state_id: 1,
    zip: 411015,
  };

  const { firstName, middleName, lastName, phone, pan, aadhaar } =
    defaultValues;

  const [userDetails, setUserDetails] = useState({
    address: defaultValues.address,
    locality: defaultValues.locality,
    city: defaultValues.city,
    state: defaultValues.state,
    zip: defaultValues.zip,
    email: localStorage.getItem("user"),
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
    cityIsDisabled: true,
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
    cityIsDisabled,
    state_id,
  } = allUseStates;

  const setHeaderAndUrl = () => {
    const loginToken = localStorage.getItem("logintoken");
    let headers = { Authorization: loginToken };
    let url = `/sam/v1/property/auth`;
    return [headers, url];
  };

  // Function to validate zipCodes.
  const zipValidationByState = async (zipValue, stateId) => {
    await axios
      .post(`/sam/v1/customer-registration/zipcode-validation`, {
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

  const getStatesFromApi = async () => {
    const [headers, url] = setHeaderAndUrl();
    // Get all states from api.
    const allStates = await axios.get(`${url}/by-state`, {
      headers: headers,
    });
    setAllUseStates({ ...allUseStates, statesFromApi: allStates.data });
  };

  const onInputChange = async (e) => {
    const { name, value } = e.target;
    const [headers, url] = setHeaderAndUrl();
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
        cityIsDisabled: false,
        state_id: parseInt(value),
      });
      zipValidationByState(zip, parseInt(value));
      setUserDetails({ ...userDetails, city: cityByState.data[0].city_name });
    } else if (name === "zip") {
      setUserDetails({ ...userDetails, zip: value });
      if (state_id !== "" && value !== "") {
        zipValidationByState(value, parseInt(state_id));
      }
    }
  };

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
      cityIsDisabled: true,
      state_id: defaultValues.state_id,
    });

    setValidation({
      zipCodeValidationColor: "",
      zipCodeValidationMessage: "",
    });

    let samp = document.querySelectorAll("input");
    for (let i of samp) {
      document.getElementById(i.name).value = defaultValues[i.name];
    }
  };

  const updateDetails = (e) => {
    e.preventDefault();
    console.log(userDetails);
    // toast.success("Details Updated Successfully");
    // setTimeout(() => {
    //   goTo("/profile");
    // }, 3000);
  };

  useEffect(() => {
    getStatesFromApi();
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
                        <p>{firstName}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="middleName" className="form-label">
                          Middle Name
                        </label>
                        <p>{middleName}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="lastName" className="form-label">
                          Last Name
                        </label>
                        <p>{lastName}</p>
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
                        <p>{phone}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="pan" className="form-label">
                          PAN Number
                        </label>
                        <p>{pan}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="aadhaar" className="form-label">
                          Aadhaar Number
                        </label>
                        <p>{aadhaar}</p>
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
                        <label htmlFor="state" className="form-label">
                          State
                        </label>
                        <p className={`${lableVisibility}`}>{state}</p>
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
                                    id={i.state_name}
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
                          name="city"
                          id="city"
                          className={`form-select  ${cityVisiblity}`}
                          disabled={cityIsDisabled}
                          required
                        >
                          {citiesFromApi
                            ? citiesFromApi.map((i, Index) => {
                                return (
                                  <option
                                    id={i.city_name}
                                    key={Index}
                                    value={i.city_id}
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
