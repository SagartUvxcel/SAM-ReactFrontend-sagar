import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommonSpinner from "../../CommonSpinner";
import SubscriptionPage_access_denied_svg from "../../images/SubscriptionPage_access_denied_svg.svg";
import "./CardElementStyles.css";
import { propertyDateFormat } from "../../CommonFunctions";
import { SubscriptionFacilityFetching } from "./SubscriptionFacilityFetching";

let authHeaders = "";
let isLogin = false;
let planStatus = false;

const Subscription = () => {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
  }
  // subscription Plans
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState(); //all subscription plans
  const [activePlans, setActivePlans] = useState(); //active subscription plans
  const [selectedPlan, setSelectedPlan] = useState({ plan_id: "" });
  const [subscriptionFacilitiesList, setSubscriptionFacilitiesList] = useState([]);

  // get Subscription Plans Details from database
  const getSubscriptionPlansDetails = async () => {
    try {
      // Fetch plans from API URL
      await axios
        .get("/sam/v1/customer-registration/auth/subscription-plans", {
          headers: authHeaders,
        })
        .then((response) => {
          const plansRes = response.data;
          if (plansRes) {
            setPlans(plansRes);
            setLoading(false);
            handleActiveColumn(1);
          }
        });
    } catch (error) {
      setLoading(false);
    }
  };

  // fetching facility details from database
  const fetchFacilityData = async () => {
    const details = await SubscriptionFacilityFetching();
    console.log(details);
    setSubscriptionFacilitiesList(details);
    setLoading(false);
  };

  // get Subscription Plans Details from database
  const getActivePlansDetails = async () => {
    try {
      // Fetch plans from API URL
      await axios
        .get("/sam/v1/customer-registration/auth/user_subscribed_plans", {
          headers: authHeaders,
        })
        .then((response) => {
          const activePlansRes = response.data;
          if (activePlansRes.status === "active") {
            setActivePlans(activePlansRes);
            setLoading(false);
          } else if (activePlansRes.status === "expired" || activePlansRes.status === "inactive") {
            setLoading(false);
            navigate("/subscription/upgrade-plan");
          } else {
            getSubscriptionPlansDetails();
            fetchFacilityData();
          }
        });
    } catch (error) {

      if (error.response.data.error === "No subscription found") {
        getSubscriptionPlansDetails();
        fetchFacilityData();
      }
      setLoading(false);
    }
  };

  // filter plans as per billing cycle
  const findPlanByNameAndCycle = (name, billingCycle) => {
    if (plans) {
      return plans.find((item) => {
        return item.name === name && item.billing_cycle === billingCycle;
      });
    }
  };

  // plan details structure and filter 
  const individualPlanDetails = {
    basicHalfYearly: findPlanByNameAndCycle("Basic plan", "half yearly"),
    basicAnnual: findPlanByNameAndCycle("Basic plan", "annual"),
    basicFreeTrial: findPlanByNameAndCycle("Basic plan", "free trial"),
    advancedHalfYearly: findPlanByNameAndCycle("Advanced plan", "half yearly"),
    advancedAnnual: findPlanByNameAndCycle("Advanced plan", "annual"),
  };

  // destructing
  const {
    basicHalfYearly,
    advancedHalfYearly,
  } = individualPlanDetails;

  // passing subscription data plans details on payment page
  const onSubscribeClick = () => {
    const sensitiveData = selectedPlan;
    navigate("/subscription/payment", { state: { sensitiveData } });
  };

  // passing subscription data plans details on payment page
  const onCardBtnClick = (e, i) => {
    if (e.name === "Basic plan") {
      handleActiveColumn(1);
    } else if (e.name === "Advanced plan") {
      handleActiveColumn(2);
    } else {
    }
  }

  // upgrade button click function
  const upGradePlansBtn = () => {
    navigate("/subscription/upgrade-plan");
  }

  // selected subscription table
  const subscriptionPlansTableRef = useRef(null);

  // handle active column function for subscription plans
  const handleActiveColumn = (columnIndex) => {
    const table = subscriptionPlansTableRef.current;
    if (table) {
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const columns = row.querySelectorAll("td");
        columns.forEach((column, index) => {
          if (index === columnIndex) {
            column.style.backgroundColor = "#e9f4fe";
          } else {
            column.style.backgroundColor = "";
          }
        });
      });

      const headers = table.querySelectorAll("th");
      headers.forEach((header, index) => {
        if (index === columnIndex) {
          header.style.backgroundColor = "#e9f4fe";
        } else {
          header.style.backgroundColor = "";
        }
      });
    }
  };

  useEffect(() => {
    if (plans) {
      const basicPlanDetails = plans.filter(plan => plan.plan_id === 1)[0];
      setSelectedPlan(basicPlanDetails);
    }

  }, [basicHalfYearly, advancedHalfYearly, plans]);

  // useEffect for axios
  useEffect(() => {
    handleActiveColumn(1);
    if (isLogin) {
      setLoading(true);
      if (planStatus) {
        getActivePlansDetails();
      } else {
        getActivePlansDetails();
        getSubscriptionPlansDetails();
        fetchFacilityData();

      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="subscription-wrapper section-padding min-100vh mb-5">
        {/* if user Login */}
        {isLogin ? (
          <>
            <div className="container-fluid py-3">
              <h2 className="text-center my-3">Subscription</h2>
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "60vh" }}
                >
                  <CommonSpinner
                    spinnerColor="primary"
                    height="4rem"
                    width="4rem"
                    spinnerType="grow"
                  />
                </div>
              ) : activePlans ? (
                <>
                  {/* active plan details */}
                  <div className="card active-plans-details-card m-auto mt-5">
                    <div className="list-group list-group-fit  d-flex  justify-content-between">
                      <div className="list-group-item bg-0">
                        <div className="form-group row mb-0">
                          <label className="col-form-label form-label fw-bold col-sm-3">Current Plan</label>
                          <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                            <div className="flex">{activePlans ? activePlans.plan_name : ""}</div>
                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="form-group row mb-0">
                          <label className="col-form-label form-label fw-bold col-sm-3">Billing Cycle</label>
                          <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                            <p className="mb-1">{activePlans ? activePlans.billing_cycle : ""}</p>

                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="form-group row mb-0">
                          <label className="col-form-label form-label fw-bold col-sm-3">End Date</label>
                          <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                            <p className="mb-1"> {activePlans ? propertyDateFormat(activePlans.end_date) : ""}</p>
                          </div>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="form-group row mb-0">
                          <div className="col-sm-8 text-center">
                            <button type="button" onClick={(e) => upGradePlansBtn(e)} className="btn btn-primary">{activePlans.billing_cycle === "free trial" ? "Activate Plan" : "Upgrade Plan"}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* subscription page details */}
                  <div className="container mt-3">
                    <div className="row justify-content-center">
                      <div className="col-xl-10">
                        {/* subscription-table */}
                        <div className="subscription-table-wrapper">
                          <table
                            className="table text-center plans-table"
                            ref={subscriptionPlansTableRef}
                          >
                            <thead>
                              <tr>
                                <th className="text-start">Title</th>
                                <th className="basic">BASIC</th>
                                <th className="standard">ADVANCED</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subscriptionFacilitiesList.map((subscriptionList, index) => {
                                return (
                                  <tr key={index}>
                                    <td className="text-start">{subscriptionList.title}
                                    </td>
                                    <td className="basic">
                                      <i className={`bi ${subscriptionList.basic ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"}`}></i>
                                    </td>
                                    <td className="standard">
                                      <i className={`bi ${subscriptionList.advanced ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"}`}></i>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* subscription-Plans */}
                        <div className="container-fluid my-5">
                          <div className="row justify-content-between mt-3">
                            {plans && plans.map((plan, Index) => {
                              return (
                                <button className={`packages  border-0 mb-4 mt-4 mb-md-0 plan-card-${Index + 1} position-relative plan-header-wrapper ${selectedPlan.plan_id === plan.plan_id ? "packagesBox-shadow " : ""}`} key={Index}
                                  onClick={() => {
                                    onCardBtnClick(plan, Index);
                                    setSelectedPlan(plan);
                                  }}
                                >
                                  <span
                                    className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlan.plan_id === plan.plan_id ? "" : "d-none"} `}
                                  >
                                    <i className="bi bi-check-circle-fill"></i>
                                  </span>
                                  <h4 className={`plan-title mb-4 fw-bold text-uppercase ${plan.billing_cycle === "free trial" ? "card-text-1" : ""} ${plan.billing_cycle === "half yearly" ? "card-text-2" : ""} ${plan.billing_cycle === "annual" ? "card-text-3" : ""}`}>{plan.name === "Basic plan" && plan.billing_cycle === "free trial" ? "Free" : plan.name.replace(' plan', '')}</h4>
                                  <h4 className="fw-bold plan-price">
                                    {plan.billing_cycle === "free trial" ? <sup>&#8377;</sup> : <><sup>&#8377;</sup><sup>&#8377;</sup><sup>&#8377;</sup><sup>&#8377;</sup></>}
                                    <span className="fs-5"> / {plan.billing_cycle === "free trial" ? "7 Days" : ""}{plan.billing_cycle === "half yearly" ? "6 Months" : ""}{plan.billing_cycle === "annual" ? "Year" : ""}</span>
                                  </h4>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* subscription button */}
                        <div className={`row mt-md-5 mb-5  "d-flex justify-content-center`}>
                          <div className="col-md-8 mt-3">
                            <button
                              className="w-100 btn btn-primary text-capitalize fs-5 common-btn-font"
                              onClick={onSubscribeClick}
                            >
                              Continue with{" "}
                              {selectedPlan && selectedPlan.billing_cycle === "free trial" ? "Free Trial" : selectedPlan && selectedPlan.name}
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </>
        ) : (
          <>
            <div className="container-fluid mt-5">
              <div className="row justify-content-evenly">
                <div className="col-lg-5 col-xl-5 order-lg-1 order-2 mt-lg-0 mt-5 mb-5">
                  <img src={SubscriptionPage_access_denied_svg} alt="" className="login-img" />
                </div>
                <div className="col-lg-7 col-xl-4 col-md-7 order-lg-2 order-1 mt-4">
                  {/* if user not Login */}
                  <h1 className="text-center text-orange">
                    You don't have access to this page
                  </h1>
                  <div className="mt-5 row justify-content-center align-items-center subscription-access-denied-page-btn m-auto">
                    <NavLink
                      to="/login"
                      className="btn btn-primary col-md-4"
                    >
                      {" "}
                      Login{" "}
                    </NavLink>
                    <div className="col-2 text-center my-3">
                      <h5 className="m-0">OR</h5>
                    </div>
                    <NavLink
                      to="/register"
                      className="btn btn-primary col-md-4"
                    >
                      {" "}
                      Register{" "}
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


      </section>
    </Layout >
  );
};

export default Subscription;
