import React from "react";

const CommonSpinner = ({
  spinnerColor = "black",
  height = "3rem",
  width = "3rem",
  spinnerText = "",
}) => {
  return (
    <div className="my-5 text-center">
      <div
        className={`spinner-border text-${spinnerColor}`}
        style={{ height: height, width: width }}
        role="status"
      ></div>
      <div
        className={`mt-2 fw-bold text-primary ${spinnerText ? "" : "d-none"}`}
      >
        {spinnerText}
      </div>
    </div>
  );
};

export default CommonSpinner;
