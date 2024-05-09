import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom"
import BreadCrumb from "../BreadCrumb";
import {
  checkLoginSession,
  toggleClassOfNextPrevPageItems,
} from "../../CommonFunctions";

const records_per_page = 5;
let initial_page_number = 1;
let authHeader = "";
let roleId = "";
let bank_id = 0;
let defaultRoleText = "";
let defaultRoleIds = [];
let rolesToRemove = [];

const ManageUsers = ({ userType }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const dataFromBankAdminPage = location.state ? location.state.sensitiveData : bank_id > 0 ? bank_id : null;

  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    roleId = data.roleId;
    bank_id = data.bank_id;
  }
  const [otherDetailsOfUser, setOtherDetailsOfUser] = useState({});
  const { user_id, email_address, mobile_number, user_type } =
    otherDetailsOfUser;
  const [categoryWiseUserDetails, setCategoryWiseUserDetails] = useState({});
  const [roles, setRoles] = useState([]);
  const [accountStatus, setAccountStatus] = useState(0);
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
  const [searchTerm, setSearchTerm] = useState("");


  // get All Users data
  const getAllUsers = async (searchInput = "") => {
    setLoading(true);
    if (dataFromBankAdminPage === null) {
      console.log(accountStatus);
      const dataToPost = {
        type: userType,
        page_number: initial_page_number,
        status: accountStatus,
        number_of_records: records_per_page,
        search_input: searchInput
      };
      try {
        await axios
          .post(`${url}/get-users`, dataToPost, { headers: authHeader })
          .then((res) => {
            setUsers(res.data);
            console.log(res.data);
            setLoading(false);
          });
        await axios
          .get(`${url}/type-count`, { headers: authHeader })
          .then((res) => {
            let usersCount = null;
            if (userType === 0) {
              usersCount = parseInt(res.data.individual_count);
            } else if (userType === 1) {
              usersCount = parseInt(res.data.org_count);
            } else {
              usersCount = parseInt(res.data.bank_admin_count);
            }
            setTotalUsersCount(usersCount);
            setPageCount(Math.ceil(usersCount / records_per_page));
          });
      } catch (error) {
        setLoading(false);
      }
    } else {
      const dataToPost = {
        status: accountStatus,
        page_number: 1,
        number_of_records: records_per_page,
        bank_id: dataFromBankAdminPage,
        search_input: searchInput
      }
      try {
        await axios.post(`/sam/v1/bank-registration/auth/bank/user-list`, dataToPost, { headers: authHeader })
          .then((res) => {
            setUsers(res.data.bank_users);

            console.log(res.data.bank_users);
            setLoading(false);
          });
        await axios.get(`${url}/type-count`, { headers: authHeader })
          .then((res) => {
            let usersCount = null;
            if (userType === 0) {
              usersCount = parseInt(res.data.individual_count);
            } else if (userType === 1) {
              usersCount = parseInt(res.data.org_count);
            } else {
              usersCount = parseInt(res.data.bank_admin_count);
            }
            setTotalUsersCount(usersCount);
            setPageCount(Math.ceil(usersCount / records_per_page));
          });
      } catch (error) {
        setLoading(false);
      }
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

    if (dataFromBankAdminPage === null) {
      const dataToPost = {
        type: userType,
        page_number: currentPage,
        number_of_records: records_per_page,
      };
      const usersRes = await axios.post(`${url}/get-users`, dataToPost, {
        headers: authHeader,
      });
      return usersRes.data;
    } else {

      const dataToPost = {
        status: accountStatus,
        page_number: currentPage,
        number_of_records: records_per_page,
        bank_id: dataFromBankAdminPage
      }

      const usersRes = await axios.post(`/sam/v1/bank-registration/auth/bank/user-list`, dataToPost, {
        headers: authHeader,
      });
      return usersRes.data.bank_users;
    }
  };

  // onDeleteBtnClick
  const onDeleteBtnClick = async (userId, userName, roleValue, branchIdDetails, branchNameDetails) => {
    console.log(roleValue, branchIdDetails, branchNameDetails);
    setSelectedUserId(userId);
    setSelectedUserEmail(userName);
    // getAllUsers();
    if (roleValue === "Editor") {
      const dataToPost = {
        "current_branch_id": parseInt(branchIdDetails)
      }
      try {
        await axios.post(`/sam/v1/bank-registration/auth/close-branch-initial-check`, dataToPost, { headers: authHeader })
          .then((res) => {
            const response = res.data
            console.log(response);
            if (response) {
              const sensitiveData = { ...response, branchIdDetails, branchNameDetails, dataFromBankAdminPage };
              navigate(`${roleId === 6 ? "/bank" : "/admin"
                }/users/branch-users/change-user-branch`, { state: { sensitiveData } })
            }
          });

      } catch (error) {
        // setLoading(false);
        console.log(error);
        toast.error(`${error.response.data.error=== 'Not have any other branch'? "No other branch is present to transfer.": "Internal server error"}`)
      }
      // navigate("/");
    } else {
      setConfirmDeleteUserBtnDisabled(true);
    }
  };

  // toggle Active Page Class
  const toggleActivePageClass = (activePage) => {
    let arr = document.querySelectorAll(".page-item");
    arr && arr.forEach((pageItem) => {
      if (parseInt(pageItem.textContent) === activePage) {
        pageItem.classList.add("active");
      } else {
        pageItem.classList.remove("active");
      }
    });
  };

  // delete User
  const deleteUser = async (userId, userName) => {

    const status = accountStatus === 0 ? 1 : 0;
    const dataToPost = {
      "user_id": userId,
      "status": status,
    }
    confirmDeleteInputRef.value = "";
    try {
      await axios
        .put(`/sam/v1/user-registration/auth/change-user-status`, dataToPost, {
          headers: authHeader,
        })
        .then((res) => {
          if (res.data.status === 0) {
            toast.success(`User ${userName} ${roleId === 6 ? "deleted" : `${roleId === 1 && accountStatus === 1 ? "activated" : "deactivated"}`} successfully`);
            setConfirmDeleteUserBtnDisabled(true);
            setAccountStatus(accountStatus);
            getAllUsers();
            console.log(totalUsersCount);
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
              // setUsers([]);
            }
          } else {
            toast.error("Internal server error");
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  // save Current User Data
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
      } catch (error) { }
    }
  };

  // edit Details function
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

  // commonFunction For Save And Cancel Click for form data
  const commonFnForSaveAndCancelClick = () => {
    rolesToRemove = [];
    setViewUserDetails({
      classOnEditClick: "d-none",
      classOnPageLoad: "",
    });
    saveCurrentUserData(selectedUserId);
  };

  // cancelEditing
  const cancelEditing = () => {
    commonFnForSaveAndCancelClick();
  };


  const { classOnEditClick, classOnPageLoad } = viewUserDetails;

  // delete Role
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

  // onRoleSelect
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
    let timeOut;
    if (searchTerm && searchTerm.length > 0) {
      timeOut = setTimeout(() => {
        getAllUsers(searchTerm);
      }, 800)
    }
    return () => clearTimeout(timeOut)
    // eslint-disable-next-line
  }, [searchTerm])


  useEffect(() => {
    if (accountStatus !== null) {
      getAllUsers();
    }
    // eslint-disable-next-line
  }, [accountStatus]);

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

            {/* search filter */}
            <div className="row px-md-4 mt-4 admin-users-filter d-flex justify-content-between flex-wrap">
              {/* set Account Status */}
              <div className=" col-md-5 px-4 px-md-0 ">
                <div className="inner-box d-flex align-items-center col-12">
                  <label htmlFor="state " className="px-3 py-1">User Status:</label>
                  <div className="select-div ms-2 w-md-25 w-50">
                    <select
                      id="state"
                      name="states"
                      className="form-select form-select-sm px-5 py-2"
                      aria-label=".form-select-sm example"
                      onChange={(e) => setAccountStatus(Number(e.target.value))}
                    >
                      <option value={0}>Active</option>
                      <option value={1}>Inactive</option>

                    </select>
                  </div>
                </div>
              </div>
              {/* search */}
              <div className=" col-md-3 p-4 p-md-0 ">
                <div className="search-box d-flex align-items-center position-relative ps-4">
                  <input
                    type="search"
                    placeholder="Search"
                    className="form-control search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fa fa-search text-secondary position-absolute "></i>
                </div>
              </div>
            </div>
            <hr />
            {/* user table */}
            <div className="mt-4">
              {loading ? (
                <>
                  <CommonSpinner spinnerColor="primary" spinnerType="grow" />
                </>
              ) : !users || users.length < 1 ? (
                <div className="d-flex align-items-center justify-content-center mt-5">
                  <h3 className="fw-bold custom-heading-color">
                    No Users Found !
                  </h3>
                </div>
              ) : (
                <>
                  <div className="table-wrapper table-bordered">
                    <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table  text-center ">
                      <thead className="bg-light">
                        <tr className="table-heading-class">
                          <th scope="col" className="">User ID</th>
                          <th>{userType === 0 ? "Name" : userType === 1 ? "Company Name" : userType === 2 ? "Bank Name" : "Branch Name"}</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, Index) => {
                          const { email_address, user_id, } = user.user_details;
                          const { bank_id } = user;
                          let branchIdDetails = dataFromBankAdminPage !== null ? user.bank_user.BranchId : "";
                          let branchNameDetails = dataFromBankAdminPage !== null ? user.bank_user.branch_name : "";
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
                            } else if (i === 6) {
                              arrayOfRoles.push("Bank Admin");
                            }
                          }
                          return (
                            <tr key={Index}>
                              <td className="text-align-center">{user_id}</td>
                              <td>
                                {user.individual_user
                                  ? user.individual_user.first_name
                                  : user.org_user
                                    ? user.org_user.company_name
                                    : user.bank_name
                                      ? user.bank_name
                                      : user.bank_user.branch_name
                                        ? user.bank_user.branch_name
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
                                    {/* View */}
                                    {arrayOfRoles.join(", ") !== "Bank Admin" ?
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
                                      </div> : <div
                                        className="dropdown-item"
                                        onClick={() => {
                                          const sensitiveData = bank_id;
                                          navigate(`${roleId === 6 ? "/bank" : "/admin"
                                            }/users/branch-users`, { state: { sensitiveData } })
                                        }}
                                      >
                                        <i className="bi bi-eye pe-1"></i> View Branch List
                                      </div>}

                                    {/* Delete */}
                                    {arrayOfRoles.join(", ") !== "Bank Admin" ?
                                      <div
                                        data-bs-toggle={`${arrayOfRoles.join(", ") === "Editor" ? "" : "modal"}`}
                                        data-bs-target="#confirmDeleteUserModal"
                                        className={`dropdown-item ${email_address === data.user
                                          ? "d-none"
                                          : ""
                                          }`}
                                        onClick={() => {
                                          onDeleteBtnClick(
                                            user_id,
                                            email_address,
                                            arrayOfRoles.join(", "),
                                            branchIdDetails,
                                            branchNameDetails
                                          );
                                        }}
                                      >
                                        <i className="bi bi-trash pe-2"></i>
                                        {arrayOfRoles.join(", ") === "Editor" ? "Close Branch" : `${roleId === 1 && accountStatus === 1 ? "Activate" : "Deactivate"}`}

                                      </div>
                                      : ""}
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
                    {pageCount > 1 ? <div className="row">
                      <Pagination
                        handlePageClick={handlePageClick}
                        pageCount={pageCount}
                      />
                    </div> : ""}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* viewCurrentUserSectionClass */}
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
                {/* heading */}
                <h2 className="text-center mb-4">
                  {user_type === 0
                    ? `${categoryWiseUserDetails.first_name} ${categoryWiseUserDetails.middle_name} ${categoryWiseUserDetails.last_name}`
                    : user_type === 1 ? `${categoryWiseUserDetails.company_name}`
                      : `${categoryWiseUserDetails.branch_name}`}
                </h2>
                {/* details div */}
                <div className="row justify-content-center mb-5">
                  <div className="col-xl-10 col-lg-11">
                    <form
                      action=""
                      className="card shadow p-xl-5 p-lg-4 p-3 position-relative"
                    >
                      <div className="row">
                        {/* USER ID */}
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
                        {/* Role */}
                        <div className="col-md-6 col-12 text-center text-md-start">
                          <div className="form-group mb-3">
                            <label
                              htmlFor="role"
                              className="form-label fw-bold"
                            >
                              Role
                              {/* editDetails */}
                              <span className={`ms-4 ${classOnPageLoad}`}>
                                {!defaultRoleIds.includes(1) && <i
                                  onClick={editDetails}
                                  className="bi bi-pencil-square"
                                ></i>}
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
                              {roles && roles.map((data, Index) => {
                                if (roleId === 6 && (data.id === 3 || data.id === 1)) {
                                  return null;
                                }
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
                                      className={`form-check-input roles-checkbox`}
                                      type="checkbox"
                                      onClick={(e) => {
                                        onRoleSelect(e);
                                      }}
                                      id={data.id}
                                      value={data.id}
                                      disabled={
                                        user_id === loggedInUserId
                                      }
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`inlineCheckbox${data.id}`}
                                    >
                                      {data.role === "Bank_Admin" ? "Bank Admin" : data.role}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        {/* USER TYPE */}
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
                            {/* First Name: */}
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
                            {/* Middle Name */}
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
                            {/*  Last Name */}
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
                            {/* Aadhaar Number */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="aadhaar_number"
                                >
                                  Aadhaar Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.aadhar_number}
                              </div>
                            </div>
                            {/* PAN Number */}
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
                        ) : user_type === 1 ? (
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
                        ) : (
                          <>
                            {/* bank user */}
                            {/* Branch Name */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="branch_name}"
                                >
                                  Branch Name:
                                </label>
                                <br />
                                {categoryWiseUserDetails.branch_name}
                              </div>
                            </div>
                            {/* Branch Code */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="branch_code"
                                >
                                  Branch Code:
                                </label>
                                <br />
                                {categoryWiseUserDetails.branch_code}
                              </div>
                            </div>
                            {/* branch_sftp */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="branch_sftp"
                                >
                                  SFTP Number:
                                </label>
                                <br />
                                {categoryWiseUserDetails.branch_sftp}
                              </div>
                            </div>
                            {/* /ifsc_code */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="ifsc_code"
                                >
                                  IFSC Code:
                                </label>
                                <br />
                                {categoryWiseUserDetails.ifsc_code}
                              </div>
                            </div>
                            {/* BranchId */}
                            <div className="col-md-6 col-12 text-center text-md-start">
                              <div className="form-group mb-3">
                                <label
                                  className="form-label fw-bold"
                                  htmlFor="cin_number"
                                >
                                  Branch ID:
                                </label>
                                <br />
                                {categoryWiseUserDetails.BranchId}
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
                {roleId === 6 ? "Activate" : `${roleId === 1 && accountStatus === 1 ? "Activate User" : "Deactivate User"}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageUsers;
