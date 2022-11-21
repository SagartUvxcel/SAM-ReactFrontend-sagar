import axios from "axios";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const LoginMainPage = () => {
  // It is used to navigate to particular route.
  const goTo = useNavigate();

  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const { email, password } = loginDetails;

  const onUserNameAndPasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setLoginDetails({ ...loginDetails, [name]: value });
    } else if (name === "password") {
      setLoginDetails({ ...loginDetails, [name]: value });
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
        if (res.data.status === 0) {
          localStorage.setItem("isLoggedIn", true);
          toast.success("Logged in Successfully !");
          goTo("/");
        } else if (res.data.status === 1) {
          toast.error("Invalid Password Entered");
        } else {
          toast.error("Invalid Username or Password");
        }
      });
  };

  return (
    <Layout>
      <section className="login-wrapper min-100vh section-padding">
        <div className="container-fluid mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-7">
              <form
                onSubmit={onLogin}
                action=""
                className="card form-card position-relative p-5"
              >
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
                  <div className="col-lg-12 mb-3">
                    <input
                      onChange={onUserNameAndPasswordChange}
                      name="password"
                      type="password"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <h6 className="text-center fw-bold">OR</h6>
                </div>
                <h6 className="fw-bold mt-3 mt-md-0">Login with OTP</h6>
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <input
                      type="Number"
                      className="form-control"
                      id="mobile"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className="col-md-4 text-md-end text-center">
                    <button className="btn btn-primary">Send OTP</button>
                  </div>
                </div>
                <hr />
                <div className="text-center my-3">
                  <button className="btn btn-primary">Login</button>
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
