import React, { useEffect, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import "./CardElementStyles.css"; // Import CSS for styling
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { SubscriptionFacilityFetching } from "./SubscriptionFacilityFetching";

// const taxRate = 0.18;

let authHeaders = "";
let planStatus = false;
let email = "";

export const PaymentInformation = () => {

  const [plan, setPlan] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [billingOption, setBillingOption] = useState("");
  const [filteredBillingOptions, setFilteredBillingOptions] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const dataFromSubscriptionPage = location.state
    ? location.state.sensitiveData
    : null;
  const activePlans = location.state
    ? location.state.activePlanSensitiveData
    : null;
  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem(
    "updatedSubscriptionStatus"
  );

  if (data) {
    authHeaders = { Authorization: data.loginToken };
    planStatus = updatedSubscriptionStatus
      ? updatedSubscriptionStatus
      : data.subscription_status;
    email = data.user;
  }

  const [cardErrorMsg, setCardErrorMsg] = useState(null);
  const [planDetails, setPlanDetails] = useState(
    dataFromSubscriptionPage ? dataFromSubscriptionPage : null
  );
  const [subscribeBtnLoading, setSubscribeBtnLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [subscriptionFacilitiesList, setSubscriptionFacilitiesList] = useState(
    []
  );
  const [advancedTrueList, setAdvancedTrueList] = useState([]);
  const [basicTrueList, setBasicTrueList] = useState([]);
  const [facilityListState, setFacilityListState] = useState([]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    layout: {
      type: "tabs",
      defaultCollapsed: false,
    },
  };

  // reset input function
  const resetCardFormInputs = () => {
    const cardInputDetails = document.querySelectorAll(".InputElement");

    if (cardInputDetails) {
      cardInputDetails.forEach((i) => {
        i.value = "";
      });
    }
  };

  // fetching facility details from database
  const fetchFacilityData = async () => {
    const details = await SubscriptionFacilityFetching();
    setSubscriptionFacilitiesList(details);
  };

  // pay button function
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubscribeBtnLoading(true);
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setCardErrorMsg(error.message);
      setSubscribeBtnLoading(false);
      return;
    } else {
      setCardErrorMsg(null);
    }

    let dataToPost = {
      plan_id: planDetails.plan_id,
      payment_token: token.id,
      plan_name: planDetails.name,
      amount: parseFloat(finalAmount),
      billing_cycle: planDetails.billing_cycle,
      email: email,
    };

    // API url
    let urlSub = `/sam/v1/customer-registration/auth/${planStatus === true ? "upgrade-subscription" : "subscribe-user"
      }`;
    try {
      const response = await axios.post(urlSub, dataToPost, {
        headers: authHeaders,
      });
      if (response.data) {
        if (response.data.status === 0) {
          let facilityList = [];
          if (planDetails.name === "Basic plan") {
            facilityList = basicTrueList;
          } else {
            facilityList = advancedTrueList;
          }
          setFacilityListState(facilityList);
          setPaymentModal(true);
          setSubscribeBtnLoading(false);
          resetCardFormInputs();
          setCardErrorMsg(null);
          localStorage.setItem("updatedSubscriptionStatus", true);
          data.subscription_plan_id = planDetails.plan_id;
          localStorage.setItem("data", JSON.stringify(data));
        } else {
          setSubscribeBtnLoading(false);
        }
      }
      // Handle success or error response from backend
    } catch (error) {
      setSubscribeBtnLoading(false);
    }
  };

  // modal close function
  const onModalCloseClickFunction = () => {
    setPaymentModal(false);
    navigate("/");
  };

  // tax Fetch Function
  const taxFetchFunction = async () => {
    try {
      const { data } = await axios.get("/sam/v1/customer-registration/auth/tax-percentage", {
        headers: authHeaders,
      })
      setTaxRate(data.tax_in_percentage/100);

    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    if (plan) {
      // Check if a plan is selected
      const selectedPlanDetails = dataFromSubscriptionPage.find(
        (item) => item.name === plan
      );
      setPlanDetails(selectedPlanDetails || null); // Set plan details or null if not found
    } else {
      setPlanDetails(null); // Reset to null if no plan is selected
    }

    fetchFacilityData();
    // eslint-disable-next-line
  }, [plan, dataFromSubscriptionPage]); // Include `plan` in the dependency array

  useEffect(() => {
    if (subscriptionFacilitiesList !== null) {
      const basicTrue = subscriptionFacilitiesList.filter(
        (item) => item.basic === true
      );
      const advancedTrue = subscriptionFacilitiesList.filter(
        (item) => item.advanced === true
      );
      setBasicTrueList(basicTrue);
      setAdvancedTrueList(advancedTrue);
    } else {
      fetchFacilityData();
    }
    // eslint-disable-next-line
  }, [subscriptionFacilitiesList]);

  useEffect(() => {
    const options = dataFromSubscriptionPage.filter(
      (item) => item.name === plan && item.billing_cycle !== "free trial"
    );
    setFilteredBillingOptions(options);
    setBillingOption(""); // Reset billing option when plan changes
    console.log(options);
    // eslint-disable-next-line
  }, [plan, dataFromSubscriptionPage]);

  // useEffect to calculate subtotal, tax, and final amount
  useEffect(() => {
    const selectedPlanData = filteredBillingOptions.find(
      (option) => option.billing_cycle === billingOption
    );
    const calculatedSubtotal = selectedPlanData
      ? parseFloat(selectedPlanData.price)
      : 0;

    const calculatedTax = calculatedSubtotal * taxRate;
    const calculatedFinalAmount = calculatedSubtotal + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setFinalAmount(calculatedFinalAmount);
    setPlanDetails(selectedPlanData);
    // eslint-disable-next-line
  }, [billingOption, filteredBillingOptions, taxRate]);

  useEffect(() => {
    taxFetchFunction();
  }, [])

   // capitalize Words function
   const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  // on page load
  window.onload = () => {
    navigate("/subscription");
  };

  return (
    <>
      <Layout>
        <section className="subscription-wrapper section-padding min-100vh">
          <div className="container-fluid wrapper">
            <h1 className="text-center mb-4">Payments</h1>
            <div className="row justify-content-center">
              <div className="col-xl-6 col-lg-7 shadow p-md-4 p-2 subscription-card-col">
                <div className="card-container">
                  <div id="card-element">
                    <div className="subscription-cart">
                      <h2>Subscription Payment</h2>
                      {/* Plan Selection */}
                      <div>
                        <label htmlFor="plan">Choose a Plan:</label>
                        <select
                          id="plan"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          value={plan}
                          onChange={(e) => setPlan(e.target.value)}
                        >
                          <option value="">Select a plan</option>
                          {Array.from(
                            new Set(
                              dataFromSubscriptionPage && dataFromSubscriptionPage.map((item) => item.name)
                            )
                          ).map((uniquePlanName, index) => (
                            <option key={index} value={uniquePlanName}>
                              {capitalizeWords(uniquePlanName)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Billing Option Selection */}
                      <div>
                        <label htmlFor="billingOption">Billing Option:</label>
                        <select
                          id="billingOption"
                          className="form-select form-select-sm"
                          aria-label=".form-select-sm example"
                          value={billingOption}
                          onChange={(e) => setBillingOption(e.target.value)}
                        >
                          <option value="">Select a billing option</option>
                          {filteredBillingOptions.map((option, index) => (
                            <option
                              key={index}
                              value={option.billing_cycle}
                              disabled={
                                activePlans?.status === "active" &&
                                activePlans?.plan_name === plan &&
                                option.billing_cycle ===
                                activePlans?.billing_cycle
                              }
                            >
                              {capitalizeWords(option.billing_cycle)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <hr />
                      </div>

                      {/* Display Subtotal */}
                      <div className="amount-line">
                        <div className="label">Subtotal:</div>
                        <div className="amount subtotalAmount">
                          &#8377; {subtotal.toFixed(2)}
                        </div>
                      </div>

                      {/* Display Tax */}
                      <div className="amount-line">
                        <div className="label">Tax:</div>
                        <div className="amount">&#8377; {tax.toFixed(2)}</div>
                      </div>

                      <div>
                        <hr />
                      </div>

                      {/* Display Final Amount */}
                      <div className="amount-line">
                        <div className="label total">Total:</div>
                        <div className="amount totalAmount">
                          &#8377; {finalAmount.toFixed(2)}
                        </div>
                      </div>

                      <div className="amount">plus tax</div>
                    </div>
                  </div>
                  {planDetails && (
                    <>
                      <div id="card-element">
                        <div className="subscription-cart">
                          <div className="StripeElement w-50 mb-4">
                            <div className="subscription-div d-flex align-items-center flex-wrap">
                              <i className="fa fa-credit-card"></i>
                              <h6 className="my-0 ms-3 ">Card</h6>
                            </div>
                          </div>
                          <form onSubmit={handleSubmit} id="paymentForm">
                            <CardElement options={cardElementOptions} />
                            <div
                              className={`text-danger text-start mt-1 ${cardErrorMsg ? "" : "d-none"
                                }`}
                            >
                              {cardErrorMsg}
                            </div>
                            <div className="text-center">
                              <button
                                type="submit"
                                className="btn btn-primary text-capitalize common-btn-font px-4 mt-4 w-50"
                                disabled={subscribeBtnLoading ? true : false}
                              >
                                {subscribeBtnLoading ? (
                                  <>
                                    <span
                                      className="spinner-grow spinner-grow-sm me-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Subscribing....
                                  </>
                                ) : (
                                  "Subscribe"
                                )}
                              </button>
                              {subscribeBtnLoading ? (
                                <p className="mt-2 text-danger">
                                  Please do not hit the back button or refresh the
                                  page while we process your transaction.
                                </p>
                              ) : (
                                ""
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal */}
            <div
              className={`modal fade ${paymentModal ? "show d-flex" : "d-none"
                }`}
              id="success_tic"
              aria-hidden="true"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            >
              <div className="modal-dialog modal-dialog-centered ">
                {/* <!-- Modal content--> */}
                <div className="modal-content">
                  <button
                    className="close border-0 "
                    onClick={onModalCloseClickFunction}
                    data-dismiss="modal"
                  >
                    &times;
                  </button>
                  <div className="page-body">
                    <div className="head">
                      <h1 className="checkmark-circle-heading">
                        <div className="checkmark-circle">
                          <div className="background"></div>
                          <div className="checkmark draw"></div>
                        </div>
                      </h1>
                      <h3 className="mb-3">Payment Successful </h3>
                    </div>

                    <div className=" subscribe-list text-center">
                      <h5 className="my-3 text-orange m-5">
                        Congratulations, Your Plan has been activated.
                      </h5>
                      <h5 className="my-3 text-orange m-5">
                        Enjoy your Subscription.
                      </h5>
                    </div>
                    <div className=" subscription-facility-box d-flex justify-content-center overflow-y">
                      <ul className="list-style-none ">
                        {facilityListState.map((data, index) => {
                          return (
                            <li
                              key={index}
                              className="my-1 d-flex align-items-center "
                            >
                              <i className="bi bi-check2 fs-5 text-success me-2"></i>{" "}
                              {data.title}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default PaymentInformation;
