import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";
import login from "../../images/loginsvg.svg";
import { toast } from "react-toastify";

import { rootTitle } from "../../CommonFunctions";

const LoginMainPage = () => {


  // It is used to navigate to particular route.
  const goTo = useNavigate();
  const [loading, setLoading] = useState(false);

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

  // Password type and eye icon details.
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
    eyeIcon: "eye-slash",
    passwordType: "password",
  });

  // Bootstrap alert details.
  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });

  const { email, password, eyeIcon, passwordType } = loginDetails;
  const { alertMsg, alertClr, alertVisible } = alertDetails;

  const onUserNameAndPasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setLoginDetails({ ...loginDetails, [name]: value });
    } else if (name === "password") {
      setLoginDetails({ ...loginDetails, [name]: value });
    }
  };

  // Toggle the eye-icon to show and hide password.
  const changeEyeIcon1 = () => {
    if (eyeIcon === "eye-slash") {
      setLoginDetails({
        ...loginDetails,
        eyeIcon: "eye",
        passwordType: "text",
      });
    } else if (eyeIcon === "eye") {
      setLoginDetails({
        ...loginDetails,
        eyeIcon: "eye-slash",
        passwordType: "password",
      });
    }
  };

  // Login Function.
  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios
        .post(
          `/sam/v1/customer-registration/login`,
          JSON.stringify({ username: email, password: password })
        )
        .then((res) => {
          console.log(res.data);
          const { email, token, role_id, user_id, is_bank, subscription_end_date, subscription_status, subscription_plan_id, bank_id, branch_id,country_id } = res.data.token; 
          let admin = null;
          let editor = null;
          let viewer = null;
          let bank_admin = null;
          if (email !== "" && token !== "") {
            role_id && role_id.forEach((role) => {
              if (role.role_id === 3) {
                viewer = 3;
              } else if (role.role_id === 2) {
                editor = 2;
              } else if (role.role_id === 1) {
                admin = 1;
              } else if (role.role_id === 6) {
                bank_admin = 6;
              }
            });
            localStorage.setItem(
              "data",
              JSON.stringify({
                isLoggedIn: true,
                user: email,
                loginToken: token,
                userId: user_id,
                roleId: admin
                  ? admin
                  : editor
                    ? editor
                    : viewer
                      ? viewer
                      : viewer
                        ? bank_admin
                        : bank_admin,
                isBank: is_bank,
                bank_id: bank_id,
                branch_Id: branch_id,
                subscription_status: subscription_status,
                subscription_end_date: subscription_end_date,
                subscription_plan_id: subscription_plan_id,
                country_id: country_id,
              })
            );
            setLoading(false);
            is_bank === true ? goTo(`${bank_admin === 6 ? "/bank" : "/branch"}`) : goTo(`${admin === 1 ? "/admin" : "/"}`);
          } else {
            setLoading(false);
            setAlertDetails({
              alertVisible: true,
              alertMsg: "Invalid Credentials.",
              alertClr: "danger",
            });
          }
        });
    } catch (error) {
      if (error.response.data.error !== "Your account block for 24 hour" && error.response.data.error !== "Your account has been deactivated") {
        toast.warning(`Invalid credentials.${error.response.data.remaining_attempt} attempts remaining.`);
      }
      setAlertDetails({
        alertVisible: true,
        alertMsg: error.response.data.error,
        alertClr: "danger",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - LOGIN";
    let userSession = localStorage.getItem("userSession");
    if (userSession) {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Your session has expired",
        alertClr: "warning",
      });
    }
  }, []);

  return (
    <Layout>
      <section className="login-wrapper min-100vh section-padding">
        <div className="container-fluid mt-5">
          <div className="row justify-content-evenly">
            <div className="col-lg-5 col-xl-5 order-lg-1 order-2 mt-lg-0 mt-5 mb-5">
              <img src={login} alt="" className="login-img" />
            </div>
            <div className="col-lg-5 col-xl-4 col-md-7 order-lg-2 order-1">
              <form
                onSubmit={onLogin}
                action=""
                className="card form-card position-relative p-4 px-sm-5 py-sm-4 "
              >
                <h3 className="text-center fw-bold">Login</h3>
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
                <h6 className="common-label-text-fontSize text-secondary mb-4">Login with Email</h6>
                <div className="row">
                  {/* email */}
                  <div className="col-lg-12 mb-3">
                    <div className="input-group custom-class-form-div justify-content-end align-items-center h-100">
                      <span className="input-group-text login-page-input-icon" id="basic-addon1">
                        <i className="bi bi-envelope-at-fill"></i>
                      </span>
                      <input
                        onChange={onUserNameAndPasswordChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                        type="email"
                        name="email"
                        id="email"
                        className="form-control custom-input  login-input w-75"
                        required
                      />
                      <label className="ps-0 login-label " htmlFor="email" onClick={() => handleClick('email')} >Email </label>
                    </div>
                  </div>
                  {/* password */}
                  <div className="col-lg-12 mb-3 ">
                    <div className="input-group position-relative custom-class-form-div h-100">
                      <span className="input-group-text login-page-input-icon" id="basic-addon1">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        onChange={onUserNameAndPasswordChange}
                        onBlur={onInputBlur}
                        onFocus={handleFocus}
                        name="password"
                        type={passwordType}
                        className="form-control login-password-input  custom-input login-input w-75"
                        id="password"
                        required
                      />
                      <label className="px-0 ps-1 login-label " htmlFor="password" onClick={() => handleClick('password')} >Password </label>
                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon1}
                        className={`icon-eye-login bi bi-${eyeIcon}`}
                      ></i>
                    </div>
                  </div>
                </div>
                {/*   Signing in.... */}
                <div className="text-center my-3">
                  <button
                    disabled={loading ? true : false}
                    className="btn btn-primary  w-100 common-btn-font"
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-grow spinner-grow-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in....
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
                <hr />
                <div className="d-flex  justify-content-between">
                  <div className="pe-3">
                    <small className="fw-bold">
                      <NavLink
                        className="ps-1 text-decoration-none"
                        to="/forgot-password"
                      >
                        Forgot password?
                      </NavLink>
                    </small>
                  </div> 
                  <div className="">
                    <small className="register-link text-end fw-bold ps-1">
                      Not Registered ?
                      <NavLink className="ps-1" to="/register">
                        Click here.
                      </NavLink>

                    </small>
                  </div>
                </div>
                <div className="md-mt-2 ps-1 md-text-end ms-text-start">
                  <small className="register-link text-end fw-bold">
                    To active your account
                    <NavLink to="/inactive-account" className="fw-bold ps-1">
                      Click here.
                    </NavLink>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoginMainPage;
