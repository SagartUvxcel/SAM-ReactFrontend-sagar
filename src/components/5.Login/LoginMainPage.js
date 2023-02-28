import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import login from "../../images/loginsvg.svg";
import { rootTitle } from "../../CommonFunctions";

const LoginMainPage = () => {
  // It is used to navigate to particular route.
  const goTo = useNavigate();

  // It is used to store spinner and login-button details.
  const [loaderDetails, setLoaderDetails] = useState({
    loading: false,
    loginBtnTxt: "Login",
    loginBtnClassName: "",
  });

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
  const { loading, loginBtnClassName, loginBtnTxt } = loaderDetails;

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
    setLoaderDetails({
      ...loaderDetails,
      loading: true,
      loginBtnTxt: "Loading...",
      loginBtnClassName: "disabled",
    });
    await axios
      .post(
        `/sam/v1/customer-registration/login`,
        JSON.stringify({ username: email, password: password })
      )
      .then((res) => {
        const { email, token, role_id, user_id } = res.data.token;
        if (email !== "" && token !== "") {
          localStorage.setItem(
            "data",
            JSON.stringify({
              isLoggedIn: true,
              user: email,
              logintoken: token,
              userId: user_id,
              roleId: role_id[0].role_id,
            })
          );
          setTimeout(() => {
            toast.success("Logged in Successfully !");
          }, 1000);
          setTimeout(() => {
            goTo("/edit-details");
          }, 2500);
        } else {
          setLoaderDetails({
            ...loaderDetails,
            loading: false,
            loginBtnTxt: "Login",
            loginBtnClassName: "",
          });
          setAlertDetails({
            alertVisible: true,
            alertMsg: "Invalid Credentials.",
            alertClr: "danger",
          });
        }
      });
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - LOGIN";
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
                className="card form-card position-relative p-5"
              >
                <h3 className="text-center fw-bold">Login</h3>
                <hr />
                {alertVisible ? (
                  <div
                    className={`login-alert alert alert-${alertClr} alert-dismissible show`}
                    role="alert"
                  >
                    <small className="fw-bold">{alertMsg}</small>

                    <i
                      onClick={() => setAlertDetails({ alertVisible: false })}
                      className="bi bi-x login-alert-close-btn close"
                    ></i>
                  </div>
                ) : (
                  <div className="d-none"></div>
                )}
                <h6 className="fw-bold">Login with Email</h6>
                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon1">
                        <i className="bi bi-envelope-at-fill"></i>
                      </span>
                      <input
                        onChange={onUserNameAndPasswordChange}
                        type="email"
                        name="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        placeholder="Email"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 mb-3">
                    <div className="input-group position-relative">
                      <span className="input-group-text" id="basic-addon1">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        onChange={onUserNameAndPasswordChange}
                        name="password"
                        type={passwordType}
                        className="form-control"
                        id="exampleInputPassword1"
                        placeholder="Password"
                        required
                      />
                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon1}
                        className={`icon-eye-login bi bi-${eyeIcon}`}
                      ></i>
                    </div>
                  </div>
                </div>
                {/* Login with OTP section */}
                {/* <div className="row">
                  <h6 className="text-center fw-bold">OR</h6>
                  <h6 className="fw-bold mt-3 mt-md-0">Login with OTP</h6>
                  <div className="col-md-7 col-xl-8 mb-3">
                    <input
                      type="Number"
                      className="form-control"
                      id="mobile"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className="col-md-5 col-xl-4 text-md-end text-center">
                    <button type="button" className="btn btn-primary">
                      Send OTP
                    </button>
                  </div>
                </div> */}
                <hr />
                <div className="text-center my-3">
                  <button
                    className={`btn btn-primary ${loginBtnClassName} w-100 common-btn-font`}
                  >
                    <span
                      className={`${
                        loading ? "" : "d-none"
                      } spinner-grow spinner-grow-sm me-2`}
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {loginBtnTxt}
                  </button>
                </div>

                <div className="d-flex justify-content-between">
                  <div className="">
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
                    <small className="register-link text-end fw-bold">
                      Not Registered ?
                      <NavLink className="ps-1" to="/register">
                        Click here.
                      </NavLink>
                    </small>
                  </div>
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
