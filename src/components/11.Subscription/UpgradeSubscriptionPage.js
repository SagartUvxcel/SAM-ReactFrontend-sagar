import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SubscriptionFacilityFetching } from "./SubscriptionFacilityFetching";

let authHeaders = "";
let isLogin = false;
let planStatus = false;

const UpgradeSubscriptionPage = () => {
  const navigate = useNavigate();

  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");

  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
  }

  // subscription Plans
  const [plans, setPlans] = useState(); //all subriction plans
  const [planToDisable, setPlanToDisable] = useState(); //all active plans
  const [selectedPlan, setSelectedPlan] = useState({ plan_id: "" });
  const [subscriptionFacilitiesList, setSubscriptionFacilitiesList] = useState([]);
  const [planCardDisable, setPlanCardDisable] = useState({
    basicCardDisable: false,
    advancedCardDisable: false,
  });

  const [plansOnCard, setPlansOnCard] = useState({
    basicPlanOnCard: null,
    advancedPlanOnCard: null,
  });

  // handle Active Current Plan
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
    }
    // eslint-disable-next-line
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
    }
  };

  // fetching facility details from database
  const fetchFacilityData = async () => {
    const details = await SubscriptionFacilityFetching();
    setSubscriptionFacilitiesList(details);
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
            setPlanToDisable(activePlansRes);
          }
        });
    } catch (error) {
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
    const sensitiveData = plans;
    const activePlanSensitiveData = planToDisable;
    navigate("/subscription/payment", { state: { sensitiveData, activePlanSensitiveData } });
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
    }
  }

  useEffect(() => {
    setPlansOnCard({
      basicPlanOnCard: basicHalfYearly,
      advancedPlanOnCard: advancedHalfYearly,
    });

  }, [basicHalfYearly, advancedHalfYearly, plans]);

  // useEffect for axios
  useEffect(() => {
    if (isLogin) {
      getSubscriptionPlansDetails();
      fetchFacilityData();
      if (planStatus) {
        getActivePlansDetails();
      }
    }
    // eslint-disable-next-line
  }, [planStatus]);

  useEffect(() => {
    setPlanCardDisable({ ...planCardDisable });
    // eslint-disable-next-line
  }, [])


  return (
    <Layout>
      <section className="subscription-wrapper section-padding min-100vh">
        {/* if user Login */}
        {isLogin ? (
          <>
            <div className="container-fluid wrapper">
              <h1 className="text-center">Subscription</h1>
              {/* subscription container */}
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
                    {/*code by prapti*/}
                    <div className="container-fluid my-5">
                      <div className="row justify-content-evenly mt-3">
                        {/* Static Card for "Go for Subscription" */}
                        <div className="col-md-6 subscription-div-box">
                          <button
                            className={`card text-decoration-none subscription-plan-card w-100 h-100 align-items-center position-relative plan-header-wrapper ${selectedPlan.billing_cycle === "subscription"
                              ? "packagesBox-shadow"
                              : ""
                              }`}
                            onClick={() => {
                              const subscriptionPlan = {
                                name: "Subscription",
                                plan_id: 2,
                                billing_cycle: "annual",
                              };
                              onCardBtnClick(subscriptionPlan, 1);
                              setSelectedPlan(subscriptionPlan);
                              onSubscribeClick();
                            }}
                          >
                            <span
                              className={`position-absolute top-0 start-100 translate-middle badge bg-success ${selectedPlan.billing_cycle === "subscription"
                                ? ""
                                : "d-none"
                                }`}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                            </span>
                            <h4 className="plan-title ">
                              Go for Subscription
                            </h4>
                            {/* <h4 className="fw-bold plan-price">
                                {updatedCountry === "malaysia" ? (
                                  <small className="">RM </small>
                                ) : (
                                  <sup>&#8377;</sup>
                                )}
                              </h4> */}
                          </button>
                        </div>
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

export default UpgradeSubscriptionPage;
