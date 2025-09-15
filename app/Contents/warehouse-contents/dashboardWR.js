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

const DashboardWR = ({ setActivePage, setExpandedParent }) => {
    const [counts, setCounts] = useState({
        prodCount: '0',
        categoryCount: '0',
        locationCount: '0',
        userCount: '0',
        customerCount: '0',
        ongoingDelivery: '0',
        montlySales: '0.00',
        dailySales: '0.00',
    });

    const countConfigs = [
        { id: 'product_id', from: 'products', name: 'product_count', stateKey: 'prodCount' },
        { id: 'category_id', from: 'category', name: 'category_count', stateKey: 'categoryCount' },
        { id: 'location_id', from: 'location', name: 'location_count', stateKey: 'locationCount' },
        { id: 'account_id', from: 'account', name: 'user_count', stateKey: 'userCount' },
        { id: 'cust_id', from: 'customers', name: 'customer_count', stateKey: 'customerCount' },
        // Add more here if needed
    ];

    const [requestList1, setRequestList1] = useState([]);
    const [requestList, setRequestList] = useState([]);
    const [deleveredList, setDeliveredList] = useState([]);

    useEffect(() => {
        countConfigs.forEach(config => fetchCount(config));
        GetRequest();
        GetOngoingReq();
        GetDelivered();
    }, []);

    const GetRequest = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'Pending',
            reqType: 'ReqTo'
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID),
                    operation: "GetRequest"
                }
            });
            setRequestList1(response.data);
        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const GetOngoingReq = async () => {
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
            console.log(response.data);

        } catch (error) {
            console.error("Error fetching request list:", error);
        }
    };

    const GetDelivered = async () => {
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        const ID = {
            locID: LocationID,
            status: 'OnDeliver',
            reqType: 'ReqTo'
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetReqDelivery"
                }
            });
            setDeliveredList(response.data);

            // DEBUG: Log the data structure to console
            console.log("delivered:", response.data);

        } catch (error) {
            console.error("Error fetching request list:", error);
        }
        return;
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

    // Calculate the counts from the respective arrays
    const pendingRequestCount = Array.isArray(requestList1) ? requestList1.length.toString() : '0';
    const ongoingCount = Array.isArray(requestList) ? requestList.length.toString() : '0';
    const deliveredCount = Array.isArray(deleveredList)
        ? deleveredList.filter(item => item.delivery_status === 'Delivered').length.toString()
        : '0';
    const OnDeliverCount = Array.isArray(deleveredList)
        ? deleveredList.filter(item => item.delivery_status === 'On Delivery').length.toString()
        : '0';

    // Navigation handler for card clicks with filter support
    const handleCardClick = (pageKey, filterConfig = null) => {
        if (setActivePage && pageKey) {
            // Store filter configuration in sessionStorage for the delivery page
            if (filterConfig && pageKey === 'delivery') {
                sessionStorage.setItem('deliveryPageFilter', JSON.stringify(filterConfig));
            }

            // If it's a child page, expand the parent first
            if (pageKey === 'inventory-transfer-request') {
                setExpandedParent && setExpandedParent('requestmanagement');
            }

            setActivePage(pageKey);
            sessionStorage.setItem('once', "false");
        }
    };

    const cards = [
        {
            title: 'ONGOING DELIVERY',
            value: OnDeliverCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'On Delivery' }, // Add filter config
            image: '/assets/images/obDelivery.png'
        },
        {
            title: 'PENDING REQUEST',
            value: pendingRequestCount,
            pageKey: 'inventory-transfer-request',
            image: '/assets/images/pending.png'
        },
        {
            title: 'ON GOING REQUEST',
            value: ongoingCount,
            pageKey: 'requestmanagement',
            image: '/assets/images/onGoing.png'

        },
        {
            title: 'DELIVERED STOCK',
            value: deliveredCount,
            pageKey: 'delivery',
            filterConfig: { statusFilter: 'Delivered' }, // Add filter config
            image: '/assets/images/delivered.png'
        },
    ];

    const router = useRouter();

    // Filter out cards with zero count
    const visibleCards = cards.filter(card => {
        const count = parseInt(card.value) || 0;
        return count > 0;
    });

    return (
        <div className='dash-main' >
            <h1 className='h-dashboard'>DASHBOARD</h1>
            <div className='container'>
                {visibleCards.length > 0 ? (
                    visibleCards.map((card, index) => (
                        <div
                            key={index}
                            className='card'
                            onClick={() => handleCardClick(card.pageKey, card.filterConfig)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className='cardText'>
                                <p className='title'>{card.title}</p>
                            </div>
                            <div className="icon-and-val">
                                <div>
                                    <h2 className='value'>{card.value}</h2>
                                </div>
                                <div>
                                    <img src={card.image} alt="icon" className='icon' />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        textAlign: 'center',
                        color: '#6c757d',
                        fontSize: '18px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }}>
                            📊
                        </div>
                        <p>No active items to display</p>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>
                            Cards will appear here when there are pending requests or ongoing deliveries
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardWR;