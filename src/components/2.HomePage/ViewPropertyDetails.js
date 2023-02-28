import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";

const ViewPropertyDetails = () => {
  const goTo = useNavigate();
  // If user is not logged in and tries to view property details then user will redirect to the login page
  const checkStatusOfLogin = () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (!data) {
      goTo("/login");
    }
  };
  useEffect(() => {
    checkStatusOfLogin();
  });

  return (
    <Layout>
      <section className="section-padding min-100vh view-property-wrapper">
        <div className="container-fluid px-lg-5 px-md-4 px-3">
          <h4 className="mt-4 fw-bold">Property Details</h4>
          <div className="row wrapper">
            <div className="col-xl-3 col-lg-4 col-md-5 view-property-main-img-div">
              <img src="images4.jpg" alt="" className="img-fluid" />
              <div className="property-icons-div">
                <div className="icons">X</div> <div className="icons">X</div>
                <div className="icons">X</div> <div className="icons">X</div>
                <div className="icons">X</div>
              </div>
            </div>
            <div className="col-xl-9 col-lg-8 col-md-7 property-full-details ps-md-5 mt-5 mt-md-0">
              <div className="row">
                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Owner:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  S Sharma
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Property:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  Residential Flat
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Area:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  1120 Sqr Ft
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Price:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  70 lacs
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Market Price:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  1.2 Cr.
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Address:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  A Block, Sun Society, Senapati Bapat Road,
                  <br /> Pune 411016, Maharashtra.
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Property Age:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  5 year
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Bank:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  Bank Of Baroda
                </div>

                <div className="col-lg-2 col-md-3 col-5 property-info">
                  Document:
                </div>
                <div className="col-lg-10 col-md-9 col-7 property-info">
                  <a href="/property">Download Docs</a>
                </div>

                <div className="col-12">
                  <button className="btn btn-primary common-btn-font mt-2">Contact</button>
                </div>
              </div>
            </div>
          </div>
          <h4 className="mt-4 fw-bold">Other properties in same area</h4>
          <div className="row wrapper other-properties">
            <div className="col-lg-3 col-md-4">
              <div className="card">
                <h5 className="card-title">2 BHK in Mukund Nagar</h5>
                <p className="card-text">Price: 82 Lacs</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 mt-4 mt-md-0">
              <div className="card">
                <h5 className="card-title">2 BHK in Model Colony</h5>
                <p className="card-text">Price: 82 Lacs</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 mt-4 mt-md-0">
              <div className="card">
                <h5 className="card-title">2 BHK in Mukund Nagar</h5>
                <p className="card-text">Price: 82 Lacs</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 mt-4 mt-lg-0">
              <div className="card">
                <h5 className="card-title">2 BHK in Model Colony</h5>
                <p className="card-text">Price: 82 Lacs</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ViewPropertyDetails;
