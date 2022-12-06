import React from "react";
import Layout from "../1.CommonLayout/Layout";

const Contact = () => {
  return (
    <Layout>
      <section className="contact-wrapper min-100vh">
        <div className="contact-bg-img">
          <div className="container-fluid text-white">
            <div className="row ps-5">
              <p className="fw-bolder contact-title" style={{ marginBottom: "-11px" }}>
                CONTACT US
              </p>
              <small className="contact-subtitle">Home / Contact Us</small>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
