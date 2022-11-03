import React from "react";

function Footers() {
  return (
    <footer className="footer-wrapper common-full-page-bg">
      <div className="container-fluid fluid-div">
        <div className="row justify-content-center">
          <div className="col-12 mt-4">
            <div className="footer-icons-div">
              <div className="footer-icon">
                <i class="bi bi-facebook"></i>
              </div>
              <div className="footer-icon">
                <i class="bi bi-linkedin"></i>
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
