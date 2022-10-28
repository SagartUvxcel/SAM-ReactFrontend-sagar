import React, { useEffect } from "react";
import HomeAboutUs from "./HomeAboutUs";
import Layout from "../1.CommonLayout/Layout";
import Properties from "./Properties";
// import axios from "axios";

function Home() {
  // const [data, setData] = useState("ok");

  // const getData = async () => {
  //   await axios
  //     .post(
  //       `http://host.docker.internal:3000/sam/v1/customer-registration/email-validation`
  //     )
  //     .then((res) => {
  //       setData(res);
  //     });
  // };

  // const showData = () => {
  //   console.log(data);
  // };

  useEffect(() => {
    // getData();
    let nav = document.querySelector(".navbar");
    nav.style.backgroundColor = "#5857579a";
    window.onscroll = function () {
      if (document.documentElement.scrollTop > 150) {
        nav.classList.add("header-scrolled");
      } else {
        nav.classList.remove("header-scrolled");
      }
    };
  }, []);

  return (
    <Layout>
      <section className="full-home-page-section common-full-page-bg">
        <section className="home-wrapper">
          <div className="container-fluid">
            {/* <button className="btn btn-danger" onClick={showData}>
              Show
            </button> */}
            {/* 5 select boxes */}
            <div className="home-top-row">
              <div className="row five-box-row">
                <div className="five-section-col col-12">
                  <div className="inner-box">
                    <label htmlFor="state">State</label>
                    <div className="select-div">
                      <select
                        id="state"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                      >
                        <option selected>All</option>
                        <option value="1">One</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="five-section-col col-12">
                  <div className="inner-box">
                    <label htmlFor="city">City</label>
                    <div className="select-div">
                      <select
                        id="city"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                      >
                        <option selected>All</option>
                        <option value="1">One</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="five-section-col col-12">
                  <div className="inner-box">
                    <label htmlFor="locality">Locality</label>
                    <div className="select-div">
                      <select
                        id="locality"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                      >
                        <option selected>All</option>
                        <option value="1">One</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="five-section-col col-12">
                  <div className="inner-box">
                    <label htmlFor="asset">Asset Category</label>
                    <div className="select-div">
                      <select
                        id="asset"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                      >
                        <option selected>All</option>
                        <option value="1">One</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="five-section-col col-12">
                  <div className="inner-box">
                    <label htmlFor="bank">Bank</label>
                    <div className="select-div">
                      <select
                        id="bank"
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                      >
                        <option selected>All</option>
                        <option value="1">One</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Search button*/}
            <div className="row justify-content-center py-4">
              <div className="text-center">
                <button className="btn btn-lg common-btn">Search</button>
              </div>
            </div>
          </div>
          <div className="home-bottom-heading">
            <h1 className="text-center text-white">RECENT LISTINGS</h1>
          </div>
        </section>
        <Properties />
        <HomeAboutUs />
      </section>
    </Layout>
  );
}
export default Home;
