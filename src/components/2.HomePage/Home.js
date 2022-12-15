import React, { useEffect } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import Properties from "./Properties";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-scroll";

function Home() {
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
    batch_size: 10,
    batch_number: 1,
  });

  // After we click on search button It will store data/response from api into this useState.
  const [propertyData, setPropertyData] = useState([]);

  // Object destructuring.
  const { states, assetCategory, cities, localities, banks } = searchFields;

  const setHeaderAndUrl = () => {
    const statusOfLogin = localStorage.getItem("isLoggedIn");
    const loginToken = localStorage.getItem("logintoken");
    let headers =
      statusOfLogin !== "true"
        ? { "Content-Type": "Application/json" }
        : { Authorization: loginToken };
    let url = `/sam/v1/property${statusOfLogin !== "true" ? "" : `/auth`}`;
    return [headers, url];
  };

  // It will fetch all states, banks, assets from api and will map those values to respective select fields.
  const getSearchDetails = async () => {
    const [headers, url] = setHeaderAndUrl();
    let apis = {
      stateAPI: `${url}/by-state`,
      bankAPI: `${url}/by-bank`,
      categoryAPI: `${url}/by-category`,
    };
    // Get all states from api.
    const allStates = await axios.get(apis.stateAPI, { headers: headers });
    // Get all banks from api.
    const allBanks = await axios.get(apis.bankAPI, { headers: headers });
    // Get all asset Categories from api.
    const assetCategories = await axios.get(apis.categoryAPI, {
      headers: headers,
    });

    // store states, banks and asset categories into searchFields useState.
    setSearchFields({
      ...searchFields,
      states: allStates.data,
      banks: allBanks.data,
      assetCategory: assetCategories.data,
    });
  };

  // This function will run on change of input fields.
  const onFieldsChange = async (e) => {
    const [headers, url] = setHeaderAndUrl();
    let apis = {
      cityAPI: `${url}/by-city`,
      addressAPI: `${url}/by-address`,
    };
    const { name, value } = e.target;
    const fiveSectionCol = document.querySelectorAll(".five-section-col");
    // If input is state then post selected state id to api for getting cities based on selected state.
    if (name === "states") {
      // Store state id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, state_id: parseInt(value) });
      } else {
        delete dataToPost.state_id;
      }
      const cityByState = await axios.post(
        apis.cityAPI,
        {
          state_id: parseInt(value),
        },
        { headers: headers }
      );
      // Store cities data into searchField useState.
      setSearchFields({ ...searchFields, cities: cityByState.data });
      // Unhide city select box when we select state.
      document.getElementById("city-col").classList.remove("d-none");
      // This is to set width of background white box based on number of select input boxes.
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-30");
        col.classList.add("w-22");
      });
    } else if (name === "cities") {
      // Store city id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, city_id: parseInt(value) });
      } else {
        delete dataToPost.city_id;
      }
      // If input is cities then post selected city id to api for getting locality info. based on selected city.
      const localityByCity = await axios.post(
        apis.addressAPI,
        {
          city_id: parseInt(value),
        },
        { headers: headers }
      );
      // Store locality data into searchField useState.
      setSearchFields({ ...searchFields, localities: localityByCity.data });
      // Unhide select box when we select city.
      document.getElementById("locality-col").classList.remove("d-none");
      // This is to set width of background white box based on number of select input boxes.
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-22");
        col.classList.add("w-18");
      });
    } else if (name === "localities") {
      // Store locality value ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, locality: value });
      } else {
        delete dataToPost.locality;
      }
    } else if (name === "asset") {
      // Store asset type id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, type_id: parseInt(value) });
      } else {
        delete dataToPost.type_id;
      }
    } else if (name === "bank") {
      // Store bank id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, bank_id: parseInt(value) });
      } else {
        delete dataToPost.bank_id;
      }
    }
  };

  // This will run after Search button click.
  const getPropertyData = async (e) => {
    e.preventDefault();
    const [headers, url] = setHeaderAndUrl();
    console.log(headers, url);
    let apis = {
      searchAPI: `${url}/count-category`,
    };
    // Post data and get Searched result from response.
    await axios
      .post(apis.searchAPI, dataToPost, { headers: headers })
      .then((res) => {
        // Store Searched results into propertyData useState.
        // localStorage.setItem("propertyDataFromLocal", JSON.stringify(res.data));
        setPropertyData(res.data);
      });
    // Unhide div and display search results in card format.
    document.querySelectorAll(".display-on-search").forEach((item) => {
      item.classList.remove("d-none");
    });
  };

  // Get saved properties data from local storage.
  // const getDataFromLocal = () => {
  //   let localData = JSON.parse(localStorage.getItem("propertyDataFromLocal"));
  //   if (localData !== null) {
  //     setPropertyData(localData);
  //     if (localData.length > 0) {
  //       document.querySelectorAll(".display-on-search").forEach((item) => {
  //         item.classList.remove("d-none");
  //       });
  //     }
  //   }
  // };

  // Change navbar color on scroll on HomePage only.
  const changeNavBarColor = () => {
    let nav = document.querySelector(".navbar");
    nav.style.background = "#5857579a";
    window.onscroll = function () {
      if (document.documentElement.scrollTop > 150) {
        nav.classList.add("header-scrolled");
      } else {
        nav.classList.remove("header-scrolled");
      }
    };
  };

  // This will run every time we refresh page or if some state change occurs.
  useEffect(() => {
    getSearchDetails();
    // getDataFromLocal();
    changeNavBarColor();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="full-home-page-section skyblue-bg">
        <section className="home-wrapper">
          <div className="container-fluid">
            {/* 5 select boxes */}
            <div className="home-top-row">
              <div className="row five-box-row">
                <div className="five-section-col w-30 col-12">
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
                  className="five-section-col w-30 col-12 d-none mt-3 mt-md-0"
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
                <div
                  className="five-section-col w-30 col-12 d-none mt-3 mt-md-0"
                  id="locality-col"
                >
                  <div className="inner-box">
                    <label htmlFor="locality">Locality</label>
                    <div className="select-div">
                      <select
                        id="locality"
                        name="localities"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={onFieldsChange}
                      >
                        <option value=""></option>
                        {localities
                          ? localities.map((data, Index) => {
                              return (
                                <option key={Index} value={data.locality}>
                                  {data.locality +
                                    " " +
                                    data.village +
                                    " " +
                                    data.pincode}
                                </option>
                              );
                            })
                          : ""}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="five-section-col w-30 col-12 mt-3 mt-md-0">
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
                <div className="five-section-col w-30 col-12 mt-3 mt-md-0">
                  <div className="inner-box">
                    <label htmlFor="bank">Bank</label>
                    <div className="select-div">
                      <select
                        name="bank"
                        id="bank"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={onFieldsChange}
                      >
                        <option value=""></option>
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
                  </div>
                </div>
              </div>
            </div>
            {/* Search button*/}
            <div className="row justify-content-center py-4">
              <div className="text-center">
                <Link
                  to="properties"
                  className={`btn btn-lg common-btn ${
                    Object.keys(dataToPost).length > 2 ? "" : "disabled"
                  }`}
                  onClick={getPropertyData}
                >
                  Search
                </Link>
              </div>
            </div>
          </div>
          <div className="home-bottom-heading display-on-search d-none">
            <h1 className="text-center text-white">RECENT LISTINGS</h1>
          </div>
        </section>
        {/* Properties component to show property details (In card format) on click of search button */}
        {/* We are sending propertyData array (which contains our search results) as a prop */}
        <Properties propertyData={propertyData} />
        {/* About us section component */}
        <HomeAboutUs />
      </section>
    </Layout>
  );
}
export default Home;
