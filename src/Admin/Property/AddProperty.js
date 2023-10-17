import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import BreadCrumb from "../BreadCrumb";
import { checkLoginSession, openInNewTab } from "../../CommonFunctions";

let authHeader = "";
let bank_Id = "";
let branch_Id = "";
let zipError = false;
let areaError = false;
let isBank = false;
const AddProperty = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    bank_Id = data.bank_id;
    branch_Id = data.branch_Id;
  }

  const [possessionCheckValue, setPossessionCheckValue] = useState({
    titleClearYes: false,
    titleClearNo: false,
  });
  const { titleClearYes, titleClearNo } = possessionCheckValue;

  const [formData, setFormData] = useState({
    is_sold: 0,
    is_available_for_sale: 1,
    sale_availability_date: "2005-12-26 23:50:30",
    status: "yes",
    is_stressed: 1,
    property_id: 0,
    address_details: {
      locality: "Urban",
      state: "",
      zip: "",
    },
  });
  const { is_sold, saleable_area, carpet_area } = formData;
  const { locality, state, zip } = formData.address_details;

  const [propertyCategories, setPropertyCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [activeBank, setActiveBank] = useState({});
  const [bankBranches, setBankBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState({});
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [zipCodeValidationMessage, setZipCodeValidationMessage] = useState("");
  const [areaValidationMessage, setAreaValidationMessage] = useState("");
  const branchSelectBoxRef = useRef();
  const citySelectBoxRef = useRef();
  const notSoldCheckRef = useRef();
  const defaultIsStressedRef = useRef();
  const [pathLocation, setPathLocation] = useState("");

  const getDataFromApi = async () => {
    const propertyCategoryRes = await axios.get(`/sam/v1/property/by-category`);
    setPropertyCategories(propertyCategoryRes.data);
    const bankRes = await axios.get(`/sam/v1/property/by-bank`);
    setBanks(bankRes.data);
    const statesRes = await axios.get(`/sam/v1/property/by-state`);
    setAllStates(statesRes.data);

    if (isBank) {
      getBankDeatails(bankRes.data);
    }


  };

  const getBankDeatails = async (bankData) => {
    const activeBankDetails = bankData.filter(bank => bank.bank_id === bank_Id)[0]
    setActiveBank(activeBankDetails);
    const branchRes = await axios.get(`/sam/v1/property/auth/bank-branches/${bank_Id}`, {
      headers: authHeader,
    });
    const branchResData = branchRes.data;
    const activeBranchDetails = branchResData.filter(branch => branch.branch_id === branch_Id)[0]
    setActiveBranch(activeBranchDetails);
    branchSelectBoxRef.current.classList.remove("d-none");
    commonFnToSaveFormData("bank", bank_Id);
    commonFnToSaveFormData("bank_branch_id", branch_Id);
  }


  const commonFnToSaveFormData = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const commonFnToSaveAddressDetails = (name, value) => {
    setFormData({
      ...formData,
      address_details: {
        ...formData.address_details,
        [name]: value,
        address: locality,
      },
    });
  };

  const onInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "type_id") {
      if (value) {
        commonFnToSaveFormData(name, parseInt(value));
      }
    } else if (name === "property_number") {
      commonFnToSaveFormData(name, value);
    } else if (name === "bank") {
      if (value) {
        branchSelectBoxRef.current.classList.remove("d-none");
        const branchRes = await axios.get(
          `/sam/v1/property/auth/bank-branches/${value}`,
          {
            headers: authHeader,
          }
        );
        setBankBranches(branchRes.data);
      } else {
        branchSelectBoxRef.current.classList.add("d-none");
      }
    } else if (name === "bank_branch_id") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "is_stressed") {
      commonFnToSaveFormData(name, parseInt(value));
    }
    // else if (name === "status") {
    //   commonFnToSaveFormData(name, value);
    // }
    else if (name === "territory") {
      commonFnToSaveFormData(name, value);
    } else if (name === "saleable_area") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "carpet_area") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "market_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "ready_reckoner_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "expected_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "distress_value") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "completion_date") {
      commonFnToSaveFormData(name, value);
    } else if (name === "purchase_date") {
      commonFnToSaveFormData(name, value);
    } else if (name === "mortgage_date") {
      commonFnToSaveFormData(name, value);
    } else if (name === "is_sold") {
      const notForSale = document.getElementById("notForSale");
      if (value === "1") {
        notSoldCheckRef.current.removeAttribute("checked");
        if (notForSale) {
          notForSale.selected = true;
        }
        setFormData({
          ...formData,
          [name]: parseInt(value),
          is_available_for_sale: 0,
        });
      } else {
        setFormData({
          ...formData,
          [name]: parseInt(value),
          is_available_for_sale: 1,
        });
      }
    } else if (name === "is_available_for_sale") {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    }
    // else if (name === "sale_availability_date") {
    //   commonFnToSaveFormData(name, value);
    // }
    else if (name === "flat_number") {
      commonFnToSaveAddressDetails(name, parseInt(value));
    } else if (name === "building_name") {
      commonFnToSaveAddressDetails(name, value);
    } else if (name === "society_name") {
      commonFnToSaveAddressDetails(name, value);
    } else if (name === "plot_number") {
      commonFnToSaveAddressDetails(name, parseInt(value));
    } else if (name === "locality") {
      commonFnToSaveAddressDetails(name, value);
    } else if (name === "landmark") {
      commonFnToSaveAddressDetails(name, value);
    } else if (name === "state") {
      if (value) {
        commonFnToSaveAddressDetails(name, parseInt(value));
        const citiesRes = await axios.post(`/sam/v1/property/by-city`, {
          state_id: parseInt(value),
        });
        setAllCities(citiesRes.data);
        citySelectBoxRef.current.classList.remove("d-none");
      } else {
        citySelectBoxRef.current.classList.add("d-none");
      }
    } else if (name === "city") {
      commonFnToSaveAddressDetails(name, parseInt(value));
    } else if (name === "zip") {
      if (value) {
        commonFnToSaveAddressDetails(name, parseInt(value));
      }
    } else if (name === "title_clear_property") {
      if (value === "1") {
        setPossessionCheckValue({ titleClearYes: true, titleClearNo: false });
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Owner / Customer consent",
        });
      } else if (value === "0") {
        setPossessionCheckValue({ titleClearYes: false, titleClearNo: true });
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Legally attached",
        });
      } else {
        setPossessionCheckValue({ titleClearYes: false, titleClearNo: false });
      }
    }
  };

  const resetValidationsOnSubmit = () => {
    setAreaValidationMessage("");
    setZipCodeValidationMessage("");
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(`/sam/v1/customer-registration/zipcode-validation`, {
        zipcode: String(zip),
        state_id: parseInt(state),
      })
      .then((res) => {
        if (res.data.status === 0) {
          setZipCodeValidationMessage("Invalid ZipCode.");
          zipError = true;
        } else {
          setAreaValidationMessage("");
          zipError = false;
        }
      });

    if (parseInt(saleable_area) < parseInt(carpet_area)) {
      setAreaValidationMessage("Carpet area must be less than salable area.");
      areaError = true;
    } else {
      setAreaValidationMessage("");
      areaError = false;
    }

    if (zipError || areaError) {
      if (zipError === false) {
        setZipCodeValidationMessage("");
      }
      if (areaError === false) {
        setAreaValidationMessage("");
      }
    } else {
      console.log(formData);
      // try {
      //   console.log(formData);
      //   await axios
      //     .post(`/sam/v1/property/auth/single-property`, formData, {
      //       headers: authHeader,
      //     })
      //     .then((res) => {
      //       if (res.data.msg === 0) {
      //         localStorage.setItem("upload-doc", JSON.stringify({
      //           number: formData.property_number,
      //           id: null,
      //         }));
      //         localStorage.setItem("property_number", formData.property_number);
      //         resetValidationsOnSubmit();
      //         localStorage.setItem("singlePropertySuccess", true);
      //         e.target.reset();
      //         openInNewTab(
      //           `${isBank ? "/bank" : "/admin"
      //           }/property/single-property-documents-upload`
      //         );
      //       } else if (res.data.msg === 2) {
      //         toast.error(
      //           `Property with property number: ${formData.property_number} already exists`
      //         );
      //       }
      //     });
      // } catch (error) {
      //   toast.error("Internal server error");
      // }
    }
  };
  useEffect(() => {
    notSoldCheckRef.current.setAttribute("checked", "true");
    defaultIsStressedRef.current.setAttribute("checked", "true");
    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getDataFromApi();
        }
      });
    }
    // eslint-disable-next-line
    if (window.location.pathname) {
      const currentPagePath = window.location.pathname;
      const firstPathSegment = currentPagePath.split('/')[1];
      setPathLocation(firstPathSegment);
    }
  }, []);

  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-lg-9 col-md-8 mt- mt-md-0">
            <BreadCrumb />
            <section className="add-property-wrapper mb-4">
              <div className="container-fluid">
                <div className="row justify-content-center">
                  <div className="col-xl-12">
                    <form onSubmit={onFormSubmit} className="card p-xl-2">
                      <div className="card-body">
                        <h4 className="fw-bold">Add Property</h4>
                        <hr />
                        {/* Row 1 - Basic Details */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h5 className="fw-bold text-primary">
                              Basic details
                            </h5>
                          </div>
                          <div className="col-xl-4 col-md-6">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="type_id"
                              >
                                Property type
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <select
                                id="type_id"
                                name="type_id"
                                className="form-select"
                                onChange={onInputChange}
                                required
                              >
                                <option value=""></option>
                                {propertyCategories ? (
                                  propertyCategories.map((data) => {
                                    return (
                                      <option
                                        key={data.type_id}
                                        value={data.type_id}
                                      >
                                        {data.type_name}
                                      </option>
                                    );
                                  })
                                ) : (
                                  <></>
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                            <div className="form-group">
                              <label
                                htmlFor="property_number"
                                className="form-label common-btn-font"
                              >
                                Property Number
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                id="property_number"
                                name="property_number"
                                className="form-control"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="bank"
                              >
                                Bank
                                <span className="fw-bold text-danger">*</span>
                              </label>

                              {pathLocation === 'admin' ? <select
                                id="bank"
                                name="bank"
                                className="form-select"
                                onChange={onInputChange}
                                required
                              >
                                <option value=""></option>
                                {banks ? (
                                  banks.map((data) => {
                                    if (pathLocation === 'admin') {
                                      return (
                                        <option
                                          key={data.bank_id}
                                          value={data.bank_id}
                                        >
                                          {data.bank_name}
                                        </option>
                                      );
                                    }
                                    {/* else if (pathLocation === 'bank') {
                                      return (
                                        <option
                                          key={data.bank_id}
                                          value={data.bank_id}
                                        >
                                          {data.bank_name}
                                        </option>
                                      );
                                    } */}

                                  })
                                ) : (
                                  <> </>
                                )}
                              </select> :
                                <input
                                  type="text"
                                  id="bank"
                                  name="bank"
                                  className="form-control"
                                  // onChange={onInputChange}
                                  value={activeBank.bank_name}
                                  required
                                  disabled
                                />}
                            </div>
                          </div>
                          <div
                            className="col-xl-4 col-md-6 mt-3 d-none"
                            ref={branchSelectBoxRef}
                          >
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="bank_branch_id"
                              >
                                Branch
                                <span className="fw-bold text-danger">*</span>
                              </label>

                              {pathLocation === 'admin' ?
                                <select
                                  id="bank_branch_id"
                                  name="bank_branch_id"
                                  className="form-select"
                                  onChange={onInputChange}
                                  required
                                >
                                  <option value=""></option>
                                  {bankBranches ? (
                                    bankBranches.map((data) => {
                                      return (
                                        <option
                                          key={data.branch_id}
                                          value={data.branch_id}
                                        >
                                          {data.branch_name}
                                        </option>
                                      );
                                    })
                                  ) : (
                                    <></>
                                  )}
                                </select> :
                                <input
                                  type="text"
                                  id="bank_branch_id"
                                  name="bank_branch_id"
                                  className="form-control"
                                  // onChange={onInputChange}
                                  value={activeBranch.branch_name}
                                  required
                                  disabled
                                />}
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="title_clear_property"
                              >
                                Title clear Property
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <select
                                id="title_clear_property"
                                name="title_clear_property"
                                className="form-select"
                                onChange={onInputChange}
                                required
                              >
                                <option value=""></option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                              </select>
                            </div>
                          </div>
                          {/* <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="possession"
                              >
                                Possession of the property
                              </label>
                              <div id="possession">
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="possessionValue1"
                                    value="possessionValue"
                                    disabled
                                    checked={titleClearNo}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="possessionValue1"
                                  >
                                    Legally attached
                                  </label>
                                </div>
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="possessionValue2"
                                    value="possessionValue"
                                    disabled
                                    checked={titleClearYes}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="possessionValue2"
                                  >
                                    Owner / Customer consent
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div> */}
                          <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label className="form-label common-btn-font">
                                Is stressed?
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <br />
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="is_stressed"
                                  value="1"
                                  onChange={onInputChange}
                                  ref={defaultIsStressedRef}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="inlineRadio1"
                                >
                                  Yes
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="is_stressed"
                                  value="0"
                                  onChange={onInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="inlineRadio2"
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label
                                htmlFor="territory"
                                className="form-label common-btn-font"
                              >
                                Territory
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                id="territory"
                                name="territory"
                                className="form-control"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label
                                htmlFor="status"
                                className="form-label common-btn-font"
                              >
                                Status
                              </label>
                              <br />
                              <select
                                name="status"
                                onChange={onInputChange}
                                id="status"
                                className="form-select"
                                required
                              >
                                <option value=""></option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                              </select>
                            </div>
                          </div> */}
                        </div>
                        {/* Row 2 - Area Details*/}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h5 className="fw-bold text-primary">Area</h5>
                          </div>
                          <div className="col-xl-4 col-md-6">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="saleable_area"
                              >
                                Saleable area (sq. ft.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="saleable_area"
                                name="saleable_area"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="carpet_area"
                              >
                                Carpet area (sq. ft.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className={`form-control ${areaValidationMessage ? "border-danger" : ""
                                  }`}
                                id="carpet_area"
                                name="carpet_area"
                                onChange={onInputChange}
                                required
                              />
                              <span
                                className={`text-danger ${areaValidationMessage ? "" : "d-none"
                                  }`}
                              >
                                {areaValidationMessage}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Row 3 - Pricing Details */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h5 className="fw-bold text-primary">Pricing</h5>
                          </div>
                          <div className="col-xl-4 col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="market_price"
                                className="form-label common-btn-font"
                              >
                                Market price (Rs.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                id="market_price"
                                name="market_price"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                            <div className="form-group">
                              <label
                                htmlFor="ready_reckoner_price"
                                className="form-label common-btn-font"
                              >
                                Ready reckoner price (Rs.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                id="ready_reckoner_price"
                                name="ready_reckoner_price"
                                className="form-control"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="expected_price"
                              >
                                Reserved Price (Rs.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="expected_price"
                                name="expected_price"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mt-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="distress_value"
                              >
                                Distress Value (Rs.)
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="distress_value"
                                name="distress_value"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Row 4 - Dates & Availability Details */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h5 className="fw-bold text-primary">
                              Dates & Availability
                            </h5>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="completion_date"
                                className="form-label common-btn-font"
                              >
                                Completion date
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="date"
                                id="completion_date"
                                name="completion_date"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="purchase_date"
                                className="form-label common-btn-font"
                              >
                                Purchase date
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="date"
                                id="purchase_date"
                                name="purchase_date"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="mortgage_date"
                                className="form-label common-btn-font"
                              >
                                Mortgage date
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="date"
                                id="mortgage_date"
                                name="mortgage_date"
                                onChange={onInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mb-3 mb-xl-0">
                            <div className="form-group">
                              <label className="form-label common-btn-font">
                                Is sold?
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <br />
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="is_sold"
                                  value="1"
                                  onChange={onInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="inlineRadio1"
                                >
                                  Yes
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="is_sold"
                                  value="0"
                                  onChange={onInputChange}
                                  ref={notSoldCheckRef}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="inlineRadio2"
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`col-xl-4 col-md-6 mb-3 mb-xl-0 ${is_sold === 1 ? "d-none" : ""
                              }`}
                          >
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="is_available_for_sale"
                              >
                                Available for sale?
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <select
                                id="is_available_for_sale"
                                name="is_available_for_sale"
                                className="form-select"
                                onChange={onInputChange}
                                required
                              >
                                <option id="notForSale" value="1">
                                  Yes
                                </option>
                                <option value="0">No</option>
                              </select>
                            </div>
                          </div>
                          {/* <div
                            className={`col-xl-4 col-md-6 ${
                              is_sold === "1" ? "d-none" : ""
                            }`}
                          >
                            <div className="form-group">
                              <label
                                htmlFor="sale_availability_date"
                                className="form-label common-btn-font"
                              >
                                Sale availability
                              </label>
                              <input
                                className="form-control"
                                type="date"
                                id="sale_availability_date"
                                name="sale_availability_date"
                                onChange={onInputChange}
                                required={is_sold === "1" ? false : true}
                              />
                            </div>
                          </div> */}
                        </div>
                        {/* Row 5 - Address Details */}
                        <div className="row">
                          <div className="col-12">
                            <h5 className="fw-bold text-primary">Address</h5>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="flat_number"
                              >
                                Flat No.
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="flat_number"
                                name="flat_number"
                                type="number"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mb-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="building_name"
                              >
                                Building Name
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="building_name"
                                name="building_name"
                                type="text"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mb-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="society_name"
                              >
                                Society Name
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="society_name"
                                name="society_name"
                                type="text"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="plot_number"
                              >
                                Plot No.
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="plot_number"
                                name="plot_number"
                                type="number"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-xl-4 mb-3 col-md-6">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="locality"
                              >
                                Locality
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="locality"
                                name="locality"
                                type="text"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>

                          <div className="col-xl-4 col-md-6 mb-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="landmark"
                              >
                                Landmark
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                id="landmark"
                                name="landmark"
                                type="text"
                                className="form-control "
                                onChange={onInputChange}
                              />
                            </div>
                          </div>

                          <div className="col-xl-4 col-md-6 mb-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="state"
                              >
                                State
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <select
                                id="state"
                                name="state"
                                className="form-select"
                                onChange={onInputChange}
                                required
                              >
                                <option value=""></option>
                                {allStates ? (
                                  allStates.map((data) => {
                                    return (
                                      <option
                                        key={data.state_id}
                                        value={data.state_id}
                                      >
                                        {data.state_name}
                                      </option>
                                    );
                                  })
                                ) : (
                                  <></>
                                )}
                              </select>
                            </div>
                          </div>
                          <div
                            className="col-xl-4 col-md-6 mb-3 d-none"
                            ref={citySelectBoxRef}
                          >
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="city"
                              >
                                City
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <select
                                id="city"
                                name="city"
                                className="form-select"
                                onChange={onInputChange}
                                required={state !== "" ? true : false}
                              >
                                <option value=""></option>
                                {allCities ? (
                                  allCities.map((data) => {
                                    return (
                                      <option
                                        key={data.city_id}
                                        value={data.city_id}
                                      >
                                        {data.city_name}
                                      </option>
                                    );
                                  })
                                ) : (
                                  <></>
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="col-xl-4 col-md-6 mb-3">
                            <div className="form-group">
                              <label
                                className="form-label common-btn-font"
                                htmlFor="zip"
                              >
                                Zip
                                <span className="fw-bold text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                onChange={onInputChange}
                                id="zip"
                                name="zip"
                                className={`form-control ${zipCodeValidationMessage
                                  ? "border-danger"
                                  : ""
                                  }`}
                              ></input>
                              <span
                                className={`text-danger ${zipCodeValidationMessage ? "" : "d-none"
                                  }`}
                              >
                                {zipCodeValidationMessage}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="row text-end">
                          <div className="col-12">
                            <button type="submit" className="btn btn-primary">
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddProperty;
