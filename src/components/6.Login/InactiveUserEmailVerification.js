import React, { useState, useRef, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import resetPassImg from "../../images/activate_account.svg";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    LoadCanvasTemplate,
    loadCaptchaEnginge,
    validateCaptcha,
} from "react-simple-captcha";

const InactiveUserEmailVerification = () => {
    const goTo = useNavigate();

    const [emailValue, setEmailValue] = useState("");
    const [alertDetails, setAlertDetails] = useState({
        alertVisible: false,
        alertMsg: "",
        alertClr: "",
    });

    const [displayOfSections, setDisplayOfSections] = useState({
        mainSectionDisplay: "",
        afterSubmitSectionDisplay: "d-none",
    });

    const [loading, setLoading] = useState(false);
    const { alertMsg, alertClr, alertVisible } = alertDetails;
    const { mainSectionDisplay, afterSubmitSectionDisplay } = displayOfSections;
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [captchaErr, setCaptchaErr] = useState(false);
    const captchaRef = useRef();

    // captcha submit button function
    const onCaptchaSubmit = (e) => {
        e.preventDefault();
        let user_captcha = captchaRef.current.value;
        if (user_captcha) {
            if (validateCaptcha(user_captcha) === true) {
                setCaptchaVerified(true);
                setCaptchaErr(false);
                loadCaptchaEnginge(6);
                captchaRef.current.value = "";
            } else {
                setCaptchaVerified(false);
                setCaptchaErr(true);
                captchaRef.current.value = "";
            }
        }
    };

    // on input focus
    const handleFocus = (e) => {
        e.target.nextSibling.classList.add('active');
    };

    // on click on label
    const handleClick = (inputId) => {
        const input = document.getElementById(inputId);
        input.focus();
    };

    // on input blur
    const onInputBlur = async (e) => {
        const { value } = e.target;
        if (!value) {
            e.target.nextSibling.classList.remove('active');
        }
    }

    // on change function
    const emailOnChange = (e) => {
        const { value } = e.target;
        var emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailFormat.test(value)) {
            setAlertDetails({
                alertVisible: true,
                alertMsg: "Invalid email Id",
                alertClr: "danger",
            });
        } else {
            setEmailValue(value);
            setAlertDetails({
                alertVisible: false,
                alertMsg: "",
                alertClr: "",
            });
        }

    }

    // onclick reset password button
    const onClickActivateAccountBtn = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (captchaVerified) {
            try {
                await axios
                    .put(
                        `/sam/v1/customer-registration/activate-account/token`,
                        JSON.stringify({ username: emailValue })
                    )
                    .then((res) => {
                        if (res.data.status === 0) {
                            e.target.reset();
                            toast.success(
                                `Success: Please check your email for account activation link.`
                            );
                            goTo("/login");
                            setLoading(false);
                        } else {
                            setLoading(false);
                            setAlertDetails({
                                alertVisible: true,
                                alertClr: "danger",
                                alertMsg:
                                    "Email address is either invalid or not a verified email address",
                            });
                        }
                    });
            } catch (error) {
                setLoading(false);
                setAlertDetails({
                    alertVisible: true,
                    alertClr: "warning",
                    alertMsg: "Email address is either invalid or not a verified email address",
                });
            }
        } else {
            setCaptchaVerified(false);
            setCaptchaErr(true);
            captchaRef.current.value = "";
            setLoading(false);
        }
    };

    // load captcha button function
    const loadCaptchaOnRefresh = () => {
        loadCaptchaEnginge(6);
        const captchaWrapper =
            document.getElementById("captcha-wrapper").firstChild;
        captchaWrapper.classList.add("flexAndCenter");
        document.getElementById("reload_href").classList.add("d-none");
    };

    useEffect(() => {
        loadCaptchaOnRefresh();
        setDisplayOfSections({
            mainSectionDisplay: "",
            afterSubmitSectionDisplay: "d-none",
        })
    }, []);
    return (
        <Layout>
            <section className="inactive-account-wrapper section-padding min-100vh">
                <div className="container wrapper">
                    <div
                        className={`row justify-content-lg-between justify-content-center ${mainSectionDisplay}`}
                    >
                        <div className="col-xl-5 col-lg-5 col-md-8 order-2 order-lg-1 mt-lg-0 mt-5">
                            <img src={resetPassImg} alt="" className="set-pass-img" />
                        </div>
                        <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2">
                            <form
                                onSubmit={onClickActivateAccountBtn}
                                className="card shadow justify-content-center p-4 p-md-5"
                            >
                                <h3 className="text-center fw-bold">Activate account</h3>
                                <hr />
                                {/* alert msg show div */}
                                <div
                                    className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? "" : "d-none"
                                        }`}
                                    role="alert"
                                >
                                    <span>
                                        <i
                                            className={`bi bi-exclamation-triangle-fill me-2 ${alertClr === "danger" || alertClr === "warning"
                                                ? ""
                                                : "d-none"
                                                }`}
                                        ></i>
                                    </span>
                                    <small className="fw-bold">{alertMsg}</small>
                                    <i
                                        onClick={() => setAlertDetails({ alertVisible: false })}
                                        className="bi bi-x login-alert-close-btn close"
                                    ></i>
                                </div>
                                {/* email verification label text */}
                                <label htmlFor="email" className="form-label text-secondary common-label-text-fontSize common-btn-font mb-4 ft-6">
                                    Enter your user account's verified email address and we will
                                    send you a account activation link.
                                </label>

                                {/* email */}
                                <div className="form-group mb-3 custom-class-form-div">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="form-control inactive-account-form-control custom-input"
                                        onChange={emailOnChange}
                                        onBlur={onInputBlur}
                                        onFocus={handleFocus}
                                        required
                                    />
                                    <label className="ps-0 " htmlFor="email" onClick={() => handleClick('email')} >Email </label>
                                </div>
                                {/* captcha code */}
                                <div
                                    className={`container ${captchaVerified ? "d-none" : ""
                                        }`}
                                >
                                    <div className="row">
                                    {/* captcha mapping button */}
                                        <div
                                            className="col-xl-9 col-md-8 col-7 ps-0"
                                            id="captcha-wrapper"
                                        >
                                            <LoadCanvasTemplate />
                                        </div>
                                        {/* load captcha button */}
                                        <div className="col-xl-3 col-md-4 col-5 btn btn-primary">
                                            <i
                                                onClick={() => {
                                                    loadCaptchaEnginge(6);
                                                }}
                                                className="bi bi-arrow-clockwise"
                                            ></i>
                                        </div>
                                        {/* enter captcha input */}
                                        <div className="col-xl-9 col-md-8 col-7 ps-0 mt-3 custom-class-form-div">
                                            <input
                                                type="text"
                                                name="captcha"
                                                id="captcha"
                                                className={`form-control custom-input ${captchaErr ? "border-danger" : "border-primary"
                                                    }`}
                                                ref={captchaRef}
                                                onBlur={onInputBlur}
                                                onFocus={handleFocus}
                                            />
                                            <label className="ps-0 " htmlFor="captcha" onClick={() => handleClick('captcha')} >Enter captcha </label>
                                        </div>
                                        {/* verify btn*/}
                                        <div
                                            onClick={onCaptchaSubmit}
                                            className="col-xl-3 col-md-4 col-5 btn btn-primary mt-3"
                                        >
                                            Verify
                                        </div>
                                        {/* alert msg */}
                                        <div
                                            className={`col-xl-9 ps-0 ${captchaErr ? "" : "d-none"
                                                }`}
                                        >
                                            <span className="text-danger">Invalid Captcha</span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`form-group mt-3 ${captchaVerified ? "" : "d-none"
                                        }`}
                                >
                                    <button className="btn btn-outline-success disabled w-100">
                                        Verified
                                        <i className="bi bi-patch-check-fill ms-1"></i>
                                    </button>
                                </div>
                                {/* submit button */}
                                <button
                                    className="btn btn-primary common-btn-font mt-4"
                                    disabled={emailValue && captchaVerified && !loading ? false : true}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-grow spinner-grow-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Checking....
                                        </>
                                    ) : (
                                        "Activate My Account"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div
                        className={`row justify-content-center ${afterSubmitSectionDisplay}`}
                    >
                        <div className="col-xl-4 col-lg-5 col-md-6">
                            <div className="card shadow p-4 bg-box-primary text-white">
                                <span className="mb-3">
                                    Check your email for a link to activate your account. If it
                                    doesn't appear within a few minutes, check your spam folder.
                                </span>
                                <NavLink
                                    to="/login"
                                    className="btn btn-outline-light common-btn-font"
                                >
                                    Return to sign in
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default InactiveUserEmailVerification