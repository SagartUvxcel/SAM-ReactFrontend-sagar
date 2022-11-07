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
  const [fieldValuesToPost, setFieldValuesToPost] = useState({
    state_id: "",
    city_id: "",
    bank_id: "",
    locality: "",
    type_id: "",
    batch_size: 10,
    batch_number: 1,
  });

  // After we click on search button It will store data/response from api into this useState.
  const [propertyData, setPropertyData] = useState([]);

  // Object destructuring.
  const { states, assetCategory, cities, localities, banks } = searchFields;
  const {
    state_id,
    city_id,
    bank_id,
    locality,
    type_id,
    batch_size,
    batch_number,
  } = fieldValuesToPost;

  const getSearchDetails = async () => {
    // Get all states from api.
    const allStates = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-state`
    );

    // Get all banks from api.
    const allBanks = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-bank`
    );

    // Get all asset Categories from api.
    const assetCategories = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-category`
    );

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
    const { name, value } = e.target;
    const fiveSectionCol = document.querySelectorAll(".five-section-col");
    // If input is state then post selected state id to api for getting cities based on selected state.
    if (name === "states") {
      console.log(value);
      const cityByState = await axios.post(
        `http://host.docker.internal:3000/sam/v1/property/by-city`,
        { state_id: parseInt(value) }
      );
      // Store cities data into searchField useState.
      setSearchFields({ ...searchFields, cities: cityByState.data });
      // Store state id into fieldValuesToPost useState (It is required for search functionality).
      setFieldValuesToPost({ ...fieldValuesToPost, state_id: parseInt(value) });
      // Unhide city select box when we select state.
      document.getElementById("city-col").classList.remove("d-none");
      // This is to set width of background white box based on number of select input boxes.
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-30");
        col.classList.add("w-22");
      });
    } else if (name === "cities") {
      // If input is cities then post selected city id to api for getting locality info. based on selected city.
      const localityByCity = await axios.post(
        `http://host.docker.internal:3000/sam/v1/property/by-address`,
        { city_id: parseInt(value) }
      );
      // Store locality data into searchField useState.
      setSearchFields({ ...searchFields, localities: localityByCity.data });
      // Store city id into fieldValuesToPost useState (It is required for search functionality).
      setFieldValuesToPost({ ...fieldValuesToPost, city_id: parseInt(value) });
      // Unhide select box when we select city.
      document.getElementById("locality-col").classList.remove("d-none");
      // This is to set width of background white box based on number of select input boxes.
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-22");
        col.classList.add("w-18");
      });
    } else if (name === "localities") {
      // Store locality value into fieldValuesToPost useState (It is required for search functionality).
      setFieldValuesToPost({ ...fieldValuesToPost, locality: value });
    } else if (name === "asset") {
      // Store asset category id into fieldValuesToPost useState (It is required for search functionality).
      setFieldValuesToPost({ ...fieldValuesToPost, type_id: parseInt(value) });
    } else if (name === "bank") {
      // Store bank id into fieldValuesToPost useState (It is required for search functionality).
      setFieldValuesToPost({ ...fieldValuesToPost, bank_id: parseInt(value) });
    }
  };

  // This will run after Search button click.
  const getPropertyData = async (e) => {
    e.preventDefault();
    // Data to post - These values are the values stored in the fieldValuesToPost useState.
    const dataToPost = {
      state_id: state_id,
      city_id: city_id,
      locality: locality,
      type_id: type_id,
      bank_id: bank_id,
      batch_size: batch_size,
      batch_number: batch_number,
    };

    // Post data and get Searched result from response.
    await axios
      .post(
        `http://host.docker.internal:3000/sam/v1/property/count-category`,
        dataToPost
      )
      .then((res) => {
        // Store Searched results into propertyData useState.
        setPropertyData(res.data);
      });
    // Unhide div and display search results in card format.
    document.querySelectorAll(".display-on-search").forEach((item) => {
      item.classList.remove("d-none");
    });
  };

  // This will run every time we refresh page or if some state change occurs.
  useEffect(() => {
    getSearchDetails();
    // navbar color change on scroll
    let nav = document.querySelector(".navbar");
    nav.style.backgroundColor = "#5857579a";
    window.onscroll = function () {
      if (document.documentElement.scrollTop > 150) {
        nav.classList.add("header-scrolled");
      } else {
        nav.classList.remove("header-scrolled");
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="full-home-page-section common-full-page-bg">
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
                  className="btn btn-lg common-btn"
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
