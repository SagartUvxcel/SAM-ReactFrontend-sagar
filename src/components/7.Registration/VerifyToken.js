import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const VerifyToken = () => {
  // useState to save token entered by user.
  const [enteredToken, setEnteredToken] = useState("");

  // To navigate to particular route.
  const goTo = useNavigate();

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
          goTo("/register/reset-password");
        } else {
          toast.error("Invalid Token Entered");
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
