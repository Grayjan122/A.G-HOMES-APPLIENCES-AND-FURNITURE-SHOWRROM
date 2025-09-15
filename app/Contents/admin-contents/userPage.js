'use client';
import React from 'react';
import "../../css/user.css";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';

const ITEMS_PER_PAGE = 8;

// Status Indicator Component
const StatusIndicator = ({ status }) => {
    const isOnline = status === 'Online';
    
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
            <div
                style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#28a745' : '#6c757d',
                    border: `2px solid ${isOnline ? '#1e7e34' : '#5a6268'}`,
                    boxShadow: isOnline ? '0 0 6px rgba(40, 167, 69, 0.4)' : 'none',
                    flexShrink: 0
                }}
            />
            <span style={{
                fontSize: '14px',
                color: isOnline ? '#28a745' : '#6c757d',
                fontWeight: '500'
            }}>
                {status}
            </span>
        </div>
    );
};

const User = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);

    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [bgVisible, setBgVisible] = useState(true);

    const [addUserVisible, setAddUserVisible] = useState(true);
    const [viewUserVisible, setViewUserVisible] = useState(true);
    const [editUserVisible, setEditUserVisible] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [roleFilter, setRoleFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    //arrays
    const [userList, setUserList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [locationList, setLocationList] = useState([]);

    //account inputs
    const [userID_, ssetUserID_] = useState('');
    const [f_name, setF_name] = useState('');
    const [m_name, setM_name] = useState('');
    const [l_name, setL_name] = useState('');
    const [user_name, setUser_name] = useState('');
    const [password_, setPassword_] = useState('');
    const [phonne_, setPhone_] = useState('');
    const [email_, setEmail_] = useState('');
    const [address_, setAddress_] = useState('');
    const [bdate_, setBdate_] = useState('');
    const [dateCreated_, setDateCreated_] = useState('');
    const [status_, setStatus_] = useState('');

    const [role_, setRole_] = useState('');
    const [roleID_, setRoleID_] = useState('');
    const [roleValue_, setRoleValue_] = useState('');

    const [location_, setLocation_] = useState('');
    const [locationID_, setLocationID_] = useState('');
    const [locationValue_, setLocationValue_] = useState('');

    // Sort function for users
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

    // Get unique status values
    const uniqueStatuses = [...new Set(userList.map(user => user.status))].filter(Boolean);

    // Filter and sort the user data
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = userList.filter(user => {
            // Role filter
            if (roleFilter && user.role_id != roleFilter) {
                return false;
            }

            // Location filter
            if (locationFilter && user.location_id != locationFilter) {
                return false;
            }

            // Status filter
            if (statusFilter && user.status !== statusFilter) {
                return false;
            }

            // Search filter (name, username, email)
            if (searchFilter) {
                const searchTerm = searchFilter.toLowerCase();
                const fullName = `${user.fname} ${user.mname} ${user.lname}`.toLowerCase();
                const username = (user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();

                if (!fullName.includes(searchTerm) &&
                    !username.includes(searchTerm) &&
                    !email.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        // Apply sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal, bVal;

                // Handle different sorting fields
                switch (sortField) {
                    case 'fullName':
                        aVal = `${a.fname} ${a.mname} ${a.lname}`.toLowerCase();
                        bVal = `${b.fname} ${b.mname} ${b.lname}`.toLowerCase();
                        break;
                    default:
                        aVal = a[sortField];
                        bVal = b[sortField];
                        break;
                }

                // Handle string comparison
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
    }, [userList, roleFilter, locationFilter, statusFilter, searchFilter, sortField, sortDirection]);

    // Pagination for filtered data
    const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when filters or sorting change
    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter, locationFilter, statusFilter, searchFilter, sortField, sortDirection]);

    useEffect(() => {
        GetUser();
        GetLocation();
        GetRole();
    }, []);

    const GetRole = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetRole"
                }
            });

            setRoleList(response.data);
        } catch (error) {
            console.error("Error fetching role list:", error);
        }
    }

    const GetLocation = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';

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

    const GetUser = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetUsers"
                }
            });

            setUserList(response.data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    }

    const register_account = async () => {
        if (
            !f_name.trim() ||
            !m_name.trim() ||
            !l_name.trim() ||
            !user_name.trim() ||
            !password_.trim() ||
            !phonne_.trim() ||
            !email_.trim() ||
            !address_.trim() ||
            !bdate_.trim() ||
            !role_.trim() ||
            !location_.trim()
        ) {
            setMessage('Please fill in all fields.');
            setModalTitle('Alert ⚠️');
            setShow(true);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        const accountDetails = {
            userName: user_name,
            passWord: password_,
            fName: f_name,
            mName: m_name,
            lName: l_name,
            roleID: role_,
            email: email_,
            address: address_,
            phone: phonne_,
            status: 'Offline',
            birthDate: bdate_,
            locationID: location_
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(accountDetails),
                    operation: "AddUser"
                }
            });

            if (response.data == 'Success') {
                GetUser();
                resetForm();
                close_modal();
                setMessage("New user is successfully added!");
                setModalTitle('Success ✅');
                setShow(true);
            } else {
                setMessage(response.data);
                setModalTitle('Error ❌');
                setShow(true);
            }
        } catch (error) {
            console.error("Error adding new user", error);
        }
    }

    const resetForm = () => {
        setF_name('');
        setM_name('');
        setL_name('');
        setUser_name('');
        setPassword_('');
        setPhone_('');
        setEmail_('');
        setAddress_('');
        setBdate_('');
        setRole_('');
        setLocation_('');
        setRoleID_('');
    };

    const close_modal = () => {
        resetForm();
        setBgVisible(true);
        setAddUserVisible(true);
        setViewUserVisible(true);
        setEditUserVisible(true);
    }

    const GetUserDetials = async (user_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';

        const userId = {
            userID: user_id
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(userId),
                    operation: "GetUserDetails"
                }
            });

            ssetUserID_(response.data[0].account_id);
            setF_name(response.data[0].fname);
            setM_name(response.data[0].mname);
            setL_name(response.data[0].lname);
            setBdate_(response.data[0].birth_date);
            setEmail_(response.data[0].email);
            setAddress_(response.data[0].address);
            setPhone_(response.data[0].phone);
            setDateCreated_(response.data[0].date_created);
            setPassword_(response.data[0].user_password);
            setUser_name(response.data[0].username);
            setStatus_(response.data[0].status);
            setRole_(response.data[0].role_name);
            setRoleID_(response.data[0].role_id);
            setRoleValue_(response.data[0].role_name);
            setLocation_(response.data[0].location_name);
            setLocationValue_(response.data[0].location_name);
            setLocationID_(response.data[0].location_id);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }

    const UpdateUser = async (e) => {
        e.preventDefault();

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        const userDetails = {
            fname: f_name,
            lname: l_name,
            mname: m_name,
            bDate: bdate_,
            role: roleID_,
            location: locationID_,
            phone: phonne_,
            email: email_,
            address: address_,
            accountStatus: status_,
            accountID: userID_
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(userDetails),
                    operation: "UpdateUser"
                }
            });

            if (response.data == 'Success') {
                GetUser();
                close_modal();
                setMessage('User details is successfully updated!');
                setModalTitle('Success ✅');
                setShow(true);
            } else {
                setMessage(response.data);
                setModalTitle('Error ❌');
                setShow(true);
            }
        } catch (error) {
            console.error("Error updating user information:", error);
        }
    }

    const role_change = (e) => {
        const selectedRoleName = e.target.value;
        setRole_(selectedRoleName);
        const r = roleList.find(u => u.role_name === selectedRoleName);
        setRoleID_(r.role_id);
    };

    const location_change = (e) => {
        const selectedLocationName = e.target.value;
        setLocation_(selectedLocationName);
        const r = locationList.find(l => l.location_name === selectedLocationName);
        setLocationID_(r.location_id);
    };

    const triggerModal = (operation, id, e) => {
        switch (operation) {
            case 'addUserVisible':
                setAddUserVisible(false);
                break;
            case 'viewUser':
                GetUserDetials(id);
                setViewUserVisible(false);
                break;
            case 'editUserDetails':
                GetUserDetials(id);
                setEditUserVisible(false);
                break;
        }
    }

    const clearAllFilters = () => {
        setRoleFilter('');
        setLocationFilter('');
        setStatusFilter('');
        setSearchFilter('');
        setSortField('');
        setSortDirection('asc');
    };

    const removeFilter = (filterType) => {
        switch (filterType) {
            case 'role':
                setRoleFilter('');
                break;
            case 'location':
                setLocationFilter('');
                break;
            case 'status':
                setStatusFilter('');
                break;
            case 'search':
                setSearchFilter('');
                break;
        }
    };

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

            <Modal show={!addUserVisible} onHide={close_modal} size='lg' >
                <Modal.Header closeButton >
                    <Modal.Title >Add User</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={f_name}
                            onChange={(e) => setF_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={m_name}
                            onChange={(e) => setM_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={l_name}
                            onChange={(e) => setL_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                            onChange={(e) => setBdate_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Role</label>
                        <select className='category-dropdown' onChange={(e) => setRole_(e.target.value)} value={role_}>
                            <option>Select Role</option>
                            {roleList.map((role) => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Store</label>
                        <select className='category-dropdown' onChange={(e) => setLocation_(e.target.value)} value={location_}>
                            <option>Select Location</option>
                            {locationList.map((r) => (
                                <option key={r.location_id} value={r.location_id}>
                                    {r.location_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={phonne_}
                            onChange={(e) => setPhone_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            type='email'
                            className='prod-name-input'
                            value={email_}
                            onChange={(e) => setEmail_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            className='description-input'
                            value={address_}
                            onChange={(e) => setAddress_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Username</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={user_name}
                            onChange={(e) => setUser_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Password</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={password_}
                            onChange={(e) => setPassword_(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={register_account}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!viewUserVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>User ID</label>
                        <input
                            className='prod-name-input'
                            value={userID_}
                            disabled={true}
                        />
                    </div>
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={f_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={m_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={l_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Role</label>
                        <select className='drop-role' disabled={true}>
                            <option>{role_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Store</label>
                        <select className='drop-role' disabled={true}>
                            <option>{location_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            type='number'
                            value={phonne_}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={email_}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            disabled={true}
                            className='description-input'
                            value={address_}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Username</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={user_name}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Password</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={password_}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Date Created</label>
                        <select className='drop-role' disabled={true}>
                            <option>{dateCreated_}</option>
                        </select>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Status</label>
                        <select className='drop-role' disabled={true}>
                            <option>{status_}</option>
                        </select>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={!editUserVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <label className='add-cust-label-1'>*Name</label>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>First Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={f_name}
                            onChange={(e) => setF_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Middle Name</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={m_name}
                            onChange={(e) => setM_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Last Name</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={l_name}
                            onChange={(e) => setL_name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Birthdate</label>
                        <input
                            className='prod-name-input'
                            type='date'
                            value={bdate_}
                            onChange={(e) => setBdate_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Role</label>
                        <select className='category-dropdown' onChange={(e) => role_change(e)} value={role_}>
                            <option value="" disabled hidden>
                                {roleValue_}
                            </option>
                            {roleList.map((cat) => (
                                <option key={cat.role_id} value={cat.role_name}>
                                    {cat.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Location </label>
                        <select className='category-dropdown' onChange={(e) => location_change(e)} value={location_}>
                            <option value="" disabled hidden>
                                {locationValue_}
                            </option>
                            {locationList.map((cat) => (
                                <option key={cat.location_id} value={cat.location_name}>
                                    {cat.location_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Phone Number</label>
                        <input
                            className='prod-name-input'
                            type='text'
                            value={phonne_}
                            onChange={(e) => setPhone_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Email</label>
                        <input
                            className='prod-name-input'
                            type='email'
                            value={email_}
                            onChange={(e) => setEmail_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Address</label>
                        <textarea
                            className='description-input'
                            value={address_}
                            onChange={(e) => setAddress_(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Account Status</label>
                        <select className='drop-role' value={status_} onChange={(e) => setStatus_(e.target.value)}>
                            <option value={status_}>{status_}</option>
                            <option value={'Active'}>Active</option>
                            <option value={'Deactive'}>Deactive</option>
                            <option value={'Suspended'}>Suspend</option>
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={UpdateUser}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>USER MANAGEMENT</h1>
                    <button className='add-cust-bttn' onClick={() => { triggerModal('addUserVisible', '0') }}>ADD USER+</button>
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
                        {/* Role Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Roles</option>
                                {roleList.map((role) => (
                                    <option key={role.role_id} value={role.role_id}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Store
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
                                <option value="">All Stores</option>
                                {locationList.map((location) => (
                                    <option key={location.location_id} value={location.location_id}>
                                        {location.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Statuses</option>
                                {uniqueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Users
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
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Search by name, username, or email..."
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

                        {roleFilter && (
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
                                Role: {roleList.find(role => role.role_id === roleFilter)?.role_name || roleFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('role')}
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
                                    title="Remove role filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

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
                                Store: {locationList.find(loc => loc.location_id === locationFilter)?.location_name || locationFilter}
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
                                    title="Remove store filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {statusFilter && (
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
                                Status: {statusFilter}
                                <button
                                    type="button"
                                    onClick={() => removeFilter('status')}
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
                                    title="Remove status filter"
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

                        {!roleFilter && !locationFilter && !statusFilter && !searchFilter && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedUsers.length} of {userList.length} users shown)
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

                {/* Users Table */}
                <div className='tableContainer' style={{ height: '35vh', overflowY: 'auto' }}>
                    {currentItems && currentItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th 
                                        className='t2'
                                        onClick={() => handleSort('fullName')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>NAME</span>
                                            {renderSortArrow('fullName')}
                                        </div>
                                    </th>
                                    <th 
                                        className='t2'
                                        onClick={() => handleSort('role_name')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>ROLE</span>
                                            {renderSortArrow('role_name')}
                                        </div>
                                    </th>
                                    <th 
                                        className='t2'
                                        onClick={() => handleSort('location_name')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>STORE</span>
                                            {renderSortArrow('location_name')}
                                        </div>
                                    </th>
                                    <th 
                                        className='t2'
                                        onClick={() => handleSort('status')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>STATUS</span>
                                            {renderSortArrow('status')}
                                        </div>
                                      
                                    </th>
                                     <th 
                                        className='t2'
                                        onClick={() => handleSort('active_status')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>ACTIVE STATUS</span>
                                            {renderSortArrow('active_status')}
                                        </div>
                                      
                                    </th>
                                    <th className='th1'>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p, i) => (
                                    <tr className='table-row' key={i}
                                        onClick={() => triggerModal('viewUser', p.account_id)}
                                    >
                                        <td className='td-name'>{p.fname} {p.mname} {p.lname}</td>
                                        <td className='td-name'>{p.role_name}</td>
                                        <td className='td-name'>{p.location_name}</td>
                                        <td className='td-name'>{p.status}</td>
                                        <td className='td-name'>
                                            <StatusIndicator status={p.active_status} />
                                        </td>

                                        <td>
                                            <span className='action-cust' onClick={(e) => {
                                                e.stopPropagation();
                                                triggerModal('editUserDetails', p.account_id, e);
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
                                {userList.length === 0 ? 'No users available' : 'No users match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {userList.length === 0
                                    ? 'Users will appear here once they are added to the system.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && currentItems && currentItems.length > 0 && (
                    <div style={{ justifySelf: 'center', marginTop: '20px' }}>
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

export default User;