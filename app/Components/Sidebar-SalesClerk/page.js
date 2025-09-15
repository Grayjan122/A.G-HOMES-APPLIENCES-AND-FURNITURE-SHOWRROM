'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

// Components
import Dashboard from '@/app/Contents/admin-contents/Dashboard/page';
import Products from '@/app/Contents/admin-contents/Products/page';
import Sale from '@/app/Contents/admin-contents/Sale/page';
import Analytics from '@/app/Contents/admin-contents/Analytics/page';
import Inventory from '@/app/Contents/admin-contents/Inventory/page';
import Location from '@/app/Contents/admin-contents/Location/page';
import Delivery from '@/app/Contents/admin-contents/Delivery/page';

import User from '@/app/Contents/admin-contents/User/page';
import Setting from '@/app/Contents/admin-contents/Setting/page';
import InventoryIM from '@/app/Contents/inventory-contents/Inventory/page';
import DeliveryDriver from '@/app/Contents/driver-contens/Delivery/page';
import PosSale from '@/app/Contents/saleClreck-contents/pos';
import SalePage from '@/app/Contents/saleClearkContents/pos';
import Customer from '@/app/Contents/admin-contents/customerPage';
import InstallmentSC from '@/app/Contents/saleClearkContents/installments';
import DashboardSalesClerk from '@/app/Contents/saleClearkContents/dashboardSC';

const SidebarSaleClerk = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [user_id, setUser_id] = useState('');

   useEffect(() => {
      setUser_id(sessionStorage.getItem('user_id'));
     
      
    }, []);

    const [mainSize, setMainSize] = useState('755px');
    useEffect(() => {
            const ua = navigator.userAgent;
    
            if (ua.includes("Edg")) {
                setMainSize('755px');
            } else if (ua.includes("Chrome")) {
                setMainSize('715px');
            }
        }, []);


  const pages = [
    { key: 'dashboard', label: 'DASHBOARD', icon: '/assets/images/dashboard.png', component: <DashboardSalesClerk /> },
    // { key: 'products', label: 'PRODUCTS', icon: '/assets/images/product1.png', component: <Products /> },
    { key: 'sales', label: 'SALES', icon: '/assets/images/sale.png', component: <SalePage /> },
    { key: 'installments', label: 'INSTALLMENTS', icon: '/assets/images/dash-icons/ag-11.png', component: <InstallmentSC /> },

    // { key: 'analytics', label: 'ANALYTICS', icon: '/assets/images/anal1.png', component: <Analytics /> },
    // { key: 'inventory', label: 'INVENTORY', icon: '/assets/images/inventory.png', component: <InventoryIM /> },
    // { key: 'locations', label: 'LOCATIONS', icon: '/assets/images/warehouse.png', component: <Location /> },
    // { key: 'delivery', label: 'DELIVERY', icon: '/assets/images/delivery-removebg-preview.png', component: <DeliveryDriver/> },
    { key: 'customer', label: 'CUSTOMER', icon: '/assets/images/customer.png', component: <Customer/> },
    // { key: 'users', label: 'USERS', icon: '/assets/images/user-removebg-preview.png', component: <User /> },
    // { key: 'setting', label: 'SETTING', icon: '/assets/images/setting.png', component: <Setting /> },
  ];

  const renderContent = () => {
    const page = pages.find(p => p.key === activePage);
    return page?.component || null;
  };

  return (
    <>
      <aside className="sidebar1" >
        <h2 className="sidebar-title">SALES CLERK</h2>
        <p className='line'>_________________</p>
        {/* <p>{user_id}</p> */}
        <nav className="sidebar-nav">
          {pages.map((page) => (
            <p
              key={page.key}
              onClick={() => setActivePage(page.key)}
              className={`sidebar-item ${activePage === page.key ? 'active' : ''}`}
            >
              <Image src={page.icon} width={40} height={40} alt={page.label} />
              {page.label}
            </p>
          ))}
        </nav>
      </aside>

      <section className="main-content">
        {renderContent()}
      </section>
    </>
  );
};

export default SidebarSaleClerk;
