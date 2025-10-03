'use client';
import { useState, useEffect, useRef } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE = 12; // Increased for card layout
const REPORT_ITEMS_PER_PAGE = 8;

const InventoryIM = () => {
    // Essential state variables
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');
    const [inventoryList, setInventoryList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [inventReport, setInventReport] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPage1, setCurrentPage1] = useState(1);

    const [pName, setPname] = useState('');
    const [pDes, setDes] = useState('');

    // Search and filter states
    const [locID, setLocID] = useState(0);
    const [stockLevel, setStockLevel] = useState('');
    const [searchProd, setSearchProd] = useState('');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedInventoryList, setSortedInventoryList] = useState([]);

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');
    const [inventReportVisible, setInventReportVisible] = useState(true);

    // Sort function
    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        
        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    // Apply sorting to inventory list
    useEffect(() => {
        if (sortField && inventoryList.length > 0) {
            const sorted = [...inventoryList].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === 'qty') {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
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
            setSortedInventoryList(sorted);
        } else {
            setSortedInventoryList(inventoryList);
        }
    }, [inventoryList, sortField, sortDirection]);

    // Use sorted list for pagination
    const totalPages = Math.ceil(sortedInventoryList.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = sortedInventoryList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const totalPages1 = Math.ceil(inventReport.length / REPORT_ITEMS_PER_PAGE);
    const startIndex1 = (currentPage1 - 1) * REPORT_ITEMS_PER_PAGE;
    const currentItems1 = inventReport.slice(startIndex1, startIndex1 + REPORT_ITEMS_PER_PAGE);

    // Initialize user session
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));
    }, []);

    // Load data based on filters
    useEffect(() => {
        GetInventory();
        setCurrentPage(1);
    }, [locID, stockLevel, searchProd]);

    // Initial data load
    useEffect(() => {
        GetLocation();
        GetInventory();
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

    const GetLocation = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}location.php`, {
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

    const GetInventoryReport = async (prodID1, locID, prodName, pD) => {
        setPname(prodName);
        setDes(pD);
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locName = sessionStorage.getItem('location_name');
            const productID = prodID1;
            const locationID = locID;

            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID: locationID, prodID: productID }),
                    operation: "GetInventoryReport"
                }
            });

            setInventReport(response.data);
            Logs(accountID, 'Get the inventory reports of ' + prodName + ' in ' + locName + ' store');
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const GetInventory = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}inventory.php`, {
                params: {
                    json: JSON.stringify({ locID, stockLevel, search: searchProd }),
                    operation: "GetInventory"
                }
            });
            setInventoryList(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

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

    // Clear all filters function
    const clearAllFilters = () => {
        setLocID(0);
        setStockLevel('');
        setSearchProd('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    // Get location name by ID
    const getLocationName = (id) => {
        const location = locationList.find(loc => loc.location_id === parseInt(id));
        return location ? location.location_name : '';
    };

    // Get stock level display name
    const getStockLevelName = (level) => {
        switch (level) {
            case 'High': return 'In Stock';
            case 'Low': return 'No Stock';
            default: return level;
        }
    };

    // Remove individual filter
    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'location':
                setLocID(0);
                break;
            case 'stock':
                setStockLevel('');
                break;
            case 'search':
                setSearchProd('');
                break;
        }
    };

    // Get stock status color and text
    const getStockStatus = (qty) => {
        const quantity = parseInt(qty) || 0;
        if (quantity === 0) {
            return { color: '#dc3545', bg: '#f8d7da', text: 'Out of Stock', icon: '❌' };
        } else {
            return { color: '#198754', bg: '#d1e7dd', text: 'In Stock', icon: '✅' };
        }
    };

    // Render inventory cards
    const renderInventoryCards = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            padding: '20px 0'
        }}>
            {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                    const stockStatus = getStockStatus(item.qty);
                    return (
                        <div
                            key={index}
                            onClick={() => {
                                setInventReportVisible(false);
                                GetInventoryReport(item.product_id, item.location_id, item.product_name, item.description);
                            }}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e9ecef',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            {/* Stock status indicator */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                backgroundColor: stockStatus.bg,
                                color: stockStatus.color,
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>{stockStatus.icon}</span>
                                {stockStatus.text}
                            </div>

                            {/* Product info */}
                            <div style={{ marginTop: '10px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    margin: '0 0 8px 0',
                                    lineHeight: '1.4'
                                }}>
                                    {item.product_name}
                                </h3>

                                <p style={{
                                    fontSize: '14px',
                                    color: '#6c757d',
                                    margin: '0 0 16px 0',
                                    lineHeight: '1.5',
                                    height: '42px',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {item.description}
                                </p>

                                {/* Stats section */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    marginTop: '16px'
                                }}>
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: stockStatus.color,
                                            lineHeight: '1'
                                        }}>
                                            {item.qty}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#6c757d',
                                            marginTop: '4px',
                                            fontWeight: '500'
                                        }}>
                                            STOCK QTY
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#495057',
                                            lineHeight: '1.2',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.location_name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#6c757d',
                                            marginTop: '4px',
                                            fontWeight: '500'
                                        }}>
                                            STORE
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Click indicator */}
                            <div style={{
                                marginTop: '16px',
                                padding: '8px',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#6c757d',
                                borderTop: '1px solid #e9ecef',
                                fontStyle: 'italic'
                            }}>
                                Click to view detailed report →
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    color: '#6c757d'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#495057' }}>
                        No Inventory Items Found
                    </h3>
                    <p>
                        {sortedInventoryList.length === 0 ? 
                            "There are no inventory items in the system." : 
                            "No items match your current filter criteria."
                        }
                    </p>
                </div>
            )}
        </div>
    );

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

            {/* Enhanced Modal for Inventory Report */}
            <Modal show={!inventReportVisible} onHide={() => { setInventReportVisible(true); }} size='xl' className='request-modal'>
                <Modal.Header closeButton style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none'
                }}>
                    <Modal.Title style={{ fontWeight: '600' }}>📊 Product Inventory Report</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px', height: '70vh', overflowY: 'auto' }}>
                    {/* Product Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        padding: '24px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '6px'
                                }}>
                                    Product Code
                                </div>
                                <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '700', 
                                    color: '#2c3e50' 
                                }}>
                                    {pName}
                                </div>
                            </div>
                            <div>
                                <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '6px'
                                }}>
                                    Description
                                </div>
                                <div style={{ 
                                    fontSize: '16px', 
                                    color: '#495057' 
                                }}>
                                    {pDes}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Report Table */}
                    <div style={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef',
                        overflow: 'hidden'
                    }}>
                        {currentItems1.length > 0 ? (
                            <div>
                                {/* Table Header */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px 120px 100px 120px 120px 100px 1fr',
                                    gap: '1px',
                                    backgroundColor: '#f8f9fa',
                                    padding: '16px 20px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: '#495057',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: '2px solid #e9ecef'
                                }}>
                                    <div>Type</div>
                                    <div>Past Balance</div>
                                    <div>Qty</div>
                                    <div>Current Balance</div>
                                    <div>Date</div>
                                    <div>Time</div>
                                    <div>Done By</div>
                                </div>

                                {/* Table Body */}
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {currentItems1.map((item, index) => {
                                        // Check if transaction type should be negative
                                        const isNegativeType = ['Installment Sales', 'Sales', 'Transfer Stock'].includes(item.type);
                                        const displayQty = isNegativeType && parseInt(item.qty) > 0 ? -parseInt(item.qty) : parseInt(item.qty);
                                        const isPositiveChange = displayQty >= 0;
                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '100px 120px 100px 120px 120px 100px 1fr',
                                                    gap: '1px',
                                                    padding: '16px 20px',
                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                    alignItems: 'center',
                                                    fontSize: '14px',
                                                    borderBottom: '1px solid #e9ecef',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                                                }}
                                            >
                                                <div>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor: isNegativeType ? '#f8d7da' : '#d4edda',
                                                        color: isNegativeType ? '#721c24' : '#155724'
                                                    }}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: '600' }}>{item.past_balance}</div>
                                                <div style={{
                                                    fontWeight: '700',
                                                    color: isPositiveChange ? '#198754' : '#dc3545'
                                                }}>
                                                    {displayQty > 0 ? '+' : ''}{displayQty}
                                                </div>
                                                <div style={{ fontWeight: '600' }}>{item.current_balance}</div>
                                                <div style={{ color: '#6c757d' }}>{item.date}</div>
                                                <div style={{ color: '#6c757d' }}>{item.time}</div>
                                                <div style={{ color: '#495057' }}>
                                                    {`${item.fname} ${item.mname} ${item.lname}`.trim()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#6c757d'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#495057' }}>
                                    No Reports Found
                                </h3>
                                <p>No inventory records available for this product.</p>
                            </div>
                        )}
                    </div>

                    {totalPages1 > 1 && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            marginTop: '24px'
                        }}>
                            <CustomPagination
                                currentPage={currentPage1}
                                totalPages={totalPages1}
                                onPageChange={handlePageChange1}
                                color="green"
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ 
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    padding: '20px 30px'
                }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => { setInventReportVisible(true); }}
                        style={{
                            padding: '10px 24px',
                            fontWeight: '600',
                            borderRadius: '8px'
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header' style={{ marginBottom: '30px' }}>
                    <h1 className='h-customer' style={{ 
                        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'black',
                        // WebkitBackgroundClip: 'text',
                        // WebkitTextFillColor: 'transparent',
                        fontSize: '32px',
                        fontWeight: '700'
                    }}>
                        📦 INVENTORY MANAGEMENT
                    </h1>
                </div>

                {/* Enhanced Filter Controls */}
                <div style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: '12px',
                    margin: '20px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        alignItems: 'end'
                    }}>
                        {/* Store Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                🏪 Filter by Store
                            </label>
                            <select
                                value={locID}
                                onChange={(e) => setLocID(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e9ecef',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            >
                                <option value={0}>All Stores</option>
                                {locationList.map((r) => (
                                    <option key={r.location_id} value={r.location_id}>
                                        {r.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Level Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                📊 Filter by Stock Level
                            </label>
                            <select
                                value={stockLevel}
                                onChange={(e) => setStockLevel(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e9ecef',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            >
                                <option value={''}>All Stock Levels</option>
                                <option value={'High'}>In Stock</option>
                                <option value={'Low'}>No Stock</option>
                            </select>
                        </div>

                        {/* Search Filter */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '600', 
                                fontSize: '14px',
                                color: '#495057'
                            }}>
                                🔍 Search Products
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search by product code or description..."
                                    value={searchProd}
                                    onChange={(e) => setSearchProd(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 45px',
                                        border: '2px solid #e9ecef',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                                <div style={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6c757d'
                                }}>
                                    🔍
                                </div>
                                {searchProd && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchProd('')}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: '#dc3545',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                        title="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Filters & Stats */}
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🎯 Active Filters:
                        </div>

                        {locID > 0 && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: '1px solid #bbdefb'
                            }}>
                                🏪 {getLocationName(locID)}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('location')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#1976d2',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    title="Remove store filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {stockLevel && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#f3e5f5',
                                color: '#7b1fa2',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: '1px solid #ce93d8'
                            }}>
                                📊 {getStockLevelName(stockLevel)}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('stock')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#7b1fa2',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    title="Remove stock filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {searchProd && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: '1px solid #a5d6a7'
                            }}>
                                🔍 "{searchProd}"
                                <button
                                    type="button"
                                    onClick={() => removeFilter('search')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#2e7d32',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    title="Remove search filter"
                                >
                                    ✕
                                </button>
                            </span>
                        )}

                        {!locID && !stockLevel && !searchProd && (
                            <span style={{ 
                                color: '#6c757d',
                                fontStyle: 'italic',
                                fontSize: '14px'
                            }}>
                                None applied
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#495057',
                            border: '1px solid #e9ecef'
                        }}>
                            📊 {sortedInventoryList.length} items found
                        </div>

                        <button
                            type="button"
                            onClick={clearAllFilters}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            🗑️ Clear All
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {sortedInventoryList.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        margin: '20px 0'
                    }}>
                        {(() => {
                            const inStock = sortedInventoryList.filter(item => parseInt(item.qty) > 0).length;
                            const outOfStock = sortedInventoryList.filter(item => parseInt(item.qty) === 0).length;
                            const totalStock = sortedInventoryList.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

                            return [
                                { title: 'Total Items', value: sortedInventoryList.length, icon: '📦', color: '#17a2b8', bg: '#d1ecf1' },
                                { title: 'In Stock', value: inStock, icon: '✅', color: '#28a745', bg: '#d4edda' },
                                { title: 'Out of Stock', value: outOfStock, icon: '❌', color: '#dc3545', bg: '#f8d7da' },
                                { title: 'Total Quantity', value: totalStock, icon: '📊', color: '#6f42c1', bg: '#e2d9f3' }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '20px',
                                        backgroundColor: stat.bg,
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        border: `2px solid ${stat.color}20`
                                    }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: stat.color,
                                        marginBottom: '4px'
                                    }}>
                                        {stat.value}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#6c757d',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {stat.title}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                {/* Sort Controls */}
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#495057',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🔄 Sort by:
                    </div>

                    {[
                        { field: 'product_name', label: 'Product Code' },
                        { field: 'description', label: 'Description' },
                        { field: 'qty', label: 'Stock Quantity' },
                        { field: 'location_name', label: 'Store Name' }
                    ].map((sort) => (
                        <button
                            key={sort.field}
                            onClick={() => handleSort(sort.field)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: sortField === sort.field ? '#667eea' : '#f8f9fa',
                                color: sortField === sort.field ? 'white' : '#495057',
                                border: '1px solid #e9ecef',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (sortField !== sort.field) {
                                    e.target.style.backgroundColor = '#e9ecef';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (sortField !== sort.field) {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                }
                            }}
                        >
                            {sort.label}
                            {sortField === sort.field && (
                                <span style={{ fontSize: '12px' }}>
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Inventory Display */}
                {renderInventoryCards()}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        marginTop: '30px'
                    }}>
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

export default InventoryIM;