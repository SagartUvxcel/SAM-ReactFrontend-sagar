
import React, { useEffect, useState } from "react";

let isLogin = false;
let planStatus = false;
let planEndDate = "";


const CommonSubscriptionNotificationMsg = (dayCount, billing_cycle) => {

    const data = JSON.parse(localStorage.getItem("data"));
    const updatedSubscriptionStatus = localStorage.getItem("updatedSubscriptionStatus");

    if (data) {
        isLogin = data.isLoggedIn;
        planStatus = updatedSubscriptionStatus ? updatedSubscriptionStatus : data.subscription_status;
        planEndDate = data.subscription_end_date;
    }
    const [daysCount, setDaysCount] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    // close Notification 
    const closeNotification = () => {
        setShowNotification(false);
    };

    // calculate Days function
    const calculateDays = (expiryDate) => {
        const start = new Date();
        const end = new Date(expiryDate);
        // Calculate the time difference in milliseconds
        const timeDifference = end - start;
        // Calculate the number of days by dividing the time difference by milliseconds per day
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); 
        setDaysCount(days);
        return days;
    };

    useEffect(() => {
        if (isLogin && planStatus && planEndDate) {
            setDaysCount(calculateDays(new Date(planEndDate)));
        }
        //eslint-disable-next-line
    }, [isLogin]);

    useEffect(() => {
        if (planStatus && daysCount <= 7) {
            var notificationStatus = localStorage.getItem('notificationRefresh');
            if (notificationStatus) {
                setShowNotification(false);
            } else {
                localStorage.setItem("notificationRefresh", true);
                setShowNotification(true);
            }
        }
        // eslint-disable-next-line
    }, [planStatus])

    useEffect(() => {
        if (updatedSubscriptionStatus) {
            setShowNotification(false);
        }
        // eslint-disable-next-line
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