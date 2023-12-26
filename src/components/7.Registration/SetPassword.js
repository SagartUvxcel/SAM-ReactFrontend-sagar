import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import setPassImg from "../../images/setpass.svg";
import { rootTitle } from "../../CommonFunctions";

// const passwordSecurityQuestions = [
//   { id: 1, question: "What city were you born in?" },
//   { id: 2, question: "What is your mother's maiden name?" },
//   { id: 3, question: "What is the name of your first pet?" },
//   { id: 4, question: "Who was your childhood hero?" },
//   { id: 5, question: "What high school did you attend?" },
// ]

const SetPassword = () => {
  //  Important variables for storing password data as well as validation data.
  const [details, setDetails] = useState({
    newPassword: "",
    confirmPassword: "",
    invalidMessage1: "",
    eyeIcon: "eye-slash",
    eyeIcon2: "eye-slash",
    passwordType1: "password",
    passwordType2: "password",
    questionNotSelectedMessage: "",
    answerNotSelectedMessage: "",
  });

  const [securityQuestions, setSecurityQuestions] = useState([]);

  const [securityQuestionsDetails, setSecurityQuestionsDetails] = useState({
    id: "",
    answer: ""
  });
  const { id, answer } = securityQuestionsDetails;
  const answerInput = useRef();
  const [loading, setLoading] = useState(false);
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
    questionNotSelectedMessage,
    answerNotSelectedMessage,
  } = details;

  // Function getSecurityQuestion.
  const getSecurityQuestion = async () => {

    try {
      const { data } = await axios.get("/sam/v1/customer-registration/security-questions");
      // console.log(data);
      if (data) {
        setSecurityQuestions(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to check if the password satisfies the given password condition.
  const onPasswordsBlur = (e) => {
    const { name, value } = e.target;
    if (name === "setPassword") {
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
    if (name === "setPassword") {
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

  // console.log(securityQuestionsDetails);
  // Onchange function for both password fields.
  const onSecurityQuestionAnswerChange = (e) => {
    const { name, value } = e.target;
    if (name === "securityQuestions") {
      if (securityQuestions.filter(obj => obj.id === value)) {
        setSecurityQuestionsDetails({
          ...securityQuestionsDetails,
          id: value,
        });
        answerInput.current.classList.remove("d-none");
        setDetails({
          ...details,
          questionNotSelectedMessage: "",
        });

      } else {
        setSecurityQuestionsDetails({
          ...securityQuestionsDetails,
          id: "",
        });
        answerInput.current.classList.add("d-none");
      }

      if (value === "0") {
        answerInput.current.classList.add("d-none");

      }
    } else if (name === "securityAnswer") {
      // console.log(value);
      setSecurityQuestionsDetails({
        ...securityQuestionsDetails,
        answer: value,
      });
      setDetails({
        ...details,
        answerNotSelectedMessage: "",
      });
    }
    // console.log(securityQuestionsDetails);

  };

  // On setPassWord Button click this function will run.
  const onSetPasswordFormSubmit = async (e) => {
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
    } else if (id === "") {
      setDetails({
        ...details,
        questionNotSelectedMessage: "Please select security question",
      });
    } else if (answer === "") {
      setDetails({
        ...details,
        answerNotSelectedMessage: "Please enter your answer",
      });
    } else {
      setLoading(true);
      try {
        await axios
          .post(
            `/sam/v1/customer-registration/set-password`,
            JSON.stringify({
              password: newPassword,
              token: localStorage.getItem("token"),
              security_question_id: parseInt(id),
              security_question_answer: answer.trim(),
            })
          )
          .then((res) => {
            if (res.data.status === 0) {
              setLoading(false);
              e.target.reset();
              toast.success("Password Saved Successfully !");
              localStorage.removeItem("token");
              goTo("/login");
            } else {
              setLoading(false);
              setAlertDetails({
                alertVisible: true,
                alertMsg: "Internal server error",
                alertClr: "warning",
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
    rootTitle.textContent = "SAM TOOL - SET PASSWORD";
    getSecurityQuestion();
  });

  return (
    <Layout>
      <section className="set-password-wrapper section-padding min-100vh">
        <div className="container my-5">
          <div className="row justify-content-lg-between justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <form onSubmit={onSetPasswordFormSubmit} className="card px-5 py-3">
                <h3 className="text-center fw-bold">Set Password</h3>
                <hr />
                <div
                  className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? "" : "d-none"
                    }`}
                  role="alert"
                >
                  <span>
                    <i
                      className={`bi bi-exclamation-triangle-fill me-2 ${alertClr === "danger" || alertClr === "warning"
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
                <div className="row mt-1">
                  {/* password */}
                  <div className="col-lg-12 mb-3">
                    <div className="form-group position-relative">
                      <label className="text-muted" htmlFor="set-password">
                        Password<span className="text-danger ps-1">*</span>
                      </label>
                      <input
                        id="set-password"
                        name="setPassword"
                        type={passwordType1}
                        className="form-control"
                        onBlur={onPasswordsBlur}
                        onChange={onPasswordsChange}
                        required
                      />

                      <i
                        placeholder={eyeIcon}
                        onClick={changeEyeIcon1}
                        className={`icon-eye-setpass bi bi-${eyeIcon}`}
                      ></i>
                    </div>
                    {invalidMessage1 ? (
                      <span className="pe-1 text-danger">
                        {invalidMessage1}
                      </span>
                    ) : (
                      <span className="d-none"></span>
                    )}
                    <p className="text-muted password-condition mt-2">
                      Password should contain at least 1 uppercase letter, 1
                      lowercase letter, 1 number, 1 special character and should
                      be 8-15 characters long.
                    </p>
                  </div>
                  {/* confirm password */}
                  <div className="col-lg-12 mb-3">
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
                        className={`icon-eye-setpass bi bi-${eyeIcon2}`}
                      ></i>
                    </div>
                  </div>
                  {/* question */}
                  <div className="col-lg-12 mb-3">
                    <label className="text-muted" htmlFor="confirm-password">
                      Update your security questions
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <div className="form-group position-relative">
                      <select
                        id="securityQuestions"
                        name="securityQuestions"
                        className="form-select  form-control ps-3 mt-2"
                        onChange={onSecurityQuestionAnswerChange}
                        // placeholder="Select your question"
                        // value={formData.bank_name}
                        required
                      >
                        {/* <option value="" className="text-gray"  > Select Your Question</option> */}
                        <option className="text-gray" hidden >Select Your Security Question</option>
                        {securityQuestions ? (
                          securityQuestions.map((data, index) => {
                            return (
                              <option
                                key={index}
                                value={data.question_id}
                              >
                                {data.question}
                              </option>
                            );

                          })
                        ) : (
                          <> </>
                        )}
                      </select>

                    </div>
                    {questionNotSelectedMessage ? (
                      <span className="pe-1 text-danger">
                        {questionNotSelectedMessage}
                      </span>
                    ) : (
                      <span className="d-none"></span>
                    )}
                  </div>
                  {/* Answer */}
                  <div className="col-lg-12 mb-3 d-none" ref={answerInput}>
                    <label className="text-muted" htmlFor="confirm-password">
                      Answer
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <div className="form-group position-relative">
                      <input
                        id="securityAnswer"
                        name="securityAnswer"
                        type="text"
                        className="form-control"
                        onChange={onSecurityQuestionAnswerChange}

                      />

                    </div>
                    {answerNotSelectedMessage ? (
                      <span className="pe-1 text-danger">
                        {answerNotSelectedMessage}
                      </span>
                    ) : (
                      <span className="d-none"></span>
                    )}
                  </div>
                  {/* set password button */}
                  <div className="col-lg-12">
                    <button
                      disabled={loading ? true : false}
                      type="submit"
                      className="btn btn-primary common-btn-font w-100"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-grow spinner-grow-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Setting password....
                        </>
                      ) : (
                        "Set password"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-xl-5 col-lg-6 col-md-8 my-5 my-lg-0">
              <img src={setPassImg} alt="" className="set-pass-img" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SetPassword;
