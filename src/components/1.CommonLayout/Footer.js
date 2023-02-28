import React from "react";

function Footers() {
  return (
    <footer className="footer-wrapper footer-bg">
      <div className="container-fluid fluid-div">
        <div className="row justify-content-center">
          <div className="col-12 mt-4">
            <div className="footer-icons-wrapper">
              <div className="footer-icon-div">
                <i className="bi bi-facebook footer-icon"></i>
              </div>
              <div className="footer-icon-div">
                <i className="bi bi-linkedin footer-icon"></i>
              </div>
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
