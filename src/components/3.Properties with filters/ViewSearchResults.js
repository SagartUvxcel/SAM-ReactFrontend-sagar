import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import CryptoJS from "crypto-js";

const ViewSearchResults = () => {
  const location = useLocation();
  const dataFromParams = location.state ? location.state.sensitiveData : null;
  const goTo = useNavigate();
  const [dataToPost, setDataToPost] = useState(dataFromParams);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const paginationRef = useRef();
  const { batch_size } = dataFromParams;
  const [propertyData, setPropertyData] = useState([]);
  const localData = JSON.parse(localStorage.getItem("data"));
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    // localities: "",
    assetCategory: "",
    banks: "",
  });
  const { states, assetCategory, cities, banks } = searchFields;
  const moreFiltersForm = useRef();

  // It will fetch all states, banks, assets from api and will map those values to respective select fields.
  const getSearchDetails = async () => {
    let apis = {
      stateAPI: `/sam/v1/property/by-state`,
      bankAPI: `/sam/v1/property/by-bank`,
      categoryAPI: `/sam/v1/property/by-category`,
    };
    try {
      // Get all states from api.
      const allStates = await axios.get(apis.stateAPI);
      // Get all banks from api.
      const allBanks = await axios.get(apis.bankAPI);
      // Get all asset Categories from api.
      const assetCategories = await axios.get(apis.categoryAPI);
      let cityByState = {};
      if (dataFromParams.state_id) {
        cityByState = await axios.post(`/sam/v1/property/by-city`, {
          state_id: dataFromParams.state_id,
        });
      }

      // store states, banks and asset categories into searchFields useState.
      setSearchFields({
        ...searchFields,
        states: allStates.data,
        cities: cityByState.data,
        banks: allBanks.data,
        assetCategory: assetCategories.data,
      });
    } catch (error) {}
  };

  const showUpdatedMinMaxPriceRage = () => {
    if (dataToPost.max_price && dataToPost.min_price) {
      let minPriceToDisplay = `${(
        parseInt(dataToPost.min_price) / 10000000
      ).toFixed(2)} Cr.`;

      let maxPriceToDisplay = `${(
        parseInt(dataToPost.max_price) / 10000000
      ).toFixed(2)} Cr.`;

      let minPrices = document.querySelectorAll(".min-price-display");
      let maxPrices = document.querySelectorAll(".max-price-display");

      if (minPrices && maxPrices) {
        minPrices.forEach((minPrice) => {
          minPrice.textContent = minPriceToDisplay;
        });
        maxPrices.forEach((maxPrice) => {
          maxPrice.textContent = maxPriceToDisplay;
        });
      }
    }
  };

  const getPropertyData = async () => {
    setLoading(true);
    paginationRef.current.classList.add("d-none");
    window.scrollTo(0, 0);
    let apis = {
      searchAPI: `/sam/v1/property/count-category`,
    };
    let dataForTotalCount = {
      ...dataToPost,
      batch_size: 1000,
      batch_number: 1,
    };
    try {
      // This api is only for getting all the records and count length of array of properties so that we can decide page numbers for pagination.
      await axios.post(apis.searchAPI, dataForTotalCount).then((res) => {
        if (res.data) {
          setPageCount(Math.ceil(res.data.length / batch_size));
        }
      });
      console.log(dataToPost);
      // Post data and get Searched result from response.
      await axios.post(apis.searchAPI, dataToPost).then((res) => {
        // Store Searched results into propertyData useState.
        console.log(res.data);
        if (res.data !== null) {
          setPropertyData(res.data);
          setLoading(false);
          setTimeout(() => {
            showUpdatedMinMaxPriceRage();
          }, 500);
          paginationRef.current.classList.remove("d-none");
        } else {
          paginationRef.current.classList.add("d-none");
          setLoading(false);
          setPropertyData(null);
        }
      });
    } catch (error) {
      // toast.error("Internal server error");
      setLoading(false);
    }
  };

  // This will run when we click any page link in pagination. e.g. prev, 1, 2, 3, 4, next.
  const handlePageClick = async (pageNumber) => {
    window.scrollTo(0, 0);
    let currentPage = pageNumber.selected + 1;
    const nextOrPrevPagePropertyData = await fetchMoreProperties(currentPage);
    setPropertyData(nextOrPrevPagePropertyData);
    setTimeout(() => {
      showUpdatedMinMaxPriceRage();
    }, 500);
  };

  // Fetch more jobs on page click.
  const fetchMoreProperties = async (currentPage) => {
    let dataOfNextOrPrevPage = {
      ...dataToPost,
      batch_size: batch_size,
      batch_number: currentPage,
    };
    let apis = {
      searchAPI: `/sam/v1/property/count-category`,
    };
    const res = await axios.post(apis.searchAPI, dataOfNextOrPrevPage);
    return res.data;
  };

  const [searchBtnDisabled, setSearchBtnDisabled] = useState(true);

  useEffect(() => {
    if (Object.keys(dataToPost).length > 2) {
      setSearchBtnDisabled(false);
    } else {
      setSearchBtnDisabled(true);
    }
  }, [dataToPost]);

  // This function will run on change of input fields.
  const onFieldsChange = async (e) => {
    let apis = {
      cityAPI: `/sam/v1/property/by-city`,
      addressAPI: `/sam/v1/property/by-address`,
    };
    const { name, value } = e.target;
    if (name === "states") {
      // Store state id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, state_id: parseInt(value) });
      } else {
        delete dataToPost.state_id;
        delete dataToPost.city_id;
        setDataToPost({ ...dataToPost });
      }
      // If input is state then post selected state id to api for getting cities based on selected state.
      const cityByState = await axios.post(apis.cityAPI, {
        state_id: parseInt(value),
      });
      // Store cities data into searchField useState.
      setSearchFields({ ...searchFields, cities: cityByState.data });
    } else if (name === "cities") {
      // Store city id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, city_id: parseInt(value) });
      } else {
        delete dataToPost.city_id;
      }
      // If input is cities then post selected city id to api for getting locality info. based on selected city.
      // const localityByCity = await axios.post(apis.addressAPI, {
      //   city_id: parseInt(value),
      // });
      // Store locality data into searchField useState.
      // setSearchFields({ ...searchFields, localities: localityByCity.data });
    }
    // else if (name === "localities") {
    //   // Store locality value ( if available ) into dataToPost useState (It is required for search functionality).
    //   if (value) {
    //     setDataToPost({ ...dataToPost, locality: value });
    //   } else {
    //     delete dataToPost.locality;
    //   }
    // }
    else if (name === "asset") {
      // Store asset type id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, type_id: parseInt(value) });
      } else {
        delete dataToPost.type_id;
        setDataToPost({ ...dataToPost });
      }
    } else if (name === "bank") {
      // Store bank id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, bank_id: parseInt(value) });
      } else {
        delete dataToPost.bank_id;
        setDataToPost({ ...dataToPost });
      }
    }
  };

  const propertyMinPrices = [
    100000, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000,
    16000000, 18000000, 20000000, 24000000, 28000000, 32000000, 36000000,
    40000000,
  ];

  const propertyMaxPrices = [
    100000, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000, 14000000,
    16000000, 18000000, 20000000, 24000000, 28000000, 32000000, 36000000,
    40000000, 44000000,
  ];

  let propertyMinArea = [
    100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 10000, 25000,
  ];
  let propertyMaxArea = [
    100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 10000, 25000,
    50000,
  ];

  const minPrice = "100000";
  const minArea = "100";

  const [filtersCount, setFiltersCount] = useState(0);
  const [priceFilterSelected, setPriceFilterSelected] = useState(false);
  const [areaFilterSelected, setAreaFilterSelected] = useState(false);
  const [titleClearFilterSelected, setTitleClearFilterSelected] =
    useState(false);
  const [ageFilterSelected, setAgeFilterSelected] = useState(false);
  const [territoryFilterSelected, setTerritoryFilterSelected] = useState(false);

  const manageMoreFiltersCount = (filterName) => {
    if (filterName) {
      setFiltersCount(filtersCount + 1);
    } else {
      setFiltersCount(filtersCount === 0 ? 0 : filtersCount - 1);
    }
  };

  let moreFiltersKeys = [
    "min_price",
    "max_price",
    "min_area",
    "max_area",
    "age",
    "title_clear_property",
    "territory",
  ];

  const resetFilters = () => {
    moreFiltersForm.current.reset();
    moreFiltersKeys.forEach((key) => {
      delete dataToPost[key];
    });
    setPriceFilterSelected(false);
    setAgeFilterSelected(false);
    setTerritoryFilterSelected(false);
    setAreaFilterSelected(false);
    setTitleClearFilterSelected(false);
    setFiltersCount(0);
    getPropertyData();
  };

  useEffect(() => {
    manageMoreFiltersCount(priceFilterSelected);
    // eslint-disable-next-line
  }, [priceFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(areaFilterSelected);
    // eslint-disable-next-line
  }, [areaFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(titleClearFilterSelected);
    // eslint-disable-next-line
  }, [titleClearFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(ageFilterSelected);
    // eslint-disable-next-line
  }, [ageFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(territoryFilterSelected);
    // eslint-disable-next-line
  }, [territoryFilterSelected]);

  const onMoreFiltersInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "min_price") {
      if (value) {
        setPriceFilterSelected(true);
        let allOptions = document.querySelectorAll(".max-price-options");
        allOptions.forEach((option) => {
          if (parseInt(value) >= parseInt(option.value)) {
            option.setAttribute("disabled", true);
            option.nextElementSibling.selected = true;
            setDataToPost({
              ...dataToPost,
              [name]: value,
              max_price: option.nextElementSibling.value,
            });
          } else {
            option.removeAttribute("disabled");
          }
        });
      } else {
        delete dataToPost.min_price;
        delete dataToPost.max_price;
        setDataToPost({ ...dataToPost });
        setPriceFilterSelected(false);
        let allOptions = document.querySelectorAll(".max-price-options");
        allOptions.forEach((option) => {
          option.removeAttribute("disabled");
          if (!option.value) {
            option.selected = true;
          }
        });
      }
    } else if (name === "max_price") {
      if (value) {
        setPriceFilterSelected(true);
        if (dataToPost.min_price) {
          setDataToPost({ ...dataToPost, [name]: value });
        } else {
          setDataToPost({ ...dataToPost, [name]: value, min_price: minPrice });
        }
      } else {
        delete dataToPost.min_price;
        delete dataToPost.max_price;
        setDataToPost({ ...dataToPost });
        setPriceFilterSelected(false);
        let allOptions = document.querySelectorAll(".min-price-options");
        allOptions.forEach((option) => {
          if (!option.value) {
            option.selected = true;
          }
        });
        let allOptions2 = document.querySelectorAll(".max-price-options");
        allOptions2.forEach((option) => {
          option.removeAttribute("disabled");
        });
      }
    } else if (name === "min_area") {
      if (value) {
        setAreaFilterSelected(true);
        let allOptions = document.querySelectorAll(".max-carpet-area-options");
        allOptions.forEach((option) => {
          if (parseInt(value) >= parseInt(option.value)) {
            option.setAttribute("disabled", true);
            option.nextElementSibling.selected = true;
            setDataToPost({
              ...dataToPost,
              [name]: value,
              max_area: option.nextElementSibling.value,
            });
          } else {
            option.removeAttribute("disabled");
          }
        });
      } else {
        let allOptions = document.querySelectorAll(".max-carpet-area-options");
        allOptions.forEach((option) => {
          option.removeAttribute("disabled");
          if (!option.value) {
            option.selected = true;
          }
        });
        delete dataToPost.min_area;
        delete dataToPost.max_area;
        setDataToPost({ ...dataToPost });
        setAreaFilterSelected(false);
      }
    } else if (name === "max_area") {
      if (value) {
        setAreaFilterSelected(true);
        if (dataToPost.min_area) {
          setDataToPost({ ...dataToPost, [name]: value });
        } else {
          setDataToPost({ ...dataToPost, [name]: value, min_area: minArea });
        }
      } else {
        delete dataToPost.min_area;
        delete dataToPost.max_area;
        setDataToPost({ ...dataToPost });
        setAreaFilterSelected(false);
        let allOptions = document.querySelectorAll(".min-carpet-area-options");
        allOptions.forEach((option) => {
          if (!option.value) {
            option.selected = true;
          }
        });
        let allOptions2 = document.querySelectorAll(".max-carpet-area-options");
        allOptions2.forEach((option) => {
          option.removeAttribute("disabled");
        });
      }
    } else if (name === "age") {
      if (value) {
        setAgeFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: parseInt(value) });
      } else {
        delete dataToPost.age;
        setDataToPost({ ...dataToPost });
        setAgeFilterSelected(false);
      }
    } else if (name === "title_clear_property") {
      if (value) {
        setTitleClearFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: value });
      } else {
        delete dataToPost.title_clear_property;
        setDataToPost({ ...dataToPost });
        setTitleClearFilterSelected(false);
      }
    } else if (name === "territory") {
      if (value) {
        setTerritoryFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: value });
      } else {
        delete dataToPost.territory;
        setDataToPost({ ...dataToPost });
        setTerritoryFilterSelected(false);
      }
    }
  };

  const navigateToReceiver = (data) => {
    // Use navigate with the encoded data in URL parameters
    const secretKey = "my_secret_key";
    // Encoding (Encryption)
    const encodedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();
    window.open(
      `/list-of-properties?data=${encodeURIComponent(encodedData)}`,
      "_blank"
    );
  };

  useEffect(() => {
    if (dataToPost) {
      getSearchDetails();
      getPropertyData();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="section-padding searched-results-wrapper">
        <div className="container-fluid min-200vh">
          <div
            className="row extra-filters-row justify-content-center align-items-center py-3"
            // style={{ height: "80px" }}
          >
            <div className="col-md-2 col-12 mt-3 mt-md-0">
              <select
                name="states"
                id="states"
                className="form-select"
                aria-label=".form-select-sm example"
                onChange={onFieldsChange}
              >
                <option value="">State</option>
                {states ? (
                  states.map((state, Index) => {
                    let optionToSelectByDefault = document.getElementById(
                      `stateFilter-${state.state_id}`
                    );
                    if (dataToPost.state_id && optionToSelectByDefault) {
                      if (dataToPost.state_id === state.state_id) {
                        optionToSelectByDefault.selected = true;
                      }
                    }
                    return (
                      <option
                        id={`stateFilter-${state.state_id}`}
                        key={Index}
                        value={state.state_id}
                      >
                        {state.state_name}
                      </option>
                    );
                  })
                ) : (
                  <></>
                )}
              </select>
            </div>
            <div className="col-md-2 col-12 mt-3 mt-md-0">
              <select
                name="cities"
                id="cities"
                className="form-select"
                aria-label=".form-select-sm example"
                onChange={onFieldsChange}
              >
                <option value="">City</option>
                {cities
                  ? cities.map((city, Index) => {
                      let optionToSelectByDefault = document.getElementById(
                        `cityFilter-${city.city_id}`
                      );
                      if (dataToPost.city_id && optionToSelectByDefault) {
                        if (dataToPost.city_id === city.city_id) {
                          optionToSelectByDefault.selected = true;
                        }
                      }
                      return (
                        <option
                          id={`cityFilter-${city.city_id}`}
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
            <div className="col-md-2 col-12 mt-3 mt-md-0">
              <select
                name="asset"
                id="asset"
                className="form-select"
                aria-label=".form-select-sm example"
                onChange={onFieldsChange}
              >
                <option value="">Category</option>
                {assetCategory
                  ? assetCategory.map((category, Index) => {
                      let optionToSelectByDefault = document.getElementById(
                        `categoryFilter-${category.type_id}`
                      );
                      if (dataToPost.type_id && optionToSelectByDefault) {
                        if (dataToPost.type_id === category.type_id) {
                          optionToSelectByDefault.selected = true;
                        }
                      }
                      return (
                        <option
                          id={`categoryFilter-${category.type_id}`}
                          key={Index}
                          value={category.type_id}
                        >
                          {category.type_name}
                        </option>
                      );
                    })
                  : ""}
              </select>
            </div>
            <div className="col-md-2 col-12 mt-3 mt-md-0">
              <select
                name="bank"
                id="bank"
                className="form-select"
                aria-label=".form-select-sm example"
                onChange={onFieldsChange}
              >
                <option value="">Bank</option>
                {banks
                  ? banks.map((bank, Index) => {
                      return (
                        <option key={Index} value={bank.bank_id}>
                          {bank.bank_name}
                        </option>
                      );
                    })
                  : ""}
              </select>
            </div>
            <div className="col-md-2 col-12 mt-3 mt-md-0">
              <div className="dropdown">
                <div
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  className="form-select"
                >
                  <div
                    value=""
                    style={{
                      overflow: "hidden",
                      fontWeight: "normal",
                      display: "block",
                      whiteSpaceCollapse: "collapse",
                      textWrap: "nowrap",
                      minHeight: "1.2em",
                      padding: "0px 2px 1px",
                    }}
                  >
                    <span className="me-2 badge bg-dark">{filtersCount}</span>
                    More Filters
                  </div>
                </div>
                <ul
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="dropdown-menu more-filters-dropdown-menu shadow"
                  aria-labelledby="dropdownMenuButton1"
                >
                  <div className="container-fluid p-3">
                    <form className="row" ref={moreFiltersForm}>
                      <div className="col-12">
                        <label
                          htmlFor=""
                          className="form-label common-btn-font"
                        >
                          Price (<i className="bi bi-currency-rupee"></i>)
                        </label>
                      </div>
                      <div className="col-md-6 mb-3">
                        <select
                          id="min_price"
                          name="min_price"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option className="min-price-options" value="">
                            Min
                          </option>
                          {propertyMinPrices.map((price, Index) => {
                            return (
                              <option
                                className="min-price-options"
                                value={price}
                                key={Index}
                              >
                                {price}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <select
                          id="max_price"
                          name="max_price"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option className="max-price-options" value="">
                            Max
                          </option>
                          {propertyMaxPrices.map((price, Index) => {
                            return (
                              <option
                                className="max-price-options"
                                value={price}
                                key={Index}
                              >
                                {price}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="title_clear_property"
                          className="form-label common-btn-font"
                        >
                          Title clear property
                        </label>
                        <select
                          id="title_clear_property"
                          name="title_clear_property"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option value=""></option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="territory"
                          className="form-label common-btn-font"
                        >
                          Territory
                        </label>
                        <select
                          id="territory"
                          name="territory"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option value=""></option>
                          <option value="gram panchayat limit">
                            Gram Panchayat Limit
                          </option>
                          <option value="corporate">Corporate limit</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-12">
                        <label
                          htmlFor=""
                          className="form-label common-btn-font"
                        >
                          Carpet Area ( sqft )
                        </label>
                      </div>
                      <div className="col-md-6 mb-3">
                        <select
                          id="min_area"
                          name="min_area"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option className="min-carpet-area-options" value="">
                            Min
                          </option>
                          {propertyMinArea.map((area, Index) => {
                            return (
                              <option
                                className="min-carpet-area-options"
                                value={area}
                                key={Index}
                              >
                                {area}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <select
                          id="max_area"
                          name="max_area"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option className="max-carpet-area-options" value="">
                            Max
                          </option>
                          {propertyMaxArea.map((area, Index) => {
                            return (
                              <option
                                className="max-carpet-area-options"
                                value={area}
                                key={Index}
                              >
                                {area}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-12">
                        <label
                          htmlFor=""
                          className="form-label common-btn-font"
                        >
                          Age of Property
                        </label>
                      </div>
                      <div className="col-md-6 mb-3">
                        <select
                          id="age"
                          name="age"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          onChange={onMoreFiltersInputChange}
                        >
                          <option value=""></option>
                          <option value="1">Less than 1 year</option>
                          <option value="3">Less than 3 years</option>
                          <option value="5">Less than 5 years</option>
                          <option value="10">Less than 10 years</option>
                        </select>
                      </div>
                    </form>
                  </div>
                </ul>
              </div>
            </div>
            <div className="col-md-1 col-12 my-3 my-md-0">
              <button
                onClick={() => {
                  getPropertyData();
                }}
                disabled={searchBtnDisabled}
                className="btn w-100 btn-primary text-center"
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
            <div
              className={`col-12 text-center mt-md-3 ${
                filtersCount > 0 ? "" : "d-none"
              }`}
            >
              <button
                onClick={resetFilters}
                className="btn btn-secondary text-center"
              >
                Reset More Filters
              </button>
            </div>
          </div>
          <div className="property-wrapper">
            <div className="container-fluid display-on-search py-3">
              <div className="row">
                {loading ? (
                  <CommonSpinner spinnerColor="primary" spinnerType="grow" />
                ) : propertyData === null ? (
                  <div className="py-5 text-center">
                    <h2 className="text-capitalize">No result found :(</h2>
                    <span className="text-muted">
                      Please try with other options
                    </span>
                  </div>
                ) : (
                  propertyData.map((property, Index) => {
                    const {
                      count,
                      category,
                      type_id,
                      city_name,
                      city_id,
                      range,
                    } = property;

                    return (
                      <div className="col-xl-3 col-lg-4 col-md-6" key={Index}>
                        <div className="property-card-wrapper">
                          <div className="card mb-2">
                            <div className="top-line"></div>
                            <img
                              className="card-img-top"
                              src="/images2.jpg"
                              alt=""
                            />
                            <div className="card-body">
                              {count ? (
                                <div className="text-capitalize text-primary fw-bold">
                                  {`${
                                    count > 1
                                      ? count + " Properties"
                                      : count + " Property"
                                  }`}
                                </div>
                              ) : (
                                <></>
                              )}
                              {category ? (
                                <div className="text-capitalize">
                                  <span>Type: </span>
                                  <span className="common-btn-font">
                                    {category}
                                  </span>
                                </div>
                              ) : (
                                <></>
                              )}
                              {city_name ? (
                                <div className="text-capitalize">
                                  <span>Location: </span>
                                  <span className="common-btn-font">
                                    {city_name}
                                  </span>
                                </div>
                              ) : (
                                <></>
                              )}

                              {range ? (
                                <div className="text-capitalize">
                                  <span>Range: </span>
                                  <span className="common-btn-font min-price-display">
                                    <i className="bi bi-currency-rupee"></i>
                                    {`${(
                                      parseInt(range.split("-")[0]) / 10000000
                                    ).toFixed(2)} Cr.`}
                                  </span>
                                  <span className="mx-2 common-btn-font">
                                    -
                                  </span>
                                  <span className="common-btn-font max-price-display">
                                    <i className="bi bi-currency-rupee"></i>
                                    {`${(
                                      parseInt(range.split("-")[1]) / 10000000
                                    ).toFixed(2)} Cr.`}
                                  </span>
                                </div>
                              ) : (
                                <></>
                              )}
                              <div className="mt-2">
                                {localData ? (
                                  <button
                                    onClick={() => {
                                      navigateToReceiver({
                                        ...dataToPost,
                                        city_id: dataToPost.city_id
                                          ? dataToPost.city_id
                                          : city_id,
                                        type_id: dataToPost.type_id
                                          ? dataToPost.type_id
                                          : type_id,
                                        min_price: dataToPost.min_price
                                          ? dataToPost.min_price
                                          : range.split("-")[0],
                                        max_price: dataToPost.max_price
                                          ? dataToPost.max_price
                                          : range.split("-")[1],
                                      });
                                    }}
                                    className="btn btn-primary common-btn-font me-2"
                                    style={{ width: "30%" }}
                                  >
                                    View
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary common-btn-font me-2"
                                    style={{ width: "30%" }}
                                    onClick={() => {
                                      toast.info(
                                        "Please login to view property details"
                                      );
                                      goTo("/login");
                                    }}
                                  >
                                    View
                                  </button>
                                )}

                                {/* {localData ? (
                                  <>
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#commentModal"
                                      className="btn btn-primary common-btn-font"
                                      style={{ width: "30%" }}
                                    >
                                      Contact
                                    </button>
                                  </>
                                ) : (
                                  <></>
                                )} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="container d-none" ref={paginationRef}>
              <div className="row">
                <div className="col-12 mb-3">
                  <Pagination
                    handlePageClick={handlePageClick}
                    pageCount={pageCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ViewSearchResults;
