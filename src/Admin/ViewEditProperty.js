import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/1.CommonLayout/Layout";
import AdminSideBar from "./AdminSideBar";
import propertyData from "./data.json";

const ViewEditProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState([]);

  const [editViewDetails, setEditViewDetails] = useState({
    isReadOnly: true,
    isDisabled: false,
    editClassName: "editable-values",
    cancelUpdateBtnClassName: "d-none",
  });

  const editDetails = () => {
    setEditViewDetails({
      isReadOnly: false,
      isDisabled: true,
      editClassName: "",
      cancelUpdateBtnClassName: "",
    });
  };

  const cancelEditing = () => {
    setEditViewDetails({
      isReadOnly: true,
      isDisabled: false,
      editClassName: "editable-values",
      cancelUpdateBtnClassName: "d-none",
    });
    let samp = document.querySelectorAll("input");
    for (let i of samp) {
      document.getElementById(i.name).value = property[i.name];
    }
  };
  const { _id, count, category, city_name, market_value, range } = property;
  const { isReadOnly, isDisabled, editClassName, cancelUpdateBtnClassName } =
    editViewDetails;

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
      <div className="container-fluid section-padding">
        <div className="row min-100vh">
          <AdminSideBar />
          <div className="col-xl-10 col-md-9 scrollable-right-div">
            <section className="admin-edit-property wrapper">
              <div className="container-fluid">
                <h2 className="text-center mb-4">View & Edit</h2>
                <div className="row justify-content-center">
                  <div className="col-xl-10 col-lg-11">
                    <form
                      action=""
                      className="card shadow p-xl-5 p-lg-4 p-3 position-relative"
                    >
                      <div className="text-end position-absolute admin-property-edit-icon">
                        <i
                          onClick={editDetails}
                          className="bi bi-pencil-square"
                        ></i>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <div className="form-group mb-3">
                            <label className="form-label fw-bold" htmlFor="_id">
                              ID:
                            </label>
                            <input
                              name="_id"
                              id="_id"
                              className={`form-control ${editClassName}`}
                              type="text"
                              defaultValue={_id}
                              disabled={isDisabled}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="count"
                            >
                              No of Properties:
                            </label>
                            <input
                              name="count"
                              id="count"
                              className={`form-control ${editClassName}`}
                              type="number"
                              defaultValue={count}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="col-6">
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
                              className={`form-control ${editClassName}`}
                              type="text"
                              defaultValue={category}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="col-6">
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
                              className={`form-control ${editClassName}`}
                              type="text"
                              defaultValue={city_name}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="col-6">
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
                              className={`form-control ${editClassName}`}
                              type="text"
                              defaultValue={market_value}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="range"
                            >
                              Range:
                            </label>
                            <input
                              name="range"
                              id="range"
                              className={`form-control ${editClassName}`}
                              type="text"
                              defaultValue={range}
                              readOnly={isReadOnly}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className={`row mt-4 ${cancelUpdateBtnClassName}`}
                        id="update-cancel"
                      >
                        <div className="col-12">
                          <div className="text-end">
                            <button
                              onClick={cancelEditing}
                              type="button"
                              className="btn btn-secondary me-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                              type="submit"
                              className="btn btn-primary"
                            >
                              Update
                            </button>
                          </div>
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

export default ViewEditProperty;
