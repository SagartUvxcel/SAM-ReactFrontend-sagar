import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import Papa from "papaparse";

const UploadProperties = () => {
  const [file, setFile] = useState("");
  const [data, setData] = useState([]);
  const fileUpload = (e) => {
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      // const fileExtension = inputFile.type.split("/")[1];
      // if (!allowedExtensions.includes(fileExtension)) {
      //   setError("Please input a csv file");
      //   return;
      // }
      setFile(inputFile);
    }
  };

  const parseFileData = () => {
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv.data;
      console.log(parsedData);
      setData(parsedData);
    };
    reader.readAsText(file);
  };
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <AdminSideBar />
        <div className="col-xl-10 col-md-9 wrapper">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-xl-6 shadow p-xl-4">
                <div className="">
                  {/* <label for="formFile" className="form-label h3 mb-3">
                    Upload File
                  </label> */}
                  <input
                    onChange={fileUpload}
                    className="form-control"
                    type="file"
                    id="formFile"
                  />
                  <button onClick={parseFileData}>See</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProperties;
