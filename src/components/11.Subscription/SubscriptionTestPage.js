import React from 'react'
import { useState, useRef, useEffect } from 'react';
import PlanSelector from './TestFolder/PlanSelector';
import SubscribeButton from './TestFolder/SubscribeButton';
import "./CardElementStyles.css"

const SubscriptionTestPage = () => {

    const subscriptionPlansTableRef = useRef(null);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [isChecked, setIsChecked] = useState(false);

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
    };

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

    const handleDurationSelect = (duration) => {
        setSelectedDuration(duration);
    };

    useEffect(() => {
        handleActiveColumn(1);
    }, []);



    const check = (e) => {
        var checkBox = document.getElementById("checbox");
        var text1 = document.getElementsByClassName("text1");
        var text2 = document.getElementsByClassName("text2");
        const { checked } = e.target;
        setIsChecked(checked);
        console.log(checked);
        // for (var i = 0; i < text1.length; i++) {
        //     if (checked === true) {
        //         text1[i].style.display = "block";
        //         text2[i].style.display = "none";
        //     } else if (checked === false) {
        //         text1[i].style.display = "none";
        //         text2[i].style.display = "block";
        //     }
        // }
    }


    return (
        <>



            {/* TEST cards */}
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
                                            <th className="standard">ADVANCED</th>
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
                            <PlanSelector
                                selectedPlan={selectedPlan}
                                selectedDuration={selectedDuration}
                                onPlanSelect={handlePlanSelect}
                                onDurationSelect={handleDurationSelect}
                                onActiveColumnSelect={handleActiveColumn}
                            />


                            {/* subscription button */}
                            <div className={`row mt-md-5 mb-5 `}>
                                <div className="col-md-10 m-auto">

                                    <SubscribeButton selectedPlan={selectedPlan} selectedDuration={selectedDuration} />
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

            </div>



            {/* 2nd */}

            <div className="container my-5 border-top-1">
                <div className="top">
                    <h1>Subscription Plans</h1>
                    <div className="toggle-btn">
                        <span >Annually  </span>
                        <label className="switch">
                            <input type="checkbox" checked={isChecked} id="checbox" onChange={check} />
                            <span className="slider round"></span>
                        </label>
                        <span > Monthly</span></div>
                </div>

                <div className="package-container">
                    <div className="packages">
                        <h2>Free</h2>
                        <h4 className="text1">RS. 0</h4>
                        <a href="#" className="button button1">Start Now</a>
                    </div>
                    <div className="packages">
                        <h2>Basic</h2>
                        <h4 className="text1">RS. 1999</h4>
                        <a href="#" className="button button2">Start Now</a>
                    </div>
                    <div className="packages">
                        <h2>Advanced</h2>
                        <h4 className="text1">RS. 2999</h4>
                        <a href="#" className="button button3">Start Now</a>
                    </div>
                </div>
            </div>



        </>
    )
}

export default SubscriptionTestPage