// PlanSelector.js
import React from 'react';

const PlanSelector = ({ selectedPlan, selectedDuration, onPlanSelect, onDurationSelect,onActiveColumnSelect }) => {
    return (
        <div className="mt-5">
            <h2>Subscription Plan:</h2>
            <div className="container-fluid mt-3">
                <div className="row justify-content-between">
                    {/* basic card */}
                    <div className={`col-md-6 mb-4 mb-md-0 plan-card-1`}>
                        <button
                            className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                            onClick={() => {
                                // handleActiveColumn(1);
                                // onBasicCardClick();
                                onPlanSelect('basic')
                                onActiveColumnSelect(1);
                            }}
                        >
                            <label>
                                <input
                                    type="radio"
                                    value="basic"
                                    className='me-5'
                                    checked={selectedPlan === 'basic'}
                                // onChange={() => onPlanSelect('basic')}
                                />
                                Basic
                            </label>

                        </button>

                    </div>

                    <div className={`col-md-6 mb-4 mb-md-0 plan-card-2`}>
                        <button
                            className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                            onClick={() => {
                                // handleActiveColumn(1);
                                // onBasicCardClick();
                                onPlanSelect('premium');
                                onActiveColumnSelect(2);
                            }}
                        >
                            <label>
                                <input
                                    type="radio"
                                    value="premium"
                                    className='me-5'
                                    checked={selectedPlan === 'premium'}
                                // onChange={() => }
                                />
                                Advanced
                            </label>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`container-fluid mt-3`}>
                <div className="row justify-content-between">
                    <h4 className={`col-md-4 my-4 mb-md-0 plan-card-1 `}>Select Duration:</h4>
                    <div className={`col-md-4 my-4 mb-md-0 plan-card-1`}>
                        <button
                            className="w-100 shadow plan-header-wrapper border-0 p-2 position-relative mb-4"
                            onClick={() => {
                                // handleActiveColumn(1);
                                // onBasicCardClick();
                                onDurationSelect('6 months');
                                onDurationSelect('6 months');
                            }}
                        >
                            <label>
                                <input
                                    type="radio"
                                    value=" 6 months"
                                    className='me-3'
                                    checked={selectedDuration === '6 months'}
                                // onChange={() => onDurationSelect('6 months')}
                                />
                                6 Months
                            </label>
                        </button>

                    </div>
                    <div className={`col-md-4 my-4 mb-md-0 plan-card-2`}>
                        <button
                            className="w-100 shadow plan-header-wrapper border-0 p-2 position-relative mb-4"
                            onClick={() => {
                                // handleActiveColumn(1);
                                // onBasicCardClick();
                                onDurationSelect('annual');
                            }}
                        >
                            <label>
                                <input
                                    type="radio"
                                    value="annual"
                                    className='me-3'
                                    checked={selectedDuration === 'annual'}
                                    onChange={() => onDurationSelect('annual')}
                                />
                                Annual
                            </label>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanSelector;
