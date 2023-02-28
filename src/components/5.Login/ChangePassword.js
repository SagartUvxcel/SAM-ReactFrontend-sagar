import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import changePassImg from "../../images/changePassword.svg";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";

const ChangePassword = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  const setHeaderAndUrl = () => {
    let userId = "";
    if (data) {
      userId = data.userId;
    }
    let url = `/sam/v1/customer-registration/`;

    return [url, userId];
  };

  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    currentPassword: "",
    newPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
  });

  const [changePasswordBtnClassName, setChangePasswordBtnClassName] =
    useState("");

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });
  const { alertMsg, alertClr, alertVisible } = alertDetails;
  // Used to navigate to particular page.
  const goTo = useNavigate();

  const {
    currentPassword,
    newPassword,
    invalidMessage1,
    eyeIcon,
    eyeIcon2,
    passwordType1,
    passwordType2,
  } = details;

  // Function to check if the password satisfies the given password condition.
  const onPasswordsBlur = (e) => {
    const { name, value } = e.target;
    if (name === "new-password") {
      const regexForPassword =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
      if (value) {
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
    }
  };

  // Onchange function for both password fields.
  const onPasswordsChange = (e) => {
    const { name, value } = e.target;
    if (name === "new-password") {
      setDetails({
        ...details,
        newPassword: value,
        invalidMessage1: "",
      });
    } else if (name === "current-password") {
      setDetails({
        ...details,
        currentPassword: value,
      });
    }
  };

  const displayPasswordInputs = () => {
    setDetails({
      ...details,
      eyeIcon: "eye",
      passwordType1: "text",
      eyeIcon2: "eye",
      passwordType2: "text",
    });
  };

  // On setPassWord Button click this function will run.
  const onChangePasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (currentPassword === newPassword) {
      displayPasswordInputs();
      setAlertDetails({
        alertMsg: "New password can not be the same as your current password",
        alertVisible: true,
        alertClr: "danger",
      });
    } else if (
      currentPassword !== newPassword &&
      invalidMessage1 === "Invalid Password"
    ) {
      displayPasswordInputs();
      setAlertDetails({
        alertMsg: "Invalid New Password",
        alertVisible: true,
        alertClr: "danger",
      });
    } else {
      setChangePasswordBtnClassName("disabled");
      const [url, userId] = setHeaderAndUrl();
      await axios
        .post(`${url}/reset-password`, {
          user_id: userId.toString(),
          old_password: currentPassword,
          new_password: newPassword,
        })
        .then((res) => {
          if (res.data.status === 0) {
            toast.success("Password changed successfully");
            // Clear localStorage.
            localStorage.clear();
            setTimeout(() => {
              // window.location.reload();
              goTo("/login");
            }, 2000);
          } else {
            setChangePasswordBtnClassName("");
            setAlertDetails({
              alertMsg: "Invalid current password",
              alertVisible: true,
              alertClr: "danger",
            });
            displayPasswordInputs();
          }
        });
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

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - CHANGE PASSWORD";
  }, []);

  return (
    <Layout>
      <section className="change-password-wrapper section-padding min-100vh">
        <div className="container mt-5">
          <div className="row justify-content-lg-between justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 order-1 order-lg-2">
              <form onSubmit={onChangePasswordFormSubmit} className="card p-5">
                <h3 className="text-center fw-bold">Change Password</h3>
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
                    <div className="form-group">
                      <label
                        className="text-muted form-label"
                        htmlFor="current-password"
                      >
                        Current Password
                        <span className="text-danger ps-1">*</span>
                      </label>

                      <div className="input-group position-relative">
                        <span className="input-group-text" id="basic-addon1">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          id="current-password"
                          name="current-password"
                          type={passwordType1}
                          className="form-control"
                          onChange={onPasswordsChange}
                          required
                        />
                        <i
                          placeholder={eyeIcon}
                          onClick={changeEyeIcon1}
                          className={`icon-eye-changePassword bi bi-${eyeIcon}`}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 mb-4">
                    <label
                      className="text-muted form-label"
                      htmlFor="new-password"
                    >
                      New Password
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <div className="form-group">
                      <div className="input-group position-relative">
                        <span className="input-group-text" id="basic-addon1">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          id="new-password"
                          name="new-password"
                          type={passwordType2}
                          className="form-control"
                          onBlur={onPasswordsBlur}
                          onChange={onPasswordsChange}
                          required
                        />
                        <i
                          placeholder={eyeIcon}
                          onClick={changeEyeIcon2}
                          className={`icon-eye-changePassword bi bi-${eyeIcon2}`}
                        ></i>
                      </div>
                    </div>

                    <span
                      className={`pe-1 text-danger ${
                        invalidMessage1 ? "" : "d-none"
                      }`}
                    >
                      {invalidMessage1}
                    </span>

                    <span className="text-muted password-condition">
                      Password should contain at least 1 uppercase letter, 1
                      lowercase letter, 1 number, 1 special character and should
                      be 8-15 characters long.
                    </span>
                  </div>
                  <div className="col-lg-12">
                    <button
                      type="submit"
                      className={`btn btn-primary common-btn-font w-100 ${changePasswordBtnClassName}`}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-xl-5 col-lg-6 col-md-8 my-5 my-lg-0 order-2 order-lg-1">
              <img src={changePassImg} alt="" className="set-pass-img" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChangePassword;
