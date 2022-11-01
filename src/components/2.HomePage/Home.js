import React, { useEffect } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import Properties from "./Properties";
import axios from "axios";
import { useState } from "react";

function Home() {
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    localities: "",
    assetCategory: "",
    banks: "",
  });

  const [fieldValuesToPost, setFieldValuesToPost] = useState({
    state_id: "",
    city_id: "",
    bank_id: "",
    locality: "",
    type_id: "",
    batch_size: 10,
    batch_number: 1,
  });

  const [propertyData, setPropertyData] = useState([]);

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
    // States
    const allStates = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-state`
    );

    // banks
    const allBanks = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-bank`
    );

    // Asset Category
    const assetCategories = await axios.get(
      `http://host.docker.internal:3000/sam/v1/property/by-category`
    );

    setSearchFields({
      ...searchFields,
      states: allStates.data,
      banks: allBanks.data,
      assetCategory: assetCategories.data,
    });
  };

  const onFieldsChange = async (e) => {
    const { name, value } = e.target;
    const fiveSectionCol = document.querySelectorAll(".five-section-col");
    if (name === "states") {
      const cityByState = await axios.post(
        `http://host.docker.internal:3000/sam/v1/property/by-city`,
        { state_id: parseInt(value) }
      );
      setSearchFields({ ...searchFields, cities: cityByState.data });
      setFieldValuesToPost({ ...fieldValuesToPost, state_id: parseInt(value) });
      document.getElementById("city-col").classList.remove("d-none");
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-30");
        col.classList.add("w-22");
      });
    } else if (name === "cities") {
      const localityByCity = await axios.post(
        `http://host.docker.internal:3000/sam/v1/property/by-address`,
        { city_id: parseInt(value) }
      );
      setSearchFields({ ...searchFields, localities: localityByCity.data });
      setFieldValuesToPost({ ...fieldValuesToPost, city_id: parseInt(value) });
      document.getElementById("locality-col").classList.remove("d-none");
      fiveSectionCol.forEach((col) => {
        col.classList.remove("w-22");
        col.classList.add("w-18");
      });
    } else if (name === "localities") {
      setFieldValuesToPost({ ...fieldValuesToPost, locality: value });
    } else if (name === "asset") {
      setFieldValuesToPost({ ...fieldValuesToPost, type_id: parseInt(value) });
    } else if (name === "bank") {
      setFieldValuesToPost({ ...fieldValuesToPost, bank_id: parseInt(value) });
    }
  };

  const getPropertyData = async () => {
    // console.log(
    //   `state-${state_id} | city-${city_id} | locality-${locality} | asset-${type_id} | bank-${bank_id} | batchSize-${batch_size} | batchNumber-${batch_number}`
    // );
    const dataToPost = {
      state_id: state_id,
      city_id: city_id,
      locality: locality,
      type_id: type_id,
      bank_id: bank_id,
      batch_size: batch_size,
      batch_number: batch_number,
    };

    await axios
      .post(
        `http://host.docker.internal:3000/sam/v1/property/count-category`,
        dataToPost
      )
      .then((res) => {
        setPropertyData(res.data);
      });

    document.querySelectorAll(".display-on-search").forEach((item) => {
      item.classList.remove("d-none");
    });
  };

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
                <button
                  className="btn btn-lg common-btn"
                  onClick={getPropertyData}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="home-bottom-heading display-on-search d-none">
            <h1 className="text-center text-white">RECENT LISTINGS</h1>
          </div>
        </section>
        <Properties propertyData={propertyData} />
        <HomeAboutUs />
      </section>
    </Layout>
  );
}
export default Home;
