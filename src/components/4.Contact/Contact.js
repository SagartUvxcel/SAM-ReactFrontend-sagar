import React from "react";
import Layout from "../1.CommonLayout/Layout";

const Contact = () => {
  return (
    <Layout>
      <section className="contact-wrapper min-100vh">
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
          <div className="contact-social-icons">
            <div className="contact-icon">
              <i className="bi bi-facebook"></i>
            </div>
            <div className="contact-icon ps-4">
              <i className="bi bi-linkedin"></i>
            </div>
          </div>
        </div>
        <div className="container position-relative">
          <div className="row">
            <div className="col-xl-12">
              <form className="card bg-white shadow contact-form py-5 px-3">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-5">
                      <div className="form-title mb-4">
                        <span>
                          <i className="bi bi-person-vcard"></i>
                        </span>
                        <span className="fw-bold fs-5 getintouch-text">
                          Get In Touch
                        </span>
                      </div>
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email Address"
                        />
                      </div>
                      <div className="form-group mb-4">
                        <textarea
                          style={{ resize: "none" }}
                          name="message"
                          id=""
                          rows="5"
                          className="form-control"
                          placeholder="Message"
                        ></textarea>
                      </div>
                      <button
                        className="btn btn-primary w-100"
                        style={{ borderRadius: "0" }}
                      >
                        Send Now <i className="bi bi-arrow-right ps-2"></i>
                      </button>
                    </div>
                    <div className="col-2 d-flex justify-content-center">
                      <div className="vr bg-secondary"></div>
                    </div>
                    <div className="col-5 d-flex align-items-center">
                      <div className="contact-details">
                        <p>
                          <i class="pe-3 bi bi-envelope-fill text-primary"></i>
                          example@mail.com
                        </p>
                        <p>
                          <i class="pe-3 bi bi-telephone-fill text-primary"></i>
                          464066935, 4567869394
                        </p>
                        <p>
                          <i class="pe-3 bi bi-geo-alt-fill text-primary"></i>
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
