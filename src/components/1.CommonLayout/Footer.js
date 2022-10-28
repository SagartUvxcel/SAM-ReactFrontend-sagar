import React from "react";
import {
  FaTwitter,
  FaFacebookF,
  FaGooglePlusG,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

function Footers() {
  return (
    <footer className="footer-wrapper common-full-page-bg">
      <div className="container-fluid fluid-div">
        <div className="row justify-content-center">
          <div className="col-12 mt-4">
            <div className="footer-icons-div">
              {/* <div className="footer-icon">{<FaTwitter />}</div> */}
              <div className="footer-icon">{<FaFacebookF />}</div>
              {/* <div className="footer-icon">{<FaGooglePlusG />}</div> */}
              <div className="footer-icon">{<FaLinkedinIn />}</div>
              {/* <div className="footer-icon">{<FaInstagram />}</div> */}
            </div>
          </div>
          <div className="col-12 mt-4">
            <p className="text-center text-white">
              &copy;Copyright SAMREALITY. All Rights Reserved - 2022 <br />
              Terms & Conditions | Privacy Policy |
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footers;
