import React from "react";
import Layout from "../1.CommonLayout/Layout";

const ViewPropertyDetails = () => {
  return (
    <Layout>
      <section className="section-padding min-100vh view-property-wrapper">
        <div className="container-fluid px-5">
          <h4 className="mt-4">Property Details</h4>
          <div className="row wrapper">
            <div className="col-lg-3 view-property-main-img-div">
              <img src="images4.jpg" alt="" className="img-fluid" />
              <div className="property-icons-div">
                <div className="icons">X</div> <div className="icons">X</div>
                <div className="icons">X</div> <div className="icons">X</div>
                <div className="icons">X</div>
              </div>
            </div>
            <div className="col-lg-8 property-full-details ps-lg-5">
              <div className="row">
                <div className="col-lg-2 property-info">Owner:</div>
                <div className="col-lg-10 property-info">S Sharma</div>

                <div className="col-lg-2 property-info">Property:</div>
                <div className="col-lg-10 property-info">Residential Flat</div>

                <div className="col-lg-2 property-info">Area:</div>
                <div className="col-lg-10 property-info">1120 Sqr Ft</div>

                <div className="col-lg-2 property-info">Price:</div>
                <div className="col-lg-10 property-info">70 lacs</div>

                <div className="col-lg-2 property-info">Market Price:</div>
                <div className="col-lg-10 property-info">1.2 Cr.</div>

                <div className="col-lg-2 property-info">Address:</div>
                <div className="col-lg-10 property-info">
                  A Block, Sun Society, Senapati Bapat Road,
                  <br /> Pune 411016, Maharashtra.
                </div>

                <div className="col-lg-2 property-info">Property Age:</div>
                <div className="col-lg-10 property-info">5 year</div>

                <div className="col-lg-2 property-info">Bank:</div>
                <div className="col-lg-10 property-info">Bank Of Baroda</div>

                <div className="col-lg-2 property-info">Document:</div>
                <div className="col-lg-10 property-info">Download Docs</div>

                <div className="col-lg-12">
                  <button className="btn common-btn mt-2">Contact</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ViewPropertyDetails;
