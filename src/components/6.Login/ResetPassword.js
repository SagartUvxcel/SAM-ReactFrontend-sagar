import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../1.CommonLayout/Layout";

const ResetPassword = () => {
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidColor: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
  });

  const goTo = useNavigate();

  const {
    newPassword,
    confirmPassword,
    invalidColor,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
  } = details;

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
      setDetails({
        ...details,
        invalidColor: "danger",
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else {
      alert("Password Changed Successfully !");
      setDetails({ ...details, invalidColor: "" });
      goTo("/login");
    }
  };

  const changeEyeIcon1 = () => {
    if (eyeIcon === "eye-slash") {
      setDetails({ ...details, eyeIcon: "eye", passwordType1: "text" });
    } else if (eyeIcon === "eye") {
      setDetails({
        ...details,
        eyeIcon: "eye-slash",
        passwordType1: "password",
      });
    }
  };

  const changeEyeIcon2 = () => {
    if (eyeIcon2 === "eye-slash") {
      setDetails({ ...details, eyeIcon2: "eye", passwordType2: "text" });
    } else if (eyeIcon2 === "eye") {
      setDetails({
        ...details,
        eyeIcon2: "eye-slash",
        passwordType2: "password",
      });
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
                        type={passwordType1}
                        className={`form-control border-${invalidColor}`}
                        onChange={onPasswordsChange}
                        required
                      />
                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon1}
                        className={`icon-eye bi bi-${eyeIcon}`}
                      ></i>
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
                        type={passwordType2}
                        className={`form-control border-${invalidColor}`}
                        onChange={onPasswordsChange}
                        required
                      />
                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon2}
                        className={`icon-eye bi bi-${eyeIcon2}`}
                      ></i>
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
