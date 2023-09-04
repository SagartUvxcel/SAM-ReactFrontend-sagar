import axios from "axios";
import React, { useRef } from "react";
import { useState } from "react";
import Layout from "../1.CommonLayout/Layout";
import { useEffect } from "react";
import CommonSpinner from "../../CommonSpinner";
import { transformDateFormat } from "../../CommonFunctions";
import { w3cwebsocket as WebSocket } from "websocket";
import { v4 as uuid } from "uuid";

let authHeader = "";
let isBank = false;
let userId = "";
// const websocket = new WebSocket(websocketUrl);
const ViewEnquiryLists = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    userId = data.userId;
  }
  const [enquiryList, setEnquiryList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const modalBodyRef = useRef(null);
  const [propertyId, setPropertyId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(null);
  const [sendReplyBtnLoading, setSendReplyBtnLoading] = useState(false);
  const [chatWith, setChatWith] = useState("");
  const [sortOptionText, setSortOptionText] = useState("up");

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

  const setChatPersonOrBankName = async (id, is_bank) => {
    try {
      let res = await axios.get(
        `/sam/v1/property/auth/enquiry/${id}/bank/${is_bank}`,
        { headers: authHeader }
      );
      if (res.data) {
        setChatWith(res.data.Name);
      }
    } catch (error) {}
  };

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

  const scrollToBottomOfModalBody = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll to the latest message whenever messages are updated
    scrollToBottomOfModalBody();
  }, [messages]);

  const getUserEnquiriesList = async () => {
    setPageLoading(true);
    try {
      const resFromApi = await axios.get(`/sam/v1/property/auth/user/enquiry`, {
        headers: authHeader,
      });
      if (resFromApi.data) {
        setEnquiryList(resFromApi.data);
        // console.log(resFromApi.data);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      setPageLoading(false);
    }
  };

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
    } catch (error) {}
  };

  useEffect(() => {
    getUserEnquiriesList();
    // eslint-disable-next-line
  }, []);

  const [socket, setSocket] = useState(null);

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

  return (
    <Layout>
      <section className="section-padding min-100vh">
        <div className="container-fluid wrapper">
          <h1 className="text-center">Enquiries</h1>
          <hr />
          <div className="row justify-content-center mt-5">
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
                <div className="enquiry-list-table-wrapper">
                  <table className="table table-striped table-bordered text-center">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Property Number</th>
                        <th scope="col">Type</th>
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
                          added_date,
                        } = enquiry;
                        return (
                          <tr key={Index}>
                            <th scope="row">{Index + 1}</th>
                            <td>{property_number}</td>
                            <td>{property_type}</td>
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
    </Layout>
  );
};

export default ViewEnquiryLists;
