// import { checkLoginSession, rootTitle, calculateDays } from "../../CommonFunctions";
// import axios from "axios";
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
    // console.log(daysCount);

    const closeNotification = () => {
        setShowNotification(false);
    };

    const calculateDays = (expiryDate) => {
        const start = new Date();
        const end = new Date(expiryDate);
        // Calculate the time difference in milliseconds
        const timeDifference = end - start;

        // Calculate the number of days by dividing the time difference by milliseconds per day
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        // console.log(days);
        setDaysCount(days);
        return days;
    };

    useEffect(() => {
        if (isLogin && planStatus && planEndDate) {
            // console.log(calculateDays(new Date(planEndDate)));
            // console.log(new Date(planEndDate));
            setDaysCount(calculateDays(new Date(planEndDate)));
            setExpiryDate(planEndDate);
        }
    }, [isLogin]);

    useEffect(() => {
        if (planStatus && daysCount <= 7) {
            // console.log(daysCount);
            var notificationStatus = localStorage.getItem('notificationRefresh');
            // console.log(notificationStatus);
            if (notificationStatus) {
                setShowNotification(false);
                // console.log(notificationStatus);
            } else {

                localStorage.setItem("notificationRefresh", true);
                setShowNotification(true);
                // console.log(notificationStatus);
            }
        }


    }, [planStatus])

    useEffect(() => {
        if (updatedSubscriptionStatus) {
            setShowNotification(false);
        }
    }, [planStatus]);

    useEffect(() => {
        // console.log(daysCount);
        if (showNotification && daysCount >= 3 && daysCount <= 7) {
            // console.log(daysCount);
            const timer = setTimeout(() => {
                closeNotification();
            }, 10000);

            // Set the timer to close the notification after 2 seconds
            return () => clearTimeout(timer); // Clean up the timer on unmount
        }
    }, [showNotification, daysCount]);

    return (
        <>
            {isLogin && planStatus && showNotification && daysCount !== null && daysCount <= 7 ? (
                <div className="subscription-notification-container mb-5 ">
                    <button className={`btn ${daysCount <= 2 ? "btn-danger" : "btn-warning"}`}>
                        {daysCount === 0 ? "Your subscription will expire today." : `Your subscription will expire in ${daysCount} days! `}

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