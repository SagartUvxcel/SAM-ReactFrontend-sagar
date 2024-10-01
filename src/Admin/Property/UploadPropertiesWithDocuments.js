import React, { useEffect, useState } from "react";
import AdminSideBar from "../AdminSideBar";
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import { toast } from "react-toastify"; 
import PropertyUploadFolder from "./PropertyUploadFolder.zip";
import { v4 as uuid } from "uuid";
import BreadCrumb from "../BreadCrumb";
import CommonSpinner from "../../CommonSpinner";

let mainPropertyCSVName = "SampleBulkProperties.csv";
let mainDocumentCSVName = "uploadDocumentsList.csv";
let chunkSize = 0;
let authHeaders = "";

const UploadProperties = () => {


  const [uniqueId, setUniqueId] = useState(uuid());
  const [loading, setLoading] = useState(undefined);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null);

  const [allPropertyData, setAllPropertyData] = useState({
    data: [],
    tableHeadings: [],
    tableDisplayClass: "d-none",
  });

  const [allPropertyDocumentList, setAllPropertyDocumentList] = useState([]);
  const [allPropertyDocuments, setAllPropertyDocuments] = useState([]);
  const [currentPropertyDocs, setCurrentPropertyDocs] = useState(null);
  const [propertyErrorDetails, setPropertyErrorDetails] = useState([]);
  const [docErrorDetails, setDocErrorDetails] = useState([]);
  const [alreadyExistPropertyNumber, setAlreadyExistPropertyNumber] = useState([]);
  const [alreadyExistDocuments, setAlreadyExistDocuments] = useState({});
  const [missingPropertyDetails, setMissingPropertyDetails] = useState({});
  const [duplicateUploadIdDetails, setDuplicateUploadIdDetails] = useState({});

  const [dropzoneActive, setDropzoneActive] = useState(false);
  const fileRef = useRef();

  const dataFromLocal = JSON.parse(localStorage.getItem("data"));
  if (dataFromLocal) {
    authHeaders = {
      Authorization: dataFromLocal.loginToken,
    };
  }

  // on Form Submit
  const InsertSingleProperty = async (property) => {
    let zipCodeValue = String(property.zip);
    const zipRes = await axios.post(`/sam/v1/customer-registration/zipcode-validation`, {
      zipcode: zipCodeValue,
      state_id: parseInt(property.state),
    })

    if (zipRes.data.status !== 0) {
      return { success: false, error: "Invalid ZipCode" }
    }

    if (parseInt(property.saleable_area) < parseInt(property.carpet_area)) {
      return { success: false, error: "Carpet area must be less than salable area." }
    }

    try {
      const propertyRes = await axios.post(`/sam/v1/property/auth/single-property`, property, {
        headers: authHeaders,
      })

      if (propertyRes.data.msg === 0) {
        return { success: true, error: null, msg: propertyRes.data.msg, property_id: propertyRes.data.property_id }
      } else if (propertyRes.data.msg === 1) {
        return { success: false, error: propertyRes.data.error, msg: propertyRes.data.msg }
      } else if (propertyRes.data.msg === 2) {

        return { success: false, error: `Property with property number: ${property.property_number} already exists`, msg: propertyRes.data.msg, property_id: propertyRes.data.property_id }
      };
    } catch (error) {
      return { success: false, error: error.response.data }
    }
  };


  // readFileFunction
  const readFileFunction = (inputFile, fileName) => {
    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      let parsedFilteredCSV = [];
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
              let uniqueUploadId = {};
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
                let currentUploadId = row["upload_property_id"] && fileName === mainPropertyCSVName ? row["upload_property_id"] : undefined;

                if (currentUploadId && uniqueUploadId[currentUploadId]) {
                  if (duplicateUploadId[currentUploadId]) {
                    let newValue = duplicateUploadId[currentUploadId].includes(rowIndex + 1) === true ? duplicateUploadId[currentUploadId] : [...duplicateUploadId[currentUploadId], rowIndex + 1]
                    duplicateUploadId[currentUploadId] = newValue
                  } else {
                    duplicateUploadId[currentUploadId] = [uniqueUploadId[currentUploadId], rowIndex + 1]

                  }
                } else if (currentUploadId) {
                  uniqueUploadId[currentUploadId] = rowIndex + 1;
                } 

              });

              console.log(hasMissingFields);
              setMissingPropertyDetails(() => missingDataObject);
              setDuplicateUploadIdDetails(() => duplicateUploadId);
            }
          });
        }

      }); 
      console.log(csv);
      const parsedData = parsedFilteredCSV.data;
      if (fileName === mainPropertyCSVName) {
        setAllPropertyData({
          ...allPropertyData,
          tableHeadings: Object.keys(parsedData[0]),
          data: parsedData,
          tableDisplayClass: "",
        });
      } else if (fileName === mainDocumentCSVName) {
        setAllPropertyDocumentList(parsedData)
      }

    };
    reader.readAsText(inputFile);
    setDropzoneActive(false);
    document.getElementById("showCsvDataInTable").scrollIntoView(true);
  };
 
  const fileUpload = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    processFiles(Array.from(files)); 
  };

  //check csv file exist or not
  const processFiles = (files) => {
    if (files.length) {
      let mainPropertyCsv = files.filter((file) => file.type === "text/csv" && mainPropertyCSVName === file.name)[0];
      let documentCsv = files.filter((file) => file.type === "text/csv" && mainDocumentCSVName === file.name)[0];
      let remainingDocument = files.filter((file) => !(file.type === "text/csv" && mainPropertyCSVName === file.name) && !(file.type === "text/csv" && mainDocumentCSVName === file.name));
      if (!mainPropertyCsv || !documentCsv) {
        return alert("Please upload both CSV files");
      }

      setAllPropertyDocuments(remainingDocument);
      readFileFunction(mainPropertyCsv, mainPropertyCSVName);
      readFileFunction(documentCsv, mainDocumentCSVName);
    } else {
      return alert("Please upload folder");
    }
  };


  // read And Upload Current file Chunk
  const readAndUploadCurrentFileChunk = (fileDetails, currentChunkIndex) => { 
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
    const { file, property_number, document_type_id, description, property_id, upload_property_id } = fileDetails;
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
      property_id: property_id,
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
    const isLastFile = lastUploadedFileIndex !== null && currentPropertyDocs && lastUploadedFileIndex + 1 >= currentPropertyDocs.length;
    const nextFileIndex = isLastFile ? null : currentFileIndex + 1; 

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
    if (loading === false && propertyErrorDetails && propertyErrorDetails.length === 0 && docErrorDetails && docErrorDetails.length === 0 && alreadyExistPropertyNumber && Object.keys(alreadyExistPropertyNumber).length === 0 && alreadyExistDocuments && Object.keys(alreadyExistDocuments).length === 0) {
      toast.success("All property and document uploaded successfully");
      clearPageStates();
    }

  }, [loading, propertyErrorDetails, docErrorDetails, alreadyExistPropertyNumber, alreadyExistDocuments])


  // clear page states
  const clearPageStates = () => {
    setUniqueId(uuid())
    setLoading(undefined)
    setCurrentFileIndex(null)
    setLastUploadedFileIndex(null)
    setAlreadyExistDocuments({});
    setMissingPropertyDetails({})
    setPropertyErrorDetails([])
    setDocErrorDetails([])
    setAlreadyExistPropertyNumber([])
    setDuplicateUploadIdDetails({});
    setAllPropertyData({
      data: [],
      tableHeadings: [],
      tableDisplayClass: "d-none",
    })
    setAllPropertyDocumentList([])
    setAllPropertyDocuments([])
    setCurrentPropertyDocs(null)
    chunkSize = 0
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    window.scrollTo(0, 0);
  };

  // post Property function
  const postProperty = async () => {
    setLoading(true);

    for (const property of allPropertyData.data) {

      const { property_number, type_id, title_clear_property, is_stressed, saleable_area, carpet_area, ready_reckoner_price, distress_value, plot_number, locality, landmark, city, state, country, PIN, is_sold, status } = property;

      if (!property_number
        || !type_id || !title_clear_property || !is_stressed || !saleable_area || !carpet_area || !is_sold || !ready_reckoner_price || !distress_value || !plot_number || !locality || !landmark || !city || !state || !country || !PIN || !status) {
        const error = { property_number: property_number, error: `For this property, some data is missing. Please update the data properly to upload the property` }
        setPropertyErrorDetails((old) => [...old, error]);
        setLoading(false);
      } else {
        property.type_id = Number(property.type_id)
        property.title_clear_property = Number(property.title_clear_property)
        property.is_stressed = Number(property.is_stressed)
        property.is_available_for_sale = Number(property.is_available_for_sale)
        property.saleable_area = Number(property.saleable_area)
        property.carpet_area = Number(property.carpet_area)
        property.ready_reckoner_price = Number(property.ready_reckoner_price)
        property.expected_price = Number(property.expected_price)
        property.market_price = Number(property.market_price)
        property.distress_value = Number(property.distress_value)
        property.is_sold = Number(property.is_sold)

        property.address_details = {
          flat_number: Number(property.flat_number),
          plot_number: Number(property.plot_number),
          building_name: property.building_name,
          society_name: property.society_name,
          locality: property.locality,
          landmark: property.landmark,
          city: property.city,
          state: property.state,
          country: property.country,
          zip: Number(property.PIN)
        }
        const { success, error, msg, property_id } = await InsertSingleProperty(property)
        if (success === false || !success) {
          if (msg === 2 && alreadyExistPropertyNumber.includes(property.property_number) === false) {
            setAlreadyExistPropertyNumber((prevNumbers) => [...prevNumbers, property.property_number]);
          } else {
            const err = { property_number: property.property_number, error }
            setPropertyErrorDetails((old) => [...old, err]);
          }
        } 
        if (allPropertyDocumentList.length > 0) {
          const currentPropertyDocumentList = allPropertyDocumentList.filter((doc) => doc.upload_property_id === property.upload_property_id) 
          let allCurrentDocumentPath = [];

          const currentPropertyDocuments = currentPropertyDocumentList.map(doc1 => {
            const matchedItem1 = allPropertyDocuments.find(doc2 => doc2.webkitRelativePath === doc1.document_url); 

            // if document not found
            if (matchedItem1 === undefined) { 

              setDocErrorDetails((old) => [...old, { upload_property_id: doc1.upload_property_id, error: `document not found with path ${doc1.document_url}` }])
            }

            allCurrentDocumentPath.push(doc1.document_url) 
            return matchedItem1 ? { file: matchedItem1, property_id, ...doc1 } : null;

            // return matchedItem1 ? { file: matchedItem1, ...doc1, property_id } : null;
          }
          ).filter(item => item !== null); 


          if (currentPropertyDocuments.length > 0 && (msg === 2 || msg === 0)) {
            setLoading(true); 

            setCurrentPropertyDocs(currentPropertyDocuments)
          } else if (currentPropertyDocuments.length > 0) {
            setDocErrorDetails((old) => [...old, { property_number: property.property_number, error: `Document not uploaded because the property not uploaded successfully.` }])
            setLoading(false);
          } else {
            setLoading(false);

          }
        } else if (allPropertyDocumentList.length > 0) {
          setDocErrorDetails((old) => [...old, { property_number: property.property_number, error: `Document not uploaded because the property does not exist.` }])
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    }
  }

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
        <div className="row min-100vh position-relative">
          <AdminSideBar />
          <div className="col-xl-10 col-lg-9 col-md-8">

            <div className="d-flex justify-content-between align-items-center mt-2">
              <BreadCrumb />
              <a
                className="btn btn-primary text-white sample-file-download-btn me-4"
                href={PropertyUploadFolder}
                download="PropertyUploadFolder.zip"
              >
                <i className="bi bi-download me-2"> </i>  Sample Bulk Folder
              </a>
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
                        className={`py-3 upload-file-inner-wrapper ${dropzoneActive ? "active" : ""
                          }`}
                      >
                        <div className="text-center fs-3 fw-bold">
                          Choose a file or drag it here
                        </div>

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
                          To download the sample bulk folder format, <a className="custom-text-secondary" href={PropertyUploadFolder}>click here</a>.
                        </small>
                        <br />
                       
                      </div>
                    </div>
                  </div>

                  <div
                    id="showCsvDataInTable"
                    className={`col-xl-12 position-relative mb-5 vh-100 ${allPropertyData ? "" : "d-none"}`}
                  >
                    <div
                      className={`${allPropertyData?.tableDisplayClass} csv-data-table-wrapper`}
                    >
                      <table className="table table-striped table-bordered table-primary h-100">
                        <thead>
                          <tr>
                            {allPropertyData?.tableHeadings.map((heading, Index) => {
                              return <th key={Index}>{heading}</th>;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {allPropertyData?.data.map((i, Index) => {
                            return (
                              <tr key={Index}>
                                {allPropertyData?.tableHeadings.map((heading, Index) => {
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
                      className={`text-end mt-3 bg-light  save-cancel-btn-div ${allPropertyData?.tableDisplayClass}`}
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
        </div>

        {/* Modal */}
        <div
          className={`modal fade ${loading === false && ((propertyErrorDetails && propertyErrorDetails.length > 0) || (docErrorDetails && docErrorDetails.length > 0) || (alreadyExistPropertyNumber && alreadyExistPropertyNumber.length > 0) || (alreadyExistDocuments && Object.keys(alreadyExistDocuments).length > 0)) ? "show d-block" : "d-none"}`}
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
              {((propertyErrorDetails && propertyErrorDetails.length > 0) || (alreadyExistPropertyNumber && alreadyExistPropertyNumber.length > 0)) &&
                <div>
                  <h4>Property Error</h4>
                  <div className="m-2">
                    {alreadyExistPropertyNumber && alreadyExistPropertyNumber.length > 0 && <div><i className="bi bi-dot"></i>{`Property already exists with property numbers:`}<span className="fw-bold">{alreadyExistPropertyNumber.join(", ")}</span>.</div>
                    }
                    {propertyErrorDetails && propertyErrorDetails.length > 0 && propertyErrorDetails.map((err, i) => {
                      return <div key={i} className=""><i className="bi bi-dot"></i>{`${err.property_number} : ${err.error}`}</div>
                    })}
                  </div>
                </div>}
              {(docErrorDetails || alreadyExistDocuments) && (Object.keys(alreadyExistDocuments).length > 0 || Object.keys(docErrorDetails).length > 0) && <div>
                <h4>Document Error</h4>
                <div className="m-2">
                  {alreadyExistDocuments && Object.keys(alreadyExistDocuments).length > 0 && Object.keys(alreadyExistDocuments).map((upload_property_id, i) => {
                    return <div><i className="bi bi-dot"></i>{`Documents already exist with `}<span className="fw-bold">upload_property_id {upload_property_id}</span>{`,  including the following document names:`} <span className="fw-bold">{alreadyExistDocuments[upload_property_id].join(", ")}</span>.</div>
                  })}

                  {docErrorDetails.map((err, i) => {
                    return <div key={i} className=""><i className="bi bi-dot"></i> upload_property_id   {err.upload_property_id} : {err.error}</div>
                  })}
                </div>
              </div>}
              <div className="modal-body common-btn-font">(Please create a new CSV containing the updated property details, and remove the previously uploaded ones.)</div>
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
                <h4>Property fields missing Error</h4>
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
    </Layout>
  );
};

export default UploadProperties;
