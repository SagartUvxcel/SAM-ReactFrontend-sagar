import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { rootTitle } from "../../CommonFunctions";
import Layout from "../1.CommonLayout/Layout";

import {
  LoadCanvasTemplate,
  loadCaptchaEnginge,
  validateCaptcha,
} from "react-simple-captcha";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaErr, setCaptchaErr] = useState(false);
  const captchaRef = useRef();

  const onCaptchaSubmit = (e) => {
    e.preventDefault();
    let user_captcha = captchaRef.current.value;
    if (user_captcha) {
      if (validateCaptcha(user_captcha) === true) {
        setCaptchaVerified(true);
        setCaptchaErr(false);
        loadCaptchaEnginge(6);
        captchaRef.current.value = "";
      } else {
        setCaptchaVerified(false);
        setCaptchaErr(true);
        captchaRef.current.value = "";
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const { name, email, message } = formData;
  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "email") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "message") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onInputBlur = (e) => {
    const { name, value } = e.target;
    var emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (name === "email") {
      if (!emailFormat.test(value.trim())) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (!emailError) {
      setLoading(true);
      console.log(JSON.stringify(formData));
      try {
        await axios
          .post(
            `/sam/v1/customer-registration/contact-details`,
            JSON.stringify(formData)
          )
          .then((res) => {
            console.log(res);
            if (res.data.status === 0) {
              e.target.reset();
              toast.success("Message sent successfully");
              setLoading(false);
              setCaptchaVerified(false);
            } else {
              toast.error("Internal server error");
              setLoading(false);
            }
          });
      } catch (error) {
        toast.error("Internal server error");
        setLoading(false);
      }
    }
  };

  const loadCaptchaOnRefresh = () => {
    loadCaptchaEnginge(6);
    const captchaWrapper =
      document.getElementById("captcha-wrapper").firstChild;
    captchaWrapper.classList.add("flexAndCenter");
    document.getElementById("reload_href").classList.add("d-none");
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - CONTACT";
    loadCaptchaOnRefresh();
  }, []);

  return (
    <Layout>
      <section className="contact-wrapper">
        <div className="contact-bg-img">
          <div className="container-fluid text-white">
            <div className="row contact-first-row">
              <p
                className="fw-bolder contact-title"
                style={{ marginBottom: "-11px" }}
              >
                CONTACT US
              </p>
              <small className="contact-subtitle">Home / Contact Us</small>
            </div>
          </div>
          <div className="contact-social-icons-wrapper">
            <div className="contact-icon-div">
              <i className="bi bi-facebook contact-icon"></i>
            </div>
            <div className="contact-icon-div">
              <i className="bi bi-linkedin contact-icon"></i>
            </div>
          </div>
        </div>
        <div className="container contact-form-wrapper position-relative py-4 py-md-0 min-100vh">
          <div className="row">
            <div className="col-xl-12">
              <form
                onSubmit={onFormSubmit}
                className="card bg-white shadow contact-form py-5 px-3"
              >
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-title mb-4">
                        <span>
                          <i className="bi bi-person-vcard fs-4 me-2"></i>
                        </span>
                        <span className="fw-bold fs-5"> Get In Touch</span>
                      </div>
                      <div className="form-group mb-3">
                        <input
                          onChange={onInputChange}
                          name="name"
                          type="text"
                          className="form-control contact-us-form-control"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          onChange={onInputChange}
                          onBlur={onInputBlur}
                          type="email"
                          name="email"
                          className="form-control contact-us-form-control"
                          placeholder="Email Address"
                          required
                        />
                        <span
                          className={`text-danger ${
                            emailError ? "" : "d-none"
                          }`}
                        >
                          Invalid email address
                        </span>
                      </div>
                      <div className="form-group mb-3">
                        <textarea
                          onChange={onInputChange}
                          style={{ resize: "none" }}
                          name="message"
                          id=""
                          rows="5"
                          className="form-control contact-us-form-control"
                          placeholder="Message"
                          required
                        ></textarea>
                      </div>

                      <div
                        className={`container ${
                          captchaVerified ? "d-none" : ""
                        }`}
                      >
                        <div className="row">
                          <div
                            className="col-xl-9 col-md-8 col-7 ps-0"
                            id="captcha-wrapper"
                          >
                            <LoadCanvasTemplate />
                          </div>
                          <div className="col-xl-3 col-md-4 col-5 btn btn-primary">
                            <i
                              onClick={() => {
                                loadCaptchaEnginge(6);
                              }}
                              className="bi bi-arrow-clockwise"
                            ></i>
                          </div>
                          <div className="col-xl-9 col-md-8 col-7 ps-0 mt-3">
                            <input
                              type="text"
                              className={`form-control ${
                                captchaErr ? "border-danger" : "border-primary"
                              }`}
                              ref={captchaRef}
                              placeholder="Enter captcha"
                            />
                          </div>
                          <div
                            onClick={onCaptchaSubmit}
                            className="col-xl-3 col-md-4 col-5 btn btn-primary mt-3"
                          >
                            Verify
                          </div>
                          <div
                            className={`col-xl-9 ps-0 ${
                              captchaErr ? "" : "d-none"
                            }`}
                          >
                            <span className="text-danger">Invalid Captcha</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`form-group mt-3 ${
                          captchaVerified ? "" : "d-none"
                        }`}
                      >
                        <button className="btn btn-outline-success disabled w-100">
                          Verified
                          <i className="bi bi-patch-check-fill ms-1"></i>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 mt-3"
                        style={{ borderRadius: "0" }}
                        disabled={
                          name &&
                          email &&
                          message &&
                          captchaVerified &&
                          !loading
                            ? false
                            : true
                        }
                      >
                        {loading ? (
                          <>
                            <div
                              className="spinner-grow spinner-grow-sm text-light me-2"
                              role="status"
                            ></div>
                            Sending....
                          </>
                        ) : (
                          <>
                            Send Now <i className="bi bi-arrow-right ps-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="col-md-1 d-md-flex d-none justify-content-center">
                      <div className="vr bg-secondary"></div>
                    </div>
                    <div className="col-md-5 d-flex align-items-center mt-5 mt-md-0">
                      <div className="contact-details">
                        <p>
                          <i className="pe-3 bi bi-envelope-fill text-primary"></i>
                          example@mail.com
                        </p>
                        <p>
                          <i className="pe-3 bi bi-telephone-fill text-primary"></i>
                          464066935, 4567869394
                        </p>
                        <p>
                          <i className="pe-3 bi bi-geo-alt-fill text-primary"></i>
                          Example Address, Location
                        </p>
                      </div>
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

export default Contact;
