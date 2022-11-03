import React from "react";
import Layout from "../1.CommonLayout/Layout";

const ViewPropertyDetails = () => {
  return (
    <Layout>
      <section className="section-padding min-100vh view-property-wrapper">
        <div className="container-fluid px-5">
          <h4 className="mt-4">Property Details</h4>
          <div className="row wrapper">
            <div className="col-lg-4 view-property-main-img-div">
              <img src="images4.jpg" alt="" className="img-fluid" />
            </div>
            <div className="col-lg-8 property-full-details">
              <div className="row">
                <div className="col-lg-2">Owner:</div>
                <div className="col-lg-10">S Sharma</div>

                <div className="col-lg-2">Property:</div>
                <div className="col-lg-10">Residential Flat</div>

                <div className="col-lg-2">Area:</div>
                <div className="col-lg-10">1120 Sqr Ft</div>

                <div className="col-lg-2">Price:</div>
                <div className="col-lg-10">70 lacs</div>

                <div className="col-lg-2">Market Price:</div>
                <div className="col-lg-10">1.2 Cr.</div>

                <div className="col-lg-2">Address:</div>
                <div className="col-lg-10">
                  A Block, Sun Society, Senapati Bapat Road,
                  <br /> Pune 411016, Maharashtra.
                </div>

                <div className="col-lg-2">Property Age:</div>
                <div className="col-lg-10">5 year</div>

                <div className="col-lg-2">Bank:</div>
                <div className="col-lg-10">Bank Of Baroda</div>

                <div className="col-lg-2">Document:</div>
                <div className="col-lg-10">Download Docs</div>

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
