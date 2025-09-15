'use client';
import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const SaleAdmin = () => {
    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');

    const [salesByInvoice, setSalesByInvoice] = useState([]);
    const [locationList, setLocationList] = useState([]);
    
    // Filter states
    const [locationFilter, setLocationFilter] = useState('');
    const [salesFromFilter, setSalesFromFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // 'daily', 'monthly', or ''
    const [specificDate, setSpecificDate] = useState('');
    const [specificMonth, setSpecificMonth] = useState('');

    const [currentPage, setCurrentPage] = useState(1);

    // Report states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDateFrom, setReportDateFrom] = useState('');
    const [reportDateTo, setReportDateTo] = useState('');
    const [reportLocationFilter, setReportLocationFilter] = useState('');
    const [reportData, setReportData] = useState([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportType, setReportType] = useState('date_range'); // 'date_range' or 'monthly'
    const [reportMonth, setReportMonth] = useState('');

    // Get unique sales from values
    const uniqueSalesFrom = [...new Set(salesByInvoice.map(sale => sale.sales_from))].filter(Boolean);

    // Filter the sales data
    const filteredSales = salesByInvoice.filter(sale => {
        // Location filter
        if (locationFilter && sale.location_id != locationFilter) {
            return false;
        }

        // Sales from filter
        if (salesFromFilter && sale.sales_from !== salesFromFilter) {
            return false;
        }

        // Date filters
        if (dateFilter === 'daily' && specificDate) {
            const saleDate = new Date(sale.date).toDateString();
            const filterDate = new Date(specificDate).toDateString();
            if (saleDate !== filterDate) {
                return false;
            }
        }

        if (dateFilter === 'monthly' && specificMonth) {
            const saleMonth = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM format
            if (saleMonth !== specificMonth) {
                return false;
            }
        }

        return true;
    });

    // Calculate total sales for filtered data
    const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);

    // Pagination for filtered data
    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));

        GetLocation();
        GetSalesByInvoice();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [locationFilter, salesFromFilter, dateFilter, specificDate, specificMonth]);

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

    const GetSalesByInvoice = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const response = await axios.get(`${baseURL}sales.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "SalesByInvoice"
                }
            });
            setSalesByInvoice(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching sales invoice:", error);
        }
    };

    const clearAllFilters = () => {
        setLocationFilter('');
        setSalesFromFilter('');
        setDateFilter('');
        setSpecificDate('');
        setSpecificMonth('');
    };

    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'location':
                setLocationFilter('');
                break;
            case 'salesFrom':
                setSalesFromFilter('');
                break;
            case 'date':
                setDateFilter('');
                setSpecificDate('');
                setSpecificMonth('');
                break;
        }
    };

    // Report Functions
    const generateReport = () => {
        // Validation based on report type
        if (reportType === 'date_range') {
            if (!reportDateFrom || !reportDateTo) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Please select both start and end dates for the report.',
                    button: 'Okay'
                });
                return;
            }

            if (new Date(reportDateFrom) > new Date(reportDateTo)) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Start date cannot be later than end date.',
                    button: 'Okay'
                });
                return;
            }
        } else if (reportType === 'monthly') {
            if (!reportMonth) {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Please select a month for the report.',
                    button: 'Okay'
                });
                return;
            }
        }

        setIsGeneratingReport(true);

        // Filter sales data based on report type
        const reportSales = salesByInvoice.filter(sale => {
            const saleDate = new Date(sale.date);
            let inDateRange = false;

            if (reportType === 'date_range') {
                const fromDate = new Date(reportDateFrom);
                const toDate = new Date(reportDateTo);
                
                // Set time to start and end of day for proper comparison
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                
                inDateRange = saleDate >= fromDate && saleDate <= toDate;
            } else if (reportType === 'monthly') {
                const saleMonth = saleDate.toISOString().slice(0, 7); // YYYY-MM format
                inDateRange = saleMonth === reportMonth;
            }

            // Check location filter
            const locationMatch = reportLocationFilter === '' || sale.location_id === reportLocationFilter;

            return inDateRange && locationMatch;
        });

        // Group sales by location and sales_from, combining walk-in and customer sales
        const groupedData = reportSales.reduce((acc, sale) => {
            const locationName = locationList.find(loc => loc.location_id === sale.location_id)?.location_name || 'Unknown Location';
            let salesFrom = sale.sales_from || 'Unknown Source';

            // Combine walk-in sales and customer sales into "Full Purchase"
            const salesFromLower = salesFrom.toLowerCase();
            if (salesFromLower === 'walk-in sales' || salesFromLower === 'customer sales') {
                salesFrom = 'Full Purchase';
            }

            const key = `${locationName}_${salesFrom}`;

            if (!acc[key]) {
                acc[key] = {
                    location: locationName,
                    salesFrom: salesFrom,
                    totalAmount: 0,
                    totalTransactions: 0,
                    transactions: []
                };
            }

            acc[key].totalAmount += parseFloat(sale.amount || 0);
            acc[key].totalTransactions += 1;
            acc[key].transactions.push(sale);

            return acc;
        }, {});

        // Calculate date range for monthly reports
        let dateRangeForReport;
        if (reportType === 'monthly') {
            const firstDay = reportMonth + '-01';
            const lastDay = new Date(new Date(firstDay).getFullYear(), new Date(firstDay).getMonth() + 1, 0).toISOString().slice(0, 10);
            dateRangeForReport = { from: firstDay, to: lastDay };
        } else {
            dateRangeForReport = { from: reportDateFrom, to: reportDateTo };
        }

        setReportData({
            sales: reportSales,
            grouped: Object.values(groupedData),
            totalSales: reportSales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0),
            totalTransactions: reportSales.length,
            dateRange: dateRangeForReport,
            locationFilter: reportLocationFilter,
            reportType: reportType,
            reportMonth: reportMonth
        });

        setIsGeneratingReport(false);
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        const locationFilterText = reportLocationFilter
            ? locationList.find(loc => loc.location_id === reportLocationFilter)?.location_name || 'Selected Location'
            : 'All Locations';

        const periodText = reportData.reportType === 'monthly' 
            ? `Month: ${new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
            : `Period: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report - ${reportData.reportType === 'monthly' ? new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : reportData.dateRange.from + ' to ' + reportData.dateRange.to}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333; 
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 15px;
                    }
                    .summary { 
                        background-color: #f8f9fa; 
                        padding: 15px; 
                        border-radius: 8px; 
                        margin-bottom: 20px; 
                        border-left: 4px solid #28a745;
                    }
                    .summary-item { 
                        margin: 8px 0; 
                        font-size: 16px;
                    }
                    .group-section { 
                        margin: 20px 0; 
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .group-header { 
                        background-color: #007bff; 
                        color: white; 
                        padding: 12px 15px; 
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .group-content { 
                        padding: 15px; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 10px;
                    }
                    th, td { 
                        border: 1px solid #dee2e6; 
                        padding: 8px 12px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f8f9fa; 
                        font-weight: bold;
                    }
                    .total-row { 
                        background-color: #e8f5e8; 
                        font-weight: bold; 
                    }
                    .print-date { 
                        text-align: right; 
                        color: #6c757d; 
                        font-size: 12px; 
                        margin-top: 20px; 
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SALES REPORT</h1>
                    <h3>${periodText}</h3>
                    <h4>Location: ${locationFilterText}</h4>
                </div>
                
                <div class="summary">
                    <h3 style="margin-top: 0; color: #28a745;">Summary</h3>
                    <div class="summary-item"><strong>Location Filter:</strong> ${locationFilterText}</div>
                    <div class="summary-item"><strong>Total Sales:</strong> ₱${reportData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="summary-item"><strong>Total Transactions:</strong> ${reportData.totalTransactions}</div>
                    <div class="summary-item"><strong>Average Transaction:</strong> ₱${reportData.totalTransactions > 0 ? (reportData.totalSales / reportData.totalTransactions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                </div>

                ${reportData.grouped.map(group => `
                    <div class="group-section">
                        <div class="group-header">
                            ${group.location} - ${group.salesFrom}
                        </div>
                        <div class="group-content">
                            <p><strong>Total Sales:</strong> ₱${group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Total Transactions:</strong> ${group.totalTransactions}</p>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Sale Type</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${group.transactions.map(transaction => `
                                        <tr>
                                            <td>${transaction.invoice_id}</td>
                                            <td>${transaction.date}</td>
                                            <td>${transaction.time}</td>
                                            <td>${transaction.sales_from || 'N/A'}</td>
                                            <td>₱${parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    `).join('')}
                                    <tr class="total-row">
                                        <td colspan="4"><strong>Subtotal</strong></td>
                                        <td><strong>₱${group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}

                <div class="print-date">
                    Generated on: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <>
            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>SALES MANAGEMENT</h1>

                    {/* Sales Report Button */}
                    <button
                        onClick={() => setShowReportModal(true)}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginLeft: "auto"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0056b3';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                        }}
                    >
                        📊 Generate Sales Report
                    </button>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
                        {/* Location Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Location
                            </label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Locations</option>
                                {locationList.map((location) => (
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sales From Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Sales From
                            </label>
                            <select
                                value={salesFromFilter}
                                onChange={(e) => setSalesFromFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Sources</option>
                                {uniqueSalesFrom.map((source) => (
                                    <option key={source} value={source}>
                                        {source}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter Type */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Date Filter
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    setSpecificDate('');
                                    setSpecificMonth('');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Dates</option>
                                <option value="daily">Daily Sales</option>
                                <option value="monthly">Monthly Sales</option>
                            </select>
                        </div>

                        {/* Specific Date Input */}
                        {dateFilter === 'daily' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={specificDate}
                                    onChange={(e) => setSpecificDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        )}

                        {/* Specific Month Input */}
                        {dateFilter === 'monthly' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                    Select Month
                                </label>
                                <input
                                    type="month"
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Total Sales Summary */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #c3e6c3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#155724' }}>
                            Total Sales: ₱{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ marginLeft: '15px', fontSize: '14px', color: '#6c757d' }}>
                            ({filteredSales.length} of {salesByInvoice.length} records)
                        </span>
                    </div>
                </div>

                {/* Active Filters */}
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

                        {locationFilter && (
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
                                Location: {locationList.find(loc => loc.location_id === locationFilter)?.location_name || locationFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('location')}
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
                                    title="Remove location filter"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {salesFromFilter && (
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
                                Sales From: {salesFromFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('salesFrom')}
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
                                    title="Remove sales from filter"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {dateFilter && (
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
                                {dateFilter === 'daily' && specificDate && `Daily: ${new Date(specificDate).toLocaleDateString()}`}
                                {dateFilter === 'monthly' && specificMonth && `Monthly: ${new Date(specificMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                                {dateFilter && !specificDate && !specificMonth && `${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)} Sales`}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('date')}
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
                                    title="Remove date filter"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </span>
                        )}

                        {!locationFilter && !salesFromFilter && !dateFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}
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



                <div className='tableContainer' style={{ height: '35vh', overflowY: 'auto' }}>
                    {currentItems && currentItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>INVOICE #</th>
                                    <th className='th1'>SALES FROM</th>
                                    <th className='th1'>TOTAL</th>
                                    <th className='th1'>DATE</th>
                                    <th className='th1'>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr className='table-row' key={i} onClick={() => { }}>
                                        <td className='td-name'>{p.invoice_id}</td>
                                        <td style={{ textAlign: 'center' }}>{p.sales_from}</td>
                                        <td style={{ textAlign: 'center' }}>₱{parseFloat(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td style={{ textAlign: 'center' }}>{p.date}</td>
                                        <td style={{ textAlign: 'center' }}>{p.time}</td>
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
                                📊
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {salesByInvoice.length === 0 ? 'No sales data available' : 'No sales match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {salesByInvoice.length === 0
                                    ? 'Sales data will appear here once transactions are recorded.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && currentItems && currentItems.length > 0 && (
                    <div style={{ justifySelf: 'center' }}>
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            color="green"
                        />
                    </div>
                )}

                {/* Sales Report Modal */}
                {showReportModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '0',
                            maxWidth: '90%',
                            maxHeight: '90%',
                            width: reportData.sales ? '1000px' : '500px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                    📊 Sales Report Generator
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowReportModal(false);
                                        setReportData([]);
                                        setReportDateFrom('');
                                        setReportDateTo('');
                                        setReportLocationFilter('');
                                        setReportType('date_range');
                                        setReportMonth('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        padding: '0',
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '20px'
                            }}>
                                {!reportData.sales ? (
                                    // Date Range Selection
                                    <div>
                                        <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
                                            Select a report type and specify the date range or month to generate your sales report. The report will include detailed sales data, summaries, and analytics for the selected period.
                                        </p>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: reportType === 'date_range' ? '1fr 1fr 1fr' : '1fr 1fr',
                                            gap: '20px',
                                            marginBottom: '30px'
                                        }}>
                                            {/* Report Type Selection */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '500',
                                                    color: '#333'
                                                }}>
                                                    Report Type *
                                                </label>
                                                <select
                                                    value={reportType}
                                                    onChange={(e) => {
                                                        setReportType(e.target.value);
                                                        // Clear existing selections when switching types
                                                        if (e.target.value === 'monthly') {
                                                            setReportDateFrom('');
                                                            setReportDateTo('');
                                                        } else {
                                                            setReportMonth('');
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '2px solid #e9ecef',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        transition: 'border-color 0.2s'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#007bff';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#e9ecef';
                                                    }}
                                                >
                                                    <option value="date_range">Date Range</option>
                                                    <option value="monthly">Monthly Report</option>
                                                </select>
                                            </div>

                                            {/* Date Range Fields - Only show when date_range is selected */}
                                            {reportType === 'date_range' && (
                                                <>
                                                    <div>
                                                        <label style={{
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                            fontWeight: '500',
                                                            color: '#333'
                                                        }}>
                                                            From Date *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={reportDateFrom}
                                                            onChange={(e) => setReportDateFrom(e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                border: '2px solid #e9ecef',
                                                                borderRadius: '8px',
                                                                fontSize: '14px',
                                                                transition: 'border-color 0.2s'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#007bff';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e9ecef';
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label style={{
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                            fontWeight: '500',
                                                            color: '#333'
                                                        }}>
                                                            To Date *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={reportDateTo}
                                                            onChange={(e) => setReportDateTo(e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                border: '2px solid #e9ecef',
                                                                borderRadius: '8px',
                                                                fontSize: '14px',
                                                                transition: 'border-color 0.2s'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#007bff';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e9ecef';
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Monthly Selection - Only show when monthly is selected */}
                                            {reportType === 'monthly' && (
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontWeight: '500',
                                                        color: '#333'
                                                    }}>
                                                        Select Month *
                                                    </label>
                                                    <input
                                                        type="month"
                                                        value={reportMonth}
                                                        onChange={(e) => setReportMonth(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            transition: 'border-color 0.2s'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#007bff';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e9ecef';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Location Filter - Always show */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '500',
                                                    color: '#333'
                                                }}>
                                                    Location
                                                </label>
                                                <select
                                                    value={reportLocationFilter}
                                                    onChange={(e) => setReportLocationFilter(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '2px solid #e9ecef',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        transition: 'border-color 0.2s'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#007bff';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#e9ecef';
                                                    }}
                                                >
                                                    <option value="">All Locations</option>
                                                    {locationList.map((location) => (
                                                        <option key={location.location_id} value={location.location_id}>
                                                            {location.location_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '12px'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    setShowReportModal(false);
                                                    setReportDateFrom('');
                                                    setReportDateTo('');
                                                    setReportLocationFilter('');
                                                    setReportType('date_range');
                                                    setReportMonth('');
                                                }}
                                                style={{
                                                    padding: '12px 24px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#5a6268';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '#6c757d';
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={generateReport}
                                                disabled={isGeneratingReport || 
                                                    (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                    (reportType === 'monthly' && !reportMonth)
                                                }
                                                style={{
                                                    padding: '12px 24px',
                                                    backgroundColor: (
                                                        (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                        (reportType === 'monthly' && !reportMonth)
                                                    ) ? '#ccc' : '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: (
                                                        (reportType === 'date_range' && (!reportDateFrom || !reportDateTo)) ||
                                                        (reportType === 'monthly' && !reportMonth)
                                                    ) ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (
                                                        (reportType === 'date_range' && reportDateFrom && reportDateTo) ||
                                                        (reportType === 'monthly' && reportMonth)
                                                    ) {
                                                        e.target.style.backgroundColor = '#218838';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (
                                                        (reportType === 'date_range' && reportDateFrom && reportDateTo) ||
                                                        (reportType === 'monthly' && reportMonth)
                                                    ) {
                                                        e.target.style.backgroundColor = '#28a745';
                                                    }
                                                }}
                                            >
                                                {isGeneratingReport ? (
                                                    <>
                                                        <div style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            border: '2px solid transparent',
                                                            borderTop: '2px solid white',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite'
                                                        }}></div>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    'Generate Report'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Report Display
                                    <div>
                                        {/* Report Header */}
                                        <div style={{
                                            textAlign: 'center',
                                            marginBottom: '30px',
                                            paddingBottom: '20px',
                                            borderBottom: '2px solid #007bff'
                                        }}>
                                            <h2 style={{
                                                margin: '0 0 10px 0',
                                                color: '#333',
                                                fontSize: '24px'
                                            }}>
                                                Sales Report
                                            </h2>
                                            <p style={{
                                                margin: '0 0 5px 0',
                                                color: '#6c757d',
                                                fontSize: '16px'
                                            }}>
                                                {reportData.reportType === 'monthly' 
                                                    ? `Month: ${new Date(reportData.dateRange.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                                                    : `Period: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`
                                                }
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                color: '#007bff',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}>
                                                Location: {reportLocationFilter
                                                    ? locationList.find(loc => loc.location_id === reportLocationFilter)?.location_name || 'Selected Location'
                                                    : 'All Locations'
                                                }
                                            </p>
                                        </div>

                                        {/* Summary Section */}
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '30px',
                                            borderLeft: '4px solid #28a745'
                                        }}>
                                            <h3 style={{
                                                margin: '0 0 15px 0',
                                                color: '#28a745',
                                                fontSize: '18px'
                                            }}>
                                                Summary
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '15px'
                                            }}>
                                                <div>
                                                    <strong style={{ fontSize: '16px', color: '#333' }}>Total Sales:</strong>
                                                    <div style={{ fontSize: '20px', color: '#28a745', fontWeight: 'bold' }}>
                                                        ₱{reportData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '16px', color: '#333' }}>Total Transactions:</strong>
                                                    <div style={{ fontSize: '20px', color: '#007bff', fontWeight: 'bold' }}>
                                                        {reportData.totalTransactions}
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '16px', color: '#333' }}>Average Transaction:</strong>
                                                    <div style={{ fontSize: '20px', color: '#6f42c1', fontWeight: 'bold' }}>
                                                        ₱{reportData.totalTransactions > 0 ? (reportData.totalSales / reportData.totalTransactions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grouped Data */}
                                        {reportData.grouped.map((group, index) => (
                                            <div key={index} style={{
                                                marginBottom: '25px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '12px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    padding: '15px',
                                                    fontWeight: 'bold',
                                                    fontSize: '16px'
                                                }}>
                                                    {group.location} - {group.salesFrom}
                                                </div>
                                                <div style={{ padding: '15px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '15px',
                                                        padding: '10px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <span><strong>Total Sales:</strong> ₱{group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        <span><strong>Transactions:</strong> {group.totalTransactions}</span>
                                                    </div>

                                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        <table style={{
                                                            width: '100%',
                                                            borderCollapse: 'collapse',
                                                            fontSize: '14px'
                                                        }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                                    <th style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600'
                                                                    }}>Invoice #</th>
                                                                    <th style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600'
                                                                    }}>Date</th>
                                                                    <th style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600'
                                                                    }}>Time</th>
                                                                    <th style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600'
                                                                    }}>Sale Type</th>
                                                                    <th style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'right',
                                                                        fontWeight: '600'
                                                                    }}>Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.transactions.map((transaction, tIndex) => (
                                                                    <tr key={tIndex}>
                                                                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                                                                            {transaction.invoice_id}
                                                                        </td>
                                                                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                                                                            {transaction.date}
                                                                        </td>
                                                                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                                                                            {transaction.time}
                                                                        </td>
                                                                        <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                                                                            {transaction.sales_from || 'N/A'}
                                                                        </td>
                                                                        <td style={{
                                                                            border: '1px solid #dee2e6',
                                                                            padding: '8px',
                                                                            textAlign: 'right'
                                                                        }}>
                                                                            ₱{parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr style={{
                                                                    backgroundColor: '#e8f5e8',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <td colSpan="4" style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px'
                                                                    }}>
                                                                        Subtotal
                                                                    </td>
                                                                    <td style={{
                                                                        border: '1px solid #dee2e6',
                                                                        padding: '8px',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        ₱{group.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {reportData.grouped.length === 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#6c757d'
                                            }}>
                                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                                                <h4>No sales data found</h4>
                                                <p>There are no sales records for the selected date range and location.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            {reportData.sales && (
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #dee2e6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                                        Generated on: {new Date().toLocaleString()}
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => {
                                                setReportData([]);
                                                setReportDateFrom('');
                                                setReportDateTo('');
                                                setReportLocationFilter('');
                                                setReportType('date_range');
                                                setReportMonth('');
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#6c757d';
                                            }}
                                        >
                                            Generate New Report
                                        </button>

                                        <button
                                            onClick={printReport}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#218838';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#28a745';
                                            }}
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add CSS for spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}

export default SaleAdmin;
                                
                                 