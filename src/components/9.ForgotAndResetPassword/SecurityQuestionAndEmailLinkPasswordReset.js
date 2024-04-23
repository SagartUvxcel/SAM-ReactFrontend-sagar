import React, { useState, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import resetPassImg from "../../images/resetPass.svg";
import axios from "axios";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../1.CommonLayout/Loader";

// regular expression
const regexForPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;


const SecurityQuestionAndEmailLinkPasswordReset = () => {

  const location = useLocation();
  // Used to navigate to particular page.
  const goTo = useNavigate();
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
    eyeIcon3: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
    passwordType3: "password",
    question_id: "",
    answer: "",
  });

  // destructing 
  const {
    newPassword,
    confirmPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    eyeIcon3,
    passwordType1,
    passwordType2,
    passwordType3,
    question_id,
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
  const [securityQuestionsList, setSecurityQuestionsList] = useState([]);

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
  const onInputBlur = (e) => {
    const { value } = e.target;
    if (!value) {
      e.target.nextSibling.classList.remove('active');
    }
  }

  // Function getSecurityQuestionList.
  const getSecurityQuestionList = async () => {
    try {
      const { data } = await axios.get("/sam/v1/customer-registration/security-questions");
      if (data) {
        setSecurityQuestionsList(data);
      }
    } catch (error) { 
    }
  };

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

  // Toggle the eye-icon to show and hide text for answer.
  const changeEyeIcon3 = () => {
    if (eyeIcon3 === "eye-slash") {
      setDetails({ ...details, eyeIcon3: "eye", passwordType3: "text" });
    } else if (eyeIcon3 === "eye") {
      setDetails({
        ...details,
        eyeIcon3: "eye-slash",
        passwordType3: "password",
      });
    }
  };

  // Function to check if the password and answer satisfies the given password condition.
  const onFormInputsBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      e.target.nextSibling.classList.remove('active');
    }
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
        answer: value.trim(),
      });
    } else if (name === "securityQuestion") {
      setDetails({
        ...details,
        question_id: value,
      });
    }
  };

  // On setPassWord Button click this function will run.
  const onSetPasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (question_id.length === 0) {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Please select question",
        alertClr: "warning",
      });

    } else if (
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
      try {
        await axios
          .put(
            `/sam/v1/customer-registration/forget-password/security-answer/update`,
            JSON.stringify({
              password: newPassword,
              username: emailAndQuestionData.email,
              security_answer: answer,
              question_id: parseInt(question_id),
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
        if (error.response.data.error !== "You are block for 24 hour to reset your password") {
          toast.warning(`Invalid credentials.${error.response.data.remaining_attempted} attempts remaining.`);
        }
        setAlertDetails({
          alertVisible: true,
          alertMsg: error.response.data.error,
          alertClr: "danger",
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

  useEffect(() => {
    const verifiedDataFromBackend = location.state ? location.state.sensitiveData : null;
    if (verifiedDataFromBackend !== null) {
      setEmailAndQuestionData(verifiedDataFromBackend);
      setShowLoader(false);
      getSecurityQuestionList();
    } else {
      setShowLoader(false);
      goTo("/login");
    }
    // eslint-disable-next-line
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
                  <h4 className=" fw-bold">Select an option to reset password</h4>
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
                    {/* alert error */}
                    <div
                      className={`login-alert alert p-2 mt-2 alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? "" : "d-none"
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
                      <div className="col-lg-12 my-3">
                        <div className="form-group position-relative custom-class-form-div">
                          <select
                            id="securityQuestion"
                            name="securityQuestion"
                            className="form-select  custom-input ps-3 mt-2 securityQuestionAnswer"
                            onChange={onFormInputsChange}
                            onBlur={onInputBlur}
                            onFocus={handleFocus}
                            required
                          >
                            <option className="text-gray" hidden > </option>
                            {securityQuestionsList ? (
                              securityQuestionsList.map((data, index) => {
                                return (
                                  <option
                                    key={index}
                                    value={data.question_id}
                                  >
                                    {data.question}
                                  </option>
                                );

                              })
                            ) : (
                              <> </>
                            )}
                          </select>
                          <label className="px-0 security-question-label " htmlFor="securityQuestion" onClick={() => handleClick('securityQuestion')} >Security Question  <span className="text-danger ">*</span></label>
                        </div>
                      </div>
                      {/* answer */}
                      <div className="col-lg-12 mb-3 " >
                        <div className="form-group position-relative custom-class-form-div">
                          <input
                            id="securityQuestionAnswer"
                            name="securityQuestionAnswer"
                            type={passwordType3}
                            className="form-control securityQuestionAnswer custom-input"
                            onChange={onFormInputsChange}
                            onBlur={onInputBlur}
                            onFocus={handleFocus}
                            required
                          />
                          <label className="px-0 security-question-label " htmlFor="securityQuestionAnswer" onClick={() => handleClick('securityQuestionAnswer')} >Answer  <span className="text-danger ">*</span></label>
                          <i
                            placeholder={eyeIcon}
                            onClick={changeEyeIcon3}
                            className={`icon-eye-setpass bi bi-${eyeIcon3}`}
                          ></i>
                        </div>
                      </div>
                      {/* new Password */}
                      <div className="col-lg-12 mb-3 " >
                        <div className="form-group position-relative custom-class-form-div">
                          <input
                            id="setPassword"
                            name="setPassword"
                            type={passwordType1}
                            className="form-control securityQuestionAnswer custom-input"
                            onBlur={onFormInputsBlur}
                            onChange={onFormInputsChange}
                            onFocus={handleFocus}
                            required
                          />
                          <label className="px-0 security-question-label " htmlFor="setPassword" onClick={() => handleClick('setPassword')} > New Password<span className="text-danger ">*</span></label>
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
                        <p className="text-muted password-condition mt-2 mb-0">
                          Password should contain at least 1 uppercase letter, 1
                          lowercase letter, 1 number, 1 special character and should
                          be 8-15 characters long.
                        </p>
                      </div>
                      {/* Confirm Password */}
                      <div className="col-lg-12 mb-3 " >
                        <div className="form-group position-relative custom-class-form-div">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={passwordType2}
                            className="form-control securityQuestionAnswer custom-input"
                            onChange={onFormInputsChange}
                            onBlur={onInputBlur}
                            onFocus={handleFocus}
                            required
                          />
                          <label className="px-0 security-question-label " htmlFor="confirmPassword" onClick={() => handleClick('confirmPassword')} > Confirm Password<span className="text-danger ">*</span></label>
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
                    <hr className="mt-4" />
                  </form>

                  {/* option 2 for reset password(email link) */}
                  <div className={`card p-2 text-muted ${emailLink === true ? "mt-3 bg-light" : "mt-4"}`}>
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

            {/*  Return to sign in */}
            <div
              className={`row justify-content-center ${afterSubmitSectionDisplay}`}
            >
              <div className="col-xl-4 col-lg-5 col-md-6">
                <div className="card shadow p-4 bg-box-primary text-white">
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