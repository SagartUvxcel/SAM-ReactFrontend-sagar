import React from "react";
// import { properties } from "../DataArrays/PropertyData";

const Properties = ({ propertyData }) => {
  return (
    <section className="property-wrapper wrapper d-none display-on-search">
      <div className="container-fluid">
        <div className="row">
          {propertyData.map((property, Index) => {
            return (
              <div className="col-lg-3 col-md-4" key={Index}>
                <div className="property-card-wrapper">
                  <div className="card mb-4">
                    <hr />
                    <img className="card-img-top" src="images1.jpg" alt="" />
                    <div className="card-body text-white">
                      <h3 className="card-title text-uppercase">
                        {property.title}
                      </h3>
                      <span className="text-capitalize fw-bold">
                        {property.count + " " + property.category}
                      </span>
                      <br />
                      <span className="text-capitalize">
                        Location - {property.city_name}
                      </span>
                      <br />
                      <span className="text-capitalize">
                        Ranging from {parseFloat(property.minvalue) / 100000}{" "}
                        Lac to {parseFloat(property.maxvalue) / 10000000} Cr
                      </span>
                      <br />
                      <div className="mt-3">
                        <button className="btn common-btn">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Properties;
