import React, { useEffect, useState, useRef } from 'react';
import Layout from "../../components/1.CommonLayout/Layout";
import AdminSideBar from "../AdminSideBar";
import CommonSpinner from "../../CommonSpinner";
import Pagination from "../../Pagination";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios";
import {
    checkLoginSession,
} from "../../CommonFunctions";


let accountStatus = 0;
let initial_page_number = 1;
const records_per_page = 20;
let authHeader = "";
let roleId = "";

const BankBranchClosePage = ({ userType }) => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeader = { Authorization: data.loginToken };
        roleId = data.roleId;
    }
    const location = useLocation();
    const navigate = useNavigate();
    const userShiftBranchSection = useRef();
    const propertyPresentBranchSection = useRef();
    const closeBranchSection = useRef();
    const mainContainer = useRef();
    const dataForCloseBranchPage = location.state ? location.state.sensitiveData : null;
    const [branchData, setBranchData] = useState(dataForCloseBranchPage);
    const [loading, setLoading] = useState(false); 
    const [displayBranchSection, setDisplayBranchSection] = useState({
        propertyNotPresentBranchClass: "",
        propertyPresentBranchClass: "",
        closeBranchClass: "d-none",
    });
    const { propertyNotPresentBranchClass, propertyPresentBranchClass, closeBranchClass } = displayBranchSection;

    const [filteredBranchList, setFilteredBranchList] = useState([]);
    const [showNewBranchList, setShowNewBranchList] = useState(false);
    const [formData, setFormData] = useState({
        current_branch_id: branchData.branchIdDetails,
    });
    const [branchPropertyList, setBranchPropertyList] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedProperties, setSelectedProperties] = useState([]);

    // select all property button function
    const handleSelectAll = () => {
        setSelectAll(!selectAll);  
        if (!selectAll) { 
            setSelectedProperties(branchPropertyList.map(property => property.property_id));
        } else {
            setSelectedProperties([]);
        }
    };

    // select single property
    const handleSinglePropertyChange = (e) => {
        const itemId = parseInt(e.target.value, 10);
        const isSelected = selectedProperties.includes(itemId);

        if (isSelected) {
            setSelectedProperties(selectedProperties.filter(id => id !== itemId));
        } else {
            setSelectedProperties([...selectedProperties, itemId]);
        }
    };

    // get All Users data
    const getAllUsers = async (searchInput = "") => { 
        const dataToPost = {
            status: accountStatus,
            page_number: initial_page_number,
            number_of_records: records_per_page,
            bank_id: branchData.dataFromBankAdminPage,
            search_input: searchInput
        };
        try {
            await axios
                .post(`/sam/v1/bank-registration/auth/bank/user-list`, dataToPost, { headers: authHeader })
                .then((res) => {
                    const responseData = res.data;
                    // Filter bank_users array based on current branch ID
                    const filteredBankUsers = responseData.bank_users.filter(user => user.bank_user.BranchId !== branchData.branchIdDetails);

                    // Create an array containing only the filtered branch IDs
                    const filteredBranchIds = filteredBankUsers.map(user => ({
                        BranchId: user.bank_user.BranchId,
                        branch_name: user.bank_user.branch_name
                    }));
                    setFilteredBranchList(filteredBranchIds);
                    setLoading(false);
                });
        } catch (error) {
            setLoading(false);
        }
    }

    // get All Users data
    const getAllCurrentBranchProperty = async () => {
        const dataToPost = {
            batch_number: initial_page_number,
            batch_size: records_per_page,
            branch_id: branchData.branchIdDetails
        };
        try {
            await axios
                .post(`/sam/v1/property/auth/branch-property`, dataToPost, { headers: authHeader })
                .then((res) => {
                    const responseData = res.data; 
                    setBranchPropertyList(responseData)
                    setLoading(false);
                });
        } catch (error) {
            setLoading(false);
        }
    }

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

    // onInputChange
    const onInputChange = async (e) => {
        const { name, value } = e.target;
        if (name === "is_user_have_to_shift") {
            setShowNewBranchList(value === "true");
            const valueData = value === "true" ? true : value === "false" ? false : ""
            setFormData((old) => ({ ...old, [name]: valueData }))
        } else if (name === "next_branch_id") {
            setFormData((old) => ({ ...old, [name]: parseInt(value) }))
        }
    }

    // on Branch Details Form Submit
    const onBranchDetailsFormSubmit = async (e) => {
        e.preventDefault(); 
        try {
            await axios
                .post(`/sam/v1/bank-registration/auth/change-user-branch`, formData, {
                    headers: authHeader,
                })
                .then((res) => { 
                    if (res.data) {
                        setDisplayBranchSection({
                            propertyNotPresentBranchClass: "d-none",
                            propertyPresentBranchClass: "d-none",
                            closeBranchClass: "",
                        })
                        setLoading(false);
                        toast.success(`User ${showNewBranchList ? "has been shifted" : "has been deactivated"} successfully.`)
                    } else {
                        toast.error();
                    }
                });
        } catch (error) {
            toast.error("Internal server error");
        }
    }

    // on Change Branch FormSubmit
    const onChangeBranchFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToPost = {
            is_all: selectAll,
            ...formData,
            property_ids: selectedProperties
        } 
        try {
            await axios
                .post(`/sam/v1/bank-registration/auth/change-property-branch`, dataToPost, {
                    headers: authHeader,
                })
                .then((res) => { 
                    const responseData = res.data;
                    const is_more_property_status = responseData.is_more_property;
                    if (is_more_property_status === true) {
                        getAllCurrentBranchProperty();
                        setLoading(false);
                        toast.success(`Properties have been shifted successfully.`)
                    } else {
                        setBranchData({ ...branchData, is_property: is_more_property_status })
                        setDisplayBranchSection({
                            propertyNotPresentBranchClass: "",
                            propertyPresentBranchClass: "d-none",
                            closeBranchClass: "d-none",
                        })
                        toast.success(`All properties have been shifted successfully.`)
                        setLoading(false);
                    }
                });
        } catch (error) {
            console.log(error);
            toast.error("Please Select at least one property to process.")
            setLoading(false);
        }
    }
    // on Form Submit Close Branch
    const onCloseBranchFunction = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToPost = {
            current_branch_id: branchData.branchIdDetails,
        } 
        try {
            await axios
                .post(`/sam/v1/bank-registration/auth/close-branch`, dataToPost, {
                    headers: authHeader,
                })
                .then((res) => { 
                    const responseData = res.data;
                    if (responseData) {
                        // getAllCurrentBranchProperty();
                        navigate(`${roleId === 6 ? "/bank" : "/admin"}/users/branch-users`)
                        toast.success("Branch closed successfully.")
                        setLoading(false);
                    } else {

                        setLoading(false);
                    }
                });
        } catch (error) {
            console.log(error);
            toast.error("Internal server error");
            setLoading(false);
        }
    }

    useEffect(() => {
        setBranchData(dataForCloseBranchPage);
        setDisplayBranchSection(displayBranchSection);
        if (data) {
            setLoading(true);
            checkLoginSession(data.loginToken).then((res) => {
                if (res === "Valid") {
                    getAllUsers();
                    if (branchData.is_property === true) {
                        getAllCurrentBranchProperty()
                    }
                }
            });
        }


        // eslint-disable-next-line
    }, [])

    return (
        <Layout>
            <div className="container-fluid admin-users-wrapper section-padding">
                <div className="row min-100vh position-relative">
                    <AdminSideBar />
                    <div
                        className={`col-xl-10 col-lg-9 col-md-8 users-admin`}
                    >
                        {/* <BreadCrumb userType={userType} /> */}
                        <div className="my-4">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`${roleId === 6 ? "/bank" : "/admin"
                                    }/users/branch-users`)}
                            >
                                <i className="bi bi-arrow-left"></i> Back
                            </button>
                        </div>
                        <hr />
                        {loading ? (
                            <>
                                <CommonSpinner spinnerColor="primary" spinnerType="grow" />
                            </>
                        ) : (<div className='main-container' ref={mainContainer} >
                            {/* change-property-branch */}
                            {!branchData.is_property ?
                                <section className={`add-property-wrapper property-not-present-section mb-4 ${propertyNotPresentBranchClass}`} ref={userShiftBranchSection}>
                                    <div className="container-fluid">
                                        <div className="row justify-content-center">
                                            <div className="col-xl-12">
                                                <form onSubmit={onBranchDetailsFormSubmit} className="card p-xl-2">
                                                    <div className="card-body">
                                                        <h4 className="fw-bold">Branch Details</h4>
                                                        <hr />
                                                        {/* Row 1 - Basic Details */}
                                                        <div className="row mb-2">
                                                            {/* current branch Name */}
                                                            <div className="col-xl-8 mt-3">
                                                                {branchData.branchNameDetails ? (
                                                                    <div className="form-group">
                                                                        <p><span className="paragraph-label-text">Current Branch Name:</span>{branchData.branchNameDetails}</p>
                                                                    </div>
                                                                ) : (
                                                                    <></>
                                                                )}                                           </div>
                                                            {/* shift user */}
                                                            <div className="col-xl-4 col-md-6 mt-3" >
                                                                <div className="form-group custom-class-form-div">
                                                                    <select
                                                                        id="is_user_have_to_shift"
                                                                        name="is_user_have_to_shift"
                                                                        className="form-select custom-input"
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        onFocus={handleFocus}
                                                                        required
                                                                    >
                                                                        <option value=""></option>
                                                                        <option value="true">Yes</option>
                                                                        <option value="false">No</option>
                                                                    </select>
                                                                    <label className="px-2" htmlFor="is_user_have_to_shift" onClick={() => handleClick('is_user_have_to_shift')} >Do you want shift user? <span className="text-danger">*</span></label>
                                                                </div>
                                                            </div>
                                                            {/* next_branch_id */}
                                                            {showNewBranchList && (
                                                                <div className="col-xl-4 col-md-6 mt-3">
                                                                    <div className="form-group custom-class-form-div">
                                                                        <select
                                                                            id="next_branch_id"
                                                                            name="next_branch_id"
                                                                            className="form-select custom-input"
                                                                            onChange={onInputChange}
                                                                            onBlur={onInputBlur}
                                                                            onFocus={handleFocus}
                                                                            required
                                                                        >
                                                                            <option value=""></option>
                                                                            {filteredBranchList ? (
                                                                                filteredBranchList.map((data) => {
                                                                                    return (
                                                                                        <option
                                                                                            key={data.BranchId}
                                                                                            value={data.BranchId}
                                                                                        >
                                                                                            {data.branch_name}
                                                                                        </option>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <></>
                                                                            )}
                                                                        </select>
                                                                        <label className="px-2" htmlFor="next_branch_id" onClick={() => handleClick('next_branch_id')} >Select New Branch Name <span className="text-danger">*</span></label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/*shift user button */}
                                                            <div className="row text-end">
                                                                <div className="col-12 mt-4">
                                                                    <button type="submit" className="btn btn-primary">
                                                                        {showNewBranchList ? "Shift User" : "Deactivate User"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                </section>
                                :
                                <section className={`add-property-wrapper property-present-section mb-4 ${propertyPresentBranchClass}`} ref={propertyPresentBranchSection}>
                                    <div className="container-fluid">
                                        <div className="row justify-content-center">
                                            <div className="col-xl-12">
                                                <form onSubmit={onChangeBranchFormSubmit} className="card p-xl-2">
                                                    <div className="card-body">
                                                        <h4 className="fw-bold">Change Properties Branch</h4>
                                                        <hr />
                                                        {/* Row 1 - Basic Details */}
                                                        <div className="row mb-2">
                                                            {/* current branch Name */}
                                                            <div className="col-xl-8 mt-3">
                                                                {branchData.branchNameDetails ? (
                                                                    <div className="form-group">
                                                                        <p><span className="paragraph-label-text">Current Branch Name:</span>{branchData.branchNameDetails}</p>
                                                                    </div>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>
                                                            {/* next_branch_id */}
                                                            <div className="col-xl-4 col-md-8 mt-3">
                                                                <div className="form-group custom-class-form-div">
                                                                    <select
                                                                        id="next_branch_id"
                                                                        name="next_branch_id"
                                                                        className="form-select custom-input"
                                                                        onChange={onInputChange}
                                                                        onBlur={onInputBlur}
                                                                        onFocus={handleFocus}
                                                                        required
                                                                    >
                                                                        <option value=""></option>
                                                                        {filteredBranchList ? (
                                                                            filteredBranchList.map((data) => {
                                                                                return (
                                                                                    <option
                                                                                        key={data.BranchId}
                                                                                        value={data.BranchId}
                                                                                    >
                                                                                        {data.branch_name}
                                                                                    </option>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <></>
                                                                        )}
                                                                    </select>
                                                                    <label className="px-2" htmlFor="next_branch_id" onClick={() => handleClick('next_branch_id')} >Select New Branch Name <span className="text-danger">*</span></label>
                                                                </div>
                                                            </div>
                                                            {/* property list */}
                                                            <div className="table-wrapper table-bordered mt-4 property-list-table-container">
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        className='me-2 mb-3'
                                                                        checked={selectAll}
                                                                        onChange={handleSelectAll}
                                                                    />
                                                                    Select All
                                                                </label>
                                                                <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table  text-center ">
                                                                    <thead className="bg-light">
                                                                        <tr className="table-heading-class">
                                                                            <th scope="col" className="">Select</th>
                                                                            <th>Property Number</th>
                                                                            <th>Type </th>
                                                                            <th>Location</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {branchPropertyList && branchPropertyList.map((property, i) => (
                                                                            <tr key={property.property_id}>
                                                                                <td>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        value={property.property_id}
                                                                                        checked={selectedProperties.includes(property.property_id)}
                                                                                        onChange={handleSinglePropertyChange}
                                                                                    />
                                                                                </td>
                                                                                <td>{property.property_number}</td>
                                                                                <td>{property.category}</td>
                                                                                <td>{property.city_name}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table> 
                                                            </div>
                                                            {/*shift user button */}
                                                            <div className="row text-end">
                                                                <div className="col-12 mt-4">
                                                                    <button type="submit" className="btn btn-primary">
                                                                        Change Properties Branch
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                </section>
                            }

                            {/* close branch section */}
                            <section className={`add-property-wrapper close-branch-section mb-4 ${closeBranchClass}`} ref={closeBranchSection}>
                                <div className="container-fluid">
                                    <div className="row justify-content-center">
                                        <div className="col-xl-12">
                                            <form onSubmit={onCloseBranchFunction} className="card p-xl-2">
                                                <div className="card-body">
                                                    <h4 className="fw-bold">Close Branch</h4>
                                                    <hr />
                                                    {/* Row 1 - Basic Details */}
                                                    <div className="row mb-2">
                                                        {/* current branch Name */}
                                                        <div className="col-md-8 mt-3">
                                                            {branchData.branchNameDetails ? (
                                                                <div className="form-group">
                                                                    <p><span className="paragraph-label-text">Current Branch Name:</span>{branchData.branchNameDetails}</p>
                                                                </div>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </div>
                                                        {/*close branch button */}
                                                        <div className="row text-end">
                                                            <div className="col-12 mt-4">
                                                                <button type="submit" className="btn btn-primary">
                                                                    Close Branch
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                            </section>
                        </div>)
                        }


                    </div>
                </div>
            </div >
        </Layout >
    )
}

export default BankBranchClosePage