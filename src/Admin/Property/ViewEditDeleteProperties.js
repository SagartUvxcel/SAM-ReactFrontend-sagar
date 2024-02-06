import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  checkLoginSession,
  rootTitle,
  transformDateFormat,
} from "../../CommonFunctions";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import BreadCrumb from "../BreadCrumb";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import ViewProperty from "./ViewProperty";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { toggleClassOfNextPrevPageItems } from "../../CommonFunctions";
import { Form, FormControl, Button } from 'react-bootstrap';
import { v4 as uuid } from "uuid";


let authHeader = "";
let bank_Id = "";
let userId = "";
let branch_Id = "";
let propertiesPerPage = 4;
let isBank = false;


const ViewEditDeleteProperties = () => {
  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    userId = data.userId;
    bank_Id = data.bank_id;
    branch_Id = data.branch_Id;
  }

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);
  const allPropertiesPageRef = useRef();
  const viewCurrentPropertyRef = useRef();
  const editPropertyRef = useRef();
  const enquiriesPageRef = useRef();
  const modalBodyRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState([]);
  const [propertyDocumentsList, setPropertyDocumentsList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const paginationRef = useRef();
  const [messages, setMessages] = useState(null);

  console.log(properties);

  // useStates for delete functionalities
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [totalPropertyCount, setTotalPropertyCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [storedDataToPost, setStoredDataToPost] = useState({});
  const [
    confirmDeletePropertyBtnDisabled,
    setConfirmDeletePropertyBtnDisabled,
  ] = useState(true);
  const confirmDeletePropertyInputRef = useRef();

  // get Properties From Api
  const getPropertiesFromApi = async () => {
    // Hide pagination while loading.
    if (paginationRef) {
      paginationRef.current.classList.add("d-none");
    }
    let dataToPost = {
      batch_number: 1,
      batch_size: propertiesPerPage,
    };

    setStoredDataToPost(dataToPost);

    try {
      const propertiesRes = await axios.post(
        `/sam/v1/property/auth/all-properties`,
        dataToPost,
        { headers: authHeader }
      );

      const propertyCountRes = await axios.get(
        `/sam/v1/property/auth/property-count`,
        { headers: authHeader }
      );
      console.log(propertiesRes);
      console.log(propertyCountRes);
      let arr = propertyCountRes.data;
      let totalCount = 0;

      arr && arr.forEach((type) => {
        totalCount += type.count;
      });
      setTotalPropertyCount(totalCount);

      let totalPages = Math.ceil(totalCount / propertiesPerPage);
      if (propertyCountRes.data) {
        setPageCount(totalPages);
      }

      if (propertiesRes.data !== null && propertiesRes.data.length > 0) {
        paginationRef.current.classList.remove("d-none");
        setProperties(propertiesRes.data);
      } else {
        paginationRef.current.classList.add("d-none");
      }
      setLoading(false);

    } catch (error) {

      setLoading(false);
    }
  };

  // toggleActivePageClass
  const toggleActivePageClass = (activePage) => {
    let arr = document.querySelectorAll(".page-item");
    arr && arr.forEach((pageItem) => {
      if (parseInt(pageItem.textContent) === activePage) {
        pageItem.classList.add("active");
      } else {
        pageItem.classList.remove("active");
      }
    });
  };

  // This will run when we click any page link in pagination. e.g. prev, 1, 2, 3, 4, next.
  const handlePageClick = async (pageNumber) => {
    window.scrollTo(0, 0);
    let currentPage = pageNumber.selected + 1;
    toggleActivePageClass(currentPage);
    setCurrentPageNumber(currentPage);
    const nextOrPrevPagePropertyData = await fetchMoreProperties(currentPage);
    setProperties(nextOrPrevPagePropertyData);
    toggleClassOfNextPrevPageItems();
  };

  // Fetch more jobs on page click.
  const fetchMoreProperties = async (currentPage) => {
    const dataToPost = {
      batch_number: currentPage,
      batch_size: propertiesPerPage,
    };
    setStoredDataToPost(dataToPost);
    const propertiesRes = await axios.post(
      `/sam/v1/property/auth/all-properties`,
      dataToPost,
      { headers: authHeader }
    );
    return propertiesRes.data;
  };

  // delete Property
  const deleteProperty = async (propertyId) => {
    try {
      await axios
        .delete(`/sam/v1/property/auth/delete-property/${propertyId}`, {
          headers: authHeader,
        })
        .then((res) => {
          if (res.data.msg === 0) {
            toast.success(`Property deleted successfully`);
            confirmDeletePropertyInputRef.current.value = "";
            setConfirmDeletePropertyBtnDisabled(true);
            setTotalPropertyCount(totalPropertyCount - 1);
            if (totalPropertyCount - 1 !== 0) {
              let newPageCount = Math.ceil(
                (totalPropertyCount - 1) / propertiesPerPage
              );
              setPageCount(newPageCount);
              if (newPageCount < currentPageNumber) {
                handlePageClick({ selected: currentPageNumber - 2 });
              } else {
                handlePageClick({ selected: currentPageNumber - 1 });
              }
            } else {
              setProperties(false);
            }
          } else {
            toast.error("Internal server error");
          }
        });
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  const onDeletePropertyBtnClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
    confirmDeletePropertyInputRef.current.value = "";
    setConfirmDeletePropertyBtnDisabled(true);
  };
  const [propertiesLinkDisabled, setPropertiesLinkDisabled] = useState(false);

  // view Current Property button click
  const viewCurrentProperty = async (id) => {
    setViewSinglePropertyPageLoading(true);
    viewCurrentPropertyRef.current.classList.remove("d-none");
    window.scrollTo(0, 0);
    allPropertiesPageRef.current.classList.add("d-none");
    setPropertiesLinkDisabled(true);
    const currentPropertyRes = await axios.get(
      `/sam/v1/property/single-property/${id}`,
      { headers: authHeader }
    );
    setSelectedProperty(currentPropertyRes.data);
    getListOfPropertyDocuments(id);
  };

  // get ListOfProperty Documents from API
  const getListOfPropertyDocuments = async (id) => {
    console.log(id);
    const propertyDocsListRes = await axios.get(
      `/sam/v1/property/auth/property_document_list/${id}`,
      { headers: authHeader }
    );
    setPropertyDocumentsList(propertyDocsListRes.data);
    setViewSinglePropertyPageLoading(false);
  };

  // back ToAll Properties Page button
  const backToAllPropertiesPage = async () => {
    const propertiesRes = await axios.post(
      `/sam/v1/property/auth/all-properties`,
      storedDataToPost,
      { headers: authHeader }
    );
    setProperties(propertiesRes.data);
    setPropertiesLinkDisabled(false);
    viewCurrentPropertyRef.current.classList.add("d-none");
    editPropertyRef.current.classList.add("d-none");
    allPropertiesPageRef.current.classList.remove("d-none");
  };

  const [possessionCheckValue, setPossessionCheckValue] = useState({
    titleClearYes: false,
    titleClearNo: false,
  });

  const { titleClearYes, titleClearNo } = possessionCheckValue;

  const [formData, setFormData] = useState({
    address_details: {},
  });
  const {
    completion_date,
    purchase_date,
    mortgage_date,
    market_price,
    ready_reckoner_price,
    expected_price,
    saleable_area,
    carpet_area,
    property_number,
    property_id,
    is_sold,
    territory,
    distress_value,
    is_stressed,
    // is_available_for_sale,
  } = formData;
  const {
    locality,
    flat_number,
    building_name,
    society_name,
    plot_number,
    landmark,
    zip,
  } = formData.address_details;

  const [banks, setBanks] = useState([]);
  const [enquiryList, setEnquiryList] = useState([]);
  const [activeBank, setActiveBank] = useState({});
  const [bankBranches, setBankBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState({});
  const notSoldCheckRef = useRef();
  const [mainPageLoading, setMainPageLoading] = useState(false);
  const [pathLocation, setPathLocation] = useState("");
  const [selectedPropertyNumberForEnquiry, setSelectedPropertyNumberForEnquiry] = useState(null);
  const [selectedPropertyTypeForEnquiry, setSelectedPropertyTypeForEnquiry] = useState(null);
  const [sortOptionText, setSortOptionText] = useState("up");
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [propertyId, setPropertyId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(null);
  const [chatWith, setChatWith] = useState("");
  const [tempEnquiryList, setTempEnquiryList] = useState([]);

  const [sendReplyBtnLoading, setSendReplyBtnLoading] = useState(false);


  const [viewSinglePropertyPageLoading, setViewSinglePropertyPageLoading] =
    useState(false);

  const commonFnToSaveFormData = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const onInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "bank") {
      if (value) {
        const branchRes = await axios.get(
          `/sam/v1/property/auth/bank-branches/${value}`,
          {
            headers: authHeader,
          }
        );
        setBankBranches(branchRes.data);
      }
    } else if (name === "bank_branch_id") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "market_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "ready_reckoner_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "expected_price") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "distress_value") {
      commonFnToSaveFormData(name, parseInt(value));
    } else if (name === "mortgage_date") {
      commonFnToSaveFormData(name, value);
    } else if (name === "is_sold") {
      const notForSale = document.getElementById("notForSale");
      if (value === "1") {
        notSoldCheckRef.current.removeAttribute("checked");
        if (notForSale) {
          notForSale.selected = true;
        }
        setFormData({
          ...formData,
          [name]: parseInt(value),
          is_available_for_sale: 0,
        });
      } else {
        document.getElementById("is_available_for_sale-1").selected = true;
        setFormData({
          ...formData,
          [name]: parseInt(value),
          is_available_for_sale: 1,
        });
      }
    } else if (name === "is_available_for_sale") {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else if (name === "title_clear_property") {
      if (value === "1") {
        setPossessionCheckValue({ titleClearYes: true, titleClearNo: false });
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Owner / Customer consent",
        });
      } else if (value === "0") {
        setPossessionCheckValue({ titleClearYes: false, titleClearNo: true });
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Legally attached",
        });
      } else {
        setPossessionCheckValue({ titleClearYes: false, titleClearNo: false });
      }
    }
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setUpdateBtnLoading(true);
    try {
      console.log(JSON.stringify(formData));
      await axios
        .post(`/sam/v1/property/auth/update-property`, formData, {
          headers: authHeader,
        })
        .then((res) => {
          if (res.data.status === 0) {
            toast.success("Property updated successfully");
            setUpdateBtnLoading(false);
            window.scrollTo(0, 0);
          } else {
            toast.error("Internal server error");
            setUpdateBtnLoading(false);
          }
        });
    } catch (error) {
      toast.error("Internal server error");
      setUpdateBtnLoading(false);
    }
  };

  const [otherValuesToShow, setOtherValuesToShow] = useState({});
  const { type_name, state_name, city_name } = otherValuesToShow;

  // Current Property DataToUpdate button click
  const getCurrentPropertyDataToUpdate = async (propertyId) => {
    setMainPageLoading(true);
    // let propertyId = localStorage.getItem("propertyId");
    if (propertyId) {
      allPropertiesPageRef.current.classList.add("d-none");
      editPropertyRef.current.classList.remove("d-none");
      setPropertiesLinkDisabled(true);
      // Get details from api.
      const bankRes = await axios.get(`/sam/v1/property/by-bank`);
      setBanks(bankRes.data);

      if (isBank) {
        getBankDetails(bankRes.data);
      }
      // Get current property values
      const currentPropertyRes = await axios.get(
        `/sam/v1/property/single-property/${propertyId}`,
        { headers: authHeader }
      );
      console.log(currentPropertyRes.data);
      const {
        type_id,
        completion_date,
        purchase_date,
        mortgage_date,
        market_price,
        ready_reckoner_price,
        expected_price,
        building_name,
        landmark,
        flat_no,
        plot_no,
        saleable_area,
        carpet_area,
        property_number,
        society_name,
        locality,
        zip,
        is_sold,
        is_available_for_sale,
        status,
        is_stressed,
        property_id,
        state_id,
        city_id,
        bank_id,
        territory,
        possession_of_the_property,
        title_clear_property,
        distress_value,
        bank_branch_id,
      } = currentPropertyRes.data;
      setOtherValuesToShow(currentPropertyRes.data);

      setAllDefaultValues(
        bank_id,
        is_sold,
        is_available_for_sale,
        title_clear_property,
        bank_branch_id
      );

      if (currentPropertyRes.data) {
        setFormData({
          ...formData,
          property_id: property_id,
          type_id: parseInt(type_id),
          bank_branch_id: parseInt(bank_branch_id),
          property_number: property_number,
          is_stressed: parseInt(is_stressed),
          is_available_for_sale: parseInt(is_available_for_sale),
          sale_availability_date: "2005-12-26 23:50:30",
          saleable_area: saleable_area,
          carpet_area: carpet_area,
          ready_reckoner_price: parseInt(ready_reckoner_price),
          expected_price: parseInt(expected_price),
          market_price: parseInt(market_price),
          completion_date: transformDateFormat(completion_date),
          purchase_date: transformDateFormat(purchase_date),
          mortgage_date: transformDateFormat(mortgage_date),
          is_sold: parseInt(is_sold),
          status: status,
          territory: territory,
          possession_of_the_property: possession_of_the_property,
          title_clear_property: title_clear_property === "yes" ? 1 : 0,
          distress_value: distress_value,
          address_details: {
            address: locality,
            locality: locality,
            flat_number: parseInt(flat_no),
            building_name: building_name,
            society_name: society_name,
            plot_number: parseInt(plot_no),
            landmark: landmark,
            city: parseInt(city_id),
            zip: parseInt(zip),
            state: parseInt(state_id),
          },
        });
      }
    }
  };

  // change Sort Type function
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

  // Current Property DataToUpdate button click
  const getCurrentPropertyAllEnquires = async (propertyId, property_number, category) => {
    setSelectedPropertyNumberForEnquiry(property_number);
    setSelectedPropertyTypeForEnquiry(category);
    setMainPageLoading(true);
    // let propertyId = localStorage.getItem("propertyId");
    if (propertyId) {
      allPropertiesPageRef.current.classList.add("d-none");
      enquiriesPageRef.current.classList.remove("d-none");
      // setPropertiesLinkDisabled(true);
      try {
        // Get details from api.
        const EnquiryRes = await axios.get(`/sam/v1/property/auth/property-enquiries/${propertyId}`, {
          headers: authHeader,
        })
        const dataValue = EnquiryRes.data
        console.log(dataValue);
        if (dataValue) {
          setEnquiryList(dataValue);
          setTempEnquiryList(dataValue);
          setMainPageLoading(false);
        } else {
          setMainPageLoading(false);
        }
      } catch (error) {
        setMainPageLoading(false);
      }

      // if (isBank) {
      //   getBankDetails(bankRes.data);
      // }

    }
  };

  // get Bank Details form API
  const getBankDetails = async (bankData) => {
    const activeBankDetails = bankData.filter(bank => bank.bank_id === bank_Id)[0]
    setActiveBank(activeBankDetails);
    const branchRes = await axios.get(`/sam/v1/property/auth/bank-branches/${bank_Id}`, {
      headers: authHeader,
    });
    const branchResData = branchRes.data;
    console.log(branchResData, bank_Id, branch_Id);
    const activeBranchDetails = branchResData.filter(branch => branch.branch_id === branch_Id)[0]
    setActiveBranch(activeBranchDetails);

    // branchSelectBoxRef.current.classList.remove("d-none");
    commonFnToSaveFormData("bank", bank_Id);
    commonFnToSaveFormData("bank_branch_id", branch_Id);
  }

  // set All Default Values
  const setAllDefaultValues = async (
    bank_id,
    is_sold,
    is_available_for_sale,
    title_clear_property,
    bank_branch_id
  ) => {
    // To make default bank selected in bank select box
    let defaultBank = document.getElementById(`bank-${bank_id}`);
    if (defaultBank) {
      defaultBank.selected = true;
      const branchRes = await axios.get(
        `/sam/v1/property/auth/bank-branches/${defaultBank.value}`,
        {
          headers: authHeader,
        }
      );
      setBankBranches(branchRes.data);

      // Set default value for branch and make it selected in branch select box
      let defaultBranch = document.getElementById(`branch-${bank_branch_id}`);
      if (defaultBranch) {
        defaultBranch.selected = true;
      }
    }

    // default is_sold value
    let defaultIsSold = document.getElementById(`is_sold-${is_sold}`);
    if (defaultIsSold) {
      defaultIsSold.checked = true;
    }

    // default is_available_for_sale value
    let defaultIsAvailableForSale = document.getElementById(
      `is_available_for_sale-${is_available_for_sale}`
    );
    if (defaultIsAvailableForSale) {
      defaultIsAvailableForSale.selected = true;
    }

    // default title_clear_property value
    let defaultTitleClear = document.getElementById(
      `title_clear_property-${title_clear_property}`
    );
    if (defaultTitleClear) {
      defaultTitleClear.selected = true;
    }
    if (title_clear_property === "yes") {
      setPossessionCheckValue({ titleClearYes: true, titleClearNo: false });
    } else {
      setPossessionCheckValue({ titleClearYes: false, titleClearNo: true });
    }
    setMainPageLoading(false);
  };

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

  // sendMessage
  const sendMessage = async (e) => {
    setSendReplyBtnLoading(true);
    e.preventDefault();
    let dataToPost = {
      property_id: propertyId,
      enquiry_source: "email",
      enquiry_comments: newMessage,
    };
    console.log(dataToPost);

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

  // on Enquiry Search Input Change
  const onEnquirySearchInputChange = (event) => {
    const input = event.target.value;
    if (input.length > 0) {
      const filtered = tempEnquiryList.filter(item =>
        item.user_name.toLowerCase().includes(input.toLowerCase())
      );
      setEnquiryList(filtered);
    } else {
      setEnquiryList(tempEnquiryList);

    }
  };



  //connect To WebSocket
  const connectToWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:3000/ws");
    setSocket(newSocket);
  };

  // console.log(pathLocation);
  useEffect(() => {
    rootTitle.textContent = "ADMIN - PROPERTIES";
    if (data) {
      setLoading(true);
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getPropertiesFromApi();
          // getUserEnquiriesList();

        }
      });
    }
    // eslint-disable-next-line
    if (window.location.pathname) {
      const currentPagePath = window.location.pathname;
      const firstPathSegment = currentPagePath.split('/')[1];
      setPathLocation(firstPathSegment);
    }

  }, []);


  // WebSocket connection
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
      <div className="container-fluid section-padding">
        <div className="row min-100vh position-relative">
          <AdminSideBar
            propertiesLinkDisabled={propertiesLinkDisabled}
            backToAllPropertiesPage={backToAllPropertiesPage}
          />
          {/* allPropertiesPageRef */}
          <div
            className="col-xl-10 col-lg-9 col-md-8"
            ref={allPropertiesPageRef}
          >
            <BreadCrumb />
            <>
              <h1 className="text-center text-primary fw-bold">Properties</h1>
              <hr />
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "60vh" }}
                >
                  <CommonSpinner
                    spinnerColor="primary"
                    height="4rem"
                    width="4rem"
                    spinnerType="grow"
                  />
                </div>
              ) : properties.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center mt-5">
                  <h3 className="fw-bold custom-heading-color">
                    No Properties Found !
                  </h3>
                </div>
              ) : (
                <section className="admin-view-all-properties">
                  <div className="container-fluid">
                    <div className="row">
                      {/* all-properties mapping */}
                      {properties.map((property, Index) => {
                        const {
                          category,
                          city_name,
                          market_value,
                          expected_price,
                          property_id,
                          property_number,
                        } = property;
                        return (
                          <div className="col-xl-3 col-md-6" key={Index}>
                            <div className="admin-property-card-wrapper">
                              <div className="card mb-4">
                                <div className="top-line"></div>
                                <img
                                  className="card-img-top"
                                  src="/images2.jpg"
                                  alt=""
                                />
                                <div className="card-body">
                                  {category ? (
                                    <div className="text-capitalize">
                                      <span>Type: </span>
                                      <span className="common-btn-font">
                                        {category}
                                      </span>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  {city_name ? (
                                    <div className="text-capitalize">
                                      <span>Location: </span>
                                      <span className="common-btn-font">
                                        {city_name}
                                      </span>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  {market_value ? (
                                    <div className="text-capitalize">
                                      <span>Market Price: </span>
                                      <span className="common-btn-font">
                                        <i className="bi bi-currency-rupee"></i>
                                        {`${(
                                          parseInt(market_value) / 10000000
                                        ).toFixed(2)} Cr.`}
                                      </span>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  {expected_price ? (
                                    <div className="text-capitalize">
                                      <span>Reserved Price: </span>
                                      <span className="common-btn-font">
                                        <i className="bi bi-currency-rupee"></i>
                                        {`${(
                                          parseInt(expected_price) / 10000000
                                        ).toFixed(2)} Cr.`}
                                      </span>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  <div className="mt-3 d-flex">
                                    {/* view current property button */}
                                    <button
                                      onClick={() => {
                                        viewCurrentProperty(property_id);
                                      }}
                                      className="btn btn-sm btn-outline-success property-button-wrapper"
                                    >
                                      <i className="bi bi-eye-fill"></i>
                                    </button>
                                    {/* Current property DataToUpdate button */}
                                    <button
                                      onClick={() => {
                                        getCurrentPropertyDataToUpdate(
                                          property_id
                                        );
                                        getCurrentPropertyDataToUpdate(
                                          property_id
                                        );
                                      }}
                                      className="mx-2 btn btn-sm btn-outline-primary property-button-wrapper"
                                    >
                                      <i className="bi bi-pencil-fill"></i>
                                    </button>
                                    {/* Delete Property button */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#confirmDeletePropertyModal"
                                      onClick={() => {
                                        onDeletePropertyBtnClick(property_id);
                                      }}
                                      className="btn btn-sm btn-outline-danger property-button-wrapper"
                                    >
                                      <i className="bi bi-trash-fill"></i>
                                    </button>
                                    {/* single-property-documents-upload */}
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
                                      to={`${isBank ? "/bank" : "/admin"
                                        }/property/single-property-documents-upload`}
                                      className="btn btn-sm btn-outline-dark property-button-wrapper ms-2"
                                    >
                                      <i className="bi bi-upload"></i>
                                    </NavLink>
                                    {/* view current property enquiry details button */}
                                    {isBank ? <button
                                      onClick={() => {
                                        getCurrentPropertyAllEnquires(
                                          property_id, property_number, category
                                        );
                                        getCurrentPropertyAllEnquires(
                                          property_id, property_number, category
                                        );
                                      }}
                                      className="mx-2 btn btn-sm btn-outline-info property-button-wrapper"
                                    >
                                      <i className="bi bi-chat-text"></i>
                                    </button> : <></>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
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
          </div>

          {/* viewCurrentPropertyRef */}
          <div
            className="col-xl-10 col-lg-9 col-md-8 d-none"
            ref={viewCurrentPropertyRef}
          >
            <>
              <div className="container-fluid">
                {viewSinglePropertyPageLoading ? (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ minHeight: "75vh" }}
                  >
                    <CommonSpinner
                      spinnerColor="primary"
                      height="5rem"
                      width="5rem"
                      spinnerType="grow"
                    />
                  </div>
                ) : (
                  <div className="row">
                    <div className="card border-0">
                      <div className="my-4">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={backToAllPropertiesPage}
                        >
                          <i className="bi bi-arrow-left"></i> Back
                        </button>
                      </div>
                      <ViewProperty
                        selectedProperty={selectedProperty}
                        propertyDocumentsList={propertyDocumentsList}
                        setPropertyDocumentsList={setPropertyDocumentsList}
                        getListOfPropertyDocuments={getListOfPropertyDocuments}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          </div>

          {/* editPropertyRef */}
          <div
            className="col-xl-10 col-lg-9 col-md-8 d-none"
            ref={editPropertyRef}
          >
            <>
              <BreadCrumb
                isUpdatePropertyPageActive={true}
                backToAllPropertiesPage={backToAllPropertiesPage}
              />
              <section className="add-property-wrapper mb-4">
                <div className="container-fluid">
                  <div className="row justify-content-center">
                    <div className="col-xl-12">
                      <div
                        className={`${mainPageLoading ? "" : "d-none"
                          } d-flex align-items-center justify-content-center`}
                        style={{ minHeight: "75vh" }}
                      >
                        <CommonSpinner
                          spinnerColor="primary"
                          height="5rem"
                          width="5rem"
                          spinnerType="grow"
                        />
                      </div>

                      <form
                        onSubmit={onFormSubmit}
                        className={`card p-xl-2 ${mainPageLoading ? "d-none" : ""
                          }`}
                      >
                        <div className="card-body">
                          <h4 className="fw-bold">Update Property</h4>
                          <hr />
                          <div className="row mb-3">
                            <div className="col-12 d-md-flex justify-content-md-start">
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                >
                                  <span className="common-btn-font">
                                    Property ID
                                  </span>
                                  <span className="badge bg-light text-primary ms-2">
                                    {property_id}
                                  </span>
                                </button>
                              </div>

                              <div>
                                <button
                                  type="button"
                                  className="btn btn-primary ms-md-2 mt-md-0 mt-3"
                                >
                                  <span className="common-btn-font">
                                    Property Number
                                  </span>
                                  <span className="badge bg-light text-primary ms-2">
                                    {property_number}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Row 1 - Basic Details */}
                          <div className="row mb-3">
                            <div className="col-12">
                              <h5 className="fw-bold text-primary">
                                Basic details
                              </h5>
                            </div>
                            {type_name ? (
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="type_name"
                                  >
                                    Property type
                                  </label>
                                  <input
                                    id="type_name"
                                    type="text"
                                    className="form-control"
                                    value={type_name}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}

                            <div className="col-xl-4 col-md-6">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="bank"
                                >
                                  Bank
                                </label>
                                {pathLocation === 'admin' ?
                                  <select
                                    id="bank"
                                    name="bank"
                                    className="form-select"
                                    onChange={onInputChange}
                                    disabled
                                  >
                                    <option value=""></option>
                                    {banks ? (
                                      banks.map((data) => {
                                        return (
                                          <option
                                            key={data.bank_id}
                                            value={data.bank_id}
                                            id={`bank-${data.bank_id}`}
                                          >
                                            {data.bank_name}
                                          </option>
                                        );
                                      })
                                    ) : (
                                      <></>
                                    )}
                                  </select> :
                                  <input
                                    type="text"
                                    id="bank"
                                    name="bank"
                                    className="form-control"
                                    // onChange={onInputChange}
                                    value={activeBank.bank_name}
                                    required
                                    disabled
                                  />}
                              </div>
                            </div>
                            <div className="col-xl-4 col-md-6 mt-xl-0 mt-3">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="bank_branch_id"
                                >
                                  Branch
                                </label>
                                {pathLocation === 'admin' ? <select
                                  id="bank_branch_id"
                                  name="bank_branch_id"
                                  className="form-select"
                                  onChange={onInputChange}
                                  disabled
                                >
                                  <option value=""></option>
                                  {bankBranches ? (
                                    bankBranches.map((data) => {
                                      return (
                                        <option
                                          key={data.branch_id}
                                          value={data.branch_id}
                                          id={`branch-${data.branch_id}`}
                                        >
                                          {data.branch_name}
                                        </option>
                                      );
                                    })
                                  ) : (
                                    <></>
                                  )}
                                </select> :
                                  <input
                                    type="text"
                                    id="bank_branch_id"
                                    name="bank_branch_id"
                                    className="form-control"
                                    // onChange={onInputChange}
                                    value={activeBranch.branch_name}
                                    required
                                    disabled
                                  />}
                              </div>
                            </div>
                            <div className="col-xl-4 col-md-6 mt-3">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="title_clear_property"
                                >
                                  Title clear Property
                                </label>
                                <select
                                  id="title_clear_property"
                                  name="title_clear_property"
                                  className="form-select"
                                  onChange={onInputChange}
                                  disabled
                                >
                                  <option value=""></option>
                                  <option
                                    id="title_clear_property-yes"
                                    value="1"
                                  >
                                    Yes
                                  </option>
                                  <option
                                    id="title_clear_property-no"
                                    value="0"
                                  >
                                    No
                                  </option>
                                </select>
                              </div>
                            </div>
                            {/* <div className="col-xl-4 col-md-6 mt-3">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="possession"
                                >
                                  Possession of the property
                                </label>
                                <div id="possession">
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="inlineRadioOptions"
                                      id="possessionValue1"
                                      value="possessionValue"
                                      disabled
                                      checked={titleClearNo}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="possessionValue1"
                                    >
                                      Legally attached
                                    </label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="inlineRadioOptions"
                                      id="possessionValue2"
                                      value="possessionValue"
                                      disabled
                                      checked={titleClearYes}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="possessionValue2"
                                    >
                                      Owner / Customer consent
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div> */}
                            {/* {is_stressed ? (
                              <div className="col-xl-4 col-md-6 mt-3">
                                <div className="form-group">
                                  <label
                                    htmlFor="is_stressed"
                                    className="form-label common-btn-font"
                                  >
                                    Is stressed?
                                  </label>
                                  <input
                                    id="is_stressed"
                                    type="text"
                                    className="form-control"
                                    value={is_stressed === 1 ? "Yes" : "No"}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )} */}
                            {territory ? (
                              <div className="col-xl-4 col-md-6 mt-3">
                                <div className="form-group">
                                  <label
                                    htmlFor="territory"
                                    className="form-label common-btn-font"
                                  >
                                    Territory
                                  </label>
                                  <input
                                    type="text"
                                    id="territory"
                                    name="territory"
                                    className="form-control"
                                    value={territory}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                          {/* Row 2 - Area Details*/}
                          <div className="row mb-3">
                            <div className="col-12">
                              <h5 className="fw-bold text-primary">Area</h5>
                            </div>
                            {saleable_area ? (
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="saleable_area"
                                  >
                                    Saleable area (sq. ft.)
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="saleable_area"
                                    name="saleable_area"
                                    value={saleable_area ? saleable_area : ""}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {carpet_area ? (
                              <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="carpet_area"
                                  >
                                    Carpet area (sq. ft.)
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="carpet_area"
                                    name="carpet_area"
                                    value={saleable_area ? carpet_area : ""}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>

                          {/* Row 3 - Pricing Details */}
                          <div className="row mb-3">
                            <div className="col-12">
                              <h5 className="fw-bold text-primary">Pricing</h5>
                            </div>
                            <div className="col-xl-4 col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="market_price"
                                  className="form-label common-btn-font"
                                >
                                  Market price (Rs.)
                                </label>
                                <input
                                  className="form-control"
                                  type="number"
                                  id="market_price"
                                  name="market_price"
                                  defaultValue={market_price}
                                  onChange={onInputChange}
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                              <div className="form-group">
                                <label
                                  htmlFor="ready_reckoner_price"
                                  className="form-label common-btn-font"
                                >
                                  Ready reckoner price (Rs.)
                                </label>
                                <input
                                  type="number"
                                  id="ready_reckoner_price"
                                  name="ready_reckoner_price"
                                  className="form-control"
                                  defaultValue={ready_reckoner_price}
                                  onChange={onInputChange}
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="expected_price"
                                >
                                  Reserved Price (Rs.)
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="expected_price"
                                  name="expected_price"
                                  defaultValue={expected_price}
                                  onChange={onInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* <div className="col-xl-4 col-md-6 mt-3">
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="distress_value"
                                >
                                  Distress Value (Rs.)
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="distress_value"
                                  name="distress_value"
                                  onChange={onInputChange}
                                  defaultValue={distress_value}
                                  required
                                />
                              </div>
                            </div> */}
                          </div>

                          {/* Row 4 - Dates & Availability Details */}
                          <div className="row mb-3">
                            <div className="col-12">
                              <h5 className="fw-bold text-primary">
                                Dates & Availability
                              </h5>
                            </div>
                            {completion_date ? (
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="completion_date"
                                    className="form-label common-btn-font"
                                  >
                                    Completion date
                                  </label>
                                  <input
                                    className="form-control"
                                    type="date"
                                    id="completion_date"
                                    name="completion_date"
                                    value={completion_date}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {purchase_date ? (
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="purchase_date"
                                    className="form-label common-btn-font"
                                  >
                                    Purchase date
                                  </label>
                                  <input
                                    className="form-control"
                                    type="date"
                                    id="purchase_date"
                                    name="purchase_date"
                                    value={purchase_date}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            <div className="col-xl-4 mb-3 col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="mortgage_date"
                                  className="form-label common-btn-font"
                                >
                                  Mortgage date
                                </label>
                                <input
                                  className="form-control"
                                  type="date"
                                  id="mortgage_date"
                                  name="mortgage_date"
                                  onChange={onInputChange}
                                  defaultValue={mortgage_date}
                                  required
                                  disabled
                                />
                              </div>
                            </div>
                            {/* <div className="col-xl-4 col-md-6 mb-3 mb-xl-0">
                              <div className="form-group">
                                <label className="form-label common-btn-font">
                                  Is sold?
                                </label>
                                <br />
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="is_sold"
                                    value="1"
                                    id="is_sold-1"
                                    onChange={onInputChange}
                                    disabled
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="inlineRadio1"
                                  >
                                    Yes
                                  </label>
                                </div>
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="is_sold"
                                    value="0"
                                    id="is_sold-0"
                                    onChange={onInputChange}
                                    ref={notSoldCheckRef}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="inlineRadio2"
                                  >
                                    No
                                  </label>
                                </div>
                              </div>
                            </div> */}
                            <div
                              className={`col-xl-4 col-md-6 mb-3 mb-xl-0 ${is_sold === 1 ? "d-none" : ""
                                }`}
                            >
                              <div className="form-group">
                                <label
                                  className="form-label common-btn-font"
                                  htmlFor="is_available_for_sale"
                                >
                                  Available for sale?
                                </label>
                                <select
                                  id="is_available_for_sale"
                                  name="is_available_for_sale"
                                  className="form-select"
                                  onChange={onInputChange}
                                  required
                                  disabled
                                >
                                  <option
                                    value="1"
                                    id="is_available_for_sale-1"
                                  >
                                    Yes
                                  </option>
                                  <option
                                    value="0"
                                    id="is_available_for_sale-0"
                                  >
                                    No
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>
                          {/* Row 5 - Address Details */}
                          <div className="row">
                            <div className="col-12">
                              <h5 className="fw-bold text-primary">Address</h5>
                            </div>
                            {flat_number ? (
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="flat_number"
                                  >
                                    Flat No.
                                  </label>
                                  <input
                                    id="flat_number"
                                    name="flat_number"
                                    type="number"
                                    className="form-control"
                                    value={flat_number}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {building_name ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="building_name"
                                  >
                                    Building Name
                                  </label>
                                  <input
                                    id="building_name"
                                    name="building_name"
                                    type="text"
                                    className="form-control"
                                    value={building_name}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {society_name ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="society_name"
                                  >
                                    Society Name
                                  </label>
                                  <input
                                    id="society_name"
                                    name="society_name"
                                    type="text"
                                    className="form-control"
                                    value={society_name}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {plot_number ? (
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="plot_number"
                                  >
                                    Plot No.
                                  </label>
                                  <input
                                    id="plot_number"
                                    name="plot_number"
                                    type="number"
                                    className="form-control"
                                    value={plot_number}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {locality ? (
                              <div className="col-xl-4 mb-3 col-md-6">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="locality"
                                  >
                                    Locality
                                  </label>
                                  <input
                                    id="locality"
                                    name="locality"
                                    type="text"
                                    className="form-control"
                                    value={locality}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}

                            {landmark ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="landmark"
                                  >
                                    Landmark
                                  </label>
                                  <input
                                    id="landmark"
                                    name="landmark"
                                    type="text"
                                    className="form-control"
                                    value={landmark}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}

                            {state_name ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="state"
                                  >
                                    State
                                  </label>
                                  <input
                                    id="state"
                                    name="state"
                                    className="form-control"
                                    value={state_name}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {city_name ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="city"
                                  >
                                    City
                                  </label>
                                  <input
                                    id="city"
                                    name="city"
                                    className="form-control"
                                    value={city_name}
                                    disabled
                                  />
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {zip ? (
                              <div className="col-xl-4 col-md-6 mb-3">
                                <div className="form-group">
                                  <label
                                    className="form-label common-btn-font"
                                    htmlFor="zip"
                                  >
                                    Zip
                                  </label>
                                  <input
                                    type="text"
                                    id="zip"
                                    name="zip"
                                    value={zip}
                                    disabled
                                    className="form-control"
                                  ></input>
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                          <hr />
                          <div className="row justify-content-end pt-2">
                            <div className="col-xl-2 col-12">
                              <button
                                disabled={updateBtnLoading ? true : false}
                                type="submit"
                                className="btn btn-primary common-btn-font w-100"
                              >
                                {updateBtnLoading ? (
                                  <>
                                    <span className="spinner-grow spinner-grow-sm me-2"></span>
                                    Updating...
                                  </>
                                ) : (
                                  "Update"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            </>
          </div>

          {/* enquiriesPageRef */}
          <div
            className="col-xl-10 col-lg-9 col-md-8 d-none"
            ref={enquiriesPageRef}
          >
            <>
              <BreadCrumb
                PropertyEnquiryPageActive={true}
                backToAllPropertiesPage={backToAllPropertiesPage}
              />
              <section className="add-property-wrapper mb-4">
                <div className="container-fluid">
                  <h3 className="text-center fw-bold ">Enquiries</h3>

                  <div className="row justify-content-between align-items-center">
                    <div className="col-md-6 col-12 d-flex  mb-md-0 mb-3">
                      <div className="text-start "><span className="fw-bold me-1">Property Number:</span> {selectedPropertyNumberForEnquiry}</div>
                      <div className="text-end ms-5"><span className="fw-bold me-1">Property Type:</span> {selectedPropertyTypeForEnquiry}</div>
                    </div>

                    {/* search filter for property search */}
                    <div className="col-md-6 d-flex justify-content-end">
                      <div className="col-lg-6 me-4">
                        <input
                          type="search"
                          className="form-control "
                          placeholder="Search"
                          // value={searchTerm}
                          onChange={onEnquirySearchInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <div className="row justify-content-center">

                    <div className="col-xl-12">
                      {/* <div
                        className={`${mainPageLoading ? "" : "d-none"
                          } d-flex align-items-center justify-content-center`}
                        style={{ minHeight: "75vh" }}
                      >
                        <CommonSpinner
                          spinnerColor="primary"
                          height="5rem"
                          width="5rem"
                          spinnerType="grow"
                        />
                      </div> */}
                      {mainPageLoading ? (
                        <>
                          <CommonSpinner
                            spinnerColor="primary"
                            height="4rem"
                            width="4rem"
                            spinnerType="grow"
                          />
                        </>
                      ) : enquiryList.length < 1 ? (
                        <h4 className="text-center fw-bold custom-heading-color mt-4">
                          No Enquiries Found !
                        </h4>
                      ) : (
                        <>
                          <div className="enquiry-list-table-wrapper">
                            <table className="table table-striped table-bordered text-center">
                              <thead>
                                <tr>
                                  <th scope="col">#</th>
                                  {/* <th scope="col">Property Number</th>
                                  <th scope="col">Type</th> */}
                                  <th scope="col">User Name</th>
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
                                {enquiryList && enquiryList.map((enquiry, Index) => {
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
                                      {/* <td>{property_number}</td> */}
                                      {/* <td>{property_type}</td> */}
                                      <td className="text-capitalize">{user_name}</td>
                                      <td>{transformDateFormat(added_date)} </td>
                                      <td>
                                        <button
                                          onClick={() => {
                                            onViewEnquiryClick(enquiry_id);
                                            setChatPersonOrBankName(enquiry_id, isBank);
                                          }}
                                          className="btn btn-primary"
                                          data-bs-toggle="modal"
                                          data-bs-target="#enquiryChatModal"
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
                </div>
              </section>
            </>
          </div>
        </div>
      </div>
      {/* Modal */}
      <div
        className="modal fade"
        id="confirmDeletePropertyModal"
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
                htmlFor="confirm-delete-property-input"
                className="form-label"
              >
                Type <span className="fw-bold">Delete</span> to confirm.
              </label>
              <input
                onChange={(e) => {
                  if (e.target.value === "Delete") {
                    setConfirmDeletePropertyBtnDisabled(false);
                  } else {
                    setConfirmDeletePropertyBtnDisabled(true);
                  }
                }}
                ref={confirmDeletePropertyInputRef}
                type="text"
                name="confirm-delete-property-id"
                id="confirm-delete-property-input"
                className="form-control"
              />
              <button
                onClick={() => {
                  deleteProperty(selectedPropertyId);
                }}
                data-bs-dismiss="modal"
                disabled={confirmDeletePropertyBtnDisabled}
                className="btn btn-danger w-100 mt-3 fw-bold"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*enquiry chat modal */}
      <div
        className="modal fade"
        id="enquiryChatModal"
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
    </Layout>
  );
};

export default ViewEditDeleteProperties;
