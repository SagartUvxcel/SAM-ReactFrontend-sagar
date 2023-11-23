import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/1.CommonLayout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import { checkLoginSession, openInNewTab } from "../CommonFunctions";
import bankRegistrationLinkPage from "../images/bankRegistrationLinkPage.svg";


let authHeader = "";
let bank_Id = "";
let isBank = false;

// regular expression
const emailRegularExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const BankRegistrationLinkPage = () => {

    // Login user details from local storage
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeader = { Authorization: data.loginToken };
        isBank = data.isBank;
        bank_Id = data.bank_id;
    }

    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    // useState to store each field's data from form.
    const [formData, setFormData] = useState({});
    const [validationDetails, setValidationDetails] = useState({});
    // Object destructuring.
    const {
        bankNameValidationMessage,
        emailValidationMessage,
    } = validationDetails;

    // get bank data from API
    const getDataFromApi = async () => {
        const bankRes = await axios.get(`/sam/v1/property/by-bank`);
        setBanks(bankRes.data);
        console.log(bankRes.data);
    };

    // on Input Change Function
    const onInputChange = (e) => {
        const { name, value, style } = e.target;
        console.log(name, value);
        if (name === "bank_name") {
            setFormData({ ...formData, [name]: value });
        } else if (name === "email") {
            if (emailRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    emailValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: value });
            } else {
                setValidationDetails({
                    ...validationDetails,
                    emailValidationMessage: "Invalid Email ID Entered",
                });
                style.borderColor = "red";
            }

        }
    }


    // onFormSubmit function 
    const onFormSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const dataToPost = JSON.stringify(formData);
        console.log(dataToPost);
      
        setLoading(true);
        try {
            await axios.post(`/sam/v1/bank-registration/auth/branch/token`, dataToPost ,{
                headers:authHeader
            })
                .then((res) => {
                    if (res.data.status === 0) {
                        console.log(res);
                        setLoading(false);
                        setFormData({});
                        toast.success("Send Registration Link Successfully !");
                        e.target.reset();
                    } else {
                        setLoading(false);
                        toast.warning("Internal server error");
                    }
                });
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (data) {
            checkLoginSession(data.loginToken).then((res) => {
                if (res === "Valid") {
                    getDataFromApi();
                }
            });
        }
    }, []);


    return (
        <Layout>
            <section className="vh-100 my-5">
                <div className="container-fluid wrapper mt-5">
                    <div className="row d-flex justify-content-evenly align-items-center h-100 mt-lg-5 mb-5">
                        <div className="col-md-5 col-lg-5 col-xl-5  order-lg-1 order-2 mt-lg-5 mt-5 mb-5">
                            <img src={bankRegistrationLinkPage} className="img-fluid w-75 h-100" alt="Sample" />
                        </div>
                        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1 order-lg-2 order-1 mt-lg-0 ms-0 mt-5 ">
                            <form onSubmit={onFormSubmit} className="bank-registration-link-form card position-relative px-5 py-4">

                            <h4 className="text-center fw-bold">Bank Registration Link</h4>
                                <hr />
                                {/* Bank */}
                                <div className="row justify-content-center align-items-center mb-3">
                                    <div className="col-xl-12 col-md-10 mt-3 mt-xl-0">
                                        <div className="form-group d-flex align-items-center">
                                            {/* <div className="form-group mb-4"> */}
                                            <label
                                                className="form-label common-btn-font m-0 me-3"
                                                htmlFor="bank"
                                            >
                                                Bank
                                                <span className="fw-bold text-danger">*</span>
                                            </label>

                                            <select
                                                id="bank"
                                                name="bank_name"
                                                className="form-select  form-bank-select ps-3"
                                                onChange={onInputChange}
                                                placeholder="Select Bank Name"
                                                value={formData.bank_name}
                                                required
                                            >
                                                <option value="" className="text-gray" selected > Select Bank Name</option>
                                                {banks ? (
                                                    banks.map((data) => {
                                                        return (
                                                            <option
                                                                key={data.bank_id}
                                                                value={data.bank_name}
                                                            >
                                                                {data.bank_name}
                                                            </option>
                                                        );

                                                    })
                                                ) : (
                                                    <> </>
                                                )}
                                            </select>

                                        </div>
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="row justify-content-center align-items-center mb-3">
                                    <div className="col-xl-12 col-md-10 mt-3 mt-xl-0">
                                        <div className="form-group d-flex align-items-center">
                                            {/* <div className="form-group mb-4"> */}
                                            <label
                                                className="form-label common-btn-font m-0 me-3"
                                                htmlFor="email"
                                            >
                                                Email
                                                <span className="fw-bold text-danger">*</span>
                                            </label>
                                            <input
                                                onChange={onInputChange}
                                                type="email"
                                                name="email"
                                                className="form-control  "
                                                id="email"
                                                placeholder="Email"
                                                required
                                            />

                                        </div>
                                    </div>
                                </div>
                                <hr/>
                                {/* send Link button */}
                                <div className="row justify-content-center align-items-center mb-3">
                                    <div className=" col-xl-12 col-md-10 text-lg-start pt-2 d-flex justify-content-center  ">
                                        <button
                                            disabled={loading ? true : false}
                                            type="submit" className="btn btn-primary text-center w-100 common-btn-font "
                                        >{loading ? (
                                            <>
                                                <span
                                                    className="spinner-grow spinner-grow-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Sending....
                                            </>
                                        ) : (
                                            "Send Registration Link"
                                        )}
                                        </button>

                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

            </section>
        </Layout>
    )
}

export default BankRegistrationLinkPage