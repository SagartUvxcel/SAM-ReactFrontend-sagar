import React, { useRef } from "react";
import Layout from "../1.CommonLayout/Layout";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CommonSpinner from "../../CommonSpinner";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import {
  changeActiveSortStyle,
  propertyDateFormat,
} from "../../CommonFunctions";
import CryptoJS from "crypto-js";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import "./Gallery.css";
import convertCurrency from "../1.CommonLayout/currencyConverter";
/* Required for the annotation and text layers */
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


let authHeaders = "";
let isBank = "";
let isLogin = false;
let subscription_plan_id = 0;
let cnt = 0;
;
const ListOfProperties = () => {
  const location = useLocation();
  const secretKey = "my_secret_key";
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get("data");
  const updatedCountry = localStorage.getItem("location");
  const dataFromParams = JSON.parse(
    CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8)
  );
  const localData = JSON.parse(localStorage.getItem("data"));
  if (localData) {
    authHeaders = { Authorization: localData.loginToken };
    isLogin = localData.isLoggedIn;
    isBank = localData.isBank;
    subscription_plan_id = localData.subscription_plan_id;
  }
  const [sortText, setSortText] = useState("Relevance");
  const [pageLoading, setPageLoading] = useState(false);
  const [enquiryFormData, setEnquiryFormData] = useState({
    property_id: "",
    enquiry_source: "email",
    enquiry_comments: "",
  });
  const enquiryForm = useRef();
  const { enquiry_comments } = enquiryFormData;
  const [selectedPropertyResults, setSelectedPropertyResults] = useState(null);
  const [currentAllPropertiesDetails, setCurrentAllPropertiesDetails] = useState(null);
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    assetCategory: "",
    banks: "",
  });
  const [banks, setBanks] = useState([]);
  const [srcOfFile, setSrcOfFile] = useState(null);
  const [currentPropertyId, setCurrentPropertyId] = useState(null);
  const [fileExtension, setFileExtension] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [viewImagesModalLoading, setViewImagesModalLoading] = useState(false);
  const [viewDocumentModalLoading, setViewDocumentModalLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zipExtractedContent, setZipExtractedContent] = useState([]);
  const [propertyDocumentsList, setPropertyDocumentsList] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [imageFetchLoading, setImageFetchLoading] = useState(false);
  const [currentPropertyViewImagesId, setCurrentPropertyViewImagesId] = useState(null);
  const [currentPropertyViewDocumentId, setCurrentPropertyViewDocumentId] = useState(null);
  const [callViewImagesFunction, setCallViewImagesFunction] = useState(false);
  const [callViewDocumentFunction, setCallViewDocumentFunction] = useState(false);

  // It will fetch all states, banks, assets from api and will map those values to respective select fields.
  const getSearchDetails = async () => {

    const countryId = updatedCountry === "india" ? 1 : 11;
    const postData = { "country_id": countryId }
    let apis = {
      stateAPI: `/sam/v1/property/by-state`,
      bankAPI: `/sam/v1/property/by-bank`,
      categoryAPI: `/sam/v1/property/by-category`,
    };

    try {
      // Get all states from api.
      const allStates = await axios.post(apis.stateAPI, postData);
      // Get all banks from api.
      const allBanks = await axios.post(apis.bankAPI, postData);
      // Get all asset Categories from api.
      const assetCategories = await axios.get(apis.categoryAPI);
      let cityByState = {};
      if (dataFromParams.state_id) {
        cityByState = await axios.post(`/sam/v1/property/by-city`, {
          state_id: dataFromParams.state_id,
        });
      }

      // store states, banks and asset categories into searchFields useState.
      setSearchFields({
        ...searchFields,
        states: allStates.data,
        cities: cityByState.data,
        banks: allBanks.data,
        assetCategory: assetCategories.data,
      });
    } catch (error) { }
  };

  // viewCurrentProperty
  const viewCurrentProperty = async () => {
    setPageLoading(true);
    delete dataFromParams.batch_number;
    delete dataFromParams.batch_size;
    const countryId = updatedCountry === "india" ? 1 : 11;
    const postData = { "country_id": countryId }
    try {
      const res = await axios.post(`/sam/v1/property/auth/view-properties`, dataFromParams, {
        headers: authHeaders,
      });
      let propertyDetails = res.data;
      const bankRes = await axios.post(`/sam/v1/property/by-bank`, postData);
      setBanks(bankRes.data);
      setSelectedPropertyResults(propertyDetails);
      localStorage.setItem("defaultResultsOfProperties", JSON.stringify(propertyDetails));
      setCurrentAllPropertiesDetails(propertyDetails);
      setPageLoading(false);
    } catch (error) {
      console.log(error);
      setPageLoading(false);
    }
  };

  // fetching All Properties Documents And Images
  const fetchAllPropertiesDocumentsAndImages = async (allPropertiesDetails) => {
    setImageFetchLoading(true);
    if (allPropertiesDetails && allPropertiesDetails.length > 0) {
      const documentResults = await Promise.all(
        allPropertiesDetails.map(async (property) => {
          const result = await getPropertyDocumentsData(property.property_id);
          return { ...property, ...result };
        })
      );
      setSelectedPropertyResults(documentResults);
      localStorage.setItem("defaultResultsOfProperties", JSON.stringify(documentResults));
      setImageFetchLoading(false);
      setCallViewImagesFunction(true);
      setCallViewDocumentFunction(true);
    }
    setImageFetchLoading(false);
  }

  // showSortedResults
  const showSortedResults = (e) => {
    window.scrollTo(0, 0);
    setSortText(e.target.textContent);
    const { name } = e.target.dataset;
    if (name === "relevance") {
      setSelectedPropertyResults(
        JSON.parse(localStorage.getItem("defaultResultsOfProperties"))
      );
    } else if (name === "price-low-to-high") {
      selectedPropertyResults.sort((a, b) => a.market_price - b.market_price);
    } else if (name === "price-high-to-low") {
      selectedPropertyResults.sort((a, b) => b.market_price - a.market_price);
    } else if (name === "most-recent") {
      selectedPropertyResults.sort(
        (a, b) => new Date(b.added_date) - new Date(a.added_date)
      );
    }
  };

  // on Enquiry Fields Change
  const onEnquiryFieldsChange = (e) => {
    const { name, value } = e.target;
    if (name === "enquiry-comment") {
      setEnquiryFormData({ ...enquiryFormData, enquiry_comments: value });
    }
  };

  // on Enquiry Form Submit
  const onEnquiryFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(`/sam/v1/property/auth/property_enquiry`, enquiryFormData, {
          headers: authHeaders,
        })
        .then((res) => {
          if (res.data.msg === 0) {
            toast.success("Message sent successfully");
          } else if (res.data.msg === 3) {
          } else {
            toast.error("Internal server error");
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  // get List Of Property Documents from API
  const getPropertyDocumentsData = async (id) => {
    setPropertyImages([]);
    setViewDocumentModalLoading(true);
    try {
      const propertyDocsListRes = await axios.get(
        `/sam/v1/property/auth/property_document_list/${id}`,
        { headers: authHeaders }
      );
      const documentDetails = propertyDocsListRes.data;
      if (documentDetails !== null) {
        // Filter the documents array to exclude items with category_id of 16
        const { filteredDocuments, filteredImages } = documentDetails.reduce((acc, document) => {
          if (document.category_id === 16) {
            acc.filteredImages.push(document);
          } else {
            acc.filteredDocuments.push(document);
          }
          return acc;
        }, { filteredDocuments: [], filteredImages: [] });

        if (filteredImages.length !== 0) {
          const results = [];
          for (const doc of filteredImages) {
            const result = await getChunksOfImages(doc.document_id, id);
            if (result) {
              results.push({ ...doc, ...result });
            } else {
              results.push({ ...doc, error: "Failed to process document" });
            }
          }
          return { propertyDocuments: filteredDocuments, propertyImages: results }
        }
      } else {
        setViewDocumentModalLoading(false);
      }
    } catch (error) {
      console.log(error);
      setViewDocumentModalLoading(false);
    }

  };

  let s1 = "";
  let combinedBinaryFormatOfChunks = "";
  let dataString = "";
  const [fileName, setFileName] = useState();
  // all file types
  let fileTypesObj = {
    pdf: "data:application/pdf;base64,",
    docx: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
    xlsx: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
    xls: "data:application/vnd.ms-excel;base64,",
    zip: "data:application/zip;base64,",
    rar: "data:application/x-rar-compressed;base64,",
    jpg: "data:image/jpg;base64,",
    jpeg: "data:image/jpeg;base64,",
    png: "data:image/png;base64,",
    txt: "data:text/plain;base64,",
    mp4: "data:video/mp4;base64,",
    mp3: "data:audio/mpeg;base64,",
    wav: "data:audio/wav;base64,",
  };

  // fetch Excel Files Data
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

  // fetch Zip File Data
  const fetchZipFileData = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const zip = new JSZip();
    await zip.loadAsync(blob);
    const extractedContent = Object.keys(zip.files).map((fileName) => fileName);
    setZipExtractedContent(extractedContent);
  };

  // get Chunks Of Documents
  const getChunksOfDocuments = async (documentId, propertyId) => {
    setDocumentLoading(true);
    let dataToPost = {
      document_id: documentId,
      property_id: propertyId,
      chunk_number: cnt,
      chunk_size: 1024 * 1204 * 25,
    };
    try {
      await axios
        .post(`/sam/v1/property/auth/property-docs`, dataToPost, {
          headers: authHeaders,
        })
        .then(async (res) => {
          if (s1 !== res.data.data) {
            s1 += res.data.data;
            combinedBinaryFormatOfChunks += window.atob(res.data.data);
            if (res.data.last_chunk !== true) {
              cnt += 1;
              getChunksOfDocuments();
            } else {
              setFileName(res.data.file_name);
              let extensionArr = res.data.file_name.split(".");
              let fileExtension = extensionArr[extensionArr.length - 1];
              setFileExtension(fileExtension);
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

  // get Chunks Of Images
  const viewImagesBtnFunction = async (propertyId) => {
    setPropertyImages([]);
    setCurrentPropertyViewImagesId(propertyId);
    setCallViewImagesFunction(false);
    if (imageFetchLoading) {
      setViewImagesModalLoading(true);
    } else {
      const imagesList = selectedPropertyResults.filter(property => property.property_id === propertyId);
      setPropertyImages(imagesList[0].propertyImages);
      setViewImagesModalLoading(false);
      setCurrentPropertyViewImagesId(null);

    }
  }

  // get Documents List
  const getPropertyDocumentsList = async (propertyId) => {
    setCurrentPropertyViewDocumentId(propertyId);
    setCallViewDocumentFunction(false);
    if (imageFetchLoading) {
      setViewDocumentModalLoading(true);
    } else {
      setPropertyDocumentsList([]);
      const documentList = selectedPropertyResults.filter(property => property.property_id === propertyId);
      setCurrentPropertyId(propertyId);
      setPropertyDocumentsList(documentList && documentList[0].propertyDocuments);
      setViewDocumentModalLoading(false);
      setCurrentPropertyViewDocumentId(null);
    }
  }

  // get Chunks Of Documents
  const getChunksOfImages = async (documentId, propertyId) => {
    let s1 = '';
    let cnt = 0;
    let combinedBinaryFormatOfChunks = '';

    const fetchChunks = async () => {
      let dataToPost = {
        document_id: documentId,
        property_id: propertyId,
        chunk_number: cnt,
        chunk_size: 1024 * 1024 * 25,
      };

      try {
        const res = await axios.post(`/sam/v1/property/auth/property-docs`, dataToPost, {
          headers: authHeaders,
        });

        if (s1 !== res.data.data) {
          s1 += res.data.data;
          combinedBinaryFormatOfChunks += window.atob(res.data.data);

          if (res.data.last_chunk !== true) {
            cnt += 1;
            return await fetchChunks(); // Recursive call with await
          } else {
            const fileName = res.data.file_name;
            let extensionArr = res.data.file_name.split(".");
            let fileExtension = extensionArr[extensionArr.length - 1];

            let dataString = fileTypesObj[fileExtension] || "";
            let originalBase64 = window.btoa(combinedBinaryFormatOfChunks);
            const base64Data = originalBase64;
            const base64Response = await fetch(`${dataString}${base64Data}`);
            const blob = await base64Response.blob();
            const url = URL.createObjectURL(blob);

            if (fileExtension === "xlsx" || fileExtension === "xls") {
              fetchExcelFilesData(url);
            } else if (fileExtension === "zip") {
              fetchZipFileData(url);
            }

            return { fileName, fileExtension, srcOfFile: url };
          }
        }
      } catch (error) {
        console.error("Error fetching document chunks:", error);
        return null; // Return null in case of error
      }
    };
    return await fetchChunks();
  };


  // is Image File
  const isImageFile = (type) => {
    if (type === "jpg" || type === "jpeg" || type === "png") {
      return true;
    } else {
      return false;
    }
  };

  // is Audio Video File
  const isAudioVideoFile = (type) => {
    if (type === "mp4" || type === "mp3" || type === "wav") {
      return true;
    } else {
      return false;
    }
  };

  // download file from  database
  const downloadFileFunction = async (document_id, currentPropertyId) => {
    setDocumentLoading(true);
    let result = {};
    if (document_id && currentPropertyId) {
      result = await getChunksOfImages(document_id, currentPropertyId);
    }
    const link = document.createElement('a');
    link.href = result.srcOfFile;
    link.setAttribute('download', result.fileName);

    // Simulate click on the link to start download
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(result.srcOfFile);
    setDocumentLoading(false);
  };

  // display property Images on selection specific image
  const displayImage = (fileNameData, fileExtensionData, urlData) => {
    setDocumentLoading(true);
    if (urlData) {
      setFileName(fileNameData);
      setFileExtension(fileExtensionData);
      setSrcOfFile(urlData);
      setDocumentLoading(false);
    } else {
      setDocumentLoading(false);
      toast.error("No Image Found!")
    }

  }

  // download All Images Btn Click function
  const downloadAllImagesBtnClick = async (propertyImagesList) => {
    propertyImagesList.forEach((file) => {
      const link = document.createElement('a');
      link.href = file.srcOfFile;
      link.setAttribute('download', file.fileName);

      // Simulate click on the link to start download
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
    })
  }

  useEffect(() => {
    if (dataFromParams) {
      viewCurrentProperty();
      getSearchDetails();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    changeActiveSortStyle(sortText);
  }, [sortText]);

  useEffect(() => {
    if (selectedPropertyResults) {
      fetchAllPropertiesDocumentsAndImages(selectedPropertyResults);
    }
    // eslint-disable-next-line
  }, [currentAllPropertiesDetails]);

  useEffect(() => {
    if (currentPropertyViewImagesId !== null) {
      viewImagesBtnFunction(currentPropertyViewImagesId);
    }
    if (currentPropertyViewDocumentId !== null) {
      getPropertyDocumentsList(currentPropertyViewDocumentId)
    }
    // eslint-disable-next-line
  }, [callViewImagesFunction, callViewDocumentFunction]);

  // Close current tab
  const onClickBackToSearchPropertiesPage = () => {
    window.close();
  };

  return (
    <Layout>
      <section className="list-of-properties section-padding min-100vh">
        {pageLoading ? (
          <div className="py-5 text-center">
            <>
              <CommonSpinner
                spinnerColor="primary"
                height="3rem"
                width="3rem"
                spinnerType="grow"
              />
            </>
          </div>
        ) :
          <div className="container-fluid ">
            {/*  Sort by */}
            <div className={`row justify-content-between pt-2 ${selectedPropertyResults === null ? "d-none" : ""}`} >
              <div className="col-4 text-start ms-md-1">
                <button className="btn btn-sm btn-outline-primary" onClick={onClickBackToSearchPropertiesPage}><i className="bi bi-arrow-left"></i>Back</button>
              </div>

              {subscription_plan_id !== 0 ? <div className="property-sort-box">
                <div className="dropdown">
                  <div
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    className="form-select form-select-sm"
                  >
                    {/* Sort by */}
                    <div
                      value=""
                      style={{
                        overflow: "hidden",
                        fontWeight: "normal",
                        display: "block",
                        whiteSpaceCollapse: "collapse",
                        textWrap: "nowrap",
                        minHeight: "1.2em",
                        padding: "0px 2px 1px",
                      }}
                    >
                      <span className="me-2">
                        <i className="bi bi-filter-right"></i>
                      </span>
                      Sort by : {sortText}
                    </div>
                  </div>
                  <ul
                    className="dropdown-menu shadow w-100"
                  >
                    {/* Relevance */}
                    <li>
                      <span
                        data-name="relevance"
                        onClick={showSortedResults}
                        className="dropdown-item"
                      >
                        Relevance
                      </span>
                    </li>
                    {/* Price - Low to High */}
                    <li>
                      <span
                        data-name="price-low-to-high"
                        onClick={showSortedResults}
                        className="dropdown-item"
                      >
                        Price - Low to High
                      </span>
                    </li>
                    {/* Price - High to Low */}
                    <li>
                      <span
                        data-name="price-high-to-low"
                        onClick={showSortedResults}
                        className="dropdown-item"
                      >
                        Price - High to Low
                      </span>
                    </li>
                    {/* Most Recent */}
                    <li>
                      <span
                        data-name="most-recent"
                        onClick={showSortedResults}
                        className="dropdown-item"
                      >
                        Most Recent
                      </span>
                    </li>
                  </ul>
                </div>
              </div> : ""}
            </div>

            <hr className="my-2" />
            {/* details page */}
            <div className={`row ${subscription_plan_id === 0 ? "mt-3" : ""}`}>
              <div className="card px-3 border-0">
                <div className="container-fluid">
                  <div className="row">
                    {selectedPropertyResults === null ? (
                      <div className="py-5 text-center">
                        <>
                          <CommonSpinner
                            spinnerColor="primary"
                            height="3rem"
                            width="3rem"
                            spinnerType="grow"
                          />
                        </>
                      </div>
                    ) : (selectedPropertyResults.map((property, Index) => {
                      const {
                        property_id,
                        sales_doc_id: { Int64: salesDocId, Valid: isSalesDocIdValid },
                        type_name,
                        market_price,
                        ready_reckoner_price,
                        expected_price,
                        saleable_area,
                        carpet_area,
                        is_sold,
                        is_available_for_sale,
                        completion_date,
                        purchase_date,
                        mortgage_date,
                        Flat_No,
                        society_name,
                        plot_no,
                        locality,
                        city_name,
                        zip,
                        state_name,
                        territory,
                        title_clear_property,
                        bank_id,
                      } = property;
                      let bankDetails = banks.filter(bank => bank.bank_id === parseInt(bank_id))[0];
                      return (
                        <div key={Index} className="p-0">
                          <div className="p-0 fw-bold h4 heading-text-primary">
                            Property: {Index + 1}
                          </div>
                          <div
                            className="col-12 border bg-light mb-4 p-0"
                            key={property_id}
                          >
                            {/* property Details */}
                            <div className="container-fluid">
                              <div className="row p-2">
                                {/* carousel */}
                                <div className="col-lg-4 col-md-5 p-0">
                                  <div
                                    id={`carouselExampleIndicators-${property.property_id}`}
                                    className="carousel slide"
                                    data-bs-ride="carousel"
                                  >
                                    {/* carousel-indicators */}
                                    <div className="carousel-indicators property-slider-indicators">
                                      {property.propertyImages &&
                                        property.propertyImages.map((image, index) => (
                                          <button
                                            key={index}
                                            type="button"
                                            data-bs-target={`#carouselExampleIndicators-${image.document_id}`}
                                            data-bs-slide-to={index}
                                            className={index === 0 ? "active" : ""}
                                            aria-current={index === 0 ? "true" : "false"}
                                            aria-label={`Slide ${index + 1}`}
                                          ></button>
                                        ))}
                                    </div>
                                    {/* carousel-images */}
                                    <div className="carousel-inner">
                                      {property.propertyImages ?
                                        property.propertyImages.map((image, index) => (
                                          <div
                                            key={index}
                                            className={`carousel-item ${index === 0 ? "active" : ""}`}
                                            data-bs-interval="2000"
                                          >
                                            <img
                                              src={image.srcOfFile}
                                              className="d-block w-100 h-100"
                                              alt={image.fileName}
                                            />
                                          </div>
                                        )) :
                                        <div
                                          className={`carousel-item active`}
                                          data-bs-interval="2000"
                                        >
                                          <img
                                            src="/images2.jpg"
                                            className="d-block w-100 "
                                            alt="..."
                                          />
                                        </div>
                                      }
                                    </div>
                                    {/* prev button */}
                                    <button
                                      className="carousel-control-prev"
                                      type="button"
                                      data-bs-target={`#carouselExampleIndicators-${property.property_id}`}
                                      data-bs-slide="prev"
                                    >
                                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                      <span className="visually-hidden">Previous</span>
                                    </button>
                                    {/* next button */}
                                    <button
                                      className="carousel-control-next"
                                      type="button"
                                      data-bs-target={`#carouselExampleIndicators-${property.property_id}`}
                                      data-bs-slide="next"
                                    >
                                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                      <span className="visually-hidden">Next</span>
                                    </button>
                                  </div>
                                  {/* View Images button */}
                                  <div className="text-end pt-2">
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#viewImageModal"
                                      className="btn btn-sm btn-outline-primary w-50"
                                      onClick={() => viewImagesBtnFunction(property_id)}
                                    >
                                      View Images <i className="bi bi-arrow-right"></i>
                                    </button>
                                  </div>
                                </div>
                                {/* property details */}
                                <div className="col-lg-8 col-md-7 pe-0">
                                  <div className="container-fluid">
                                    <div className="row">
                                      {/* Property Type */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-3 mt-md-0 ${type_name ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Property Type
                                        </small>
                                        <div className="common-btn-font">
                                          {type_name}
                                        </div>
                                      </div>
                                      {/* Market Price */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-3 mt-md-0 ${market_price ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Market Price
                                        </small>
                                        <div className="common-btn-font">
                                          {updatedCountry && updatedCountry === "malaysia" ? <>{convertCurrency(parseInt(market_price), "Malaysia", "RM", 0.0564)
                                          } <small className="text-muted">RM </small></> : <>
                                            <i className="bi bi-currency-rupee"></i>
                                            {parseInt(market_price) >= 10000000 ? `${(parseInt(market_price) / 10000000).toFixed(2)}` : `${(parseInt(market_price) / 100000).toFixed(1)}`}
                                            <small className="text-muted">{parseInt(market_price) >= 10000000 ? " Cr." : " Lac"}</small>
                                          </>}
                                        </div>
                                      </div>
                                      {/* Ready Reckoner Price */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-lg-0 mt-3 ${ready_reckoner_price ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Ready Reckoner Price
                                        </small>
                                        <div className="common-btn-font">
                                          {updatedCountry && updatedCountry === "malaysia" ? <>{convertCurrency(parseInt(ready_reckoner_price), "Malaysia", "RM", 0.0564)
                                          } <small className="text-muted">RM </small></> : <>
                                            <i className="bi bi-currency-rupee"></i>
                                            {parseInt(ready_reckoner_price) >= 10000000 ? `${(parseInt(ready_reckoner_price) / 10000000).toFixed(2)}` : `${(parseInt(ready_reckoner_price) / 100000).toFixed(1)}`}
                                            <small className="text-muted">{parseInt(ready_reckoner_price) >= 10000000 ? " Cr." : " Lac"}</small></>}
                                        </div>
                                      </div>
                                      {/* Reserved Price */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-0 mt-3 ${expected_price ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Reserved Price
                                        </small>
                                        <div className="common-btn-font">
                                          {updatedCountry && updatedCountry === "malaysia" ? <>{convertCurrency(parseInt(expected_price), "Malaysia", "RM", 0.0564)
                                          } <small className="text-muted">RM </small></> : <>
                                            <i className="bi bi-currency-rupee"></i>
                                            {parseInt(expected_price) >= 10000000 ? `${(parseInt(expected_price) / 10000000).toFixed(2)}` : `${(parseInt(expected_price) / 100000).toFixed(1)}`}
                                            <small className="text-muted">{parseInt(expected_price) >= 10000000 ? " Cr." : " Lac"}</small></>}
                                        </div>
                                      </div>
                                      {/* Saleable Area */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${saleable_area ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Saleable Area
                                        </small>
                                        <div className="common-btn-font">
                                          {saleable_area} <small className="text-muted">sqft</small>
                                        </div>
                                      </div>
                                      {/* Carpet Area */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${carpet_area ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Carpet Area
                                        </small>
                                        <div className="common-btn-font">
                                          {carpet_area} <small className="text-muted">sqft</small>
                                        </div>
                                      </div>
                                      {/* Is Available For Sale? */}
                                      <div
                                        className={`${is_available_for_sale &&
                                          is_sold === "0"
                                          ? ""
                                          : "d-none"
                                          } col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 `}
                                      >
                                        <small className="text-muted">
                                          Is Available For Sale?
                                        </small>
                                        <div className="common-btn-font text-capitalize">
                                          {is_available_for_sale === "1"
                                            ? "Yes"
                                            : "No"}
                                        </div>
                                      </div>
                                      {/* Completion Date */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${completion_date ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Completion Date
                                        </small>
                                        <div className="common-btn-font">
                                          {completion_date ? propertyDateFormat(completion_date) : "Not Available"}
                                        </div>
                                      </div>
                                      {/* Purchase Date */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${purchase_date ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Purchase Date
                                        </small>
                                        <div className="common-btn-font">
                                          {purchase_date ? propertyDateFormat(purchase_date) : "Not Available"}
                                        </div>
                                      </div>
                                      {/* Mortgage Date */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${mortgage_date ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Mortgage Date
                                        </small>
                                        <div className="common-btn-font">
                                          {mortgage_date ? propertyDateFormat(mortgage_date) : "Not Available"}
                                        </div>
                                      </div>
                                      {/* Title clear property */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${title_clear_property ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Title clear property
                                        </small>
                                        <div className="common-btn-font text-capitalize">
                                          {title_clear_property === "1"
                                            ? "Yes"
                                            : "No"}
                                        </div>
                                      </div>
                                      {/* Territory */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${territory ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Territory
                                        </small>
                                        <div className="common-btn-font text-capitalize">
                                          {territory}
                                        </div>
                                      </div>
                                      {/* branch_name */}
                                      <div
                                        className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${bankDetails.bank_name ? "" : "d-none"
                                          }`}
                                      >
                                        <small className="text-muted">
                                          Bank Name
                                        </small>
                                        <div className="common-btn-font text-capitalize">
                                          {bankDetails.bank_name}
                                        </div>
                                      </div>
                                      {/* Sale certificate */}
                                      <div className="col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3">
                                        <small className="text-muted">
                                          Sale certificate
                                        </small>
                                        <div className="common-btn-font ">
                                          {isSalesDocIdValid ?
                                            <button
                                              className="btn btn-sm btn-outline-primary mt-1"
                                              onClick={() => getChunksOfDocuments(salesDocId, property_id)}
                                              data-bs-toggle="modal"
                                              data-bs-target="#documentModal"
                                            >
                                              View
                                            </button>
                                            : "Not Available"
                                          }
                                        </div>
                                      </div>
                                      {/* document list */}
                                      {subscription_plan_id !== 0 &&
                                        <div
                                          className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3`}
                                        >
                                          <small
                                            className="text-muted"
                                          >
                                            Document List
                                          </small>
                                          <div className="common-btn-font mt-1">
                                            <button
                                              data-bs-toggle="modal"
                                              data-bs-target="#documentListModal"
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => getPropertyDocumentsList(property_id)}
                                            >
                                              View Documents
                                            </button>
                                          </div>
                                        </div>
                                      }
                                      {/* contact title */}
                                      {subscription_plan_id !== 0 &&
                                        <div
                                          className={`col-xl-3 col-lg-4 col-6 mt-xl-4 mt-3 ${isBank === true ? "d-none" : ""
                                            }`}
                                        >
                                          <small
                                            className="text-muted"
                                          >
                                            For More Details
                                          </small>
                                          <div className="common-btn-font mt-1">
                                            <button
                                              data-bs-toggle="modal"
                                              data-bs-target="#commentModal"
                                              className="btn btn-sm btn-primary "
                                              onClick={() => {
                                                setEnquiryFormData({
                                                  ...enquiryFormData,
                                                  enquiry_comments: "",
                                                  property_id: property_id,
                                                });
                                                enquiryForm.current.reset();
                                              }}
                                            >
                                              Contact
                                            </button>
                                          </div>
                                        </div>
                                      }
                                      <div className="col-12">
                                        <hr />
                                      </div>
                                      {/* Address */}
                                      <div className="col-xl-12 col-lg-10 pb-xl-3">
                                        <small className="text-muted">
                                          Address
                                        </small>
                                        <div className="common-btn-font">
                                          {`${Flat_No
                                            ? `Flat No:  ${Flat_No}, `
                                            : ""
                                            } ${society_name
                                              ? `Society Name:  ${society_name}, `
                                              : ""
                                            } ${plot_no
                                              ? `Plot No:  ${plot_no}, `
                                              : ""
                                            }Locality: ${locality}, ${city_name} - ${zip}, ${state_name}`}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </section>

      {/* document list modal */}
      <div
        className="modal fade"
        id="documentListModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" >
            {/* document section */}
            <div className="col-12 p-3">
              <div className="row ">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">
                    <i className="bi bi-file-earmark pe-2"></i>
                    Documents List
                  </span>
                  <button
                    type="button"
                    className="btn-close btn-sm "
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    title="Close"
                  ></button>
                </div>
              </div>
              <hr className="my-2" />
              {viewDocumentModalLoading ? (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ minHeight: "25vh" }}
                >
                  <CommonSpinner
                    spinnerColor="primary"
                    height="3rem"
                    width="3rem"
                    spinnerType="grow"
                  />
                </div>
              ) : (<>
                {propertyDocumentsList && propertyDocumentsList.length !== 0 ? (

                  <div
                    className="collapse mt-2 documents-list-collapse show"
                    id="collapseExample"
                  >
                    <div className="docs-list-table-wrapper">
                      <table className="table">
                        <tbody>
                          {propertyDocumentsList.map(
                            (document, Index) => {
                              return (
                                <tr key={Index}>
                                  <th scope="row" className="text-center">{Index + 1}</th>
                                  <td className="text-start">{document.document_name}</td>
                                  {isLogin && (subscription_plan_id === 4 || subscription_plan_id === 5) ? <>
                                    <td>
                                      <div className="d-flex">
                                        <button
                                          onClick={() => {
                                            getChunksOfDocuments(
                                              document.document_id,
                                              currentPropertyId
                                            );
                                          }}
                                          data-bs-toggle="modal"
                                          data-bs-target="#documentModal"
                                          className="btn btn-sm btn-primary"
                                        >
                                          <i className="bi bi-eye" title="View"></i>
                                        </button>
                                      </div>
                                    </td>
                                    {/*download  */}
                                    <td>
                                      <button
                                        className="btn btn-sm btn-primary me-4"
                                        onClick={() => downloadFileFunction(document.document_id, currentPropertyId)}
                                      >
                                        <i className="bi bi-download text-white" title="Download"></i>
                                      </button>
                                    </td>
                                  </> : ""}

                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) :
                  <div className="text-muted">
                    No documents available.
                  </div>}
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* document view Modal */}
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
              className="modal-header text-white justify-content-between"
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
                {subscription_plan_id !== 0 &&
                  <a
                    className="btn btn-light me-4"
                    href={srcOfFile}
                    download={fileName}
                    title="Download"
                  >
                    Download <i className="bi bi-download text-primary"></i>
                  </a>}
                <i
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  className="bi bi-x-lg text-white"
                  title="Close"
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
                            documents={[{ uri: srcOfFile, fileName: fileName }]}
                            pluginRenderers={DocViewerRenderers}
                          />
                        </>
                      ) : (
                        <div className="wrapper">
                          <h1 className="text-center heading-text-primary">
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

      {/* comment modal */}
      <div
        className="modal fade"
        id="commentModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{ background: "rgba(135, 207, 235, 0.85)" }}
          >
            <div className="d-flex p-2 justify-content-end">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form
              ref={enquiryForm}
              className="modal-body pt-0"
              onSubmit={onEnquiryFormSubmit}
            >
              <textarea
                onChange={onEnquiryFieldsChange}
                placeholder="Enter your message here"
                name="enquiry-comment"
                id="enquiry-comment"
                rows="5"
                className="form-control"
                style={{ resize: "none" }}
                required
              ></textarea>
              <div className="mt-3">
                <button
                  disabled={enquiry_comments ? false : true}
                  type="submit"
                  className="btn btn-primary w-100 common-btn-font"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span>
                    <i className="bi bi-send-fill me-2"></i>Send
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* view Images modal */}
      <div
        className="modal fade list-of-properties-view-Image-Modal"
        id="viewImageModal"
        tabIndex="-1"
        aria-labelledby="viewImageModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered  modal-lg">
          <div className="modal-content">
            <div className="col-12 p-3">
              <div className="row" >
                {/* title and close button */}
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">
                    <i className="bi bi-file-earmark pe-2"></i>
                    Images
                  </span>
                  <div className="d-flex align-items-center">
                    {/* Download ALL */}
                    {subscription_plan_id !== 0 && !viewImagesModalLoading ? <>
                      {propertyImages && <button
                        className="btn btn-sm btn-primary text-white me-4"
                        onClick={() => downloadAllImagesBtnClick(propertyImages)}
                        title="Download"
                      >
                        Download ALL
                      </button>}
                    </>
                      : ""}
                    {/* close button */}
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      title="Close"
                    ></button>
                  </div>
                </div>
              </div>
              <hr className="my-2" />
              {viewImagesModalLoading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                >
                  <CommonSpinner
                    spinnerColor="primary"
                    spinnerType="grow"
                  />
                </div>
              ) :
                <div className="gallery">
                  {propertyImages ? propertyImages.map((image, index) => {
                    return (
                      <div key={index} className="gallery-item"
                      >
                        <button
                          onClick={() => {
                            displayImage(image.fileName, image.fileExtension, image.srcOfFile);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#documentModal"
                          className="btn btn-sm h-100"
                        >
                          <img src={image.srcOfFile} alt={image.fileName} className="gallery-image h-100" title={image.fileName} />
                        </button>
                      </div>
                    )
                  }) :
                    <div className="text-muted">
                      No Images available.
                    </div>}
                </div>}
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
};

export default ListOfProperties;
