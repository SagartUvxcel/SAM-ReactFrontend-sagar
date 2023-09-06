import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import './CardElementStyles.css'; // Import your CSS for styling
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";



let authHeaders = "";
let isLogin = false;

export const PaymentInformation = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const dataFromSubscriptionPage = location.state ? location.state.sensitiveData : null;

  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    isLogin = data.isLoggedIn;
  }



  const [planDetails, setPlanDetails] = useState({});
  const [subscribeBtnLoading, setSubscribeBtnLoading] = useState(false);

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

    console.log("reset function");
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
      console.error(error);
      return;
    }

    let dataToPost = {
      plan_id: planDetails.plan_id,
      payment_token: token.id,
      amount: parseFloat(planDetails.price),
    }
    console.log(JSON.stringify(token));

    try {
      const response = await axios.post("/sam/v1/property/auth/subscribe-user", dataToPost, { headers: authHeaders });
      if (response.data) {
        if (response.data.status === 0) {
          setSubscribeBtnLoading(false);
          toast.success("Payment Successful.")
          //   console.log("Payment Successful.");
          resetCardFormInputs();
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



  useEffect(() => {
    if (dataFromSubscriptionPage) {
      setPlanDetails({
        plan_id: dataFromSubscriptionPage.selectedPlanId,
        name: dataFromSubscriptionPage.selectedPlanName,
        price: dataFromSubscriptionPage.selectedPlanAmount,
      })
    }

  }, [])

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
                        <p className=" text-secondary p-0 mb-0">{planDetails.name}</p>
                        <p className=" text-secondary p-0 mb-0"><sup className="fs-5 top-0">&#8377;</sup> {planDetails.price} / Year</p>
                      </div>
                      <div className="subscription-div d-flex justify-content-between py-1">
                        <h6 className=" py-2 mb-0">Total</h6>
                        <h6 className=" py-2 mb-0"><sup className="fs-5 top-0">&#8377;</sup> {planDetails.price}</h6>
                      </div>
                    </div>
                  </div>
                  <div id="card-element">

                    <div className="StripeElement w-50 mb-4">
                      <div className="subscription-div d-flex align-items-center flex-wrap">
                        <i className="fa fa-credit-card"></i>
                        <h4 className="my-0 ms-3 ">Card</h4>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} id="paymentForm">
                      <CardElement options={cardElementOptions} />

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
                </div>
              </div>

            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export default PaymentInformation