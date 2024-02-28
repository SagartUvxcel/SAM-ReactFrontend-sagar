import React, { useEffect, useRef, useState } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import axios from "axios";
import { checkLoginSession, rootTitle } from "../../CommonFunctions";
import { useNavigate } from "react-router-dom";


const historyData = [
  {
    "state_name": "maharashtra",
    "city": "Pune", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
    "max_area": "25000",
    "age": 10,
    "latest_added_properties": 20
  },
  {
    "state": "Goa", "city": "Panaji", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
  }, {
    "state": "maharashtra", "city": "Pune", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
    "max_area": "25000",
    "age": 10,
    "latest_added_properties": 20
  },
  {
    "state": "Goa", "city": "Panaji", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
  }, {
    "state": "maharashtra", "city": "Pune", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
    "max_area": "25000",
    "age": 10,
    "latest_added_properties": 20
  },
  {
    "state": "Goa", "city": "Panaji", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
  }, {
    "state": "maharashtra", "city": "Pune", "type": "plots", "bank_id": "SBI",
    "min_price": "100000",
    "max_price": "40000000",
    "title_clear_property": "yes",
    "territory": "gram panchayat limit",
    "min_area": "300",
    "max_area": "25000",
    "age": 10,
    "latest_added_properties": 20
  },
  {
    "state": "1",
  },

]
let authHeader = "";
let isLogin = false;
let subscription_status = false;
let userId = "";
let roleId = "";


function Home() {


  const homePageRef = useRef();
  const historyBtnRef = useRef();

  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");
  // console.log(updatedSubscriptionStatus);
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    userId = data.userId;
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

  // useState to store values of each select box for search functionality.
  const [dataToPost, setDataToPost] = useState({
    batch_size: 4,
    batch_number: 1,
  });
  // Object destructuring.
  const { states, assetCategory, cities } = searchFields;

  const [searchHistory, setSearchHistory] = useState([]);
  const [historyBtn, setHistoryBtn] = useState(false);


  // date and time convert into local time function
  const dateTimeConvertor = (dateAndTime) => {
    // Parse the date string into a JavaScript Date object
    const dateTime = new Date(dateAndTime);

    // Format the date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateTime.toLocaleDateString(undefined, options);

    // Format the date in "21-12-2023" format
    const optionsShort = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDateShort = dateTime.toLocaleDateString(undefined, optionsShort).replace(/\//g, '-');
    // Format the time in local time zone
    const formattedTime = dateTime.toLocaleTimeString();

    // Update state
    // console.log(formattedDate);
    // console.log(formattedDateShort);
    // console.log(formattedTime);



  }

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
    } catch (error) { }
  };

  // history sentence creation 
  const createSentence = (SearchName) => {
    const criteria = SearchName.split(', ');
    // console.log(criteria);
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
        sentence += ` and ₹${value}`;
      } else if (key === "min_area" && criteria.find(item => item.includes('max_area'))) {
        sentence += ` and an area between ${value} sq.ft`;
      } else if (key === "max_area" && criteria.find(item => item.includes('min_area'))) {
        sentence += ` and ${value} sq.ft`;
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
        dateTimeConvertor(data[0].updated_date);
        setSearchHistory(filteredData);
        searchHistoryJsonDataConvertor(filteredData);
      }
    } catch (error) {
      console.log("error from search history api");
    }
  }

  // json converted using parse and state and city converted
  const searchHistoryJsonDataConvertor = async (data) => {

    let apis = {
      stateAPI: `/sam/v1/property/by-state`,
      bankAPI: `/sam/v1/property/by-bank`,
      categoryAPI: `/sam/v1/property/by-category`,
      cityAPI: `/sam/v1/property/by-city`,

    };
    try {
      // Get all states from api.
      const allStates = await axios.get(apis.stateAPI);
      // const searchJson=data.fileter((data,i)=>data.search_json[i])
      // console.log(data);
      let states = allStates.data;

      // const cityValue = async (state_id) => {
      //   try {
      //     const { data } = await axios.post(apis.cityAPI, {
      //       state_id: parseInt(state_id),
      //     });

      //     return data; // Simplified return statement
      //   } catch (error) {
      //     // Handle errors here if needed
      //     console.error("Error fetching city data:", error);
      //     throw error; // Re-throw the error to propagate it
      //   }
      // };

      const result = data.map((searchItem) => {
        const { city_id, state_id } = searchItem.search_json;
        // let cities = cityValue(state_id);
        // console.log(cities);
        // Find the city and state based on the search_json
        // const cityName = cities.find((city) => city.city_id === city_id)?.city_name || '';
        const stateName = states.find((state) => state.state_id === state_id)?.state_name || '';

        return {
          // city_name: cityName,
          state_name: stateName,
          updated_date: searchItem.updated_date,
        };
      });

      // console.log(result);



    } catch (error) { }



    // const cityByState = await axios.post("/sam/v1/property/by-city", {
    //   state_id: parseInt(1),
    // });

    // console.log(cityByState.data);

  }
  const [searchBtnDisabled, setSearchBtnDisabled] = useState(true);
  const [modalStatus, setModalStatus] = useState(false);

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
    // setDataToPost({ ...dataToPost, data });

    console.log(data);
    const sensitiveData = { ...dataToPost, ...data };
    console.log(sensitiveData);
    navigate("/property-search-results", { state: { sensitiveData } });
  }
  // navigate to properties list page
  const navigate = useNavigate();

  const navigateToDestination = () => {
    const sensitiveData = dataToPost;
    console.log(sensitiveData);
    navigate("/property-search-results", { state: { sensitiveData } });
  };


  useEffect(() => {
    if (modalStatus) {
      let body = document.getElementById("body");
      let navbar = document.getElementsByClassName("navbar");
      if (body.classList[0] === "modal-open") {
        console.log("hi");
        body.style.removeProperty("overflow");
        body.style.removeProperty("padding");
        // navbar.style.remove("padding");
      }
    }
  }, [modalStatus])

  // This will run every time we refresh page or if some state change occurs.
  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - HOME";
    getSearchDetails();
    changeNavBarColor();
    if (isLogin) {
      getSearchHistory();
    }
  }, [isLogin, subscription_status]);

  return (
    <Layout>
      <section className="full-home-page-section skyblue-bg " ref={homePageRef} >
        <section className="home-wrapper min-100vh">
          <div className="container-fluid">
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
                            <p className="searchHistoryList historyLink" onClick={() => onClickHistory(data)}><span><i className="bi bi-clock-history text-primary"></i> </span>
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
                  className={`btn btn-primary common-btn-font ${searchBtnDisabled ? "disabled" : ""
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
