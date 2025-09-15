'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";
import { TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Users, BarChart3, PieChart } from 'lucide-react';

// import Dashboard from '@/app/Contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Inventory from '@/app/Contents/admin-contents/Inventory/page';
import Location from '@/app/Contents/admin-contents/Location/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';
import Customer from '@/app/Contents/admin-contents/Customer/page';
import User from '@/app/Contents/admin-contents/User/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';
import { useRouter } from "next/navigation";

const DashboardAdmin = ({ onNavigateToSales }) => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
        weeklySales: '0.00',
    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
    ];

    const [salesByInvoice, setSalesByInvoice] = useState([]);

    useEffect(() => {
        GetSalesByInvoice();
    }, []);

    useEffect(() => {
        countConfigs.forEach(config => fetchCount(config));
    }, []);

    const fetchCount = async ({ id, from, name, stateKey }) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'counts.php';

        const countDetails = { ID: id, tFrom: from, tName: name };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(countDetails),
                    operation: 'Count'
                }
            });

            const countValue = response.data?.[0]?.[name] || '0';

            setCounts(prev => ({
                ...prev,
                [stateKey]: countValue
            }));
        } catch (error) {
            console.error(`Error fetching ${stateKey}:`, error);
        }
    };

    // Sales calculation functions
    const calculateDailySales = (salesData) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const dailyTotal = salesData
            .filter(sale => sale.date === todayStr)
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        return dailyTotal.toFixed(2);
    };

    const calculateWeeklySales = (salesData) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyTotal = salesData
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startOfWeek && saleDate <= endOfWeek;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        return weeklyTotal.toFixed(2);
    };

    const calculateMonthlySales = (salesData) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthlyTotal = salesData
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        return monthlyTotal.toFixed(2);
    };

    const getSalesByLocation = (salesData, period = 'monthly') => {
        let filteredData = [];

        if (period === 'daily') {
            const today = new Date().toISOString().split('T')[0];
            filteredData = salesData.filter(sale => sale.date === today);
        } else if (period === 'weekly') {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            filteredData = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startOfWeek && saleDate <= endOfWeek;
            });
        } else {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            filteredData = salesData.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            });
        }

        const locationSales = {};
        filteredData.forEach(sale => {
            const locationName = sale.location_name || 'Unknown Location';
            if (!locationSales[locationName]) {
                locationSales[locationName] = 0;
            }
            locationSales[locationName] += parseFloat(sale.amount || 0);
        });

        return locationSales;
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

            if (response.data && response.data.length > 0) {
                const dailyTotal = calculateDailySales(response.data);
                const weeklyTotal = calculateWeeklySales(response.data);
                const monthlyTotal = calculateMonthlySales(response.data);

                setCounts(prev => ({
                    ...prev,
                    dailySales: dailyTotal,
                    weeklySales: weeklyTotal,
                    montlySales: monthlyTotal
                }));

                console.log('Daily sales by location:', getSalesByLocation(response.data, 'daily'));
                console.log('Weekly sales by location:', getSalesByLocation(response.data, 'weekly'));
                console.log('Monthly sales by location:', getSalesByLocation(response.data, 'monthly'));
            }
        } catch (error) {
            console.error("Error fetching sales invoice:", error);
        }
    };

    const router = useRouter();

    // Navigation handlers for sales cards
    const handleSalesCardClick = (filterType) => {
        const today = new Date();
        let filterData = {};

        switch (filterType) {
            case 'daily':
                filterData = {
                    dateFilter: 'daily',
                    specificDate: today.toISOString().split('T')[0]
                };
                break;
            case 'weekly':
                // No specific date needed for weekly, just set the filter
                filterData = {
                    dateFilter: 'weekly'
                };
                break;
            case 'monthly':
                filterData = {
                    dateFilter: 'monthly',
                    specificMonth: today.toISOString().slice(0, 7) // YYYY-MM format
                };
                break;
        }

        // Call the navigation function passed from parent
        if (onNavigateToSales) {
            onNavigateToSales(filterData);
        }
    };

    // Chart Components with inline styles
    const BarChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.sales === 'number' && !isNaN(item.sales));
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...validData.map(item => item.sales));

        return (
            <div className="card shadow" style={{ marginBottom: '20px', transition: 'all 0.3s ease' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                        {validData.map((item, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', margin: '0 2px' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#007bff',
                                        borderRadius: '4px 4px 0 0',
                                        height: `${maxValue > 0 ? ((item.sales || 0) / maxValue) * 250 : 5}px`,
                                        minHeight: '5px',
                                        position: 'relative',
                                        transition: 'background-color 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                                    title={`₱${(item.sales || 0).toLocaleString()}`}
                                >
                                </div>
                                <small style={{ marginTop: '8px', color: '#6c757d' }}>{item.day}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const LineChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.sales === 'number' && !isNaN(item.sales));
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1;

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 350 : 175;
            const y = 200 - ((item.sales - minValue) / range) * 180;
            return `${isNaN(x) ? 175 : x},${isNaN(y) ? 200 : y}`;
        }).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div style={{ height: '300px', textAlign: 'center' }}>
                        <svg width="350" height="220" style={{ margin: '0 auto' }}>
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#007bff', stopOpacity: 0.3 }} />
                                    <stop offset="100%" style={{ stopColor: '#007bff', stopOpacity: 0.1 }} />
                                </linearGradient>
                            </defs>

                            {[0, 1, 2, 3, 4].map(i => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={40 * i}
                                    x2="350"
                                    y2={40 * i}
                                    stroke="#e9ecef"
                                    strokeWidth="1"
                                />
                            ))}

                            {validData.length > 1 && (
                                <polygon
                                    points={`0,200 ${points} 350,200`}
                                    fill="url(#gradient)"
                                />
                            )}

                            {validData.length > 1 && (
                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke="#007bff"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {validData.map((item, index) => {
                                const x = validData.length > 1 ? (index / (validData.length - 1)) * 350 : 175;
                                const y = 200 - ((item.sales - minValue) / range) * 180;
                                return (
                                    <circle
                                        key={index}
                                        cx={isNaN(x) ? 175 : x}
                                        cy={isNaN(y) ? 200 : y}
                                        r="4"
                                        fill="#007bff"
                                        stroke="white"
                                        strokeWidth="2"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <title>₱{(item.sales || 0).toLocaleString()}</title>
                                    </circle>
                                );
                            })}
                        </svg>

                        <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '10px', paddingRight: '10px' }}>
                            {validData.map((item, index) => (
                                <small key={index} style={{ color: '#6c757d' }}>{item.day}</small>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Monthly Line Chart Component - Fixed
    const MonthlyLineChart = ({ data, title }) => {
        // Ensure data exists and has valid values
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Filter out invalid data and ensure sales values are numbers
        const validData = data.filter(item =>
            item &&
            typeof item.sales === 'number' &&
            !isNaN(item.sales) &&
            isFinite(item.sales)
        );

        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1; // Prevent division by zero

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 400 : 200; // Center single point
            const y = 200 - ((item.sales - minValue) / range) * 180;

            // Ensure x and y are valid numbers
            return {
                x: isNaN(x) ? 200 : x,
                y: isNaN(y) ? 200 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div style={{ height: '350px', textAlign: 'center', position: 'relative' }}>
                        <svg width="450" height="250" style={{ margin: '0 auto' }}>
                            <defs>
                                <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#28a745', stopOpacity: 0.3 }} />
                                    <stop offset="100%" style={{ stopColor: '#28a745', stopOpacity: 0.05 }} />
                                </linearGradient>
                            </defs>

                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={i * 40}
                                    x2="400"
                                    y2={i * 40}
                                    stroke="#e9ecef"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Area fill - only if more than one point */}
                            {validData.length > 1 && (
                                <polygon
                                    points={`0,200 ${pathPoints} 400,200`}
                                    fill="url(#monthlyGradient)"
                                />
                            )}

                            {/* Main line - only if more than one point */}
                            {validData.length > 1 && (
                                <polyline
                                    points={pathPoints}
                                    fill="none"
                                    stroke="#28a745"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* Data points */}
                            {points.map((point, index) => (
                                <circle
                                    key={index}
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.isCurrentMonth ? "6" : "4"}
                                    fill={point.isCurrentMonth ? "#dc3545" : "#28a745"}
                                    stroke="white"
                                    strokeWidth="2"
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    onMouseEnter={(e) => {
                                        e.target.setAttribute('r', '8');
                                        e.target.style.filter = 'drop-shadow(0 0 6px rgba(40, 167, 69, 0.6))';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.setAttribute('r', point.isCurrentMonth ? '6' : '4');
                                        e.target.style.filter = 'none';
                                    }}
                                >
                                    <title>{point.month || 'Unknown'}: ₱{(point.sales || 0).toLocaleString()}</title>
                                </circle>
                            ))}
                        </svg>

                        {/* Month labels */}
                        <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '25px', paddingRight: '25px' }}>
                            {validData.map((item, index) => (
                                <small
                                    key={index}
                                    style={{
                                        color: item.isCurrentMonth ? '#dc3545' : '#6c757d',
                                        fontWeight: item.isCurrentMonth ? 'bold' : 'normal',
                                        fontSize: '11px'
                                    }}
                                >
                                    {item.month || 'N/A'}
                                </small>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#dc3545',
                                    borderRadius: '50%'
                                }}></div>
                                <small style={{ color: '#6c757d' }}>Current Month</small>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#28a745',
                                    borderRadius: '50%'
                                }}></div>
                                <small style={{ color: '#6c757d' }}>Monthly Performance</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Yearly Performance Chart Component - Fixed
    const YearlyChart = ({ data, title }) => {
        // Ensure data exists and has valid values
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Filter out invalid data and ensure sales values are numbers
        const validData = data.filter(item =>
            item &&
            typeof item.sales === 'number' &&
            !isNaN(item.sales) &&
            isFinite(item.sales)
        );

        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const salesValues = validData.map(item => item.sales);
        const maxValue = Math.max(...salesValues);
        const minValue = Math.min(...salesValues);
        const range = maxValue - minValue || 1; // Prevent division by zero

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 350 : 175; // Center single point
            const y = 200 - ((item.sales - minValue) / range) * 180;

            // Ensure x and y are valid numbers
            return {
                x: isNaN(x) ? 175 : x,
                y: isNaN(y) ? 200 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div style={{ height: '350px', textAlign: 'center' }}>
                        <svg width="400" height="250" style={{ margin: '0 auto' }}>
                            <defs>
                                <linearGradient id="yearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#6f42c1', stopOpacity: 0.3 }} />
                                    <stop offset="100%" style={{ stopColor: '#6f42c1', stopOpacity: 0.05 }} />
                                </linearGradient>
                            </defs>

                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={i * 40}
                                    x2="350"
                                    y2={i * 40}
                                    stroke="#e9ecef"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Area fill - only if more than one point */}
                            {validData.length > 1 && (
                                <polygon
                                    points={`0,200 ${pathPoints} 350,200`}
                                    fill="url(#yearlyGradient)"
                                />
                            )}

                            {/* Main line - only if more than one point */}
                            {validData.length > 1 && (
                                <polyline
                                    points={pathPoints}
                                    fill="none"
                                    stroke="#6f42c1"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* Data points */}
                            {points.map((point, index) => (
                                <circle
                                    key={index}
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.isCurrentYear ? "8" : "6"}
                                    fill={point.isCurrentYear ? "#ffc107" : "#6f42c1"}
                                    stroke="white"
                                    strokeWidth="3"
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    onMouseEnter={(e) => {
                                        e.target.setAttribute('r', '10');
                                        e.target.style.filter = 'drop-shadow(0 0 8px rgba(111, 66, 193, 0.6))';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.setAttribute('r', point.isCurrentYear ? '8' : '6');
                                        e.target.style.filter = 'none';
                                    }}
                                >
                                    <title>{point.year || 'Unknown'}: ₱{(point.sales || 0).toLocaleString()}</title>
                                </circle>
                            ))}
                        </svg>

                        {/* Year labels */}
                        <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '25px', paddingRight: '25px' }}>
                            {validData.map((item, index) => (
                                <small
                                    key={index}
                                    style={{
                                        color: item.isCurrentYear ? '#ffc107' : '#6c757d',
                                        fontWeight: item.isCurrentYear ? 'bold' : 'normal'
                                    }}
                                >
                                    {item.year || 'N/A'}
                                </small>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#ffc107',
                                    borderRadius: '50%'
                                }}></div>
                                <small style={{ color: '#6c757d' }}>Current Year</small>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#6f42c1',
                                    borderRadius: '50%'
                                }}></div>
                                <small style={{ color: '#6c757d' }}>Yearly Trend</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SimplePieChart = ({ data, title }) => {
        if (!data || data.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const validData = data.filter(item => item && typeof item.value === 'number' && !isNaN(item.value) && item.value > 0);
        if (validData.length === 0) {
            return (
                <div className="card shadow" style={{ marginBottom: '20px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{title}</h5>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-muted">No valid data available</p>
                        </div>
                    </div>
                </div>
            );
        }

        const total = validData.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercentage = 0;
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];

        const slices = validData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            cumulativePercentage += percentage;

            const largeArcFlag = percentage > 50 ? 1 : 0;
            const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

            return {
                ...item,
                percentage,
                pathData: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
                color: colors[index % colors.length]
            };
        });

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                                {slices.map((slice, index) => (
                                    <path
                                        key={index}
                                        d={slice.pathData}
                                        fill={slice.color}
                                        stroke="white"
                                        strokeWidth="2"
                                        style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                    >
                                        <title>{slice.name}: ₱{slice.value.toLocaleString()} ({slice.percentage.toFixed(1)}%)</title>
                                    </path>
                                ))}
                            </svg>
                        </div>
                        <div className="col-md-6">
                            {slices.map((slice, index) => (
                                <div key={index} className="d-flex align-items-center mb-2">
                                    <div
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: slice.color,
                                            borderRadius: '50%',
                                            marginRight: '8px'
                                        }}
                                    ></div>
                                    <small style={{ color: '#495057' }}>
                                        {slice.name} ({slice.percentage.toFixed(1)}%)
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Prepare chart data
    const weeklyTrendData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dailyAmount = salesByInvoice
            .filter(sale => sale.date === dateStr)
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        weeklyTrendData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: isNaN(dailyAmount) ? 0 : dailyAmount,
            date: dateStr
        });
    }

    // Prepare monthly chart data - Fixed
    const monthlyTrendData = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
        const monthlyAmount = salesByInvoice
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === i && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0); // Ensure parseFloat returns a number

        monthlyTrendData.push({
            month: monthNames[i],
            sales: isNaN(monthlyAmount) ? 0 : monthlyAmount, // Ensure sales is never NaN
            isCurrentMonth: i === currentMonth
        });
    }

    // Prepare yearly chart data - Fixed
    const yearlyTrendData = [];
    const currentYearValue = new Date().getFullYear();

    // Get unique years from sales data
    const availableYears = [...new Set(salesByInvoice.map(sale => {
        const year = new Date(sale.date).getFullYear();
        return isNaN(year) ? null : year; // Filter out invalid years
    }).filter(year => year !== null))];

    // If no years available, show last 5 years including current
    const yearsToShow = availableYears.length > 0 ? availableYears :
        Array.from({ length: 5 }, (_, i) => currentYearValue - 4 + i);

    // Sort years and ensure we have at least current year
    const sortedYears = [...new Set([...yearsToShow, currentYearValue])].sort();

    sortedYears.forEach(year => {
        const yearlyAmount = salesByInvoice
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getFullYear() === year;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0); // Ensure parseFloat returns a number

        yearlyTrendData.push({
            year: year.toString(),
            sales: isNaN(yearlyAmount) ? 0 : yearlyAmount, // Ensure sales is never NaN
            isCurrentYear: year === currentYearValue
        });
    });

    // Location sales data for pie chart
    const locationSales = salesByInvoice.reduce((acc, sale) => {
        const location = sale.location_name || 'Unknown';
        const amount = parseFloat(sale.amount) || 0;
        acc[location] = (acc[location] || 0) + amount;
        return acc;
    }, {});

    const locationData = Object.entries(locationSales)
        .filter(([name, value]) => !isNaN(value) && value > 0)
        .map(([name, value]) => ({
            name,
            value,
            percentage: (value / Object.values(locationSales).reduce((a, b) => a + b, 0)) * 100
        }));

    return (
        <div className='dash-main'>
            <h1 className='h-dashboard'>DASHBOARD</h1>

            <div className="container-fluid" >
                {/* Sales Overview Cards - Now clickable */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #007bff',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('daily')}
                            title="Click to view daily sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Daily Sales</p>
                                       
                                        
                                        <h3 className="font-weight-bold mb-0"> ₱{(counts.dailySales || 0).toLocaleString()}</h3>

                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#28a745" className="me-1" />
                                            <small className="text-success">Today's performance</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '50%' }}>
                                        <DollarSign size={24} color="#007bff" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #28a745',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('weekly')}
                            title="Click to view weekly sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Weekly Sales</p>
                                        <h3 className="font-weight-bold mb-0">₱{counts.weeklySales}</h3>
                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#28a745" className="me-1" />
                                            <small className="text-success">This week</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '50%' }}>
                                        <Calendar size={24} color="#28a745" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <div
                            className="card shadow"
                            style={{
                                borderLeft: '4px solid #6f42c1',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => handleSalesCardClick('monthly')}
                            title="Click to view monthly sales details"
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Monthly Sales</p>
                                        <h3 className="font-weight-bold mb-0">₱{counts.montlySales}</h3>
                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#6f42c1" className="me-1" />
                                            <small style={{ color: '#6f42c1' }}>This month</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#f3e5f5', padding: '12px', borderRadius: '50%' }}>
                                        <TrendingUp size={24} color="#6f42c1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <Users size={24} color="#856404" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Customers</p>
                                        <h4 className="font-weight-bold mb-0">{counts.customerCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#f8d7da', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <MapPin size={24} color="#721c24" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Locations</p>
                                        <h4 className="font-weight-bold mb-0">{counts.locationCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#d1ecf1', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <BarChart3 size={24} color="#0c5460" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Products</p>
                                        <h4 className="font-weight-bold mb-0">{counts.prodCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card shadow" style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>
                                        <Users size={24} color="#856404" />
                                    </div>
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Users</p>
                                        <h4 className="font-weight-bold mb-0">{counts.userCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                {salesByInvoice.length > 0 && (
                    <>
                        {/* Monthly & Yearly Charts - NEW SECTION */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <MonthlyLineChart data={monthlyTrendData} title="Monthly Performance (Current Year)" />
                            </div>
                            <div className="col-md-6">
                                <YearlyChart data={yearlyTrendData} title="Yearly Performance Trend" />
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <LineChart data={weeklyTrendData} title="Weekly Sales Trend" />
                            </div>
                            <div className="col-md-6">
                                {locationData.length > 0 && (
                                    <SimplePieChart data={locationData} title="Sales by Location" />
                                )}
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-12">
                                <BarChart data={weeklyTrendData} title="Daily Sales Performance" />
                            </div>
                        </div>

                        {/* Recent Sales Table */}
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Recent Sales</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Location</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesByInvoice.slice(-5).reverse().map((sale, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                                                    <td>{sale.location_name || 'Unknown'}</td>
                                                    <td><strong>₱{(parseFloat(sale.amount) || 0).toLocaleString()}</strong></td>
                                                    <td>
                                                        <span className="badge badge-success" style={{ color: 'green' }}>Completed</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardAdmin;