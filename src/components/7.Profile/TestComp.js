import React from "react";

const TestComp = () => {
  return (
    <div className="col-12 px-4">
      <div className="row border px-4 py-5 shadow">
        {/* Profile image */}
        <div className="col-md-2 text-center text-md-start">
          <img src="profile.png" alt="Profile Pic" className="img-fluid" />
        </div>
        <div className="col-md-10">
          {/* Name & designation */}
          <div className="row">
            <div className="col-xl-12 text-center text-md-start">
              <span className="fw-bold fs-3 text-primary">
                {user_type === "Individual User"
                  ? `${first_name} ${last_name}`
                  : `${company_name} - (${organization_type})`}
              </span>
              <br />
              <span className="text-muted">{`${user_type} ( ${
                userRole === 1 ? "Admin" : userRole === 2 ? "Editor" : "Viewer"
              } )`}</span>
            </div>
          </div>
          {/* Other details */}
          <div className="row mt-4">
            <div className="col-md-4">
              <p className="text-muted fw-bold">Address</p>
              <span className="text-muted">Locality:</span> {locality}
              <br />
              <span className="text-muted">City:</span> {city}
              <br />
              <span className="text-muted">State:</span> {state_name}
              <br />
              <span className="text-muted">Zip:</span> {zip}
            </div>
            {user_type === "Individual User" ? (
              <div className="col-md-4 mt-4 mt-md-0">
                <p className="text-muted fw-bold">Personal Details</p>
                <span className="text-muted">Mobile Number: </span>
                {mobile_number} <br />
                <span className="text-muted">Pan Number: </span>
                {pan_number} <br />
                <span className="text-muted">Aadhaar Number: </span>
                {aadhar_number} <br />
                <span className="text-muted">Email address: </span>
                {email} <br />
              </div>
            ) : (
              <div className="col-md-4 mt-4 mt-md-0">
                <p className="text-muted fw-bold">Other Details</p>
                <span className="text-muted">Cin Number: </span>
                {cin_number} <br />
                <span className="text-muted">Tan Number: </span>
                {tan_number} <br />
                <span className="text-muted">Gst Number: </span>
                {gst_number} <br />
                <span className="text-muted">Email Address: </span>
                {email} <br />
              </div>
            )}
            <div className="col-md-4 mt-4 mt-md-0">
              <p className="text-muted fw-bold">Quick Links</p>
              <li>
                <NavLink to="/reset-password">Change Password</NavLink>
              </li>
              <li>
                <NavLink to="/edit-details">Edit Details</NavLink>
              </li>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComp;
