import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import Layout from "../components/1.CommonLayout/Layout";
import axios from "axios";
import { checkLoginSession, rootTitle } from "../../src/CommonFunctions";
import { Chart as CharJs, registerables } from "chart.js";
import { Pie, Doughnut, Bar } from "react-chartjs-2";

let organizationalUsersCount = 0; // Default count of organizational users.
let individualUsersCount = 0; // Default count of individual users.
let bankUsersCount = 0; // Default count of individual users.
let isBank = false;
let roleId = "";
let bank_id = "";
const AdminHomePage = () => {
  const navigate = useNavigate();

  CharJs.register(...registerables);
  const updatedCountry = localStorage.getItem("location");
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
    bank_id = data.bank_id;
    roleId = data.roleId;

  }
  const [countOfUsers, setCountOfUsers] = useState({
    countOfIndividualUsers: 0,
    countOfOrgUsers: 0,
    countOfBankUsers: 0,
    bankBranchUsersCount: 0,
  });
  const { countOfIndividualUsers, countOfOrgUsers, countOfBankUsers, bankBranchUsersCount } = countOfUsers;
  const [typeWisePropertyDetails, setTypeWisePropertyDetails] = useState({});
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);
  const [propertyCountLoading, setPropertyCountLoading] = useState(false);
  const [usersCountLoading, setUsersCountLoading] = useState(false);
  const { propertyLabels, typeWiseCount } = typeWisePropertyDetails;

  // set Total Count Of Users
  const setTotalCountOfUsers = async (authHeaders) => {
    // Get and store the count of both types of Users i.e. Individual Users and Organizational Users.

    try {
      await axios
        .get(`/sam/v1/user-registration/auth/type-count`, {
          headers: { Authorization: authHeaders },
        })
        .then((res) => {
          individualUsersCount = res.data.individual_count;
          organizationalUsersCount = res.data.org_count;
          bankUsersCount = res.data.bank_admin_count;
        });
      setCountOfUsers({
        countOfIndividualUsers: individualUsersCount,
        countOfOrgUsers: organizationalUsersCount,
        countOfBankUsers: bankUsersCount,
      });
    } catch (error) {
    }
    if (roleId === 6) {
      let initial_page_number = 1;
      let initial_status = 0;
      let per_page_records_number = 5;

      const dataToPost = {
        status: initial_status,
        page_number: initial_page_number,
        number_of_records: per_page_records_number,
        bank_id: bank_id
      }
      try {
        await axios
          .post(`/sam/v1/bank-registration/auth/bank/user-list`, dataToPost, {
            headers: { Authorization: authHeaders },
          })
          .then((res) => {
            setCountOfUsers({ ...setCountOfUsers, bankBranchUsersCount: res.data.count })

          });

      } catch (error) {
      }
    }
    setUsersCountLoading(false);
  };

  const [chart1Type, setChart1Type] = useState("pie");
  const [chart2Type, setChart2Type] = useState("bar");
  const [chart1TitleVisible, setChart1TitleVisible] = useState(true);
  const [chart2TitleVisible, setChart2TitleVisible] = useState(false);

  // chart selection 1
  const onChart1Selection = (e) => {
    const { value } = e.target;
    if (value === "pie") {
      setChart1TitleVisible(true);
      setChart1Type("pie");
    } else if (value === "bar") {
      setChart1TitleVisible(false);
      setChart1Type("bar");
    } else if (value === "doughnut") {
      setChart1TitleVisible(true);
      setChart1Type("doughnut");
    }
  };
  // chart selection 2
  const onChart2Selection = (e) => {
    const { value } = e.target;
    if (value === "bar2") {
      setChart2TitleVisible(false);
      setChart2Type("bar");
    } else if (value === "doughnut2") {
      setChart2TitleVisible(true);
      setChart2Type("doughnut");
    }
  };
  // chart data 1
  const chart1Data = {
    labels: ["Individual", "Organizational", "Bank Admin"],
    datasets: [
      {
        label: "Count",
        data: [countOfIndividualUsers, countOfOrgUsers, countOfBankUsers],
        backgroundColor: ["#0a4cae", "orange", "green"],
        borderColor: ["black"],
        borderWidth: 1,
      },
    ],
  };
  // chart data 2
  const chart2Data = {
    labels: propertyLabels,
    datasets: [
      {
        label: "Properties",
        data: typeWiseCount,
        backgroundColor: ["#0a4cae", "orange", "green"],
        borderColor: ["black"],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {

  }, [typeWisePropertyDetails])

  // chart option 1
  const chart1Options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Users",
        font: {
          size: 18,
        },
      },
      legend: {
        display: chart1TitleVisible,
      },
    },
  };
  // chart option 2
  const chart2Options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Properties",
        font: {
          size: 20,
          weight: 'bold',
          family: 'Arial, sans-serif',
        },
        padding: 20,
      },
      legend: {
        display: chart2TitleVisible,
      },

    },
  };

  // get Property Count From Api
  const getPropertyCountFromApi = async (authHeaders) => {
    const country_id = updatedCountry === "india" ? 1 : 11;


    let postDataForPropertyCount = {
      country_id: country_id,
    };
    try {
      const propertyCountRes = await axios.post(
        `sam/v1/property/auth/property-count`, postDataForPropertyCount,
        { headers: { Authorization: authHeaders } }
      );
      let arr = propertyCountRes.data; 
      let totalCount = 0;
      let labels = [];
      let labelWiseCount = [];

      arr.forEach((type) => {
        totalCount += type.count;
        labels.push(type.type_Name);
        labelWiseCount.push(type.count);
      });

      setTotalPropertiesCount(totalCount);
      setTypeWisePropertyDetails({
        propertyTypesCount: arr.length,
        propertyLabels: labels,
        typeWiseCount: labelWiseCount,
      });
    } catch (error) { }
    setPropertyCountLoading(false);
  };

  useEffect(() => {
    rootTitle.textContent = "ADMIN - HOME";
    let pie = document.getElementById("pie");
    let bar2 = document.getElementById("bar2");
    if (pie && bar2) {
      pie.checked = true;
      bar2.checked = true;
    }
    if (bar2) {
      bar2.checked = true;
    }
    if (data) {
      setUsersCountLoading(true);
      setPropertyCountLoading(true);
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          setTotalCountOfUsers(data.loginToken);
          getPropertyCountFromApi(data.loginToken);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-lg-9 col-md-8">
            <div className="container-fluid mt-4 my-5 admin-home-wrapper">
              <div className="row">
                {/* Properties */}
                <div className="col-xl-3 col-md-6">
                  <NavLink
                    to={`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"}/property/properties`}
                    className="card text-decoration-none admin-top-card"
                  >
                    <div className="card-body d-flex align-items-center">
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <div className="icon-box icon-box-lg rounded-circle text-center">
                          <i className="bi bi-buildings-fill text-black hover-color-secondary icon fs-2"></i>
                        </div>
                        <div className="total-projects ms-3">
                          <h3 className="heading-text-primary count text-center">
                            {propertyCountLoading ? (
                              <span className="fs-4 spinner spinner-border"></span>
                            ) : (<span className="user-card-count">{totalPropertiesCount}</span>
                            )}
                          </h3>
                          <span className="user-count-card-title">Total Properties</span>
                        </div>
                      </div>
                    </div>
                  </NavLink>
                </div>
                {/* Upload Bulk Properties */}
                <div className="col-xl-3 col-md-6 mt-4 mt-md-0">
                  <NavLink
                    to={`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"
                      }/property/upload-properties`}
                    className="card admin-top-card text-decoration-none "
                  >
                    <div className="card-body d-flex align-items-center">
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <div className="icon-box icon-box-lg rounded-circle text-center">
                          <i className="bi bi-upload text-black hover-color-secondary icon fs-2"></i>
                        </div>
                        <div className="total-projects ms-3 text-center">
                          <span className="user-count-card-title">Upload Bulk Properties</span>
                        </div>
                      </div>
                    </div>
                  </NavLink>
                </div>

                {!isBank ? (
                  <>
                    {/* Individual Users */}
                    <div className="col-xl-2 col-md-4 mt-4 mt-xl-0">
                      <NavLink
                        to="/admin/users/individual-users"
                        className="card admin-top-card text-decoration-none "
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between text-center flex-column align-items-center ">
                            <div className=" d-flex w-100 justify-content-evenly align-items-center mb-2">
                              <div className="user-icon-box icon-box-lg rounded-circle text-center">

                                <i className="bi bi-person-circle text-black hover-color-secondary icon col-6"></i>
                              </div>

                              <h4 className="m-0 col-4 heading-text-primary ">
                                {usersCountLoading ? (
                                  <span className="spinner fs-3 spinner-border"></span>
                                ) : (<span className="user-card-count" >
                                  {individualUsersCount}
                                </span>
                                )}</h4>

                            </div>
                            <div>
                              <span className="user-count-card-title">Individual Users</span>
                            </div>
                          </div>
                        </div>
                      </NavLink>
                    </div>
                    {/* Organizational Users */}
                    <div className="col-xl-2 col-md-4 mt-4 mt-xl-0">
                      <NavLink
                        to="/admin/users/organizational-users"
                        className="card admin-top-card text-decoration-none "
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between text-center flex-column align-items-center ">
                            <div className=" d-flex w-100 justify-content-evenly align-items-center mb-2">
                              <div className="user-icon-box icon-box-lg rounded-circle text-center">
                                <i className="bi bi-building-fill  text-black hover-color-secondary icon "></i>
                              </div>
                              <h5 className="m-0 heading-text-primary">
                                {usersCountLoading ? (
                                  <span className="spinner fs-3 spinner-border"></span>
                                ) : (<span className="user-card-count" >
                                  {organizationalUsersCount}
                                </span>
                                )}</h5>
                            </div>
                            <div>
                              <span className="user-count-card-title" >Organizational Users</span>
                            </div>
                          </div>
                        </div>
                      </NavLink>
                    </div>
                    {/* bankUsersCount */}
                    <div className="col-xl-2 col-md-4 mt-4 mt-xl-0">
                      <NavLink
                        to="/admin/users/bank-users"
                        className="card admin-top-card text-decoration-none "
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between text-center flex-column align-items-center ">
                            <div className=" d-flex w-100 justify-content-evenly align-items-center mb-2">
                              <div className="user-icon-box icon-box-lg rounded-circle text-center">
                                <i className="bi bi-bank text-black hover-color-secondary icon "></i>
                              </div>
                              <h5 className="m-0 heading-text-primary">
                                {usersCountLoading ? (
                                  <span className="spinner fs-3 spinner-border"></span>
                                ) : (<span className="user-card-count">
                                  {bankUsersCount}
                                </span>
                                )}</h5>
                            </div>
                            <div>
                              <span className="user-count-card-title">Bank Admin Users</span>
                            </div>
                          </div>
                        </div>
                      </NavLink>
                    </div>
                  </>) : (
                  <>
                    {/* bank branch Users Count */}
                    {roleId === 6 ? <div className="col-xl-3 col-md-6 mt-4 mt-xl-0">
                      <div

                        onClick={() => {
                          const sensitiveData = bank_id;
                          navigate(`${roleId === 6 ? "/bank" : "/admin"
                            }/users/branch-users`, { state: { sensitiveData } })
                        }
                        }
                        className="card admin-top-card cursor-pointer"
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between text-center flex-column align-items-center ">
                            <div className=" d-flex w-100 justify-content-evenly align-items-center mb-2">
                              <div className="user-icon-box icon-box-lg rounded-circle text-center">
                                <i className="bi bi-bank text-black hover-color-secondary icon "></i>
                              </div>
                              <h5 className="m-0 heading-text-primary">
                                {usersCountLoading ? (
                                  <span className="spinner fs-3 spinner-border"></span>
                                ) : (<span className="user-card-count">
                                  {bankBranchUsersCount}
                                </span>
                                )}</h5>
                            </div>
                            <div>
                              <span className="user-count-card-title">Branch Users</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> : ""}
                  </>
                )}
              </div>
              <hr className="my-4" />
              {!isBank ? (
                <>
                  <div className="row">
                    {/* Chart 1 View  */}
                    <div className="col-xl-6">
                      <div
                        className="container-fluid shadow"
                        style={{ border: "1px solid var(--primary-color)" }}
                      >

                        <div className="row chart-wrapper position-relative bg-light">
                          <div className="h-100 w-100 canvas-wrapper d-flex justify-content-center position-absolute p-4">
                            <Pie
                              className={`${chart1Type === "pie" ? "" : "d-none"
                                }`}
                              data={chart1Data}
                              options={chart1Options}
                            ></Pie>
                            <Bar
                              className={`${chart1Type === "bar" ? "" : "d-none"
                                }`}
                              data={chart1Data}
                              options={chart1Options}
                            ></Bar>
                            <Doughnut
                              className={`${chart1Type === "doughnut" ? "" : "d-none"
                                }`}
                              data={chart1Data}
                              options={chart1Options}
                            ></Doughnut>
                          </div>
                        </div>

                        <div className="row p-2 ">
                          <div className="col-md-3">
                            <span className="common-btn-font heading-text-primary">
                              Chart View
                            </span>
                          </div>
                          <div className="col-md-3 mt-md-0 mt-2 col-6">
                            <div className="form-check form-check-inline">
                              <input
                                onChange={onChart1Selection}
                                className="form-check-input chart1check"
                                type="radio"
                                name="chart1"
                                id="pie"
                                value="pie"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="inlineRadio2"
                              >
                                Pie
                              </label>
                            </div>
                          </div>
                          <div className="col-md-3 mt-md-0 mt-2 col-6">
                            <div className="form-check form-check-inline">
                              <input
                                onChange={onChart1Selection}
                                className="form-check-input chart1check"
                                type="radio"
                                name="chart1"
                                id="bar"
                                value="bar"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="inlineRadio1"
                              >
                                Bar
                              </label>
                            </div>
                          </div>
                          <div className="col-md-3 mt-md-0 mt-2 col-6">
                            <div className="form-check form-check-inline">
                              <input
                                onChange={onChart1Selection}
                                className="form-check-input chart1check"
                                type="radio"
                                name="chart1"
                                id="doughnut"
                                value="doughnut"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="inlineRadio3"
                              >
                                Doughnut
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Chart 2 View  */}
                    <div className="col-xl-6 mt-xl-0 mt-4">
                      <div
                        className="container-fluid shadow"
                        style={{ border: "1px solid var(--primary-color)" }}
                      >
                        <div className="row chart-wrapper position-relative bg-light">
                          <div className="h-100 w-100 canvas-wrapper d-flex justify-content-center position-absolute p-4">
                            <Bar
                              className={`${chart2Type === "bar" ? "" : "d-none"
                                }`}
                              data={chart2Data}
                              options={chart2Options}
                            ></Bar>

                            <Doughnut
                              className={`${chart2Type === "doughnut" ? "" : "d-none"
                                }`}
                              data={chart2Data}
                              options={chart2Options}
                            ></Doughnut>
                          </div>
                        </div>
                        <div className="row p-2 ">
                          <div className="col-md-3">
                            <span className="common-btn-font heading-text-primary">
                              Chart View
                            </span>
                          </div>
                          <div className="col-md-3 mt-md-0 mt-2 col-6">
                            <div className="form-check form-check-inline">
                              <input
                                onChange={onChart2Selection}
                                className="form-check-input chart1check"
                                type="radio"
                                name="chart2"
                                id="bar2"
                                value="bar2"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="bar2"
                              >
                                Bar
                              </label>
                            </div>
                          </div>
                          <div className="col-md-3 mt-md-0 mt-2 col-6">
                            <div className="form-check form-check-inline">
                              <input
                                onChange={onChart2Selection}
                                className="form-check-input chart1check"
                                type="radio"
                                name="chart2"
                                id="doughnut2"
                                value="doughnut2"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="doughnut2"
                              >
                                Doughnut
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-xl-6 mt-xl-0 mt-4">
                    {/* Chart View */}
                    <div
                      className="container-fluid shadow"
                      style={{ border: "1px solid var(--primary-color)" }}
                    >
                      <div className="row chart-wrapper position-relative bg-light">
                        <div className="h-100 w-100 canvas-wrapper d-flex justify-content-center position-absolute p-4">
                          <Bar
                            className={`${chart2Type === "bar" ? "" : "d-none"
                              }`}
                            data={chart2Data}
                            options={chart2Options}
                          ></Bar>

                          <Doughnut
                            className={`${chart2Type === "doughnut" ? "" : "d-none"
                              }`}
                            data={chart2Data}
                            options={chart2Options}
                          ></Doughnut>
                        </div>
                      </div>
                      <div className="row p-2 ">
                        <div className="col-md-3">
                          <span className="common-btn-font heading-text-primary">
                            Chart View
                          </span>
                        </div>
                        <div className="col-md-3 mt-md-0 mt-2 col-6">
                          <div className="form-check form-check-inline">
                            <input
                              onChange={onChart2Selection}
                              className="form-check-input chart1check"
                              type="radio"
                              name="chart2"
                              id="bar2"
                              value="bar2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="bar2"
                            >
                              Bar
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3 mt-md-0 mt-2 col-6">
                          <div className="form-check form-check-inline">
                            <input
                              onChange={onChart2Selection}
                              className="form-check-input chart1check"
                              type="radio"
                              name="chart2"
                              id="doughnut2"
                              value="doughnut2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="doughnut2"
                            >
                              Doughnut
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}




            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHomePage;
