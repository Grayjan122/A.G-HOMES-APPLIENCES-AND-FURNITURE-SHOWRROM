'use client';
import React from 'react';
import "../../css/customer.css";
import { useState } from 'react';
import axios from 'axios';
import { useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const Customer = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const [message, setMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [bgVisible, setBgVisible] = useState(true);

  const [addCustomerVisible, setAddCustomerVisible] = useState(true);
  const [viewCustomerVisible, setViewCustomerVisible] = useState(true);
  const [editCustomerVisible, setEditCustomerVisible] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Sorting states
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  //arrays
  const [customerList, setCustomerList] = useState([]);

  //customer inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerID, setCustomerID] = useState('');

  // Sort function for customers
  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }

    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Render sort arrow
  const renderSortArrow = (field) => {
    if (sortField !== field) {
      return (
        <svg
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
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginLeft: '5px' }}
      >
        <path d="m7 14 5-5 5 5" />
      </svg>
    ) : (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginLeft: '5px' }}
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customerList.filter(customer => {
      // Customer name filter
      if (customerNameFilter && !customer.cust_name.toLowerCase().includes(customerNameFilter.toLowerCase())) {
        return false;
      }

      // Address filter
      if (addressFilter && !customer.address.toLowerCase().includes(addressFilter.toLowerCase())) {
        return false;
      }

      // Search filter
      if (searchFilter.trim()) {
        const searchTerm = searchFilter.toLowerCase();
        return customer.cust_name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          customer.phone.toLowerCase().includes(searchTerm) ||
          customer.address.toLowerCase().includes(searchTerm);
      }

      return true;
    });

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle different data types
        if (typeof aVal === 'string') {
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
  }, [customerList, customerNameFilter, addressFilter, searchFilter, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredAndSortedCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [customerNameFilter, addressFilter, searchFilter, sortField, sortDirection]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    GetCustomer();
  }, []);

  const clearAllFilters = () => {
    setCustomerNameFilter('');
    setAddressFilter('');
    setSearchFilter('');
    setSortField('');
    setSortDirection('asc');
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'customerName':
        setCustomerNameFilter('');
        break;
      case 'address':
        setAddressFilter('');
        break;
      case 'search':
        setSearchFilter('');
        break;
    }
  };

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

      setCustomerList(response.data);
    } catch (error) {
      console.error("Error fetching customer list:", error);
    }
  };

  const close_modal = () => {
    resetForm();
    setBgVisible(true);
    setAddCustomerVisible(true);
    setViewCustomerVisible(true);
    setEditCustomerVisible(true);
  }

  const addCustomer = async () => {
    if (!customerName.trim() ||
      !customerPhone.trim() ||
      !customerEmail.trim() ||
      !customerAddress.trim()
    ) {
      setMessage('Please fill all the needed details!');
      setModalTitle('Alert ⚠️');
      setShow(true);
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'customer.php';
    const customerDetails = {
      custName: customerName,
      custPhone: customerPhone,
      custEmail: customerEmail,
      custAddress: customerAddress
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(customerDetails),
          operation: "AddCustomer"
        }
      });
      if (response.data == 'Success') {
        GetCustomer();
        close_modal();
        AlertSucces(
          "Successfully added a new customer!",
          "success",
          true,
          'Good'
        );
       
        return;
      } else {
        showAlertError({
          icon: "error",
          title: "Something Went Wrong!",
          text: 'Failed to add new customer!',
          button: 'Try Again'
        });
        return;
      }

    
    } catch (error) {
      console.error("Error adding new customer", error);
    }
  }

  const GetCustomerDetails = async (cust_id) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'customer.php';
    const locationDetails = {
      custID: cust_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "GetCustomerDetails"
        }
      });

      setCustomerName(response.data[0].cust_name);
      setCustomerPhone(response.data[0].phone);
      setCustomerEmail(response.data[0].email);
      setCustomerID(response.data[0].cust_id);
      setCustomerAddress(response.data[0].address);

    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  }

  const updateCustomerDetails = async (e) => {
    e.preventDefault();

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'customer.php';
    const customerDetails = {
      custName: customerName,
      custID: customerID,
      custPhone: customerPhone,
      custEmail: customerEmail,
      custAddress: customerAddress
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(customerDetails),
          operation: "UpdateCustomerDetails"
        }
      });
      if (response.data == 'Success') {
        GetCustomer();
        resetForm();
        close_modal();
        AlertSucces(
          "Customer details is successfully updated!",
          "success",
          true,
          'Good'
        );

        return;
      } else {
        showAlertError({
          icon: "error",
          title: "Something Went Wrong!",
          text: 'Failed to update customer details!',
          button: 'Try Again'
        });
        return;
      }


    } catch (error) {
      console.error("Error updating customer:", error);
    }
  }

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerID('');
  };

  const triggerModal = (operation, id, e) => {
    switch (operation) {
      case 'addCustomer':
        setAddCustomerVisible(false);
        break;
      case 'viewCustomer':
        GetCustomerDetails(id);
        setViewCustomerVisible(false);
        break;
      case 'editCustomerDetails':
        GetCustomerDetails(id);
        setEditCustomerVisible(false);
        break;
    }
  }

  return (
    <>


      <Modal show={!addCustomerVisible} onHide={close_modal} size='lg' >
        <Modal.Header closeButton >
          <Modal.Title >Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Customer Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone Number</label>
            <input
              className='prod-name-input'
              type='text'
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Address</label>
            <textarea
              className='description-input'
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={addCustomer}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!viewCustomerVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
            <label className='add-prod-label'>Customer ID</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={customerID}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Customer Name</label>
            <input
              disabled={true}
              className='prod-name-input'
              value={customerName}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone Number</label>
            <input
              disabled={true}
              className='prod-name-input'
              value={customerPhone}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              disabled={true}
              className='prod-name-input'
              value={customerEmail}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Address</label>
            <textarea
              disabled={true}
              className='description-input'
              value={customerAddress}
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={!editCustomerVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Customer Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone Number</label>
            <input
              className='prod-name-input'
              type='text'
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Address</label>
            <textarea
              className='description-input'
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateCustomerDetails}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='black-bg-cust' onClick={close_modal} hidden={bgVisible}></div>

      <div className='customer-main'>
        <div className='customer-header'>
          <h1 className='h-customer'>CUSTOMER MANAGEMENT</h1>
          <button className='add-cust-bttn' onClick={() => { triggerModal('addCustomer', '0') }}>ADD CUSTOMER+</button>
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
            {/* Customer Name Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Filter by Customer Name
              </label>
              <select
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Customers</option>
                {[...new Set(customerList.map(customer => customer.cust_name))].sort().map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Filter by Address
              </label>
              <select
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Addresses</option>
                {[...new Set(customerList.map(customer => customer.address))].filter(Boolean).sort().map((address) => (
                  <option key={address} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Search Customers
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
                  placeholder="Search by name, email, phone, or address..."
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

            {customerNameFilter && (
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
                Customer: {customerNameFilter}
                <button
                  type="button"
                  onClick={() => removeFilter('customerName')}
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
                  title="Remove customer filter"
                >
                  ×
                </button>
              </span>
            )}

            {addressFilter && (
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
                Address: {addressFilter.length > 30 ? addressFilter.substring(0, 30) + '...' : addressFilter}
                <button
                  type="button"
                  onClick={() => removeFilter('address')}
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
                  title="Remove address filter"
                >
                  ×
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
                  onClick={() => removeFilter('search')}
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
                  ×
                </button>
              </span>
            )}

            {!customerNameFilter && !addressFilter && !searchFilter && (
              <span style={{ color: '#6c757d' }}>None</span>
            )}

            <span style={{ marginLeft: '10px', color: '#6c757d' }}>
              ({filteredAndSortedCustomers.length} of {customerList.length} customers shown)
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

        {/* Customers Table */}
        <div className='tableContainer' style={{ height: '40vh', overflowY: 'auto' }}>
          {currentItems && currentItems.length > 0 ? (
            <table className='table'>
              <thead>
                <tr>
                  <th 
                    className='t2'
                    onClick={() => handleSort('cust_name')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>CUSTOMER NAME</span>
                      {renderSortArrow('cust_name')}
                    </div>
                  </th>
                  <th 
                    className='t2'
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>EMAIL</span>
                      {/* {renderSortArrow('email')} */}
                    </div>
                  </th>
                  <th 
                    className='t2'
                    onClick={() => handleSort('phone')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>PHONE</span>
                      {/* {renderSortArrow('phone')} */}
                    </div>
                  </th>
                  <th 
                    className='t2'
                    onClick={() => handleSort('address')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>ADDRESS</span>
                      {renderSortArrow('address')}
                    </div>
                  </th>
                  <th className='th1'>TOTAL PURCHASE</th>
                  <th className='th1'>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p, i) => (
                  <tr className='table-row' key={i} onClick={() => triggerModal('viewCustomer', p.cust_id)}>
                    <td className='td-name'>{p.cust_name}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>{p.address && p.address.length > 30 ? p.address.substring(0, 30) + '...' : p.address}</td>
                    <td style={{ textAlign: 'center' }}>0</td>
                    <td>
                      <span className='action-cust' onClick={(e) => {
                        e.stopPropagation();
                        triggerModal('editCustomerDetails', p.cust_id, e);
                      }}>
                        ✏️
                      </span>
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
                👥
              </div>
              <h4 style={{
                color: '#495057',
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {customerList.length === 0 ? 'No customers available' : 'No customers match the current filters'}
              </h4>
              <p style={{
                margin: '0',
                fontSize: '14px',
                maxWidth: '300px',
                lineHeight: '1.4'
              }}>
                {customerList.length === 0
                  ? 'Customers will appear here once added.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
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
      </div>
    </>
  )
}

export default Customer;