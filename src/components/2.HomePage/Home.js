import React, { useEffect, useRef, useState } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import axios from "axios";
import { rootTitle } from "../../CommonFunctions";
import { useNavigate } from "react-router-dom";

let authHeader = "";
let isLogin = false;
let subscription_status = false;
let roleId = "";


function Home() {

  const homePageRef = useRef();
  const historyBtnRef = useRef();

  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");
  const updatedCountry = localStorage.getItem("location");
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    roleId = data.roleId;
    subscription_status = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
  }

  // useState to store data of each field e.g all states, all banks etc.
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    localities: "",
    assetCategory: "",
    banks: "",
  });

  // useState to store values of each select box for search functionality and Object destructuring.
  const [dataToPost, setDataToPost] = useState({
    batch_size: 4,
    batch_number: 1,
  });
  const { states, assetCategory, cities } = searchFields;

  const [searchHistory, setSearchHistory] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(updatedCountry);

  // It will fetch all states, banks, assets from api and will map those values to respective select fields.
  const getSearchDetails = async () => {
    let apis = {
      stateAPI: `/sam/v1/property/by-state`,
      bankAPI: `/sam/v1/property/by-bank`,
      categoryAPI: `/sam/v1/property/by-category`,
    };
    console.log(currentCountry);
    const countryId = currentCountry === "india" ? 1 : 11;

    const postData = { "country_id": countryId }
    try {
      // Get all states from api.
      // const allStates = await axios.get(apis.stateAPI);
      const allStates = await axios.post(apis.stateAPI, postData);  
      // Get all banks from api.
      const allBanks = await axios.post(apis.bankAPI, postData); 
      // Get all asset Categories from api.
      const assetCategories = await axios.get(apis.categoryAPI);

      // store states, banks and asset categories into searchFields useState.
      setSearchFields({
        ...searchFields,
        states: allStates.data,
        banks: allBanks.data,
        assetCategory: assetCategories.data,
      });
    } catch (error) { }
  };

  // history sentence creation 
  const createSentence = (SearchName) => {
    const criteria = SearchName.split(', ');
    let sentence = "All properties";

    criteria.forEach(criteriaItem => {
      const [key, value] = criteriaItem.split('=');

      if (key === "state_name") {
        sentence += ` from the state of ${value},`;
      } else if (key === "city_name") {
        sentence += ` specifically from ${value} city`;
      } else if (key === "bank_name") {
        sentence += ` from ${value}`;
      } else if (key === "property_type") {
        sentence += ` with a focus on ${value.toLowerCase()}`;
      } else if (key === "min_price" && criteria.find(item => item.includes('max_price'))) {
        sentence += ` with a price range between ₹${value}`;
      } else if (key === "max_price" && criteria.find(item => item.includes('min_price'))) {
        sentence += ` to ₹${value}`;
      } else if (key === "min_area" && criteria.find(item => item.includes('max_area'))) {
        sentence += ` and an area between ${value} sq.ft`;
      } else if (key === "max_area" && criteria.find(item => item.includes('min_area'))) {
        sentence += ` to ${value} sq.ft`;
      } else if (key === "title_clear_property" && value === "yes") {
        sentence += ` with clear title properties`;
      } else if (key === "territory") {
        sentence += `, within the ${value}`;
      } else if (key === "age") {
        sentence += `, aged ${value} year${parseInt(value) > 1 ? 's' : ''}`;
      } else if (key === "latest_added_properties") {
        sentence += `, The latest added properties in  ${value} days.`;
      }
    });
    return sentence;
  }

  // fetch history data from api
  const getSearchHistory = async () => {
    try {
      const { data } = await axios.get("/sam/v1/property/auth/user-history", { headers: authHeader });
      if (data !== null) {
        const filteredData = data.map(item => ({
          search_json: JSON.parse(item.search_json),
          updated_date: item.updated_date,
          SearchName: createSentence(item.SearchName),
          added_date: item.added_date,
          search_id: item.search_id,
        }));
        setSearchHistory(filteredData);
      }
    } catch (error) {
      console.log(error);
    }
  }

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

  // on click history button
  const onClickHistory = (e) => {
    const data = e.search_json;
    const sensitiveData = { ...dataToPost, ...data };
    navigate("/property-search-results", { state: { sensitiveData } });
  }
  // navigate to properties list page
  const navigate = useNavigate();
  const navigateToDestination = () => {
    const sensitiveData = dataToPost;
    navigate("/property-search-results", { state: { sensitiveData } });
  };

  // This will run every time we refresh page or if some state change occurs.
  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - HOME";
    getSearchDetails();
    changeNavBarColor();
    if (isLogin) {
      getSearchHistory();
    }
    // eslint-disable-next-line
  }, [isLogin, subscription_status]);
 
  useEffect(() => { 
  }, [currentCountry])


  return (
    <Layout>
      <section className="full-home-page-section skyblue-bg " ref={homePageRef} >
        <section className="home-wrapper min-100vh">
          <div className="container-fluid">
            {/* History */}
            <div className="d-flex justify-content-end mb-5  dropdown" >
              {isLogin && roleId === 3 ?
                <div ref={historyBtnRef} className="col-md-2 searchHistoryDiv d-flex justify-content-center mt-2 " >
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none dropdown-toggle "
                    id="dropdownMenu2"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ><span><i className="fa fa-history fs-small" aria-hidden="true"></i> </span> History</button>
                  <div className="dropdown-menu historyDropdownMenu p-3 " aria-labelledby="dropdownMenu2">
                    <h5 className="modal-title fs-5" id="recentSearchHistoryTitle">History</h5>
                    <hr className="my-2" />
                    {searchHistory.length > 0 ? (searchHistory.map((data, index) => {

                      const isEvenRow = index % 2 === 0;
                      const rowClasses = `row border-bottom my-1 ${isEvenRow ? 'even-row' : 'odd-row'}`;
                      return (
                        <div key={index + 1} className={rowClasses}>
                          <div className="col-12 d-flex ">
                            <p className="searchHistoryList historyLink" onClick={() => onClickHistory(data)}><span><i className="bi bi-clock-history heading-text-primary"></i> </span>
                              {data.SearchName}
                            </p>
                          </div>
                        </div>
                      )
                    })) : (<>
                      <p className="text-center fw-bold">No History Found !</p>
                    </>)
                    }
                  </div>
                </div> : ""}
            </div>

            {/* 5 select boxes */}
            <div className="d-flex justify-content-center ">
              <div className="row five-box-row mt-lg-5 mt-md-0">
                {/* <div className="row">
                <p>Search property</p>
              </div> */}
                {/* states */}
                <div className="col-lg-3 col-md-4 col-12">
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
                {/* city */}
                <div
                  className="col-lg-3 col-md-4 col-12  mt-3 mt-md-0"
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
                {/* assetCategory */}
                <div className=" col-lg-3 col-md-4 col-12 mt-3 mt-md-0">
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
                  className={`btn btn-primary border-white common-btn-font ${searchBtnDisabled ? "disabled" : ""
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
