import React, { useEffect, useRef, useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";



let authHeaders = "";
let isLogin = false;
let planStatus = false;
let planEndDate = "";

const UpgradeSubscriptionPage = () => {
    const navigate = useNavigate();

    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeaders = { Authorization: data.loginToken };
        isLogin = data.isLoggedIn;
        planStatus = data.subscription_status;
        planEndDate = data.subscription_end_date;
    }

    // subscription Plans
    const [plans, setPlans] = useState(); //all subriction plans
    const [planToDisable, setPlanToDisable] = useState(); //all active plans
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [subscriptionPlanStatus, setSubscriptionPlanStatus] = useState(planStatus);
    const [upGradePlanStatus, setUpGradePlanStatus] = useState(true);
    const [planCardDisable, setPlanCardDisable] = useState({
        basicCardDisable: false,
        advancedCardDisable: false,
    });
    const { basicCardDisable, advancedCardDisable } = planCardDisable;


    const [selectedBillingCycle, setSelectedBillingCycle] = useState({
        halfYearlyCycleSelected: true,
        annualCycleSelected: false,
    });
    const { halfYearlyCycleSelected, annualCycleSelected } = selectedBillingCycle;

    const [plansOnCard, setPlansOnCard] = useState({
        basicPlanOnCard: null,
        advancedPlanOnCard: null,
    });
    const { basicPlanOnCard, advancedPlanOnCard } = plansOnCard;


  

    // get Subscription Plans Details from database
    const getSubscriptionPlansDetails = async () => {
        try {
            // Fetch plans from API URL
            axios
                .get("/sam/v1/customer-registration/auth/subscription-plans", {
                    headers: authHeaders,
                })
                .then((response) => {
                    // console.log(response.data);
                    const plansRes = response.data;
                    if (plansRes) {
                        setPlans(plansRes);
                    }
                });
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
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
                    // console.log(response.data);
                    const activePlansRes = response.data;
                    if (activePlansRes) {
                        console.log(response.data);
                        setPlanToDisable(activePlansRes);
                    }
                });
        } catch (error) {
            console.error("Error fetching plans:", error);
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
        basicAnnual,
        basicFreeTrial,
        advancedHalfYearly,
        advancedAnnual,
    } = individualPlanDetails;

    // on click function 6 month button
    const onHalfYearlyBtnClick = () => {
        setPlansOnCard({
            basicPlanOnCard: basicHalfYearly,
            advancedPlanOnCard: advancedHalfYearly,
        });
        setSelectedBillingCycle({
            halfYearlyCycleSelected: true,
            annualCycleSelected: false,
        });
        setSelectedPlan(basicHalfYearly);
        testFunction();
    };

    // on click function annual button
    const onAnnualBtnClick = () => {
        setPlansOnCard({
            basicPlanOnCard: basicAnnual,
            advancedPlanOnCard: advancedAnnual,
        });

        setSelectedBillingCycle({
            halfYearlyCycleSelected: false,
            annualCycleSelected: true,
        });
        setSelectedPlan(basicAnnual);
        testFunction();
    };

    // on click function basic card
    const onBasicCardClick = () => {
        if (halfYearlyCycleSelected) {
            setSelectedPlan(basicHalfYearly);
        } else if (annualCycleSelected) {
            setSelectedPlan(basicAnnual);
        }
    };

    // on click function annual card
    const onAdvancedCardClick = () => {
        if (halfYearlyCycleSelected) {
            setSelectedPlan(advancedHalfYearly);
        } else if (annualCycleSelected) {
            setSelectedPlan(advancedAnnual);
        }
    };

    // passing subscription data plans details on payment page
    const onSubscribeClick = () => {
        const sensitiveData = selectedPlan;
        navigate("/subscription/payment", { state: { sensitiveData } });
        // console.log(sensitiveData);

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

    const testFunction = () => {
        let disablePlanBillingCycle;
        let disablePlanName;
        if (planToDisable) {
            disablePlanBillingCycle = planToDisable.billing_cycle;
            disablePlanName = planToDisable.plan_name;
        }

        if (plansOnCard) {
            for (let key in plansOnCard) {
                if (plansOnCard.hasOwnProperty(key)) {
                    let plan = plansOnCard[key];
                    if (plan) {
                        if (plan.name === disablePlanName && plan.billing_cycle === disablePlanBillingCycle) {
                            if (halfYearlyCycleSelected && disablePlanBillingCycle === "half yearly") {
                                if (plan.name === "Advanced plan") {
                                    setPlanCardDisable({
                                        basicCardDisable: false,
                                        advancedCardDisable: true,
                                    })
                                } else if (plan.name === "Basic plan") {
                                    setPlanCardDisable({
                                        basicCardDisable: true,
                                        advancedCardDisable: false,
                                    })
                                }
                            } else if (annualCycleSelected && disablePlanBillingCycle === "annual") {
                                if (plan.name === "Advanced plan") {
                                    setPlanCardDisable({
                                        basicCardDisable: false,
                                        advancedCardDisable: true,
                                    })
                                } else if (plan.name === "Basic plan") {
                                    setPlanCardDisable({
                                        basicCardDisable: true,
                                        advancedCardDisable: false,
                                    })
                                }
                            } else {
                                setPlanCardDisable({
                                    basicCardDisable: false,
                                    advancedCardDisable: false,
                                })
                            }
                            console.log("planToDisable", plan);

                        } else {
                            console.log("NOT planToDisable", plan);
                            // setPlanCardDisable({
                            //     basicCardDisable: false,
                            //     advancedCardDisable: false,
                            // })

                        }
                    }

                }

            }
        }



        // const logTest = findPlanByNameAndCycle(disablePlanName, disablePlanBillingCycle);
        // console.log(logTest);
        // if (disablePlanBillingCycle === "half yearly") {
        //     if (halfYearlyCycleSelected) {
        //         if (disablePlanName === "Basic plan") {
        //             if (basicPlanOnCard) {
        //                 basicPlanOnCard.disabled = true;
        //                 console.log(basicPlanOnCard);
        //             }
        //         } else {
        //             console.log(disablePlanName);
        //         }
        //     }
        // } else if (disablePlanBillingCycle === "annual") {
        //     if (annualCycleSelected) {
        //         console.log(disablePlanName);
        //     }
        // }
    }

    useEffect(() => {
        console.log("called");
        testFunction();
    }, [halfYearlyCycleSelected, annualCycleSelected, plansOnCard, basicPlanOnCard, advancedPlanOnCard, basicCardDisable, advancedCardDisable]);








    // default select card 
    useEffect(() => {
        console.log(planToDisable)
        setSelectedPlan(basicHalfYearly);

    }, [basicHalfYearly]);

    useEffect(() => {
        setPlansOnCard({
            basicPlanOnCard: basicHalfYearly,
            advancedPlanOnCard: advancedHalfYearly,
        });
    }, [basicHalfYearly, advancedHalfYearly]);

    // useEffect for axios
    useEffect(() => {
        handleActiveColumn(1);
        if (isLogin) {
            getSubscriptionPlansDetails();
            if (planStatus) {
                getActivePlansDetails();
            }
        }
    }, []);

    return (
        <Layout>
            <section className="subscription-wrapper section-padding min-100vh">
                {/* if user Login */}
                {isLogin ? (
                    <>
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
                                    <div
                                        className={`plan-select-btn d-flex justify-content-center align-items-center ${halfYearlyCycleSelected ? "active" : ""
                                            }`}
                                        name="individual"
                                        onClick={onHalfYearlyBtnClick}
                                    >
                                        6 Month
                                    </div>
                                    <div className="mx-4 d-flex justify-content-center align-items-center">
                                        |
                                    </div>
                                    <div
                                        className={`plan-select-btn d-flex justify-content-center align-items-center ${annualCycleSelected ? "active" : ""
                                            }`}
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
                                                            Lorem ipsum dolor sit amet consectetur
                                                            adipisicing.
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
                                                            Lorem ipsum dolor sit.
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
                                                {/* basic card */}
                                                <div className={`col-md-6 mb-4 mb-md-0 plan-card-1 `}>
                                                    <button
                                                        className={`w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4 ${basicCardDisable ? "disabled" : ""}`}
                                                        disabled={basicCardDisable}
                                                        onClick={() => {
                                                            handleActiveColumn(1);
                                                            onBasicCardClick();
                                                        }}
                                                    >
                                                        <span
                                                            className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlan &&
                                                                selectedPlan.name === "Basic plan"
                                                                ? ""
                                                                : "d-none"
                                                                }`}
                                                        >
                                                            <i className="bi bi-check-circle-fill"></i>
                                                        </span>
                                                        <h4 className="plan-title mb-4 fw-bold text-uppercase">
                                                            Basic
                                                        </h4>
                                                        <h3 className="fw-bold plan-price">
                                                            <sup>&#8377;</sup>
                                                            {basicPlanOnCard ? basicPlanOnCard.price : ""}
                                                        </h3>
                                                    </button>
                                                </div>
                                                {/* advance card  */}
                                                <div className={`col-md-6 mb-4 mb-md-0 plan-card-2`}>
                                                    <button
                                                        className={`w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4 ${advancedCardDisable ? "disabled" : ""}`}
                                                        disabled={advancedCardDisable}
                                                        onClick={() => {
                                                            handleActiveColumn(2);
                                                            onAdvancedCardClick();
                                                        }}
                                                    >
                                                        <span
                                                            className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlan &&
                                                                selectedPlan.name === "Advanced plan"
                                                                ? ""
                                                                : "d-none"
                                                                }`}
                                                        >
                                                            <i className="bi bi-check-circle-fill"></i>
                                                        </span>
                                                        <h4 className="plan-title mb-4 fw-bold text-uppercase">
                                                            Advanced
                                                        </h4>
                                                        <h3 className="fw-bold plan-price">
                                                            <sup>&#8377;</sup>
                                                            {advancedPlanOnCard
                                                                ? advancedPlanOnCard.price
                                                                : ""}
                                                        </h3>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* subscription button */}
                                        <div className="row mt-md-5 justify-content-center">
                                            <div className="col-md-6 ">
                                                <button
                                                    className="w-100 btn btn-primary text-capitalize common-btn-font"
                                                    onClick={onSubscribeClick}
                                                >
                                                    Upgrade to{" "}
                                                    {selectedPlan && selectedPlan.name === "Advanced plan"
                                                        ? "Advance"
                                                        : "Basic"}
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </div>
                                            {/* <div className="col-md-6 mt-4 mt-md-0">
                                                <button
                                                    className="w-100 btn btn-outline-primary text-capitalize common-btn-font"
                                                    onClick={onFreeTrialClick}
                                                >
                                                    Free Trial -{" "}
                                                    {selectedPlan && selectedPlan.name === "Advanced plan"
                                                        ? "Advance"
                                                        : "Basic"}
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </div> */}
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
