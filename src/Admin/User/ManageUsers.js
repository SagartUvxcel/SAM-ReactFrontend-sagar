import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import { toast } from "react-toastify";
import BreadCrumb from "../BreadCrumb";
import {
  checkLoginSession,
  toggleClassOfNextPrevPageItems,
} from "../../CommonFunctions";

const records_per_page = 4;
let authHeader = "";
let defaultRoleText = "";
let defaultRoleIds = [];
let rolesToRemove = [];

const ManageUsers = ({ userType }) => {
  const [users, setUsers] = useState([]);
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
  }
  const [otherDetailsOfUser, setOtherDetailsOfUser] = useState({});
  const [categoryWiseUserDetails, setCategoryWiseUserDetails] = useState({});
  const [roles, setRoles] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [displayClassesOfMainSections, setDisplayClassesOfMainSections] =
    useState({
      showAllUsersSectionClass: "",
      viewCurrentUserSectionClass: "d-none",
    });

  const { showAllUsersSectionClass, viewCurrentUserSectionClass } =
    displayClassesOfMainSections;

  const [viewUserDetails, setViewUserDetails] = useState({
    classOnEditClick: "d-none",
    classOnPageLoad: "",
  });

  const url = `/sam/v1/user-registration/auth`;
  const [loading, setLoading] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [confirmDeleteUserBtnDisabled, setConfirmDeleteUserBtnDisabled] =
    useState(true);
  const confirmDeleteInputRef = useRef();
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const getAllUsers = async () => {
    const dataToPost = {
      type: userType,
      page_number: 1,
      number_of_records: records_per_page,
    };
    try {
      await axios
        .post(`${url}/get-users`, dataToPost, { headers: authHeader })
        .then((res) => {
          setUsers(res.data);
          setLoading(false);
        });
      await axios
        .get(`${url}/type-count`, { headers: authHeader })
        .then((res) => {
          let usersCount = null;
          if (userType === 0) {
            usersCount = parseInt(res.data.individual_count);
          } else {
            usersCount = parseInt(res.data.org_count);
          }
          setTotalUsersCount(usersCount);
          setPageCount(Math.ceil(usersCount / records_per_page));
        });
    } catch (error) {
      setLoading(false);
    }
  };

  // This will run when we click any page link in pagination. e.g. prev, 1, 2, 3, 4, next.
  const handlePageClick = async (pageNumber) => {
    window.scrollTo(0, 0);
    let currentPage = pageNumber.selected + 1;
    toggleActivePageClass(currentPage);
    setCurrentPageNumber(currentPage);
    const nextOrPrevPageUsers = await fetchMoreUsers(currentPage);
    setUsers(nextOrPrevPageUsers);
    toggleClassOfNextPrevPageItems();
  };

  // Fetch more users on page click.
  const fetchMoreUsers = async (currentPage) => {
    const dataToPost = {
      type: userType,
      page_number: currentPage,
      number_of_records: records_per_page,
    };
    const usersRes = await axios.post(`${url}/get-users`, dataToPost, {
      headers: authHeader,
    });
    return usersRes.data;
  };

  const onDeleteBtnClick = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(userName);
    confirmDeleteInputRef.current.value = "";
    setConfirmDeleteUserBtnDisabled(true);
  };

  const toggleActivePageClass = (activePage) => {
    let arr = document.querySelectorAll(".page-item");
    arr.forEach((pageItem) => {
      if (parseInt(pageItem.textContent) === activePage) {
        pageItem.classList.add("active");
      } else {
        pageItem.classList.remove("active");
      }
    });
  };

  const deleteUser = async (userId, userName) => {
    try {
      await axios
        .delete(`/sam/v1/user-registration/auth/${userId}`, {
          headers: authHeader,
        })
        .then((res) => {
          if (res.data.status === 0) {
            toast.success(`User ${userName} deleted successfully`);
            confirmDeleteInputRef.current.value = "";
            setConfirmDeleteUserBtnDisabled(true);
            setTotalUsersCount(totalUsersCount - 1);
            if (totalUsersCount - 1 !== 0) {
              let newPageCount = Math.ceil(
                (totalUsersCount - 1) / records_per_page
              );
              setPageCount(newPageCount);
              if (newPageCount < currentPageNumber) {
                handlePageClick({ selected: currentPageNumber - 2 });
              } else {
                handlePageClick({ selected: currentPageNumber - 1 });
              }
            } else {
              setUsers(false);
            }
          } else {
            toast.error("Internal server error");
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  const saveCurrentUserData = async (id) => {
    setSelectedUserId(id);
    if (data) {
      setLoggedInUserId(data.userId);
      // Get user by Id.
      const currentUser = await axios.get(
        `/sam/v1/user-registration/auth/${id}`,
        { headers: authHeader }
      );

      const typeOfUser = Object.keys(currentUser.data)[2];
      setCategoryWiseUserDetails(currentUser.data[typeOfUser]);
      setOtherDetailsOfUser(currentUser.data.user_details);
      let currentRolesArray = currentUser.data.role;
      let roleIdArray = [];
      let arrayOfRoles = [];
      currentRolesArray.forEach((obj) => {
        roleIdArray.push(obj.role_id);
      });

      for (let i of roleIdArray) {
        if (i === 1) {
          arrayOfRoles.push("Admin");
        } else if (i === 2) {
          arrayOfRoles.push("Editor");
        } else if (i === 3) {
          arrayOfRoles.push("Viewer");
        }
      }

      defaultRoleText = arrayOfRoles.join(", ");
      defaultRoleIds = roleIdArray;

      // Get all roles.
      try {
        const allRoles = await axios.get(
          `/sam/v1/user-registration/auth/all-roles`,
          {
            headers: authHeader,
          }
        );
        setRoles(allRoles.data);
      } catch (error) {}
    }
  };

  const editDetails = () => {
    setViewUserDetails({
      classOnEditClick: "",
      classOnPageLoad: "d-none",
    });
    const allChecks = document.querySelectorAll(".roles-checkbox");
    allChecks.forEach((check) => {
      defaultRoleIds.forEach((defaultId) => {
        if (parseInt(check.id) === defaultId) {
          check.checked = true;
        } else {
          check.checked = false;
        }
      });
    });
  };

  const commonFnForSaveAndCancelClick = () => {
    rolesToRemove = [];
    setViewUserDetails({
      classOnEditClick: "d-none",
      classOnPageLoad: "",
    });
    saveCurrentUserData(selectedUserId);
  };

  const cancelEditing = () => {
    commonFnForSaveAndCancelClick();
  };

  const { user_id, email_address, mobile_number, user_type } =
    otherDetailsOfUser;
  const { classOnEditClick, classOnPageLoad } = viewUserDetails;

  const deleteRole = async (data) => {
    let url = "/sam/v1/user-registration/auth/remove-role";
    try {
      await axios.delete(url, {
        headers: authHeader,
        data: data,
      });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  let array = [];

  const onRoleSelect = (e) => {
    const { value, id } = e.target;
    let allChecks = document.querySelectorAll(".roles-checkbox");
    let array1 = [];
    allChecks.forEach((check) => {
      array1.push(check.checked);
    });

    let condition = [...new Set(array1)];
    if (condition.length === 1 && condition[0] === false) {
      alert("User must have at least one role");
      e.target.checked = true;
    } else if (defaultRoleIds.includes(parseInt(id))) {
      if (!e.target.checked) {
        if (
          window.confirm("Are you sure you want to remove existing role?") ===
          true
        ) {
          rolesToRemove.push({
            role_id: parseInt(id),
          });
        } else {
          e.target.checked = true;
        }
      } else {
        rolesToRemove.pop({ role_id: parseInt(id) });
      }
    } else {
      if (e.target.checked) {
        array.push(parseInt(value));
      } else {
        array = array.filter((item) => item !== parseInt(value));
      }
    }
  };

  let rolesToPost = [];
  const saveRoles = async () => {
    for (let i of array) {
      rolesToPost.push({ role_id: i });
    }
    let data = {
      user_id: user_id,
      roles: rolesToRemove,
    };

    if (rolesToRemove.length > 0) {
      deleteRole(data);
    }

    try {
      await axios
        .post(
          `/sam/v1/user-registration/auth/add-role`,
          { user_id: user_id, roles: rolesToPost },
          {
            headers: authHeader,
          }
        )
        .then((res) => {
          if (res.data.status === 0) {
            toast.success("Roles updated successfully");
            commonFnForSaveAndCancelClick();
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  useEffect(() => {
    if (data) {
      setLoading(true);
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getAllUsers();
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className="container-fluid admin-users-wrapper section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div
            className={`col-xl-10 col-lg-9 col-md-8 users-admin ${showAllUsersSectionClass}`}
          >
            <BreadCrumb userType={userType} />
            <div className="mt-4">
              {loading ? (
                <>
                  <CommonSpinner spinnerColor="primary" spinnerType="grow" />
                </>
              ) : !users ? (
                <div className="d-flex align-items-center justify-content-center mt-5">
                  <h1 className="fw-bold custom-heading-color">
                    No Users Found :(
                  </h1>
                </div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table className="table table-bordered table-primary admin-users-table table-striped text-center">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>{userType === 0 ? "Name" : "Company Name"}</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, Index) => {
                          const { email_address, user_id } = user.user_details;
                          let currentRolesArray = user.role;
                          let roleIdArray = [];
                          let arrayOfRoles = [];
                          currentRolesArray.forEach((obj) => {
                            roleIdArray.push(obj.role_id);
                          });

                          for (let i of roleIdArray) {
                            if (i === 1) {
                              arrayOfRoles.push("Admin");
                            } else if (i === 2) {
                              arrayOfRoles.push("Editor");
                            } else if (i === 3) {
                              arrayOfRoles.push("Viewer");
                            }
                          }
                          return (
                            <tr key={Index}>
                              <td>{user_id}</td>
                              <td>
                                {user.individual_user
                                  ? user.individual_user.first_name
                                  : user.org_user
                                  ? user.org_user.company_name
                                  : ""}
                              </td>
                              <td>{email_address}</td>
                              <td>{arrayOfRoles.join(", ")}</td>
                              <td>
                                <li className="nav-item dropdown list-unstyled">
                                  <span
                                    className="nav-link dropdown-toggle"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Select
                                  </span>
                                  <ul
                                    className="dropdown-menu"
                                    aria-labelledby="navbarDropdown"
                                  >
                                    <div
                                      className="dropdown-item"
                                      onClick={() => {
                                        saveCurrentUserData(user_id);
                                        setDisplayClassesOfMainSections({
                                          showAllUsersSectionClass: "d-none",
                                          viewCurrentUserSectionClass: "",
                                        });
                                      }}
                                    >
                                      <i className="bi bi-eye pe-1"></i> View
                                    </div>

                                    <div
                                      data-bs-toggle="modal"
                                      data-bs-target="#confirmDeleteUserModal"
                                      className={`dropdown-item ${
                                        email_address === data.user
                                          ? "d-none"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        onDeleteBtnClick(
                                          user_id,
                                          email_address
                                        );
                                      }}
                                    >
                                      <i className="bi bi-trash pe-2"></i>
                                      Delete
                                    </div>
                                  </ul>
                                </li>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="container mt-4">
                    <div className="row">
                      <Pagination
                        handlePageClick={handlePageClick}
                        pageCount={pageCount}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div
            className={`col-xl-10 col-lg-9 col-md-8 users-admin ${viewCurrentUserSectionClass}`}
          >
            <BreadCrumb
              typeOfUser={user_type}
              emailOfCurrentUser={email_address}
              setDisplayClassesOfMainSections={setDisplayClassesOfMainSections}
              handlePageClick={handlePageClick}
              currentPageNumber={currentPageNumber - 1}
            />
            <section className="admin-edit-user">
              <div className="container-fluid">
                <h2 className="text-center mb-4">
                  {user_type === 0
                    ? `${categoryWiseUserDetails.first_name} ${categoryWiseUserDetails.middle_name} ${categoryWiseUserDetails.last_name}`
                    : `${categoryWiseUserDetails.company_name}`}
                </h2>
                <div className="row justify-content-center">
                  <div className="col-xl-10 col-lg-11">
                    <form
                      action=""
                      className="card shadow p-xl-5 p-lg-4 p-3 position-relative"
                    >
                      <div className="row">
                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="user_id"
                            >
                              USER ID:
                            </label>
                            <br />
                            {user_id}
                          </div>
                        </div>
                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              htmlFor="role"
                              className="form-label fw-bold"
                            >
                              Role
                              <span className={`ms-4 ${classOnPageLoad}`}>
                                <i
                                  onClick={editDetails}
                                  className="bi bi-pencil-square"
                                ></i>
                              </span>
                              <span
                                onClick={cancelEditing}
                                className={`ms-4 ${classOnEditClick}`}
                              >
                                <i className="bi bi-x-square-fill text-danger fs-5"></i>
                              </span>
                              <span
                                onClick={saveRoles}
                                className={`ms-3 ${classOnEditClick}`}
                              >
                                <i className="bi bi-check-square-fill text-success fs-5"></i>
                              </span>
                            </label>
                            <span className={`${classOnPageLoad}`}>
                              <br />
                              {defaultRoleText ? defaultRoleText : ""}
                            </span>

                            <div className={`form-group ${classOnEditClick}`}>
                              {roles.map((data, Index) => {
                                defaultRoleIds.forEach((id) => {
                                  if (id === data.id) {
                                    const defaultRole = document.getElementById(
                                      data.id
                                    );
                                    if (defaultRole) {
                                      defaultRole.checked = true;
                                    }
                                  }
                                });

                                return (
                                  <div
                                    key={Index}
                                    className="form-check form-check-inline"
                                  >
                                    <input
                                      className="form-check-input roles-checkbox"
                                      type="checkbox"
                                      onClick={(e) => {
                                        onRoleSelect(e);
                                      }}
                                      id={data.id}
                                      value={data.id}
                                      disabled={
                                        user_id === loggedInUserId &&
                                        data.id === 1
                                          ? true
                                          : false
                                      }
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="inlineCheckbox1"
                                    >
                                      {data.role}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="user_type"
                            >
                              USER TYPE:
                            </label>
                            <br />
                            {user_type === 0
                              ? "Individual User"
                              : user_type === 1
                              ? "Organizational User"
                              : user_type === 2
                              ? "Bank User"
                              : ""}
                          </div>
                        </div>
                        {/* Show Data As Per User Type*/}
                        {user_type === 0 ? (
                          <>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="first_name"
                                >
                                  First Name:
                                </label>
                                <br />
                                {categoryWiseUserDetails.first_name}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="middle_name"
                                >
                                  Middle Name:
                                </label>
                                <br />
                                {categoryWiseUserDetails.middle_name}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="last_name"
                                >
                                  Last Name:
                                </label>
                                <br />
                                {categoryWiseUserDetails.last_name}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="aadhar_number"
                                >
                                  Aadhaar Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.aadhar_number}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="pan_number"
                                >
                                  PAN Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.pan_number}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="company_name"
                                >
                                  Company Name:
                                </label>
                                <br />
                                {categoryWiseUserDetails.company_name}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="organization_type"
                                >
                                  Organization Type:
                                </label>
                                <br />
                                {categoryWiseUserDetails.organization_type}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="gst_number"
                                >
                                  GST Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.gst_number}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="tan_number"
                                >
                                  TAN Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.tan_number}
                              </div>
                            </div>
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="cin_number"
                                >
                                  CIN Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.cin_number}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="email"
                            >
                              Email:
                            </label>
                            <br />
                            {email_address}
                          </div>
                        </div>
                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              className="form-label fw-bold"
                              htmlFor="phone"
                            >
                              Contact:
                            </label>
                            <br />
                            {mobile_number}
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* Modal */}
      <div
        className="modal fade"
        id="confirmDeleteUserModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm confirm-delete-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Are you sure ?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <label htmlFor="confirm-delete-input" className="form-label">
                Please type <span className="fw-bold">{selectedUserEmail}</span>{" "}
                to confirm.
              </label>
              <input
                onChange={(e) => {
                  if (e.target.value === selectedUserEmail) {
                    setConfirmDeleteUserBtnDisabled(false);
                  } else {
                    setConfirmDeleteUserBtnDisabled(true);
                  }
                }}
                ref={confirmDeleteInputRef}
                type="text"
                name="confirm-delete-email"
                id="confirm-delete-input"
                className="form-control"
              />
              <button
                onClick={() => {
                  deleteUser(selectedUserId, selectedUserEmail);
                }}
                data-bs-dismiss="modal"
                disabled={confirmDeleteUserBtnDisabled}
                className="btn btn-danger w-100 mt-3 fw-bold"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageUsers;
