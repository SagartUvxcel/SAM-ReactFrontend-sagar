import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";

const ResetPassword = () => {
  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
  });

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;
  // Used to navigate to particular page.
  const goTo = useNavigate();

  const {
    newPassword,
    confirmPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
  } = details;

  // Function to check if the password satisfies the given password condition.
  const onPasswordsBlur = (e) => {
    const { name, value } = e.target;
    if (name === "resetPassword") {
      const regexForPassword =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
      if (value.match(regexForPassword)) {
        setDetails({
          ...details,
          newPassword: value,
          invalidMessage1: "",
        });
      } else {
        setDetails({
          ...details,
          newPassword: value,
          invalidMessage1: "Invalid Password",
        });
      }
    }
  };

  // Onchange function for both password fields.
  const onPasswordsChange = (e) => {
    const { name, value } = e.target;
    if (name === "resetPassword") {
      setDetails({
        ...details,
        newPassword: value,
        invalidMessage1: "",
      });
    } else if (name === "confirmPassword") {
      setDetails({
        ...details,
        confirmPassword: value,
      });
    }
  };

  // On reset Button click this function will run.
  const onResetPasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (
      newPassword !== confirmPassword &&
      invalidMessage1 !== "Invalid Password"
    ) {
      setAlertDetails({
        alertVisible: true,
        alertMsg: "Password and confirm password does not match.",
        alertClr: "danger",
      });
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else if (newPassword !== confirmPassword) {
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else if (
      newPassword === confirmPassword &&
      invalidMessage1 === "Invalid Password"
    ) {
      setDetails({
        ...details,
        eyeIcon: "eye",
        passwordType1: "text",
        eyeIcon2: "eye",
        passwordType2: "text",
      });
    } else {
      await axios
        .post(
          `/sam/v1/customer-registration/reset-password`,
          JSON.stringify({
            password: newPassword,
            token: localStorage.getItem("token"),
          })
        )
        .then((res) => {
          console.log(res.data.status);
        });
      toast.success("Password Changed Successfully !");
      setTimeout(() => {
        goTo("/login");
      }, 3000);
    }
  };

  // Toggle the eye-icon to show and hide password for field 1.
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

  // Toggle the eye-icon to show and hide password for field 2.
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
            <div className="col-xl-5 col-lg-6 col-md-7">
              <form onSubmit={onResetPasswordFormSubmit} className="card p-5">
                <h3 className="text-center fw-bold">Reset Password</h3>
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
                  <div className="col-lg-12 mb-4">
                    <div className="form-group position-relative">
                      <label className="text-muted" htmlFor="reset-password">
                        New Password<span className="text-danger ps-1">*</span>
                      </label>
                      <input
                        id="reset-password"
                        name="resetPassword"
                        type={passwordType1}
                        className="form-control"
                        onBlur={onPasswordsBlur}
                        onChange={onPasswordsChange}
                        required
                      />

                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon1}
                        className={`icon-eye bi bi-${eyeIcon}`}
                      ></i>
                    </div>
                    {invalidMessage1 ? (
                      <span className="pe-1 text-danger">
                        {invalidMessage1}
                      </span>
                    ) : (
                      <span className="d-none"></span>
                    )}
                    <span className="text-muted password-condition">
                      Password should contain at least 1 uppercase, 1 lowercase
                      letter, 1 number and should be 8-15 characters long.
                    </span>
                  </div>
                  <div className="col-lg-12 mb-4">
                    <label className="text-muted" htmlFor="confirm-password">
                      Confirm Password
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <div className="form-group position-relative">
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={passwordType2}
                        className="form-control"
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
