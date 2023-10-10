import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../1.CommonLayout/Loader";
import Layout from "../1.CommonLayout/Layout";
import setPassImg from "../../images/setpass.svg";
import LinkExpiredPasswordResetImage from "../../images/LinkExpiredPasswordResetImage.svg";
import { rootTitle } from "../../CommonFunctions";

const ForgotAndResetPassword = () => {
  const navigate = useNavigate();
  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
  });

  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [emailFromURL, setEmailFromURL] = useState(null);
  const [displayForgotPasswordPage, setDisplayForgotPasswordPage] = useState({
    display: false,
  });

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;
  // Used to navigate to particular page.
  const goTo = useNavigate();

  const {
    newPassword,
    confirmPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
  } = details;

  // Function to check if the password satisfies the given password condition.
  const onPasswordsBlur = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      const regexForPassword =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
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

  // Onchange function for both password fields.
  const onPasswordsChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
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
    }
  };

  // On setPassWord Button click this function will run.
  const onResetPasswordFormSubmit = async (e) => {
    e.preventDefault();
    console.log(details);
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
      setLoading(true);
      const postData = JSON.stringify({
        password: newPassword,
        username: emailFromURL,
      });
      console.log(postData);
      try {
        await axios
          .post(
            `/sam/v1/customer-registration/forgot-password-change`,
            postData
          )
          .then((res) => {
            if (res.data.status === 0) {
              console.log(res);
              setLoading(false);
              toast.success("Password Changed Successfully !");
              // localStorage.removeItem("forgotPassUserName");
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
        setAlertDetails({
          alertVisible: true,
          alertMsg: "Internal server error",
          alertClr: "warning",
        });
      }
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
  // console.log(displayForgotPasswordPage);

  let emailFromEmailUrl = "";

  const getEmailFromURL = async () => {

    const urlParams = new URLSearchParams(window.location.search);
    emailFromEmailUrl = urlParams.get("email");

    if (emailFromEmailUrl) {
      const forgotPasswordUrlToken = emailFromEmailUrl.split('=');
      const emailToken = forgotPasswordUrlToken[0];
      const tokenDataToPost = forgotPasswordUrlToken[1];




      // posting data 
      const dataToPost = JSON.stringify(
        {
          mail_id: emailToken,
          token: tokenDataToPost
        })
      console.log(dataToPost);
      console.log(loading);

      try {
        await axios.post(`/sam/v1/customer-registration/verify-link-token`, dataToPost)
          .then((res) => {
            console.log(res.data);

            if (res.data) {

              const emailValue = res.data.email
              const validValue = res.data.valid
              if (emailValue && validValue) {
                setEmailFromURL(emailValue);
                setDisplayForgotPasswordPage({
                  display: true,
                });
                setShowLoader(false);

              } else {
                setDisplayForgotPasswordPage({
                  display: false,
                });
                setShowLoader(false);
                // navigate("/access-denied");
              }
              // localStorage.setItem("forgotPassUserName", emailValue);
            }
          });
      } catch (error) {
        setShowLoader(false);
        console.log("failed to send token data for link validation.")
      }

    } else {

      setShowLoader(false);
      navigate("/access-denied");
    }

  };

  useEffect(() => {
    getEmailFromURL();
    rootTitle.textContent = "SAM TOOL - RESET PASSWORD";
  });
  return (
    <Layout>
      {showLoader ? <>
        <Loader />
      </>
        :
        <section className="set-password-wrapper section-padding min-100vh" >
          {displayForgotPasswordPage.display === true ? <>
            <div className="container mt-5">
              <div className="row justify-content-lg-between justify-content-center">
                <div className="col-xl-5 col-lg-6 col-md-8">
                  <form onSubmit={onResetPasswordFormSubmit} className="card p-5">
                    <h3 className="text-center fw-bold">Reset Password</h3>
                    <hr />
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

                    <div className="row mt-3">
                      <div className="col-lg-12 mb-4">
                        <div className="form-group position-relative">
                          <label className="text-muted" htmlFor="new-password">
                            Password<span className="text-danger ps-1">*</span>
                          </label>
                          <input
                            id="new-password"
                            name="newPassword"
                            type={passwordType1}
                            className="form-control"
                            onBlur={onPasswordsBlur}
                            onChange={onPasswordsChange}
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
                        <span className="text-muted password-condition">
                          Password should contain at least 1 uppercase letter, 1
                          lowercase letter, 1 number, 1 special character and should
                          be 8-15 characters long.
                        </span>
                      </div>
                      <div className="col-lg-12 mb-4">
                        <label className="text-muted" htmlFor="confirm-password">
                          Confirm Password
                          <span className="text-danger ps-1">*</span>
                        </label>
                        <div className="form-group position-relative">
                          <input
                            id="confirm-password"
                            name="confirmPassword"
                            type={passwordType2}
                            className="form-control"
                            onChange={onPasswordsChange}
                            required
                          />
                          <i
                            placeholder={eyeIcon}
                            onClick={changeEyeIcon2}
                            className={`icon-eye-setpass bi bi-${eyeIcon2}`}
                          ></i>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <button
                          disabled={loading ? true : false}
                          type="submit"
                          className="btn btn-primary common-btn-font w-100"
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-grow spinner-grow-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Resetting password....
                            </>
                          ) : (
                            "Reset Password"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col-xl-5 col-lg-6 col-md-8 my-5 my-lg-0">
                  <img src={setPassImg} alt="" className="set-pass-img" />
                </div>
              </div>
            </div> </> : <>
            <div className="container mt-5">
              <div className="row justify-content-lg-between justify-content-center mt-5">
                <div className="col-xl-5 col-lg-5 col-md-8 order-2 order-lg-1 mt-lg-0 mt-5">
                  <h1 className="text-bold mt-5 common-secondary-color">Oops! This link has expired.</h1><br></br>
                    <h3 className="">Please request a <a href="/forgot-password" className="text-decoration-none"> new link</a> or <a href="/contact" className="text-decoration-none">contact </a>support for assistance.
                  </h3>
                </div>
                <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2 mt-5 ">
                  <img src={LinkExpiredPasswordResetImage} alt="" className="set-pass-img" />
                </div>

              </div>
            </div>
          </>
          }
        </section>}
    </Layout>
  );
};

export default ForgotAndResetPassword;
