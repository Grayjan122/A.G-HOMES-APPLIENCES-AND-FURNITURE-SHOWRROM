'use client';

import '../../css/sidebar.css';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Container } from 'react-bootstrap';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import Head from "next/head";

// Components
import Dashboard from '@/app/Contents/admin-contents/Dashboard/page';




import InventoryIM from '@/app/Contents/inventory-contents/inventoryIM';
import TrackRequestIM from '@/app/Contents/inventory-contents/trackRequest';
import RequestStockIM from '@/app/Contents/inventory-contents/requestStockIM';
import ReceiveStockIM from '@/app/Contents/inventory-contents/receiveStock';
import InventoryLedgerIM from '@/app/Contents/inventory-contents/inventoryAudit';

const SidebarInventory = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [expandedParent, setExpandedParent] = useState(null);
  const [user_id, setUser_id] = useState('');

  useEffect(() => {

    setActivePage('dashboard');
    setUser_id(sessionStorage.getItem('user_id'));
    document.title = 'Jan';

    // const Toast = Swal.mixin({
    //   toast: true,
    //   position: "top-end",
    //   showConfirmButton: false,
    //   timer: 5000,
    //   timerProgressBar: true,
    //   didOpen: (toast) => {
    //     toast.onmouseenter = Swal.stopTimer;
    //     toast.onmouseleave = Swal.resumeTimer;
    //   }
    // });

    // Toast.fire({
    //   icon: "success",
    //   title: "Signed in successfully"
    // });



  }, []);

  const yawa = () => {
    document.title = 'Jan Page'
  }



  const pages = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '/assets/images/dashboard.png',
      component: <Dashboard />,
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: '/assets/images/inventory.png',
      component: <InventoryIM />,
      children: [
        {
          key: 'receive-stock',
          label: 'Receive Stock',
          component: <ReceiveStockIM />,
        },
        // {
        //   key: 'request-stock',
        //   label: 'Request Stock',
        //   component: <RequestStockIM />,
        // },

        // {
        //   // key: 'transfer-request',
        //   // label: 'Transfer Request',
        //   // component: <TransferRequestWR />,
        // },
        {
          key: 'inventory-ledger',
          label: 'Inventory Ledger',
          component: <InventoryLedgerIM />,
        },
      ],
    },
    {
      key: 'request-management',
      label: 'Request Stock',
      icon: '/assets/images/22.png',
      component: <RequestStockIM />,
      children: [
        {
          key: 'track-request',
          label: 'Track Request',
          component: <TrackRequestIM />,
        },
      ],
    },


  ];

  const toggleExpand = (key, hasChildren) => {
    setActivePage(key);

    if (hasChildren) {
      // Only change expandedParent if you're clicking a different one
      if (expandedParent !== key) {
        setExpandedParent(key);
      }
      // Don't collapse it if clicking the same parent again
    } else {
      setExpandedParent(null);
    }
  };

  const renderContent = () => {
    for (const page of pages) {
      if (page.key === activePage) return page.component;
      if (page.children) {
        const child = page.children.find(child => child.key === activePage);
        if (child) return child.component;
      }
    }
    return null;
  };

  const getPageLabel = () => {
    const parent = pages.find((p) => p.key === activePage);
    if (parent) return parent.label;

    for (const p of pages) {
      if (p.children) {
        const child = p.children.find((c) => c.key === activePage);
        if (child) return child.label;
      }
    }
    return "dashboard";
  };

  useEffect(() => {
    document.title = "IM - " + getPageLabel();

  }, [activePage]); // <-- run every time activePage changes

  return (
    <>


      <aside className="sidebar1">
        <h2 className="sidebar-title" >INVENTORY PAGE</h2>
        <p className='line'>_________________</p>
        {/* <p>{user_id}</p> */}
        <nav className="sidebar-nav">
          {pages.map((page) => (
            <div key={page.key}>
              <p
                className={`sidebar-item ${activePage === page.key ? 'active' : ''}`}
                onClick={() => {
                  sessionStorage.setItem('once', "false");
                  toggleExpand(page.key, !!page.children, page.component);

                }
                }
              >
                <Image src={page.icon} width={40} height={40} alt={page.label} />
                {page.label}
              </p>

              {/* Child Items */}
              {page.children && expandedParent === page.key && (
                <div className="child-menu">
                  {page.children.map((child) => (
                    <p
                      key={child.key}
                      className={`sidebar-child-item ${activePage === child.key ? 'active' : ''}`}
                      onClick={() => {
                        setActivePage(child.key);
                        sessionStorage.setItem('once', "false");

                      }}
                    >
                      &nbsp;&nbsp;
                      <Image src={'/assets/images/arrow.png'} alt='arrow' height={40} width={40} />
                      {child.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <section className="main-content">
        {renderContent()}
      </section>
    </>
  );
};

export default SidebarInventory;


