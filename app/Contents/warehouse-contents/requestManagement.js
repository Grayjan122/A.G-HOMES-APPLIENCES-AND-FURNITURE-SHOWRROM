'use client';
import { useState, useEffect, useMemo } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import DropdownButton from 'react-bootstrap/DropdownButton';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import Dropdown from 'react-bootstrap/Dropdown';

const ITEMS_PER_PAGE = 8;
const ITEMS_PER_PAGE_DETAILS = 5;

const RequestManagementWR = () => {
    // User session data
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    // Main data states
    const [requestList, setRequestList] = useState([]);
    const [deliverDetails, setDeliverDetails] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [userList, setUserList] = useState([]);

    // Filter states
    const [requestFromFilter, setRequestFromFilter] = useState('');
    const [requestByFilter, setRequestByFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Modal visibility states
    const [deliveriesDataVisible, setDeliveriesDataVisible] = useState(true);
    const [appointDriverVisible, setAppointDriverVisible] = useState(true);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Request details states
    const [requestID, setRequestID] = useState('');
    const [requestFrom, setRequestFrom] = useState('');
    const [requestBy, setRequestBy] = useState('');
    const [requestStatus, setRequestStatus] = useState('');
    const [reqDateTime, setReqDateTime] = useState("");

    // Driver selection state
    const [transferDriver, setTransferDriver] = useState('');
    const [selectedStore, setSelectedStore] = useState("Select Store");
    const [rID, setRID] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageDetails, setCurrentPageDetails] = useState(1);

    // Apply filters to the data
    const filteredData = useMemo(() => {
        let filtered = [...requestList];

        // Filter by request from location
        if (requestFromFilter) {
            filtered = filtered.filter(item => {
                return item.reqFrom?.toLowerCase().includes(requestFromFilter.toLowerCase());
            });
        }

        // Filter by request by user
        if (requestByFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(requestByFilter.toLowerCase());
            });
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(item => item.request_status === statusFilter);
        }

        // Filter by search term (ID, location, or name)
        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [requestList, requestFromFilter, requestByFilter, statusFilter, searchFilter]);

    // Pagination calculations using filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPagesDetails = Math.ceil(deliverDetails.length / ITEMS_PER_PAGE_DETAILS);
    const startIndexDetails = (currentPageDetails - 1) * ITEMS_PER_PAGE_DETAILS;
    const currentItemsDetails = deliverDetails.slice(startIndexDetails, startIndexDetails + ITEMS_PER_PAGE_DETAILS);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [requestFromFilter, requestByFilter, statusFilter, searchFilter]);

    // Initialize user session data
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load initial data
    useEffect(() => {
        GetRequest();
        GetUser();
        GetLocation();
    }, []);

    // Get users (drivers)
    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetUsers"
                }
            });
            setUserList(response.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    };

    // Get locations
    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'location.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLocation"
                }
            });
            setLocationList(response.data);
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    };

    // Get ongoing requests
    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnGoing',
            reqType: 'ReqTo'
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest2"
                }
            });
            setRequestList(response.data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    // Logging function
    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = { accID, activity };

        try {
            await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error recording logs events:", error);
        }
    };

    // Get delivery data
    const GetDeliveriesData = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        const ID = { transID: transaction_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestData"
                }
            });
            const data = response.data[0];

            setRequestID(response.data[0].request_stock_id);
            setRequestFrom(response.data[0].reqFrom);
            setRequestBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setRequestStatus(response.data[0].request_status);
            GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);

        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            reqID: req_id,
            status: status
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetReqDateAndTime"
                }
            });

            if (response.data && response.data.length > 0) {
                setReqDateTime(response.data[0].date + " • " + response.data[0].time);
            } else {
                return "";
            }
        } catch (error) {
            console.error("Error fetching request data:", error);
            return "";
        }
    };

    // Get delivery details
    const GetDeliveriesDetails = async (transaction_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = { reqID: transaction_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });
            setDeliverDetails(response.data);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);
        }
    };

    // Deliver stock
    const DeliverStock = async () => {
        if (transferDriver === '') {
            showAlertError({
                icon: "error",
                title: "Wait!",
                text: "Please choose a driver first.",
                button: 'Okay'
            });
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            accID: accountID,
            reqID: rID,
            driverID: transferDriver
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "DeliverStock"
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Successfully appointed a driver and it's ready to deliver",
                    "success",
                    true,
                    'Ok'
                );

                setAppointDriverVisible(true);
                setDeliveriesDataVisible(true);
                GetRequest();
                Logs(accountID, 'Deliver the request #' + rID);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to deliver the stock!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error delivering stock:", error);
        }
    };

    // Pagination handlers
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageChangeDetails = (page) => {
        if (page >= 1 && page <= totalPagesDetails) {
            setCurrentPageDetails(page);
        }
    };

    // Clear all filters function
    const clearAllFilters = () => {
        setRequestFromFilter('');
        setRequestByFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };

    // Get unique locations from request data
    const getUniqueLocations = () => {
        const uniqueLocations = [...new Set(requestList.map(item => item.reqFrom).filter(Boolean))];
        return uniqueLocations.sort();
    };

    // Get unique users from request data
    const getUniqueUsers = () => {
        const uniqueUsers = [...new Set(requestList.map(item => `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()).filter(name => name))];
        return uniqueUsers.sort();
    };

    return (
        <>
            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

            {/* Delivery Details Modal */}
            <Modal show={!deliveriesDataVisible} onHide={() => { setDeliveriesDataVisible(true); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {requestID}</div>
                        </div>
                        <div><strong>REQUEST FROM:</strong> {requestFrom}</div>
                        <div><strong>REQUEST BY:</strong> {requestBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: requestStatus === "Pending" ? "red"
                                    : requestStatus === "Delivered" ? "green"
                                        : requestStatus === "On Going" ? "orange"
                                            : requestStatus === "On Delivery" ? "goldenrod"
                                                : requestStatus === "Complete" ? "blue"
                                                    : "black",
                                fontWeight: 'bold'
                            }}>
                                {requestStatus} | {reqDateTime}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer1' style={{ height: '30vh' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItemsDetails.length > 0 ? (
                                    currentItemsDetails.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td className='td-name'>{p.product_name}</td>
                                            <td className='td-name'>{p.description}</td>
                                            <td>{p.qty}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No delivery details found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPagesDetails > 1 && (
                        <div style={{ justifySelf: 'center' }}>
                            <CustomPagination
                                currentPage={currentPageDetails}
                                totalPages={totalPagesDetails}
                                onPageChange={handlePageChangeDetails}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setDeliveriesDataVisible(true); }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { setAppointDriverVisible(false); setTransferDriver('') }}>
                        Deliver The Stock
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Appoint Driver Modal */}
            <Modal
                show={!appointDriverVisible}
                onHide={() => { setAppointDriverVisible(true) }}
                size='md'
                centered
            >
                <Modal.Header
                    closeButton
                    className='searched-product-header'
                    style={{
                        borderBottom: '2px solid #dee2e6'
                    }}
                >
                    <Modal.Title style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#2c3e50'
                    }}>
                        <i className="fas fa-truck-loading" style={{ marginRight: '10px' }}></i>
                        Appoint Driver To Deliver
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className='searched-product-body'
                    style={{ padding: '20px' }}
                >
                    <div className='div-input-add-prod' style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <label className='add-prod-label' style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#34495e'
                        }}>
                            Choose Driver:
                        </label>

                        {/* Driver Selection Dropdown */}
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="primary"
                                size="sm"
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    textAlign: 'left',
                                    backgroundColor: '#fff',
                                    color: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #ced4da',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    padding: '10px 15px'
                                }}
                            >
                                {transferDriver ?
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.fname + " " +
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.mname + " " +
                                    userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.lname
                                    : '-- Select a Driver --'
                                }
                            </Dropdown.Toggle>

                            <Dropdown.Menu style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #ced4da'
                            }}>
                                <Dropdown.Item
                                    onClick={() => setTransferDriver('')}
                                    style={{
                                        padding: '10px 15px',
                                        fontSize: '0.95rem',
                                        color: '#6c757d',
                                        fontStyle: 'italic'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.color = '#495057';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '';
                                        e.target.style.color = '#6c757d';
                                    }}
                                >
                                    -- Select a Driver --
                                </Dropdown.Item>

                                {userList
                                    .filter(role => role.role_name?.toLowerCase() === 'driver')
                                    .map((driver) => (
                                        <Dropdown.Item
                                            key={driver.account_id}
                                            onClick={() => setTransferDriver(driver.account_id.toString())}
                                            style={{
                                                padding: '10px 15px',
                                                fontSize: '0.95rem',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#0056b3';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '';
                                                e.target.style.color = '';
                                            }}
                                        >
                                            {driver.fname + " " + driver.mname + " " + driver.lname}
                                        </Dropdown.Item>
                                    ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* Selected Driver Display */}
                        {transferDriver && (
                            <div style={{
                                padding: '10px 15px',
                                backgroundColor: '#e8f5e8',
                                borderRadius: '8px',
                                border: '1px solid #28a745',
                                fontSize: '0.9rem'
                            }}>
                                <strong>Selected Driver: </strong>
                                <span style={{ color: '#28a745' }}>
                                    {userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.fname + " " +
                                        userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.mname + " " +
                                        userList.find(driver => driver.account_id?.toString() === transferDriver.toString())?.lname}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#666'
                    }}>
                        <p style={{ margin: 0 }}>
                            <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#3498db' }}></i>
                            Select a driver to handle the delivery of these items. Once appointed, the delvery will be tracked on delivery page.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer
                    className='searched-product-footer'
                    style={{
                        borderTop: '1px solid #dee2e6',
                        padding: '15px'
                    }}
                >
                    <Button
                        variant="outline-secondary"
                        onClick={() => { setAppointDriverVisible(true) }}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '6px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={DeliverStock}
                        disabled={!transferDriver}
                        style={{
                            padding: '8px 25px',
                            borderRadius: '6px',
                            marginLeft: '10px',
                            backgroundColor: transferDriver ? '#2563eb' : '#6c757d',
                            border: 'none',
                            opacity: transferDriver ? 1 : 0.6
                        }}
                    >
                        Confirm Appointment
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>REQUEST MANAGEMENT</h1>
                </div>

                {/* Enhanced Filter Controls */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
                        {/* Request From Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Filter by Request From
                            </label>
                            <select
                                value={requestFromFilter}
                                onChange={(e) => setRequestFromFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Locations</option>
                                {getUniqueLocations().map((location, index) => (
                                    <option key={index} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Request By Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Filter by Request By
                            </label>
                            <select
                                value={requestByFilter}
                                onChange={(e) => setRequestByFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Users</option>
                                {getUniqueUsers().map((user, index) => (
                                    <option key={index} value={user}>
                                        {user}
                                    </option>
                                ))}
                            </select>
                        </div>

                       
                       

                        {/* Search Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px', 
                                fontWeight: '500', 
                                fontSize: '14px'
                            }}>
                                Search Requests
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#6c757d'
                                }}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search by ID, location, or user..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {searchFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchFilter('')}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Clear search"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active filters section */}
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    margin: '10px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>

                        {requestFromFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Request From: {requestFromFilter}
                                <button
                                    type="button"
                                    onClick={() => setRequestFromFilter('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {requestByFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Request By: {requestByFilter}
                                <button
                                    type="button"
                                    onClick={() => setRequestByFilter('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {statusFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Status: {statusFilter}
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {searchFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Search: "{searchFilter}"
                                <button
                                    type="button"
                                    onClick={() => setSearchFilter('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredData.length} of {requestList.length} records shown)
                        </span>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#5a6268';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#6c757d';
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                <div className='tableContainer' style={{ height: '45vh', overflowY: 'auto' }}>
                    {currentItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>REQUEST ID</th>
                                    <th className='th1'>REQUEST FROM</th>
                                    <th className='th1'>REQUEST BY</th>
                                    <th className='th1'>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr
                                        className='table-row'
                                        key={i}
                                        onClick={() => {
                                            setDeliveriesDataVisible(false);
                                            GetDeliveriesData(p.request_stock_id);
                                            GetDeliveriesDetails(p.request_stock_id);
                                            setRID(p.request_stock_id);
                                        }}
                                    >
                                        <td className='td-name'>{p.request_stock_id}</td>
                                        <td style={{textAlign: 'center'}}>{p.reqFrom}</td>
                                        <td style={{textAlign: 'center'}}>{`${p.fname || ''} ${p.mname || ''} ${p.lname || ''}`}</td>
                                        <td
                                            style={{
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: p.request_status === "Pending" ? "red"
                                                    : p.request_status === "Delivered" ? "green"
                                                        : p.request_status === "On Going" ? "orange"
                                                            : p.request_status === "On Delivery" ? "goldenrod"
                                                                : p.request_status === "Complete" ? "blue"
                                                                    : "black",
                                            }}
                                        >{p.request_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: '#6c757d',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '20px',
                                opacity: 0.3
                            }}>
                                📋
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {requestList.length === 0 ? 'No requests found' : 'No requests match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {requestList.length === 0
                                    ? 'No ongoing requests at the moment. New requests will appear here when available.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && currentItems.length > 0 && (
                    <div style={{ justifySelf: 'center' }}>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default RequestManagementWR;