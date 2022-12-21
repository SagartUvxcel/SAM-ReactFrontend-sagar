import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../components/1.CommonLayout/Layout";

const UploadProperties = () => {
  const [allUseStates, setAllUseStates] = useState({
    data: [],
    tableHeadings: [],
    tableDisplayClass: "d-none",
  });

  const fileRef = useRef();
  const { data, tableHeadings, tableDisplayClass } = allUseStates;

  const fileUpload = (e) => {
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      // const fileExtension = inputFile.type.split("/")[1];
      // if (!allowedExtensions.includes(fileExtension)) {
      //   setError("Please input a csv file");
      //   return;
      // }
      const reader = new FileReader();
      reader.onload = async ({ target }) => {
        const csv = Papa.parse(target.result, { header: true });
        const parsedData = csv.data;
        console.log(parsedData);
        setAllUseStates({
          ...allUseStates,
          tableHeadings: Object.keys(parsedData[0]),
          data: parsedData,
          tableDisplayClass: "",
        });
      };
      reader.readAsText(inputFile);
    }
  };

  return (
    <Layout>
      <div className="container-fluid section-padding">
        <div className="row min-100vh">
          <AdminSideBar />
          <div className="col-xl-10 col-md-9 wrapper">
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col-xl-7 col-md-8 shadow p-md-4 mb-5">
                  <div className="">
                    {/* <label for="formFile" className="form-label h3 mb-3">
                  Upload File
                </label> */}
                    <input
                      ref={fileRef}
                      onChange={fileUpload}
                      className="form-control"
                      type="file"
                      id="formFile"
                    />

                    <div className="mt-2">
                      <small className="text-muted">
                        Refer to the csv file example below.
                      </small>
                      <br />
                      <img
                        src="/sample-img.png"
                        className="img-fluid border mt-2"
                        alt="hint-img"
                      />
                    </div>
                  </div>
                </div>
                <div className={`col-xl-12 mb-5 ${tableDisplayClass}`}>
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
                    <button
                      onClick={(e) => {
                        setAllUseStates({
                          ...allUseStates,
                          tableDisplayClass: "d-none",
                        });
                        fileRef.current.value = "";
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadProperties;
