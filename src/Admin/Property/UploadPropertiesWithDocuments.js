import React, { useEffect, useState } from "react";
import AdminSideBar from "../AdminSideBar";
import Papa from "papaparse";
import { useRef } from "react";
import Layout from "../../components/1.CommonLayout/Layout";
import { rootTitle } from "../../CommonFunctions";
import axios from "axios";
import { toast } from "react-toastify";
import sampleCSVFile from "./SampleBulkFile.csv";
import { v4 as uuid } from "uuid";
import BreadCrumb from "../BreadCrumb";
import * as XLSX from 'xlsx';

const allowedExtensions = ["csv"];
let chunkSize = 0;
let temp = 0;
let authHeaders = "";

const UploadPropertiesWithDocuments = () => {

    // error alert details.
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


    // onCancelClick
    const onCancelClick = () => {
        setAllUseStates({
            data: [],
            tableHeadings: [],
            tableDisplayClass: "d-none",
        });

        fileRef.current.value = "";
        setFileName("");
        window.scrollTo(0, 0);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 400);
    };

    const dataFromLocal = JSON.parse(localStorage.getItem("data"));
    if (dataFromLocal) {
        authHeaders = {
            Authorization: dataFromLocal.loginToken,
            "Content-Type": "application/octet-stream",
        };
    }

    // readFileFunction
    const readFileFunction = (inputFile) => {
        setFileName(inputFile.name);
        const reader = new FileReader();
        console.log(inputFile)

        reader.onload = async ({ target }) => {
            const csv = Papa.parse(target.result, { header: true });
            console.log(csv);
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

    // file Upload function
    const fileUpload = (e) => {
        setSavedFile([...files, ...e.target.files]);
        console.log(e.target.files);
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

    // file extension checking
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

    // read And Upload Current Chunk
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

    // upload Chunk
    const uploadChunk = async (readerEvent) => {
        console.log(readerEvent);
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
                            console.log(res.data);
                            reloadPage();
                        } else {
                            let arr = [];
                            console.log(res.data);
                            res.data.forEach((data) => {
                                arr.push(data.property_number);
                            });
                            let duplicateProperties = arr.join(", ");
                            let customErrorMessage = "";
                            let errorMsgFromDatabase = res.data[0].error;
                            if (arr.length > 1) {
                                customErrorMessage = `Failed to upload properties with property numbers ${duplicateProperties}.
                Please create new file for uploading ${errorMsgFromDatabase === "Branch not found" ? `${errorMsgFromDatabase} properties` : errorMsgFromDatabase}. `;

                            } else {
                                customErrorMessage = `Failed to upload property with property number ${duplicateProperties}. 
                Please create new file for uploading ${errorMsgFromDatabase === "Branch not found" ? `${errorMsgFromDatabase.toLowerCase()} properties` : errorMsgFromDatabase.toLowerCase()} with updated details. `;
                            }
                            setErrorModalDetails({
                                errorModalOpen: true,
                                errorHeading: res.data[0].error,
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

    // post Chunks To DataBase
    const postChunksToDataBase = () => {
        setFiles(saveFile);
    };

    useEffect(() => {
        rootTitle.textContent = "ADMIN - UPLOAD PROPERTIES";
        // eslint-disable-next-line
    }, []);

    // page reload function
    const reloadPage = () => {
        setTimeout(() => {
            window.location.reload();
        }, 4000);
    };


    const postProperty = async () => {
        console.log(allUseStates)
        console.log(allUseStates.data[0].document_upload_list_url)
        let filePath = allUseStates.data[0].document_upload_list_url;
        console.log(typeof filePath);
        // Check if filePath is not undefined, null, or an empty string
        if (filePath) {
            try {
                // Fetching the file from the URL
                const response = await fetch(`${filePath}`,{
                    responseType: 'arraybuffer'

                  });

                console.log(response);
                // Checking if the response is ok (status code is in the range 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Reading the response as a blob
                const blob = await response.blob();

                // Reading the XLSX file data using FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    console.log(data);
                    console.log(workbook);
                    // Assuming the first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Converting sheet to JSON
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    console.log('Parsed XLSX data: ', json);

                    // Set the parsed data to your state
                    setAllUseStates({
                        ...allUseStates,
                        tableHeadings: json[0],
                        data: json.slice(1),
                        tableDisplayClass: "",
                    });
                };

                // Reading the blob as an ArrayBuffer
                reader.readAsArrayBuffer(blob);
            } catch (error) {
                // Logging any errors that occur during the fetch operation
                console.error('Error fetching file: ', error);
            }
        } else {
            console.log('No file path provided');
        }
    }

    // const postProperty = async () => {
    //     // Logging the entire allUseStates object to the console for debugging
    //     console.log(allUseStates);

    //     // Logging the document_upload_list_url to the console for debugging
    //     console.log(allUseStates.data[0].document_upload_list_url);

    //     // Extracting the document_upload_list_url from the allUseStates object
    //     let filePath = allUseStates.data[0].document_upload_list_url;

    //     // Checking if filePath is not undefined, null, or an empty string
    //     if (filePath) {
    //         try {
    //             // Fetching the file from the URL
    //             let response = await fetch(filePath);

    //             // Checking if the response is ok (status code is in the range 200-299)
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }

    //             // Reading the response text
    //             let data = await response.text();

    //             // Logging the fetched data to the console
    //             console.log('Fetched data: ', data);
    //             const parsedData = Papa.parse(data, { header: true });
    //             console.log('Parsed data: ', parsedData.data)

    //             // Optionally, set the fetched data to a state or variable (uncomment the line below)
    //             // setFileData(data);
    //         } catch (error) {
    //             // Logging any errors that occur during the fetch operation
    //             console.error('Error fetching file: ', error);
    //         }
    //     } else {
    //         console.log('No file path provided');
    //     }

    //     // The commented-out lines below demonstrate a different way to fetch and log the response
    //     // let res = await fetch(filePath);
    //     // console.log("res ==>", res);
    // };


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

                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <BreadCrumb />
                            <a
                                className="btn btn-primary text-white sample-file-download-btn me-4"
                                href={sampleCSVFile}
                                download="SampleBulkFile.csv"
                            >
                                Sample Bulk File <i className="bi bi-download"> </i>
                            </a>
                        </div>

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
                                                    onChange={fileUpload}
                                                    className="upload-csv-file"
                                                    type="file"
                                                    id="formFile"
                                                />
                                            </div>
                                            {fileName && <div className="text-center fs-5">{fileName}</div>}
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
                                        className={`${allUseStates?.tableDisplayClass} csv-data-table-wrapper`}
                                    >
                                        <table className="table table-striped table-bordered table-primary h-100">
                                            <thead>
                                                <tr>
                                                    {allUseStates?.tableHeadings.map((heading, Index) => {
                                                        return <th key={Index}>{heading}</th>;
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUseStates?.data.map((i, Index) => {
                                                    return (
                                                        <tr key={Index}>
                                                            {allUseStates?.tableHeadings.map((heading, Index) => {
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
                                        className={`text-end mt-3 bg-light  save-cancel-btn-div ${allUseStates?.tableDisplayClass}`}
                                    >
                                        {/* Save */}
                                        <button
                                            className="btn btn-success me-2"
                                            onClick={postProperty}
                                        //   onClick={postChunksToDataBase}
                                        >
                                            Save
                                        </button>
                                        {/* cancel */}
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

export default UploadPropertiesWithDocuments;
