import React, { useState, useEffect, useRef } from 'react'
import CommonSpinner from "../CommonSpinner";
import Layout from '../components/1.CommonLayout/Layout';
import AdminSideBar from './AdminSideBar';
import { Button } from 'react-bootstrap';
import axios from "axios";
import { toast } from "react-toastify";
import { SubscriptionFacilityFetching } from "../components/11.Subscription/SubscriptionFacilityFetching";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "./BreadCrumb";

let authHeaders = "";

const AddSubscriptionFacility = () => {
const navigate =useNavigate();
    const confirmDeleteInputRef = useRef();
    const data = JSON.parse(localStorage.getItem("data"));
    if (data) {
        authHeaders = { Authorization: data.loginToken };
    }
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [newSubscription, setNewSubscription] = useState({ title: '', basic: false, advanced: false });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [editSubScriptionFacilityId, setEditSubscriptionFacilityId] = useState(null);
    const [deleteSubScriptionFacilityId, setDeleteSubscriptionFacilityId] = useState(null);
    const [confirmDeleteUserBtnDisabled, setConfirmDeleteUserBtnDisabled] =
        useState(true);

    // add form input on change
    const onInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setNewSubscription(prevState => ({
            ...prevState,
            [name]: newValue
        }));
    };

    // add facility function
    const handleAddSubscriptionFacility = async () => {
        try {
            // Fetch plans from API URL
            await axios
                .post("/sam/v1/customer-registration/auth/add-subscription-facility", JSON.stringify(newSubscription), {
                    headers: authHeaders,
                })
                .then((response) => {
                    const addRes = response.data;
                    if (addRes.status === 0) {
                        toast.success("Subscription facility added successfully.")
                        fetchFacilityData();
                        setNewSubscription({ title: '', basic: false, advanced: false });
                        setShowAddModal(false);
                    }
                });
        } catch (error) {
            toast.error(error.response.data.error)
            setLoading(false);
        }
    };

    // save edit changes function
    const handleEditSaveSubscription = async (index) => {
        let newArray = subscriptions.slice();
        newArray[index] = newSubscription;
        const dataToPost = {
            subscription_facility_id: editSubScriptionFacilityId,
            title: newSubscription.title,
            basic: newSubscription.basic,
            advanced: newSubscription.advanced
        }
        try {
            // Fetch plans from API URL
            await axios
                .put("/sam/v1/customer-registration/auth/update-subscription-facility", JSON.stringify(dataToPost), {
                    headers: authHeaders,
                })
                .then((response) => {
                    const updateRes = response.data;
                    if (updateRes.status === 0) {
                        toast.success("Subscription facility updated successfully.")
                        setSubscriptions(newArray);
                        setNewSubscription({ title: '', basic: false, advanced: false });
                        setShowEditModal(false);
                        setEditIndex(null);
                        setEditSubscriptionFacilityId(null);
                        setLoading(false);
                    }
                });
        } catch (error) {
            toast.error(error.response.data.error)
            setLoading(false);
        }
    };

    // click on edit button function
    const handleEditSubscription = (index, sub_facility_id) => {
        setNewSubscription(subscriptions[index]);
        setEditIndex(index);
        setEditSubscriptionFacilityId(sub_facility_id);
        setShowEditModal(true);
    };

    // on cilck confirm delete btn
    const handleDeleteSubscriptionFacility = async (sub_facility_id) => {
        setShowDeleteModal(false);
        const updatedSubscriptions = [...subscriptions];
        updatedSubscriptions.splice(deleteIndex, 1);

        try {
            // Fetch plans from API URL
            await axios.delete(`/sam/v1/customer-registration/auth/delete-subscription-facility/${sub_facility_id}`, {
                headers: authHeaders,
            })
                .then((response) => {
                    const updateRes = response.data;
                    if (updateRes.status === 0) {
                        toast.success("Subscription facility deleted successfully.")
                        setSubscriptions(updatedSubscriptions);
                        setDeleteIndex(null);
                        confirmDeleteInputRef.current.value = "";
                        setLoading(false);
                    }
                });
        } catch (error) {
            toast.error(error.response.data.error)
            setLoading(false);
        }
    };

    // click on edit button function
    const handleDeleteSubscriptionBtn = (index, subscription_facility_id) => {
        confirmDeleteInputRef.current.value = "";
        setDeleteIndex(index);
        setDeleteSubscriptionFacilityId(subscription_facility_id);
        setShowDeleteModal(true);
    };

    // fetching subscription facility list from database
    const fetchFacilityData = async () => {
        setLoading(true);
        const details = await SubscriptionFacilityFetching();
        setSubscriptions(details);
        setLoading(false);
    };

    useEffect(() => {
        fetchFacilityData();
    }, []);


    return (
        <Layout>
            <div className="container-fluid admin-subscription-facility-wrapper section-padding">
                <div className="row min-100vh position-relative">
                    <AdminSideBar />
                    <div className={`col-xl-10 col-lg-9 col-md-8 users-admin`} >
                        {/* breadCrumb and back button */}
                        <div className="row justify-content-between align-items-center mb-md-0 mb-2">
                            <div className="col-md-6">
                                <BreadCrumb />
                            </div>
                            {/* /back button */}
                            <div className="col-md-6 text-end">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => { navigate(`/admin`) }}
                                >
                                    <i className="bi bi-arrow-left"></i> Back
                                </button>
                            </div>

                        </div>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center"
                                style={{ minHeight: "60vh" }}
                            >
                                <CommonSpinner
                                    spinnerColor="primary"
                                    height="4rem"
                                    width="4rem"
                                    spinnerType="grow"
                                />
                            </div>
                        ) :
                            <div className="mt-4">
                                <h4 className="fw-bold">Subscription Facility List</h4>
                                <hr />
                                {/* add subscription facility button */}
                                <div className="text-end">
                                    <Button variant="primary" className='mb-3' onClick={() => setShowAddModal(true)}>
                                        Add Subscription Facility
                                    </Button>
                                </div>


                                {/* facility table */}
                                <div className="table-wrapper table-bordered overflow-auto">
                                    <table className="table align-middle table-striped table-bordered mb-0 bg-white admin-users-table ">
                                        <thead className="bg-light">
                                            <tr className="table-heading-class">
                                                <th className='text-center'>Sr.No</th>
                                                <th>Title</th>
                                                <th className='text-center'>Basic</th>
                                                <th className='text-center'>Advanced</th>
                                                <th className='text-center'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptions.map((sub, index) => (
                                                <tr key={index}>
                                                    <td className='text-center'>{index + 1}</td>
                                                    <td>{sub.title}</td>
                                                    <td className='text-center'>{sub.basic ? 'Yes' : 'No'}</td>
                                                    <td className='text-center'>{sub.advanced ? 'Yes' : 'No'}</td>
                                                    <td className='text-center'>
                                                        <i className="bi bi-pencil-fill text-primary me-3"
                                                            onClick={() => handleEditSubscription(index, sub.subscription_facility_id)}
                                                            title="Edit">
                                                        </i>{' '}
                                                        <i className="bi bi-trash-fill pe-2 text-danger"
                                                            onClick={() => handleDeleteSubscriptionBtn(index, sub.subscription_facility_id)}
                                                            title="Delete">
                                                        </i>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <hr />
                                </div>
                            </div>
                        }
                    </div>

                    {/* add Modal */}
                    <div
                        className={`modal fade ${showAddModal ? 'show' : ''}`}
                        style={{ display: showAddModal ? 'block' : 'none' }}
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header justify-content-between">
                                    <h5 className="modal-title"> Add Subscription Facility
                                    </h5>
                                    <button
                                        type="button"
                                        className="close text-end h6 border-0 bg-white"
                                        onClick={() => setShowAddModal(false)}
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        title='Close'
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <textarea
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={newSubscription.title}
                                                onChange={onInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="basic"
                                                checked={newSubscription.basic}
                                                onChange={onInputChange}
                                            />
                                            <label className="form-check-label">Basic</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="advanced"
                                                checked={newSubscription.advanced}
                                                onChange={onInputChange}
                                            />
                                            <label className="form-check-label">Advanced</label>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleAddSubscriptionFacility()}
                                    >
                                        Add Facility
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* edit Modal */}
                    <div
                        className={`modal fade ${showEditModal ? 'show' : ''}`}
                        style={{ display: showEditModal ? 'block' : 'none' }}
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header justify-content-between">
                                    <h5 className="modal-title"> Edit Subscription Facility
                                    </h5>
                                    <button
                                        type="button"
                                        className="close text-end border-0 bg-white"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditSubscriptionFacilityId(null);
                                            setNewSubscription({ title: '', basic: false, advanced: false });
                                        }}
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        title='Close'
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <textarea
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={newSubscription.title}
                                                onChange={onInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="basic"
                                                checked={newSubscription.basic}
                                                onChange={onInputChange}
                                            />
                                            <label className="form-check-label">Basic</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="advanced"
                                                checked={newSubscription.advanced}
                                                onChange={onInputChange}
                                            />
                                            <label className="form-check-label">Advanced</label>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditSubscriptionFacilityId(null);
                                            setNewSubscription({ title: '', basic: false, advanced: false });
                                        }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleEditSaveSubscription(editIndex)}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete confirmation Modal */}
                    <div
                        className={`modal fade ${showDeleteModal ? 'show' : ''}`}
                        style={{ display: showDeleteModal ? 'block' : 'none' }}
                        tabIndex="-1"
                        role="dialog"
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
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteSubscriptionFacilityId(null);
                                            setDeleteIndex(null);
                                        }}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <label htmlFor="confirm-delete-input" className="form-label">
                                        Please type <span className="fw-bold">Delete</span>{" "}
                                        to confirm.
                                    </label>
                                    <input
                                        onChange={(e) => {
                                            if (e.target.value === "Delete") {
                                                setConfirmDeleteUserBtnDisabled(false);
                                            } else {
                                                setConfirmDeleteUserBtnDisabled(true);
                                            }
                                        }}
                                        ref={confirmDeleteInputRef}
                                        type="text"
                                        name="confirm-delete-email"
                                        id="confirm-delete-input"
                                        className="form-control"
                                    />
                                    <button
                                        onClick={() => handleDeleteSubscriptionFacility(deleteSubScriptionFacilityId)}
                                        data-bs-dismiss="modal"
                                        disabled={confirmDeleteUserBtnDisabled}
                                        className="btn btn-danger w-100 mt-3 fw-bold"
                                    >
                                        Delete Facility
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </Layout >
    );
}

export default AddSubscriptionFacility