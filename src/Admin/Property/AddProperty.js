import React, { useState } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
// import BreadCrumb from "./BreadCrumb";

const AddProperty = () => {
  const [formData, setFormData] = useState({
    min_value: null,
    max_value: null,
  });

  const [err, setErr] = useState({
    maxValueErr: false,
  });

  const { min_value, max_value } = formData;
  const { maxValueErr } = err;

  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "min_value") {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else if (name === "max_value") {
      setFormData({ ...formData, [name]: parseInt(value) });
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (max_value > min_value) {
      setErr({ ...err, maxValueErr: false });
    } else {
      setErr({ ...err, maxValueErr: true });
    }
  };
  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-md-8 mt-4 mt-md-0">
            {/* <BreadCrumb /> */}
            <section className="add-property-wrapper wrapper">
              <div className="container-fluid">
                <div className="row justify-content-center">
                  <div className="col-xl-10">
                    <form onSubmit={onFormSubmit} className="card shadow p-4">
                      <h2 className="fw-bold">Add Property</h2>
                      <hr />
                      <div className="row">
                        <div className="col-xl-4 col-md-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="property_image"
                            >
                              Image:
                            </label>
                            <input
                              name="property_image"
                              id="property_image"
                              className="form-control"
                              type="file"
                              // required
                            />
                          </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="category"
                            >
                              Category:
                            </label>
                            <input
                              name="category"
                              id="category"
                              className="form-control"
                              type="text"
                              // required
                            />
                          </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="city_name"
                            >
                              City:
                            </label>
                            <input
                              name="city_name"
                              id="city_name"
                              className="form-control"
                              type="text"
                              // required
                            />
                          </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="market_value"
                            >
                              Market Value:
                            </label>
                            <input
                              name="market_value"
                              id="market_value"
                              className="form-control"
                              type="number"
                              // required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xl-8">
                          <div className="form-group mb-3">
                            <div className="row">
                              <div className="col-12">
                                <label className="form-label fw-bold">
                                  Range:
                                </label>
                              </div>
                              <div className="col-md-6">
                                Min:
                                <input
                                  onChange={onInputChange}
                                  name="min_value"
                                  className="form-control"
                                  type="number"
                                  required
                                />
                              </div>

                              <div className="col-md-6">
                                Max:
                                <input
                                  onChange={onInputChange}
                                  name="max_value"
                                  className={`form-control ${
                                    maxValueErr ? "border-danger" : ""
                                  }`}
                                  type="number"
                                  required
                                />
                                <span
                                  className={`text-danger ${
                                    maxValueErr ? "" : "d-none"
                                  }`}
                                >
                                  Maximum value must be greater than minimum
                                  value
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="row">
                        <div className="col-12 text-end">
                          <button type="submit" className="btn btn-primary">
                            Add
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddProperty;
