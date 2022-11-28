import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const VerifyToken = () => {
  // useState to save token entered by user.
  const [enteredToken, setEnteredToken] = useState("");
  const [verifyButtonClass, setVerifyButtonClass] = useState("");

  // To navigate to particular route.
  const goTo = useNavigate();
  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;

  // Function to compare and verify user entered token with original token.
  const verifyUserToken = async (e) => {
    e.preventDefault();
    await axios
      .post(
        `/sam/v1/customer-registration/verify-token`,
        JSON.stringify({ token: enteredToken })
      )
      .then((res) => {
        if (res.data.status === 0) {
          setVerifyButtonClass("disabled");
          toast.success("Verification Successful !");
          localStorage.setItem("token", enteredToken);
          setTimeout(() => {
            goTo("/register/reset-password");
          }, 3000);
        } else if (res.data.status === 1) {
          setAlertDetails({
            alertVisible: true,
            alertMsg: "Token is Expired.",
            alertClr: "danger",
          });
        } else if (res.data.status === 2) {
          setAlertDetails({
            alertVisible: true,
            alertMsg: "Token is Invalid.",
            alertClr: "danger",
          });
        }
      });
  };

  return (
    <Layout>
      <section className="verify-token-wrapper min-100vh section-padding">
        <div className="container">
          <div className="row justify-content-center wrapper">
            <div className="col-xl-4 col-lg-5 col-md-7">
              <form onSubmit={verifyUserToken} action="" className="card p-5">
                <h3 className="card-title text-center fw-bold">
                  Verify Your Token
                </h3>
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
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Your Token"
                        onChange={(e) => setEnteredToken(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <button
                        className={`btn common-btn w-100 ${verifyButtonClass}`}
                      >
                        Verify Token
                      </button>
                    </div>
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

export default VerifyToken;
