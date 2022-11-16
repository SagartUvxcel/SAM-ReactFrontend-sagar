import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";

const LoginMainPage = () => {
  // It is used to navigate to particular route.
  const goTo = useNavigate();
  // Login Function.
  const onLogin = (e) => {
    e.preventDefault();
    // true -  means user is logged in so that we are setting logged in status as true.
    localStorage.setItem("isLoggedIn", true);
    goTo("/");
  };

  return (
    <Layout>
      <section className="login-wrapper min-100vh section-padding">
        <div className="container-fluid mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-7">
              <form action="" className="card form-card position-relative p-5">
                <h6 className="fw-bold">Login with Email</h6>
                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="exampleInputEmail1"
                      placeholder="Email"
                    />
                  </div>
                  <div className="col-lg-12 mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="Password"
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
                  <button className="btn btn-primary" onClick={onLogin}>
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
