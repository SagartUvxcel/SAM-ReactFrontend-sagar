import React from "react";
import { properties } from "../DataArrays/PropertyData";

const Properties = () => {
  return (
    <section className="property-wrapper wrapper">
      <div className="container-fluid">
        <div className="row">
          {properties.map((property) => {
            return (
              <div className="col-lg-3 col-md-4">
                <div className="property-card-wrapper">
                  <div className="card mb-4">
                    <hr />
                    <img className="card-img-top" src={property.img} alt="" />
                    <div className="card-body text-white">
                      <h4 className="card-title text-uppercase">
                        {property.title}
                      </h4>
                      <span className="text-capitalize">{property.desc}</span>
                      <br />
                      <span className="text-capitalize">
                        {property.specials}
                      </span>
                      <br />
                      <span className="text-capitalize">{property.price}</span>
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
