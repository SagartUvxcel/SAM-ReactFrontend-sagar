import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import './CardElementStyles.css'; // Import your CSS for styling
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";



let authHeaders = "";
let isLogin = false;
let planStatus = false;
let email = "";

export const PaymentInformation = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const dataFromSubscriptionPage = location.state ? location.state.sensitiveData : null;

  const data = JSON.parse(localStorage.getItem("data"));
  const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");

  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
    planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
    email = data.user;
  }


  const [cardErrorMsg, setCardErrorMsg] = useState(null);
  const [planDetails, setPlanDetails] = useState(dataFromSubscriptionPage ? dataFromSubscriptionPage : null);
  const [subscribeBtnLoading, setSubscribeBtnLoading] = useState(false);
  const [perBillingCycleName, setPerBillingCycleName] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  // reset input function
  const resetCardFormInputs = () => {
    const cardInputDetails = document.querySelectorAll(".InputElement");

    if (cardInputDetails) {
      cardInputDetails.forEach((i) => {
        i.value = "";
      })
    }
  }

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
      console.error(error.message);
      setSubscribeBtnLoading(false);

      return;
    } else {
      setCardErrorMsg(null);
    }

    let dataToPost = {
      plan_id: planDetails.plan_id,
      payment_token: token.id,
      plan_name: planDetails.name,
      amount: parseFloat(planDetails.price),
      billing_cycle: planDetails.billing_cycle,
      email: email,
    }

    console.log(JSON.stringify(dataToPost));

    // API url
    let urlSub = `/sam/v1/customer-registration/auth/${planStatus === true ? "upgrade-subscription" : "subscribe-user"}`;


    try {
      const response = await axios.post(urlSub, dataToPost, { headers: authHeaders });
      if (response.data) {
        if (response.data.status === 0) {
          setPaymentModal(true);
          setSubscribeBtnLoading(false);
          // toast.success("Payment Successful.")
          resetCardFormInputs();
          setCardErrorMsg(null);
          localStorage.setItem("updatedSubscriptionStatus", true);

          // setTimeout(() => {
          //   navigate("/subscription");
          // }, 500);
        } else {
          setSubscribeBtnLoading(false);
        }
      }
      // Handle success or error response from backend
    } catch (error) {
      console.error(error);
      setSubscribeBtnLoading(false);
    }
  };

  const onModalCloseClickFunction = () => {
    setPaymentModal(false);
    navigate("/");
  }

  // pay button function for free trial
  const onClickFreeTrialSubscribeSubmitBtn = async (event) => {
    event.preventDefault();
    // setSubscribeBtnLoading(true);

    let dataToPost = {
      plan_id: planDetails.plan_id,
      payment_token: "",
      amount: parseFloat(planDetails.price),
      billing_cycle: planDetails.billing_cycle,
      plan_name: planDetails.name,
      email: email,
    }
    const pageRefreshData = true;

    try {
      const response = await axios.post("/sam/v1/customer-registration/auth/subscribe-user", dataToPost, { headers: authHeaders });
      if (response.data) {
        if (response.data.status === 0) {
          // setPaymentModal(true);
          setSubscribeBtnLoading(false);
          toast.success("Your Free Trial Started...")
          resetCardFormInputs();
          setCardErrorMsg(null);
          localStorage.setItem("updatedSubscriptionStatus", true);
          setTimeout(() => {
            navigate("/");
          }, 500);
        } else {
          setSubscribeBtnLoading(false);
        }
      }
      // Handle success or error response from backend
    } catch (error) {
      console.error(error);
      setSubscribeBtnLoading(false);
    }

  }

  // display billing cycle name for year or 6 month
  const displayBillingCycleName = () => {
    if (dataFromSubscriptionPage.billing_cycle === "annual") {
      setPerBillingCycleName("/ Year");
    } else if (dataFromSubscriptionPage.billing_cycle === "half yearly") {
      setPerBillingCycleName("/ 6 Months");
    } else if (dataFromSubscriptionPage.billing_cycle === "free trial") {
      setPerBillingCycleName("");
    }
  }



  useEffect(() => {
    console.log(planDetails);
    if (dataFromSubscriptionPage) {
      displayBillingCycleName();
    }
  }, [dataFromSubscriptionPage])

  useEffect(() => {

  }, [])
  window.onload = () => { navigate("/subscription"); }

  return (
    <>
      <Layout>
        <section className="subscription-wrapper section-padding min-100vh">
          <div className="container-fluid wrapper">
            <h1 className="text-center mb-4">Payments</h1>
            <div className="row justify-content-center">
              <div className="col-xl-6 col-lg-7 col-md-5 shadow p-md-4 p-2 subscription-card-col">
                <div className="card-container">
                  <div id="card-element">
                    <div className="StripeElement w-100">
                      <h5 className="text-start">Your Subscription </h5>
                      <div className="subscription-div d-flex justify-content-between border-bottom py-1">
                        <p className=" text-secondary p-0 mb-0">{planDetails ? planDetails.name : ""}</p>
                        <p className=" text-secondary p-0 mb-0"><sup className="fs-5 top-0">&#8377;</sup><sup className="fs-5 top-0">&#8377;</sup><sup className="fs-5 top-0">&#8377;</sup><sup className="fs-5 top-0">&#8377;</sup>
                          {/* {planDetails ? planDetails.price : ""} */}
                          {perBillingCycleName}  </p>
                      </div>
                      <div className="subscription-div d-flex justify-content-between py-1">
                        <h6 className=" py-2 mb-0">Total</h6>
                        <h6 className=" py-2 mb-0"><sup className="fs-5 top-0">&#8377;</sup> <sup className="fs-5 top-0">&#8377;</sup> <sup className="fs-5 top-0">&#8377;</sup> <sup className="fs-5 top-0">&#8377;</sup> 
                        {/* {planDetails ? planDetails.price : ""} */}
                        {perBillingCycleName}</h6>
                      </div>
                    </div>
                  </div>
                  {planDetails && planDetails.name === "Basic plan" && planDetails.billing_cycle === "free trial" ? <>
                    <div className="text-center">

                      <button type="button" onClick={(e) => onClickFreeTrialSubscribeSubmitBtn(e)} className="btn btn-primary text-capitalize common-btn-font px-4 mt-4 " disabled={subscribeBtnLoading ? true : false
                      }>{subscribeBtnLoading ? (
                        <>
                          <span
                            className="spinner-grow spinner-grow-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Subscribing....
                        </>
                      ) : (
                        "Start Your Free Trial"
                      )}</button>
                    </div>
                  </> : <>
                    <div id="card-element">
                      <div className="StripeElement w-50 mb-4">
                        <div className="subscription-div d-flex align-items-center flex-wrap">
                          <i className="fa fa-credit-card"></i>
                          <h4 className="my-0 ms-3 ">Card</h4>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} id="paymentForm">
                        <CardElement options={cardElementOptions} />
                        <div className={`text-danger text-start mt-1 ${cardErrorMsg ? "" : "d-none"}`}>{cardErrorMsg}</div>
                        <div className="text-center">

                          <button type="submit" className="btn btn-primary text-capitalize common-btn-font px-4 mt-4 w-50" disabled={subscribeBtnLoading ? true : false
                          }>{subscribeBtnLoading ? (
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
                          )}</button>
                        </div>
                      </form>
                    </div>
                  </>
                  }
                </div>



              </div>

            </div>


            {/* <button type="button" className="btn btn-info btn-lg" data-toggle="modal" onClick={() => {
              setPaymentModal(true);
            }} data-target="#success_tic">Open Modal</button> */}
            {/* Modal */}
            <div
              className={`modal fade ${paymentModal ? "show d-flex" : "d-none"}`}
              id="success_tic"
              aria-hidden="true"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            >
              <div className="modal-dialog modal-dialog-centered">

                {/* <!-- Modal content--> */}
                <div className="modal-content">
                  <button className="close border-0 " onClick={onModalCloseClickFunction} data-dismiss="modal">&times;</button>
                  <div className="page-body">
                    <div className="head">
                      <h3 className="mb-3">Payment Successful </h3>

                    </div>

                    <h1 className="checkmark-circle-heading">
                      <div className="checkmark-circle">
                        <div className="background"></div>
                        <div className="checkmark draw"></div>
                      </div>
                    </h1>

                    <div className=" subscribe-list text-center">
                      <h4 className="my-3 color-orange color-red m-5">Congratulations, Your Plan has been activated.</h4>
                      <h4 className="my-3 color-orange color-red m-5">Enjoy your Subscription.</h4>

                    </div>
                    <div className=" d-flex justify-content-center">
                      <ul className="list-style-none ">
                        <li className="my-1 d-flex align-items-center "><i className="bi bi-check2 fs-5 text-success me-2"></i>   Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>
                        <li className="my-1 d-flex align-items-center "><i className="bi bi-check2 fs-5 text-success me-2"></i>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>
                        <li className="my-1 d-flex align-items-center "><i className="bi bi-check2 fs-5 text-success me-2"></i>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>
                        <li className="my-1 d-flex align-items-center "><i className="bi bi-check2 fs-5 text-success me-2"></i>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>
                        <li className="my-1 d-flex align-items-center "><i className="bi bi-check2 fs-5 text-success me-2"></i>Lorem ipsum dolor sit amet consectetur adipisicing elit.</li>

                      </ul>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </section>
      </Layout >
    </>
  );
}

export default PaymentInformation