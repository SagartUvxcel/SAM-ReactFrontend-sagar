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

    const closeNotification = () => {
        console.log("hi");
        console.log(showNotification);

        setShowNotification(false);
    };

    if (daysCount) {

        console.log(daysCount);
        console.log(showNotification);
    }


    useEffect(() => {
        if (isLogin && planStatus) {
            calculateDays(new Date(planEndDate));
            setExpiryDate(new Date(planEndDate));
            setDaysCount(calculateDays(new Date(planEndDate)));
            setShowNotification(true);
            // if (daysCount > 5) {
            //   toast.warning("Your subscription will expire in 5 days!")
            // } else if (daysCount === 0) {
            //   toast.warning("Your subscription will expire today!")
            // }
            console.log(isLogin);
            console.log(planEndDate);
            console.log(planStatus);
            console.log(showNotification);



        }


    }, [isLogin, planStatus])

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                closeNotification();
            }, 10000);

            // Set the timer to close the notification after 2 seconds
            return () => clearTimeout(timer); // Clean up the timer on unmount
        }
    }, [showNotification]);

    return (
        <>
            {isLogin && planStatus && showNotification && daysCount < 5 ? (
                <div className="subscription-notification-container mb-5 ">
                    <button className="btn btn-warning">
                        {daysCount === 0 ? "Your subscription will expire today.   " : `Your subscription will expire in ${5} days! `}

                        <i
                            className="bi bi-x-lg text-black"
                            onClick={closeNotification}
                        ></i>
                    </button>
                </div>)
                : ("")}
        </>
    )
}

export default CommonSubscriptionNotificationMsg