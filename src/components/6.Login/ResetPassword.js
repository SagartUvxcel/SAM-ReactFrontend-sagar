import React from "react";
import { useState } from "react";
import Layout from "../1.CommonLayout/Layout";

const ResetPassword = () => {
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidColor: "",
  });

  const { newPassword, confirmPassword, invalidColor } = details;

  const onPasswordsChange = (e) => {
    const { name, value } = e.target;
    if (name === "resetPassword") {
      setDetails({ ...details, newPassword: value, invalidColor: "" });
    } else if (name === "confirmPassword") {
      setDetails({ ...details, confirmPassword: value, invalidColor: "" });
    }
  };

  const onResetPasswordFormSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Password and confirm password not matching");
      setDetails({ ...details, invalidColor: "danger" });
    } else {
      alert("Password Matched");
      setDetails({ ...details, invalidColor: "" });
    }
  };

  return (
    <Layout>
      <section className="reset-password-wrapper section-padding min-100vh">
        <div className="container wrapper">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-xl-4 col-md-7">
              <form onSubmit={onResetPasswordFormSubmit} className="card p-5">
                <h3 className="text-center fw-bold">Reset Password</h3>
                <hr />
                <div className="row mt-3">
                  <div className="col-lg-12">
                    <div className="form-group mb-4">
                      <label className="text-muted" htmlFor="reset-password">
                        New Password<span className="text-danger ps-1">*</span>
                      </label>
                      <input
                        id="reset-password"
                        name="resetPassword"
                        type="password"
                        className={`form-control border-${invalidColor}`}
                        onChange={onPasswordsChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <label className="text-muted" htmlFor="confirm-password">
                      Confirm Password
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <div className="form-group mb-4">
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        className={`form-control border-${invalidColor}`}
                        onChange={onPasswordsChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <button className="btn common-btn w-100">
                      Reset Password
                    </button>
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

export default ResetPassword;
