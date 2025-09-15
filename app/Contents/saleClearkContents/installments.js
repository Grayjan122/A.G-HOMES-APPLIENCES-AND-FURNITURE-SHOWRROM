'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { Alert } from 'react-bootstrap';
import "../../css/inventory-css/inventory.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ITEMS_PER_PAGE = 8;
const MODAL_ITEMS_PER_PAGE = 5;

const InstallmentSC = () => {
    // Core states
    const [installmentList, setInstallmentList] = useState([]);
    const [installmentDList, setInstallmentDList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [filterSearch, setFilterSearch] = useState('');
    const [filterBalance, setFilterBalance] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    // Modal state and selected installment data
    const [installmentDVisible, setInstallmentsDVisible] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);

    // Modal pagination states
    const [currentModalPage, setCurrentModalPage] = useState(1);

    // Function to check if payment is overdue by 3+ days and calculate penalty
    const calculateOverduePenalty = (payment) => {
        const today = new Date();
        const dueDate = new Date(payment.due_date);
        const daysDifference = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        const originalAmount = parseFloat(payment.amount_due || 0);
        
        // Check if payment is unpaid and overdue by 3+ days
        if (payment.status !== 'Paid' && daysDifference >= 3) {
            const penaltyAmount = originalAmount * 0.05; // 5% penalty
            const totalAmount = originalAmount + penaltyAmount;
            
            return {
                ...payment,
                original_amount: originalAmount,
                penalty_amount: penaltyAmount,
                total_amount: totalAmount,
                has_penalty: true,
                days_overdue: daysDifference
            };
        }
        
        return {
            ...payment,
            original_amount: originalAmount,
            penalty_amount: 0,
            total_amount: originalAmount,
            has_penalty: false,
            days_overdue: daysDifference > 0 ? daysDifference : 0
        };
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterBalance]);

    // Apply filters and sorting to the data
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...installmentList];

        // Filter by search term (customer name or staff name)
        if (filterSearch.trim()) {
            const searchTerm = filterSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.cust_name?.toLowerCase().includes(searchTerm) ||
                `${item.fname} ${item.mname} ${item.lname}`.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by balance range
        if (filterBalance) {
            filtered = filtered.filter(item => {
                const balance = parseFloat(item.balance) || 0;
                switch (filterBalance) {
                    case 'low':
                        return balance < 1000;
                    case 'medium':
                        return balance >= 1000 && balance < 5000;
                    case 'high':
                        return balance >= 5000;
                    case 'zero':
                        return balance === 0;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting if a field is selected
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle different data types
                if (sortField === 'balance') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                } else if (sortField === 'cust_name') {
                    aVal = (aVal || '').toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                } else if (sortField === 'staff_name') {
                    aVal = `${a.fname || ''} ${a.mname || ''} ${a.lname || ''}`.toLowerCase();
                    bVal = `${b.fname || ''} ${b.mname || ''} ${b.lname || ''}`.toLowerCase();
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [installmentList, filterSearch, filterBalance, sortField, sortDirection]);

    // Pagination calculations using filtered and sorted data
    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Process installment details with penalty calculations
    const processedInstallmentDList = useMemo(() => {
        return installmentDList.map(payment => calculateOverduePenalty(payment));
    }, [installmentDList]);

    // Modal pagination calculations using processed data
    const totalModalPages = Math.ceil(processedInstallmentDList.length / MODAL_ITEMS_PER_PAGE);
    const modalStartIndex = (currentModalPage - 1) * MODAL_ITEMS_PER_PAGE;
    const currentModalItems = processedInstallmentDList.slice(modalStartIndex, modalStartIndex + MODAL_ITEMS_PER_PAGE);

    // Initialize data on mount
    useEffect(() => {
        GetInstallment();
    }, []);

    const Logs = async (accID, activity) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            await axios.get(`${baseURL}audit-log.php`, {
                params: {
                    json: JSON.stringify({ accID, activity }),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error recording logs:", error);
        }
    };

    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID }),
                    operation: "GetInstallment"
                }
            });

            setInstallmentList(response.data);
            Logs(accountID, 'Viewed installment management for ' + locName);
        } catch (error) {
            console.error("Error fetching installments:", error);
        }
    };

    const GetInstallmentD = async (id) => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify({ installmentID: id }),
                    operation: "GetInstallmentD"
                }
            });

            setInstallmentDList(response.data);
        } catch (error) {
            console.error("Error fetching installment details:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleModalPageChange = (page) => {
        if (page >= 1 && page <= totalModalPages) {
            setCurrentModalPage(page);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ opacity: 0.3, marginLeft: '5px' }}
        >
            <path d="m7 14 5-5 5 5" />
            <path d="m7 10 5 5 5-5" />
        </svg>;
        return sortDirection === 'asc' ? <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginLeft: '5px' }}
        >
            <path d="m7 14 5-5 5 5" />
        </svg> : <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginLeft: '5px' }}
        >
            <path d="m7 10 5 5 5-5" />
        </svg>;
    };

    // Clear all filters function
    const clearAllFilters = () => {
        setFilterSearch('');
        setFilterBalance('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    // Handle row click to show installment details
    const handleRowClick = (installment) => {
        setSelectedInstallment(installment);
        setInstallmentsDVisible(true);
        setCurrentModalPage(1); // Reset modal pagination when opening new modal
        GetInstallmentD(installment.installment_sales_id);
    };

    return (
        <>
            <Modal show={installmentDVisible} onHide={() => { setInstallmentsDVisible(false); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Installment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body'>
                    {selectedInstallment && (
                        <div className="r-details-head">
                            <div className='r-d-div'>
                                <div className='r-1'><strong>INSTALLMENT ID:</strong> {selectedInstallment.installment_sales_id}</div>
                            </div>
                            <div><strong>CUSTOMER NAME:</strong> {selectedInstallment.cust_name}</div>
                            <div><strong>BALANCE:</strong> ₱{parseFloat(selectedInstallment.balance || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</div>
                            <div><strong>TRANSACTION FROM:</strong> {selectedInstallment.location_name}</div>
                            <div><strong>PROCESSED BY:</strong> {`${selectedInstallment.fname || ''} ${selectedInstallment.mname || ''} ${selectedInstallment.lname || ''}`.trim()}</div>
                            {selectedInstallment.created_at && (
                                <div><strong>CREATED ON:</strong> {new Date(selectedInstallment.created_at).toLocaleDateString()}</div>
                            )}
                        </div>
                    )}

                    <div className='tableContainer1' style={{ height: '30vh' }}>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>PAYMENT #</th>
                                    <th className='th1'>AMOUNT</th>
                                    <th className='th1'>DUE DATE</th>
                                    <th className='th1'>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentModalItems.length > 0 ? (
                                    currentModalItems.map((p, i) => (
                                        <tr className='table-row' key={i}>
                                            <td className='td-name'>{p.payment_number}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {p.has_penalty ? (
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: '#6c757d', textDecoration: 'line-through' }}>
                                                            ₱{p.original_amount.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </div>
                                                        <div style={{ fontWeight: 'bold', color: '#dc3545' }}>
                                                            ₱{p.total_amount.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#dc3545' }}>
                                                            (+5% penalty)
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        ₱{p.original_amount.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div>{new Date(p.due_date).toLocaleDateString()}</div>
                                                {p.days_overdue > 0 && p.status !== 'Paid' && (
                                                    <div style={{ 
                                                        fontSize: '10px', 
                                                        color: p.days_overdue >= 3 ? '#dc3545' : '#ffc107',
                                                        fontWeight: '500'
                                                    }}>
                                                        {p.days_overdue} day{p.days_overdue > 1 ? 's' : ''} overdue
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: p.status === 'Paid' ? '#d4edda' :
                                                        p.status === 'Overdue' ? '#f8d7da' : '#fff3cd',
                                                    color: p.status === 'Paid' ? '#155724' :
                                                        p.status === 'Overdue' ? '#721c24' : '#856404'
                                                }}>
                                                    {p.status}
                                                </span>
                                                {p.has_penalty && (
                                                    <div style={{ 
                                                        fontSize: '10px', 
                                                        color: '#dc3545', 
                                                        marginTop: '2px',
                                                        fontWeight: '500'
                                                    }}>
                                                        With Penalty
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                            No payment details found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal Pagination */}
                    {totalModalPages > 1 && (
                        <div style={{ justifyContent: 'center', marginTop: '15px', display: 'flex' }}>
                            <CustomPagination
                                currentPage={currentModalPage}
                                totalPages={totalModalPages}
                                onPageChange={handleModalPageChange}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setInstallmentsDVisible(false); }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>INSTALLMENT MANAGEMENT</h1>
                </div>

                {/* Filter Controls */}
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
                        {/* Search Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}>
                                Search Customer/Staff
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
                                    placeholder="Search customer or staff name..."
                                    value={filterSearch}
                                    onChange={(e) => setFilterSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {filterSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterSearch('')}
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

                {/* Active Filters Display */}
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

                        {filterSearch && (
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
                                Search: "{filterSearch}"
                                <button
                                    type="button"
                                    onClick={() => setFilterSearch('')}
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
                                        height: '18px'
                                    }}
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {filterBalance && (
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
                                Balance: {filterBalance}
                                <button
                                    type="button"
                                    onClick={() => setFilterBalance('')}
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
                                        height: '18px'
                                    }}
                                    title="Remove balance filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {!filterSearch && !filterBalance && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedData.length} of {installmentList.length} records shown)
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

                {/* Table */}
                <div className='tableContainer' style={{ height: '40vh', overflowY: 'auto' }}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th className='t2'>
                                    <span>INSTALLMENT ID</span>
                                </th>
                                <th
                                    className='t3'
                                    onClick={() => handleSort('cust_name')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by customer name"
                                >
                                    <span>CUSTOMER NAME {getSortIcon('cust_name')}</span>
                                </th>
                                <th
                                    className='th1'
                                    onClick={() => handleSort('balance')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by balance"
                                >
                                    <span>BALANCE {getSortIcon('balance')}</span>
                                </th>
                                <th
                                    className='th1'
                                    onClick={() => handleSort('staff_name')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    title="Click to sort by staff name"
                                >
                                    <span>DONE BY {getSortIcon('staff_name')}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, i) => (
                                    <tr className='table-row' key={i}
                                        onClick={() => handleRowClick(item)}
                                        style={{ cursor: 'pointer' }}>
                                        <td className='td-name'>{item.installment_sales_id}</td>
                                        <td className='td-name'>{item.cust_name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            ₱{parseFloat(item.balance || 0).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {`${item.fname || ''} ${item.mname || ''} ${item.lname || ''}`.trim()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "15px", fontStyle: "italic" }}>
                                        {installmentList.length === 0 ?
                                            "No installment records found" :
                                            "No records match the current filters"
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
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

export default InstallmentSC;