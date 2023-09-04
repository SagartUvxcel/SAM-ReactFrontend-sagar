import React, { useEffect, useRef, useState } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import axios from "axios";
import { rootTitle } from "../../CommonFunctions";
import { useNavigate } from "react-router-dom";

// let userId = "";
function Home() {
  // const data = JSON.parse(localStorage.getItem("data"));

  // if (data) {
  //   userId = data.userId;
  // }

  // useState to store data of each field e.g all states, all banks etc.
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    localities: "",
    assetCategory: "",
    banks: "",
  });

  const homePageRef = useRef();

  // useState to store values of each select box for search functionality.
  const [dataToPost, setDataToPost] = useState({
    batch_size: 4,
    batch_number: 1,
  });

  // Object destructuring.
  const { states, assetCategory, cities } = searchFields;

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

      // store states, banks and asset categories into searchFields useState.
      setSearchFields({
        ...searchFields,
        states: allStates.data,
        banks: allBanks.data,
        assetCategory: assetCategories.data,
      });
    } catch (error) {}
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
      const localityByCity = await axios.post(apis.addressAPI, {
        city_id: parseInt(value),
      });
      // Store locality data into searchField useState.
      setSearchFields({ ...searchFields, localities: localityByCity.data });
    } else if (name === "asset") {
      // Store asset type id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, type_id: parseInt(value) });
      } else {
        delete dataToPost.type_id;
        setDataToPost({ ...dataToPost });
      }
    }
  };

  // Change navbar color on scroll on HomePage only.
  const changeNavBarColor = () => {
    let nav = document.querySelector(".navbar");
    nav.classList.add("navbar-lightBg");
    window.onscroll = function () {
      if (document.documentElement.scrollTop > 150) {
        nav.classList.add("header-scrolled");
        nav.classList.remove("navbar-lightBg");
      } else {
        nav.classList.remove("header-scrolled");
        nav.classList.add("navbar-lightBg");
      }
    };
  };

  const navigate = useNavigate();

  const navigateToDestination = () => {
    const sensitiveData = dataToPost;
    navigate("/property-search-results", { state: { sensitiveData } });
  };

  // const [isExpanded, setIsExpanded] = useState(false);

  // const handleHover = () => {
  //   setIsExpanded(true);
  // };

  // const handleLeave = () => {
  //   setIsExpanded(false);
  // };

  // This will run every time we refresh page or if some state change occurs.
  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - HOME";
    getSearchDetails();
    changeNavBarColor();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="full-home-page-section skyblue-bg" ref={homePageRef}>
        {/* {userId ? (
          <div
            className={`square ${isExpanded ? "expanded" : ""}`}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          >
            {isExpanded ? (
              <NavLink to={`/user-enquiries`}>
                <i className="bi bi-chat-text me-2"></i>
                Enquiries
              </NavLink>
            ) : (
              <i className="bi bi-chat-text"></i>
            )}
          </div>
        ) : (
          <></>
        )} */}
        <section className="home-wrapper">
          <div className="container-fluid">
            {/* 5 select boxes */}
            <div className="d-flex justify-content-center">
              <div className="row five-box-row">
                <div className="col-xl-2 col-lg-3 col-md-4 col-12">
                  <div className="inner-box">
                    <label htmlFor="state">State</label>
                    <div className="select-div">
                      <select
                        id="state"
                        name="states"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={onFieldsChange}
                      >
                        <option value=""></option>
                        {states
                          ? states.map((state, Index) => {
                              return (
                                <option key={Index} value={state.state_id}>
                                  {state.state_name}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xl-2 col-lg-3 col-md-4 col-12  mt-3 mt-md-0"
                  id="city-col"
                >
                  <div className="inner-box">
                    <label htmlFor="city">City</label>
                    <div className="select-div">
                      <select
                        id="city"
                        name="cities"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={onFieldsChange}
                      >
                        <option value=""></option>
                        {cities
                          ? cities.map((city, Index) => {
                              return (
                                <option key={Index} value={city.city_id}>
                                  {city.city_name}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-3 col-md-4 col-12 mt-3 mt-md-0">
                  <div className="inner-box">
                    <label htmlFor="asset">Asset Category</label>
                    <div className="select-div">
                      <select
                        name="asset"
                        id="asset"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={onFieldsChange}
                      >
                        <option value=""></option>
                        {assetCategory
                          ? assetCategory.map((category, Index) => {
                              return (
                                <option key={Index} value={category.type_id}>
                                  {category.type_name}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search button*/}
            <div className="row justify-content-center py-4 search-btn-wrapper">
              <div className="text-center">
                <button
                  className={`btn btn-primary common-btn-font ${
                    searchBtnDisabled ? "disabled" : ""
                  }`}
                  onClick={navigateToDestination}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* About us section component */}
        <HomeAboutUs />
      </section>
    </Layout>
  );
}
export default Home;
