import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import securityQuestionImg from "../../images/securityQuestionImg.svg";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import CommonSpinner from "../../CommonSpinner";


let authHeader = "";
const SecurityQuestion = () => {

    // user data login or not
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeader = { Authorization: data.loginToken };
    }


    // on input focus
    const handleFocus = (e) => {
        e.target.nextSibling.classList.add('active');
    };

    // on click on label
    const handleClick = (inputId) => {
        const input = document.getElementById(inputId);
        input.focus();
    };

    // on input blur
    const onInputBlur = (e) => {
        const { value } = e.target;
        if (!value) {
            e.target.nextSibling.classList.remove('active');
        }
    }


    const [loading, setLoading] = useState(false);
    const [alertDetails, setAlertDetails] = useState({
        alertVisible: false,
        alertMsg: "",
        alertClr: "",
    });
    const { alertMsg, alertClr, alertVisible } = alertDetails;
    const [details, setDetails] = useState({
        invalidCurrentPasswordMsg: "",
        eyeIcon: "eye-slash",
        passwordEyeIcon: "eye-slash",
        answerType: "password",
        passwordType: "password",
        questionNotSelectedMessage: "",
        answerNotSelectedMessage: "",
    });
    const {
        invalidCurrentPasswordMsg,
        eyeIcon,
        passwordEyeIcon,
        answerType,
        passwordType,
        questionNotSelectedMessage,
        answerNotSelectedMessage,
    } = details;

    // Toggle the eye-icon to show and hide password for field 1.
    const changeEyeIcon1 = () => {
        if (passwordEyeIcon === "eye-slash") {
            setDetails({ ...details, passwordEyeIcon: "eye", passwordType: "text" });
        } else if (passwordEyeIcon === "eye") {
            setDetails({
                ...details,
                passwordEyeIcon: "eye-slash",
                passwordType: "password",
            });
        }
    };

    // if question already set and present in database
    const [securityQuestionsFromDatabase, setSecurityQuestionsFromDatabase] = useState({
        questionExist: false,
        question_id: 0,
        questionFromDatabase: "",
    });
    const { questionFromDatabase } = securityQuestionsFromDatabase;

    // question list from database
    const [securityQuestionsList, setSecurityQuestionsList] = useState([]);

    // set data for post 
    const [securityQuestionsDetails, setSecurityQuestionsDetails] = useState({
        id: "",
        answer: ""
    });

    // Function getSecurityQuestionList.
    const getSecurityQuestionList = async () => {

        try {
            const { data } = await axios.get("/sam/v1/customer-registration/security-questions");
            if (data) {
                setSecurityQuestionsList(data);
            }
        } catch (error) {
        }
    };

    // Function getSecurityQuestionList.
    const getUpdatedSecurityQuestion = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/sam/v1/customer-registration/auth/get/security-question", {
                headers: authHeader,
            });
            if (data.question_id !== 0) {
                setSecurityQuestionsFromDatabase({
                    questionExist: true,
                    question_id: data.question_id,
                    questionFromDatabase: data.question,
                })
                setLoading(false);
            } else {
                setSecurityQuestionsFromDatabase({
                    questionExist: false,
                    question_id: "",
                    questionFromDatabase: "",
                })
                setLoading(false);
            }
        } catch (error) {
            setSecurityQuestionsFromDatabase({
                questionExist: false,
                questionFromDatabase: "",
            })
            setLoading(false);
        }
    };

    // Toggle the eye-icon to show and hide password for field 2.
    const changeEyeIcon = () => {
        if (eyeIcon === "eye-slash") {
            setDetails({ ...details, eyeIcon: "eye", answerType: "text" });
        } else if (eyeIcon === "eye") {
            setDetails({
                ...details,
                eyeIcon: "eye-slash",
                answerType: "password",
            });
        }
    };

    // Function to check if the password satisfies the given password condition.
    const onPasswordsBlur = (e) => {
        const { name, value } = e.target;
        if (!value) {
            e.target.nextSibling.classList.remove('active');
        }
        if (name === "currentPassword") {
            const regexForPassword =
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
            if (value) {
                if (value.match(regexForPassword)) {
                    setSecurityQuestionsDetails({
                        ...securityQuestionsDetails,
                        currentPassword: value,
                    });
                    setDetails({
                        ...details,
                        invalidCurrentPasswordMsg: "",
                    });
                } else {
                    setDetails({
                        ...details,
                        invalidCurrentPasswordMsg: "Invalid Password",
                    });
                }
            }
        }
    }
    // Onchange function for both password fields.
    const onSecurityQuestionAnswerChange = (e) => {
        const { name, value } = e.target;
        if (name === "currentPassword") {
            const regexForPassword =
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
            if (value) {
                if (value.match(regexForPassword)) {
                    setSecurityQuestionsDetails({
                        ...securityQuestionsDetails,
                        currentPassword: value,
                    });
                    setDetails({
                        ...details,
                        invalidCurrentPasswordMsg: "",
                    });
                } else {
                    setDetails({
                        ...details,
                        invalidCurrentPasswordMsg: "Invalid Password",
                    });
                }
            }
        } else if (name === "securityQuestions") {
            if (securityQuestionsList.filter(obj => obj.id === value)) {
                setSecurityQuestionsDetails({
                    ...securityQuestionsDetails,
                    id: value,
                });
                setDetails({
                    ...details,
                    questionNotSelectedMessage: "",
                });

            } else {
                setSecurityQuestionsDetails({
                    ...securityQuestionsDetails,
                    id: "",
                });
            }

            if (value === "0") {

            }
        } else if (name === "securityAnswer") {
            setSecurityQuestionsDetails({
                ...securityQuestionsDetails,
                answer: value.trim(),
            });
            setDetails({
                ...details,
                answerNotSelectedMessage: "",
            });
        }
    };

    // on form submit 
    const onSecurityQuestionAnswerSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (securityQuestionsDetails.id.length === 0) {
            setAlertDetails({
                alertVisible: true,
                alertClr: "warning",
                alertMsg: "Please fill all the field.",
            });
            setLoading(false);
        } else {
            const dataToPost = JSON.stringify({
                "security_question_id": parseInt(securityQuestionsDetails.id),
                "security_answer": securityQuestionsDetails.answer,
                "password": securityQuestionsDetails.currentPassword
            })
            try {
                await axios
                    .post(
                        `/sam/v1/customer-registration/auth/update/security-question`, dataToPost, {
                        headers: authHeader,
                    })
                    .then((res) => {
                        if (res.data.status === 0) {
                            getUpdatedSecurityQuestion();
                            e.target.reset();
                            toast.success("Security details updated successfully.")
                            setLoading(false);
                            setAlertDetails({
                                alertVisible: false,
                                alertClr: "",
                                alertMsg: "",
                            });
                        } else {
                            setLoading(false);
                            setAlertDetails({
                                alertVisible: true,
                                alertClr: "warning",
                                alertMsg: "Something went wrong",
                            });
                        }
                    });
            } catch (error) {
                setLoading(false);
                setAlertDetails({
                    alertVisible: true,
                    alertClr: "danger",
                    alertMsg: error.response.data.error,
                });
            }
        }
    }

    useEffect(() => {
        rootTitle.textContent = "SAM TOOL - SECURITY QUESTION";
        getSecurityQuestionList();
        getUpdatedSecurityQuestion();
    }, []);

    return (
        <Layout>
            <section className="security-question-wrapper section-padding min-100vh">
                <div className="container mt-3">
                
          {/* back btn to View Profile */}
          <div className="col-md-4 col-6 text-start mb-3">
            <NavLink
              to="/profile"
              className="ms-4 text-decoration-none"
            >
              <i className="bi bi-arrow-left"></i> Back
            </NavLink>
          </div>
                    <div className="row justify-content-lg-between justify-content-center p-2 p-md-0 mb-3">
                        {/* /form box */}
                        <div className="col-xl-6 col-lg-6 col-md-8 order-1 order-lg-2 security-question-box card px-sm-5 pb-5 px-4 pb-sm-5 pt-4">
                            <h4 className="text-center fw-bold">Your Security Questions</h4>
                            {loading ? (
                                <div
                                    className="d-flex justify-content-center align-items-center"
                                    style={{ minHeight: "60vh" }}
                                >
                                    <CommonSpinner
                                        spinnerColor="primary"
                                        height="2rem"
                                        width="2rem"
                                        spinnerType="grow"
                                    />
                                </div>
                            ) : (
                                <>
                                        <hr />
                                    <form className=" " onSubmit={onSecurityQuestionAnswerSubmit}>
                                        {/* alert msg div */}
                                        <div
                                            className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? alertMsg : "d-none"
                                                }`}
                                            role="alert"
                                        >
                                            <span>
                                            </span>
                                            <small className="fw-bold">{alertMsg}</small>
                                            <i
                                                onClick={() => setAlertDetails({ alertVisible: false })}
                                                className="bi bi-x login-alert-close-btn close"
                                            ></i>
                                        </div>
                                        <div className="row mt-3">
                                            {/* question */}
                                            <div className="col-lg-12 mb-3">
                                                <div className="form-group position-relative custom-class-form-div mb-2">
                                                    <select
                                                        id="securityQuestions"
                                                        name="securityQuestions"
                                                        className="form-select custom-input"
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        onBlur={onInputBlur}
                                                        onFocus={handleFocus}
                                                        required
                                                    >
                                                        <option className="text-gray" hidden > </option>
                                                        {securityQuestionsList ? (
                                                            securityQuestionsList.map((data, index) => {
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
                                                    <label className="px-0 security-question-label " htmlFor="securityQuestions" onClick={() => handleClick('securityQuestions')} >Security Question <span className="text-danger ">*</span></label>

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
                                            <div className="col-lg-12 mb-3 " >
                                                <div className="form-group position-relative custom-class-form-div mb-2">
                                                    <input
                                                        id="securityAnswer"
                                                        name="securityAnswer"
                                                        type={answerType}
                                                        className="form-control custom-input"
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        onBlur={onInputBlur}
                                                        onFocus={handleFocus}
                                                        required
                                                    />
                                                    <label className="px-0 pb-2 security-question-label    " htmlFor="securityAnswer" onClick={() => handleClick('securityAnswer')} >Answer <span className="text-danger ">*</span></label>
                                                    <i
                                                        placeholder={eyeIcon}
                                                        onClick={changeEyeIcon}
                                                        className={`icon-eye-setpass bi bi-${eyeIcon}`}
                                                    ></i>
                                                </div>
                                                {answerNotSelectedMessage ? (
                                                    <span className="pe-1 text-danger">
                                                        {answerNotSelectedMessage}
                                                    </span>
                                                ) : (
                                                    <span className="d-none"></span>
                                                )}
                                            </div>
                                            {/*current password */}
                                            <div className="col-lg-12 mb-3">
                                                <div className="form-group position-relative custom-class-form-div">
                                                    <input
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        type={passwordType}
                                                        className="form-control custom-input "
                                                        onBlur={onPasswordsBlur}
                                                        onFocus={handleFocus}
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        required
                                                    />
                                                    <label className="px-0 pb-2 security-question-label  " htmlFor="currentPassword" onClick={() => handleClick('currentPassword')} >Current Password <span className="text-danger ">*</span></label>

                                                    <i
                                                        placeholder={eyeIcon}
                                                        onClick={changeEyeIcon1}
                                                        className={`icon-eye-setpass bi bi-${passwordEyeIcon}`}
                                                    ></i>
                                                </div>
                                                {invalidCurrentPasswordMsg ? (
                                                    <span className="pe-1 text-danger">
                                                        {invalidCurrentPasswordMsg}
                                                    </span>
                                                ) : (
                                                    <span className="d-none"></span>
                                                )}
                                            </div>
                                            {/* submit button */}
                                            <div className="col-lg-12 mt-3">
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
                                                            Setting....
                                                        </>
                                                    ) : (<>
                                                        {questionFromDatabase.length === 0 ? ("Set Security Question") : ("Update Security Question")}
                                                    </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                    <small className="need-help-link mt-3">
                                        <div> Need Help?
                                            <NavLink to="/contact" className="fw-bold ps-1">
                                                click here
                                            </NavLink></div>
                                    </small>
                                </>
                            )}
                        </div>
                        {/* order 2 image */}
                        <div className="col-xl-5 col-lg-6 col-md-8 my-5 my-lg-0 order-2 order-lg-1 ">
                            <img src={securityQuestionImg} alt="" className="set-pass-img  p-4" />
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default SecurityQuestion