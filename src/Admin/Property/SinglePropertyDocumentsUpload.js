import React, { useEffect, useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { toast } from "react-toastify";
import { checkLoginSession } from "../../CommonFunctions";
import CommonSpinner from "../../CommonSpinner";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

let authHeader = "";
let temp = 0;
let chunkSize = 0;
const allAllowedExtensions = [
  "pdf",
  "jpeg",
  "jpg",
  "png",
  "docx",
  "xlsx",
  "xls",
  "txt",
  "zip",
  "rar",
  "mp4",
  "mp3",
  "wav",
];

const SinglePropertyDocumentsUpload = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
  }

  const renderTooltip = (props) => <Tooltip id="tooltip">{props}</Tooltip>;

  const fromAddPropertyPage = localStorage.getItem("singlePropertySuccess");
  const showPropertySuccessMsg = () => {
    if (fromAddPropertyPage === "true") {
      toast.success("Property added successfully");
      localStorage.removeItem("singlePropertySuccess");
    }
  };
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [currentPropertyNumber, setCurrentPropertyNumber] = useState("");
  const [totalSizeOfDocuments, setTotalSizeOfDocuments] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [savedImageFiles, setSavedImageFiles] = useState([]);
  const [currentImageFileIndex, setCurrentImageFileIndex] = useState(null);
  const [lastUploadedImageFileIndex, setLastUploadedImageFileIndex] =
    useState(null);
  const [currentChunkIndexOfImage, setCurrentChunkIndexOfImage] =
    useState(null);
  const [uniqueId, setUniqueId] = useState(uuid());
  const [imageLoading, setImageLoading] = useState(false);
  let defaultCategoryText = "Select one from above categories";
  const [documentsInfo, setDocumentsInfo] = useState({
    category_id: 0,
    category_text: defaultCategoryText,
    categoryTextColor: "muted",
    description: "",
  });

  const [allCategoriesFromDB, setAllCategoriesFromDB] = useState([]);
  const [allowedExtensions, setAllowedExtensions] =
    useState(allAllowedExtensions);
  const [otherCategoryBlankCharErr, setOtherCategoryBlankCharErr] =
    useState(false);
  const fileRef = useRef();
  const decsRef = useRef();
  const otherCategoryInputRef = useRef();
  const otherCategoryWrapperRef = useRef();

  const { category_id, category_text, categoryTextColor, description } =
    documentsInfo;
  let otherCategoryId = null;
  const getCategoriesFromDB = async () => {
    setCategoriesLoading(true);
    console.log("function started");
    try {
      await axios
        .get(`/sam/v1/property/auth/document-categories`, {
          headers: authHeader,
        })
        .then((res) => {
          setAllCategoriesFromDB(res.data);
          setCategoriesLoading(false);
        });
    } catch (error) {
      setCategoriesLoading(false);
    }

  };

  const onSaveOtherCategoryClick = (e) => {
    e.preventDefault();
    let otherCategoryValue = otherCategoryInputRef.current.value.trim();
    if (otherCategoryValue !== "") {
      setDocumentsInfo({
        ...documentsInfo,
        category_id: otherCategoryId,
        category_text: otherCategoryValue,
        categoryTextColor: "black common-btn-font",
      });
      setOtherCategoryBlankCharErr(false);
      e.target.reset();
      otherCategoryWrapperRef.current.classList.add("d-none");
    } else {
      setOtherCategoryBlankCharErr(true);
    }
  };

  const onCategoryRadioCheck = (e) => {
    let categoryText = e.target.nextElementSibling.textContent;
    if (categoryText === "Property images") {
      setAllowedExtensions(["jpg", "png", "jpeg"]);
    } else {
      setAllowedExtensions(allAllowedExtensions);
    }
    setDocumentsInfo({
      ...documentsInfo,
      category_id: parseInt(e.target.value),
      category_text: categoryText,
      categoryTextColor: "black common-btn-font",
    });
    setOtherCategoryBlankCharErr(false);
    otherCategoryInputRef.current.value = "";
    otherCategoryWrapperRef.current.classList.add("d-none");
  };

  const onOtherRadioCheck = (e) => {
    if (e.target.checked === true) {
      setAllowedExtensions(allAllowedExtensions);
      setDocumentsInfo({
        ...documentsInfo,
        category_id: otherCategoryId,
        category_text: defaultCategoryText,
        categoryTextColor: "muted",
      });
      otherCategoryWrapperRef.current.classList.remove("d-none");
    }
  };

  const onResetBtnClick = () => {
    window.scrollTo(0, 0);
    let allCategoryChecks = document.querySelectorAll(".category-checks");
    setDocumentsInfo({
      category_id: 0,
      category_text: defaultCategoryText,
      categoryTextColor: "muted",
      description: "",
    });
    setSavedImageFiles([]);
    fileRef.current.value = "";
    decsRef.current.value = "";
    otherCategoryInputRef.current.value = "";
    otherCategoryWrapperRef.current.classList.add("d-none");
    setOtherCategoryBlankCharErr(false);
    if (allCategoryChecks) {
      allCategoryChecks.forEach((check) => {
        if (check.checked) {
          check.checked = false;
        }
      });
    }
  };

  const saveDocumentsDetails = (e) => {
    const { name, value } = e.target;
    if (name === "description") {
      setDocumentsInfo({
        ...documentsInfo,
        [name]: value,
      });
    }
  };

  const [alertDetails, setAlertDetails] = useState({
    alertVisible: false,
    alertMsg: "",
    alertClr: "",
  });

  const { alertMsg, alertClr, alertVisible } = alertDetails;

  const handleImageFileChange = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      let arrForExtension = e.target.files[0].name.split(".");
      let currentFileExtension = arrForExtension[arrForExtension.length - 1];
      let size = parseFloat((e.target.files[0].size / 1024 / 1024).toFixed(2));
      let currentTotalSize = size + totalSizeOfDocuments;
      console.log("Total Size Will be: ", currentTotalSize, " MB");
      if (currentTotalSize <= 25) {
        setAlertDetails({ alertVisible: false });
        console.log("Extension of current file: ", currentFileExtension);
        if (allowedExtensions.length > 0) {
          if (allowedExtensions.includes(currentFileExtension)) {
            setSavedImageFiles([...imageFiles, ...e.target.files]);
          } else {
            toast.error("File not allowed with this extension");
            e.target.value = "";
          }
        }
      } else {
        onResetBtnClick();
        setAlertDetails({
          alertVisible: true,
          alertMsg:
            "Document Size Limit Exceeded: Combined document size must not exceed 25 MB. Please remove unnecessary documents and try again.",
          alertClr: "warning",
        });
      }
    }
  };

  const reloadPage = () => {
    setTimeout(() => {
      window.location.reload();
    }, 4000);
  };

  const readAndUploadCurrentImageChunk = () => {
    const reader = new FileReader();
    const file = imageFiles[currentImageFileIndex];
    if (!file) {
      return;
    }
    chunkSize = Math.round((file.size * 39) / 100);
    const from = currentChunkIndexOfImage * chunkSize;
    const to = from + chunkSize;
    const blob = file.slice(from, to);
    reader.onload = (e) => uploadImageChunk(e);
    reader.readAsDataURL(blob);
  };

  const uploadImageChunk = async (readerEvent) => {
    const file = imageFiles[currentImageFileIndex];
    const size = file.size;
    let tempChunkSize = chunkSize;
    temp += tempChunkSize;
    if (temp > size) {
      tempChunkSize = size - (temp - chunkSize);
    }
    const data = readerEvent.target.result.split(",")[1];
    const detailsToPost = {
      upload_id: uniqueId,
      property_number: currentPropertyNumber,
      chunk_number: currentChunkIndexOfImage + 1,
      total_chunks: Math.ceil(size / chunkSize),
      chunk_size: tempChunkSize,
      total_file_size: size,
      file_name: file.name,
      category_id: category_id,
      description: description,
      data: data,
    };
    console.log(detailsToPost);
    const chunks = Math.ceil(file.size / chunkSize) - 1;
    const isLastChunk = currentChunkIndexOfImage === chunks;
    console.warn("IS LAST CHUNK: ", isLastChunk);
    try {
      await axios
        .post(`/sam/v1/property/auth/property-documents`, detailsToPost, {
          headers: authHeader,
        })
        .then((res) => {
          if (isLastChunk) {
            if (res.data.msg !== 0) {
              console.log(res.data);
              setImageLoading(false);
              toast.error("Error while uploading files");
              // reloadPage();
            } else {
              if (currentImageFileIndex === savedImageFiles.length - 1) {
                setImageLoading(false);
                toast.success("File uploaded successfully");
                reloadPage();
              }
            }
          }
        });
    } catch (error) {
      if (isLastChunk) {
        setImageLoading(false);
        toast.error("Internal server error");
        reloadPage();
      }
    }
    if (isLastChunk) {
      setUniqueId(uuid());
      setLastUploadedImageFileIndex(currentImageFileIndex);
      setCurrentChunkIndexOfImage(null);
    } else {
      setCurrentChunkIndexOfImage(currentChunkIndexOfImage + 1);
    }
  };

  useEffect(() => {
    if (alertVisible) {
      window.scrollTo(0, 0);
    }
  }, [alertVisible]);

  useEffect(() => {
    if (lastUploadedImageFileIndex === null) {
      return;
    }
    const isLastFile = lastUploadedImageFileIndex === imageFiles.length - 1;
    const nextFileIndex = isLastFile ? null : currentImageFileIndex + 1;
    setCurrentImageFileIndex(nextFileIndex);
    // eslint-disable-next-line
  }, [lastUploadedImageFileIndex]);

  useEffect(() => {
    if (imageFiles.length > 0) {
      if (currentImageFileIndex === null) {
        setCurrentImageFileIndex(
          lastUploadedImageFileIndex === null
            ? 0
            : lastUploadedImageFileIndex + 1
        );
      }
    }
    // eslint-disable-next-line
  }, [imageFiles.length]);

  useEffect(() => {
    if (currentImageFileIndex !== null) {
      setCurrentChunkIndexOfImage(0);
    }
  }, [currentImageFileIndex]);

  useEffect(() => {
    if (currentChunkIndexOfImage !== null) {
      readAndUploadCurrentImageChunk();
    }
    // eslint-disable-next-line
  }, [currentChunkIndexOfImage]);

  const postImages = (e) => {
    e.preventDefault();
    setImageLoading(true);
    setImageFiles(savedImageFiles);
  };

  const checkCanUploadNewDocument = async (id) => {
    if (id) {
      try {
        let res = await axios.get(`/sam/v1/property/auth/document-size/${id}`, {
          headers: authHeader,
        });
        if (res.data) {
          let sizeInBytes = res.data.total_size;
          let sizeInMegaBytes = parseFloat(
            (sizeInBytes / 1024 / 1024).toFixed(2)
          );
          console.log("Size in Database: ", sizeInMegaBytes, " MB");
          setTotalSizeOfDocuments(sizeInMegaBytes);
        }
      } catch (error) { }
    }
  };

  useEffect(() => {
    let propertyData = JSON.parse(localStorage.getItem("upload-doc"));
    if (propertyData) {
      setCurrentPropertyNumber(propertyData.number);
      checkCanUploadNewDocument(propertyData.id);
      if (data) {
        getCategoriesFromDB();
      }
    }
    // eslint-disable-next-line
  }, []);

  // window.onload = () => {
  //   showPropertySuccessMsg();
  // };

  return (
    // <Layout>
    <div className="container-fluid skyblue-bg" onLoad={showPropertySuccessMsg()}>
      <div className="row min-100vh position-relative justify-content-center">
        {/* <AdminSideBar /> */}
        <div className="col-11 wrapper mt-md-0">
          <section className="upload-documents-wrapper">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="fw-bold p-0">Upload Documents</h3>
                  <h6 className="fw-bold text-muted p-0">
                    Property Number
                    <span className="badge bg-primary ms-2">
                      {currentPropertyNumber}
                    </span>
                  </h6>
                </div>
                <div className="col-md-6">
                  <div
                    className={`login-alert alert alert-${alertClr} alert-dismissible show d-flex align-items-center mb-0 ${alertVisible ? "" : "d-none"
                      }`}
                    role="alert"
                  >
                    <small className="fw-bold">{alertMsg}</small>
                    <i
                      onClick={() => setAlertDetails({ alertVisible: false })}
                      className="bi bi-x login-alert-close-btn close"
                    ></i>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12">
                  <hr />
                </div>
                <div className="col-12 px-0">
                  <div className="container-fluid">
                    {categoriesLoading ? (
                      <CommonSpinner
                        spinnerColor="primary"
                        spinnerType="grow"
                      />
                    ) : (
                      <>
                        {" "}
                        <label
                          className="form-label common-btn-font "
                          style={{ color: "var(--primary-color-hover)" }}
                        >
                          Select document category
                        </label>
                        <div className="row">
                          {allCategoriesFromDB.map((category, Index) => {
                            if (category.category_Name === "Other") {
                              otherCategoryId = parseInt(category.category_id);
                            }
                            return (
                              <div
                                className={`col-xl-4 ${category.category_Name === "Other"
                                  ? "d-none"
                                  : ""
                                  }`}
                                key={Index}
                              >
                                <div className="form-check form-check-inline">
                                  <input
                                    onChange={onCategoryRadioCheck}
                                    className="form-check-input category-checks"
                                    type="radio"
                                    name="category_id"
                                    id="category_id"
                                    value={category.category_id}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="category_id"
                                  >
                                    {category.category_Name}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                          <div className="col-xl-4">
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input category-checks"
                                type="radio"
                                name="category_id"
                                id="category_id"
                                value={0}
                                onChange={onOtherRadioCheck}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="category_id"
                              >
                                Other
                              </label>
                            </div>
                            <div
                              className="container-fluid mt-2 d-none"
                              ref={otherCategoryWrapperRef}
                            >
                              <form
                                onSubmit={onSaveOtherCategoryClick}
                                className="row"
                              >
                                <div className="col-xl-7 col-lg-4 col-md-5 col-8">
                                  <div className="form-group">
                                    <input
                                      type="text"
                                      className={`form-control ${otherCategoryBlankCharErr
                                        ? "border-danger"
                                        : ""
                                        }`}
                                      placeholder="Enter category"
                                      ref={otherCategoryInputRef}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-xl-5 col-lg-4 col-md-5 col-4 p-0">
                                  <button
                                    type="submit"
                                    className="btn btn-primary"
                                  >
                                    Save
                                  </button>
                                </div>
                                <small
                                  className={`text-danger ${otherCategoryBlankCharErr ? "" : "d-none"
                                    }`}
                                >
                                  Blank characters are not allowed
                                </small>
                              </form>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-xl-3 col-md-6">
                  <div className="form-group">
                    <label
                      htmlFor="category_text"
                      className="form-label common-btn-font "
                      style={{ color: "var(--primary-color-hover)" }}
                    >
                      Category
                    </label>
                    <div className={`text-${categoryTextColor}`}>
                      {category_text}
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mt-md-0 mt-3">
                  <div className="form-group">
                    <label
                      htmlFor="file-upload"
                      className="form-label common-btn-font "
                      style={{ color: "var(--primary-color-hover)" }}
                    >
                      File
                    </label>
                    <input
                      onChange={handleImageFileChange}
                      ref={fileRef}
                      type="file"
                      name="file-upload"
                      id="file-upload"
                      className="form-control"
                      disabled={
                        category_text !== defaultCategoryText ? false : true
                      }
                    />

                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        allowedExtensions ? allowedExtensions.join(", ") : ""
                      )}
                    >
                      <small className="text-muted">
                        Extensions allowed
                        <i
                          className="bi bi-info-circle ms-2"
                          type="button"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title=""
                        ></i>
                      </small>
                    </OverlayTrigger>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mt-xl-0 mt-3">
                  <div className="form-group">
                    <label
                      htmlFor="description"
                      className="form-label common-btn-font "
                      style={{ color: "var(--primary-color-hover)" }}
                    >
                      Document Description
                    </label>
                    <input
                      ref={decsRef}
                      type="text"
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="Description (min. 2 words)"
                      onChange={saveDocumentsDetails}
                    ></input>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mt-xl-0 mt-3">
                  <div className="form-group">
                    <label
                      htmlFor="action-buttons"
                      className="form-label common-btn-font "
                      style={{ color: "var(--primary-color-hover)" }}
                    >
                      Action
                    </label>
                    <div
                      id="action-buttons"
                      className="d-flex justify-content-between"
                    >
                      <button
                        disabled={
                          savedImageFiles.length === 0 ||
                            imageLoading ||
                            description.trim() === "" ||
                            description.trim().split(" ").length < 2 ||
                            category_text === defaultCategoryText ||
                            alertVisible === true
                            ? true
                            : false
                        }
                        className="btn btn-primary w-75"
                        onClick={postImages}
                      >
                        {imageLoading ? (
                          <>
                            <div
                              className="spinner-border spinner-border-sm text-light me-2"
                              role="status"
                            ></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          "Upload"
                        )}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: "22%" }}
                        onClick={onResetBtnClick}
                        disabled={imageLoading ? true : false}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    // </Layout>
  );
};

export default SinglePropertyDocumentsUpload;
