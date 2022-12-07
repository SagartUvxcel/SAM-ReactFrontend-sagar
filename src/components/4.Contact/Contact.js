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
            <div className="col-xl-10">
              <form className="card bg-white shadow contact-form py-3 px-2">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-7">
                      <span>
                        <i class="bi bi-person-vcard"></i>
                      </span>
                      <span className="fw-bold fs-5 getintouch-text">Get In Touch</span>
                    </div>
                    <div className="col-5 bg-light">col-5</div>
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