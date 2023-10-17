import React,{useState} from 'react'
import Layout from "../components/1.CommonLayout/Layout";
import CommonFormFields from "../components/7.Registration/CommonFormFields";


const BankRegistrationPage = () => {

    const [validationDetails, setValidationDetails] = useState({});

    return (
        <Layout>
            <section className="registration-wrapper min-100vh section-padding">
                <div className="container-fluid">
                    <div className="row justify-content-center ">
                        <div className="col-lg-12 mt-4">
                            <div className="card form-wrapper-card shadow pt-3 pb-5 ps-lg-3 ps-0">
                                <div className="container-fluid registration-form-container">
                                    <div className="row">
                                        {/* Bank Main Form */}
                                        <form
                                            id="bankForm"
                                            // onSubmit={onBankFormSubmit}
                                            action=""
                                            // className={`row ${bankDisplay} BankForm`}
                                        >
                                            <div className="col-lg-12">
                                                <div className="row bank-type-row">
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        Bank Name
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        <select
                                                            // onChange={onInputChange}
                                                            name="bank"
                                                            id="bank"
                                                            className="form-select"
                                                            aria-label="Default select example"
                                                            required
                                                        >
                                                            <option value="" style={{ color: "lightgrey" }}>
                                                                Select Bank</option>
                                                            {/* {banks ? (
                                                                banks.map((data) => {
                                                                    return (
                                                                        <option
                                                                            key={data.bank_id}
                                                                            value={data.bank_id}
                                                                        >
                                                                            {data.bank_name}
                                                                        </option>
                                                                    );
                                                                })
                                                            ) : (
                                                                <></>
                                                            )} */}
                                                        </select>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        Branch Name
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        <select
                                                            id="bank_name"
                                                            name="bank_name"
                                                            className="form-select"
                                                            // onChange={onInputChange}
                                                            required
                                                        >
                                                            <option value=""></option>
                                                            {/* {bankBranches ? (
                                                                bankBranches.map((data) => {
                                                                    return (
                                                                        <option
                                                                            key={data.branch_id}
                                                                            value={data.branch_id}
                                                                        >
                                                                            {data.branch_name}
                                                                        </option>
                                                                    );
                                                                })
                                                            ) : (
                                                                <></>
                                                            )} */}
                                                        </select>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        Branch Code
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        <input
                                                            // onBlur={onInputBlur}
                                                            name="branch_code"
                                                            type="text"
                                                            placeholder="Branch Code"
                                                            className="form-control"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row branch_sftp mt-lg-3 mt-2">
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        IFSC code
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        <input
                                                            // onBlur={onInputBlur}
                                                            name="ifsc_code"
                                                            type="text"
                                                            placeholder=" IFSC code"
                                                            className="form-control"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        Branch SFTP
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        <input
                                                            // onBlur={onInputBlur}
                                                            name="branch_sftp"
                                                            type="text"
                                                            placeholder=" Branch SFTP"
                                                            className="form-control"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-lg-2 mb-lg-0 mb-2">
                                                        Branch UUID
                                                        <span className="text-danger fw-bold">*</span>
                                                    </div>
                                                    <div className="col-lg-2">
                                                        <input
                                                            // onChange={onInputChange}
                                                            name="branch_UUID"
                                                            type="text"
                                                            placeholder="Branch UUID"
                                                            className="form-control "
                                                            required
                                                        />
                                                        {/* <span
                                                            className={`pe-1 ${gstValidationMessage ? "text-danger" : "d-none"
                                                                }`}
                                                        >
                                                            {gstValidationMessage}
                                                        </span> */}
                                                    </div>
                                                </div>


                                                {/* <CommonFormFields
                                                    // validationDetails={}
                                                    // resetValues={}
                                                    // addressValues={}
                                                    // onInputChange={}
                                                    // onInputBlur={}
                                                    // loading={}
                                                    // onMobileNumberInputBlur={}
                                                    // onMobileNumberInputChange={}
                                                /> */}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default BankRegistrationPage