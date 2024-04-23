import axios from "axios";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Layout from "../1.CommonLayout/Layout";
import CommonSpinner from "../../CommonSpinner";
import { transformDateFormat } from "../../CommonFunctions";
import { w3cwebsocket as WebSocket } from "websocket";
import { v4 as uuid } from "uuid";
import Pagination from "../../Pagination";
import "./TableStyle.css";

let authHeader = "";
let isBank = false;
let enquiryPerPage = 5;

// enquiry table headers
const tableHeaders = [
  "#",
  "Property Number",
  "Type",
  "User Name",
  "Date",
  "Action"

];

// min column cell width
let minCellWidth = 120;

// header create function
const createHeaders = (headers) => {
  return headers.map((item) => ({
    text: item,
    ref: useRef()
  }));
};

// View Enquiry Lists
const ViewEnquiryLists = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
  }

  const [enquiryList, setEnquiryList] = useState([]);
  const [normalUserEnquiryList, setNormalUserEnquiryList] = useState([]);
  const [enquirySearchInputData, setEnquirySearchInputData] = useState({
    search_input: "",
    search_category: "property_number"
  });
  const [unreadEnquiryList, setUnreadEnquiryList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [chatPageLoading, setChatPageLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const modalBodyRef = useRef(null);
  const paginationRef = useRef();
  const tableElement = useRef(null);
  const bankEnquiryTableColumns = createHeaders(tableHeaders);
  const [propertyId, setPropertyId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(null);
  const [newComingMessage, setNewComingMessage] = useState(null);
  const [sendReplyBtnLoading, setSendReplyBtnLoading] = useState(false);
  const [chatWith, setChatWith] = useState("");
  const [sortOptionText, setSortOptionText] = useState("up");
  const [pageCount, setPageCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMoreMassage, setIsMoreMassage] = useState(false);
  const [currentMassageBatch, setCurrentMassageBatch] = useState(1);
  const [currentChatMassageSize, setCurrentChatMassageSize] = useState(25);

  //get User Enquiries List
  const getUserEnquiriesList = async () => {
    setPageLoading(true);
    let dataToPost = {
      enquiry_category: "All",
      batch_size: enquiryPerPage,
      batch_number: 1,
    };

    try {
      const resFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, dataToPost, {
        headers: authHeader,
      });
      if (resFromApi.data) {
        setEnquiryList(resFromApi.data.Enquiries);
        let totalPages = Math.ceil(resFromApi.data.Getcount / enquiryPerPage);
        if (resFromApi.data) {
          setPageCount(totalPages);
        }
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }

    } catch (error) {
      setPageLoading(false);
    }
  };

  //get User Enquiries List
  const getNormalUserEnquiriesList = async () => {
    setPageLoading(true);

    let normalUserDataToPost = {
      enquiry_category: "",
      batch_size: enquiryPerPage,
      batch_number: 1,
    };
    try {

      const normalUserResFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, normalUserDataToPost, {
        headers: authHeader,
      });
      if (normalUserResFromApi.data) {
        setNormalUserEnquiryList(normalUserResFromApi.data.Enquiries);
        let totalPages = Math.ceil(normalUserResFromApi.data.Getcount / enquiryPerPage);
        setPageCount(totalPages);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }

    } catch (error) {
      setPageLoading(false);
    }


  };

  // on category tab change
  const onCategoryChange = async (category) => {
    setActiveCategory(category);
    setPageLoading(true);
    let dataToPost = {
      enquiry_category: category,
      batch_size: enquiryPerPage,
      batch_number: 1,
    };
    try {
      const resFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, dataToPost, {
        headers: authHeader,
      });
      let resData = resFromApi.data;
      if (resFromApi.data) {
        if (category === "Unread") {
          setUnreadEnquiryList(resData.Enquiries);
          let totalPages = Math.ceil(resFromApi.data.Getcount / enquiryPerPage);
          setPageCount(totalPages);
        } else if (category === "All") {
          setEnquiryList(resData.Enquiries);
          let totalPages = Math.ceil(resFromApi.data.Getcount / enquiryPerPage);
          setPageCount(totalPages);
        }
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      setPageLoading(false);
    }
  }

  // sort type for date
  const changeSortType = () => {
    if (sortOptionText === "up") {
      setSortOptionText("down");
      enquiryList.sort(
        (a, b) => new Date(b.added_date) - new Date(a.added_date)
      );
      normalUserEnquiryList.sort(
        (a, b) => new Date(b.added_date) - new Date(a.added_date)
      );
    } else if (sortOptionText === "down") {
      setSortOptionText("up");
      enquiryList.sort(
        (a, b) => new Date(a.added_date) - new Date(b.added_date)
      );
      normalUserEnquiryList.sort(
        (a, b) => new Date(a.added_date) - new Date(b.added_date)
      );
    }
  };

  // set chat person or bank person
  const setChatPersonOrBankName = async (id, is_bank) => {
    try {
      let res = await axios.get(
        `/sam/v1/property/auth/enquiry/${id}/bank/${is_bank}`,
        { headers: authHeader }
      );
      if (res.data) {
        setChatWith(res.data.Name);
      }
    } catch (error) { }
  };

  // get Indian Date Time Of Msg
  const getIndianDateTimeOfMsg = (date) => {
    // Convert input string to Date object in the browser's local time zone
    const dateObject = new Date(date);
    // Extract date components
    const day = dateObject.getDate().toString().padStart(2, "0");
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObject.getFullYear().toString();
    // Get hours and minutes in 12-hour format with AM/PM
    let hours = dateObject.getHours();
    const amORpm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");
    // Format the date as "DD-MM-YYYY hh:mm AM/PM"
    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${amORpm}`;
    return formattedDate;
  };

// type message function
const typeMessageFunction =(e)=>{
  const {value}=e.target;
   setNewMessage(value);
}

  // send chat Message
  const sendMessage = async (e) => {
    setSendReplyBtnLoading(true);
    e.preventDefault();
    let enquiry_source= "email"
    let dataToPost = {
      property_id: propertyId,
      enquiry_source: enquiry_source,
      enquiry_comments: newMessage,
    };

    if (isBank) {
      dataToPost.enquiry_id = enquiryId;
    } else {
      delete dataToPost.enquiry_id;
    }

    if (newMessage.trim()) {
      try {
        let res = await axios.post(
          `/sam/v1/property/auth/property_enquiry`,
          dataToPost,
          {
            headers: authHeader,
          }
        );
        if (res.data.msg === 0) {
          setNewMessage("");
          setSendReplyBtnLoading(false);

          if (socket && socket.readyState === WebSocket.OPEN) {
            const messageToSend = {
              message_id: String(uuid()),
              message_type: "sam-user",
              msg: newMessage,
              reply_from: isBank ? 1 : 0,
              enquiry_log_date: new Date().toISOString(),
              enquiry_id: enquiryId,
            };
            try {
              socket.send(JSON.stringify(messageToSend));
            } catch (error) {
            }
          } else {
          }
        }
      } catch (error) {
        setSendReplyBtnLoading(false);
      }
    } else {
      setSendReplyBtnLoading(false);
    }
  };

  // This will run when we click any page link in pagination. e.g. prev, 1, 2, 3, 4, next.
  const handlePageClick = async (pageNumber) => {
    window.scrollTo(0, 0);
    let currentPage = pageNumber.selected + 1;
    const nextOrPrevPageEnquiryData = await fetchMoreEnquiry(currentPage);
    if (activeCategory === "Unread") {
      setUnreadEnquiryList(nextOrPrevPageEnquiryData.Enquiries);
    } else if (activeCategory === "All") {
      setEnquiryList(nextOrPrevPageEnquiryData.Enquiries);
      setPageCount(nextOrPrevPageEnquiryData.Getcount)
    }
  };

  // Fetch more jobs on page click.
  const fetchMoreEnquiry = async (currentPage) => {
    let dataOfNextOrPrevPage = {
      enquiry_category: activeCategory,
      batch_size: enquiryPerPage,
      batch_number: currentPage,
    };
    let apis = {
      searchAPI: `/sam/v1/property/auth/user/enquiry`
    };
    const res = await axios.post(apis.searchAPI, dataOfNextOrPrevPage, { headers: authHeader });
    return res.data;
  };

  // search form  onchange
  const onSearchFormInputChange = (e) => {
    const { name, value } = e.target
    if (name === "search_input") {
      setEnquirySearchInputData({ ...enquirySearchInputData, search_input: value })
    } else if (name === "search_category") {
      setEnquirySearchInputData({ ...enquirySearchInputData, search_category: value })
    }
  }

  // search form submit
  const onSearchFormSubmit = async (e) => {
    e.preventDefault();
    let dataToPost = {
      enquiry_category: "All_Filter",
      batch_size: enquiryPerPage,
      batch_number: 1,
      search_category: enquirySearchInputData.search_category,
      search_input: enquirySearchInputData.search_input
    };

    setPageLoading(true);
    try {
      const resFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, dataToPost, {
        headers: authHeader,
      });
      if (resFromApi.data) {
        setEnquiryList(resFromApi.data.Enquiries);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }

    } catch (error) {
      setPageLoading(false);
    }

  }

  // Scroll to the latest message
  useEffect(() => {
    if (messages && (newComingMessage || messages.length === currentChatMassageSize) && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
    return (() => setNewComingMessage(null))
    // eslint-disable-next-line
  }, [messages]);

  // on click View Enquiry
  const onViewEnquiryClick = async (id) => {
    if (socket === null) {
      connectToWebSocket();
    }

    try {
      const dataToPost = {
        "batch_size": currentChatMassageSize,
        "batch_number": currentMassageBatch,
        "enquiry_id": id
      }
      let res = await axios.post(
        `/sam/v1/property/auth/user/enquiry/property/`, dataToPost,
        { headers: authHeader }
      );
      if (res.data) {
        setMessages(res.data.EnquiryLogDetails);
        setPropertyId(res.data.EnquiryLogDetails[0].property_id);
        setEnquiryId(id);
        setIsMoreMassage(res.data.IsMoreEnquiryLog);
      }
    } catch (error) {
    }
  };

  //on click view more button in modal fetch More Chat Message
  const fetchMoreChatMessage = async () => {
    setChatPageLoading(true);
    try {
      const dataToPost = {
        "batch_size": currentChatMassageSize,
        "batch_number": currentMassageBatch,
        "enquiry_id": enquiryId
      }
      let res = await axios.post(
        `/sam/v1/property/auth/user/enquiry/property/`, dataToPost,
        { headers: authHeader }
      );
      if (res.data) {
        let currentChatArray = res.data.EnquiryLogDetails;
        setMessages((msg) => [...currentChatArray, ...msg]);
        setIsMoreMassage(res.data.IsMoreEnquiryLog)
        setChatPageLoading(false);
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = modalBodyRef.current.offsetTop;
        }
      }
    } catch (error) {
      setChatPageLoading(false);
    }
  }

  // on click view more chat if currentMassage batch change
  useEffect(() => {
    if (currentMassageBatch) {
      fetchMoreChatMessage();
    }
    // eslint-disable-next-line
  }, [currentMassageBatch])


  useEffect(() => {
    getUserEnquiriesList();
    getNormalUserEnquiriesList();
    setCurrentChatMassageSize(25);
    // table hight define
  }, []);

  const [socket, setSocket] = useState(null);

  //connect To WebSocket
  const connectToWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:3000/ws");
    setSocket(newSocket);
  };

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
      };

      socket.onclose = (event) => {
      };

      socket.onmessage = (event) => {
        try {
          const receivedMessage = JSON.parse(event.data);
          const { message_type } = receivedMessage;
          if (message_type === "sam-user") {
            setNewComingMessage({ ...receivedMessage })
          }
        } catch (error) {
        }
      };
    }
  }, [socket]);

  // WebSocket connection for new coming message
  useEffect(() => {
    if (newComingMessage) {
      if (enquiryId === newComingMessage.enquiry_id) {
        let msgObj = {
          enquiry_comments: newComingMessage.msg,
          enquiry_log_date: newComingMessage.enquiry_log_date,
          reply_from: newComingMessage.reply_from,
        };
        setMessages((messages) => [...messages, msgObj]);
      }

    }
  }, [newComingMessage, enquiryId])


  // on column mouse move 
  const mouseMove = useCallback(
    (e) => {
      const gridColumns = bankEnquiryTableColumns.map((col, i) => {
        if (i === activeIndex) {
          const width = e.clientX - col.ref.current.offsetLeft;

          if (width >= minCellWidth) {
            return `${width}px`;
          }
        }
        return `${col.ref.current.offsetWidth}px`;
      });

      tableElement.current.style.gridTemplateColumns = `${gridColumns.join(
        " "
      )}`;
    },
    //eslint-disable-next-line
    [activeIndex, bankEnquiryTableColumns, minCellWidth]
  );

  // remove event listeners after mouse up
  const removeListeners = useCallback(() => {
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", removeListeners);
  }, [mouseMove]);

  // on mouse up event generation
  const mouseUp = useCallback(() => {
    setActiveIndex(null);
    removeListeners();
  }, [setActiveIndex, removeListeners]);


  // for column resize use effect
  useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener("mousemove", mouseMove);
      window.addEventListener("mouseup", mouseUp);
    }

    return () => {
      removeListeners();
    };
  }, [activeIndex, mouseMove, mouseUp, removeListeners]);

  return (
    <Layout>
      <section className="section-padding min-100vh enquiry-section">
        <div className="container-fluid wrapper pt-2">
          <h1 className="text-center ">Enquiries</h1>

          {isBank ? <>
            <div className="row px-md-4 ">
              {/* enquiry category  */}
              <div className=" col-md-6 mb-md-0 mb-4 p-0 pt-2">
                <ul className="nav nav-tabs " id="myTab" role="tablist">
                  {/* Unread */}
                  <li className="nav-item " role="presentation">
                    <button className="nav-link  px-3 px-md-5 fs-lg-5 text-uppercase" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane"
                      onClick={() => onCategoryChange("Unread")}
                      type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Unread</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active px-5 fs-lg-5 text-uppercase" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#disabled-tab-pane" type="button" role="tab" aria-controls="disabled-tab-pane" aria-selected="false" onClick={() => onCategoryChange("All")} >All</button>
                  </li>
                </ul>
              </div>
              {/* search filter */}
              <div className="col-md-6  mb-md-0 mb-0 p-0 enquiry-filter-row d-flex justify-content-end ">
                <div className=" col-md-12 me-md-5 mb-md-0 mb-1 mx-2 d-flex justify-content-end">
                  {activeCategory === "All" ? <>
                    <form className="" onSubmit={onSearchFormSubmit}>
                      <div className=" d-flex">
                        <div className="input-field first-wrap ">
                          <input id="search" type="search"
                            name="search_input"
                            onChange={onSearchFormInputChange}
                            placeholder="Search"
                            className="form-control w-100 rounded-0 search_input" />
                        </div>
                        <div className="input-field second-wrap">
                          <select className="form-select form-select-sm h-100 rounded-0" name="search_category" onChange={onSearchFormInputChange} aria-label="Default select example">
                            <option value="property_number" selected>Property Number</option>
                            <option value="username">User Name</option>
                          </select>
                        </div>
                        <div className="input-field third-wrap">
                          <button className="btn btn-primary h-100 rounded-0" type="submit">SEARCH</button>
                        </div>
                      </div>
                    </form>
                  </>
                    : ""}
                </div>
              </div>
            </div>
            {/* category page as per filter */}
            <div className="tab-content" id="myTabContent">
              {/* unread */}
              <div className="tab-pane fade " id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabIndex="0">
                <div className="row justify-content-center mt-3">
                  {pageLoading ? (
                    <>
                      <CommonSpinner
                        spinnerColor="primary"
                        height="4rem"
                        width="4rem"
                        spinnerType="grow"
                      />
                    </>
                  ) : unreadEnquiryList.length < 1 ? (
                    <h4 className="fw-bold text-center fw-bold custom-heading-color mt-2">
                      No Enquiries Found !
                    </h4>
                  ) : (
                    <>
                      <div className="enquiry-list-table-wrapper px-md-4" >
                        <table className="table table-striped table-bordered text-center">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Property Number</th>
                              <th scope="col">Type</th>
                              <th scope="col">{isBank ? "User Name" : "Bank Name"}</th>
                              <th scope="col">
                                Date
                                <i
                                  onClick={changeSortType}
                                  className={`ms-3 bi bi-sort-${sortOptionText}`}
                                ></i>
                              </th>
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unreadEnquiryList.map((enquiry, Index) => {
                              const {
                                enquiry_id,
                                property_number,
                                property_type,
                                user_name,
                                added_date,
                              } = enquiry;
                              return (
                                <tr key={Index}>
                                  <th scope="row">{Index + 1}</th>
                                  <td>{property_number}</td>
                                  <td>{property_type}</td>
                                  <td>{user_name}</td>
                                  <td>{transformDateFormat(added_date)} </td>
                                  <td>
                                    <button
                                      onClick={() => {
                                        onViewEnquiryClick(enquiry_id);
                                        setChatPersonOrBankName(enquiry_id, isBank);
                                      }}
                                      className="btn btn-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target="#chatModal"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* ALL */}
              <div className="tab-pane fade show active" id="disabled-tab-pane" role="tabpanel" aria-labelledby="disabled-tab" tabIndex="0">
                <div className="row justify-content-center mt-3">
                  {pageLoading ? (
                    <>
                      <CommonSpinner
                        spinnerColor="primary"
                        height="4rem"
                        width="4rem"
                        spinnerType="grow"
                      />
                    </>
                  ) : enquiryList.length < 1 ? (
                    <h4 className="fw-bold text-center fw-bold custom-heading-color mt-2">
                      No Enquiries Found !
                    </h4>
                  ) : (
                    <>
                      <div className="enquiry-list-table-wrapper px-md-4" >
                        <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table  text-center ">
                          <thead className="bg-light">
                            <tr className="table-heading-class">
                              <th scope="col">#</th>
                              <th scope="col">Property Number</th>
                              <th scope="col">Type</th>
                              <th scope="col">{isBank ? "User Name" : "Bank Name"}</th>
                              <th scope="col">
                                Date
                                <i
                                  onClick={changeSortType}
                                  className={`ms-3 bi bi-sort-${sortOptionText}`}
                                ></i>
                              </th>
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enquiryList.map((enquiry, Index) => {
                              const {
                                enquiry_id,
                                property_number,
                                property_type,
                                user_name,
                                added_date,
                              } = enquiry;
                              return (
                                <tr key={Index}>
                                  <th scope="row">{Index + 1}</th>
                                  <td>{property_number}</td>
                                  <td>{property_type}</td>
                                  <td>{user_name}</td>
                                  <td>{transformDateFormat(added_date)} </td>
                                  <td>
                                    <button
                                      onClick={() => {
                                        onViewEnquiryClick(enquiry_id);
                                        setChatPersonOrBankName(enquiry_id, isBank);
                                      }}
                                      className="btn btn-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target="#chatModal"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="container " ref={paginationRef}>
                        {pageCount > 1 ? <div className="row">
                          <div className="col-12 mb-3">
                            <Pagination
                              handlePageClick={handlePageClick}
                              pageCount={pageCount}
                            />
                          </div>
                        </div> : ""}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
            : <>
              <hr />
              {/* for Normal User */}
              <div className="row justify-content-center mt-3">
                {pageLoading ? (
                  <>
                    <CommonSpinner
                      spinnerColor="primary"
                      height="4rem"
                      width="4rem"
                      spinnerType="grow"
                    />
                  </>
                ) : normalUserEnquiryList.length < 1 ? (
                  <h4 className="fw-bold text-center fw-bold custom-heading-color mt-2">
                    No Enquiries Found !
                  </h4>
                ) : (
                  <>
                    <div className="enquiry-list-table-wrapper px-md-4" >
                      <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table  text-center ">
                        <thead className="bg-light">
                          <tr className="table-heading-class">
                            <th scope="col">#</th>
                            <th scope="col">Property Number</th>
                            <th scope="col">Type</th>
                            <th scope="col">{isBank ? "User Name" : "Bank Name"}</th>
                            <th scope="col">
                              Date
                              <i
                                onClick={changeSortType}
                                className={`ms-3 bi bi-sort-${sortOptionText}`}
                              ></i>
                            </th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {normalUserEnquiryList.map((enquiry, Index) => {
                            const {
                              enquiry_id,
                              property_number,
                              property_type,
                              user_name,
                              added_date,
                            } = enquiry;
                            return (
                              <tr key={Index}>
                                <th scope="row">{Index + 1}</th>
                                <td>{property_number}</td>
                                <td>{property_type}</td>
                                <td>{user_name}</td>
                                <td>{transformDateFormat(added_date)} </td>
                                <td>
                                  <button
                                    onClick={() => {
                                      onViewEnquiryClick(enquiry_id);
                                      setChatPersonOrBankName(enquiry_id, isBank);
                                    }}
                                    className="btn btn-primary viewEnquiryModalBtn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#chatModal"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="container d-none" ref={paginationRef}>
                      {pageCount > 1 ? <div className="row">
                        <div className="col-12 mb-3">
                          <Pagination
                            handlePageClick={handlePageClick}
                            pageCount={pageCount}
                          />
                        </div>
                      </div> : ""}
                    </div>
                  </>
                )}
              </div>
            </>}
        </div>

        {/* chat modal */}
        <div
          className="modal fade"
          id="chatModal"
          tabIndex="-1"
          aria-labelledby="chatModalLabel"
          aria-hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header chatBox-modal-header">
                <h5 className="modal-title">
                  Chat with {chatWith ? chatWith : ""}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setCurrentMassageBatch(1);
                    setNewComingMessage(null);
                    setPropertyId(null);
                    setEnquiryId(null);
                    setMessages([]);
                    if (socket) {
                      socket.close();
                      setSocket(null);
                    }
                  }}
                ></button>
              </div>
              <div
                className="modal-body chatBox-modal-body"
                style={{
                  maxHeight: "310px",
                  minHeight: "310px",
                  overflowY: "auto",
                }}
                ref={modalBodyRef}
              >
                {chatPageLoading ? <>
                  <CommonSpinner
                    spinnerColor="primary"
                    height="2rem"
                    width="2rem"
                    spinnerType="grow"
                  />
                </> : (<>
                  {isMoreMassage ? <button type="button" onClick={() => setCurrentMassageBatch(currentMassageBatch + 1)} className="btn btn-link text-center mx-auto text-white underline">View more</button> : ""}
                </>)}
                {/* massage mapping div */}
                {messages &&
                  messages.map((msg, index) => {
                    let classToAdd = "";
                    if (isBank) {
                      if (msg.reply_from === 1) {
                        classToAdd = "chatBox-sent";
                      } else {
                        classToAdd = "chatBox-received";
                      }
                    } else {
                      if (msg.reply_from === 0) {
                        classToAdd = "chatBox-sent";
                      } else {
                        classToAdd = "chatBox-received";
                      }
                    }
                    return (
                      <div
                        key={index}
                        className={`chatBox-message ${classToAdd}`}
                      >
                        <div className="chatBox-message-content">
                          <div className="chatBox-message-text">
                            {msg.enquiry_comments}
                          </div>
                          <div className="chatBox-message-date">
                            {getIndianDateTimeOfMsg(msg.enquiry_log_date)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <form
                onSubmit={sendMessage}
                className="modal-footer chatBox-modal-footer container-fluid d-block"
              >
                <div className="row">
                  <div className="col-xl-9 col-lg-8 col-md-7">
                    <input
                      type="text"
                      className="form-control chatBox-chat-input"
                      placeholder="Type your message..."
                      value={newMessage}
                      required
                      onChange={typeMessageFunction}
                    />
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-5 mt-md-0 mt-3">
                    <button
                      disabled={sendReplyBtnLoading ? true : false}
                      type="submit"
                      className="btn btn-light w-100 chatBox-msg-send-btn"
                    >
                      {sendReplyBtnLoading ? (
                        <>
                          <span
                            className="spinner-grow spinner-grow-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending....
                        </>
                      ) : (
                        "Send"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout >
  );
};

export default ViewEnquiryLists;
