import React, { useEffect } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

let isBank = false;
const BreadCrumb = ({
  userType,
  emailOfCurrentUser,
  typeOfUser,
  setDisplayClassesOfMainSections,
  handlePageClick,
  currentPageNumber,
  isUpdatePropertyPageActive,
  backToAllPropertiesPage,
}) => {
  const [isUserPageActive, setIsUserPageActive] = useState(false);
  const [isPropertyPageActive, setIsPropertyPageActive] = useState(false);
  const [isAddPropertyPageActive, setIsAddPropertyPageActive] = useState(false);
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
  }

  const [isBulkUploadPropertyPageActive, setIsBulkUploadPropertyPageActive] =
    useState(false);

  // If we are on Users section in admin then isUserPageActive will be true.
  const checkActivePages = () => {
    setIsUserPageActive(window.location.href.includes("/admin/users"));
    setIsPropertyPageActive(
      window.location.href.includes(`${isBank ? "/bank" : "/admin"}/property`)
    );
    setIsAddPropertyPageActive(
      window.location.href.includes(
        `${isBank ? "/bank" : "/admin"}/property/add-property`
      )
    );
    setIsBulkUploadPropertyPageActive(
      window.location.href.includes(
        `${isBank ? "/bank" : "/admin"}/property/upload-properties`
      )
    );
  };

  let sampleLink = (
    <NavLink
      to={`${isBank ? "/bank" : "/admin"}/property/properties`}
      className="breadcrumb-item"
    >
      Properties
    </NavLink>
  );

  useEffect(() => {
    checkActivePages();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <nav aria-label="breadcrumb" className="mt-2">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <NavLink
              className="text-decoration-none"
              to={`${isBank ? "/bank" : "/admin"}`}
            >
              Dashboard
            </NavLink>
          </li>
          {isUserPageActive ? (
            <>
              <li
                className={`breadcrumb-item text-secondary ${
                  userType === undefined ? "d-none" : ""
                }`}
              >
                {userType === 0
                  ? "Individual User"
                  : userType === 1
                  ? "Organizational User"
                  : userType === 2
                  ? "Bank User"
                  : ""}
              </li>

              {emailOfCurrentUser ? (
                <>
                  {typeOfUser === 0 ? (
                    <li
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        handlePageClick({ selected: currentPageNumber });
                        setDisplayClassesOfMainSections({
                          showAllUsersSectionClass: "",
                          viewCurrentUserSectionClass: "d-none",
                        });
                      }}
                      className="breadcrumb-item"
                    >
                      Individual Users
                    </li>
                  ) : (
                    <li
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        handlePageClick({ selected: currentPageNumber });
                        setDisplayClassesOfMainSections({
                          showAllUsersSectionClass: "",
                          viewCurrentUserSectionClass: "d-none",
                        });
                      }}
                      className="breadcrumb-item"
                    >
                      Organizational Users
                    </li>
                  )}
                  <li className="breadcrumb-item text-secondary">
                    {emailOfCurrentUser}
                  </li>
                </>
              ) : (
                <></>
              )}
            </>
          ) : isPropertyPageActive ? (
            <>
              {isAddPropertyPageActive ? (
                <>
                  {sampleLink}
                  <li className="breadcrumb-item text-secondary">
                    Add Property
                  </li>
                </>
              ) : isBulkUploadPropertyPageActive ? (
                <>
                  {sampleLink}
                  <li className="breadcrumb-item text-secondary">
                    Upload Bulk Properties
                  </li>
                </>
              ) : isUpdatePropertyPageActive ? (
                <>
                  <li
                    style={{ cursor: "pointer" }}
                    className="breadcrumb-item"
                    onClick={backToAllPropertiesPage}
                  >
                    Properties
                  </li>
                  <li className="breadcrumb-item text-secondary">
                    Update property
                  </li>
                </>
              ) : (
                <li className="breadcrumb-item text-secondary">Properties</li>
              )}
            </>
          ) : (
            <></>
          )}
        </ol>
      </nav>
    </>
  );
};

export default BreadCrumb;
