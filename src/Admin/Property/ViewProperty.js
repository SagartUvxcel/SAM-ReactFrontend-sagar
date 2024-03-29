import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import axios from "axios";
import { transformDateFormat } from "../../CommonFunctions";
import CommonSpinner from "../../CommonSpinner";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import JSZip from "jszip";

let cnt = 0;
let authHeader = "";
let roleId = "";
let isBank = false;
const ViewProperty = ({
  selectedProperty,
  propertyDocumentsList,
  setPropertyDocumentsList,
  getListOfPropertyDocuments,
}) => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    isBank = data.isBank;
    roleId = data.roleId;
  }
  const [srcOfFile, setSrcOfFile] = useState(null);
  const [fileExtension, setFileExtension] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [
    confirmDeleteDocumentBtnDisabled,
    setConfirmDeleteDocumentBtnDisabled,
  ] = useState(true);
  const [idsOfDocumentsToDelete, setIdsOfDocumentsToDelete] = useState(null);
  const confirmDeleteDocumentInputRef = useRef();
  const [excelData, setExcelData] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [zipExtractedContent, setZipExtractedContent] = useState([]);
  if (data) {
    authHeader = { Authorization: data.loginToken };
  }

  let dataString = "";
  let fileTypesObj = {
    pdf: "data:application/pdf;base64,",
    docx: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
    xlsx: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
    xls: "data:application/vnd.ms-excel;base64,",
    zip: "data:application/zip;base64,",
    rar: "data:application/x-rar-compressed;base64,",
    // rar: "data:application/vnd.rar;base64,",
    jpg: "data:image/jpg;base64,",
    jpeg: "data:image/jpeg;base64,",
    png: "data:image/png;base64,",
    txt: "data:text/plain;base64,",
    mp4: "data:video/mp4;base64,",
    mp3: "data:audio/mpeg;base64,",
    wav: "data:audio/wav;base64,",
  };

  const {
    type_name,
    branch_name,
    carpet_area,
    saleable_area,
    city_name,
    state_name,
    completion_date,
    purchase_date,
    expected_price,
    market_price,
    ready_reckoner_price,
    is_available_for_sale,
    mortgage_date,
    is_sold,
    is_stressed,
    property_number,
    property_id,
    // status,
    society_name,
    plot_no,
    flat_no,
    locality,
    zip,
    territory,
    title_clear_property,
    possession_of_the_property,
    distress_value,
  } = selectedProperty;
  let s1 = "";
  let combinedBinaryFormatOfChunks = "";
  const [fileName, setFileName] = useState();

  const fetchExcelFilesData = async (url) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });
          setExcelData(jsonData);
        };
        reader.readAsArrayBuffer(blob);
      });
  };

  const fetchZipFileData = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const zip = new JSZip();
    await zip.loadAsync(blob);
    const extractedContent = Object.keys(zip.files).map((fileName) => fileName);
    setZipExtractedContent(extractedContent);
  };

  const getChunksOfDocuments = async (documentId, propertyId) => {
    setDocumentLoading(true);
    let dataToPost = {
      document_id: documentId,
      property_id: propertyId,
      chunk_number: cnt,
      chunk_size: 1024 * 1204 * 25,
    };
    // console.log(dataToPost);
    try {
      await axios
        .post(`/sam/v1/property/auth/property-docs`, dataToPost, {
          headers: authHeader,
        })
        .then(async (res) => {
          if (s1 !== res.data.data) {
            s1 += res.data.data;
            // console.log(res.data.data);
            combinedBinaryFormatOfChunks += window.atob(res.data.data);
            if (res.data.last_chunk !== true) {
              cnt += 1;
              getChunksOfDocuments();
            } else {
              setFileName(res.data.file_name);
              let extensionArr = res.data.file_name.split(".");
              let fileExtension = extensionArr[extensionArr.length - 1];
              setFileExtension(fileExtension);
              console.log("Extension : ", fileExtension);
              if (fileTypesObj[fileExtension]) {
                dataString = fileTypesObj[fileExtension];
              } else {
                dataString = "";
              }
              let originalBase64 = window.btoa(combinedBinaryFormatOfChunks);
              const base64Data = originalBase64;
              const base64Response = await fetch(`${dataString}${base64Data}`);
              const blob = await base64Response.blob();
              const url = URL.createObjectURL(blob);
              setSrcOfFile(url);
              if (fileExtension === "xlsx" || fileExtension === "xls") {
                fetchExcelFilesData(url);
              } else if (fileExtension === "zip") {
                fetchZipFileData(url);
              }
              setDocumentLoading(false);
            }
          }
        });
    } catch (error) {
      setDocumentLoading(false);
    }
  };

  const showHideUploadAndRefreshBtn = () => {
    let documentContainer = document.querySelector(".document-container");
    let uploadRefresh = document.querySelectorAll(".upload-refresh");
    let refreshIconWrapper = document.querySelector(
      ".property-documents-list-refresh-icon-wrapper"
    );
    if (documentContainer && uploadRefresh) {
      if (documentContainer.getAttribute("aria-expanded") === "true") {
        uploadRefresh.forEach((div) => {
          div.style.display = "";
        });
        document.querySelector(".chevRonDown").classList.add("rotate-180deg");
      } else {
        uploadRefresh.forEach((div) => {
          div.style.display = "none";
        });
        document
          .querySelector(".chevRonDown")
          .classList.remove("rotate-180deg");
      }
      refreshIconWrapper.style.right = "50px";
    } else {
      refreshIconWrapper.style.right = "10px";
    }
  };

  const deleteDocuments = async (arrayOfIds) => {
    let dataToPost = { doc_id: arrayOfIds };
    const url = `/sam/v1/property/auth/delete-property-document`;
    try {
      const res = await axios.delete(url, {
        headers: authHeader,
        data: dataToPost,
      });
      if (res.data.status === 0) {
        toast.success(`Documents deleted successfully`);
        confirmDeleteDocumentInputRef.current.value = "";
        setConfirmDeleteDocumentBtnDisabled(true);
        getListOfPropertyDocuments(property_id);
        setSelectAll(false);
      } else {
        toast.error("Internal Server Error");
      }
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  useEffect(() => {
    showHideUploadAndRefreshBtn();
  }, [propertyDocumentsList]);

  const isImageFile = (type) => {
    if (type === "jpg" || type === "jpeg" || type === "png") {
      return true;
    } else {
      return false;
    }
  };

  const isAudioVideoFile = (type) => {
    if (type === "mp4" || type === "mp3" || type === "wav") {
      return true;
    } else {
      return false;
    }
  };

  const handleCheckboxChange = (documentId) => {
    const updatedDocuments = propertyDocumentsList.map((doc) =>
      doc.document_id === documentId ? { ...doc, checked: !doc.checked } : doc
    );
    setPropertyDocumentsList(updatedDocuments);
    setSelectAll(updatedDocuments.every((doc) => doc.checked));
  };

  const toggleSelectAll = () => {
    const updatedDocuments = propertyDocumentsList.map((doc) => ({
      ...doc,
      checked: !selectAll,
    }));
    setPropertyDocumentsList(updatedDocuments);
    setSelectAll(!selectAll);
  };

  const onDeleteDocumentBtnClick = () => {
    // Implement your deletion logic here
    const selectedDocs = propertyDocumentsList.filter((doc) => doc.checked);
    let arrOfDocumentsIds = selectedDocs.map((i) => i.document_id);
    setIdsOfDocumentsToDelete(arrOfDocumentsIds);
    confirmDeleteDocumentInputRef.current.value = "";
    setConfirmDeleteDocumentBtnDisabled(true);
  };

  return (
    <>
      <section className="admin-edit-property mb-5">
        <h3 className="fw-bold text-primary pb-2">{type_name}</h3>
        <div className="container-fluid border p-3">
          <div className="row ">
            <div className="col-xl-5">
              <div
                id="carouselExampleIndicators"
                className="carousel slide"
                data-bs-ride="carousel"
              >
                <div className="carousel-indicators property-slider-indicators">
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="0"
                    className="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                  ></button>
                </div>
                <div className="carousel-inner">
                  <div className="carousel-item active" data-bs-interval="2000">
                    <img
                      src="/images2.jpg"
                      className="d-block w-100"
                      alt="..."
                    />
                  </div>
                  <div className="carousel-item" data-bs-interval="2000">
                    <img
                      src="/images2.jpg"
                      className="d-block w-100"
                      alt="..."
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src="/images2.jpg"
                      className="d-block w-100"
                      alt="..."
                    />
                  </div>
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                </button>
              </div>
              <div className="container-fluid p-0">
                <div className="row mt-3">
                  {property_number ? (
                    <div className="col-6">
                      <div className="card p-2 text-center border-primary border-2 border">
                        <small className="text-muted">Property Number</small>
                        <small className="common-btn-font">
                          {property_number}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {/* {is_stressed ? (
                    <div className="col-6">
                      <div className="card p-2 text-center border-primary border-2 border">
                        <small className="text-muted">Is stressed</small>
                        <small className="common-btn-font text-capitalize">
                          {is_stressed === "1" ? "Yes" : "No"}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )} */}
                  <div className="col-12 mt-3">
                    <div className="card p-2 text-center border-primary border-2 border position-relative">
                      {propertyDocumentsList ? (
                        <>
                          <div
                            className="container-fluid document-container"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseExample"
                            aria-expanded="true"
                            onClick={() => {
                              showHideUploadAndRefreshBtn();
                            }}
                          >
                            <div className="row">
                              <div className="col-12 d-flex justify-content-between">
                                <span className="fw-bold">
                                  <i className="bi bi-file-earmark pe-2"></i>
                                  Documents
                                </span>

                                <div className="chevRonDown">
                                  <i className="bi bi-chevron-down"></i>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className="collapse mt-2 documents-list-collapse show"
                            id="collapseExample"
                          >
                            <table className="table">
                              <tbody>
                                <tr>
                                  <td className="d-flex justify-content-start align-items-center">
                                    <div className="">
                                      <input
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                        className="form-check-input border border-primary"
                                        type="checkbox"
                                        value=""
                                        id="flexCheckDefault"
                                      />
                                      <span className="ps-2">Select All</span>
                                    </div>

                                    {propertyDocumentsList.some(
                                      (doc) => doc.checked
                                    ) && (
                                      <button
                                        onClick={onDeleteDocumentBtnClick}
                                        className="btn btn-sm btn-danger ms-4"
                                        data-bs-toggle="modal"
                                        data-bs-target="#confirmDeleteDocumentModal"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="docs-list-table-wrapper">
                              <table className="table">
                                <tbody>
                                  {propertyDocumentsList.map(
                                    (document, Index) => {
                                      return (
                                        <tr key={Index}>
                                          <td>
                                            <div className="form-check">
                                              <input
                                                checked={
                                                  document.checked || false
                                                }
                                                onChange={() =>
                                                  handleCheckboxChange(
                                                    document.document_id
                                                  )
                                                }
                                                className="form-check-input border border-primary"
                                                type="checkbox"
                                                value=""
                                                id="flexCheckDefault"
                                              />
                                            </div>
                                          </td>
                                          <th scope="row">{Index + 1}</th>
                                          <td>{document.document_name}</td>
                                          <td>
                                            <div className="d-flex">
                                              <button
                                                onClick={() => {
                                                  getChunksOfDocuments(
                                                    document.document_id,
                                                    property_id
                                                  );
                                                }}
                                                data-bs-toggle="modal"
                                                data-bs-target="#documentModal"
                                                className="btn btn-sm btn-primary"
                                              >
                                                <i className="bi bi-eye"></i>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-muted">
                            No documents available.
                          </div>
                        </>
                      )}
                      <NavLink
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          localStorage.setItem(
                            "upload-doc",
                            JSON.stringify({
                              number: property_number,
                              id: property_id,
                            })
                          );
                        }}
                        to={`${
                          isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"
                        }/property/single-property-documents-upload`}
                        className="text-decoration-none mt-1 upload-refresh"
                      >
                        <i className="bi bi-upload me-2"></i>Upload documents
                      </NavLink>

                      <div
                        className="property-documents-list-refresh-icon-wrapper upload-refresh"
                        onClick={() => {
                          getListOfPropertyDocuments(property_id);
                          setSelectAll(false);
                        }}
                      >
                        <i className="bi bi-arrow-clockwise text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-7 mt-xl-0 mt-4 property-details">
              <div className="container-fluid">
                <div className="row">
                  {flat_no ||
                  plot_no ||
                  society_name ||
                  locality ||
                  city_name ||
                  state_name ||
                  zip ? (
                    <div className="col-12 mb-2">
                      <span className="text-muted">
                        <i className="bi bi-geo-alt pe-2"></i>
                        Address Details
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}

                  {flat_no ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Flat Number</small>
                      <h5 className="mt-1">{flat_no}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {plot_no ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Plot Number</small>
                      <h5 className="mt-1">{plot_no}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {society_name ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Society Name</small>
                      <h5 className="mt-1">{society_name}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {locality ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Locality</small>
                      <h5 className="mt-1">{locality}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {city_name ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">City</small>
                      <h5 className="mt-1">{city_name}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {state_name ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">State</small>
                      <h5 className="mt-1">{state_name}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {zip ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Zip</small>
                      <h5 className="mt-1">{zip}</h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {saleable_area || carpet_area ? (
                    <>
                      <div className="col-12">
                        <hr className="my-md-2 my-3" />
                      </div>
                      <div className="col-12 mb-2">
                        <span className="text-muted">
                          <i className="bi bi-pin-map pe-2"></i>
                          Area
                        </span>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {saleable_area ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Saleable Area</small>
                      <h5 className="mt-1">{saleable_area}</h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {carpet_area ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Carpet Area</small>
                      <h5 className="mt-1">{carpet_area}</h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {completion_date || purchase_date || mortgage_date ? (
                    <>
                      <div className="col-12">
                        <hr className="my-md-2 my-3" />
                      </div>
                      <div className="col-12 mb-2">
                        <span className="text-muted">
                          <i className="bi bi-calendar-check pe-2"></i>
                          Dates
                        </span>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {completion_date ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Completion Date</small>
                      <h5 className="mt-1">
                        {transformDateFormat(completion_date)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {purchase_date ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Purchase Date</small>
                      <h5 className="mt-1">
                        {transformDateFormat(purchase_date)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {mortgage_date ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Mortgage Date</small>
                      <h5 className="mt-1">
                        {transformDateFormat(mortgage_date)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {market_price ||
                  ready_reckoner_price ||
                  expected_price ||
                  distress_value ? (
                    <>
                      <div className="col-12">
                        <hr className="my-md-2 my-3" />
                      </div>
                      <div className="col-12 mb-2">
                        <span className="text-muted">
                          <i className="bi bi-tag pe-2"></i>
                          Pricing
                        </span>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {market_price ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Market Price</small>
                      <h5 className="mt-1">
                        <i className="bi bi-currency-rupee"></i>
                        {(market_price / 10000000).toFixed(2)} Cr.
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {ready_reckoner_price ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Ready Reckoner Price</small>
                      <h5 className="mt-1">
                        <i className="bi bi-currency-rupee"></i>
                        {(ready_reckoner_price / 10000000).toFixed(2)} Cr.
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {expected_price ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Reserved Price</small>
                      <h5 className="mt-1">
                        <i className="bi bi-currency-rupee"></i>
                        {(expected_price / 10000000).toFixed(2)} Cr.
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {/* {distress_value ? (
                    <div className="col-md-4 mt-2">
                      <small className="text-muted">Distress Value</small>
                      <h5 className="mt-1">
                        <i className="bi bi-currency-rupee"></i>
                        {(distress_value / 10000000).toFixed(2)} Cr.
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )} */}
                  {is_sold || is_available_for_sale ? (
                    <>
                      <div className="col-12">
                        <hr className="my-md-2 my-3" />
                      </div>
                      <div className="col-12 mb-2">
                        <span className="text-muted">
                          <i className="bi bi-building-check pe-2"></i>
                          Property Availability
                        </span>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {/* {is_sold ? (
                    <div className="col-md-4 col-6">
                      <small className="text-muted">Is Sold?</small>
                      <h5 className="mt-1 text-capitalize">
                        {is_sold === "1" ? "Yes" : "No"}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )} */}
                  {is_available_for_sale ? (
                    <div className="col-md-4">
                      <small className="text-muted">
                        Is Available For Sale?
                      </small>
                      <h5 className="mt-1 text-capitalize">
                        {is_available_for_sale === "1" ? "Yes" : "No"}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  {branch_name ||
                  territory ||
                  title_clear_property ||
                  possession_of_the_property ? (
                    <>
                      <div className="col-12">
                        <hr className="my-md-2 my-3" />
                      </div>
                      <div className="col-12">
                        <span className="text-muted">
                          <i className="bi bi-info-square pe-2"></i>Other
                          details
                        </span>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {branch_name ? (
                    <div className="col-md-6">
                      <small className="text-muted">Branch</small>
                      <h5 className="mt-1 text-capitalize">{branch_name}</h5>
                    </div>
                  ) : (
                    <></>
                  )}
                  {territory ? (
                    <div className="col-md-6">
                      <small className="text-muted">Territory</small>
                      <h5 className="mt-1 text-capitalize">{territory}</h5>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Title clear property</small>
                    <h5 className="mt-1 text-capitalize">
                      {title_clear_property === "yes" ? "Yes" : "No"}
                    </h5>
                  </div>

                  {/* {possession_of_the_property ? (
                    <div className="col-md-6 mt-2">
                      <small className="text-muted">
                        Possession of the property
                      </small>
                      <h5 className="mt-1 text-capitalize">
                        {possession_of_the_property}
                      </h5>
                    </div>
                  ) : (
                    <></>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="modal fade"
        id="documentModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ background: "var(--bg-gradient-blue)" }}
            >
              <h5 className="modal-title" id="exampleModalLabel">
                {documentLoading
                  ? "Loading file name..."
                  : fileName
                  ? fileName
                  : ""}
              </h5>
              <div className="d-flex align-items-center">
                <a
                  className="btn btn-light me-4"
                  href={srcOfFile}
                  download={fileName}
                >
                  Download
                </a>
                <i
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  className="bi bi-x-lg text-white"
                ></i>
              </div>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row justify-content-center">
                  <div className="col-12 p-0 min-100vh text-center">
                    {documentLoading ? (
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ minHeight: "45vh" }}
                      >
                        <CommonSpinner
                          spinnerColor="primary"
                          spinnerType="grow"
                        />
                      </div>
                    ) : srcOfFile ? (
                      isImageFile(fileExtension) ? (
                        <>
                          <img
                            src={srcOfFile}
                            className="img-fluid"
                            alt="property"
                            style={{ objectFit: "contain" }}
                          />
                        </>
                      ) : isAudioVideoFile(fileExtension) ? (
                        <div>
                          <iframe
                            src={srcOfFile}
                            title="Base64 Content"
                            width="100%"
                            height="500px"
                          />
                        </div>
                      ) : fileExtension === "zip" ? (
                        <div className="container-fluid">
                          <div className="row mt-4">
                            {zipExtractedContent &&
                              zipExtractedContent.map((item, index) => (
                                <div
                                  key={index}
                                  className="col-lg-2 col-md-4 col-6 mb-4"
                                >
                                  <div className="d-flex flex-column align-items-center justify-content-center">
                                    <div className="file-icon d-flex justify-content-center align-items-center">
                                      <i className="bi bi-file-earmark-fill text-white fs-1"></i>
                                    </div>
                                    <div className="file-name">{item}</div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : fileExtension === "xlsx" ||
                        fileExtension === "xls" ? (
                        <div style={{ overflow: "auto", maxHeight: "80vh" }}>
                          <table className="table table-bordered table-striped">
                            <thead style={{ position: "sticky", top: "0" }}>
                              <tr>
                                {excelData &&
                                  excelData[0].map(
                                    (headerCell, headerIndex) => (
                                      <th
                                        className="bg-secondary text-white"
                                        key={headerIndex}
                                      >
                                        {headerCell}
                                      </th>
                                    )
                                  )}
                              </tr>
                            </thead>
                            <tbody>
                              {excelData &&
                                excelData.slice(1).map(
                                  (
                                    row,
                                    rowIndex // Start from index 1 to skip header row
                                  ) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                      ))}
                                    </tr>
                                  )
                                )}
                            </tbody>
                          </table>
                        </div>
                      ) : fileExtension === "" ? (
                        <></>
                      ) : fileExtension === "txt" || fileExtension === "pdf" ? (
                        <>
                          <DocViewer
                            documents={[{ uri: srcOfFile }]}
                            pluginRenderers={DocViewerRenderers}
                          />
                        </>
                      ) : (
                        <div className="wrapper">
                          <h1 className="text-center text-primary">
                            No Renderer for this file type
                          </h1>
                          <span className="text-muted">
                            You can download the file using download button
                          </span>
                        </div>
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmDeleteDocumentModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm confirm-delete-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Are you sure ?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <label
                htmlFor="confirm-delete-document-input"
                className="form-label"
              >
                Type{" "}
                <span className="fw-bold">{`"Delete"`}</span> to
                confirm.
              </label>
              <input
                onChange={(e) => {
                  if (e.target.value === "Delete") {
                    setConfirmDeleteDocumentBtnDisabled(false);
                  } else {
                    setConfirmDeleteDocumentBtnDisabled(true);
                  }
                }}
                ref={confirmDeleteDocumentInputRef}
                type="text"
                name="confirm-delete-document-id"
                id="confirm-delete-document-input"
                className="form-control"
              />
              <button
                onClick={() => {
                  deleteDocuments(idsOfDocumentsToDelete);
                }}
                data-bs-dismiss="modal"
                disabled={confirmDeleteDocumentBtnDisabled}
                className="btn btn-danger w-100 mt-3 fw-bold"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProperty;
