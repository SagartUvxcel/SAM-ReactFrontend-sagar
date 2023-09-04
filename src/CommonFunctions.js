import axios from "axios";

export const toggleClassOfNextPrevPageItems = () => {
  let activePageItem = document.querySelector(".page-item.active");
  if (activePageItem) {
    let nextPageItem = activePageItem.nextElementSibling;
    if (nextPageItem.textContent === "Next") {
      nextPageItem.classList.add("disabled");
    } else {
      document.querySelectorAll(".page-item").forEach((item) => {
        if (item.textContent === "Next") {
          item.classList.remove("disabled");
        }
      });
    }

    let prevPageItem = activePageItem.previousElementSibling;
    if (prevPageItem.textContent === "Prev") {
      prevPageItem.classList.add("disabled");
    } else {
      document.querySelectorAll(".page-item").forEach((item) => {
        if (item.textContent === "Prev") {
          item.classList.remove("disabled");
        }
      });
    }
  }
};

export const makeFirstPageActive = () => {
  let allPageItems = document.querySelectorAll(".page-item");
  if (allPageItems) {
    allPageItems.forEach((i) => {
      if (i.textContent === "1") {
        i.click();
        console.log("div is clicked", i.classList);
      }
    });
  }
};

export const rootTitle = document.getElementById("root-title");

export const checkLoginSession = async (token) => {
  try {
    let res = await axios.get(`/sam/v1/user-registration/logout`, {
      headers: { Authorization: token },
    });
    if (res.data === "Session expired or invalid user") {
      localStorage.removeItem("data");
      localStorage.removeItem("remainingTime");
      return "Invalid";
    } else {
      return "Valid";
    }
  } catch (error) {}
};

export const transformDateFormat = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  let formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const openInNewTab = (path) => {
  const url = window.location.origin + path;
  const newTab = window.open(url, "_blank");
  newTab.focus();
};

export const changeActiveSortStyle = (text) => {
  let allSortItems = document.querySelectorAll(".dropdown-item");
  if (allSortItems) {
    allSortItems.forEach((i) => {
      if (i.textContent === text) {
        i.style.fontWeight = "bold";
      } else {
        i.style.fontWeight = "normal";
      }
    });
  }
};
