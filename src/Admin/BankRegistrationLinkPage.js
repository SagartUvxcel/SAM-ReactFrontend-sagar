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
const branchNameRegularExp = /^[A-Za-z0-9\s\-&.,'()]+/
const branchCodeRegularExp = /^\d{1,5}$/
const ifscCodeRegularExp = /^[A-Z]{4}0\d{6}$/
const branchSftpRegularExp = /^[A-Za-z0-9_-]+$/

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
        branchNameValidationMessage,
        branchCodeValidationMessage,
        ifscCodeValidationMessage,
        branchSftpValidationMessage,
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

        } else if (name === "branch_name") {
            if (branchNameRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchNameValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: value });
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchNameValidationMessage: "Invalid Branch Name Entered",
                });
                style.borderColor = "red";
            }

        } else if (name === "branch_code") {
            if (branchCodeRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchCodeValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: value });
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchCodeValidationMessage: "Invalid Branch code Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "ifsc_code") {
            if (ifscCodeRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    ifscCodeValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: value });
            } else {
                setValidationDetails({
                    ...validationDetails,
                    ifscCodeValidationMessage: "Invalid IFSC code Entered",
                });
                style.borderColor = "red";
            }
        } else if (name === "branch_sftp") {
            if (branchSftpRegularExp.test(value) || value.length === 0) {
                setValidationDetails({
                    ...validationDetails,
                    branchSftpValidationMessage: "",
                });
                style.borderColor = "";
                setFormData({ ...formData, [name]: value });
            } else {
                setValidationDetails({
                    ...validationDetails,
                    branchSftpValidationMessage: "Invalid SFTP code Entered",
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
            await axios.post(`/sam/v1/bank-registration/auth/branch/token`, dataToPost, {
                headers: authHeader
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
            <section className=" my-5">
                <div className="container-fluid wrapper mt-5">
                    <div className="row d-flex justify-content-evenly align-items-center h-100 mt-lg-5 mb-5">
                        <div className="col-md-4 col-lg-4 col-xl-4  order-lg-1 order-2 mt-lg-5 mt-5 mb-5">
                            <img src={bankRegistrationLinkPage} className="img-fluid w-75 h-100" alt="Sample" />
                        </div>
                        <div className="col-md-8 col-lg-8 col-xl-8 offset-xl-1 order-lg-2 order-1 mt-lg-0 ms-0 mt-5 ">
                            <form onSubmit={onFormSubmit} className="bank-registration-link-form card position-relative px-5 py-4">

                                <h4 className="text-center fw-bold mb-4">Bank Registration Link</h4>

                                <div className="col-lg-12">
                                    <div className="row bank-type-row flex-wrap">
                                        <hr />

                                        {/* <div className="row justify-content-center align-items-center mb-3"> */}
                                        {/* </div> */}

                                        {/* Bank Name */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
                                                    htmlFor="bank"
                                                >
                                                    Bank Name
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
                                        {/* Branch Name */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
                                                    htmlFor="bank"
                                                >
                                                    Branch Name
                                                    <span className="fw-bold text-danger">*</span>
                                                </label>
                                                <input
                                                    onChange={onInputChange}
                                                    // onBlur={onInputBlur}
                                                    name="branch_name"
                                                    type="text"
                                                    placeholder="Branch Name"
                                                    className="form-control"
                                                    required
                                                />
                                                <span
                                                    className={`pe-1 ${branchNameValidationMessage ? "text-danger" : "d-none"
                                                        }`}
                                                >
                                                    {branchNameValidationMessage}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Branch Code */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
                                                    htmlFor="bank"
                                                >
                                                    Branch Code
                                                    <span className="fw-bold text-danger">*</span>
                                                </label>
                                                <input
                                                    onChange={onInputChange}
                                                    // onBlur={onInputBlur}
                                                    name="branch_code"
                                                    type="text"
                                                    placeholder="Branch Code"
                                                    className="form-control"
                                                    required
                                                />
                                                <span
                                                    className={`pe-1 ${branchCodeValidationMessage ? "text-danger" : "d-none"
                                                        }`}
                                                >
                                                    {branchCodeValidationMessage}
                                                </span>

                                            </div>
                                        </div>
                                        {/* IFSC code */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
                                                    htmlFor="bank"
                                                >
                                                    IFSC code
                                                    <span className="fw-bold text-danger">*</span>
                                                </label>
                                                <input
                                                    onChange={onInputChange}
                                                    // onBlur={onInputBlur}
                                                    name="ifsc_code"
                                                    type="text"
                                                    placeholder=" IFSC Code"
                                                    className="form-control"
                                                    required
                                                />
                                                <span
                                                    className={`pe-1 ${ifscCodeValidationMessage ? "text-danger" : "d-none"
                                                        }`}
                                                >
                                                    {ifscCodeValidationMessage}
                                                </span>

                                            </div>
                                        </div>
                                        {/* Branch SFTP */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
                                                    htmlFor="bank"
                                                >
                                                    Branch SFTP
                                                    <span className="fw-bold text-danger">*</span>
                                                </label>
                                                <input
                                                    onChange={onInputChange}
                                                    // onBlur={onInputBlur}
                                                    name="branch_sftp"
                                                    type="text"
                                                    placeholder=" Branch SFTP"
                                                    className="form-control"
                                                    required
                                                />
                                                <span
                                                    className={`pe-1 ${branchSftpValidationMessage ? "text-danger" : "d-none"
                                                        }`}
                                                >
                                                    {branchSftpValidationMessage}
                                                </span>

                                            </div>
                                        </div>
                                        {/* Email */}
                                        {/* <div className="row justify-content-center align-items-center mb-3"> */}
                                        <div className="col-xl-6 col-md-6 mt-3 mt-xl-0 mb-3">
                                            <div className="form-group d-flex align-items-center flex-wrap">
                                                {/* <div className="form-group mb-4"> */}
                                                <label
                                                    className="form-label common-btn-font m-0 me-1"
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
                                                <span
                                                    className={`pe-1 ${emailValidationMessage ? "text-danger" : "d-none"
                                                        }`}
                                                >
                                                    {emailValidationMessage}
                                                </span>
                                                

                                            </div>
                                        </div>
                                        {/* </div> */}
                                        <hr />
                                        {/* send Link button */}
                                        <div className="row justify-content-center align-items-center ">
                                            <div className=" col-xl-12 col-md-10 text-lg-start pt-2 d-flex justify-content-center  ">
                                                <button
                                                    disabled={loading ? true : false}
                                                    type="submit" className="btn btn-primary text-center  md-w-50 common-btn-font "
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