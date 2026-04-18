'use client';
import React from 'react';
import "../../../css/user.css";
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
const ITEMS_PER_PAGE = 11;
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const Audit = () => {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const [bgVisible, setBgVisible] = useState(true);

    const [addUserVisible, setAddUserVisible] = useState(true);
    const [viewUserVisible, setViewUserVisible] = useState(true);
    const [editUserVisible, setEditUserVisible] = useState(true);



    const [mainSize, setMainSize] = useState('720px');
    const [maxH, setMaxH] = useState('80%');


    useEffect(() => {
        const ua = navigator.userAgent;

        if (ua.includes("Edg")) {
            setMainSize('720px');
            setMaxH('80%');
        } else if (ua.includes("Chrome")) {
            setMainSize('680px');
            setMaxH('79%');
        }
    }, []);

    //arrays
    const [userList, setUserList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [locationList, setLocationList] = useState([]);


    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(userList.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = userList.slice(startIndex, startIndex + ITEMS_PER_PAGE);



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




    useEffect(() => {
        GetUser();
        GetLocation();
        GetRole();

    }, []);

    const GetRole = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetRole"
                }
            });

            setRoleList(response.data);
            // alert("Success");
        } catch (error) {
            console.error("Error fetching role list:", error);
        }
    }

    const GetLocation = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'GetDropDown.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetLocation"
                }
            });

            setLocationList(response.data);
            // alert("Success");
        } catch (error) {
            console.error("Error fetching location list:", error);
        }
    }

    const GetUser = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetLogs"
                }
            });
            //   alert("helo");
            console.log(response.data);

            setUserList(response.data);
            // alert("Success");
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
            alert('Please fill in all fields.');
            // return false;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        // const url = "http://localhost/capstone-api/api/products.php";
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
                    json: JSON.stringify(accountDetails), // Send an empty object if required
                    operation: "AddUser"
                }


            });
            if (response.data == 'Success') {
                GetUser();
                resetForm();
                close_modal();
                // alert(response.data);
                alert("New user is successfully added!");

            } else {
                alert(response.data);
            }

            // setRoleList(response.data);
            // alert("Success");
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

    const open_add_User = () => {
        setBgVisible(false);
        setAddUserVisible(false);
    }

    const open_view_User = (account_id) => {
        GetUserDetials(account_id);
        setBgVisible(false);
        setViewUserVisible(false);
    }

    const GetUserDetials = async (user_id) => {


        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        // const url = "http://localhost/capstone-api/api/products.php";

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

    const open_edit_User = (user_id) => {
        GetUserDetials(user_id);
        setBgVisible(false);
        setEditUserVisible(false);
    }

    const UpdateUser = async (e) => {
        e.preventDefault();

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        // const url = "http://localhost/capstone-api/api/products.php";
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
                    json: JSON.stringify(userDetails), // Send an empty object if required
                    operation: "UpdateUser"
                }
            });

            if (response.data == 'Success') {
                GetUser();

                close_modal();
                // alert(response.data);
                setMessage('User details is successfully updated!');
                setModalTitle('Success ✅');
                setShow(true);


            } else {
                setMessage(response.data);
                setModalTitle('Unsuccessful❌');
                setShow(true);
            }

        } catch (error) {
            console.error("Error updating user information:", error);
        }
    }

    const role_change = (e) => {
        const selectedRoleName = e.target.value;
        setRole_(selectedRoleName); // update the state

        // use selectedRoleName instead of role_
        const r = roleList.find(u => u.role_name === selectedRoleName);


        setRoleID_(r.role_id);

    };

    const location_change = (e) => {
        const selectedLocationName = e.target.value;
        setLocation_(selectedLocationName); // update the state

        // use selectedRoleName instead of role_
        const r = locationList.find(l => l.location_name === selectedLocationName);


        setLocationID_(r.location_id);

    };

    const triggerModal = (operation, id, e) => {
        // e.preventDefault();

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

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const exportToExcel = () => {
        // Convert your userList (or currentItems if you want only current page) into a worksheet
        const worksheet = XLSX.utils.json_to_sheet(userList.map((p) => ({
            User: `${p.fname} ${p.mname} ${p.lname}`,
            Activity: p.activity,
            Date: p.date,
            Time: p.time
        })));

        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

        // Generate Excel file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "AuditLogs.xlsx");
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
                    </div> <div className='div-input-add-prod'>
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
            </Modal>   {/* add user modal */}

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
                    </div> <div className='div-input-add-prod'>
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
                    <div style={{ padding: '20px' }}>
                        {/* content */}
                    </div>

                </Modal.Body>
            </Modal> {/* view user modal */}

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
                        {/* {roleID_} */}

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
                        {/* {locationID_} */}

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
                            // disabled={true}
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
                        {/* {status_} */}
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
            </Modal> {/* edit User modal */}

            <div className='black-bg-cust'
                onClick={close_modal}
                hidden={bgVisible} ></div>


            <div className='customer-main' style={{ height: mainSize }}>




                {/* ADD User */}
                <div className='add-cust' hidden={true}>
                    <div className='add-cust-header'>
                        <h1 className='header-ad'>ADD USER</h1>
                        <button onClick={close_modal} className="close-btn" >&times;</button>
                    </div>

                    <div className='div-body-cust'>




                        <div className='buttons'>
                            <button className='button-1'
                                onClick={close_modal}
                            >Cancel</button>
                            <button className='button-2' onClick={register_account}>Register</button>
                        </div>


                    </div>
                </div>
                {/* ADD User */}

                {/*view User */}
                <div className='add-cust' hidden={true}>
                    <div className='add-cust-header'>
                        <h1 className='header-ad'>AUDIT LOGS</h1>
                        <button onClick={close_modal} className="close-btn" >&times;</button>
                    </div>

                    <div className='div-body-cust'>



                    </div>
                </div>
                {/* view User */}


                {/* edit User */}
                <div className='add-cust' hidden={true}>
                    <div className='add-cust-header'>
                        <h1 className='header-ad'>EDIT USER INFORMATION</h1>
                        <button onClick={close_modal} className="close-btn" >&times;</button>
                    </div>

                    <div className='div-body-cust'>




                        <div className='buttons'>
                            <button className='button-1'
                                onClick={close_modal}
                            >Cancel</button>
                            <button className='button-2' onClick={UpdateUser}>Update</button>
                        </div>


                    </div>
                </div>
                {/* edit User */}





                <div className='customer-header'>
                    <h1 className='h-customer'>AUDIT LOGS</h1>
                    <button
                        className='add-cust-bttn'
                        onClick={exportToExcel}
                    >
                        Export to Excel 📑
                    </button>
                </div>
                {/* <div className='search-customer'>
          <div className='filter'>
            <div >
              <label className='label'>ROLE: </label>
              <select className='s'>
                <option>Hello</option>
                <option>Hi</option>
              </select>
            </div>
            <div >
              <label className='label'>STORE: </label>
              <select className='s'>
                <option>Hello</option>
                <option>Hi</option>
              </select>
            </div>
            <div >
              <label className='label'>STATUS: </label>
              <select className='s'>
                <option>Hello</option>
                <option>Hi</option>
              </select>
            </div>
          </div>

          <div>
            <label className='label'>SEARCH: </label>
            <input
              className='search-in'
            />
          </div>
        </div> */}

                <div className='tableContainer' style={{ height: '55vh' }}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th className='t2'>USER</th>
                                <th className='t2'>ACTIVITY</th>
                                <th className='th1'>DATE </th>
                                <th className='th1'>TIME</th>
                                {/* <th className='th1'>ACTION</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((p, i) => (
                                <tr className='table-row' key={i}
                                // onClick={() => triggerModal('viewUser', p.account_id)}

                                >
                                    <td className='td-name'>{p.fname} {p.mname} {p.lname}</td>
                                    <td className='td-name'>{p.activity}</td>
                                    <td>{p.date}</td>
                                    <td>{p.time}</td>
                                    {/* <td>
                    <span className='action-cust' onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevent tr onClick
                       triggerModal('editUserDetails', p.account_id, e);
                    }}>
                      ✏️
                    </span>
                  </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
                {totalPages > 1 && (
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
            {/* for main */}



        </>
    )
}

export default Audit;