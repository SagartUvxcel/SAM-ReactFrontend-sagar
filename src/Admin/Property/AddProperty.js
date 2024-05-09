import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import BreadCrumb from "../BreadCrumb";
import { checkLoginSession, openInNewTab } from "../../CommonFunctions";
import CommonSpinner from "../../CommonSpinner";

let authHeader = "";
let bank_Id = "";
let branch_Id = "";
let roleId = "";
let zipError = false;
let areaError = false;
let isBank = false;

// main component function
const AddProperty = () => {

  // login credentials
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    bank_Id = data.bank_id;
    roleId = data.roleId;
    branch_Id = data.branch_Id;
  }

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
  const [showLoader, setShowLoader] = useState(true);
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
  const [pathLocation, setPathLocation] = useState("");


  // get category,bank, state details
  const getDataFromApi = async () => {
    try {
      // property category 
      const propertyCategoryRes = await axios.get(`/sam/v1/property/by-category`);
      if (propertyCategoryRes.data) {
        setPropertyCategories(propertyCategoryRes.data);
      }
      // bank
      const bankRes = await axios.get(`/sam/v1/property/by-bank`);
      if (bankRes.data) {
        setBanks(bankRes.data);
      }

      if (isBank) {
        getBankDetails(bankRes.data);
      }

      // states
      const statesRes = await axios.get(`/sam/v1/property/by-state`);
      if (statesRes.data) {
        setAllStates(statesRes.data);
      }
      setShowLoader(false);

    } catch (error) {
      setShowLoader(false);
    }
    const propertyCategoryRes = await axios.get(`/sam/v1/property/by-category`);

    setPropertyCategories(propertyCategoryRes.data);
    const bankRes = await axios.get(`/sam/v1/property/by-bank`);
    setBanks(bankRes.data);
    const statesRes = await axios.get(`/sam/v1/property/by-state`);
    setAllStates(statesRes.data);
  };

  // get bank Details
  const getBankDetails = async (bankData) => {
    const activeBankDetails = bankData.filter(bank => bank.bank_id === bank_Id)[0]
    setActiveBank(activeBankDetails);
    const branchRes = await axios.get(`/sam/v1/property/auth/bank-branches/${bank_Id}`, {
      headers: authHeader,
    });
    if (roleId !== 6) {
      const branchResData = branchRes.data;
      const activeBranchDetails = branchResData.filter(branch => branch.branch_id === branch_Id)[0]
      setActiveBranch(activeBranchDetails);
      commonFnToSaveFormData("bank_branch_id", parseInt(activeBranchDetails.branch_id));
    } else {
      setBankBranches(branchRes.data);
    }
    commonFnToSaveFormData("bank", bank_Id);
    if (branchSelectBoxRef && branchSelectBoxRef.current) {
      branchSelectBoxRef.current.classList.remove("d-none");
    }
  }

  // commonFnToSaveFormData
  const commonFnToSaveFormData = (name, value) => {
    setFormData((old) => ({ ...old, [name]: value }))
  };
  // commonFnToSaveAddressDetails
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


  // handle Focus
  const handleFocus = (e) => {
    e.target.nextSibling.classList.add('active');
  };

  // on input blur
  const onInputBlur = async (e) => {
    const { value } = e.target;
    if (!value) {
      e.target.nextSibling.classList.remove('active');
    }
  }

  // handle Click
  const handleClick = (inputId) => {
    const input = document.getElementById(inputId);
    input.focus();
  };

  // onInputChange
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
    } else if (name === "territory") {
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
    } else if (name === "flat_number") {
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
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Owner / Customer consent",
        });
      } else if (value === "0") {
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Legally attached",
        });
      } else {
      }
    }
  };

  // reset Validations OnSubmit
  const resetValidationsOnSubmit = () => {
    setAreaValidationMessage("");
    setZipCodeValidationMessage("");
  };

  // on Form Submit
  const onFormSubmit = async (e) => { 
    e.preventDefault();
    let zipCodeValue=String(zip);
    await axios
      .post(`/sam/v1/customer-registration/zipcode-validation`, {
        zipcode: zipCodeValue,
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
      try {
        await axios
          .post(`/sam/v1/property/auth/single-property`, formData, {
            headers: authHeader,
          })
          .then((res) => {
            if (res.data.msg === 0) {
              localStorage.setItem("upload-doc", JSON.stringify({
                number: formData.property_number,
                id: null,
              }));
              localStorage.setItem("property_number", formData.property_number);
              resetValidationsOnSubmit();
              localStorage.setItem("singlePropertySuccess", true);
              e.target.reset();
              openInNewTab(
                `${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"
                }/property/single-property-documents-upload`
              );
            } else if (res.data.msg === 2) {
              toast.error(
                `Property with property number: ${formData.property_number} already exists`
              );
            }
          });
      } catch (error) {
        toast.error("Internal server error");
      }
    }
  };
  useEffect(() => {
    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getDataFromApi();
        }
      });
    }
    if (window.location.pathname) {
      const currentPagePath = window.location.pathname;
      const firstPathSegment = currentPagePath.split('/')[1];
      setPathLocation(firstPathSegment);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-lg-9 col-md-8 mt- mt-md-0">
            <BreadCrumb />
            {showLoader ? <>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh" }}
              >
                <CommonSpinner
                  spinnerColor="primary"
                  height="4rem"
                  width="4rem"
                  spinnerType="grow"
                />
              </div>
            </>
              : <>
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
                              <div className="col-12 mb-2">
                                <h5 className="fw-bold heading-text-primary">
                                  Basic details
                                </h5>
                              </div>
                              {/* Property type */}
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <select
                                    id="type_id"
                                    name="type_id"
                                    className="form-select custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
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
                                  <label className="px-2" htmlFor="type_id" onClick={() => handleClick('type_id')} >Property Type<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Property Number */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="text"
                                    id="property_number"
                                    name="property_number"
                                    className="form-control custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="property_number" onClick={() => handleClick('property_number')} >Property Number<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Bank */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                                <div className="form-group custom-class-form-div">
                                  {pathLocation === 'admin' ?
                                    <select
                                      id="bank"
                                      name="bank"
                                      className="form-select custom-input"
                                      onChange={onInputChange}
                                      onBlur={onInputBlur}
                                      onFocus={handleFocus}
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
                                            )
                                          }
                                          return null;
                                        })
                                      ) : (
                                        null
                                      )}
                                    </select> :
                                    <input
                                      type="text"
                                      id="bank"
                                      name="bank"
                                      className="form-control custom-input"
                                      value={activeBank.bank_name}
                                      required
                                      disabled
                                    />}
                                  <label className={`px-2 ${activeBank.bank_name ? "active":""}`} htmlFor="bank" onClick={() => handleClick('bank')} >Bank<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* branch */}
                              <div
                                className="col-xl-4 col-md-6 mt-3 d-none"
                                ref={branchSelectBoxRef}
                              >
                                <div className="form-group custom-class-form-div">

                                  {pathLocation === 'admin' || pathLocation === 'bank' ?
                                    <select
                                      id="bank_branch_id"
                                      name="bank_branch_id"
                                      className="form-select custom-input"
                                      onChange={onInputChange}
                                      onBlur={onInputBlur}
                                      onFocus={handleFocus}
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
                                      className="form-control custom-input"
                                      value={activeBranch.branch_name}
                                      required
                                      disabled
                                    />}
                                  <label className="px-2 active" htmlFor="bank_branch_id" onClick={() => handleClick('bank_branch_id')} >Branch<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Title clear Property */}
                              <div className="col-xl-4 col-md-6 mt-3">
                                <div className="form-group custom-class-form-div">
                                  <select
                                    id="title_clear_property"
                                    name="title_clear_property"
                                    className="form-select custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  >
                                    <option value=""></option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                  </select>
                                  <label className="px-2" htmlFor="title_clear_property" onClick={() => handleClick('title_clear_property')} >Title Clear Property<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Territory */}
                              <div className="col-xl-4 col-md-6 mt-3">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="text"
                                    id="territory"
                                    name="territory"
                                    className="form-control custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="territory" onClick={() => handleClick('territory')} >Territory<span className="text-danger">*</span></label>
                                </div>
                              </div>
                            </div>
                            {/* Row 2 - Area Details*/}
                            <div className="row mb-3">
                              <div className="col-12 mb-2">
                                <h5 className="fw-bold heading-text-primary">Area</h5>
                              </div>
                              {/* Saleable area */}
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    className="form-control custom-input"
                                    id="saleable_area"
                                    name="saleable_area"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="saleable_area" onClick={() => handleClick('saleable_area')} >Saleable Area (sq. ft.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Carpet area (sq. ft.) */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                                <div className="form-group custom-class-form-div" >
                                  <input
                                    type="number"
                                    className={`form-control ${areaValidationMessage ? "border-danger" : ""
                                      }`}
                                    id="carpet_area"
                                    name="carpet_area"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="carpet_area" onClick={() => handleClick('carpet_area')} >Carpet Area (sq. ft.)<span className="text-danger">*</span></label>
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
                              <div className="col-12 mb-2">
                                <h5 className="fw-bold heading-text-primary">Pricing</h5>
                              </div>
                              {/* Market price (Rs.) */}
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    className="form-control custom-input"
                                    type="number"
                                    id="market_price"
                                    name="market_price"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="market_price" onClick={() => handleClick('market_price')} >Market Price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Ready reckoner price (Rs.) */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    id="ready_reckoner_price"
                                    name="ready_reckoner_price"
                                    className="form-control custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="ready_reckoner_price" onClick={() => handleClick('ready_reckoner_price')} >Ready reckoner Price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Reserved Price (Rs.) */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    className="form-control custom-input"
                                    id="expected_price"
                                    name="expected_price"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="expected_price" onClick={() => handleClick('expected_price')} > Reserved Price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/*  Distress Value (Rs.) */}
                              <div className="col-xl-4 col-md-6 mt-3">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    className="form-control custom-input"
                                    id="distress_value"
                                    name="distress_value"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="distress_value" onClick={() => handleClick('distress_value')} >  Distress Value (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                            </div>
                            {/* Row 4 - Dates & Availability Details */}
                            <div className="row mb-3">
                              <div className="col-12 mb-2">
                                <h5 className="fw-bold heading-text-primary">
                                  Dates & Availability
                                </h5>
                              </div>
                              {/* Completion date */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    className="form-control custom-input"
                                    type="date"
                                    id="completion_date"
                                    name="completion_date"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus} 
                                    placeholder=" "
                                    required
                                  />
                                  <label className="px-2" htmlFor="completion_date" onClick={() => handleClick('completion_date')} > Completion Date<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Purchase date */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    className="form-control custom-input"
                                    type="date"
                                    id="purchase_date"
                                    name="purchase_date"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="purchase_date" onClick={() => handleClick('purchase_date')} >  Purchase Date<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Mortgage date */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    className="form-control custom-input"
                                    type="date"
                                    id="mortgage_date"
                                    name="mortgage_date"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="mortgage_date" onClick={() => handleClick('mortgage_date')} >Mortgage Date<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Available for sale? */}
                              <div
                                className={`col-xl-4 col-md-6 mb-3 mb-xl-0 ${is_sold === 1 ? "d-none" : ""
                                  }`}
                              >
                                <div className="form-group custom-class-form-div" >
                                  <select
                                    id="is_available_for_sale"
                                    name="is_available_for_sale"
                                    className="form-select custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  >
                                    <option value="">  </option>
                                    <option id="notForSale" value="1">
                                      Yes
                                    </option>
                                    <option value="0">No</option>
                                  </select>
                                  <label className="px-2" htmlFor="is_available_for_sale" onClick={() => handleClick('is_available_for_sale')} >Available For Sale?<span className="text-danger">*</span></label>
                                </div>
                              </div>
                            </div>
                            {/* Row 5 - Address Details */}
                            <div className="row">
                              <div className="col-12 mb-2">
                                <h5 className="fw-bold heading-text-primary">Address</h5>
                              </div>
                              {/* Flat No. */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="flat_number"
                                    name="flat_number"
                                    type="number"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="flat_number" onClick={() => handleClick('flat_number')} >Flat No.<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Building Name */}
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="building_name"
                                    name="building_name"
                                    type="text"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="building_name" onClick={() => handleClick('building_name')} >Building Name<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Society Name */}
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="society_name"
                                    name="society_name"
                                    type="text"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="society_name" onClick={() => handleClick('society_name')} >Society Name<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Plot No. */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="plot_number"
                                    name="plot_number"
                                    type="number"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="plot_number" onClick={() => handleClick('plot_number')} >Plot No.<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Locality */}
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="locality"
                                    name="locality"
                                    type="text"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="locality" onClick={() => handleClick('locality')} >Locality<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Landmark */}
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    id="landmark"
                                    name="landmark"
                                    type="text"
                                    className="form-control custom-input "
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2" htmlFor="landmark" onClick={() => handleClick('landmark')} >Landmark<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* State */}
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group custom-class-form-div"> 
                                  <select
                                    id="state"
                                    name="state"
                                    className="form-select custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
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
                                  <label className="px-2" htmlFor="state" onClick={() => handleClick('state')} >Select State<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* City */}
                              <div
                                className="col-xl-4 col-md-6 mb-3 d-none"
                                ref={citySelectBoxRef}
                              >
                                <div className="form-group custom-class-form-div"> 
                                  <select
                                    id="city"
                                    name="city"
                                    className="form-select custom-input"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
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
                                  <label className="px-2" htmlFor="city" onClick={() => handleClick('city')} >City<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Zip */}
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group custom-class-form-div"> 
                                  <input
                                    type="text"
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    id="zip"
                                    name="zip"
                                    className={`form-control ${zipCodeValidationMessage
                                      ? "border-danger"
                                      : ""
                                      }`}
                                  />
                                  <label className="px-2" htmlFor="zip" onClick={() => handleClick('zip')} >Zip<span className="text-danger">*</span></label>
                                  <span
                                    className={`text-danger ${zipCodeValidationMessage ? "" : "d-none"
                                      }`}
                                  >
                                    {zipCodeValidationMessage}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Add property button */}
                            <div className="row text-end">
                              <div className="col-12 mt-2">
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
              </>}
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default AddProperty;
