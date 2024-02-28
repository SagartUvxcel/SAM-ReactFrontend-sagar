import React, { useState, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import axios from "axios";
import { checkLoginSession, rootTitle } from "../../CommonFunctions";
import { NavLink } from "react-router-dom";
import CommonSpinner from "../../CommonSpinner";

let authHeaders = "";
let role = "";
const Profile = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeaders = { Authorization: data.loginToken };
    role = data.roleId;
  }
  const [userRole, setUserRole] = useState("");
  // To store updated user details.
  const [commonUserDetails, setCommonUserDetails] = useState({});

  // Object destructuring.
  const { mobile_number, locality, user_type, city, state_name, zip, email } =
    commonUserDetails;

  const [orgUserDetails, setOrgUserDetails] = useState({});
  const [mainPageLoading, setMainPageLoading] = useState(false);

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

  // Function will get the data of user whose details are to be edited.
  const getUserProfileDetails = async () => {
    if (data) {
      setUserRole(role);
      const userId = data.userId;
      try {
        await axios
          .get(`/sam/v1/user-registration/auth/${userId}`, {
            headers: authHeaders,
          })
          .then(async (res) => {
            // console.log(res.data);
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
            setMainPageLoading(false);
          });
      } catch (error) {
        setMainPageLoading(false);
      }
    }
  };

  useEffect(() => {
    rootTitle.textContent = "SAM TOOL - PROFILE";
    setMainPageLoading(true);
    if (data) {
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getUserProfileDetails();
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      {mainPageLoading ? (
        <div className="d-flex align-items-center justify-content-center min-100vh">
          <CommonSpinner
            spinnerColor="primary"
            height="4rem"
            width="4rem"
            spinnerType="grow"
          />
        </div>
      ) : (
        <section className="profile-wrapper section-padding min-100vh bg-light">
          <div className="container-fluid wrapper">
            <div className="row">
              {/* Personal Details or Organization Details*/}
              <div className="col-xl-4 col-lg-6">
                <div className="profile-top-cards p-2">
                  <div className="card-body text-center">
                    <div className="d-flex justify-content-center">
                      <div className="profile-icon-wrapper text-center">
                        <i
                          className={`bi ${user_type === 1
                            ? "bi-laptop-fill"
                            : "bi-person-square"
                            } fs-1 text-white`}
                        ></i>
                      </div>
                    </div>
                    <h3 className="text-center text-primary pt-2">
                      {user_type === 0
                        ? "Personal Details"
                        : "Organization Details"}
                    </h3>
                    <div className="profile-top-hr my-3" />
                    <div className="row">
                      <div className="col-6">
                        <div className="card py-2 profile-inner-card">
                          {user_type === 0 ? (
                            <>
                              <h6>USER NAME</h6>
                              <small>
                                {first_name} {last_name}
                              </small>
                            </>
                          ) : (
                            <>
                              <h6>COMPANY NAME</h6>
                              <small>{company_name}</small>
                            </>
                          )}
                        </div>
                      </div>
                      {user_type === 1 ? (
                        <>
                          <div className="col-6">
                            <div className="card py-2 profile-inner-card">
                              <h6>ORGANIZATION TYPE</h6>
                              <small>{organization_type}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>CIN</h6>
                              <small>{cin_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>TAN</h6>
                              <small>{tan_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>GST</h6>
                              <small>{gst_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>EMAIL</h6>
                              <small>{email}</small>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-6">
                            <div className="card py-2 profile-inner-card">
                              <h6>MOBILE</h6>
                              <small>{mobile_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>PAN</h6>
                              <small>{pan_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>AADHAAR</h6>
                              <small>{aadhar_number}</small>
                            </div>
                          </div>
                          <div className="col-6 mt-4">
                            <div className="card py-2 profile-inner-card">
                              <h6>EMAIL</h6>
                              <small>{email}</small>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="col-6 mt-4">
                        <div className="card py-2 profile-inner-card">
                          <h6>USER TYPE</h6>
                          <small>
                            {user_type === 0
                              ? "Individual User"
                              : user_type === 1
                                ? "Organizational User"
                                : user_type === 2
                                  ? "Bank User"
                                  : ""}
                          </small>
                        </div>
                      </div>
                      <div className="col-6 mt-4">
                        <div className="card py-2 profile-inner-card">
                          <h6>USER ROLE</h6>
                          <small>
                            {userRole === 1
                              ? "Admin"
                              : userRole === 2
                                ? "Editor"
                                : "Viewer"}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Address Details */}
              <div className="col-xl-4 col-lg-6 mt-4 mt-lg-0">
                <div className="profile-top-cards p-2">
                  <div className="card-body text-center">
                    <div className="d-flex justify-content-center">
                      <div className="profile-icon-wrapper text-center">
                        <i className="bi bi-geo-alt-fill fs-1 text-white"></i>
                      </div>
                    </div>
                    <h3 className="text-center text-primary pt-2">
                      Address Details
                    </h3>
                    <div className="profile-top-hr my-3" />
                    <div className="row justify-content-center">
                      <div className="col-6">
                        <div className="card py-2 profile-inner-card">
                          <h6>LOCALITY</h6>
                          <small>{locality}</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card py-2 profile-inner-card">
                          <h6>STATE</h6>
                          <small>{state_name}</small>
                        </div>
                      </div>
                      <div className="col-6 mt-4">
                        <div className="card py-2 profile-inner-card">
                          <h6>CITY</h6>
                          <small>{city}</small>
                        </div>
                      </div>
                      <div className="col-6 mt-4">
                        <div className="card py-2 profile-inner-card">
                          <h6>ZIP</h6>
                          <small>{zip}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Access*/}
              <div className="col-xl-4 col-lg-6 mt-4 mt-xl-0">
                <div className="profile-top-cards p-2">
                  <div className="card-body text-center">
                    <div className="d-flex justify-content-center">
                      <div className="profile-icon-wrapper text-center">
                        <i className="bi bi-globe2 fs-1 text-white"></i>
                      </div>
                    </div>
                    <h3 className="text-center text-primary pt-2">
                      Quick Access
                    </h3>
                    <div className="profile-top-hr my-3" />
                    <div className="row justify-content-md-start justify-content-center">
                      {/* CHANGE PASSWORD */}
                      <div className="col-md-6">
                        <NavLink
                          to="/change-password"
                          className="card py-2 profile-inner-card text-decoration-none"
                        >
                          <h6 className="m-0 titleBtn">CHANGE PASSWORD</h6>
                        </NavLink>
                      </div>
                      {/* EDIT PROFILE */}
                      <div className="col-md-6 mt-2 mt-md-0">
                        <NavLink
                          to="/edit-details"
                          className="card py-2 profile-inner-card text-decoration-none"
                        >
                          <h6 className="m-0 titleBtn">EDIT PROFILE</h6>
                        </NavLink>
                      </div>
                      {/*ADMINISTRATION */}
                      <div
                        className={`col-md-6 mt-2 mt-md-4 ${userRole === 1 ? "" : "d-none"
                          }`}
                      >
                        <NavLink
                          to="/admin"
                          className="card py-2 profile-inner-card text-decoration-none"
                        >
                          <h6 className="m-0 titleBtn">ADMINISTRATION</h6>
                        </NavLink>
                      </div>
                      {/* update security questions answer */}
                      <div className="col-md-6 mt-2 mt-md-4">
                        <NavLink
                          to="/security-question"
                          className="card py-2 profile-inner-card text-decoration-none"
                        >
                          <h6 className="m-0 titleBtn">SECURITY QUESTION</h6>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Profile;
