import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";
import { useDispatch } from "react-redux";
import { checkStatus } from "../../redux/ActionTypes";

const LoginMainPage = () => {
  // Used to dispatch actions to redux-store.
  const dispatch = useDispatch();
  // It is used to navigate to particular route.
  const goTo = useNavigate();
  // Login Function
  const onLogin = (e) => {
    e.preventDefault();
    // true -  means user is logged in so that we are setting logged in status as true
    dispatch(checkStatus(true));
    goTo("/");
  };

  return (
    <Layout>
      <section className="login-wrapper min-100vh section-padding">
        <div className="container-fluid mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-7">
              <form action="" className="card p-5">
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
                <div className="text-center mt-3">
                  <button className="btn btn-primary" onClick={onLogin}>
                    Login
                  </button>
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
