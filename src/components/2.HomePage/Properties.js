import React from "react";
import { useNavigate } from "react-router-dom";

const Properties = ({ propertyData }) => {
  // To navigate to particular route.
  const goTo = useNavigate();
  const viewProperty = () => {
    goTo("/property");
  };

  return (
    <section className="property-wrapper" id="properties">
      <div className="container-fluid d-none display-on-search wrapper">
        <div className="row">
          {propertyData ? (
            propertyData.map((property, Index) => {
              return (
                <div className="col-lg-3 col-md-4" key={Index}>
                  <div className="property-card-wrapper">
                    <div className="card mb-4">
                      <div className="top-line"></div>
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
                          Location: {property.city_name}
                        </span>
                        <br />
                        <span className="text-capitalize">
                          Market Value:{" "}
                          {parseInt(property.market_value) / 10000000 + " Cr."}
                        </span>
                        <br />
                        <span className="text-capitalize">
                          Range:{" "}
                          {parseInt(property.range.split("-")[0]) / 10000000 +
                            " Cr." +
                            " - " +
                            parseInt(property.range.split("-")[1]) / 10000000 +
                            " Cr."}
                        </span>
                        <br />
                        <div className="mt-3">
                          <button
                            onClick={viewProperty}
                            className="btn common-btn"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-5 text-center text-white">
              <h2 className="text-capitalize">Sorry! No result found :(</h2>
              <span className="">Please try with another options</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Properties;
