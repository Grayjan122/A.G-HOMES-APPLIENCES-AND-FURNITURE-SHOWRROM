'use client';

import "../../css/dashboard.css";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Router from "next/router";

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

const DashboardSalesClerk = () => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
        // Collection counts
        dailyCollection: '0.00',
        weeklyCollection: '0.00',
        monthlyCollection: '0.00',
        totalCustomersWithDue: '0',
        dailyDueCustomers: '0',
        weeklyDueCustomers: '0',
        monthlyDueCustomers: '0',
        // Add overdue amount
        overdueAmount: '0.00'
    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
        // Add more here if needed
    ];

    const [installmentList, setInstallmentList] = useState([]);
    const [overdueCustomers, setOverdueCustomers] = useState([]); // Add this state

    const [customerList, setCustomerList] = useState([]);

    useEffect(() => {
        GetCustomer();
        GetInstallment();
        countConfigs.forEach(config => fetchCount(config));
    }, []);

    const GetCustomer = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'customer.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCustomer"
                }
            });
            // console.log(response.data);

            setCustomerList(response.data);
        } catch (error) {
            console.error("Error fetching customer list:", error);
        }
    };

    const GetCustName = (custID) => {
        // alert(custID);
        const cust = customerList.find(custs => custs.cust_id == custID);
        return cust ? cust.cust_name : "Unknown Customer";
    };


    const GetInstallment = async () => {
        try {
            const baseURL = sessionStorage.getItem('baseURL');
            const accountID = sessionStorage.getItem('user_id');
            const locationID = sessionStorage.getItem('location_id');
            const locName = sessionStorage.getItem('location_name');

            const response = await axios.get(`${baseURL}installment.php`, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetAllInstallmentD"
                }
            });

            setInstallmentList(response.data);

            // Calculate collections after fetching installments
            calculateCollections(response.data);

            // Calculate overdue customers
            calculateOverdueCustomers(response.data);

            // Logs(accountID, 'Viewed installment management for ' + locName);
        } catch (error) {
            console.error("Error fetching installments:", error);
        }
    };

    const calculateOverdueCustomers = (installments) => {
        if (!installments || installments.length === 0) {
            setOverdueCustomers([]);
            return;
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const overdue = installments.filter(installment => {
            return installment.status === 'UNPAID' && installment.due_date < todayStr;
        }).map(installment => {
            const dueDate = new Date(installment.due_date);
            const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

            return {
                ...installment,
                daysPastDue
            };
        }).sort((a, b) => b.daysPastDue - a.daysPastDue); // Sort by most overdue first

        setOverdueCustomers(overdue);

        // Calculate total overdue amount
        const totalOverdue = overdue.reduce((sum, customer) => {
            return sum + (parseFloat(customer.amount_due * 1.05) || 0);
        }, 0);

        setCounts(prev => ({
            ...prev,
            overdueAmount: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(totalOverdue)
        }));
    };

    const calculateCollections = (installments) => {
        console.log("Calculating collections with data:", installments);

        if (!installments || installments.length === 0) {
            console.log("No installments data available");
            return;
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log("Today's date:", todayStr);

        // Calculate start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

        // Calculate end of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

        // Calculate start and end of month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

        console.log("Date ranges:", {
            today: todayStr,
            weekStart: startOfWeekStr,
            weekEnd: endOfWeekStr,
            monthStart: startOfMonthStr,
            monthEnd: endOfMonthStr
        });

        let dailyCollection = 0;
        let weeklyCollection = 0;
        let monthlyCollection = 0;
        let dailyDueCustomers = new Set();
        let weeklyDueCustomers = new Set();
        let monthlyDueCustomers = new Set();
        let totalCustomersWithDue = new Set();

        installments.forEach(installment => {
            const dueDate = installment.due_date;
            const amount = parseFloat(installment.amount_due) || 0;

            console.log("Processing installment:", {
                installment_id: installment.installment_id,
                due_date: dueDate,
                amount_due: amount,
                status: installment.status
            });

            // Only count UNPAID installments
            if (installment.status === 'UNPAID') {
                totalCustomersWithDue.add(installment.installment_id);

                // Daily collection (due today)
                if (dueDate === todayStr) {
                    dailyCollection += amount;
                    dailyDueCustomers.add(installment.installment_id);
                    console.log("Added to daily collection:", amount);
                }

                // Weekly collection (due this week)
                if (dueDate >= startOfWeekStr && dueDate <= endOfWeekStr) {
                    weeklyCollection += amount;
                    weeklyDueCustomers.add(installment.installment_id);
                    console.log("Added to weekly collection:", amount);
                }

                // Monthly collection (due this month)
                if (dueDate >= startOfMonthStr && dueDate <= endOfMonthStr) {
                    monthlyCollection += amount;
                    monthlyDueCustomers.add(installment.installment_id);
                    console.log("Added to monthly collection:", amount);
                }
            }
        });

        console.log("Final calculations:", {
            dailyCollection: dailyCollection.toFixed(2),
            weeklyCollection: weeklyCollection.toFixed(2),
            monthlyCollection: monthlyCollection.toFixed(2),
            totalCustomersWithDue: totalCustomersWithDue.size,
            dailyDueCustomers: dailyDueCustomers.size,
            weeklyDueCustomers: weeklyDueCustomers.size,
            monthlyDueCustomers: monthlyDueCustomers.size
        });

        setCounts(prev => ({
            ...prev,
            // dailyCollection: dailyCollection.toFixed(2),
            dailyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(dailyCollection),
            weeklyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(weeklyCollection),
            monthlyCollection: new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(monthlyCollection),
            totalCustomersWithDue: totalCustomersWithDue.size.toString(),
            dailyDueCustomers: dailyDueCustomers.size.toString(),
            weeklyDueCustomers: weeklyDueCustomers.size.toString(),
            monthlyDueCustomers: monthlyDueCustomers.size.toString()
        }));
    };

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

    const router = useRouter();

    const handleCardClick = (path) => {
        // if (path) router.push(path);
    };

    const dashboardCards = [
        // Basic counts
        {
            title: 'Total Products',
            value: counts.prodCount,
            icon: '📦',
            color: '#4CAF50',
            path: '/products'
        },
        {
            title: 'Categories',
            value: counts.categoryCount,
            icon: '🏷️',
            color: '#FF9800',
            path: '/categories'
        },
        {
            title: 'Total Customers',
            value: counts.customerCount,
            icon: '👥',
            color: '#2196F3',
            path: '/customers'
        },
        {
            title: 'Locations',
            value: counts.locationCount,
            icon: '📍',
            color: '#9C27B0',
            path: '/locations'
        },
        {
            title: 'Users',
            value: counts.userCount,
            icon: '👤',
            color: '#607D8B',
            path: '/users'
        },

        // Collection cards
        {
            title: 'Daily Collection',
            value: `${counts.dailyCollection}`,
            subtitle: `${counts.dailyDueCustomers} customers due today`,
            icon: '💰',
            color: '#46f436ff',
            urgent: true,
            path: '/collections/daily'
        },
        {
            title: 'Weekly Collection',
            value: `${counts.weeklyCollection}`,
            subtitle: `${counts.weeklyDueCustomers} customers due this week`,
            icon: '📅',
            color: '#46f436ff',
            path: '/collections/weekly'
        },
        {
            title: 'Monthly Collection',
            value: `${counts.monthlyCollection}`,
            subtitle: `${counts.monthlyDueCustomers} customers due this month`,
            icon: '📊',
            color: '#46f436ff',
            path: '/collections/monthly'
        },
        {
            title: 'Customers with Dues',
            value: counts.totalCustomersWithDue,
            subtitle: 'Total customers with unpaid installments',
            icon: '⚠️',
            color: '#FF9800',
            path: '/customers/dues'
        }
    ];

    return (
        <div className='dash-main'>
            <h1 className='h-dashboard' style={{
                color: '#333',
                marginBottom: '30px',
                fontSize: '2.5em',
                fontWeight: 'bold'
            }}>
                DASHBOARD
            </h1>

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(card.path)}
                            className="card1"
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                borderLeft: `5px solid ${card.color}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                // transform: card.urgent ? 'scale(1.02)' : 'scale(1)',
                                // animation: card.urgent ? 'pulse 2s infinite' : 'none'
                            }}
                           
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{
                                    fontSize: '2.5em',
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    color: card.color
                                }}>
                                    {card.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '1.1em',
                                        color: '#666',
                                        fontWeight: '500'
                                    }}>
                                        {card.title}
                                    </h3>
                                    <div style={{
                                        fontSize: '2.2em',
                                        fontWeight: 'bold',
                                        margin: '0 0 8px 0',
                                        lineHeight: '1',
                                        color: card.color
                                    }}>
                                        {card.value}
                                    </div>
                                    {card.subtitle && (
                                        <div style={{
                                            fontSize: '0.9em',
                                            color: '#888',
                                            marginTop: '4px',
                                            lineHeight: '1.3'
                                        }}>
                                            {card.subtitle}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '20px'
                }}>
                    <h2 style={{
                        color: '#333',
                        marginBottom: '20px',
                        fontSize: '1.5em'
                    }}>
                        Collection Summary
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #62f436ff'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due Today:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff',
                                animation: 'blink 2s infinite'
                            }}>
                                {counts.dailyCollection}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #FF5722'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due This Week:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff'
                            }}>
                                {counts.weeklyCollection}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: '4px solid #795548'
                        }}>
                            <span style={{ fontWeight: '500', color: '#666' }}>
                                Total Due This Month:
                            </span>
                            <span style={{
                                fontSize: '1.3em',
                                fontWeight: 'bold',
                                color: '#39f436ff'
                            }}>
                                {counts.monthlyCollection}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Overdue Customers Board */}
                {overdueCustomers.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        marginTop: '20px',
                        borderTop: '4px solid #E91E63'
                    }}>
                        <h2 style={{
                            color: '#E91E63',
                            marginBottom: '20px',
                            fontSize: '1.5em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🚨 Overdue Customers ({overdueCustomers.length})
                        </h2>

                        <div style={{
                            marginBottom: '15px',
                            padding: '12px',
                            background: '#ffebee',
                            borderRadius: '8px',
                            borderLeft: '4px solid #E91E63'
                        }}>
                            <strong style={{ color: '#E91E63' }}>
                                Total Overdue Amount: {counts.overdueAmount}
                            </strong>
                        </div>

                        <div style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '8px'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.9em'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Customer Name
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Payment #
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Due Date
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'right',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Amount Due
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Days Overdue
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            borderBottom: '2px solid #ddd',
                                            color: '#666',
                                            fontWeight: '600'
                                        }}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueCustomers.slice(0, 10).map((customer, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #eee',
                                            backgroundColor: customer.daysPastDue > 30 ? '#ffebee' : 'white',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.target.parentElement.style.backgroundColor = '#f5f5f5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.parentElement.style.backgroundColor = customer.daysPastDue > 30 ? '#ffebee' : 'white';
                                            }}
                                        >
                                            <td style={{
                                                padding: '12px',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}>
                                                {GetCustName(customer.cust_id)}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                color: '#666'
                                            }}>
                                                Payment {customer.payment_number || 'N/A'}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                color: '#666'
                                            }}>
                                                {new Date(customer.due_date).toLocaleDateString()}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'right',
                                                fontWeight: 'bold',
                                                color: '#E91E63'
                                            }}>
                                                {
                                                    new Intl.NumberFormat('en-PH', {
                                                        style: 'currency',
                                                        currency: 'PHP'
                                                    }).format(customer.amount_due * 1.05)
                                                }
                                                {/* ₱{parseFloat(customer.amount_due * 1.05).toFixed(2)} */}
                                                {/* //not orig/ */}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: customer.daysPastDue > 30 ? '#d32f2f' : '#f57c00'
                                            }}>
                                                {customer.daysPastDue} days
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8em',
                                                    fontWeight: 'bold',
                                                    backgroundColor: customer.daysPastDue > 30 ? '#ffcdd2' : '#fff3e0',
                                                    color: customer.daysPastDue > 30 ? '#d32f2f' : '#f57c00'
                                                }}>
                                                    {customer.daysPastDue > 30 ? 'CRITICAL' : 'OVERDUE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {overdueCustomers.length > 10 && (
                                <div style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #ddd',
                                    color: '#666'
                                }}>
                                    Showing 10 of {overdueCustomers.length} overdue customers
                                    <button style={{
                                        marginLeft: '10px',
                                        padding: '4px 12px',
                                        border: '1px solid #E91E63',
                                        backgroundColor: 'white',
                                        color: '#E91E63',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8em'
                                    }}
                                        onClick={() => {/* Add view all functionality */ }}>
                                        View All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Animations in style tag */}
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1.02); }
                    50% { transform: scale(1.04); }
                    100% { transform: scale(1.02); }
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default DashboardSalesClerk;