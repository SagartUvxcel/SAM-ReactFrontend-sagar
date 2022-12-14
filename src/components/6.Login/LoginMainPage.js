import axios from "axios";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import login from "../../images/loginsvg.svg";

const LoginMainPage = () => {
  // It is used to navigate to particular route.
  const goTo = useNavigate();

  const [loginBtnClassName, setLoginBtnClassName] = useState("");

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
    eyeIcon: "eye-slash",
    passwordType: "password",
  });

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

    await axios
      .post(
        `/sam/v1/customer-registration/login`,
        JSON.stringify({ username: email, password: password })
      )
      .then((res) => {
        const { email, token } = res.data;
        if (email !== "" && token !== "") {
          localStorage.setItem("isLoggedIn", true);
          toast.success("Logged in Successfully !");
          localStorage.setItem("user", email);
          setLoginBtnClassName("disabled");
          setTimeout(() => {
            goTo("/profile/edit-individual");
          }, 2500);
        } else {
          setAlertDetails({
            alertVisible: true,
            alertMsg: "Invalid Username or Password Entered.",
            alertClr: "danger",
          });
        }
      });
  };

  return (
    <Layout>
      <section className="login-wrapper min-100vh section-padding">
        <div className="container-fluid mt-5">
          <div className="row justify-content-evenly">
            <div className="col-lg-5 col-xl-5 mb-5">
              <img src={login} alt="" className="login-img" />
            </div>
            <div className="col-lg-5 col-xl-4 col-md-7">
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
                  <div className="col-lg-12 mb-3 position-relative">
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
                  <h6 className="text-center fw-bold">OR</h6>
                </div>
                <h6 className="fw-bold mt-3 mt-md-0">Login with OTP</h6>
                <div className="row">
                  <div className="col-md-7 col-xl-8 mb-3">
                    <input
                      type="Number"
                      className="form-control"
                      id="mobile"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className="col-md-5 col-xl-4 text-md-end text-center">
                    <button className="btn btn-primary">Send OTP</button>
                  </div>
                </div>
                <hr />
                <div className="text-center my-3">
                  <button className={`btn btn-primary ${loginBtnClassName}`}>
                    Login
                  </button>
                </div>
                <small className="register-link position-absolute fixed-bottom text-end px-3 py-2 fw-bold">
                  Not Registered ?
                  <NavLink className="ps-1" to="/register">
                    Click here.
                  </NavLink>
                </small>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoginMainPage;
