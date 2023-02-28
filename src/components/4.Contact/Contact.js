import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { rootTitle } from "../../CommonFunctions";
import Layout from "../1.CommonLayout/Layout";

import {
  LoadCanvasTemplate,
  loadCaptchaEnginge,
  validateCaptcha,
} from "react-simple-captcha";

const Contact = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email_address: "",
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

  const { full_name, email_address, message } = formData;
  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "full_name") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "email_address") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "message") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      e.target.reset();
      toast.success("Message sent successfully");
      console.log(formData);
      setLoading(false);
      setCaptchaVerified(false);
    }, 1500);
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
                          name="full_name"
                          type="text"
                          className="form-control contact-us-form-control"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          onChange={onInputChange}
                          type="email"
                          name="email_address"
                          className="form-control contact-us-form-control"
                          placeholder="Email Address"
                          required
                        />
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
                        className={`btn btn-primary w-100 mt-3 ${
                          loading ? "disabled" : ""
                        }`}
                        style={{ borderRadius: "0" }}
                        disabled={
                          full_name &&
                          email_address &&
                          message &&
                          captchaVerified
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
