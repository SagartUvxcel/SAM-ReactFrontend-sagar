import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const EditUserDetails = () => {
  const userDetails = {
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
    zip: "411015",
  };

  const goTo = useNavigate();

  const {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    pan,
    aadhaar,
    address,
    locality,
    city,
    state,
    zip,
  } = userDetails;

  const [allUseStates, setAllUseStates] = useState({
    isReadOnly: true,
    isDisabled: false,
    editClassName: "editable-values",
    cancelUpdateBtnClassName: "d-none",
    lableVisibility: "",
    selectStateClassName: "d-none",
    statesFromApi: [],
    citiesFromApi: [],
    state_id: "",
    cityVisiblity: "d-none",
  });

  const {
    isReadOnly,
    editClassName,
    cancelUpdateBtnClassName,
    lableVisibility,
    selectStateClassName,
    statesFromApi,
    state_id,
    citiesFromApi,
    cityVisiblity,
  } = allUseStates;

  const setHeaderAndUrl = () => {
    const loginToken = localStorage.getItem("logintoken");
    let headers = { Authorization: loginToken };
    let url = `/sam/v1/property/auth`;
    return [headers, url];
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
      // Store state id ( if available ) into  useState.
      if (value) {
        setAllUseStates({
          ...allUseStates,
          state_id: parseInt(value),
          cityVisiblity: "",
        });
      } else {
        // setAllUseStates({ ...allUseStates, cityVisiblity: "d-none" });
        delete allUseStates.state_id;
      }
      const cityByState = await axios.post(
        `${url}/by-city`,
        { state_id: parseInt(value) },
        { headers: headers }
      );
      setAllUseStates({ ...allUseStates, citiesFromApi: cityByState.data });
    }
  };

  const editDetails = () => {
    setAllUseStates({
      ...allUseStates,
      isReadOnly: false,
      isDisabled: true,
      editClassName: "",
      cancelUpdateBtnClassName: "",
      lableVisibility: "d-none",
      selectStateClassName: "",
    });
  };

  const cancelEditing = () => {
    setAllUseStates({
      ...allUseStates,
      isReadOnly: true,
      isDisabled: false,
      editClassName: "editable-values",
      cancelUpdateBtnClassName: "d-none",
      lableVisibility: "",
      selectStateClassName: "d-none",
    });
    let samp = document.querySelectorAll("input");
    for (let i of samp) {
      document.getElementById(i.name).value = userDetails[i.name];
    }
  };

  const updateDetails = (e) => {
    e.preventDefault();
    toast.success("Details Updated Successfully");
    setTimeout(() => {
      goTo("/profile");
    }, 3000);
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
                        <label htmlFor="firstName">First Name</label>
                        <p>{firstName}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="middleName">Middle Name</label>
                        <p>{middleName}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="lastName">Last Name</label>
                        <p>{lastName}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="eMail">Email</label>
                        <p>{email}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="phone">Phone</label>
                        <p>{phone}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="pan">PAN Number</label>
                        <p>{pan}</p>
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="aadhaar">Aadhaar Number</label>
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
                        <label htmlFor="address">Block / House No.</label>
                        <input
                          name="address"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="address"
                          defaultValue={address}
                          readOnly={isReadOnly}
                        />
                      </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="locality">Block / House No.</label>
                        <input
                          name="locality"
                          type="text"
                          className={`form-control ${editClassName}`}
                          id="locality"
                          defaultValue={locality}
                          readOnly={isReadOnly}
                        />
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="state">State</label>
                        <p className={`${lableVisibility}`}>{state}</p>
                        <select
                          name="state"
                          id="state"
                          className={`form-select ${selectStateClassName}`}
                          onChange={onInputChange}
                        >
                          {statesFromApi
                            ? statesFromApi.map((i, Index) => {
                                // let selectedState = document.getElementById(
                                //   i.state_name
                                // );
                                // if (selectedState) {
                                //   if (i.state_name === state) {
                                //     selectedState.selected = true;
                                //   }
                                // }
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
                        <div className={`${lableVisibility}`}>
                          <label>City</label>
                          <p>{city}</p>
                        </div>

                        <label htmlFor="city" className={`${cityVisiblity}`}>
                          City
                        </label>

                        <select
                          name="city"
                          id="city"
                          className={`form-select ${cityVisiblity}`}
                        >
                          {citiesFromApi
                            ? citiesFromApi.map((i, Index) => {
                                let selectedCity = document.getElementById(
                                  i.city_name
                                );
                                if (selectedCity) {
                                  if (i.city_name === city) {
                                    selectedCity.selected = true;
                                  }
                                }
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

                    <div className="col-xl-4 col-lg-4 col-md-6  col-12">
                      <div className="form-group mb-3">
                        <label htmlFor="zip">Zip Code</label>
                        <input
                          name="zip"
                          type="number"
                          className={`form-control ${editClassName}`}
                          id="zip"
                          defaultValue={zip}
                          readOnly={isReadOnly}
                        />
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
