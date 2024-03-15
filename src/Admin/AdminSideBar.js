import React, { useEffect, useState } from "react";
import OffcanvasBody from "./OffcanvasBody";

let isBank = false;
let roleId = "";

const AdminSideBar = (propertiesLinkDisabled, backToAllPropertiesPage) => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
    roleId = data.roleId;
  }
  // console.log(data);

  const [sideBarBankBranchName, setSideBarBankBranchName] = useState("")

  // admin Side bar Functionalities
  const adminSidebarFunctionalities = () => {
    let body = document.getElementById("body");
    let adminSideBarLinks = document.querySelectorAll(
      ".offcanvas .sidebar-link"
    );
    let adminDashboardLink = document.querySelectorAll(".admin-home-link");
    let sideBarPropertyCollapse =
      document.querySelectorAll(".propertyCollapse");
    let sideBarUsersCollapse = document.querySelectorAll(".usersCollapse");

    adminSideBarLinks.forEach((link) => {
      link.addEventListener("click", () => {
        body.style.removeProperty("overflow");
        body.style.removeProperty("padding");
      });
    });

    const path = window.location.pathname;
    // Remove active class of link 'Dashboard' if we switch to other link.
    if (path !== (isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin")) {
      adminDashboardLink.forEach((link) => {
        link.classList.remove("active");
      });
    }

    // collapse of property and users section on sidebar will remain open until we are on 'admin/property' or 'admin/users' path.
    if (path.includes(`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"}/property`)) {
      sideBarPropertyCollapse.forEach((collapse) => {
        collapse.classList.add("show");
      });
    } else if (path.includes("/admin/users")) {
      sideBarUsersCollapse.forEach((collapse) => {
        collapse.classList.add("show");
      });
    }
  };
  useEffect(() => {
    adminSidebarFunctionalities();
  }, []);

  return (
    <>
      <div className="col-xl-2 col-lg-3 col-md-4 admin-sidebar d-none d-md-block">
        <div className="py-3">
          <span className="offcanvas-header text-white">
            <h5 className="offcanvas-title ps-md-2" id="offcanvasExampleLabel">
              {isBank ? `${roleId === 6 ? "Bank Admin" : "Branch"}` : "Administration"}
            </h5>
          </span>
          <OffcanvasBody
            propertiesLinkDisabled={propertiesLinkDisabled}
            backToAllPropertiesPage={backToAllPropertiesPage}
            isBank={isBank}
            roleId={roleId}
          />
        </div>
      </div>

      <div
        className="offcanvas offcanvas-start admin-sidebar w-75 d-md-none"
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header text-white">
          <h4 className="offcanvas-title ps-md-2" id="offcanvasExampleLabel">
            {isBank ? "Bank" : "Administration"}
          </h4>
          <button
            type="button"
            className="btn-close admin-sidebar-btn-close text-reset bg-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <OffcanvasBody
          propertiesLinkDisabled={propertiesLinkDisabled}
          backToAllPropertiesPage={backToAllPropertiesPage}
          isBank={isBank}
          canvasNumber="2"
          roleId={roleId}
        />
      </div>
    </>
  );
};

export default AdminSideBar;
