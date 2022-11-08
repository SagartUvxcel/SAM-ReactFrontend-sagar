import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";

const VerifyToken = ({ token }) => {
  const [savedToken, setSavedToken] = useState("");
  const [enteredToken, setEnteredToken] = useState("");
  const goTo = useNavigate();

  const saveToken = () => {
    if (token) {
      setSavedToken(token);
    } else {
      setSavedToken(localStorage.getItem("token"));
    }
  };

  useEffect(() => {
    saveToken();
  });

  const verifyUserToken = (e) => {
    e.preventDefault();
    console.log(savedToken, enteredToken);
    if (savedToken === enteredToken) {
      alert("User Verification Successful !");
      goTo("/register/reset-password");
    } else {
      alert("Invalid Token");
    }
  };

  return (
    <Layout>
      <section className="verify-token-wrapper min-100vh section-padding">
        <div className="container">
          <div className="row justify-content-center wrapper">
            <div className="col-xl-4 col-lg-5">
              <form onSubmit={verifyUserToken} action="" className="card p-5">
                <div className="row">
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Your Token"
                        onChange={(e) => setEnteredToken(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <button className="btn common-btn w-100">
                        VerifyToken
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
