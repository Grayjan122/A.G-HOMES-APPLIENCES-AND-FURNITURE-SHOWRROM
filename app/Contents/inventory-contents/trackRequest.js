'use client';
import { useState, useEffect, useMemo } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Dropdown } from 'react-bootstrap';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE_TRACK_REQ = 8;
const ITEMS_PER_PAGE_DETAILS = 5;
const ITEMS_PER_PAGE_ARCHIVE = 6;

const TrackRequestIM = () => {
    // Core state variables
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [myRequestList, setMyRequestList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    // Filter states for main table
    const [requestFromFilter, setRequestFromFilter] = useState('');
    const [requestToFilter, setRequestToFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Archive modal states
    const [showArchive, setShowArchive] = useState(false);
    const [archiveRequestList, setArchiveRequestList] = useState([]);
    const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);

    // Archive filter states (no status filter since all are complete)
    const [archiveRequestFromFilter, setArchiveRequestFromFilter] = useState('');
    const [archiveRequestToFilter, setArchiveRequestToFilter] = useState('');
    const [archiveUserFilter, setArchiveUserFilter] = useState('');
    const [archiveSearchFilter, setArchiveSearchFilter] = useState('');

    // Progress tracker state
    const steps = [
        "Request Placed",
        "In Progress",
        "On Delivery",
        "Delivered",
        "Complete",
    ];
    const [currentStep, setCurrentStep] = useState(0);

    // Modal visibility state
    const [show, setShow] = useState(false);
    const [trackRequestDetailsVisible, setTrackRequestDetailsVisible] = useState(true);
    const [trackReqVisible, setTrackReqVisible] = useState(true);

    // Request details state
    const [myRequestDetails, setMyRequestDetails] = useState([]);
    const [s_reqID, setS_ReqID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqTo, setS_ReqTo] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');
    const [reqReports, setReqReports] = useState([]);
    const [reqDateTime, setReqDateTime] = useState("");

    // Alert state
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    // Filter main data to show only non-complete requests
    const nonCompleteRequests = useMemo(() => {
        return myRequestList.filter(request => request.request_status !== 'Complete');
    }, [myRequestList]);

    // Apply filters to the non-complete data
    const filteredData = useMemo(() => {
        let filtered = [...nonCompleteRequests];

        // Filter by request from
        if (requestFromFilter) {
            filtered = filtered.filter(item =>
                item.reqFrom?.toLowerCase().includes(requestFromFilter.toLowerCase())
            );
        }

        // Filter by request to
        if (requestToFilter) {
            filtered = filtered.filter(item =>
                item.reqTo?.toLowerCase().includes(requestToFilter.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(item => item.request_status === statusFilter);
        }

        // Filter by user
        if (userFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(userFilter.toLowerCase());
            });
        }

        // Filter by search term
        if (searchFilter.trim()) {
            const searchTerm = searchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                item.reqTo?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [nonCompleteRequests, requestFromFilter, requestToFilter, statusFilter, userFilter, searchFilter]);

    // Apply filters to archive data
    const filteredArchiveData = useMemo(() => {
        let filtered = [...archiveRequestList];

        // Filter by request from
        if (archiveRequestFromFilter) {
            filtered = filtered.filter(item =>
                item.reqFrom?.toLowerCase().includes(archiveRequestFromFilter.toLowerCase())
            );
        }

        // Filter by request to
        if (archiveRequestToFilter) {
            filtered = filtered.filter(item =>
                item.reqTo?.toLowerCase().includes(archiveRequestToFilter.toLowerCase())
            );
        }

        // Filter by user
        if (archiveUserFilter) {
            filtered = filtered.filter(item => {
                const fullName = `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase();
                return fullName.includes(archiveUserFilter.toLowerCase());
            });
        }

        // Filter by search term
        if (archiveSearchFilter.trim()) {
            const searchTerm = archiveSearchFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.request_stock_id?.toString().includes(searchTerm) ||
                item.reqFrom?.toLowerCase().includes(searchTerm) ||
                item.reqTo?.toLowerCase().includes(searchTerm) ||
                `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [archiveRequestList, archiveRequestFromFilter, archiveRequestToFilter, archiveUserFilter, archiveSearchFilter]);

    // Archive pagination using filtered data
    const archiveTotalPages = Math.ceil(filteredArchiveData.length / ITEMS_PER_PAGE_ARCHIVE);
    const archiveStartIndex = (archiveCurrentPage - 1) * ITEMS_PER_PAGE_ARCHIVE;
    const archiveCurrentItems = filteredArchiveData.slice(archiveStartIndex, archiveStartIndex + ITEMS_PER_PAGE_ARCHIVE);

    // Calculate pagination values using filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE_TRACK_REQ);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_TRACK_REQ;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE_TRACK_REQ);

    const totalPages1 = Math.ceil(myRequestDetails.length / ITEMS_PER_PAGE_DETAILS);
    const startIndex1 = (currentPage1 - 1) * ITEMS_PER_PAGE_DETAILS;
    const currentItems1 = myRequestDetails.slice(startIndex1, startIndex1 + ITEMS_PER_PAGE_DETAILS);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [requestFromFilter, requestToFilter, statusFilter, userFilter, searchFilter]);

    // Reset archive page when archive filters change
    useEffect(() => {
        setArchiveCurrentPage(1);
    }, [archiveRequestFromFilter, archiveRequestToFilter, archiveUserFilter, archiveSearchFilter]);

    // Helper functions
    const getBaseURL = () => sessionStorage.getItem('baseURL') || '';

    const handleError = (error, context) => {
        console.error(`Error ${context}:`, error);
        setMessage(`Error occurred while ${context}. Please try again.`);
        setAlertVariant('danger');
        setAlertBG('#dc7a80');
        setAlert1(true);
        setTimeout(() => setAlert1(false), 3000);
    };

    // Get unique request from locations
    const getUniqueRequestFrom = (data = nonCompleteRequests) => {
        const locations = [...new Set(data.map(item => item.reqFrom).filter(Boolean))];
        return locations.sort();
    };

    // Get unique request to locations
    const getUniqueRequestTo = (data = nonCompleteRequests) => {
        const locations = [...new Set(data.map(item => item.reqTo).filter(Boolean))];
        return locations.sort();
    };

    // Get unique users from request data
    const getUniqueUsers = (data = nonCompleteRequests) => {
        const uniqueUsers = [...new Set(data.map(item =>
            `${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()
        ).filter(name => name))];
        return uniqueUsers.sort();
    };

    // Clear all filters function
    const clearAllFilters = () => {
        setRequestFromFilter('');
        setRequestToFilter('');
        setStatusFilter('');
        setUserFilter('');
        setSearchFilter('');
        setCurrentPage(1);
    };

    // Clear all archive filters function
    const clearAllArchiveFilters = () => {
        setArchiveRequestFromFilter('');
        setArchiveRequestToFilter('');
        setArchiveUserFilter('');
        setArchiveSearchFilter('');
        setArchiveCurrentPage(1);
    };

    // API Functions
    const Logs = async (accID, activity) => {
        if (!accID || !activity) return;

        const url = `${getBaseURL()}audit-log.php`;
        const Details = { accID, activity };

        try {
            await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const MyGetRequest = async () => {
        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            locID: location_id,
            status: '',
            reqType: 'ReqFrom',
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest"
                }
            });

            setMyRequestList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching request list');
            setMyRequestList([]);
        }
    };

    const GetArchiveRequests = async () => {
        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            locID: location_id,
            status: 'Complete',
            reqType: 'ReqFrom',
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetCompletedRequest"
                }
            });

            const completeRequests = Array.isArray(response.data) ? 
                response.data.filter(req => req.request_status === 'Complete') : [];
            setArchiveRequestList(completeRequests);
            setArchiveCurrentPage(1);
        } catch (error) {
            handleError(error, 'fetching archive requests');
            setArchiveRequestList([]);
        }
    };

    const GetLocation = async () => {
        const url = `${getBaseURL()}location.php`;

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetLocation"
                }
            });

            setLocationList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            handleError(error, 'fetching location list');
            setLocationList([]);
        }
    };

    const GetTrackRequestDetails = async (req_id) => {
        if (!req_id) return;

        const url = `${getBaseURL()}requestStock.php`;
        const ID = { reqID: req_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestDetails"
                }
            });

            setMyRequestDetails(Array.isArray(response.data) ? response.data : []);
            setCurrentPage1(1);
        } catch (error) {
            handleError(error, 'fetching request details');
            setMyRequestDetails([]);
        }
    };

    const GetTrackRequestD = async (req_id) => {
        MyGetProgressCount(req_id);

        const url = `${getBaseURL()}requestStock.php`;
        const ID = {
            reqID: req_id,
            locID: 12
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequestD"
                }
            });

            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                setS_ReqBy(`${data.fname || ''} ${data.mname || ''} ${data.lname || ''}`.trim());
                setS_ReqID(data.request_stock_id || '');
                setS_ReqDate(data.date || '');
                setS_ReqFrom(data.reqFrom || '');
                setS_ReqTo(data.reqTo || '');
                setS_ReqStatus(data.request_status || '');

                GetTrackRequestTimeandDate(data.request_stock_id, data.request_status);
            }
        } catch (error) {
            handleError(error, 'fetching request data');
        }
    };

    const GetTrackRequestTimeandDate = async (req_id, status) => {
        const url = `${getBaseURL()}requestStock.php`;
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
            handleError(error, "fetching request data");
            return "";
        }
    };

    const MyGetProgressCount = async (id) => {
        if (!id) return;

        const url = `${getBaseURL()}requestReport.php`;
        const accountID = sessionStorage.getItem('user_id');
        const ID = { reqID: id };

        try {
            const progressResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "progress"
                }
            });

            if (progressResponse.data && progressResponse.data.length > 0) {
                setCurrentStep(progressResponse.data[0].Count - 1);
                if (accountID) {
                    Logs(accountID, `Track the request #${id}`);
                }
            }

            const detailsResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "progress1"
                }
            });

            setReqReports(Array.isArray(detailsResponse.data) ? detailsResponse.data : []);
        } catch (error) {
            handleError(error, 'fetching progress data');
            setReqReports([]);
        }
    };

    // Event handlers
    const handleClose = () => setShow(false);
    const handleArchiveClose = () => setShowArchive(false);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageChange1 = (page) => {
        if (page >= 1 && page <= totalPages1) {
            setCurrentPage1(page);
        }
    };

    const handleArchivePageChange = (page) => {
        if (page >= 1 && page <= archiveTotalPages) {
            setArchiveCurrentPage(page);
        }
    };

    const handleArchiveOpen = () => {
        GetArchiveRequests();
        setShowArchive(true);
    };

    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'trackRequestDetails':
                if (id) {
                    setTrackRequestDetailsVisible(false);
                    GetTrackRequestDetails(id);
                    GetTrackRequestD(id);
                }
                break;
            default:
                break;
        }
    };

    const triggerArchiveModal = (id) => {
        if (id) {
            setShowArchive(false);
            setTrackRequestDetailsVisible(false);
            GetTrackRequestDetails(id);
            GetTrackRequestD(id);
        }
    };

    // Effects
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id') || '');
        setLocation_id(sessionStorage.getItem('location_id') || '');
    }, []);

    useEffect(() => {
        GetLocation();
        MyGetRequest();
    }, []);

    // Prepare merged data for progress tracker
    const merged = steps.map((step, index) => ({
        stepName: step,
        data: reqReports[index] || null
    }));

    return (
        <>
            <Alert
                variant={alertVariant}
                className='alert-inventory'
                show={alert1}
                style={{ backgroundColor: alertBG }}
            >
                {message}
            </Alert>

            <Modal show={show} onHide={handleClose} size='sm'>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Archive Requests Modal */}
            <Modal
                show={showArchive}
                onHide={handleArchiveClose}
                size='xl'
                className='request-modal'
            >
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Completed Requests</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {/* Archive Filter Controls */}
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        margin: '0 0 15px 0',
                        border: '1px solid #e9ecef'
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
                                    Request From
                                </label>
                                <select
                                    value={archiveRequestFromFilter}
                                    onChange={(e) => setArchiveRequestFromFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Locations</option>
                                    {getUniqueRequestFrom(archiveRequestList).map((location, index) => (
                                        <option key={index} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Request To Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    Request To
                                </label>
                                <select
                                    value={archiveRequestToFilter}
                                    onChange={(e) => setArchiveRequestToFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Locations</option>
                                    {getUniqueRequestTo(archiveRequestList).map((location, index) => (
                                        <option key={index} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* User Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    Request By
                                </label>
                                <select
                                    value={archiveUserFilter}
                                    onChange={(e) => setArchiveUserFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">All Users</option>
                                    {getUniqueUsers(archiveRequestList).map((user, index) => (
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
                                    Search
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search completed requests..."
                                        value={archiveSearchFilter}
                                        onChange={(e) => setArchiveSearchFilter(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 35px 8px 12px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {archiveSearchFilter && (
                                        <button
                                            type="button"
                                            onClick={() => setArchiveSearchFilter('')}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#6c757d',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clear filters and results count */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '15px',
                            paddingTop: '15px',
                            borderTop: '1px solid #dee2e6'
                        }}>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Showing {filteredArchiveData.length} of {archiveRequestList.length} completed requests
                            </div>
                            <button
                                type="button"
                                onClick={clearAllArchiveFilters}
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px"
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
                    
                    <div className='tableContainer' style={{ height: '35vh', overflowY: 'auto' }}>
                        {archiveCurrentItems.length > 0 ? (
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <th className='t2'>REQUEST ID</th>
                                        <th className='th1'>REQUEST DATE</th>
                                        <th className='th1'>REQUEST FROM</th>
                                        <th className='th1'>REQUEST TO</th>
                                        <th className='th1'>REQUEST BY</th>
                                        <th className='th1'>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archiveCurrentItems.map((p, i) => (
                                        <tr
                                            className='table-row'
                                            key={i}
                                            onClick={() => triggerArchiveModal(p.request_stock_id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td className='td-name'>{p.request_stock_id || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>{p.date || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>{p.reqFrom || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>{p.reqTo || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {`${p.fname || ''} ${p.mname || ''} ${p.lname || ''}`.trim() || 'N/A'}
                                            </td>
                                            <td style={{
                                                fontWeight: 'bold',
                                                color: 'blue',
                                                textAlign: "center",
                                            }}>
                                                Complete
                                            </td>
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
                                    📁
                                </div>
                                <h4 style={{
                                    color: '#495057',
                                    marginBottom: '10px',
                                    fontWeight: '500'
                                }}>
                                    {archiveRequestList.length === 0 ? 'No completed requests found' : 'No requests match the current filters'}
                                </h4>
                                <p style={{
                                    margin: '0',
                                    fontSize: '14px',
                                    maxWidth: '300px',
                                    lineHeight: '1.4'
                                }}>
                                    {archiveRequestList.length === 0 
                                        ? 'Completed requests will appear here once they reach the "Complete" status.'
                                        : 'Try adjusting your filters to see more results.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {archiveTotalPages > 1 && archiveCurrentItems.length > 0 && (
                        <div style={{ justifySelf: 'center', marginTop: '20px' }}>
                            <CustomPagination
                                currentPage={archiveCurrentPage}
                                totalPages={archiveTotalPages}
                                onPageChange={handleArchivePageChange}
                                color="blue"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={handleArchiveClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Request Details Modal */}
            <Modal
                show={!trackRequestDetailsVisible}
                onHide={() => {
                    setTrackRequestDetailsVisible(true);
                    MyGetRequest();
                }}
                size='lg'
                className='request-modal'
            >
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>REQUEST ID:</strong> {s_reqID}</div>
                            <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
                            <div className='tracking'>
                                <u className='track1' onClick={() => setTrackReqVisible(false)}>
                                    View Tracking
                                </u>
                            </div>
                        </div>
                        <div><strong>REQUEST TO:</strong> {s_reqTo}</div>
                        <div><strong>REQUEST BY:</strong> {s_reqBy}</div>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div><strong>STATUS:</strong>
                                <span style={{
                                    marginLeft: '8px',
                                    color: s_reqStatus === "Pending" ? "red"
                                        : s_reqStatus === "Delivered" ? "green"
                                            : s_reqStatus === "On Going" ? "orange"
                                                : s_reqStatus === "On Delivery" ? "goldenrod"
                                                    : s_reqStatus === "Complete" ? "blue"
                                                        : "black",
                                    fontWeight: 'bold'
                                }}>
                                    {s_reqStatus} | {reqDateTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='tableContainer1' style={{ height: '30vh', overflowY: 'auto' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>Product Code</th>
                                    <th className='t2'>Product Description</th>
                                    <th className='th1'>Requested QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems1.length > 0 ? (
                                    currentItems1.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td className='td-name'>{p.product_name || 'N/A'}</td>
                                            <td className='td-name'>{p.description || 'N/A'}</td>
                                            <td style={{ textAlign: 'center' }}>{p.qty || '0'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                            No request details available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages1 > 1 && (
                        <div style={{ justifySelf: 'center', marginTop: '20px' }}>
                            <CustomPagination
                                currentPage={currentPage1}
                                totalPages={totalPages1}
                                onPageChange={handlePageChange1}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setTrackRequestDetailsVisible(true);
                            MyGetRequest();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Track Request Modal */}
            <Modal
                show={!trackReqVisible}
                onHide={() => setTrackReqVisible(true)}
                size='lg'
                className='request-modal'
            >
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Track Request #{s_reqID}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    <div className="horizontalContainer1">
                        <label style={{
                            fontSize: '40px',
                            fontWeight: 'bold',
                            marginLeft: '30px',
                            marginBottom: '-20px'
                        }}>
                            Request Tracker
                        </label>

                        {merged.map((label, index) => (
                            <div key={index}>
                                <div className="stepItem1">
                                    <div className={`circle1 ${index <= currentStep ? "active1" : ""}`}></div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        opacity: index <= currentStep ? 1 : 0.5
                                    }}>
                                        <label className="label1">{label.stepName}</label>
                                        <label>{label.data ? label.data.status : " "}</label>
                                        <label>{label.data ? `Date: ${label.data.date}` : " "}</label>
                                        <label>{label.data ? `Time: ${label.data.time}` : " "}</label>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`line1 ${index < currentStep ? "activeLine1" : ""}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setTrackReqVisible(true)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='customer-main'>
                <div className='customer-header'>
                    <div>
                        <h1 className='h-customer'>TRACK REQUEST</h1>
                    </div>
                    <div>
                        <button className='add-pro-bttn' onClick={handleArchiveOpen}>
                            COMPLETED REQUESTS
                        </button>
                    </div>
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
                                Request From
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
                                {getUniqueRequestFrom().map((location, index) => (
                                    <option key={index} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Request To Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Request To
                            </label>
                            <select
                                value={requestToFilter}
                                onChange={(e) => setRequestToFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Locations</option>
                                {getUniqueRequestTo().map((location, index) => (
                                    <option key={index} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter - Updated to exclude Complete */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="On Going">On Going</option>
                                <option value="On Delivery">On Delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Filter by User
                            </label>
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
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
                                From: {requestFromFilter}
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
                                    title="Remove request from filter"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {requestToFilter && (
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
                                To: {requestToFilter}
                                <button
                                    type="button"
                                    onClick={() => setRequestToFilter('')}
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
                                    title="Remove request to filter"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
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
                                    title="Remove status filter"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {userFilter && (
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
                                User: {userFilter}
                                <button
                                    type="button"
                                    onClick={() => setUserFilter('')}
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
                                    title="Remove user filter"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
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
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredData.length} of {nonCompleteRequests.length} active requests shown)
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
                                    <th className='th1'>REQUEST DATE</th>
                                    <th className='th1'>REQUEST FROM</th>
                                    <th className='th1'>REQUEST TO</th>
                                    <th className='th1'>REQUEST BY</th>
                                    <th className='th1'>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr
                                        className='table-row'
                                        key={i}
                                        onClick={() => triggerModal('trackRequestDetails', p.request_stock_id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className='td-name'>{p.request_stock_id || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{p.date || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{p.reqFrom || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{p.reqTo || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {`${p.fname || ''} ${p.mname || ''} ${p.lname || ''}`.trim() || 'N/A'}
                                        </td>
                                        <td style={{
                                            fontWeight: 'bold',
                                            color: p.request_status === "Pending" ? "red"
                                                : p.request_status === "Delivered" ? "green"
                                                    : p.request_status === "On Going" ? "orange"
                                                        : p.request_status === "On Delivery" ? "goldenrod"
                                                            : p.request_status === "Complete" ? "blue"
                                                                : "black",
                                            textAlign: "center",
                                        }}>
                                            {p.request_status || 'Unknown'}
                                        </td>
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
                                {nonCompleteRequests.length === 0 ? 'No active requests to track' : 'No requests match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {nonCompleteRequests.length === 0
                                    ? 'All requests are completed. Check the Completed Requests to view completed requests.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && currentItems.length > 0 && (
                    <div style={{ justifySelf: 'center', marginTop: '20px' }}>
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

export default TrackRequestIM;