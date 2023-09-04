import axios from "axios";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import verifyTokenImg from "../../images/verifytoken.svg";
import { rootTitle } from "../../CommonFunctions";

const VerifyToken = () => {
  // useState to save token entered by user.
  const [enteredToken, setEnteredToken] = useState("");
  const [loading, setLoading] = useState(false);

  // To navigate to particular route.
  const goTo = useNavigate();
  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;

  const mainFunctionToVerifyToken = async (tokenOfUser, e) => {
    try {
      await axios
        .post(
          `/sam/v1/customer-registration/verify-token`,
          JSON.stringify({ token: tokenOfUser })
        )
        .then((res) => {
          if (res.data.status === 0) {
            setLoading(false);
            if (e !== "") {
              e.target.reset();
            }
            toast.success("Verification Successful !");
            localStorage.setItem("token", tokenOfUser);
            goTo("/register/set-password");
          } else if (res.data.status === 1) {
            setLoading(false);
            setAlertDetails({
              alertVisible: true,
              alertMsg: "Token is Expired.",
              alertClr: "danger",
            });
          } else if (res.data.status === 2) {
            setLoading(false);
            setAlertDetails({
              alertVisible: true,
              alertMsg: "Token is Invalid.",
              alertClr: "danger",
            });
          }
        });
    } catch (error) {
      setLoading(false);
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Internal server error",
        alertClr: "warning",
      });
    }
  };

  // Function to compare and verify user entered token with original token.
  const verifyUserToken = (e) => {
    setLoading(true);
    e.preventDefault();
    mainFunctionToVerifyToken(enteredToken, e);
  };

  let tokenFromEmailUrl = "";

  const getTokenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    tokenFromEmailUrl = urlParams.get("token");
    console.log(tokenFromEmailUrl);
    if (tokenFromEmailUrl) {
      mainFunctionToVerifyToken(tokenFromEmailUrl, "");
    }
  };

  // window.onload = () => {
  //   getTokenFromURL();
  // };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - VERIFY TOKEN";
  }, []);

  return (
    <Layout>
      <section className="verify-token-wrapper min-100vh section-padding" onLoad={() => getTokenFromURL()}>
        <div className="container">
          <div className="row justify-content-evenly mt-5">
            <div className="col-xl-4 col-lg-5 col-md-6">
              <form onSubmit={verifyUserToken} action="" className="card p-5">
                <h3 className="card-title text-center fw-bold">
                  Verify Your Token
                </h3>
                <hr />
                <div
                  className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${
                    alertVisible ? "" : "d-none"
                  }`}
                  role="alert"
                >
                  <span>
                    <i
                      className={`bi bi-exclamation-triangle-fill me-2 ${
                        alertClr === "danger" || alertClr === "warning"
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
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Your Token"
                        onChange={(e) => setEnteredToken(e.target.value.trim())}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <button
                        disabled={loading ? true : false}
                        className="btn btn-primary common-btn-font w-100"
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-grow spinner-grow-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Verifying....
                          </>
                        ) : (
                          "Verify token"
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-12 mt-3">
                    <div className="position-relative form-group">
                      <div
                        className="position-absolute"
                        style={{ top: "0", right: "0" }}
                      >
                        <small className="fw-bold">
                          Not registered?
                          <NavLink to="/register" className="ps-1">
                            Click here
                          </NavLink>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-xl-4 col-lg-5 col-md-6 mt-5 mt-md-0">
              <img src={verifyTokenImg} alt="" className="verify-token-img" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VerifyToken;
