import React, { useState, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import axios from "axios";
import { rootTitle } from "../../CommonFunctions";
import { NavLink } from "react-router-dom";

const Profile = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  const [userRole, setUserRole] = useState("");
  // To store updated user details.
  const [commonUserDetails, setCommonUserDetails] = useState({});

  // Object destructuring.
  const { mobile_number, locality, user_type, city, state_name, zip, email } =
    commonUserDetails;

  const [orgUserDetails, setOrgUserDetails] = useState({});

  // Object destructuring.
  const {
    cin_number,
    company_name,
    gst_number,
    organization_type,
    tan_number,
  } = orgUserDetails;

  const [individualUserDetails, setIndividualUserDetails] = useState({});

  // Object destructuring.
  const { first_name, last_name, pan_number, aadhar_number } =
    individualUserDetails;

  // Function will provide login token of user from localStorage and also some urls are stored in this function.
  const setHeaderAndUrl = () => {
    let headers = "";
    let role = "";
    if (data) {
      headers = { Authorization: data.logintoken };
      role = data.roleId;
    }
    let url = `/sam/v1/user-registration/auth`;
    return [headers, url, role];
  };

  // Function will get the data of user whose details are to be edited.
  const getUserProfileDetails = async () => {
    const [headers, url, role] = setHeaderAndUrl();
    if (data) {
      setUserRole(role);
      const userId = data.userId;
      await axios
        .get(`${url}/${userId}`, { headers: headers })
        .then(async (res) => {
          const { individual_user, org_user, user_details } = res.data;
          if (individual_user) {
            const {
              first_name,
              middle_name,
              last_name,
              pan_number,
              aadhar_number,
            } = individual_user;
            setIndividualUserDetails({
              first_name: first_name,
              middle_name: middle_name,
              last_name: last_name,
              pan_number: pan_number,
              aadhar_number: aadhar_number,
            });
          } else if (org_user) {
            const {
              cin_number,
              company_name,
              gst_number,
              organization_type,
              tan_number,
            } = org_user;
            setOrgUserDetails({
              cin_number: cin_number,
              company_name: company_name,
              gst_number: gst_number,
              organization_type: organization_type,
              tan_number: tan_number,
            });
          }
          const {
            user_type,
            mobile_number,
            locality,
            city,
            state_name,
            state_id,
            zip,
            email_address,
            address,
          } = user_details;

          setCommonUserDetails({
            state_id: parseInt(state_id),
            address: address,
            mobile_number: mobile_number,
            locality: locality,
            city: city,
            state_name: state_name,
            zip: zip,
            email: email_address,
            user_type: user_type,
          });
        });
    }
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - PROFILE";
    getUserProfileDetails();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <section className="profile-wrapper section-padding min-100vh">
        <div className="container-fluid wrapper">
          <div className="row justify-content-center">
            <div className="col-12 px-4">
              <div className="row border px-4 py-5 shadow">
                {/* Profile image */}
                <div className="col-md-2 text-center text-md-start">
                  <img
                    src="profile.png"
                    alt="Profile Pic"
                    className="img-fluid"
                  />
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
                        userRole === 1
                          ? "Admin"
                          : userRole === 2
                          ? "Editor"
                          : "Viewer"
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
