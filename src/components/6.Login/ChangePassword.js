import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import changePassImg from "../../images/changePassword.svg";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
let userId = "";
const ChangePassword = () => {

  // Used to navigate to particular page.
  const goTo = useNavigate();
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    userId = data.userId;
  }

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

  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    currentPassword: "",
    newPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
  });
  const [loading, setLoading] = useState(false);
  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;
  const {
    currentPassword,
    newPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
  } = details;

  // Function to check if the password satisfies the given password condition.
  const onPasswordsBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      e.target.nextSibling.classList.remove('active');
    }
    if (name === "new-password") {
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
    if (name === "new-password") {
      setDetails({
        ...details,
        newPassword: value,
        invalidMessage1: "",
      });
    } else if (name === "current-password") {
      setDetails({
        ...details,
        currentPassword: value,
      });
    }
  };

  // displayPasswordInputs
  const displayPasswordInputs = () => {
    setDetails({
      ...details,
      eyeIcon: "eye",
      passwordType1: "text",
      eyeIcon2: "eye",
      passwordType2: "text",
    });
  };

  // On setPassWord Button click this function will run.
  const onChangePasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (currentPassword === newPassword) {
      displayPasswordInputs();
      setAlertDetails({
        alertMsg: "New password can not be the same as your current password",
        alertVisible: true,
        alertClr: "danger",
      });
    } else if (
      currentPassword !== newPassword &&
      invalidMessage1 === "Invalid Password"
    ) {
      displayPasswordInputs();
      setAlertDetails({
        alertMsg: "Invalid New Password",
        alertVisible: true,
        alertClr: "danger",
      });
    } else {
      setLoading(true);
      let userIdValue=userId.toString();
      try {
        await axios
          .post(`/sam/v1/customer-registration/reset-password`, {
            user_id: userIdValue,
            old_password: currentPassword,
            new_password: newPassword,
          })
          .then((res) => {
            if (res.data.status === 0) {
              setLoading(false);
              toast.success("Password changed successfully");
              // Clear localStorage.
              localStorage.clear();
              goTo("/login");
            } else {
              setLoading(false);
              setAlertDetails({
                alertMsg: "Invalid current password",
                alertVisible: true,
                alertClr: "danger",
              });
              displayPasswordInputs();
            }
          });
      } catch (error) {
        setLoading(false);
        setAlertDetails({
          alertMsg: "Internal server error",
          alertVisible: true,
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

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - CHANGE PASSWORD";
  }, []);

  return (
    <Layout>
      <section className="change-password-wrapper section-padding min-100vh">
        <div className="container mt-2">
          {/* back btn to View Profile */}
          <div className="col-md-4 col-6 text-start mb-3">
            <NavLink
              to="/profile"
              className="ms-4 text-decoration-none"
            >
              <i className="bi bi-arrow-left"></i> Back
            </NavLink>
          </div>
          <div className="row justify-content-lg-between justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2">
              <form onSubmit={onChangePasswordFormSubmit} className="card p-3 p-sm-5 ">
                <h3 className="text-center fw-bold">Change Password</h3>
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
                  {/* Current Password */}
                  <div className="col-lg-12 mb-4">
                    <div className="form-group">
                      <div className="input-group position-relative custom-class-form-div">
                        <input
                          id="current-password"
                          name="current-password"
                          type={passwordType1}
                          className="form-control custom-input change-input "
                          onChange={onPasswordsChange}
                          onBlur={onInputBlur}
                          onFocus={handleFocus}
                          required
                        />
                        <label className="ps-0 change-password-label " htmlFor="current-password"
                          onClick={() => handleClick('current-password')}
                        >Current Password </label>
                        <i
                          placeholder={eyeIcon}
                          onClick={changeEyeIcon1}
                          className={`icon-eye-changePassword bi bi-${eyeIcon}`}
                        ></i>
                      </div>
                    </div>
                  </div>
                  {/* new password */}
                  <div className="col-lg-12 mb-4">
                    <div className="form-group">
                      <div className="input-group position-relative custom-class-form-div">
                        <input
                          id="new-password"
                          name="new-password"
                          type={passwordType2}
                          className="form-control custom-input change-input"
                          onBlur={onPasswordsBlur}
                          onChange={onPasswordsChange}
                          onFocus={handleFocus}
                          required
                        />
                        <label className="ps-0 change-password-label " htmlFor="new-password"
                          onClick={() => handleClick('new-password')}
                        >New Password </label>
                        <i
                          placeholder={eyeIcon}
                          onClick={changeEyeIcon2}
                          className={`icon-eye-changePassword bi bi-${eyeIcon2}`}
                        ></i>
                      </div>
                    </div>

                    <span
                      className={`pe-1 text-danger ${invalidMessage1 ? "" : "d-none"
                        }`}
                    >
                      {invalidMessage1}
                    </span>

                    <span className="text-muted password-condition">
                      Password should contain at least 1 uppercase letter, 1
                      lowercase letter, 1 number, 1 special character and should
                      be 8-15 characters long.
                    </span>
                  </div>
                  {/* submit */}
                  <div className="col-lg-12 mt-3">
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
                          Changing password....
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-xl-5 col-lg-6 col-md-8 my-5 my-lg-0 order-2 order-lg-1">
              <img src={changePassImg} alt="" className="set-pass-img" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChangePassword;
