{
    plans &&
        plans.map((plans, Index) => {
            {/* let plan = plansData[key]; */ }
            return (
                <div
                    className={`col-md-6 mb-4 mb-md-0 plan-card-${Index + 1
                        }`}
                    key={Index}
                >
                    <button
                        className="w-100 shadow plan-header-wrapper border-0 p-4 position-relative mb-4"
                        onClick={() => {
                            setSelectedPlanDetails({
                                selectedPlanId: plans.plan_id,
                                selectedPlanName: plans.name,
                                selectedPlanAmount: plans.price,
                            });
                            handleActiveColumn(Index + 1);
                        }}
                    >
                        <span
                            className={`position-absolute top-0 start-100 translate-middle badge  bg-success ${selectedPlanDetails.selectedPlanName === plans.name
                                ? ""
                                : "d-none"
                                }`}
                        >
                            <i className="bi bi-check-circle-fill"></i>
                        </span>
                        <h4 className="plan-title mb-4 fw-bold text-uppercase">
                            {plans.name.replace(' plan', '')}
                        </h4>
                        <h3 className="fw-bold plan-price">
                            <sup>&#8377;</sup>
                            {plans.price}
                            {/* <sub className="fs-6 fw-normal">/YEAR</sub> */}
                        </h3>
                    </button>
                </div>
            );
        })
}