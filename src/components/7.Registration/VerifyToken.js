import axios from "axios";
import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import { AlertDetails } from "../../App";

const VerifyToken = ({ setAlertDetails }) => {
  // useState to save token entered by user.
  const [enteredToken, setEnteredToken] = useState("");

  // To navigate to particular route.
  const goTo = useNavigate();
  const alertDetails = useContext(AlertDetails);

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
          toast.success("Verification Successful !");
          localStorage.setItem("token", enteredToken);
          goTo("/register/reset-password");
        } else {
          // toast.error("Invalid Token Entered");
          setAlertDetails({
            ...alertDetails,
            alertVisible: true,
            alertMsg: "Invalid Token Entered",
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
                {alertDetails.alertVisible ? (
                  <div
                    className={`login-alert alert alert-${alertDetails.alertClr} alert-dismissible show`}
                    role="alert"
                  >
                    <small className="fw-bold">{alertDetails.alertMsg}</small>

                    <i
                      data-bs-dismiss="alert"
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
                        onChange={(e) => {
                          setEnteredToken(e.target.value);
                          setAlertDetails({
                            ...alertDetails,
                            alertVisible: false,
                          });
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <button className="btn common-btn w-100">
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
