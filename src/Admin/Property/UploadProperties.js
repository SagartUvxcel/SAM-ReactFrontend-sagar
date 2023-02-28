import React, { useEffect, useState } from "react";
import AdminSideBar from "../AdminSideBar";
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";

const allowedExtensions = ["csv"];
const chunkSize = 1000 * 1024;
// const chunkSize = 6000;
const UploadProperties = () => {
  const [files, setFiles] = useState([]);
  const [saveFile, setSavedFile] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(null);
  const uniqueUploadId = uuid();
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
    }, 2000);
  };

  const dataFromLocal = JSON.parse(localStorage.getItem("data"));
  const setHeaderAndUrl = () => {
    let headers = "";
    if (dataFromLocal) {
      headers = {
        Authorization: dataFromLocal.logintoken,
        "Content-Type": "application/octet-stream",
      };
    }
    let url = `/sam/v1/property/auth/upload-chunk`;
    return [headers, url];
  };

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
    const from = currentChunkIndex * chunkSize;
    const to = from + chunkSize;
    const blob = file.slice(from, to);
    reader.onload = (e) => uploadChunk(e);
    reader.readAsDataURL(blob);
  };

  const [progress, setProgress] = useState(0);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  const uploadChunk = async (readerEvent) => {
    let fileSize = 0;
    const file = files[currentFileIndex];
    const size = Math.round(file.size / 1024) + 1;
    fileSize = size >= 1024 ? (size / 1024).toFixed(1) + " MB" : size + " KB";
    const data = readerEvent.target.result.split(",")[1];
    const [headers, url] = setHeaderAndUrl();
    const dataToPost = {
      upload_id: uniqueUploadId,
      chunk_number: `${currentChunkIndex + 1}`,
      total_chunks: `${Math.ceil(file.size / chunkSize)}`,
      total_file_size: fileSize,
      file_name: file.name,
      data: data,
    };
    console.log(dataToPost.total_chunks);
    const chunks = Math.ceil(file.size / chunkSize) - 1;
    const isLastChunk = currentChunkIndex === chunks;
    setProgress(
      Math.round((dataToPost.chunk_number / dataToPost.total_chunks) * 100)
    );
    // setProgressModalOpen(true);
    await axios.post(url, dataToPost, { headers: headers }).then((res) => {
      setProgressModalOpen(true);
      if (isLastChunk) {
        if (res.data.msg === 0) {
          // setUniqueUploadId(uuid());
        } else {
          setProgressModalOpen(false);
          toast.error("Duplicate data");
          onCancelClick();
        }
      }
    });
    if (isLastChunk) {
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
  }, []);

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
          <div className="col-xl-10 col-md-8 wrapper mt-4 mt-md-0">
            <div className="container-fluid">
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
                  className="col-xl-12 position-relative mb-5"
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
                    <div className="text-end mt-3 bg-primary position-absolute save-cancel-btn-div">
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
        </div>
      </div>
      <div
        className={`modal fade ${progressModalOpen ? "show" : ""}`}
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        style={{ display: `${progressModalOpen ? "block" : "none"}` }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark">
            <div className="modal-header">
              <h5 className="modal-title text-white" id="exampleModalLabel">
                {progress === 100
                  ? "Data uploaded successfully"
                  : "Uploading...."}
              </h5>
              <button
                type="button"
                className="btn-close bg-white"
                onClick={() => {
                  setProgressModalOpen(false);
                  onCancelClick();
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="progress my-2">
                <div
                  className="progress-bar progress-bar-animated progress-bar-striped bg-info"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow="100"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progress}%
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
