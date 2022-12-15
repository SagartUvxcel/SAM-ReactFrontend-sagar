import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/1.CommonLayout/Layout";
import propertyData from "./data.json";

const ViewEditProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState([]);

  const { _id, count, category, city_name, market_value, range } = property;

  const setCurrentProperty = () => {
    for (let i of propertyData) {
      if (i._id === id) {
        setProperty(i);
      }
    }
  };

  useEffect(() => {
    setCurrentProperty();
  });

  return (
    <Layout>
      <section className="mt-5 admin-edit-property wrapper min-100vh">
        <div className="container-fluid">
          <h2 className="text-center mb-4">View & Edit</h2>
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10 col-md-11">
              <form action="" className="card shadow p-xl-5 p-lg-4 p-3">
                <div className="row">
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="_id">
                        ID
                      </label>
                      <input
                        name="_id"
                        id="_id"
                        className="form-control"
                        type="text"
                        defaultValue={_id}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="count">
                        No of Properties
                      </label>
                      <input
                        name="count"
                        id="count"
                        className="form-control"
                        type="number"
                        defaultValue={count}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="category">
                        Category
                      </label>
                      <input
                        name="category"
                        id="category"
                        className="form-control"
                        type="text"
                        defaultValue={category}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="city_name">
                        City
                      </label>
                      <input
                        name="city_name"
                        id="city_name"
                        className="form-control"
                        type="text"
                        defaultValue={city_name}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="market_value">
                        Market Value
                      </label>
                      <input
                        name="market_value"
                        id="market_value"
                        className="form-control"
                        type="text"
                        defaultValue={
                          market_value !== undefined
                            ? Number(market_value) / 10000000 + " Cr."
                            : market_value
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-2">Range</div>
                  <div className="col-lg-3">
                    <div className="form-group mb-3">
                      <label htmlFor="min_value">Min</label>
                      <input
                        name="min_value"
                        id="min_value"
                        className="form-control"
                        type="text"
                        defaultValue={
                          range
                            ? Number(range.split("-")[0]) / 10000000 + " Cr."
                            : range
                        }
                      />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="form-group mb-3">
                      <label htmlFor="max_value">Max</label>
                      <input
                        name="max_value"
                        id="max_value"
                        className="form-control"
                        type="text"
                        defaultValue={
                          range
                            ? Number(range.split("-")[1]) / 10000000 + " Cr."
                            : range
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ViewEditProperty;
