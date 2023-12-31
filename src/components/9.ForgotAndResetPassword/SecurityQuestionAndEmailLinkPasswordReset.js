import React, { useState, useRef, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import resetPassImg from "../../images/resetPass.svg";
import axios from "axios";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../1.CommonLayout/Loader";

import {
  LoadCanvasTemplate,
  loadCaptchaEnginge,
  validateCaptcha,
} from "react-simple-captcha";

// regular expression
const regexForPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;


const SecurityQuestionAndEmailLinkPasswordReset = () => {

  const location = useLocation();
  // Used to navigate to particular page.
  const goTo = useNavigate();
  const [emailValue, setEmailValue] = useState("");
  const [showLoader, setShowLoader] = useState(true);

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });

  const [emailAndQuestionData, setEmailAndQuestionData] = useState("");
  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
    question: emailAndQuestionData.question,
    answer: "",
  });

  // destructing 
  const {
    newPassword,
    confirmPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
    questionId,
    answer,
  } = details;
  const [displayOfSections, setDisplayOfSections] = useState({
    mainSectionDisplay: "",
    afterSubmitSectionDisplay: "d-none",
  });

  const [selectedOption, setSelectedOption] = useState("option1");
  const [passwordResetInput, setPasswordResetInput] = useState(
    {
      securityQuestionInputDisplay: true,
      emailLink: false
    });
  const { securityQuestionInputDisplay, emailLink } = passwordResetInput;
  const [loading, setLoading] = useState(false);
  const { alertMsg, alertClr, alertVisible } = alertDetails;
  const { mainSectionDisplay, afterSubmitSectionDisplay } = displayOfSections;
  // const [captchaVerified, setCaptchaVerified] = useState(false);
  // const [captchaErr, setCaptchaErr] = useState(false);
  // const captchaRef = useRef();



  // radio button handle function
  const handleRadioButtonClick = (option) => {
    setSelectedOption(option);
    if (option === 'option1') {
      setPasswordResetInput({
        securityQuestionInputDisplay: true,
        emailLink: false
      });
    } else {
      setPasswordResetInput({
        securityQuestionInputDisplay: false,
        emailLink: true
      });
    }
  };

  // Toggle the eye-icon to show and hide password for field 1.
  const changeEyeIcon1 = () => {
    if (eyeIcon === "eye-slash") {
      setDetails({ ...details, eyeIcon: "eye", passwordType1: "text" });
    } else if (eyeIcon === "eye") {
      setDetails({
        ...details,
        eyeIcon: "eye-slash",
        passwordType1: "password",
      });
    }
  };

  // Toggle the eye-icon to show and hide password for field 2.
  const changeEyeIcon2 = () => {
    if (eyeIcon2 === "eye-slash") {
      setDetails({ ...details, eyeIcon2: "eye", passwordType2: "text" });
    } else if (eyeIcon2 === "eye") {
      setDetails({
        ...details,
        eyeIcon2: "eye-slash",
        passwordType2: "password",
      });
    }
  };

  // Function to check if the password and answer satisfies the given password condition.
  const onFormInputsBlur = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    if (name === "setPassword") {
      if (value) {
        if (value.match(regexForPassword)) {
          setDetails({
            ...details,
            newPassword: value,
            invalidMessage1: "",
          });
        } else {
          setDetails({
            ...details,
            newPassword: value,
            invalidMessage1: "Invalid Password",
          });
        }
      }
    }
  };

  // Onchange function for both password and answer fields.
  const onFormInputsChange = (e) => {
    const { name, value } = e.target;
    if (name === "setPassword") {
      setDetails({
        ...details,
        newPassword: value,
        invalidMessage1: "",
      });
    } else if (name === "confirmPassword") {
      setDetails({
        ...details,
        confirmPassword: value,
      });
    } else if (name === "securityQuestionAnswer") {
      setDetails({
        ...details,
        answer: value,
      });
    }
  };

  // On setPassWord Button click this function will run.
  const onSetPasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (
      newPassword !== confirmPassword &&
      invalidMessage1 !== "Invalid Password"
    ) {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Password and confirm password does not match.",
        alertClr: "danger",
      });
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else if (newPassword !== confirmPassword) {
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else if (
      newPassword === confirmPassword &&
      invalidMessage1 === "Invalid Password"
    ) {
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else {
      console.log({
        password: newPassword,
        username: emailAndQuestionData.email,
        security_answer: answer,
      });
      setLoading(true);
      try {
        await axios
          .put(
            `/sam/v1/customer-registration/forget-password/security-answer/update`,
            JSON.stringify({
              password: newPassword,
              username: emailAndQuestionData.email,
              security_answer: answer,
            })
          )
          .then((res) => {
            if (res.data.status === 0) {
              setLoading(false);
              e.target.reset();
              toast.success("Password Saved Successfully !");
              localStorage.removeItem("token");
              goTo("/login");
            } else {
              setLoading(false);
              setAlertDetails({
                alertVisible: true,
                alertMsg: "Internal server error",
                alertClr: "warning",
              });
            }
          });
      } catch (error) {
        setLoading(false);
        console.log(error);
        setAlertDetails({
          alertVisible: true,
          alertMsg: "Password must be different from the last password",
          alertClr: "warning",
        });
      }
    }
  };

  // send password reset link on mail
  const sendResetPasswordLinkOnMail = async () => {
    setLoading(true);
    try {
      await axios
        .post(
          `/sam/v1/customer-registration/forgot-password`,
          JSON.stringify({ username: emailAndQuestionData.email })
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.status === 0) {
            toast.success(`Success: Please check your email for password reset link.`);
            setDisplayOfSections({
              mainSectionDisplay: "d-none",
              afterSubmitSectionDisplay: "",
            });
            setLoading(false);
          } else {
            setLoading(false);
          }
        });
    } catch (error) {
      setLoading(false);
      toast.error("failed to send password reset link.")
    }
  }


  const loadCaptchaOnRefresh = () => {
    loadCaptchaEnginge(6);
    const captchaWrapper =
      document.getElementById("captcha-wrapper").firstChild;
    captchaWrapper.classList.add("flexAndCenter");
    document.getElementById("reload_href").classList.add("d-none");
  };

  useEffect(() => {
    // loadCaptchaOnRefresh();
    const verifiedDataFromBackend = location.state ? location.state.sensitiveData : null;
    if (verifiedDataFromBackend !== null) {
      setEmailAndQuestionData(verifiedDataFromBackend);
      setShowLoader(false);
    } else {
      setShowLoader(false);
      goTo("/login");
    }
  }, []);
  return (
    <Layout>
      {showLoader ? <>
        <Loader />
      </> :
        <section className="forgot-password section-padding min-100vh">
          <div className="container wrapper">
            <div
              className={`row justify-content-lg-between justify-content-center ${mainSectionDisplay}`}
            >

              <div className="col-xl-6 col-lg-7 col-md-8 order-1 order-lg-1 mt-lg-0 mt-5 card ">
                <div className="justify-content-center p-4 p-md-5">
                  <h4 className=" fw-bold">Select an Option to Reset Password</h4>
                  <hr />
                  <div className={`card p-2 ${securityQuestionInputDisplay === true ? " bg-light" : "mt-5"}`}>
                    <div className="form-check ">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"
                        value="option1"
                        checked={selectedOption === 'option1'}
                        onChange={() => handleRadioButtonClick('option1')} />
                      <label className="form-check-label fw-bold" htmlFor="flexRadioDefault1">
                        Use my security answer
                      </label>
                    </div>

                  </div>
                  <form className={` ${securityQuestionInputDisplay === true ? "" : "d-none"}`}
                    onSubmit={onSetPasswordFormSubmit}>
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
                    <div className="row mt-1 px-3">

                      {/* Question */}
                      <div className="col-lg-12 mt-3 ">
                        <label className="text-muted mb-2" htmlFor="confirm-password">
                          Question: <span className="text-black">  {emailAndQuestionData ? emailAndQuestionData.question : ""}</span>
                        </label>
                      </div>
                      {/* answer */}
                      <div className="col-lg-12 mb-3 " >
                        <label className="text-muted" htmlFor="confirm-password">
                          Answer
                          <span className="text-danger ps-1">*</span>
                        </label>
                        <div className="form-group position-relative">
                          <input
                            id="securityQuestionAnswer"
                            name="securityQuestionAnswer"
                            type="text"
                            className="form-control securityQuestionAnswer"
                            onChange={onFormInputsChange}
                            required
                          />

                        </div>
                      </div>
                      {/* new Password */}
                      <div className="col-lg-12 mb-3 " >
                        <label className="text-muted" htmlFor="confirm-password">
                          New Password:
                          <span className="text-danger ps-1">*</span>
                        </label>
                        <div className="form-group position-relative">
                          <input
                            id="set-password"
                            name="setPassword"
                            type={passwordType1}
                            className="form-control securityQuestionAnswer"
                            onBlur={onFormInputsBlur}
                            onChange={onFormInputsChange}
                            required
                          />
                          <i
                            placeholder={eyeIcon}
                            onClick={changeEyeIcon1}
                            className={`icon-eye-setpass bi bi-${eyeIcon}`}
                          ></i>
                        </div>
                        {invalidMessage1 ? (
                          <span className="pe-1 text-danger">
                            {invalidMessage1}
                          </span>
                        ) : (
                          <span className="d-none"></span>
                        )}
                        <p className="text-muted password-condition mt-2">
                          Password should contain at least 1 uppercase letter, 1
                          lowercase letter, 1 number, 1 special character and should
                          be 8-15 characters long.
                        </p>
                      </div>
                      {/* Confirm Password */}
                      <div className="col-lg-12 mb-3 " >
                        <label className="text-muted" htmlFor="confirm-password">
                          Confirm Password:
                          <span className="text-danger ps-1">*</span>
                        </label>
                        <div className="form-group position-relative">
                          <input
                            id="confirm-password"
                            name="confirmPassword"
                            type={passwordType2}
                            className="form-control securityQuestionAnswer"
                            onChange={onFormInputsChange}
                            required
                          />
                          <i
                            placeholder={eyeIcon}
                            onClick={changeEyeIcon2}
                            className={`icon-eye-setpass bi bi-${eyeIcon2}`}
                          ></i>
                        </div>
                      </div>
                      {/* password rest button */}
                      <div className="col-lg-12 text-center mt-2">
                        <button
                          disabled={loading ? true : false}
                          type="submit"
                          className="btn btn-primary  common-btn-font w-75"
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-grow spinner-grow-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Resetting password.....
                            </>
                          ) : (
                            "Reset password"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>


                  {/* option 2 for reset password(email link) */}
                  <div className={`card p-2 text-muted ${emailLink === true ? "mt-3 bg-light" : "mt-5"}`}>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2"
                        value="option2"
                        checked={selectedOption === 'option2'}
                        onChange={() => handleRadioButtonClick('option2')}
                      />
                      <label className="form-check-label fw-bold" htmlFor="flexRadioDefault2">
                        Send verification code to your email
                      </label>
                    </div>
                  </div>
                  <form className={` px-3 py-3 ${emailLink === true ? "" : "d-none"}`} onSubmit={sendResetPasswordLinkOnMail} >
                    <label className="text-black" htmlFor="confirm-password">
                      Email:
                    </label>
                    <input
                      id="emailId"
                      name="emailId"
                      type="email"
                      className="form-control "
                      value={emailAndQuestionData ? emailAndQuestionData.email : ""}
                      // onChange={onFormInputsChange}
                      disabled
                    />
                    <button
                      className="btn btn-primary common-btn-font mt-4"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-grow spinner-grow-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending....
                        </>
                      ) : (
                        "Send password reset email"
                      )}
                    </button>

                  </form>
                </div>


              </div>
              {/* image div */}
              <div className="col-xl-5 col-lg-5 col-md-8 order-2 order-lg-2 mt-md-5 mt-lg-0">
                <img src={resetPassImg} alt="" className="set-pass-img" />
              </div>
            </div>


            <div
              className={`row justify-content-center ${afterSubmitSectionDisplay}`}
            >
              <div className="col-xl-4 col-lg-5 col-md-6">
                <div className="card shadow p-4 bg-primary text-white">
                  <span className="mb-3">
                    Check your email for a link to reset your password. If it
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
      }
    </Layout>
  );
};


export default SecurityQuestionAndEmailLinkPasswordReset