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

    const PesoSign = ({ size = 24, color = '#007bff' }) => (
        <span style={{
            width: 32,
            fontSize: `${size}px`,
            color: color,
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            ₱
        </span>
    );

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

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(dailyTotal);
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



        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(weeklyTotal);
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


        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(monthlyTotal);


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

    // Enhanced Chart Components with better legends and labels
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
        const minValue = Math.min(...validData.map(item => item.sales));

        return (
            <div className="card shadow" style={{ marginBottom: '20px', transition: 'all 0.3s ease' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>

                    {/* Chart Container with Y-axis labels */}
                    <div style={{ height: '320px', display: 'flex' }}>
                        {/* Y-axis labels */}
                        <div style={{ width: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '10px', paddingTop: '20px', paddingBottom: '40px' }}>
                            <small style={{ color: '#6c757d', fontSize: '11px' }}>₱{maxValue.toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '11px' }}>₱{(maxValue * 0.75).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '11px' }}>₱{(maxValue * 0.5).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '11px' }}>₱{(maxValue * 0.25).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '11px' }}>₱0</small>
                        </div>

                        {/* Chart Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '250px', display: 'flex', alignItems: 'end', justifyContent: 'space-between', paddingTop: '20px' }}>
                                {validData.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', margin: '0 2px' }}>
                                        <div
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#007bff',
                                                borderRadius: '4px 4px 0 0',
                                                height: `${maxValue > 0 ? ((item.sales || 0) / maxValue) * 220 : 5}px`,
                                                minHeight: '5px',
                                                position: 'relative',
                                                transition: 'background-color 0.3s ease',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                                            title={`${item.day}: ₱${(item.sales || 0).toLocaleString()}`}
                                        >
                                            {item.sales > maxValue * 0.1 && (
                                                <span style={{ padding: '2px', textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                                                    ₱{(item.sales / 1000).toFixed(0)}k
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* X-axis labels */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingLeft: '10px', paddingRight: '10px' }}>
                                {validData.map((item, index) => (
                                    <small key={index} style={{ color: '#6c757d', fontWeight: 'bold' }}>{item.day}</small>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Legend and Statistics */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>Statistics:</small>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                    <div>Max: ₱{maxValue.toLocaleString()}</div>
                                    <div>Min: ₱{minValue.toLocaleString()}</div>
                                    <div>Avg: ₱{(validData.reduce((sum, item) => sum + item.sales, 0) / validData.length).toFixed(0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>Total Week: ₱{validData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}</small>
                            </div>
                        </div>
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
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 300 : 150;
            const y = 180 - ((item.sales - minValue) / range) * 160;
            return { x: isNaN(x) ? 150 : x, y: isNaN(y) ? 180 : y, ...item };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>

                    <div style={{ display: 'flex' }}>
                        {/* Y-axis labels */}
                        <div style={{ width: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '10px', height: '200px' }}>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{maxValue.toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.75).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.5).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.25).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{minValue.toLocaleString()}</small>
                        </div>

                        {/* Chart */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <svg width="320" height="200">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#007bff', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#007bff', stopOpacity: 0.1 }} />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={40 * i}
                                        x2="300"
                                        y2={40 * i}
                                        stroke="#e9ecef"
                                        strokeWidth="1"
                                    />
                                ))}

                                {validData.length > 1 && (
                                    <polygon
                                        points={`0,180 ${pathPoints} 300,180`}
                                        fill="url(#gradient)"
                                    />
                                )}

                                {validData.length > 1 && (
                                    <polyline
                                        points={pathPoints}
                                        fill="none"
                                        stroke="#007bff"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {points.map((point, index) => (
                                    <g key={index}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="#007bff"
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {/* Value labels on points */}
                                        <text
                                            x={point.x}
                                            y={point.y - 10}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#495057"
                                            fontWeight="bold"
                                        >
                                            ₱{(point.sales / 1000).toFixed(0)}k
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '10px', paddingRight: '10px' }}>
                                {validData.map((item, index) => (
                                    <small key={index} style={{ color: '#6c757d', fontWeight: 'bold' }}>{item.day}</small>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-8">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{
                                            width: '20px',
                                            height: '3px',
                                            backgroundColor: '#007bff',
                                            borderRadius: '2px'
                                        }}></div>
                                        <small style={{ color: '#495057' }}>Sales Trend</small>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#007bff',
                                            borderRadius: '50%',
                                            border: '2px solid white'
                                        }}></div>
                                        <small style={{ color: '#495057' }}>Data Points</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>
                                    Total: ₱{validData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Monthly Line Chart Component - Enhanced
    const MonthlyLineChart = ({ data, title }) => {
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
        const range = maxValue - minValue || 1;

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 350 : 175;
            const y = 180 - ((item.sales - minValue) / range) * 160;

            return {
                x: isNaN(x) ? 175 : x,
                y: isNaN(y) ? 180 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>

                    <div style={{ display: 'flex' }}>
                        {/* Y-axis labels */}
                        <div style={{ width: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '10px', height: '200px' }}>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{maxValue.toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.75).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.5).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.25).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{minValue.toLocaleString()}</small>
                        </div>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <svg width="380" height="200">
                                <defs>
                                    <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#28a745', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#28a745', stopOpacity: 0.05 }} />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
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

                                {validData.length > 1 && (
                                    <polygon
                                        points={`0,180 ${pathPoints} 350,180`}
                                        fill="url(#monthlyGradient)"
                                    />
                                )}

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

                                {points.map((point, index) => (
                                    <g key={index}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isCurrentMonth ? "6" : "4"}
                                            fill={point.isCurrentMonth ? "#dc3545" : "#28a745"}
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {/* Value labels */}
                                        <text
                                            x={point.x}
                                            y={point.y - 12}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fill={point.isCurrentMonth ? "#dc3545" : "#28a745"}
                                            fontWeight="bold"
                                        >
                                            ₱{(point.sales / 1000).toFixed(0)}k
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '15px', paddingRight: '15px' }}>
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
                        </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-6">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>
                                    YTD Total: ₱{validData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Yearly Performance Chart Component - Enhanced
    const YearlyChart = ({ data, title }) => {
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
        const range = maxValue - minValue || 1;

        const points = validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * 300 : 150;
            const y = 180 - ((item.sales - minValue) / range) * 160;

            return {
                x: isNaN(x) ? 150 : x,
                y: isNaN(y) ? 180 : y,
                ...item
            };
        });

        const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>

                    <div style={{ display: 'flex' }}>
                        {/* Y-axis labels */}
                        <div style={{ width: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '10px', height: '200px' }}>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{maxValue.toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.75).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.5).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{(minValue + range * 0.25).toFixed(0).toLocaleString()}</small>
                            <small style={{ color: '#6c757d', fontSize: '10px' }}>₱{minValue.toLocaleString()}</small>
                        </div>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <svg width="330" height="200">
                                <defs>
                                    <linearGradient id="yearlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#6f42c1', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#6f42c1', stopOpacity: 0.05 }} />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={i * 40}
                                        x2="300"
                                        y2={i * 40}
                                        stroke="#e9ecef"
                                        strokeWidth="1"
                                    />
                                ))}

                                {validData.length > 1 && (
                                    <polygon
                                        points={`0,180 ${pathPoints} 300,180`}
                                        fill="url(#yearlyGradient)"
                                    />
                                )}

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

                                {points.map((point, index) => (
                                    <g key={index}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.isCurrentYear ? "8" : "6"}
                                            fill={point.isCurrentYear ? "#ffc107" : "#6f42c1"}
                                            stroke="white"
                                            strokeWidth="3"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {/* Value labels */}
                                        <text
                                            x={point.x}
                                            y={point.y - 15}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill={point.isCurrentYear ? "#ffc107" : "#6f42c1"}
                                            fontWeight="bold"
                                        >
                                            ₱{(point.sales / 1000000).toFixed(1)}M
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="d-flex justify-content-between" style={{ marginTop: '10px', paddingLeft: '15px', paddingRight: '15px' }}>
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
                        </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-6">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                                        <small style={{ color: '#6c757d' }}>Historical Years</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>
                                    Growth: {validData.length > 1 ?
                                        ((validData[validData.length - 1].sales - validData[validData.length - 2].sales) / validData[validData.length - 2].sales * 100).toFixed(1) + '%'
                                        : 'N/A'}
                                </small>
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
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];

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
                            <div style={{ position: 'relative', textAlign: 'center' }}>
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
                                {/* Center total */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'bold' }}>Total</div>
                                    <div style={{ fontSize: '14px', color: '#495057', fontWeight: 'bold' }}>₱{total.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                {slices.map((slice, index) => (
                                    <div key={index} className="d-flex align-items-center justify-content-between mb-2" style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                        <div className="d-flex align-items-center">
                                            <div
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: slice.color,
                                                    borderRadius: '3px',
                                                    marginRight: '8px'
                                                }}
                                            ></div>
                                            <small style={{ color: '#495057', fontWeight: '500' }}>
                                                {slice.name}
                                            </small>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                                {slice.percentage.toFixed(1)}%
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#495057', fontWeight: 'bold' }}>
                                                ₱{(slice.value / 1000).toFixed(0)}k
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                <small style={{ color: '#495057' }}>
                                    <strong>Locations:</strong> {slices.length} | <strong>Avg:</strong> ₱{(total / slices.length).toFixed(0).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Enhanced Recent Sales Table Component
    const RecentSalesTable = ({ salesData, title }) => {
        const recentSales = salesData.slice(-10).reverse();

        return (
            <div className="card shadow" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">{title}</h5>
                        <small className="text-muted">Last 10 transactions</small>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover table-sm">
                            <thead className="thead-light" style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                                <tr>
                                    <th style={{ border: 'none', padding: '12px 8px', fontSize: '13px', fontWeight: '600' }}>Date</th>
                                    <th style={{ border: 'none', padding: '12px 8px', fontSize: '13px', fontWeight: '600' }}>Location</th>
                                    <th style={{ border: 'none', padding: '12px 8px', fontSize: '13px', fontWeight: '600' }}>Transaction Type</th>
                                    <th style={{ border: 'none', padding: '12px 8px', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>Amount</th>
                                    <th style={{ border: 'none', padding: '12px 8px', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map((sale, index) => {
                                    const isToday = new Date(sale.date).toDateString() === new Date().toDateString();
                                    return (
                                        <tr key={index} style={{
                                            backgroundColor: isToday ? '#fff3cd' : (index % 2 === 0 ? '#f8f9fa' : 'white'),
                                            borderLeft: isToday ? '3px solid #ffc107' : 'none'
                                        }}>
                                            <td style={{ padding: '10px 8px', fontSize: '12px', border: 'none' }}>
                                                <div style={{ fontWeight: '500', color: '#495057' }}>
                                                    {new Date(sale.date).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                                    {new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: '12px', border: 'none' }}>
                                                <div style={{ fontWeight: '500', color: '#495057' }}>
                                                    {sale.location_name || 'Unknown'}
                                                </div>
                                            </td>
                                             <td style={{ padding: '10px 8px', fontSize: '12px', border: 'none' }}>
                                                <div style={{ fontWeight: '500', color: '#495057' }}>
                                                    {sale.sales_from || 'Unknown'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: '12px', border: 'none', textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', color: '#28a745', fontSize: '13px' }}>
                                                    ₱{(parseFloat(sale.amount) || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: '12px', border: 'none', textAlign: 'center' }}>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: '#d4edda',
                                                        color: '#155724',
                                                        fontSize: '10px',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px'
                                                    }}
                                                >
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Sales Summary */}
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div className="row">
                            <div className="col-md-6">
                                <small style={{ color: '#495057', fontWeight: 'bold' }}>
                                    Recent Total: ₱{recentSales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0).toLocaleString()}
                                </small>
                            </div>
                            <div className="col-md-6">
                                <small style={{ color: '#495057' }}>
                                    Average: ₱{recentSales.length > 0 ? (recentSales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0) / recentSales.length).toLocaleString() : '0'}
                                </small>
                            </div>
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

    // Prepare monthly chart data
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
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        monthlyTrendData.push({
            month: monthNames[i],
            sales: isNaN(monthlyAmount) ? 0 : monthlyAmount,
            isCurrentMonth: i === currentMonth
        });
    }

    // Prepare yearly chart data
    const yearlyTrendData = [];
    const currentYearValue = new Date().getFullYear();

    const availableYears = [...new Set(salesByInvoice.map(sale => {
        const year = new Date(sale.date).getFullYear();
        return isNaN(year) ? null : year;
    }).filter(year => year !== null))];

    const yearsToShow = availableYears.length > 0 ? availableYears :
        Array.from({ length: 5 }, (_, i) => currentYearValue - 4 + i);

    const sortedYears = [...new Set([...yearsToShow, currentYearValue])].sort();

    sortedYears.forEach(year => {
        const yearlyAmount = salesByInvoice
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getFullYear() === year;
            })
            .reduce((total, sale) => total + (parseFloat(sale.amount) || 0), 0);

        yearlyTrendData.push({
            year: year.toString(),
            sales: isNaN(yearlyAmount) ? 0 : yearlyAmount,
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


                                        <h3 className="font-weight-bold mb-0"> {(counts.dailySales || 0).toLocaleString()}</h3>

                                        <div className="d-flex align-items-center mt-2">
                                            <TrendingUp size={16} color="#28a745" className="me-1" />
                                            <small className="text-success">Today's performance</small>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '50%' }}>
                                        <PesoSign size={24} color="#007bff" />
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
                                        <h3 className="font-weight-bold mb-0">{counts.weeklySales}</h3>
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
                                        <h3 className="font-weight-bold mb-0">{counts.montlySales}</h3>
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
                        {/* Monthly & Yearly Charts */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <MonthlyLineChart data={monthlyTrendData} title="Monthly Performance (Current Year)" />
                            </div>
                            <div className="col-md-6">
                                <YearlyChart data={yearlyTrendData} title="Yearly Performance Trend" />
                            </div>
                        </div>

                        {/* Weekly Trend & Location Sales */}
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

                        {/* Daily Performance & Recent Sales - Now using half width */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <BarChart data={weeklyTrendData} title="Daily Sales Performance" />
                            </div>
                            <div className="col-md-6">
                                <RecentSalesTable salesData={salesByInvoice} title="Recent Sales" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardAdmin;