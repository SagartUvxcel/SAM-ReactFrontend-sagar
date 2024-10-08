import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  checkLoginSession,
  rootTitle,
  transformDateFormat,
  propertyDateFormat
} from "../../CommonFunctions";
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import BreadCrumb from "../BreadCrumb";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import ViewProperty from "./ViewProperty";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toggleClassOfNextPrevPageItems } from "../../CommonFunctions";
import { v4 as uuid } from "uuid";
import convertCurrency from "../../components/1.CommonLayout/currencyConverter";
import { propertyMaxArea, propertyMaxPrices, propertyMinArea, propertyMinPrices } from "../../components/1.CommonLayout/propertyCommonDetails"


let authHeader = "";
let bank_Id = "";
let roleId = "";
let branch_Id = "";
let propertiesPerPage = 4;
let initial_batch_number = 1;
let isBank = false;

const ViewEditDeleteProperties = () => {

  const navigate = useNavigate();
  const moreFiltersForm = useRef();
  const paginationRef = useRef();
  const confirmDeletePropertyInputRef = useRef();
  const allPropertiesPageRef = useRef();
  const viewCurrentPropertyRef = useRef();
  const editPropertyRef = useRef();
  const enquiriesPageRef = useRef();
  const modalBodyRef = useRef(null);
  const notSoldCheckRef = useRef();

  const data = JSON.parse(localStorage.getItem("data"));
  if (data) {
    authHeader = { Authorization: data.loginToken };
    isBank = data.isBank;
    roleId = data.roleId;
    bank_Id = data.bank_id;
    branch_Id = data.branch_Id;
  }
  const updatedCountry = localStorage.getItem("location");
  const countryId = updatedCountry === "india" ? 1 : 11;
  const [webSocketUrl, setWebSocketUrl] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState([]);
  const [propertyDocumentsList, setPropertyDocumentsList] = useState([]);
  const [propertyImagesList, setPropertyImagesList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [messages, setMessages] = useState(null);


  // useStates for delete functionalities
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [totalPropertyCount, setTotalPropertyCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [storedDataToPost, setStoredDataToPost] = useState({});
  const [confirmDeletePropertyBtnDisabled, setConfirmDeletePropertyBtnDisabled] = useState(true);
  const [batch_size, setBatch_size] = useState(4);
  const [searchFields, setSearchFields] = useState({
    states: "",
    cities: "",
    assetCategory: "",
    banks: "",
  });
  const { states, assetCategory, cities, banks } = searchFields;
  const [dataToPost, setDataToPost] = useState([]);
  const [searchBtnDisabled, setSearchBtnDisabled] = useState(true);

  useEffect(() => {
    if (dataToPost && Object.keys(dataToPost).length > 0) {
      setSearchBtnDisabled(false);
    } else {
      setSearchBtnDisabled(true);
    }
  }, [dataToPost]);

  // It will fetch all states, banks, assets from api and will map those values to respective select fields.
  const getSearchDetails = async () => {
    let apis = {
      stateAPI: `/sam/v1/property/by-state`,
      bankAPI: `/sam/v1/property/by-bank`,
      categoryAPI: `/sam/v1/property/by-category`,
    };

    const postData = { "country_id": countryId }
    try {
      // Get all states from api. 
      const allStates = await axios.post(apis.stateAPI, postData);
      // Get all banks from api.
      const allBanks = await axios.post(apis.bankAPI, postData);
      // Get all asset Categories from api.
      const assetCategories = await axios.get(apis.categoryAPI);

      // store states, banks and asset categories into searchFields useState.
      setSearchFields({
        ...searchFields,
        states: allStates.data,
        banks: allBanks.data,
        assetCategory: assetCategories.data,
      });
    } catch (error) { }
  };

  // get Properties From Api
  const getPropertiesFromApi = async () => {

    // Hide pagination while loading.
    if (paginationRef.current) {
      paginationRef.current.classList.add("d-none");
    }
    let dataToPost = {
      batch_number: initial_batch_number,
      batch_size: propertiesPerPage,
      country_id: countryId,
    };

    let postDataForPropertyCount = {
      country_id: countryId,
    };

    setStoredDataToPost(dataToPost);

    try {
      const propertiesRes = await axios.post(
        `/sam/v1/property/auth/all-properties`,
        dataToPost,
        { headers: authHeader }
      );
      if (propertiesRes.data !== null && propertiesRes.data.length > 0) {
        paginationRef.current.classList.remove("d-none");
        setProperties(propertiesRes.data);
      } else {
        paginationRef.current.classList.add("d-none");
      }
      const propertyCountRes = await axios.post(
        `/sam/v1/property/auth/property-count`, postDataForPropertyCount,
        { headers: authHeader }
      );
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // get all property data
  const getPropertyData = async () => {
    setLoading(true);
    paginationRef.current.classList.add("d-none");
    window.scrollTo(0, 0);
    let dataForTotalCount = {
      ...dataToPost,
      batch_size: 1000,
      batch_number: 1,
      country_id: countryId,
    };
    try {
      await axios.post(`/sam/v1/property/auth/property-count`, dataForTotalCount, {
        headers: authHeader,
      }).then((res) => {
        if (res.data) {
          let totalCount = 0;
          let arr = res.data;

          arr && arr.forEach((type) => {
            totalCount += type.count;
          });
          setPageCount(Math.ceil(totalCount / batch_size));
        }
      });

      const postData = {
        ...dataToPost,
        batch_number: 1,
        batch_size: 4,
        country_id: countryId,
      }
      // Post data and get Searched result from response.
      await axios.post(`/sam/v1/property/auth/all-properties`, postData, {
        headers: authHeader,
      }).then((res) => {
        // Store Searched results into propertyData useState. 
        if (res.data !== null) {
          setProperties(res.data);
          setLoading(false);
          paginationRef.current.classList.remove("d-none");
        } else {
          paginationRef.current.classList.add("d-none");
          setLoading(false);
          setProperties(null);
        }
      });
    } catch (error) {
      toast.error("Internal server error");
      setLoading(false);
    }
  };


  // This function will run on change of input fields.
  const onFieldsChange = async (e) => {
    let apis = {
      cityAPI: `/sam/v1/property/by-city`,
      addressAPI: `/sam/v1/property/by-address`,
    };
    const { name, value } = e.target;
    if (name === "states") {
      // Store state id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, state_id: parseInt(value) });
      } else {
        delete dataToPost.state_id;
        delete dataToPost.city_id;
        setDataToPost({ ...dataToPost });
      }
      // If input is state then post selected state id to api for getting cities based on selected state.
      const cityByState = await axios.post(apis.cityAPI, {
        state_id: parseInt(value),
      });
      // Store cities data into searchField useState.
      setSearchFields({ ...searchFields, cities: cityByState.data });
    } else if (name === "cities") {
      // Store city id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, city_id: parseInt(value) });
      } else {
        delete dataToPost.city_id;
      }
    } else if (name === "asset") {
      // Store asset type id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, type_id: parseInt(value) });
      } else {
        delete dataToPost.type_id;
        setDataToPost({ ...dataToPost });
      }
    } else if (name === "bank") {
      // Store bank id ( if available ) into dataToPost useState (It is required for search functionality).
      if (value) {
        setDataToPost({ ...dataToPost, bank_id: parseInt(value) });
      } else {
        delete dataToPost.bank_id;
        setDataToPost({ ...dataToPost });
      }
    }
  };

  const minPrice = "100000";
  const minArea = "100";

  const [filtersCount, setFiltersCount] = useState(0);
  const [priceFilterSelected, setPriceFilterSelected] = useState(false);
  const [areaFilterSelected, setAreaFilterSelected] = useState(false);
  const [titleClearFilterSelected, setTitleClearFilterSelected] =
    useState(false);
  const [ageFilterSelected, setAgeFilterSelected] = useState(false);
  const [territoryFilterSelected, setTerritoryFilterSelected] = useState(false);
  const [latestAddedFilterSelected, setLatestAddedFilterSelected] = useState(false);

  // manage More Filters Count
  const manageMoreFiltersCount = (filterName) => {
    if (filterName) {
      setFiltersCount(filtersCount + 1);
    } else {
      setFiltersCount(filtersCount === 0 ? 0 : filtersCount - 1);
    }
  };

  let moreFiltersKeys = [
    "min_price",
    "max_price",
    "min_area",
    "max_area",
    "age",
    "title_clear_property",
    "territory",
    "latest_added_properties",
  ];

  // reset filter btn function
  const resetFilters = () => {
    moreFiltersForm.current.reset();
    moreFiltersKeys.forEach((key) => {
      delete dataToPost[key];
    });
    setPriceFilterSelected(false);
    setAgeFilterSelected(false);
    setTerritoryFilterSelected(false);
    setAreaFilterSelected(false);
    setTitleClearFilterSelected(false);
    setLatestAddedFilterSelected(false);
    setFiltersCount(0);
    getPropertyData();
  };


  useEffect(() => {
    manageMoreFiltersCount(priceFilterSelected);
    // eslint-disable-next-line
  }, [priceFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(areaFilterSelected);
    // eslint-disable-next-line
  }, [areaFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(titleClearFilterSelected);
    // eslint-disable-next-line
  }, [titleClearFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(ageFilterSelected);
    // eslint-disable-next-line
  }, [ageFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(territoryFilterSelected);
    // eslint-disable-next-line
  }, [territoryFilterSelected]);

  useEffect(() => {
    manageMoreFiltersCount(latestAddedFilterSelected);
    // eslint-disable-next-line
  }, [latestAddedFilterSelected]);
  // on more filter input change
  const onMoreFiltersInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "min_price") {
      if (value) {
        setPriceFilterSelected(true);
        let allOptions = document.querySelectorAll(".max-price-options");
        allOptions.forEach((option) => {
          if (parseInt(value) >= parseInt(option.value)) {
            option.setAttribute("disabled", true);
            option.nextElementSibling.selected = true;
            setDataToPost({
              ...dataToPost,
              [name]: value,
              max_price: option.nextElementSibling.value,
            });
          } else {
            option.removeAttribute("disabled");
          }
        });
      } else {
        delete dataToPost.min_price;
        delete dataToPost.max_price;
        setDataToPost({ ...dataToPost });
        setPriceFilterSelected(false);
        let allOptions = document.querySelectorAll(".max-price-options");
        allOptions.forEach((option) => {
          option.removeAttribute("disabled");
          if (!option.value) {
            option.selected = true;
          }
        });
      }
    } else if (name === "max_price") {
      if (value) {
        setPriceFilterSelected(true);
        if (dataToPost.min_price) {
          setDataToPost({ ...dataToPost, [name]: value });
        } else {
          setDataToPost({ ...dataToPost, [name]: value, min_price: minPrice });
        }
      } else {
        delete dataToPost.min_price;
        delete dataToPost.max_price;
        setDataToPost({ ...dataToPost });
        setPriceFilterSelected(false);
        let allOptions = document.querySelectorAll(".min-price-options");
        allOptions.forEach((option) => {
          if (!option.value) {
            option.selected = true;
          }
        });
        let allOptions2 = document.querySelectorAll(".max-price-options");
        allOptions2.forEach((option) => {
          option.removeAttribute("disabled");
        });
      }
    } else if (name === "min_area") {
      if (value) {
        setAreaFilterSelected(true);
        let allOptions = document.querySelectorAll(".max-carpet-area-options");
        allOptions.forEach((option) => {
          if (parseInt(value) >= parseInt(option.value)) {
            option.setAttribute("disabled", true);
            option.nextElementSibling.selected = true;
            setDataToPost({
              ...dataToPost,
              [name]: value,
              max_area: option.nextElementSibling.value,
            });
          } else {
            option.removeAttribute("disabled");
          }
        });
      } else {
        let allOptions = document.querySelectorAll(".max-carpet-area-options");
        allOptions.forEach((option) => {
          option.removeAttribute("disabled");
          if (!option.value) {
            option.selected = true;
          }
        });
        delete dataToPost.min_area;
        delete dataToPost.max_area;
        setDataToPost({ ...dataToPost });
        setAreaFilterSelected(false);
      }
    } else if (name === "max_area") {
      if (value) {
        setAreaFilterSelected(true);
        if (dataToPost.min_area) {
          setDataToPost({ ...dataToPost, [name]: value });
        } else {
          setDataToPost({ ...dataToPost, [name]: value, min_area: minArea });
        }
      } else {
        delete dataToPost.min_area;
        delete dataToPost.max_area;
        setDataToPost({ ...dataToPost });
        setAreaFilterSelected(false);
        let allOptions = document.querySelectorAll(".min-carpet-area-options");
        allOptions.forEach((option) => {
          if (!option.value) {
            option.selected = true;
          }
        });
        let allOptions2 = document.querySelectorAll(".max-carpet-area-options");
        allOptions2.forEach((option) => {
          option.removeAttribute("disabled");
        });
      }
    } else if (name === "age") {
      if (value) {
        setAgeFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: parseInt(value) });
      } else {
        delete dataToPost.age;
        setDataToPost({ ...dataToPost });
        setAgeFilterSelected(false);
      }
    } else if (name === "title_clear_property") {
      if (value) {
        setTitleClearFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: value });
      } else {
        delete dataToPost.title_clear_property;
        setDataToPost({ ...dataToPost });
        setTitleClearFilterSelected(false);
      }
    } else if (name === "territory") {
      if (value) {
        setTerritoryFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: value });
      } else {
        delete dataToPost.territory;
        setDataToPost({ ...dataToPost });
        setTerritoryFilterSelected(false);
      }
    } else if (name === "latest_added_properties") {
      if (value) {
        setLatestAddedFilterSelected(true);
        setDataToPost({ ...dataToPost, [name]: parseInt(value) });
      } else {
        delete dataToPost.latest_added_properties;
        setDataToPost({ ...dataToPost });
        setLatestAddedFilterSelected(false);
      }
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
      country_id: countryId,
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
    setPropertyDocumentsList([])
    setPropertyImagesList([])
    const propertyDocsListResData = await axios.get(
      `/sam/v1/property/auth/property_document_list/${id}`,
      { headers: authHeader }
    );
    let propertyDocsListRes = propertyDocsListResData.data;
    setPropertyDocumentsList(propertyDocsListRes);
    setViewSinglePropertyPageLoading(false);
    if (propertyDocsListRes !== null) {
      let filteredImages = propertyDocsListRes.filter((data) => data.category_id === 16)
      if (filteredImages !== null) {
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
          setPropertyImagesList(results)
        }
      }
    }
    setViewSinglePropertyPageLoading(false);
  };
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
  const [imageUrls, setImageUrls] = useState({});
  const [imageUrlsLoading, setImageUrlsLoading] = useState(false);

  // fetch Image Urls
  useEffect(() => {
    const fetchImageUrls = async () => {
      setImageUrlsLoading(true);
      const urls = {};
      for (const property of properties) {
        const { default_image_id, property_id } = property;
        if (default_image_id && default_image_id.Int64 !== 0) {
          const url = await getDefaultImageUrl(default_image_id.Int64, property_id);
          urls[property_id] = url;
        }
      }
      setImageUrls(urls);
      setImageUrlsLoading(false);
    };
    if (properties !== null) {
      fetchImageUrls();
    }

    // eslint-disable-next-line
  }, [properties]);

  // get Default ImageUrl
  const getDefaultImageUrl = async (documentId, propertyId) => {
    const defaultImageDetails = await getChunksOfImages(documentId, propertyId);
    return defaultImageDetails?.srcOfFile
  }

  // get Chunks Of Images
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
          headers: authHeader,
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

  // back ToAll Properties Page button
  const backToAllPropertiesPage = async () => {
    const sendingData = {
      ...storedDataToPost,
      country_id: countryId,
    }
    const propertiesRes = await axios.post(
      `/sam/v1/property/auth/all-properties`,
      sendingData,
      { headers: authHeader }
    );
    setProperties(propertiesRes.data);
    setPropertiesLinkDisabled(false);
    viewCurrentPropertyRef.current.classList.add("d-none");
    enquiriesPageRef.current.classList.add("d-none");
    editPropertyRef.current.classList.add("d-none");
    allPropertiesPageRef.current.classList.remove("d-none");
  };

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
    territory,
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

  const [enquiryList, setEnquiryList] = useState([]);
  const [activeBank, setActiveBank] = useState({});
  const [mainPageLoading, setMainPageLoading] = useState(false);
  const [selectedPropertyNumberForEnquiry, setSelectedPropertyNumberForEnquiry] = useState(null);
  const [selectedPropertyTypeForEnquiry, setSelectedPropertyTypeForEnquiry] = useState(null);
  const [sortOptionText, setSortOptionText] = useState("up");
  const [socket, setSocket] = useState(null);
  const [chatPageLoading, setChatPageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [propertyId, setPropertyId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(null);
  const [chatWith, setChatWith] = useState("");
  const [tempEnquiryList, setTempEnquiryList] = useState([]);
  const [newComingMessage, setNewComingMessage] = useState(null);
  const [isMoreMassage, setIsMoreMassage] = useState(false);
  const [currentChatMassageSize, setCurrentChatMassageSize] = useState(25);
  const [currentMassageBatch, setCurrentMassageBatch] = useState(1);

  const [sendReplyBtnLoading, setSendReplyBtnLoading] = useState(false);


  const [viewSinglePropertyPageLoading, setViewSinglePropertyPageLoading] =
    useState(false);

  // common Function To Save Form Data
  const commonFnToSaveFormData = (name, value) => {
    setFormData((oldData) => ({ ...oldData, [name]: value }));
  };

  // handle Focus
  const handleFocus = (e) => {
    e.target.nextSibling.classList.add('active');
  };

  // on input blur
  const onInputBlur = async (e) => {
    const { value } = e.target;
    if (!value) {
      e.target.nextSibling.classList.remove('active');
    }
  }

  // handle Click
  const handleClick = (inputId) => {
    const input = document.getElementById(inputId);
    input.focus();
  };

  // on Input Change
  const onInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "bank") {
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
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Owner / Customer consent",
        });
      } else if (value === "0") {
        setFormData({
          ...formData,
          [name]: parseInt(value),
          possession_of_the_property: "Legally attached",
        });
      } else {
      }
    }
  };

  // onFormSubmit
  const onFormSubmit = async (e) => {
    e.preventDefault();
    setUpdateBtnLoading(true);
    try {
      const { data } = await axios.post(`/sam/v1/property/auth/update-property`, formData, {
        headers: authHeader,
      })
      if (data.status === 0) {
        toast.success("Property updated successfully");
        setUpdateBtnLoading(false);
        window.scrollTo(0, 0);
      } else {
        toast.error("Internal server error");
        setUpdateBtnLoading(false);
      }
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
    if (propertyId) {
      // Get current property values
      const currentPropertyRes = await axios.get(
        `/sam/v1/property/single-property/${propertyId}`,
        { headers: authHeader }
      );
      const currentPropertyData = currentPropertyRes.data;
      const {
        type_id,
        completion_date,
        purchase_date,
        mortgage_date,
        ready_reckoner_price,
        expected_price,
        building_name,
        landmark,
        flat_no,
        plot_no,
        carpet_area,
        property_number,
        society_name,
        locality,
        zip,
        is_sold,
        is_available_for_sale,
        status,
        is_stressed,
        state_id,
        city_id,
        bank_id,
        territory,
        possession_of_the_property,
        title_clear_property,
        distress_value,
        bank_branch_id,
        branch_name,
      } = currentPropertyData;
      setOtherValuesToShow(currentPropertyRes.data);

      if (currentPropertyData) {
        setFormData({
          ...formData,
          property_id: currentPropertyData.property_id,
          type_id: parseInt(type_id),
          bank_branch_id: parseInt(bank_branch_id),
          branch_name: branch_name,
          property_number: property_number,
          is_stressed: parseInt(is_stressed),
          is_available_for_sale: parseInt(is_available_for_sale),
          sale_availability_date: "2005-12-26 23:50:30",
          saleable_area: currentPropertyData.saleable_area,
          carpet_area: carpet_area,
          ready_reckoner_price: parseInt(ready_reckoner_price),
          expected_price: parseInt(expected_price),
          market_price: parseInt(currentPropertyData.market_price),
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
            city: String(city_id),
            zip: parseInt(zip),
            state: String(state_id),
          },
        });
      }
      // Get details from api. 
      const postData = { "country_id": countryId }
      const bankRes = await axios.post(`/sam/v1/property/by-bank`, postData);
      let bankData = bankRes.data
      const activeBankDetails = bankData.filter(bank => bank.bank_id === (bank_Id ? bank_Id : parseInt(bank_id)))[0]
      setActiveBank(activeBankDetails);

      allPropertiesPageRef.current.classList.add("d-none");
      editPropertyRef.current.classList.remove("d-none");
      setPropertiesLinkDisabled(true);

      setAllDefaultValues(
        bank_id,
        is_sold,
        is_available_for_sale,
        title_clear_property,
        bank_branch_id
      );

      if (branch_Id === 0) {
        branch_Id = parseInt(bank_branch_id);
      }

      if (isBank) {
        getBankDetails(bankRes.data);
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
    if (propertyId) {
      allPropertiesPageRef.current.classList.add("d-none");
      enquiriesPageRef.current.classList.remove("d-none");
      try {
        // Get details from api.
        const EnquiryRes = await axios.get(`/sam/v1/property/auth/property-enquiries/${propertyId}`, {
          headers: authHeader,
        })
        const dataValue = EnquiryRes.data;
        setEnquiryList(dataValue);
        setTempEnquiryList(dataValue);
        setMainPageLoading(false);
      } catch (error) {
        setMainPageLoading(false);
      }
    }
  };

  // get Bank Details form API
  const getBankDetails = async (bankData) => {
    const activeBankDetails = bankData.filter(bank => bank.bank_id === bank_Id)[0]
    setActiveBank(activeBankDetails);
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
    }
    setMainPageLoading(false);
  };

  // on click View Enquiry
  const onViewEnquiryClick = async (id) => {
    if (socket === null) {
      connectToWebSocket();
    }
    const dataToPost = {
      "batch_size": currentChatMassageSize,
      "batch_number": currentMassageBatch,
      "enquiry_id": id
    }
    try {
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
    let enquiry_source = "email"
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
              messages_id: String(uuid()),
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

  //on click view more button in modal fetch More Chat Message
  const fetchMoreChatMessage = async () => {

    setChatPageLoading(true);
    try {
      const dataToPost = {
        "batch_size": currentChatMassageSize,
        "batch_number": currentMassageBatch,
        "enquiry_id": enquiryId,
        "country_id": countryId
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

  // get Websocket Url
  const getWebsocketUrl = async () => {
    try {
      const { data } = await axios.get("/sam/v1/customer-registration/ws-backend-url");
      setWebSocketUrl(data.key);
    } catch (error) {
      toast.error("WebSocket connection failed.")
    }
  };

  //connect To WebSocket
  const connectToWebSocket = () => {
    console.log(webSocketUrl);
    const newSocket = new WebSocket(webSocketUrl);
    setSocket(newSocket);
  };
  useEffect(() => {
    rootTitle.textContent = "ADMIN - PROPERTIES";
    setCurrentChatMassageSize(25);
    getSearchDetails();
    setBatch_size(4);
    getWebsocketUrl();
    if (data) {
      setLoading(true);
      checkLoginSession(data.loginToken).then((res) => {
        if (res === "Valid") {
          getPropertiesFromApi();
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // on click view more chat if currentMassage batch change
  useEffect(() => {
    if (currentMassageBatch) {
      fetchMoreChatMessage();
    }
    // eslint-disable-next-line
  }, [currentMassageBatch])

  // Scroll to the latest message whenever messages are updated
  useEffect(() => {
    if (messages && (newComingMessage || messages.length === currentChatMassageSize) && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
    return (() => setNewComingMessage(null))

    // eslint-disable-next-line
  }, [messages]);

  // WebSocket connection
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
            setNewComingMessage({ ...receivedMessage });
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
            {/* breadCrumb and back button */}
            <div className="row justify-content-between align-items-center mb-md-0 mb-2">
              <div className="col-md-6">
                <BreadCrumb />
              </div>
              {/* /back button */}
              <div className="col-md-6 text-end">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => { navigate(`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"}`) }}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>

            </div>
            {/* for desktop screen search bar */}
            <div
              className="row extra-filters-row filter-fullWindow justify-content-center align-items-center py-3 "
            >
              {/* State */}
              <div className="col-md-2 col-12 mt-3 mt-md-0">
                <select
                  name="states"
                  id="states"
                  className="form-select"
                  aria-label=".form-select-sm example"
                  onChange={onFieldsChange}
                  value={dataToPost && dataToPost.state_id}
                >
                  <option value="">State</option>
                  {states ? (
                    states.map((state, Index) => {
                      let optionToSelectByDefault = document.getElementById(
                        `stateFilter1-${state.state_id}`
                      );
                      if (dataToPost && dataToPost.state_id && optionToSelectByDefault) {
                        if (dataToPost.state_id === state.state_id) {
                          optionToSelectByDefault.selected = true;
                        }
                      }
                      return (
                        <option
                          id={`stateFilter1-${state.state_id}`}
                          key={Index}
                          value={state.state_id}
                        >
                          {state.state_name}
                        </option>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </select>
              </div>
              {/* City */}
              <div className="col-md-2 col-12 mt-3 mt-md-0">
                <select
                  name="cities"
                  id="cities"
                  className="form-select"
                  aria-label=".form-select-sm example"
                  onChange={onFieldsChange}
                  value={dataToPost && dataToPost.city_id}
                >
                  <option value="">City</option>
                  {cities
                    ? cities.map((city, Index) => {
                      let optionToSelectByDefault = document.getElementById(
                        `cityFilter1-${city.city_id}`
                      );
                      if (dataToPost.city_id && optionToSelectByDefault) {
                        if (dataToPost.city_id === city.city_id) {
                          optionToSelectByDefault.selected = true;
                        }
                      }
                      return (
                        <option
                          id={`cityFilter1-${city.city_id}`}
                          key={Index}
                          value={city.city_id}
                        >
                          {city.city_name}
                        </option>
                      );
                    })
                    : ""}
                </select>
              </div>
              {/* Category */}
              <div className="col-md-2 col-12 mt-3 mt-md-0">
                <select
                  name="asset"
                  id="asset"
                  className="form-select"
                  aria-label=".form-select-sm example"
                  onChange={onFieldsChange}
                  value={dataToPost && dataToPost.type_id}
                >
                  <option value="">Category</option>
                  {assetCategory
                    ? assetCategory.map((category, Index) => {
                      let optionToSelectByDefault = document.getElementById(
                        `categoryFilter1-${category.type_id}`
                      );
                      if (dataToPost.type_id && optionToSelectByDefault) {
                        if (dataToPost.type_id === category.type_id) {
                          optionToSelectByDefault.selected = true;
                        }
                      }
                      return (
                        <option
                          id={`categoryFilter1-${category.type_id}`}
                          key={Index}
                          value={category.type_id}
                        >
                          {category.type_name}
                        </option>
                      );
                    })
                    : ""}
                </select>
              </div>
              {/* Bank */}
              <div className="col-md-2 col-12 mt-3 mt-md-0">
                <select
                  name="bank"
                  id="bank"
                  className="form-select"
                  aria-label=".form-select-sm example"
                  onChange={onFieldsChange}
                  disabled={bank_Id !== 0}
                  value={dataToPost && bank_Id !== 0 ? bank_Id : dataToPost.bank_id}

                >
                  <option value="">Bank</option>
                  {banks
                    ? banks.map((bank, index) => {
                      return (
                        <option key={index} value={bank_Id !== 0 ? bank_Id : bank.bank_id}>
                          {bank.bank_name}
                        </option>
                      );
                    })
                    : ""}

                </select>
              </div>
              {/* More Filters */}
              <div className="col-md-2 col-12 mt-3 mt-md-0">
                <div className="dropdown">
                  <div
                    className="form-select"
                    data-bs-toggle="dropdown"
                    id="dropdownMenuButton2"
                    aria-expanded="true"
                  >
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
                      <span className="me-2 badge bg-dark">
                        {filtersCount}
                      </span>
                      More Filters
                    </div>
                  </div>
                  <ul
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="dropdown-menu more-filters-dropdown-menu shadow  mt-md-0 pt-md-0 mt-5 pt-5" style={{ transform: 'translate3d(0px, 14px, 0px)' }}
                    aria-labelledby="dropdownMenuButton2"
                  >
                    <div className="container-fluid p-3">
                      <form className="row"
                        ref={moreFiltersForm}
                      >
                        {/* Price */}
                        <div className="col-12">
                          <label
                            htmlFor=""
                            className="form-label common-btn-font"
                          >
                            Price ({countryId === 11 ? "RM" : <i className="bi bi-currency-rupee"></i>})
                          </label>
                        </div>
                        {/* min_Price */}
                        <div className="col-md-6 mb-3">
                          <select
                            id="min_price"
                            name="min_price"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.min_price}
                          >
                            <option className="min-price-options" value="">
                              Min
                            </option>
                            {propertyMinPrices.map((price, Index) => {
                              return (
                                <option
                                  className="min-price-options"
                                  value={price}
                                  key={Index}
                                >
                                  {countryId === 11 ? <>{convertCurrency(parseInt(price), "Malaysia", "RM", 0.0564)}<small className="text-muted fs-6"> RM </small></> : `${price}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* max_Price */}
                        <div className="col-md-6 mb-3">
                          <select
                            id="max_price"
                            name="max_price"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.max_price}
                          >
                            <option className="max-price-options" value="">
                              Max
                            </option>
                            {propertyMaxPrices.map((price, Index) => {
                              return (
                                <option
                                  className="max-price-options"
                                  value={price}
                                  key={Index}
                                >
                                  {countryId === 11 ? <>{convertCurrency(parseInt(price), "Malaysia", "RM", 0.0564)}<small className="text-muted fs-6"> RM </small></> : `${price}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* hr */}
                        <div className="col-12">
                          <hr />
                        </div>
                        {/* Title clear property */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="title_clear_property"
                            className="form-label common-btn-font"
                          >
                            Title clear property
                          </label>
                          <select
                            id="title_clear_property"
                            name="title_clear_property"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.title_clear_property}
                          >
                            <option value=""></option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        {/* Territory */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="territory"
                            className="form-label common-btn-font"
                          >
                            Territory
                          </label>
                          <select
                            id="territory"
                            name="territory"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}

                            value={dataToPost && dataToPost.territory}
                          >
                            <option value=""></option>
                            <option value="gram panchayat limit">
                              Gram Panchayat Limit
                            </option>
                            <option value="corporate">Corporate limit</option>
                          </select>
                        </div>
                        {/* hr */}
                        <div className="col-12">
                          <hr />
                        </div>
                        {/* Carpet Area */}
                        <div className="col-12">
                          <label
                            htmlFor=""
                            className="form-label common-btn-font"
                          >
                            Carpet Area ( sqft )
                          </label>
                        </div>
                        {/* min_area */}
                        <div className="col-md-6 mb-3">
                          <select
                            id="min_area"
                            name="min_area"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.min_area}
                          >
                            <option className="min-carpet-area-options" value="">
                              Min
                            </option>
                            {propertyMinArea.map((area, Index) => {
                              return (
                                <option
                                  className="min-carpet-area-options"
                                  value={area}
                                  key={Index}
                                >
                                  {area}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* max_area */}
                        <div className="col-md-6 mb-3">
                          <select
                            id="max_area"
                            name="max_area"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.max_area}
                          >
                            <option className="max-carpet-area-options" value="">
                              Max
                            </option>
                            {propertyMaxArea.map((area, Index) => {
                              return (
                                <option
                                  className="max-carpet-area-options"
                                  value={area}
                                  key={Index}
                                >
                                  {area}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* hr */}
                        <div className="col-12">
                          <hr />
                        </div>
                        {/* Age of Property */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor=""
                            className="form-label common-btn-font"
                          >
                            Age of Property
                          </label>
                          <select
                            id="age"
                            name="age"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.age}
                          >
                            <option value=""></option>
                            <option value="1">Less than 1 year</option>
                            <option value="3">Less than 3 years</option>
                            <option value="5">Less than 5 years</option>
                            <option value="10">Less than 10 years</option>
                          </select>
                        </div>
                        {/* Last 10 days added property */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="latest_added_properties"
                            className="form-label common-btn-font"
                          >
                            Latest added properties
                          </label>

                          <select
                            id="latest_added_properties"
                            name="latest_added_properties"
                            className="form-select form-select-sm"
                            aria-label=".form-select-sm example"
                            onChange={onMoreFiltersInputChange}
                            value={dataToPost && dataToPost.latest_added_properties}
                          >
                            <option value=""></option>
                            <option value="10">Last 10 days</option>
                            <option value="20">Last 20 days</option>
                          </select>
                        </div>
                      </form>
                    </div>
                  </ul>
                </div>
              </div>
              {/* searchBtn */}
              <div className="col-md-1 col-12 my-3 my-md-0">
                <button
                  onClick={() => {
                    getPropertyData();
                  }}
                  disabled={searchBtnDisabled}
                  className="btn w-100 btn-primary text-center"
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
              {/* Reset More Filters */}
              <div
                className={`col-12 text-center mt-md-3 ${filtersCount > 0 ? "" : "d-none"
                  }`}
              >
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary text-center"
                >
                  Reset More Filters
                </button>
              </div>
            </div>
            {/* all property section  */}
            <>
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
              ) : properties === null || properties.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center mt-5">
                  <h3 className="fw-bold custom-heading-color">
                    No Properties Found !
                  </h3>
                </div>
              ) : (
                <>
                  {/* all property section */}
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
                            default_image_id: { Int64: imageDocId, Valid: isImageDocIdValid },
                          } = property;
                          return (
                            <div className="col-xl-3 col-md-6" key={Index}>
                              <div className="admin-property-card-wrapper">
                                <div className="card mb-4">
                                  <div className="top-line"></div>
                                  <img
                                    className="card-img-top admin-property-image"
                                    src={imageDocId && imageDocId !== 0 && isImageDocIdValid ? `${!imageUrlsLoading ? imageUrls[property_id] : "/images2.jpg"}` : "/images2.jpg"}
                                    alt=""
                                  />
                                  <div className="card-body">
                                    {/* category */}
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
                                    {/* city_name */}
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
                                    {/* market_value */}
                                    {market_value ? (
                                      <div className="text-capitalize">
                                        <span>Market Price: </span>
                                        <span className="common-btn-font">
                                          {updatedCountry && updatedCountry === "malaysia" ? <>{convertCurrency(parseInt(market_value), "Malaysia", "RM", 0.0564)
                                          } <small className="text-muted">RM </small></> : <>
                                            <i className="bi bi-currency-rupee"></i>
                                            {parseInt(market_value) >= 10000000 ? `${(parseInt(market_value) / 10000000).toFixed(2)}` : `${(parseInt(market_value) / 100000).toFixed(1)}`}
                                            <small className="text-muted">{parseInt(market_value) >= 10000000 ? " Cr." : " Lac"}</small></>}
                                        </span>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                    {expected_price ? (
                                      <div className="text-capitalize">
                                        <span>Reserved Price: </span>
                                        <span className="common-btn-font">
                                          {updatedCountry && updatedCountry === "malaysia" ? <>{convertCurrency(parseInt(expected_price), "Malaysia", "RM", 0.0564)
                                          } <small className="text-muted">RM </small></> : <>
                                            <i className="bi bi-currency-rupee"></i>
                                            {parseInt(expected_price) >= 10000000 ? `${(parseInt(expected_price) / 10000000).toFixed(2)}` : `${(parseInt(expected_price) / 100000).toFixed(1)}`}
                                            <small className="text-muted">{parseInt(expected_price) >= 10000000 ? " Cr." : " Lac"}</small></>}
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
                                        <i className="bi bi-eye-fill" title="View"></i>
                                      </button>
                                      {/* Current property DataToUpdate button */}
                                      <button
                                        onClick={() => {
                                          getCurrentPropertyDataToUpdate(
                                            property_id
                                          );
                                        }}
                                        className="mx-2 btn btn-sm btn-outline-primary property-button-wrapper"
                                      >
                                        <i className="bi bi-pencil-fill" title="Edit"></i>
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
                                        <i className="bi bi-trash-fill" title="Delete"></i>
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
                                          localStorage.setItem(
                                            "upload-doc-page",
                                            JSON.stringify({
                                              status: "open"
                                            })
                                          );
                                        }}
                                        to={`${isBank ? `${roleId === 6 ? "/bank" : "/branch"}` : "/admin"
                                          }/property/single-property-documents-upload`}
                                        className="btn btn-sm btn-outline-dark property-button-wrapper ms-2"
                                      >
                                        <i className="bi bi-upload" title="Upload"></i>
                                      </NavLink>
                                      {/* view current property enquiry details button */}
                                      {isBank ? <button
                                        onClick={() => {
                                          getCurrentPropertyAllEnquires(
                                            property_id, property_number, category
                                          );
                                        }}
                                        className="mx-2 btn btn-sm btn-outline-info property-button-wrapper"
                                      >
                                        <i className="bi bi-chat-text" title="Enquiry"></i>
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
                </>
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
                      {/* breadCrumb and back button */}
                      <div className="row justify-content-between align-items-center mb-2">
                        <div className="col-md-6">
                          <BreadCrumb
                            isViewPropertyPageActive={true}
                            backToAllPropertiesPage={backToAllPropertiesPage}
                          />
                        </div>
                        {/* /back button */}
                        <div className="col-md-6 text-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={backToAllPropertiesPage}
                          >
                            <i className="bi bi-arrow-left"></i> Back
                          </button>
                        </div>

                      </div>
                      <ViewProperty
                        selectedProperty={selectedProperty}
                        propertyDocumentsList={propertyDocumentsList}
                        propertyImagesList={propertyImagesList}
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

            <div className="row">
              <div className="card border-0">
                <section className="add-property-wrapper mb-4">
                  <div className="container-fluid">
                    {/* breadCrumb and back button */}
                    <div className="row justify-content-between align-items-center mb-2">
                      <div className="col-md-6">
                        <BreadCrumb
                          isUpdatePropertyPageActive={true}
                          backToAllPropertiesPage={backToAllPropertiesPage}
                        />
                      </div>
                      {/* /back button */}
                      <div className="col-md-6 text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={backToAllPropertiesPage}
                        >
                          <i className="bi bi-arrow-left"></i> Back
                        </button>
                      </div>

                    </div>
                    {/* details section */}
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
                            <h4 className="fw-bold mb-4">Update Property</h4>
                            <div className="row mb-3">
                              <div className="col-12 d-md-flex justify-content-md-start">
                                {/* Property ID */}
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                  >
                                    <span className="common-btn-font">
                                      Property ID
                                    </span>
                                    <span className="badge bg-light heading-text-primary ms-2">
                                      {property_id}
                                    </span>
                                  </button>
                                </div>
                                {/* Property Number */}
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-primary ms-md-2 mt-md-0 mt-3"
                                  >
                                    <span className="common-btn-font">
                                      Property Number
                                    </span>
                                    <span className="badge bg-light heading-text-primary ms-2">
                                      {property_number}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <hr />
                            {/* Row 1 - Basic Details */}
                            <div className="row mb-3">
                              <div className="col-12">
                                <h5 className="fw-bold heading-text-primary mb-3">
                                  Basic details
                                </h5>
                              </div>
                              <div className="col-md-6">

                                {/* Property type */}
                                {type_name ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Property type</span>{type_name}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* Bank */}
                                <div className="form-group">
                                  <p><span className="paragraph-label-text">Bank</span>
                                    {activeBank && activeBank.bank_name}
                                  </p>
                                </div>
                                {/* Branch */}
                                <div className="form-group">
                                  <p><span className="paragraph-label-text">Branch</span>{formData.branch_name}
                                  </p>
                                </div>


                              </div>
                              <div className="col-md-6">
                                {/* Title clear Property */}
                                <div className="form-group">
                                  <p><span className="paragraph-label-text"> Title clear Property</span>{formData.title_clear_property === 1 ? "Yes" : "No"}
                                  </p>
                                </div>
                                {/* territory */}
                                <div className="form-group">
                                  {territory ? (
                                    <p><span className="paragraph-label-text"> Territory</span>{territory}
                                    </p>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            </div>
                            <hr />
                            {/* Row 2 - Area Details*/}
                            <div className="row mb-3">
                              <div className="col-12">
                                <h5 className="fw-bold heading-text-primary mb-3">Area</h5>
                              </div>
                              {/* Saleable area (sq. ft.) */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  {saleable_area ? (
                                    <p><span className="paragraph-label-text">Saleable area</span>{saleable_area ? saleable_area : ""} <small className="text-muted">sqft</small></p>
                                  ) : (
                                    <></>
                                  )}

                                </div>
                              </div>
                              {/*  Carpet area (sq. ft.) */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  {carpet_area ? (
                                    <p><span className="paragraph-label-text"> Carpet area</span>{carpet_area ? carpet_area : ""} <small className="text-muted">sqft</small></p>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            </div>
                            <hr />
                            {/* Row 3 - Pricing Details */}
                            <div className="row mb-3">
                              <div className="col-12">
                                <h5 className="fw-bold heading-text-primary mb-3">Pricing</h5>
                              </div>
                              {/* Market price (Rs.) */}
                              <div className="col-xl-4 col-md-6">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    className="form-control custom-input"
                                    type="number"
                                    id="market_price"
                                    name="market_price"
                                    defaultValue={market_price}
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2 active" htmlFor="market_price" onClick={() => handleClick('market_price')} >Market price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Ready reckoner price (Rs.) */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-md-0">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    id="ready_reckoner_price"
                                    name="ready_reckoner_price"
                                    className="form-control custom-input"
                                    defaultValue={ready_reckoner_price}
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2 active" htmlFor="ready_reckoner_price" onClick={() => handleClick('ready_reckoner_price')} >Ready reckoner price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                              {/* Reserved Price (Rs.) */}
                              <div className="col-xl-4 col-md-6 mt-3 mt-xl-0">
                                <div className="form-group custom-class-form-div">
                                  <input
                                    type="number"
                                    className="form-control custom-input"
                                    id="expected_price"
                                    name="expected_price"
                                    defaultValue={expected_price}
                                    onChange={onInputChange}
                                    onBlur={onInputBlur}
                                    onFocus={handleFocus}
                                    required
                                  />
                                  <label className="px-2 active" htmlFor="expected_price" onClick={() => handleClick('expected_price')} >Reserved Price (Rs.)<span className="text-danger">*</span></label>
                                </div>
                              </div>
                            </div>
                            <hr />
                            {/* Row 4 - Dates & Availability Details */}
                            <div className="row mb-3">
                              <div className="col-12">
                                <h5 className="fw-bold heading-text-primary mb-3">
                                  Dates & Availability
                                </h5>
                              </div>
                              <div className="col-md-6">
                                {/* Completion date */}
                                {completion_date ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Completion date</span>{propertyDateFormat(completion_date)}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* Purchase date */}
                                {purchase_date ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Purchase date</span>{propertyDateFormat(purchase_date)}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                              {/* Mortgage date */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  <p><span className="paragraph-label-text">Mortgage date</span>{propertyDateFormat(mortgage_date)}</p>
                                </div>
                                {/* Available for sale? */}
                                <div className="form-group">
                                  <p><span className="paragraph-label-text">Available for sale?</span>{formData.is_available_for_sale === 1 ? "Yes" : "No"}</p>
                                </div>
                              </div>

                            </div>
                            <hr />
                            {/* Row 5 - Address Details */}
                            <div className="row mb-3">
                              <div className="col-12">
                                <h5 className="fw-bold heading-text-primary">Address</h5>
                              </div>
                              <div className="col-md-6">
                                {/* Flat No. */}
                                {flat_number ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Flat No.</span>{flat_number}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* Building Name */}
                                {building_name ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Building Name</span>{building_name}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* Society Name */}
                                {society_name ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Society Name</span>{society_name}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* Plot No. */}
                                {plot_number ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Plot No.</span>{plot_number}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* locality */}
                                {locality ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Locality</span>{locality}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                              <div className=" col-md-6 ">
                                {/* Landmark */}
                                {landmark ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Landmark</span>{landmark}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* State */}
                                {state_name ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">State</span>{state_name}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* City */}
                                {city_name ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">City</span>{city_name}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {/* zip */}
                                {zip ? (
                                  <div className="form-group">
                                    <p><span className="paragraph-label-text">Zip</span>{zip}</p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                            {/* Updating button */}
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
              </div>
            </div>
          </div>

          {/* enquiriesPageRef */}
          <div
            className="col-xl-10 col-lg-9 col-md-8 d-none"
            ref={enquiriesPageRef}
          >
            <>
              {/* breadCrumb and back button */}
              <div className="row justify-content-between align-items-center mb-2">
                <div className="col-md-6">
                  <BreadCrumb
                    PropertyEnquiryPageActive={true}
                    backToAllPropertiesPage={backToAllPropertiesPage}
                  />
                </div>
                {/* /back button */}
                <div className="col-md-6 text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={backToAllPropertiesPage}
                  >
                    <i className="bi bi-arrow-left"></i> Back
                  </button>
                </div>

              </div>

              <section className="add-property-wrapper mb-4">
                <div className="container-fluid">
                  <h3 className="text-center fw-bold ">Enquiries</h3>
                  <hr />
                  <div className="row justify-content-between align-items-center mb-4">
                    <div className="col-md-8 col-12 d-flex  mb-md-0 mb-3">
                      <div className="text-start "><span className="fw-bold me-1">Property Number:</span> {selectedPropertyNumberForEnquiry}</div>
                      <div className="text-end ms-5"><span className="fw-bold me-1">Property Type:</span> {selectedPropertyTypeForEnquiry}</div>
                    </div>

                    {/* search filter for enquiry search */}
                    <div className="col-md-4 d-flex justify-content-end">
                      <div className="search-box d-flex align-items-center position-relative w-100 me-4 ">
                        <input
                          type="search"
                          placeholder="Search"
                          className="form-control search-input custom-input"
                          onChange={onEnquirySearchInputChange}
                        />
                        <i className="fa fa-search text-secondary position-absolute "></i>
                      </div>

                    </div>
                  </div>

                  {/* <hr /> */}
                  <div className="row justify-content-center">

                    <div className="col-xl-12">
                      {mainPageLoading ? (
                        <>
                          <CommonSpinner
                            spinnerColor="primary"
                            height="4rem"
                            width="4rem"
                            spinnerType="grow"
                          />
                        </>
                      ) : !enquiryList || enquiryList.length < 1 ? (
                        <h4 className="text-center fw-bold custom-heading-color mt-4">
                          No Enquiries Found !
                        </h4>
                      ) : (
                        <>
                          <div className="enquiry-list-table-wrapper">
                            <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table  text-center ">
                              <thead className="bg-light">
                                <tr className="table-heading-class">
                                  <th scope="col">#</th>
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
                                    user_name,
                                    added_date,
                                  } = enquiry;
                                  return (
                                    <tr key={Index}>
                                      <th scope="row">{Index + 1}</th>
                                      <td className="text-capitalize">{user_name}</td>
                                      <td>{propertyDateFormat(added_date)} </td>
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
        </div >
      </div >
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
      <div div
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
            >{chatPageLoading ? <>
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
                    onChange={(e) => setNewMessage(e.target.value)}
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
      </div >
    </Layout >
  );
};

export default ViewEditDeleteProperties;
