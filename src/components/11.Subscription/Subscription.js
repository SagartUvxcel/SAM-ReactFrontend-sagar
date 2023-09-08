import React, { useEffect, useRef, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const dataFromBackend = [
  {    plan_id: 1,
    name: "Basic plan",

    description: "Basic plan",

    price: "0.00",

    billing_cycle: "free trial",
  },

  {
    plan_id: 2,

    name: "Basic plan",

    description: "Basic plan",

    price: "999.00",

    billing_cycle: "half yearly",
  },

  {
    plan_id: 3,

    name: "Basic plan",

    description: "Basic plan",

    price: "1999.00",

    billing_cycle: "annual",
  },

  {
    plan_id: 4,

    name: "Advanced plan",

    description: "Advanced plan",

    price: "0.00",

    billing_cycle: "free trial",
  },

  {
    plan_id: 5,

    name: "Advanced plan",

    description: "Advanced plan",

    price: "2999.00",

    billing_cycle: "half yearly",
  },

  {
    plan_id: 6,

    name: "Advanced plan",

    description: "Advanced plan",

    price: "4999.00",

    billing_cycle: "annual",
  },
];

let authHeaders = "";
let isLogin = false;

const Subscription = () => {
  const navigate = useNavigate();

  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
  }

  // subscription Plans
  const [plans, setPlans] = useState(); //all subriction plans
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [selectedBillingCycle, setSelectedBillingCycle] = useState({
    halfYearlyCycleSelected: true,
    annualCycleSelected: false,
  });
  const { halfYearlyCycleSelected, annualCycleSelected } = selectedBillingCycle;

  const [plansOnCard, setPlansOnCard] = useState({
    basicPlanOnCard: null,
    advancedPlanOnCard: null,
  });
  const { basicPlanOnCard, advancedPlanOnCard } = plansOnCard;

  // get Subscription Plans Details from database
  const getSubscriptionPlansDetails = async () => {
    try {
      // Fetch plans from API URL
      axios
        .get("/sam/v1/customer-registration/auth/subscription-plans", {
          headers: authHeaders,
        })
        .then((response) => {
          console.log(response.data);
          const plansRes = response.data;
          if (plansRes) {
            setPlans(plansRes);
          }
        });
    } catch (error) {
      console.error("Error fetching plans:", error);
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

  const individualPlanDetails = {
    basicHalfYearly: findPlanByNameAndCycle("Basic plan", "half yearly"),
    basicAnnual: findPlanByNameAndCycle("Basic plan", "annual"),
    basicFreeTrial: findPlanByNameAndCycle("Basic plan", "free trial"),
    advancedHalfYearly: findPlanByNameAndCycle("Advanced plan", "half yearly"),
    advancedAnnual: findPlanByNameAndCycle("Advanced plan", "annual"),
    advancedFreeTrial: findPlanByNameAndCycle("Advanced plan", "free trial"),
  };

  // destructing
  const {
    basicHalfYearly,
    basicAnnual,
    basicFreeTrial,
    advancedHalfYearly,
    advancedAnnual,
    advancedFreeTrial,
  } = individualPlanDetails;

  const onHalfYearlyBtnClick = () => {
    setPlansOnCard({
      basicPlanOnCard: basicHalfYearly,
      advancedPlanOnCard: advancedHalfYearly,
    });
    setSelectedBillingCycle({
      halfYearlyCycleSelected: true,
      annualCycleSelected: false,
    });
    setSelectedPlan(basicHalfYearly);
  };

  const onAnnualBtnClick = () => {
    setPlansOnCard({
      basicPlanOnCard: basicAnnual,
      advancedPlanOnCard: advancedAnnual,
    });

    setSelectedBillingCycle({
      halfYearlyCycleSelected: false,
      annualCycleSelected: true,
    });
    setSelectedPlan(basicAnnual);
  };

  const onBasicCardClick = () => {
    if (halfYearlyCycleSelected) {
      setSelectedPlan(basicHalfYearly);
    } else if (annualCycleSelected) {
      setSelectedPlan(basicAnnual);
    }
  };

  const onAdvancedCardClick = () => {
    if (halfYearlyCycleSelected) {
      setSelectedPlan(advancedHalfYearly);
    } else if (annualCycleSelected) {
      setSelectedPlan(advancedAnnual);
    }
  };

  // passing subscription data plans details on payment page with free trial
  const onFreeTrialClick = () => {
    let sensitiveData = "";

    if (selectedPlan) {
      if (selectedPlan.name === "Advanced plan") {
        sensitiveData = advancedFreeTrial;
      } else if (selectedPlan.name === "Basic plan") {
        sensitiveData = basicFreeTrial;
      }
      navigate("/subscription/payment", { state: { sensitiveData } });
    }
  };

  // passing subscription data plans details on payment page
  const onSubscribeClick = () => {
    const sensitiveData = selectedPlan;
    navigate("/subscription/payment", { state: { sensitiveData } });
    console.log(sensitiveData);
  };

  console.log(plans);

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
    setSelectedPlan(basicHalfYearly);
  }, [basicHalfYearly]);

  useEffect(() => {
    setPlansOnCard({
      basicPlanOnCard: basicHalfYearly,
      advancedPlanOnCard: advancedHalfYearly,
    });
  }, [basicHalfYearly, advancedHalfYearly]);

  // useEffect for axios
  useEffect(() => {
    handleActiveColumn(1);
    if (isLogin) {
      getSubscriptionPlansDetails();
    }
  }, []);

  return (
    <Layout>
      <section className="subscription-wrapper section-padding min-100vh">
        {/* if user Login */}
        {isLogin ? (
          <>
            <div className="container-fluid wrapper">
              <h1 className="text-center">Subscription</h1>
              <div className="text-center text-muted">
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Deleniti, nobis.
                </span>
                <br />
                <span>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </span>
              </div>
              <div className="row mt-5 justify-content-center">
                {/*  Checkboxes - Individual & Organization */}
                <div className="col-lg-12 d-flex justify-content-center">
                  <div
                    className={`plan-select-btn d-flex justify-content-center align-items-center ${
                      halfYearlyCycleSelected ? "active" : ""
                    }`}
                    name="individual"
                    onClick={onHalfYearlyBtnClick}
                  >
                    6 Month
                  </div>
                  <div className="mx-4 d-flex justify-content-center align-items-center">
                    |
                  </div>
                  <div
                    className={`plan-select-btn d-flex justify-content-center align-items-center ${
                      annualCycleSelected ? "active" : ""
                    }`}
                    name="organization"
                    onClick={onAnnualBtnClick}
                  >
                    Annual
                  </div>
                </div>
              </div>

              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-xl-8">
                    {/* subscription-table */}
                    <div className="subscription-table-wrapper">
                      <table
                        className="table text-center plans-table"
                        ref={subscriptionPlansTableRef}
                      >
                        <thead>
                          <tr>
                            <th></th>
                            <th className="basic">BASIC</th>
                            <th className="standard">STANDARD</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit.
                            </td>
                            <td className="basic">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur
                              adipisicing.
                            </td>
                            <td className="basic">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit.
                            </td>
                            <td className="basic">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Lorem ipsum dolor sit.
                            </td>
                            <td className="basic">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur.
                            </td>
                            <td className="basic">
                              <i className="bi bi-x-circle-fill text-danger"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Lorem, ipsum.
                            </td>
                            <td className="basic">
                              <i className="bi bi-x-circle-fill text-danger"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit.
                            </td>
                            <td className="basic">
                              <i className="bi bi-x-circle-fill text-danger"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-start">
                              Lorem ipsum dolor sit elit.
                            </td>
                            <td className="basic">
                              <i className="bi bi-x-circle-fill text-danger"></i>
                            </td>
                            <td className="standard">
                              <i className="bi bi-check-circle-fill text-success"></i>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* subscription-Plans */}
                    <div className="container-fluid mt-5">
                      <div className="row justify-content-between">
                        {/* basic card */}
                        <div className={`col-md-6 mb-4 mb-md-0 plan-card-1`}>
                          <button
                            className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                            onClick={() => {
                              handleActiveColumn(1);
                              onBasicCardClick();
                            }}
                          >
                            <span
                              className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${
                                selectedPlan &&
                                selectedPlan.name === "Basic plan"
                                  ? ""
                                  : "d-none"
                              }`}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                            </span>
                            <h4 className="plan-title mb-4 fw-bold text-uppercase">
                              Basic
                            </h4>
                            <h3 className="fw-bold plan-price">
                              <sup>&#8377;</sup>
                              {basicPlanOnCard ? basicPlanOnCard.price : ""}
                            </h3>
                          </button>
                        </div>
                        {/* advance card  */}
                        <div className={`col-md-6 mb-4 mb-md-0 plan-card-2`}>
                          <button
                            className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                            onClick={() => {
                              handleActiveColumn(2);
                              onAdvancedCardClick();
                            }}
                          >
                            <span
                              className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${
                                selectedPlan &&
                                selectedPlan.name === "Advanced plan"
                                  ? ""
                                  : "d-none"
                              }`}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                            </span>
                            <h4 className="plan-title mb-4 fw-bold text-uppercase">
                              Advanced
                            </h4>
                            <h3 className="fw-bold plan-price">
                              <sup>&#8377;</sup>
                              {advancedPlanOnCard
                                ? advancedPlanOnCard.price
                                : ""}
                            </h3>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* subscription button */}
                    <div className="row mt-md-5">
                      <div className="col-md-6">
                        <button
                          className="w-100 btn btn-primary text-capitalize common-btn-font"
                          onClick={onSubscribeClick}
                        >
                          Subscribe to{" "}
                          {selectedPlan && selectedPlan.name === "Advanced plan"
                            ? "Advance"
                            : "Basic"}
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                      <div className="col-md-6 mt-4 mt-md-0">
                        <button
                          className="w-100 btn btn-outline-primary text-capitalize common-btn-font"
                          onClick={onFreeTrialClick}
                        >
                          Free Trial -{" "}
                          {selectedPlan && selectedPlan.name === "Advanced plan"
                            ? "Advance"
                            : "Basic"}
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* if user not Login */}
            <div className="container-fluid wrapper">
              <h1 className="text-center">
                You don't have access to this page
              </h1>
              <div className="text-muted text-center">
                Please login or register{" "}
              </div>

              <div className="mt-5 row justify-content-center">
                <NavLink
                  to="/login"
                  className="btn btn-outline-primary col-md-2"
                >
                  {" "}
                  Login{" "}
                </NavLink>
                <div className="col-2 text-center">
                  <h5>OR</h5>
                </div>
                <NavLink
                  to="/register"
                  className="btn btn-outline-primary col-md-2"
                >
                  {" "}
                  Register{" "}
                </NavLink>
              </div>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
};

export default Subscription;
