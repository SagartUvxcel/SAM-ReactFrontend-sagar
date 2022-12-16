import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import Papa from "papaparse";

const UploadProperties = () => {
  const [file, setFile] = useState("");
  const [data, setData] = useState([]);
  const [tableHeadings, setTableHeadings] = useState([]);

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
      setTableHeadings(Object.keys(parsedData[0]));
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
              <div className="col-xl-12 my-5">
                <div className="csv-data-table">
                  <table className="table table-striped table-bordered table-dark">
                    <thead>
                      <tr>
                        {tableHeadings.map((heading, Index) => {
                          return <th key={Index}>{heading}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((i, Index) => {
                        return (
                          <tr key={Index}>
                            {tableHeadings.map((heading, Index) => {
                              return <td key={Index}>{i[heading]}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="text-end mt-3">
                  <button className="btn btn-success me-2">Save</button>
                  <button className="btn btn-secondary">Cancel</button>
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
