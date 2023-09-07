import React, { useEffect, useRef, useState } from "react";
import { Elements } from '@stripe/react-stripe-js';
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";


import axios from "axios";

// const stripePromise = loadStripe('pk_test_51Nk4qfSHRy9SkqBTfWc49bExrTp3Q5k6ZEwAjFcPHnqKn6MZ8D0ekQvimsKpJh47iig7hx2BNK8rFwx9D1LK1uxk00xu0jvJqs');

let authHeaders = "";
let isLogin = false;


const sixMonthPlansDetails = [
  { "plan_id": 4, "name": "Basic plan", "description": "Basic plan", "price": "1199.00" },
  { "plan_id": 5, "name": "Advanced plan", "description": "Advanced plan", "price": "2999.00" }
]

const Subscription = () => {

  const navigate = useNavigate();

  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
  }

  // subscription Plans 
  const [plans, setPlans] = useState(sixMonthPlansDetails);
  const [sixMonthsPlans, setSixMonthsPlans] = useState([]);
  const [annualPlans, setAnnualPlans] = useState([]);

  const [selectedPlanDetails, setSelectedPlanDetails] = useState({
    billing_cycle: "half yearly"
  });
  const [defaultSelectedPlan, setDefaultSelectedPlan] = useState({
    sixMonths: true,
    annual: false
  });
  const { sixMonths, annual } = defaultSelectedPlan;

  const onSixMonthBtnClick = () => {
    setPlans(sixMonthPlansDetails);
    setDefaultSelectedPlan({ sixMonths: true, annual: false });
    setSelectedPlanDetails({ ...selectedPlanDetails, billing_cycle: "half yearly" });
  }

  const onAnnualBtnClick = () => {
    console.log(defaultSelectedPlan);
    setPlans(annualPlans);
    setDefaultSelectedPlan({ sixMonths: false, annual: true });
    setSelectedPlanDetails({ ...selectedPlanDetails, billing_cycle: "annual" });

  }

  const defaultActivePlans = () => {
    if (plans) {
      const basicPlanDetails = plans.filter(plan => plan.plan_id === 4)[0];

      setSelectedPlanDetails({
        selectedPlanId: basicPlanDetails.plan_id,
        selectedPlanName: basicPlanDetails.name,
        selectedPlanAmount: basicPlanDetails.price,
      });
    }
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

  // passing subscription data plans details on payment page
  const navigateToPaymentPage = () => {
    const sensitiveData = selectedPlanDetails;
    navigate("/subscription/payment", { state: { sensitiveData } });
  };
  const navigateToFreeTrialPaymentPage = () => {
    const sensitiveData = { ...selectedPlanDetails, selectedPlanAmount: parseFloat(0), billing_cycle: "free trial" };
    // navigate("/subscription/payment", { state: { sensitiveData } });
    console.log(sensitiveData);
  };

  // get Subscription Plans Details from database
  const getSubscriptionPlansDetails = async () => {
    try {
      // Fetch plans from API URL
      axios.get('/sam/v1/property/auth/subscription-plans', {
        headers: authHeaders,
      })
        .then(response => {
          // setPlans(sixMonthPlansDetails);

          const plansRes = response.data;
          if (plansRes) {
            setAnnualPlans(response.data);
            // const basicPlanDetails = plansRes.filter(plan => plan.plan_id === 1)[0];
            // setSelectedPlanDetails({
            //   selectedPlanId: basicPlanDetails.plan_id,
            //   selectedPlanName: basicPlanDetails.name,
            //   selectedPlanAmount: basicPlanDetails.price,
            // });
            // console.log(JSON.stringify(plansRes));
          }


        })

    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }

  useEffect(() => {
  }, [])

  // useEffect(() => {
  //   if (plans.length > 0) {
  //     const basicPlanDetails = plans.filter(plan => plan.plan_id === 1)[0];
  //     setSelectedPlanDetails({
  //       selectedPlanId: basicPlanDetails.plan_id,
  //       selectedPlanName: basicPlanDetails.name,
  //       selectedPlanAmount: basicPlanDetails.price,
  //     });
  //     console.log(plans);
  //   }
  // }, [plans]);


  // useEffect for axios
  useEffect(() => {

    handleActiveColumn(1);
    defaultActivePlans();
    if (isLogin) {
      getSubscriptionPlansDetails()
    }

  }, []);

  return (
    <Layout>

      <section className="subscription-wrapper section-padding min-100vh">
        {/* if user Login */}
        {isLogin ? <>
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
                <div className={`plan-select-btn d-flex justify-content-center align-items-center ${sixMonths ? "active" : ""}`}
                  name="individual"
                  onClick={onSixMonthBtnClick}
                >
                  6 Month
                </div>
                <div className="mx-4 d-flex justify-content-center align-items-center">|</div>
                <div className={`plan-select-btn d-flex justify-content-center align-items-center ${annual ? "active" : ""}`}
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
                            Lorem ipsum dolor sit amet consectetur adipisicing.
                          </td>
                          <td className="basic">
                            <i className="bi bi-check-circle-fill text-success"></i>
                          </td>
                          <td className="standard">
                            <i className="bi bi-check-circle-fill text-success"></i>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-start">Lorem ipsum dolor sit.</td>
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
                      {plans &&
                        plans.map((plans, Index) => {
                          {/* let plan = plansData[key]; */ }
                          return (
                            <div
                              className={`col-md-6 mb-4 mb-md-0 plan-card-${Index + 1
                                }`}
                              key={Index}
                            >
                              <button
                                className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                                onClick={() => {
                                  setSelectedPlanDetails({
                                    selectedPlanId: plans.plan_id,
                                    selectedPlanName: plans.name,
                                    selectedPlanAmount: plans.price,
                                  });
                                  handleActiveColumn(Index + 1);
                                }}
                              >
                                <span
                                  className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlanDetails.selectedPlanName === plans.name
                                    ? ""
                                    : "d-none"
                                    }`}
                                >
                                  <i className="bi bi-check-circle-fill"></i>
                                </span>
                                <h4 className="plan-title mb-4 fw-bold text-uppercase">
                                  {plans.name.replace(' plan', '')}
                                </h4>
                                <h3 className="fw-bold plan-price">
                                  <sup>&#8377;</sup>
                                  {plans.price}
                                  {/* <sub className="fs-6 fw-normal">/YEAR</sub> */}
                                </h3>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>


                  {/* subscription button */}
                  <div className="row mt-md-5">
                    <div className="col-md-6">
                      <button className="w-100 btn btn-primary text-capitalize common-btn-font" onClick={navigateToPaymentPage}>
                        Subscribe to {selectedPlanDetails.selectedPlanName && selectedPlanDetails.selectedPlanName.toLowerCase().replace(' plan', '')}{" "}
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                    <div className="col-md-6 mt-4 mt-md-0">
                      <button className="w-100 btn btn-outline-primary text-capitalize common-btn-font"
                        onClick={navigateToFreeTrialPaymentPage}
                      >
                        Free Trial ({selectedPlanDetails.selectedPlanName && selectedPlanDetails.selectedPlanName.toLowerCase().replace(' plan', '')}){" "}
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </> : <>
          {/* if user not Login */}
          <div className="container-fluid wrapper">
            <h1 className="text-center">You don't have access to this page</h1>
            <div className="text-muted text-center">Please login or register </div>

            <div className="mt-5 row justify-content-center">
              <NavLink to="/login" className="btn btn-outline-primary col-md-2"> Login </NavLink>
              <div className="col-2 text-center">
                <h5>OR</h5>
              </div>
              <NavLink to="/register" className="btn btn-outline-primary col-md-2"> Register </NavLink>

            </div>
          </div>
        </>
        }
      </section >


    </Layout >
  );
};

export default Subscription;
