import React from "react";

const CommonSpinner = ({
  spinnerColor = "primary",
  height = "3rem",
  width = "3rem",
  spinnerText = "",
  spinnerType = "border",
}) => {
  return (
    <div className="my-5 text-center">
      <div
        className={`spinner-${spinnerType} text-${spinnerColor}`}
        style={{ height: height, width: width }}
        role="status"
      ></div>
      <div
        className={`mt-2 fw-bold heading-text-primary ${spinnerText ? "" : "d-none"}`}
      >
        {spinnerText}
      </div>
    </div>
  );
};

export default CommonSpinner;
