import { checkLoginSession, rootTitle, calculateDays } from "../../CommonFunctions";
import axios from "axios";
import React, { useEffect, useState } from "react";

let authHeaders = "";
let isLogin = false;
let planStatus = false;
let planEndDate = "";


const CommonSubscriptionNotificationMsg = (dayCount, billing_cycle) => {

    const data = JSON.parse(localStorage.getItem("data"));
    const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");

    if (data) {
        authHeaders = { Authorization: data.loginToken };
        isLogin = data.isLoggedIn;
        planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
        planEndDate = data.subscription_end_date;
    }


    const [expiryDate, setExpiryDate] = useState(null);
    const [daysCount, setDaysCount] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [showUpdatedSubscriptionStatus, setShowUpdatedSubscriptionStatus] = useState(updatedSubscriptionStatus);

    // get Subscription Plans Details from database


    const closeNotification = () => {
        setShowNotification(false);
    };


    useEffect(() => {
        if (isLogin && planStatus && planEndDate) {

            setDaysCount(calculateDays(new Date(planEndDate)));
            setExpiryDate(planEndDate);
            // console.log(planEndDate);
            // console.log(calculateDays(new Date(planEndDate)));

            // console.log(showNotification );
            // setShowNotification(true);
        }
    }, [isLogin]);

    useEffect(() => {
        // console.log(showUpdatedSubscriptionStatus);
        // console.log(planStatus);
        // console.log(daysCount);


        if (planStatus && daysCount <= 7) {
            setShowNotification(true);
        }


    }, [planStatus])

    useEffect(() => {
        console.log(showUpdatedSubscriptionStatus);
        console.log(planStatus);
        console.log(daysCount);
        console.log("upgraded plans text");


        if (updatedSubscriptionStatus) {
            setShowNotification(false);
        }


    }, [planStatus]);

    useEffect(() => {

        if (showNotification && daysCount >= 3 && daysCount <= 7) {

            const timer = setTimeout(() => {
                closeNotification();
            }, 10000);

            // Set the timer to close the notification after 2 seconds
            return () => clearTimeout(timer); // Clean up the timer on unmount
        }
    }, [showNotification, daysCount]);

    return (
        <>
            {isLogin && planStatus && showNotification && daysCount <= 7 ? (
                <div className="subscription-notification-container mb-5 ">
                    <button className={`btn ${daysCount <= 2 ? "btn-danger" : "btn-warning"}`}>
                        {daysCount === 0 ? "Your subscription will expire today.   " : `Your subscription will expire in ${daysCount} days! `}

                        <i
                            className="bi bi-x-lg text-white"
                            onClick={closeNotification}
                        ></i>
                    </button>
                </div >)
                : ("")}
        </>
    )
}

export default CommonSubscriptionNotificationMsg