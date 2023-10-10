import React, { useEffect, useRef, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./CardElementStyles.css";
import { transformDateFormat } from "../../CommonFunctions";

// const dataFromBackend = [
//   {
//     plan_id: 1,
//     name: "Basic plan",

//     description: "Basic plan",

//     price: "0.00",

//     billing_cycle: "free trial",
//   },

//   {
//     plan_id: 2,

//     name: "Basic plan",

//     description: "Basic plan",

//     price: "999.00",

//     billing_cycle: "half yearly",
//   },

//   {
//     plan_id: 3,

//     name: "Basic plan",

//     description: "Basic plan",

//     price: "1999.00",

//     billing_cycle: "annual",
//   },

//   {
//     plan_id: 4,

//     name: "Advanced plan",

//     description: "Advanced plan",

//     price: "0.00",

//     billing_cycle: "free trial",
//   },

//   {
//     plan_id: 5,

//     name: "Advanced plan",

//     description: "Advanced plan",

//     price: "2999.00",

//     billing_cycle: "half yearly",
//   },

//   {
//     plan_id: 6,

//     name: "Advanced plan",

//     description: "Advanced plan",

//     price: "4999.00",

//     billing_cycle: "annual",
//   },
// ];

let authHeaders = "";
let isLogin = false;
let planStatus = false;
let planEndDate = "";

const Subscription = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
    planEndDate = data.subscription_end_date;
  }

  // subscription Plans
  const [plans, setPlans] = useState(); //all subriction plans
  const [activePlans, setActivePlans] = useState(); //all subriction plans
  const [selectedPlan, setSelectedPlan] = useState({plan_id:""});
  // const [subscriptionPlanStatus, setSubscriptionPlanStatus] = useState(planStatus);
  // const [upGradePlanStatus, setUpGradePlanStatus] = useState(true);
  // const dataFromPaymentPage = location.state ? location.state.subscriptionStatus.isActive : data.subscription_status;

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
      await axios
        .get("/sam/v1/customer-registration/auth/subscription-plans", {
          headers: authHeaders,
        })
        .then((response) => {
          // console.log(response.data);
          const plansRes = response.data;
          if (plansRes) {
            setPlans(plansRes);
          }
        });
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
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
          // console.log(response.data);
          const activePlansRes = response.data;
          if (activePlansRes) {
            setActivePlans(activePlansRes);
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
    basicAnnual,
    basicFreeTrial,
    advancedHalfYearly,
    advancedAnnual,
  } = individualPlanDetails;

  // on click function 6 month button
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
    handleActiveColumn(1);
  };

  // on click function annual button
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
    handleActiveColumn(1);

  };

  // on click function basic card
  const onBasicCardClick = () => {
    if (halfYearlyCycleSelected) {
      setSelectedPlan(basicHalfYearly);
    } else if (annualCycleSelected) {
      setSelectedPlan(basicAnnual);
    }
  };

  // on click function annual card
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
      sensitiveData = basicFreeTrial;
      navigate("/subscription/payment", { state: { sensitiveData } });
    }
  };
  // console.log(selectedPlan);
  // passing subscription data plans details on payment page
  const onSubscribeClick = () => {
    const sensitiveData = selectedPlan;
    navigate("/subscription/payment", { state: { sensitiveData } });
    console.log(sensitiveData);
  };

  // passing subscription data plans details on payment page
  const onStartNowBtnClick = (e) => {
    const sensitiveData = e;
    navigate("/subscription/payment", { state: { sensitiveData } });
    console.log();
  };

  // passing subscription data plans details on payment page
  const onCardBtnClick = (e, i) => {
    if (e.name === "Basic plan") {
      handleActiveColumn(1);
    } else if (e.name === "Advanced plan") {
      handleActiveColumn(2);
    } else {
      console.log(e.name, i);
    }
  }

  // default active plans
  // const defaultActivePlans = () => {
  //   if (plans) {
  //     const freeTrial = plans.filter(plan => plan.plan_id === 1)[0];
  //     setSelectedPlan(freeTrial);
  //   }
  // }


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

  // default select card 
  useEffect(() => {
    // console.log(activePlans);
    if (basicHalfYearly) {
      // setSelectedPlan(basicHalfYearly);
      // setSelectedPlan();
    }

  }, [basicHalfYearly]);

  useEffect(() => {
    if (plans) {
      const basicPlanDetails = plans.filter(plan => plan.plan_id === 1)[0];
      setSelectedPlan(basicPlanDetails);
      console.log(plans);
    }

    setPlansOnCard({
      basicPlanOnCard: basicHalfYearly,
      advancedPlanOnCard: advancedHalfYearly,
    });
  }, [basicHalfYearly, advancedHalfYearly, plans]);

  // useEffect for axios
  useEffect(() => {
    handleActiveColumn(1);
    // defaultActivePlans();
    if (isLogin) {
      getSubscriptionPlansDetails();
      if (planStatus) {
        getActivePlansDetails();
      }
    }



  }, []);

  return (
    <Layout>
      <section className="subscription-wrapper section-padding min-100vh mb-5">
        {/* if user Login */}
        {isLogin ? (
          <>
            <div className="container-fluid wrapper">
              <h1 className="text-center">Subscription</h1>
              {activePlans ? <>

                {/* if subscription is active on user account the showing plans  else showing subscription plans for subscribe user  */}



                <div className="card active-plans-details-card m-auto mt-5">
                  <div className="list-group list-group-fit  d-flex  justify-content-between">
                    <div className="list-group-item bg-0">
                      <div className="form-group row mb-0">
                        <label className="col-form-label form-label col-sm-3">Current Plan</label>
                        <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                          <div className="flex">{activePlans ? activePlans.plan_name : ""}</div>
                          {/* <a href="#" className="text-secondary">Change plan</a> */}
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item">
                      <div className="form-group row mb-0">
                        <label className="col-form-label form-label col-sm-3">Billing Cycle</label>
                        <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                          <p className="mb-1">{activePlans ? activePlans.billing_cycle : ""}</p>

                        </div>
                      </div>
                    </div>
                    <div className="list-group-item">
                      <div className="form-group row mb-0">
                        <label className="col-form-label form-label col-sm-3">End Date</label>
                        <div className="col-sm-8 d-flex align-items-center justify-content-between flex-wrap">
                          <p className="mb-1"> {activePlans ? transformDateFormat(activePlans.end_date)
                            .split("-")
                            .reverse()
                            .join("-") : ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item">
                      <div className="form-group row mb-0">
                        {/* <label className="col-form-label form-label col-sm-3">Upgrade</label> */}
                        <div className="col-sm-8 text-center">
                          <button type="button" onClick={(e) => upGradePlansBtn(e)} className="btn btn-primary">{activePlans.billing_cycle === "free trial" ? "Activate Plan" : "Upgrade Plan"}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </> :
                <>
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

                  {/*  Checkboxes - Individual & Organization */}
                  {/* <div className="row mt-5 justify-content-center">
                  <div className="col-lg-12 d-flex justify-content-center">
                    <div
                      className={`plan-select-btn d-flex justify-content-center align-items-center ${halfYearlyCycleSelected ? "active" : ""
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
                      className={`plan-select-btn d-flex justify-content-center align-items-center ${annualCycleSelected ? "active" : ""
                        }`}
                      name="organization"
                      onClick={onAnnualBtnClick}
                    >
                      Annual
                    </div>
                  </div>
                </div> */}

                  <div className="container mt-5">
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
                                <th></th>
                                <th className="basic">BASIC</th>
                                <th className="standard">ADVANCED</th>
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
                        <div className="container-fluid my-5">
                          <div className="row justify-content-between mt-3">
                            {plans && plans.map((plan, Index) => {
                              return (
                                <button className={`packages  border-0 mb-4 mt-4 mb-md-0 plan-card-${Index + 1} position-relative plan-header-wrapper ${ selectedPlan.plan_id === plan.plan_id ? "packagesBox-shadow " : ""}`} key={Index}
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
                                    {/* <sup>&#8377;</sup>{plan.price.replace('.00', '')}   */}
                                    <span className="fs-5"> / {plan.billing_cycle === "free trial" ? "7 Days" : ""}{plan.billing_cycle === "half yearly" ? "6 Months" : ""}{plan.billing_cycle === "annual" ? "Year" : ""}</span>
                                  </h4>
                                </button>

                              )
                            })}
                          </div>
                        </div>



                        {/* <div className="container-fluid mt-5">
                        <div className="row justify-content-between"> */}
                        {/* basic card */}
                        {/* <div className={`col-md-6 mb-4 mb-md-0 plan-card-1`}>
                            <button
                              className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                              onClick={() => {
                                handleActiveColumn(1);
                                onBasicCardClick();
                              }}
                            >
                              <span
                                className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlan &&
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
                          </div> */}
                        {/* advance card  */}
                        {/* <div className={`col-md-6 mb-4 mb-md-0 plan-card-2`}>
                            <button
                              className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                              onClick={() => {
                                handleActiveColumn(2);
                                onAdvancedCardClick();
                              }}
                            >
                              <span
                                className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlan &&
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
                      </div> */}

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
                          {/* {selectedPlan && selectedPlan.name === "Advanced plan" || annualCycleSelected
                          ? ""
                          : <>
                            <div className="col-md-6 mt-4 mt-md-0">
                              <button
                                className="w-100 btn btn-outline-primary text-capitalize common-btn-font"
                                onClick={onFreeTrialClick}
                              >
                                Free Trial -{" "}
                                Basic
                                <i className="bi bi-chevron-right"></i>
                              </button>
                            </div>
                          </>
                        } */}

                        </div>
                      </div>
                    </div>
                  </div>
                </>
              }
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
    </Layout >
  );
};

export default Subscription;
