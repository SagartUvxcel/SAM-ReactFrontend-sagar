import React, { useEffect, useState } from "react"; 
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import CommonSpinner from "../../CommonSpinner";
import DocumentsUploadFolder from "./DocumentsUploadFolder.zip";


let mainDocumentCSVName = "uploadDocumentsList.csv";
let chunkSize = 0;
let authHeaders = "";

const BulkDocumentsUploadPage = () => {

  // references
  const fileRef = useRef();
  const dataFromLocal = JSON.parse(localStorage.getItem("data"));
  if (dataFromLocal) {
    authHeaders = {
      Authorization: dataFromLocal.loginToken,
    };
  }

  const [currentPropertyNumber, setCurrentPropertyNumber] = useState({});
  const [uniqueId, setUniqueId] = useState(uuid());
  const [loading, setLoading] = useState(undefined);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null);
  const [allDocumentsData, setAllDocumentsData] = useState({
    data: [],
    tableHeadings: [],
    tableDisplayClass: "d-none",
  });
  const [allPropertyDocumentList, setAllPropertyDocumentList] = useState([]);
  const [allPropertyDocuments, setAllPropertyDocuments] = useState([]);
  const [currentPropertyDocs, setCurrentPropertyDocs] = useState(null);
  const [docErrorDetails, setDocErrorDetails] = useState([]);
  const [alreadyExistDocuments, setAlreadyExistDocuments] = useState({});
  const [missingPropertyDetails, setMissingPropertyDetails] = useState({});
  const [duplicateUploadIdDetails, setDuplicateUploadIdDetails] = useState({});
  const [dropzoneActive, setDropzoneActive] = useState(false);


  // readFileFunction
  const readFileFunction = (inputFile, fileName) => {
    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      let parsedFilteredCSV = [];
      console.log(target.result);

      const csv = Papa.parse(target.result, {
        header: true,
        transform: function (value) {
          return value.trim();
        },

        complete: function (results) {
          // Filter out blank rows
          const filteredData = results.data.filter(row => {
            // Check if all values in the row are empty
            return Object.values(row).some(value => value !== "");
          });

          // Convert the filtered data back to a CSV string
          const filteredCSV = Papa.unparse(filteredData);

          // Now you can parse the filtered CSV string or proceed with further operations
          parsedFilteredCSV = Papa.parse(filteredCSV, {
            header: true,
            complete: function (filteredResults) {
              let hasMissingFields = false;

              // Check for missing fields in the filtered data
              let missingDataObject = missingPropertyDetails;
              let duplicateUploadId = duplicateUploadIdDetails;
              filteredResults.data.forEach((row, rowIndex) => {
                Object.keys(row).forEach(field => {
                  if (row[field] === "") {
                    if (missingDataObject[rowIndex + 1]) {
                      missingDataObject[rowIndex + 1] = [...missingDataObject[rowIndex + 1], field]
                    } else {
                      missingDataObject[rowIndex + 1] = [field]
                    }
                    hasMissingFields = true;
                  }
                });
                console.log(hasMissingFields);

              });
              setMissingPropertyDetails(() => missingDataObject);
              setDuplicateUploadIdDetails(() => duplicateUploadId);
            }
          });
        }
      });
      console.log(csv);
      
      const parsedData = parsedFilteredCSV.data;
      if (fileName === mainDocumentCSVName) {
        setAllPropertyDocumentList(parsedData)
        setAllDocumentsData({
          ...allDocumentsData,
          tableHeadings: Object.keys(parsedData[0]),
          data: parsedData,
          tableDisplayClass: "",
        });
      }

    };
    reader.readAsText(inputFile);
    setDropzoneActive(false);
    document.getElementById("showCsvDataInTable").scrollIntoView(true);
  };
  // file upload function
  const fileUpload = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    processFiles(Array.from(files));
    console.log(files);

  };

  //check csv file exist or not
  const processFiles = (files) => {
    if (files.length) {
      let documentCsv = files.filter((file) => file.type === "text/csv" && mainDocumentCSVName === file.name)[0];
      let remainingDocument = files.filter((file) => !(file.type === "text/csv" && mainDocumentCSVName === file.name));
      if (!documentCsv) {
        return alert("Please upload CSV files");
      }
      console.log(remainingDocument);
      console.log(documentCsv, mainDocumentCSVName);

      setAllPropertyDocuments(remainingDocument);
      readFileFunction(documentCsv, mainDocumentCSVName);
    } else {
      return alert("Please upload folder");
    }
  };

  // read And Upload Current file Chunk
  const readAndUploadCurrentFileChunk = (fileDetails, currentChunkIndex) => {
    console.log(fileDetails);
    const { file } = fileDetails;
    const reader = new FileReader();
    chunkSize = Math.round((file.size * 39) / 100);
    const from = currentChunkIndex * chunkSize;
    const to = from + chunkSize;
    const blob = file.slice(from, to);
    reader.onload = (e) => uploadFileChunk(e, fileDetails, currentChunkIndex);
    reader.readAsDataURL(blob);
  };

  // upload Image Chunk
  const uploadFileChunk = async (readerEvent, fileDetails, currentChunkIndex) => {
    const { file, property_number, document_type_id, description, currentPropertyId, upload_property_id } = fileDetails;
    console.log(fileDetails);

    const size = file.size;
    let tempChunkSize = chunkSize;
    let temp = (currentChunkIndex * chunkSize);
    if (temp + chunkSize > size) {
      tempChunkSize = size - temp;
    }
    const data = readerEvent.target.result.split(",")[1];
    const fileName = file.name;
    const totalChunks = Math.ceil(size / chunkSize);
    const chunkNumber = currentChunkIndex + 1;
    const detailsToPost = {
      upload_id: uniqueId,
      property_number: property_number,
      property_id: currentPropertyId,
      chunk_number: chunkNumber,
      total_chunks: totalChunks,
      chunk_size: tempChunkSize,
      total_file_size: size,
      file_name: fileName,
      category_id: Number(document_type_id),
      description: description,
      data: data,
    };

    const chunks = Math.ceil(file.size / chunkSize) - 1;
    const isLastChunk = currentChunkIndex === chunks;

    try {
      const docRes = await axios.post(`/sam/v1/property/auth/property-documents`, detailsToPost, { headers: authHeaders })
      console.log(docRes);
    } catch (error) {
      if (isLastChunk) {
        const { error: err, message } = error.response.data
        console.log(err);
        if (message && message === 2) {
          let propertyDuplicateError = alreadyExistDocuments;
          if (propertyDuplicateError[upload_property_id]) {
            propertyDuplicateError[upload_property_id] = [...propertyDuplicateError[upload_property_id], fileName]
          } else {
            propertyDuplicateError[upload_property_id] = [fileName];
          }
          setAlreadyExistDocuments(() => propertyDuplicateError)
        } else {
          setDocErrorDetails((old) => [...old, { upload_property_id, error: error.response.data.error }])
        }
      }
    }

    if (isLastChunk) {
      setUniqueId(uuid());
      setLastUploadedFileIndex(currentFileIndex);
    } else {
      readAndUploadCurrentFileChunk(fileDetails, currentChunkIndex + 1);
    }
  };

  // lastUploadedImageFileIndex
  useEffect(() => {
    if (lastUploadedFileIndex === null) {
      return;
    }
    console.log("useeffect111===>", lastUploadedFileIndex, currentPropertyDocs, lastUploadedFileIndex === currentPropertyDocs.length - 1);
    console.log("currentFileIndex==>", currentFileIndex);

    const isLastFile = lastUploadedFileIndex !== null && currentPropertyDocs && lastUploadedFileIndex + 1 >= currentPropertyDocs.length;
    const nextFileIndex = isLastFile ? null : currentFileIndex + 1;
    console.log("useeffect===>", isLastFile, nextFileIndex,);

    setCurrentFileIndex(nextFileIndex);
    if (isLastFile) {
      setLoading(false)
    }
    // eslint-disable-next-line
  }, [lastUploadedFileIndex]);

  // imageFiles
  useEffect(() => {
    if (currentPropertyDocs && currentPropertyDocs.length > 0) {
      if (currentFileIndex === null) {
        setCurrentFileIndex(0);
      }
    }
    // eslint-disable-next-line
  }, [currentPropertyDocs]);

  // currentImageFileIndex
  useEffect(() => {
    if (currentPropertyDocs && currentFileIndex !== null) {
      readAndUploadCurrentFileChunk(currentPropertyDocs[currentFileIndex], 0);
    }
    // eslint-disable-next-line
  }, [currentFileIndex]);


  useEffect(() => {
    rootTitle.textContent = "ADMIN - UPLOAD PROPERTIES WITH DOCUMENTS";
  }, []);

  useEffect(() => {
    if (loading === false && docErrorDetails && docErrorDetails.length === 0 && alreadyExistDocuments && Object.keys(alreadyExistDocuments).length === 0) {
      toast.success("All document uploaded successfully");
      clearPageStates();
    }

  }, [loading, docErrorDetails, alreadyExistDocuments])


  // clear page states
  const clearPageStates = () => {
    setUniqueId(uuid())
    setLoading(undefined)
    setCurrentFileIndex(null)
    setLastUploadedFileIndex(null)
    setAlreadyExistDocuments({});
    setMissingPropertyDetails({})
    setDocErrorDetails([])
    setDuplicateUploadIdDetails({});
    setAllPropertyDocumentList([])
    setAllPropertyDocuments([])
    setCurrentPropertyDocs(null)
    setAllDocumentsData({
      data: [],
      tableHeadings: [],
      tableDisplayClass: "d-none",
    })
    chunkSize = 0
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    window.scrollTo(0, 0);
  };

  // post Property function
  const postProperty = async () => {
    setLoading(true);
    let currentPropertyId = currentPropertyNumber.propertyId;

    const currentPropertyDocuments = allPropertyDocumentList.map(doc1 => {
      const matchedItem1 = allPropertyDocuments.find(doc2 => doc2.webkitRelativePath === doc1.document_url);
      console.log(matchedItem1);
      console.log(doc1);

      // if document not found
      if (matchedItem1 === undefined) {
        console.log("undefine data ===>", doc1.upload_property_id, doc1.document_url);

        setDocErrorDetails((old) => [...old, {
          upload_property_id: doc1.upload_property_id, error: (<>Document not found with path: <span className="fw-bold">"{doc1.document_url}"</span>.</>)
        }])
      }

      return matchedItem1 ? { file: matchedItem1, currentPropertyId, ...doc1 } : null;

      // return matchedItem1 ? { file: matchedItem1, ...doc1, property_id } : null;
    }
    ).filter(item => item !== null);
    // console.log(allCurrentDocumentPath);
    console.log(currentPropertyDocuments);

    if (currentPropertyDocuments.length > 0) {
      setLoading(true);
      console.log(currentPropertyDocuments);
      setCurrentPropertyDocs(currentPropertyDocuments)
    } else {
      setLoading(false);
    }
  }

  useEffect(() => {
    let propertyData = JSON.parse(localStorage.getItem("upload-bulk-doc"));
    if (propertyData) {
      setCurrentPropertyNumber({ propertyNumber: propertyData.number, propertyId: propertyData.id });
    }
    // eslint-disable-next-line
  }, []);

  // Close current tab
  const onBackToPropertyBtnClick = () => {
    window.close();
  };


  return (
    <Layout>
      <div
        className="container-fluid section-padding"
      // onDrop={(e) => {
      //   e.preventDefault();
      // }}
      // onDragOver={(e) => {
      //   e.preventDefault();
      // }}
      >
        <div className="row min-100vh position-relative justify-content-center">
          {/* <AdminSideBar /> */}
          <div className="col-11 mt-md-0">
            <section className="upload-documents-wrapper mt-2">
              <div className="container-fluid">
                <div className="row justify-content-between">
                  <div className="col-md-6">
                    <h4 className="fw-bold p-0">Upload Documents</h4>
                    <h6 className="fw-bold text-muted p-0">
                      Property Number
                      <span className="badge bg-box-primary ms-2">
                        {currentPropertyNumber.propertyNumber}
                      </span>
                    </h6>
                  </div>
                  <div className="col-md-5 text-end my-2 my-md-0">
                    <a
                      className="btn btn-sm btn-primary text-white sample-file-download-btn me-4"
                      href={DocumentsUploadFolder}
                      download="DocumentsUploadFolder.zip"
                    >
                      <i className="bi bi-download me-2"> </i>  Sample Bulk Folder
                    </a>
                  </div>
                  <div className="col-md-1 text-end ">
                    <button className="btn btn-sm btn-outline-primary" onClick={onBackToPropertyBtnClick}><i className="bi bi-arrow-left"></i>Back</button>
                  </div>
                </div>

                {loading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "45vh" }}
                  >
                    <CommonSpinner
                      spinnerColor="primary"
                      spinnerType="grow"
                    />
                  </div>
                ) :
                  <div className="container-fluid mt-4">
                    <div className="row justify-content-center">
                      <div className="col-xl-7 col-md-11 shadow p-md-4 p-3 mb-5 upload-file-main-wrapper">
                        <div className="">
                          <div
                            onDragOver={(e) => {
                              // setDropzoneActive(true);
                              e.preventDefault();
                            }}
                            onDragLeave={(e) => {
                              // setDropzoneActive(false);
                              e.preventDefault();
                            }}
                            // onDrop={(e) => handleDrop(e)}
                            className={`py-3 upload-file-inner-wrapper ${dropzoneActive ? "active" : ""
                              }`}
                          >
                            <div className="text-center fs-3 fw-bold">
                              Choose a file or drag it here
                            </div>
                            {/* file upload div */}
                            <div className="upload-btn-wrapper py-xl-3 py-md-2 py-1 w-100">
                              <i className="bi bi-upload fs-1 upload-iocn"></i>
                              <input
                                ref={fileRef}
                                id="formFile"
                                type="file"
                                webkitdirectory="true"
                                className="upload-csv-file"
                                directory="true"
                                multiple
                                onChange={fileUpload}
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <small className="text-white">
                              To download the sample bulk folder format, <a className="custom-text-secondary" download="DocumentsUploadFolder.zip" href={DocumentsUploadFolder}>click here</a>.
                            </small>
                            <br />

                          </div>
                        </div>
                      </div>
                      {/* table details showing */}
                      <div
                        id="showCsvDataInTable"
                        className="col-xl-12 position-relative mb-5 vh-100"
                      >
                        <div
                          className={`${allDocumentsData?.tableDisplayClass} csv-data-table-wrapper`}
                        >
                          <table className="table table-striped table-bordered table-primary h-100">
                            <thead>
                              <tr>
                                {allDocumentsData?.tableHeadings.map((heading, Index) => {
                                  return <th key={Index}>{heading}</th>;
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {allDocumentsData?.data.map((i, Index) => {
                                return (
                                  <tr key={Index}>
                                    {allDocumentsData?.tableHeadings.map((heading, Index) => {
                                      return <td key={Index}>{i[heading]}</td>;
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {/* save and cancel button */}
                        <div
                          className={`text-end mt-3 bg-light  save-cancel-btn-div ${allDocumentsData?.tableDisplayClass}`}
                        >
                          {/* Save */}
                          <button
                            className="btn btn-success me-2"
                            onClick={postProperty}
                          >
                            Save
                          </button>
                          {/* cancel */}
                          <button
                            onClick={clearPageStates}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>
            </section>
          </div>
        </div>

        {/* Modal */}
        <div
          className={`modal fade ${loading === false && ((docErrorDetails && docErrorDetails.length > 0) || (alreadyExistDocuments && Object.keys(alreadyExistDocuments).length > 0)) ? "show d-block" : "d-none"}`}
          id="propertyErrorModal"
          tabIndex="-1"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm duplicate-property-error-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Error Details !
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    clearPageStates()
                  }}
                ></button>
              </div>
              {(docErrorDetails || alreadyExistDocuments) && (Object.keys(alreadyExistDocuments).length > 0 || Object.keys(docErrorDetails).length > 0) && <div>
                <h4>Document Error</h4>
                <div className="m-2">
                  {alreadyExistDocuments && Object.keys(alreadyExistDocuments).length > 0 && Object.keys(alreadyExistDocuments).map((upload_property_id, i) => {
                    return <div><i class="bi bi-dot"></i>{`Documents already exist with the following document names:`} <span className="fw-bold"> {alreadyExistDocuments[upload_property_id].join(", ")}</span>.</div>
                  })}

                  {docErrorDetails.map((err, i) => {
                    return <div key={i} className=""><i class="bi bi-dot"></i> {err.error}</div>
                  })}
                </div>
              </div>}
              <div className="modal-body common-btn-font">(Please create a new CSV containing the updated documents details, and remove the previously uploaded ones.)</div>
            </div>
          </div>
        </div>

        {/* file reading error Modal */}
        <div
          className={`modal fade ${(missingPropertyDetails && Object.keys(missingPropertyDetails).length > 0) || (duplicateUploadIdDetails && Object.keys(duplicateUploadIdDetails).length > 0) ? "show d-block" : "d-none"}`}
          id="missingPropertyDetailsModal"
          tabIndex="-1"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm duplicate-property-error-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Error Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    clearPageStates()
                  }}
                ></button>
              </div>
              {/* duplicateUploadIdDetails */}
              {duplicateUploadIdDetails && Object.keys(duplicateUploadIdDetails).length > 0 && <div>
                <h4>Duplicated Upload ID Error</h4>
                <div className="m-2 mb-4">
                  {Object.keys(duplicateUploadIdDetails).map((rowIndex, i) => {
                    const value = duplicateUploadIdDetails[rowIndex];
                    return <div>{i + 1}. <span>{`Upload property ID `}<span className="fw-bold">  {rowIndex}</span> is duplicated on rows {value.join(", ")} </span></div>
                  })}

                </div>
              </div>}
              {/* missingPropertyDetails */}
              {missingPropertyDetails && Object.keys(missingPropertyDetails).length > 0 && <div>
                <h4>Documents fields missing Error</h4>
                <div className="m-2 mb-4">
                  {Object.keys(missingPropertyDetails).map((rowIndex, i) => {
                    return <div>{i + 1}. <span>{`Missing values in`}<span className="fw-bold"> row {rowIndex}</span>: the missing fields are</span> <span className="fw-bold">{`${missingPropertyDetails[rowIndex].join(", ")}.`}</span></div>
                  })}

                </div>
                <h6 className="text-center">(Please fill in all the details correctly and reupload the file.) </h6>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
};

export default BulkDocumentsUploadPage;
