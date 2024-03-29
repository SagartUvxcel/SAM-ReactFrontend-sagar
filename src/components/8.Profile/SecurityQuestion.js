import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../1.CommonLayout/Layout";
import securityQuestionImg from "../../images/securityQuestionImg.svg";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import CommonSpinner from "../../CommonSpinner";


let userId = "";
let authHeader = "";
const SecurityQuestion = () => {

    // user data login or not
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeader = { Authorization: data.loginToken };
        userId = data.userId;
    }

    // Used to navigate to particular page.
    const goTo = useNavigate();

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
    const { questionExist, questionFromDatabase } = securityQuestionsFromDatabase;

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
            // console.log(data);
            if (data) {
                setSecurityQuestionsList(data);
            }
        } catch (error) {
            console.log(error);
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
            console.log(error);
            setSecurityQuestionsFromDatabase({
                questionExist: false,
                questionFromDatabase: "",
            })
            setLoading(false);
        }
    };

    // on update security question and answer
    const onUpdateSecurityQuestionAnswer = () => {
        setSecurityQuestionsFromDatabase({
            questionExist: false,
            questionFromDatabase: "",
        })
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
            console.log(dataToPost);
            try {
                await axios
                    .post(
                        `/sam/v1/customer-registration/auth/update/security-question`, dataToPost, {
                        headers: authHeader,
                    }

                    )
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
                <div className="container mt-5">
                    <div className="row justify-content-lg-between justify-content-center p-2 p-md-0 mb-3">
                        <div className="col-xl-6 col-lg-6 col-md-8 order-1 order-lg-2 security-question-box card p-4 p-sm-5">
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
                                    <form className=" " onSubmit={onSecurityQuestionAnswerSubmit}>
                                        <hr />
                                        {/* alert msg div */}
                                        <div
                                            className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center ${alertVisible ? alertMsg : "d-none"
                                                }`}
                                            role="alert"
                                        >
                                            <span>
                                                {/* <i
                                            className={`bi bi-exclamation-triangle-fill me-2 ${alertClr === "danger" || alertClr === "warning"
                                                    ? ""
                                                    : "d-none"
                                                }`}
                                        ></i> */}
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
                                                <label className="text-muted" htmlFor="securityQuestions">
                                                    Security Question
                                                    <span className="text-danger ps-1">*</span>
                                                </label>
                                                <div className="form-group position-relative">
                                                    <select
                                                        id="securityQuestions"
                                                        name="securityQuestions"
                                                        className="form-select  form-control ps-3 mt-2"
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        // placeholder="Select your question"
                                                        // value={securityQuestionsDetails.id}
                                                        required
                                                    >
                                                        {/* <option value="" className="text-gray"  > Select Your Question</option> */}
                                                        <option className="text-gray" hidden >Select Your Security Question</option>
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
                                                <label className="text-muted" htmlFor="securityAnswer">
                                                    Answer
                                                    <span className="text-danger ps-1">*</span>
                                                </label>
                                                <div className="form-group position-relative">
                                                    <input
                                                        id="securityAnswer"
                                                        name="securityAnswer"
                                                        type={answerType}
                                                        className="form-control"
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        required

                                                    />
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
                                                <div className="form-group position-relative">
                                                    <label className="text-muted" htmlFor="current-password">
                                                        Current Password<span className="text-danger ps-1">*</span>
                                                    </label>
                                                    <input
                                                        id="current-password"
                                                        name="currentPassword"
                                                        type={passwordType}
                                                        className="form-control"
                                                        onBlur={onPasswordsBlur}
                                                        onChange={onSecurityQuestionAnswerChange}
                                                        required
                                                    />

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