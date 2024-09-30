
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import PaymentInformation from "./PaymentInformation";
import CommonSpinner from "../../CommonSpinner";

let authHeaders = "";

export const StripePaymentForm = () => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeaders = { Authorization: data.loginToken };
    }
    const [loading, setLoading] = useState(false);
    const [stripePromise, setStripePromise] = useState(null);

    // fetching facility details from database
    const fetchStripePromiseKey = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/sam/v1/customer-registration/auth/stripe-public-key", { headers: authHeaders }); 
            if (response.data.key !== "") {
                const stripePromiseInstance = loadStripe(response.data.key);
                setStripePromise(stripePromiseInstance);
                setLoading(false);
            } else {
                setStripePromise(null);
                setLoading(false);
            }
            // Handle success or error response from backend
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchStripePromiseKey();
        // eslint-disable-next-line
    }, [])

    return (
        <Elements stripe={stripePromise}>
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
            ) : (
                <PaymentInformation />)}
        </Elements>
    )
}

export default StripePaymentForm
