import axios from "axios";
import React, { useRef, useCallback } from "react";
import { useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CommonSpinner from "../../CommonSpinner";
import { transformDateFormat } from "../../CommonFunctions";
import { w3cwebsocket as WebSocket } from "websocket";
import { v4 as uuid } from "uuid";
import Pagination from "../../Pagination";
import "./TableStyle.css"

let authHeader = "";
let isBank = false;
let userId = "";
let enquiryPerPage = 10;

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

// const websocket = new WebSocket(websocketUrl);
const ViewEnquiryLists = () => {
  const location = useLocation();
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    userId = data.userId;
  }

  // const dataFromParams = location.state ? location.state.sensitiveData : null;
  const [enquiryList, setEnquiryList] = useState([]);
  const [normalUserEnquiryLis, setNormalUserEnquiryList] = useState([]);
  const [enquirySearchInputData, setEnquirySearchInputData] = useState({
    search_input: "",
    search_category: "property_number"
  });
  const [twoWeekEnquiryList, setTwoWeekEnquiryList] = useState([]);
  const [fourWeekEnquiryList, setFourWeekEnquiryList] = useState([]);
  const [unreadEnquiryList, setUnreadEnquiryList] = useState([]);
  const [enquiryData, setEnquiryData] = useState([]);
  const [allDatabaseEnquiryList, setAllDatabaseEnquiryList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [tableHeight, setTableHeight] = useState("auto");
  const modalBodyRef = useRef(null);
  const paginationRef = useRef();
  const tableElement = useRef(null);
  const bankEnquiryTableColumns = createHeaders(tableHeaders);

  useEffect(() => {
    //   let tableReference=document.querySelectorAll(".enquiry-table");
    //   console.log(tableElement,tableReference,enquiryList.length);
    // if (enquiryList.length < 1 && tableElement !== null && tableReference !== null) {
    //   setTableHeight(tableElement.current.offsetHeight);
    // }else {
    //   setTableHeight("");
    // }
  }, []);

  // const { batch_size } = dataFromParams;

  const [propertyId, setPropertyId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(null);
  const [sendReplyBtnLoading, setSendReplyBtnLoading] = useState(false);
  const [chatWith, setChatWith] = useState("");
  const [sortOptionText, setSortOptionText] = useState("up");
  // const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");


  // console.log(enquiryData);

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

      // console.log(resFromApi);
      if (resFromApi.data) {
        console.log(dataToPost);
        console.log(resFromApi);
        setEnquiryList(resFromApi.data);
        setAllDatabaseEnquiryList(resFromApi.data);
        if (enquiryList.length < 1 && tableElement !== null) {
          setTableHeight(tableElement.current.offsetHeight);
        } else {
          setTableHeight("");
        }
        setPageCount(2);


        // console.log(resFromApi.data);
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
      batch_size: 10,
      batch_number: 1,
    };
    try {

      const normalUserResFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, normalUserDataToPost, {
        headers: authHeader,
      });
      // console.log(resFromApi);
      if (normalUserResFromApi.data) {
        console.log(normalUserResFromApi);
        setNormalUserEnquiryList(normalUserResFromApi.data);
        if (enquiryList.length < 1 && tableElement !== null) {
          setTableHeight(tableElement.current.offsetHeight);
        } else {
          setTableHeight("");
        }
        setPageCount(2);
        // console.log(resFromApi.data);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }

      // console.log(resFromApi);

    } catch (error) {
      setPageLoading(false);
    }


  };

  // on category tab change
  const onCategoryChange = async (category) => {
    console.log(category);
    setActiveCategory(category);
    setPageLoading(true);
    let dataToPost = {
      enquiry_category: category,
      batch_size: 10,
      batch_number: 1,
    };
    try {
      const resFromApi = await axios.post(`/sam/v1/property/auth/user/enquiry`, dataToPost, {
        headers: authHeader,
      });
      let resData = resFromApi.data;
      // console.log(resFromApi);
      if (resFromApi.data) {
        console.log(resData);
        if (category === "Unread") {
          setUnreadEnquiryList(resData);
        } else if (category === "All") {
          setEnquiryList(resData);
          setAllDatabaseEnquiryList(resData);
        }
        // setEnquiryList(resFromApi.data);
        // setAllDatabaseEnquiryList(resFromApi.data);
        if (resData.length < 1 && tableElement !== null) {
          setTableHeight(tableElement.current.offsetHeight);
        } else {
          setTableHeight("");
        }
        // console.log(resFromApi.data);
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
    } else if (sortOptionText === "down") {
      setSortOptionText("up");
      enquiryList.sort(
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

  // send chat Message
  const sendMessage = async (e) => {
    setSendReplyBtnLoading(true);
    e.preventDefault();
    let dataToPost = {
      property_id: propertyId,
      enquiry_source: "email",
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
          onViewEnquiryClick(enquiryId);
          setNewMessage("");
          setSendReplyBtnLoading(false);

          if (socket && socket.readyState === WebSocket.OPEN) {
            const messageToSend = {
              User_id: String(userId),
              msg: newMessage,
              message_type: "sam-user",
              messages_id: uuid(),
            };
            try {
              socket.send(JSON.stringify(messageToSend));
              console.log("Message sent successfully");
            } catch (error) {
              console.error("Error sending message:", error);
            }
          } else {
            console.log("WebSocket is not open.");
          }
        }
      } catch (error) {
        setSendReplyBtnLoading(false);
      }
    } else {
      setSendReplyBtnLoading(false);
    }
  };

  // scrollToBottomOfModalBody
  const scrollToBottomOfModalBody = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
  };

  // on Enquiry Search Input Change
  const onEnquirySearchInputChange = (event) => {
    const input = event.target.value;
    if (input.length > 0) {
      const filtered = allDatabaseEnquiryList.filter((item) => (
        item.user_name.toLowerCase().includes(input.toLowerCase()) || item.property_number === input) ||
        item.property_type.toLowerCase().includes(input.toLowerCase()) ||
        item.added_date === input
      );
      setEnquiryList(filtered);
    } else {
      setEnquiryList(allDatabaseEnquiryList);

    }
  };

  // This will run when we click any page link in pagination. e.g. prev, 1, 2, 3, 4, next.
  const handlePageClick = async (pageNumber) => {
    window.scrollTo(0, 0);
    let currentPage = pageNumber.selected + 1;
    console.log(currentPage);
    const nextOrPrevPageEnquiryData = await fetchMoreEnquiry(currentPage);
    setEnquiryData(nextOrPrevPageEnquiryData);
    console.log(nextOrPrevPageEnquiryData);
  };

  // Fetch more jobs on page click.
  const fetchMoreEnquiry = async (currentPage) => {
    let dataOfNextOrPrevPage = {
      enquiry_category: "older than 4 week",
      batch_size: 10,
      batch_number: currentPage,
    };
    let apis = {
      searchAPI: `/sam/v1/property/auth/user/enquiry`
    };
    const res = await axios.post(apis.searchAPI, dataOfNextOrPrevPage, { headers: authHeader });
    console.log(res);
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
    console.log(name, value);
  }

  // search form submit
  const onSearchFormSubmit = async (e) => {
    e.preventDefault();

    console.log(enquirySearchInputData);
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

      // console.log(resFromApi);
      if (resFromApi.data) {
        console.log(dataToPost);
        console.log(resFromApi.data);
        setEnquiryList(resFromApi.data);
        // setAllDatabaseEnquiryList(resFromApi.data);
        // if (enquiryList.length < 1 && tableElement !== null) {
        //   setTableHeight(tableElement.current.offsetHeight);
        // } else {
        //   setTableHeight("");
        // }
        // setPageCount(2);


        // console.log(resFromApi.data);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }

    } catch (error) {
      setPageLoading(false);
    }

  }


  useEffect(() => {
    // Scroll to the latest message whenever messages are updated
    scrollToBottomOfModalBody();
  }, [messages]);

  // on click View Enquiry
  const onViewEnquiryClick = async (id) => {
    if (socket === null) {
      connectToWebSocket();
    }
    try {
      let res = await axios.get(
        `/sam/v1/property/auth/user/enquiry/property/${id}`,
        { headers: authHeader }
      );
      if (res.data) {
        setMessages(res.data);
        setPropertyId(res.data[0].property_id);
        setEnquiryId(id);
        // console.log(res.data, res.data[0].property_id);
      }
    } catch (error) { }
  };

  useEffect(() => {
    getUserEnquiriesList();
    getNormalUserEnquiriesList();
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
        console.log("WebSocket connection opened");
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
      };

      socket.onmessage = (event) => {
        try {
          const receivedMessage = JSON.parse(event.data);
          const { User_id, msg, message_type } = receivedMessage;
          if (message_type === "sam_user") {
            if (User_id !== String(userId)) {
              const currentDate = new Date();
              let msgObj = {
                enquiry_comments: msg,
                enquiry_log_date: currentDate.toISOString(),
                reply_from: isBank ? 0 : 1,
              };
              console.log("Received Message: ", receivedMessage);
              setMessages((messages) => [...messages, msgObj]);
            }
          }
        } catch (error) {
          console.error("Error handling received message:", error);
        }
      };
    }
  }, [socket]);

  // on column line press
  const mouseDown = (index) => {
    setActiveIndex(index);
  };

  // on column mouse move 
  const mouseMove = useCallback(
    (e) => {
      setTableHeight(tableElement.current.offsetHeight);
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

  // reset table button click
  const resetTableCells = () => {
    tableElement.current.style.gridTemplateColumns = "";
  };

  return (
    <Layout>
      <section className="section-padding min-100vh">
        <div className="container-fluid wrapper">
          <h1 className="text-center">Enquiries</h1>

          {isBank ? <>
            <div className="row px-md-4 ">

              {/* enquiry category  */}
              <div className=" col-md-6 mb-md-0 mb-4 p-0 pt-2">
                <ul className="nav nav-tabs " id="myTab" role="tablist">
                  {/* Unread */}
                  <li className="nav-item " role="presentation">
                    <button className="nav-link  px-5 fs-lg-5 text-uppercase" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane"
                      onClick={() => onCategoryChange("Unread")}
                      type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Unread</button>
                  </li>
                  {/*  2 weeks Old */}
                  {/* <li className="nav-item" role="presentation">
                    <button className="nav-link px-5 fs-lg-5 text-uppercase" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false"
                      onClick={() => onCategoryChange("2week")}
                    >
                      2 weeks Old
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link px-5 fs-lg-5 text-uppercase" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false"
                      onClick={() => onCategoryChange("4week")}
                    >4 weeks Old</button>
                  </li> */}
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
                          {/* <div className="input-select"> */}

                          <select class="form-select form-select-sm h-100 rounded-0" name="search_category" onChange={onSearchFormInputChange} aria-label="Default select example">
                            <option value="property_number" selected>Property Number</option>
                            <option value="username">User Name</option>
                          </select>
                          {/* </div> */}

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
                    <h3 className="fw-bold text-center fw-bold custom-heading-color">
                      No Enquiries Found !
                    </h3>
                  ) : (
                    <>
                      <div className="enquiry-list-table-wrapper px-md-4" >
                        <table className="table table-striped  text-center enquiry-table" ref={tableElement}>
                          <thead>
                            <tr>
                              {bankEnquiryTableColumns.map(({ ref, text }, i) => (
                                <th ref={ref} key={text} className="">
                                  <span>{text}</span>
                                  <div
                                    style={{ height: tableHeight }}
                                    onMouseDown={() => mouseDown(i)}
                                    className={`resize-handle ${activeIndex === i ? "active" : "idle"
                                      }`}
                                  />
                                </th>
                              ))}
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
                      {/* <div className="enquiry-list-table-wrapper px-md-4">
                        <button className="btn btn-primary" onClick={resetTableCells}>RESET</button>
                      </div> */}

                      {/* Pagination */}
                      {/* <div className="container " ref={paginationRef}>
                        <div className="row">
                          <div className="col-12 mb-3">
                            <Pagination
                              handlePageClick={handlePageClick}
                              pageCount={pageCount}
                            />
                          </div>
                        </div>
                      </div> */}
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
                    <h3 className="fw-bold text-center fw-bold custom-heading-color">
                      No Enquiries Found !
                    </h3>
                  ) : (
                    <>
                      <div className="enquiry-list-table-wrapper px-md-4" >
                        <table className="table table-striped  text-center enquiry-table" ref={tableElement}>
                          <thead>
                            {/* <tr>
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
                            </tr> */}
                            <tr>
                              {bankEnquiryTableColumns.map(({ ref, text }, i) => (
                                <th ref={ref} key={text} className="">
                                  <span>{text}</span>
                                  <div
                                    style={{ height: tableHeight }}
                                    onMouseDown={() => mouseDown(i)}
                                    className={`resize-handle ${activeIndex === i ? "active" : "idle"
                                      }`}
                                  />
                                </th>
                              ))}
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
                      {/* <div className="enquiry-list-table-wrapper px-md-4">
                        <button className="btn btn-primary" onClick={resetTableCells}>RESET</button>
                      </div> */}

                      {/* Pagination */}
                      {/* <div className="container " ref={paginationRef}>
                        <div className="row">
                          <div className="col-12 mb-3">
                            <Pagination
                              handlePageClick={handlePageClick}
                              pageCount={pageCount}
                            />
                          </div>
                        </div>
                      </div> */}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
            : <>
              <hr />
              {/* for Normal User */}
              <div className="row px-md-4 ">
                {/* search filter */}
                <div className="col-md-12 p-0 d-flex justify-content-end ">
                  <div className=" col-md-3 me-4">
                    <input
                      type="search"
                      placeholder="Search"
                      className="form-control "
                      // value={searchTerm}
                      onChange={onEnquirySearchInputChange}
                    />
                  </div>
                </div>
              </div>
              {/* <hr/> */}
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
                ) : normalUserEnquiryLis.length < 1 ? (
                  <h3 className="fw-bold text-center fw-bold custom-heading-color">
                    No Enquiries Found !
                  </h3>
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
                          {normalUserEnquiryLis.map((enquiry, Index) => {
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

                    <div className="container d-none" ref={paginationRef}>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <Pagination
                            handlePageClick={handlePageClick}
                            pageCount={pageCount}
                          />
                        </div>
                      </div>
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
                    // setConditionShouldCloseWebSocket(true);
                    if (socket) {
                      socket.close();
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
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <div className="col-xl-3 col-lg-4 col-md-5 mt-md-0 mt-3">
                    <button
                      disabled={sendReplyBtnLoading ? true : false}
                      type="submit"
                      className="btn btn-light w-100"
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
