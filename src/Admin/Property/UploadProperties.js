import React, { useEffect, useState } from "react";
import AdminSideBar from "../AdminSideBar";
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import BreadCrumb from "../BreadCrumb";

const allowedExtensions = ["csv"];
let chunkSize = 0;
let temp = 0;
let authHeaders = "";

const UploadProperties = () => {
  // Bootstrap alert details.
  const [errorModalDetails, setErrorModalDetails] = useState({
    errorModalOpen: false,
    errorHeading: "",
    errorMessage: "",
  });
  const { errorModalOpen, errorHeading, errorMessage } = errorModalDetails;
  const [files, setFiles] = useState([]);
  const [saveFile, setSavedFile] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(null);
  const [uniqueUploadId, setUniqueUploadId] = useState(uuid());
  const [allUseStates, setAllUseStates] = useState({
    data: [],
    tableHeadings: [],
    tableDisplayClass: "d-none",
  });

  const [dropzoneActive, setDropzoneActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const fileRef = useRef();
  const { data, tableHeadings, tableDisplayClass } = allUseStates;

  const onCancelClick = () => {
    setAllUseStates({
      ...allUseStates,
      tableDisplayClass: "d-none",
    });
    fileRef.current.value = "";
    setFileName("");
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const dataFromLocal = JSON.parse(localStorage.getItem("data"));
  if (dataFromLocal) {
    authHeaders = {
      Authorization: dataFromLocal.loginToken,
      "Content-Type": "application/octet-stream",
    };
  }

  const readFileFunction = (inputFile) => {
    setFileName(inputFile.name);
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv.data;
      setAllUseStates({
        ...allUseStates,
        tableHeadings: Object.keys(parsedData[0]),
        data: parsedData,
        tableDisplayClass: "",
      });
    };
    reader.readAsText(inputFile);
    setDropzoneActive(false);
    document.getElementById("showCsvDataInTable").scrollIntoView(true);
  };

  const fileUpload = (e) => {
    setSavedFile([...files, ...e.target.files]);
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      const fileExtension = inputFile.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        alert("Please upload a csv file");
        fileRef.current.value = "";
        setFileName("");
        return;
      } else {
        readFileFunction(inputFile);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setSavedFile([...files, ...e.dataTransfer.files]);
    if (e.dataTransfer.files.length) {
      const inputFile = e.dataTransfer.files[0];
      const fileExtension = inputFile.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        alert("Please upload a csv file");
        setDropzoneActive(false);
        return;
      } else {
        readFileFunction(inputFile);
      }
    }
  };

  const readAndUploadCurrentChunk = () => {
    const reader = new FileReader();
    const file = files[currentFileIndex];
    if (!file) {
      return;
    }
    chunkSize = Math.round((file.size * 39) / 100);
    const from = currentChunkIndex * chunkSize;
    const to = from + chunkSize;
    const blob = file.slice(from, to);
    reader.onload = (e) => uploadChunk(e);
    reader.readAsDataURL(blob);
  };

  const uploadChunk = async (readerEvent) => {
    const file = files[currentFileIndex];
    const size = file.size;
    let tempChunkSize = chunkSize;
    temp += tempChunkSize;
    if (temp > size) {
      tempChunkSize = size - (temp - chunkSize);
    }
    const data = readerEvent.target.result.split(",")[1];

    const detailsToPost = {
      upload_id: uniqueUploadId,
      chunk_number: currentChunkIndex + 1,
      total_chunks: Math.ceil(size / chunkSize),
      chunk_size: tempChunkSize,
      total_file_size: size,
      file_name: file.name,
      data: data,
    };
    const chunks = Math.ceil(file.size / chunkSize) - 1;
    const isLastChunk = currentChunkIndex === chunks;
    try {
      await axios
        .post(`/sam/v1/property/auth/upload-chunk`, detailsToPost, {
          headers: authHeaders,
        })
        .then((res) => {
          if (isLastChunk) {
            if (res.data.msg === 0) {
              toast.success("File uploaded successfully");
              reloadPage();
            } else {
              let arr = [];
              res.data.forEach((data) => {
                arr.push(data.property_number);
              });
              let duplicateProperties = arr.join(", ");
              let customErrorMessage = "";
              if (arr.length > 1) {
                customErrorMessage = `Failed to upload properties with property numbers ${duplicateProperties}`;
              } else {
                customErrorMessage = `Failed to upload property with property number ${duplicateProperties}`;
              }
              setErrorModalDetails({
                errorModalOpen: true,
                errorHeading: "Duplicate Records Error",
                errorMessage: customErrorMessage,
              });
              window.scrollTo(0, 0);
            }
          }
        });
    } catch (error) {
      if (isLastChunk) {
        toast.error("Internal server error");
        reloadPage();
      }
    }

    if (isLastChunk) {
      setUniqueUploadId(uuid());
      setLastUploadedFileIndex(currentFileIndex);
      setCurrentChunkIndex(null);
    } else {
      setCurrentChunkIndex(currentChunkIndex + 1);
    }
  };

  useEffect(() => {
    if (lastUploadedFileIndex === null) {
      return;
    }
    const isLastFile = lastUploadedFileIndex === files.length - 1;
    const nextFileIndex = isLastFile ? null : currentFileIndex + 1;
    setCurrentFileIndex(nextFileIndex);
    // eslint-disable-next-line
  }, [lastUploadedFileIndex]);

  useEffect(() => {
    if (files.length > 0) {
      if (currentFileIndex === null) {
        setCurrentFileIndex(
          lastUploadedFileIndex === null ? 0 : lastUploadedFileIndex + 1
        );
      }
    }
    // eslint-disable-next-line
  }, [files.length]);

  useEffect(() => {
    if (currentFileIndex !== null) {
      setCurrentChunkIndex(0);
    }
  }, [currentFileIndex]);

  useEffect(() => {
    if (currentChunkIndex !== null) {
      readAndUploadCurrentChunk();
    }
    // eslint-disable-next-line
  }, [currentChunkIndex]);

  const postChunksToDataBase = () => {
    setFiles(saveFile);
  };

  useEffect(() => {
    rootTitle.textContent = "ADMIN - UPLOAD PROPERTIES";
    // eslint-disable-next-line
  }, []);

  const reloadPage = () => {
    setTimeout(() => {
      window.location.reload();
    }, 4000);
  };

  return (
    <Layout>
      <div
        className="container-fluid section-padding"
        onDrop={(e) => {
          e.preventDefault();
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-lg-9 col-md-8">
            <BreadCrumb />
            <div className="container-fluid mt-4">
              <div className="row justify-content-center">
                <div className="col-xl-7 col-md-11 shadow p-md-4 p-3 mb-5 upload-file-main-wrapper">
                  <div className="">
                    <div
                      onDragOver={(e) => {
                        setDropzoneActive(true);
                        e.preventDefault();
                      }}
                      onDragLeave={(e) => {
                        setDropzoneActive(false);
                        e.preventDefault();
                      }}
                      onDrop={(e) => handleDrop(e)}
                      className={`py-3 upload-file-inner-wrapper ${
                        dropzoneActive ? "active" : ""
                      }`}
                    >
                      <div className="text-center fs-3 fw-bold">
                        Choose a file or drag it here
                      </div>

                      <div className="upload-btn-wrapper py-xl-3 py-md-2 py-1 w-100">
                        <i className="bi bi-upload fs-1 upload-iocn"></i>
                        <input
                          ref={fileRef}
                          onChange={fileUpload}
                          className="upload-csv-file"
                          type="file"
                          id="formFile"
                        />
                      </div>
                      {fileName ? (
                        <div className="text-center fs-5">{fileName}</div>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="mt-2">
                      <small className="text-white">
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

                <div
                  id="showCsvDataInTable"
                  className="col-xl-12 position-relative mb-5 vh-100"
                >
                  <div
                    className={`${tableDisplayClass} csv-data-table-wrapper`}
                  >
                    <table className="table table-striped table-bordered table-primary h-100">
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
                  <div
                    className={`text-end mt-3 bg-light  save-cancel-btn-div ${tableDisplayClass}`}
                  >
                    <button
                      className="btn btn-success me-2"
                      onClick={postChunksToDataBase}
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancelClick}
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
        {/* Modal */}
        <div
          className={`modal fade ${errorModalOpen ? "show d-block" : "d-none"}`}
          id="duplicatePropertyErrorModal"
          tabIndex="-1"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm duplicate-property-error-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorHeading} !
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setErrorModalDetails({ errorModalOpen: false });
                    window.location.reload();
                  }}
                ></button>
              </div>
              <div className="modal-body common-btn-font">{errorMessage}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadProperties;
