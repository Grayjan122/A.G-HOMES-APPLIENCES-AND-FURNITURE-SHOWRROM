'use client';
import React from 'react';
import "../../css/location.css";
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

const Location = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const [message, setMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const [bgVisible, setBgVisible] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageBranch, setCurrentPageBranch] = useState(1);

  // Filter states for locations
  const [locationNameFilter, setLocationNameFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [locationSearchFilter, setLocationSearchFilter] = useState('');

  // Filter states for branches
  const [branchSearchFilter, setBranchSearchFilter] = useState('');

  

  const [addLocationVisible, setAddLocationVisible] = useState(true);
  const [viewLocationVisible, setViewLocationVisible] = useState(true);
  const [editLocationVisible, setEditLocationVisible] = useState(true);

  const [addBranchVisible, setAddBrancVisible] = useState(true);
  const [viewBrancVisible, setViewBrancVisible] = useState(true);
  const [editBrancVisible, setEditBrancVisible] = useState(true);

  const [locationVisible, setLocationVisible] = useState(true);
  const [branchVisible, setBranchVisible] = useState(false);

  //arrays
  const [branchList, setBranchList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  //locationInputs
  const [locID, setLocID] = useState('');
  const [locName, setLocName] = useState('');
  const [locContactPerson, setLocContactPerson] = useState('');
  const [locPhone, setLocPhone] = useState('');
  const [locEmail, setLocEmail] = useState('');
  const [locAddress, setLocAdress] = useState('');
  const [locBranch, setLocBracnh] = useState('');
  const [locBranchID, setLocBracnhID] = useState('');
  const [locBranchName, setLocBracnhName] = useState('');

  //branchInputs
  const [branchName, setBranchName] = useState('');
  const [branchID, setBranchID] = useState('');

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locationList.filter(location => {
      // Location name filter
      if (locationNameFilter && !location.location_name.toLowerCase().includes(locationNameFilter.toLowerCase())) {
        return false;
      }

      // Branch filter
      if (branchFilter && location.branch_id != branchFilter) {
        return false;
      }

      // Search filter
      if (locationSearchFilter.trim()) {
        const searchTerm = locationSearchFilter.toLowerCase();
        return location.location_name.toLowerCase().includes(searchTerm) ||
               location.address.toLowerCase().includes(searchTerm) ||
               location.branch_name.toLowerCase().includes(searchTerm) ||
               location.contact_person.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  }, [locationList, locationNameFilter, branchFilter, locationSearchFilter]);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branchList.filter(branch => {
      if (branchSearchFilter.trim()) {
        const searchTerm = branchSearchFilter.toLowerCase();
        return branch.branch_name.toLowerCase().includes(searchTerm);
      }
      return true;
    });
  }, [branchList, branchSearchFilter]);

  // Pagination for locations
  const totalPagesLocations = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);
  const startIndexLocations = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLocationItems = filteredLocations.slice(startIndexLocations, startIndexLocations + ITEMS_PER_PAGE);

  // Pagination for branches
  const totalPagesBranches = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const startIndexBranches = (currentPageBranch - 1) * ITEMS_PER_PAGE;
  const currentBranchItems = filteredBranches.slice(startIndexBranches, startIndexBranches + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [locationNameFilter, branchFilter, locationSearchFilter]);

  useEffect(() => {
    setCurrentPageBranch(1);
  }, [branchSearchFilter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPagesLocations) {
      setCurrentPage(page);
    }
  };

  const handlePageChangeBranch = (page) => {
    if (page >= 1 && page <= totalPagesBranches) {
      setCurrentPageBranch(page);
    }
  };

  useEffect(() => {
    GetBranch();
    GetLocation();
  }, []);

  const clearLocationFilters = () => {
    setLocationNameFilter('');
    setBranchFilter('');
    setLocationSearchFilter('');
  };

  const clearBranchFilters = () => {
    setBranchSearchFilter('');
  };

  const removeLocationFilter = (filterType) => {
    switch (filterType) {
      case 'locationName':
        setLocationNameFilter('');
        break;
      case 'branch':
        setBranchFilter('');
        break;
      case 'search':
        setLocationSearchFilter('');
        break;
    }
  };

  const GetBranch = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'GetDropDown.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetBranch"
        }
      });

      setBranchList(response.data);
    } catch (error) {
      console.error("Error fetching branch list:", error);
    }
  }

  const GetLocation = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetLocation"
        }
      });

      setLocationList(response.data);
    } catch (error) {
      console.error("Error fetching location list:", error);
    }
  }

  const show_location = () => {
    setLocationVisible(true);
    setBranchVisible(false);
  }

  const show_branch = () => {
    setBranchVisible(true);
    setLocationVisible(false);
  }

  const close_modal = () => {
    resetForm();
    setBgVisible(true);
    setAddLocationVisible(true);
    setViewLocationVisible(true);
    setEditLocationVisible(true);
    setAddBrancVisible(true);
    setViewBrancVisible(true);
    setEditBrancVisible(true);
  }

  const addLocation = async () => {
    if (
      !locName.trim() ||
      !locContactPerson.trim() ||
      !locPhone.trim() ||
      !locEmail.trim() ||
      !locAddress.trim() ||
      !locBranchID.trim()
    ) {
      setMessage('Please fill all the needed details!');
      setModalTitle('Alert ⚠️');
      setShow(true);
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locName: locName,
      contactPerson: locContactPerson,
      phone: locPhone,
      email: locEmail,
      address: locAddress,
      branchID: locBranchID
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "AddLocation"
        }
      });

      if (response.data == 'Success') {
        GetLocation();
        close_modal();
        setMessage('New location is successfully added!');
        setModalTitle('Success ✅');
        setShow(true);
      } else {
        setMessage(response.data);
        setModalTitle('Unsuccessful❌');
        setShow(true);
      }
    } catch (error) {
      console.error("Error adding new location", error);
    }
  }

  const GetLocationDetails = async (loc_id) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locID: loc_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "GetLocationDetails"
        }
      });

      setLocName(response.data[0].location_name);
      setLocID(response.data[0].location_id);
      setLocContactPerson(response.data[0].contact_person);
      setLocPhone(response.data[0].phone);
      setLocEmail(response.data[0].email);
      setLocBracnhName(response.data[0].branch_name);
      setLocAdress(response.data[0].address);
      setLocID(response.data[0].location_id);
      setLocBracnhID(response.data[0].branch_id);

    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  }

  const updateLocation = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      locName: locName,
      contactPerson: locContactPerson,
      phone: locPhone,
      email: locEmail,
      address: locAddress,
      branchID: locBranchID,
      locID: locID
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "UpdateLocationDetails"
        }
      });

      if (response.data == 'Success') {
        GetLocation();
        close_modal();
        AlertSucces(
          "Location details is successfully updated!",
          "success",
          true,
          'Okay'
        );
      } else {
        showAlertError({
          icon: "error",
          title: "Something Went Wrong!",
          text: 'Failed to update location details!',
          button: 'Try Again'
        });
        return;
      }
    } catch (error) {
      console.error("Error updating location details:", error);
    }
  }

  const addBranch = async () => {
    if (!branchName.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const branchDetails = {
      branchName: branchName,
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(branchDetails),
          operation: "AddBranch"
        }
      });

      if (response.data == 'Success') {
        GetBranch();
        close_modal();
        alert("New branch is successfully added!");
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error("Error adding new branch", error);
    }
  }

  const open_view_Branch = (branch_id) => {
    GetBranchDetails(branch_id);
    setBgVisible(false);
    setViewBrancVisible(false);
  }

  const GetBranchDetails = async (branch_id) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const locationDetails = {
      branchID: branch_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locationDetails),
          operation: "GetBranchDetails"
        }
      });

      setBranchName(response.data[0].branch_name);
      setBranchID(response.data[0].branch_id);

    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  }

  const open_edit_Branch = (branch_id) => {
    GetBranchDetails(branch_id);
    setBgVisible(false);
    setEditBrancVisible(false);
  }

  const updateBranch = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const branchDetails = {
      branchName: branchName,
      branchID: branchID
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(branchDetails),
          operation: "UpdateBranchDetails"
        }
      });

      if (response.data == 'Success') {
        GetBranch();
        close_modal();
        alert("Branch details is successfully updated!");
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error("Error updating branch details:", error);
    }
  }

  const resetForm = () => {
    setLocID('');
    setLocName('');
    setLocContactPerson('');
    setLocPhone('');
    setLocEmail('');
    setLocAdress('');
    setLocBracnh('');
    setLocBracnhID('');
    setLocBracnhName('');
    setBranchName('');
    setBranchID('');
    setModalTitle('');
    setMessage('');
  };

  const branch_change = (e) => {
    const selected = e.target.value;
    setLocBracnhName(selected);

    const r = branchList.find(u => u.branch_name === selected);
    setLocBracnhID(r.branch_id);
  };

  const triggerModal = (operation, id, e) => {
    switch (operation) {
      case 'addLocation':
        setAddLocationVisible(false);
        break;
      case 'viewLocation':
        GetLocationDetails(id);
        setViewLocationVisible(false);
        break;
      case 'editLocation':
        GetLocationDetails(id);
        setEditLocationVisible(false);
        break;
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size='sm'>
        <Modal.Header closeButton >
          <Modal.Title >{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* All existing modals remain the same */}
      <Modal show={!addLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Add Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input
              className='prod-name-input'
              type='text'
              value={locContactPerson}
              onChange={(e) => setLocContactPerson(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input
              className='prod-name-input'
              type='text'
              value={locPhone}
              onChange={(e) => setLocPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={locEmail}
              onChange={(e) => setLocEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input
              className='prod-name-input'
              type='text'
              value={locAddress}
              onChange={(e) => setLocAdress(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch</label>
            <select className='category-dropdown ' placeholder='Hello' onChange={(e) => setLocBracnhID(e.target.value)} value={locBranchID}>
              <option value="" disabled hidden>
                Select Branch
              </option>
              {branchList.map((cat) => (
                <option key={cat.branch_id} value={cat.branch_id}>
                  {cat.branch_name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={addLocation}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!viewLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Location Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
            <label className='add-prod-label'>Location ID</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={locID}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input
              className='prod-name-input'
              value={locName}
              disabled={true}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input
              className='prod-name-input'
              value={locContactPerson}
              disabled={true}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input
              value={locPhone}
              className='prod-name-input'
              disabled={true}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              disabled={true}
              value={locEmail}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={locAddress}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Branch Name</label>
            <select className='drop-role' disabled={true}>
              <option>{locBranchName}</option>
            </select>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={!editLocationVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Edit Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body' >
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Contact Person</label>
            <input
              className='prod-name-input'
              type='text'
              value={locContactPerson}
              onChange={(e) => setLocContactPerson(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Phone</label>
            <input
              className='prod-name-input'
              type='text'
              value={locPhone}
              onChange={(e) => setLocPhone(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Email</label>
            <input
              className='prod-name-input'
              type='email'
              value={locEmail}
              onChange={(e) => setLocEmail(e.target.value)}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Location Address</label>
            <input
              className='prod-name-input'
              type='text'
              value={locAddress}
              onChange={(e) => setLocAdress(e.target.value)}
            />
          </div>
          <div className='div-input-add-cat'>
            <label className='add-prod-label'>Branch Name</label>
            <select className='drop-role' value={locBranchName} onChange={(e) => branch_change(e)}>
              <option value="" disabled hidden>
                {locBranchName}
              </option>
              {branchList.map((cat) => (
                <option key={cat.branch_id} value={cat.branch_name}>
                  {cat.branch_name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateLocation}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='black-bg-cust' onClick={close_modal} hidden={bgVisible}></div>

      {/*  add Branch */}
      <div className='add-loc' hidden={addBranchVisible}>
        <div className='add-cust-header'>
          <h1 className='header-ad'>ADD BRANCH</h1>
          <button onClick={close_modal} className="close-btn" >&times;</button>
        </div>

        <div className='div-body-loc'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              type='text'
              className='prod-name-input'
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>

          <div className='buttons'>
            <button className='button-1' onClick={close_modal}>Cancel</button>
            <button className='button-2' onClick={addBranch}>Save</button>
          </div>
        </div>
      </div>

      {/*  view Branch */}
      <div className='add-loc-view' hidden={viewBrancVisible}>
        <div className='add-cust-header'>
          <h1 className='header-ad'>BRANCH DETAILS</h1>
          <button onClick={close_modal} className="close-btn" >&times;</button>
        </div>

        <div className='div-body-loc-view'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch ID</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={branchID}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={branchName}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Total Location</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={locationList.filter(loc => loc.branch_id === branchID).length}
            />
          </div>
        </div>
      </div>

      {/*  edit Branch */}
      <div className='add-loc' hidden={editBrancVisible}>
        <div className='add-cust-header'>
          <h1 className='header-ad'>EDIT BRANCH DETAILS</h1>
          <button onClick={close_modal} className="close-btn" >&times;</button>
        </div>

        <div className='div-body-loc'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>

          <div className='buttons'>
            <button className='button-1' onClick={close_modal}>Cancel</button>
            <button className='button-2' onClick={updateBranch}>Update</button>
          </div>
        </div>
      </div>

      <div className='customer-main'>
        <div className='product-header'>
          <div className='head'>
            <h1
              onClick={show_location}
              style={{ color: locationVisible ? 'black' : '' }}
              className='h-product'>LOCATION MANAGEMENT</h1>
           
          </div>
          <div>
            <button className='add-pro-bttn' hidden={!locationVisible} onClick={() => { triggerModal('addLocation', '0') }}>ADD LOCATION+</button>
          </div>
        </div>

        {/* Location Filters */}
        {locationVisible && (
          <>
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
                {/* Location Name Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Filter by Location Name
                  </label>
                  <select
                    value={locationNameFilter}
                    onChange={(e) => setLocationNameFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Locations</option>
                    {[...new Set(locationList.map(loc => loc.location_name))].sort().map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Filter by Branch
                  </label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Branches</option>
                    {branchList.map((branch) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Search Locations
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
                      placeholder="Search by name, address, or contact..."
                      value={locationSearchFilter}
                      onChange={(e) => setLocationSearchFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 35px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />

                    {locationSearchFilter && (
                      <button
                        type="button"
                        onClick={() => setLocationSearchFilter('')}
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

            {/* Location Active Filters */}
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

                {locationNameFilter && (
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
                    Location: {locationNameFilter}
                    <button
                      type="button"
                      onClick={() => removeLocationFilter('locationName')}
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
                      ×
                    </button>
                  </span>
                )}

                {branchFilter && (
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
                    Branch: {branchList.find(branch => branch.branch_id === branchFilter)?.branch_name || branchFilter}
                    <button
                      type="button"
                      onClick={() => removeLocationFilter('branch')}
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
                      title="Remove branch filter"
                    >
                      ×
                    </button>
                  </span>
                )}

                {locationSearchFilter && (
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
                    Search: "{locationSearchFilter}"
                    <button
                      type="button"
                      onClick={() => removeLocationFilter('search')}
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

                {!locationNameFilter && !branchFilter && !locationSearchFilter && (
                  <span style={{ color: '#6c757d' }}>None</span>
                )}

                <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                  ({filteredLocations.length} of {locationList.length} locations shown)
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={clearLocationFilters}
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
          </>
        )}

       

        {/* Locations Table */}
        <div className='tableContainer' hidden={!locationVisible} style={{ height: '35vh', overflowY: 'auto' }}>
          {currentLocationItems && currentLocationItems.length > 0 ? (
            <table className='table'>
              <thead>
                <tr>
                  <th className='t2'>LOCATION NAME</th>
                  <th className='t2'>LOCATION ADDRESS</th>
                  <th className='t2'>BRANCH</th>
                  <th className='t2'>CONTACT PERSON</th>
                  <th className='th1'>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentLocationItems.map((p, i) => (
                  <tr className='table-row' key={i} onClick={() => triggerModal('viewLocation', p.location_id)}>
                    <td className='td-name'>{p.location_name}</td>
                    <td className='td-name'>{p.address}</td>
                    <td>{p.branch_name}</td>
                    <td>{p.contact_person}</td>
                    <td>
                      <span className='action-cust' onClick={(e) => {
                        e.stopPropagation();
                        triggerModal('editLocation', p.location_id, e);
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
                📍
              </div>
              <h4 style={{
                color: '#495057',
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                {locationList.length === 0 ? 'No locations available' : 'No locations match the current filters'}
              </h4>
              <p style={{
                margin: '0',
                fontSize: '14px',
                maxWidth: '300px',
                lineHeight: '1.4'
              }}>
                {locationList.length === 0
                  ? 'Locations will appear here once added.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          )}
        </div>

        

        {/* Location Pagination */}
        {locationVisible && totalPagesLocations > 1 && currentLocationItems && currentLocationItems.length > 0 && (
          <div style={{ justifySelf: 'center' }}>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPagesLocations}
              onPageChange={handlePageChange}
              color="green"
            />
          </div>
        )}

      </div>
    </>
  )
}

export default Location;