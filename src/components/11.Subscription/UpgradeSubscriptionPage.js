import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let authHeaders = "";
let isLogin = false;
let planStatus = false;
let planEndDate = "";

const UpgradeSubscriptionPage = () => {
  const navigate = useNavigate();

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
  const [planToDisable, setPlanToDisable] = useState(); //all active plans
  const [selectedPlan, setSelectedPlan] = useState({ plan_id: "" });
  const [planCardDisable, setPlanCardDisable] = useState({
    basicCardDisable: false,
    advancedCardDisable: false,
  });
  const [disabledIndex, setDisabledIndex] = useState(-1);
  const { basicCardDisable, advancedCardDisable } = planCardDisable;

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

  const handleActiveCurrentPlan = (cycle) => {
    let disablePlanBillingCycle;
    let disablePlanName;
    if (planToDisable) {
      disablePlanBillingCycle = planToDisable.billing_cycle;
      disablePlanName = planToDisable.plan_name;
      if (disablePlanBillingCycle === cycle) {
        for (let key in plansOnCard) {
          if (plansOnCard.hasOwnProperty(key)) {
            let plan = plansOnCard[key];
            if (plan) {
              if (plan.name === disablePlanName) {
                if (plan.name === "Advanced plan") {
                  setPlanCardDisable({
                    basicCardDisable: false,
                    advancedCardDisable: true,
                  });
                  setSelectedPlan(findPlanByNameAndCycle("Basic plan", cycle));
                  handleActiveColumn(1);
                } else if (plan.name === "Basic plan") {
                  setPlanCardDisable({
                    basicCardDisable: true,
                    advancedCardDisable: false,
                  });
                  setSelectedPlan(
                    findPlanByNameAndCycle("Advanced plan", cycle)
                  );
                  handleActiveColumn(2);
                }
              }
            }
          }
        }
      } else {
        console.log("not that cycle");
        setPlanCardDisable({
          basicCardDisable: false,
          advancedCardDisable: false,
        });
        setSelectedPlan(findPlanByNameAndCycle("Basic plan", cycle));
        handleActiveColumn(1);
      }
    }
  };

  useEffect(() => {
    if (planToDisable && plans) {
      handleActiveCurrentPlan("half yearly");
      let selectedPlansDetails = plans.filter(plan => plan.plan_id !== planToDisable.plan_id)
      setSelectedPlan(selectedPlansDetails[0]);
      setDisabledIndex(planToDisable.plan_id)
    }
  }, [planToDisable, plans]);

  // get Subscription Plans Details from database
  const getSubscriptionPlansDetails = async () => {
    try {
      // Fetch plans from API URL
      axios
        .get("/sam/v1/customer-registration/auth/subscription-plans", {
          headers: authHeaders,
        })
        .then((response) => {
          const plansRes = response.data;
          if (plansRes) {
            const plansValue = plansRes.filter(plan => plan.plan_id !== 1);
            setPlans(plansValue);
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
      axios
        .get("/sam/v1/customer-registration/auth/user_subscribed_plans", {
          headers: authHeaders,
        })
        .then((response) => {
          const activePlansRes = response.data;
          if (activePlansRes) {
            // console.log("Active plan:", response.data);
            setPlanToDisable(activePlansRes);
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
    // setSelectedPlan(basicHalfYearly);
    handleActiveCurrentPlan("half yearly");
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
    // setSelectedPlan(basicAnnual);
    handleActiveCurrentPlan("annual");
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

  // passing subscription data plans details on payment page
  const onSubscribeClick = () => {
    const sensitiveData = selectedPlan;
    navigate("/subscription/payment", { state: { sensitiveData } });
    console.log(selectedPlan);
  };

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

  const onCardBtnClick = (e, i) => {
    if (e.name === "Basic plan") {
      handleActiveColumn(1);
    } else if (e.name === "Advanced plan") {
      handleActiveColumn(2);
    } else {
      console.log(e.name, i);
    }
  }

  // default select card
  // useEffect(() => {
  //   setSelectedPlan(basicHalfYearly);
  // }, [basicHalfYearly]);

  useEffect(() => {
    setPlansOnCard({
      basicPlanOnCard: basicHalfYearly,
      advancedPlanOnCard: advancedHalfYearly,
    });
  }, [basicHalfYearly, advancedHalfYearly, plans]);

  // useEffect for axios
  useEffect(() => {
    // handleActiveColumn(1);

    if (isLogin) {
      getSubscriptionPlansDetails();
      if (planStatus) {
        getActivePlansDetails();
      }
    }
  }, [planStatus]);

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
              {/* <div className="row mt-5 justify-content-center"> */}
              {/*  Checkboxes - Individual & Organization */}
              {/* <div className="col-lg-12 d-flex justify-content-center">
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
                </div> */}
              {/* </div> */}


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
                    {/* <div className="container-fluid mt-5">
                      <div className="row justify-content-between">
                        {/* basic card */}
                    {/* <div className={`col-md-6 mb-4 mb-md-0 plan-card-1 `}>
                          <button
                            className={`w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4 ${
                              basicCardDisable ? "disabled" : ""
                            }`}
                            disabled={basicCardDisable}
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
                        </div> */}
                    {/* advance card  */}
                    {/* <div className={`col-md-6 mb-4 mb-md-0 plan-card-2`}>
                          <button
                            className={`w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4 ${
                              advancedCardDisable ? "disabled" : ""
                            }`}
                            disabled={advancedCardDisable}
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
                        </div> */}
                    {/* </div>
                    </div> */}

                    <div className="container-fluid my-5">
                      <div className="row justify-content-between  mt-3">
                        {plans && plans.map((plan, Index) => {
                          return (
                            <>
                              <button className={`upgradePackages  border-0 mb-4 mt-4 mb-md-0 plan-card-${Index + 1} position-relative plan-header-wrapper 
                            ${selectedPlan.plan_id === plan.plan_id ? "packagesBox-shadow " : ""} 
                            ${plan.plan_id === disabledIndex ? "disabled" : ""}`}
                                key={Index}
                                disabled={plan.plan_id === disabledIndex}
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
                                <h4 className={`plan-title mb-4 fw-bold text-uppercase ${plan.billing_cycle === "half yearly" ? "card-text-2" : ""} ${plan.billing_cycle === "annual" ? "card-text-3" : ""}`}>{plan.name.replace(' plan', '')}</h4>
                                <h5 className="fw-bold plan-price">
                                  <sup>&#8377;</sup> <sup>&#8377;</sup> <sup>&#8377;</sup> <sup>&#8377;</sup>
                                  {/* {plan.price.replace('.00', '')}  */}
                                  <span className="fs-5"> / {plan.billing_cycle === "half yearly" ? "6 Months" : ""}{plan.billing_cycle === "annual" ? "Year" : ""}</span>
                                </h5>
                              </button>
                            </>

                          )
                        })}
                      </div>
                    </div>


                    {/* subscription button */}
                    <div className="row mt-md-5 justify-content-center">
                      <div className="col-md-6 ">
                        <button
                          className="w-100 btn btn-primary text-capitalize common-btn-font"
                          onClick={onSubscribeClick}
                        >
                          Activate to{" "}
                          {selectedPlan && selectedPlan.name === "Advanced plan"
                            ? "Advance"
                            : "Basic"}
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                      {/* <div className="col-md-6 mt-4 mt-md-0">
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
                                            </div> */}
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

export default UpgradeSubscriptionPage;
