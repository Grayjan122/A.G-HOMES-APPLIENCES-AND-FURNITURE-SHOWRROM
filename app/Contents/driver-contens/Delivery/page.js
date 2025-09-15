'use client';
import { useState, useEffect, useRef } from 'react';
import "../../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';


const DeliveryDriver = () => {

    const [user_id, setUser_id] = useState('');
    const [location_id, setLocation_id] = useState('');


    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        setLocation_id(sessionStorage.getItem('location_id'));



    }, []);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const [bgVisible, setBgVisible] = useState(true);

    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial status
        setIsOnline(navigator.onLine);

        // Event listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    const [requestStockVisible, setRequestStockVisible] = useState(true);
    const [searchedProdkVisible, setSearchedVisible] = useState(true);
    const [editListVisible, setEditListVisible] = useState(true);



    const [addInventoryVisible, setAddInventoryVisible] = useState(true);
    const [viewInventoryVisible, setViewInventoryVisible] = useState(true);
    const [editInventoryVisible, setEditInventoryVisible] = useState(true);


    //ARRAYS
    const [userList, setUserList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [stockInList, setStockInList] = useState([]);

    const [inventoryList, setInventoryList] = useState([]);

    const [searcList, setSearchList] = useState([]);

    const [stockOutList, setStockOutList] = useState([]);

    const [selectedProducts, setSelectedProducts] = useState([]);

    const [requestList1, setRequestList1] = useState([]);

    const [requestDetails, setRequestDetails] = useState([]);


    useEffect(() => {
        const allProductIds = stockOutList.map((item) => item.product_id);
        setSelectedProducts(allProductIds);
    }, [stockOutList]);




    //inputes
    const [prodName, setProdName] = useState('');
    const [prodQty, setProdQty] = useState('');
    const [selectedProdName, setSelectedProdName] = useState('');
    const [locID, setLocID] = useState(0);
    const [stockLevel, setStockLevel] = useState('');
    const [searchProd, setSearchProd] = useState('');


    useEffect(() => {
        // alert(locID);
        GetInventory();
    }, [locID, stockLevel, searchProd]);

    useEffect(() => {
        GetProduct();
        GetLocation();
        GetInventory();
        GetRequest();
        GetCurrentSotreInventory();
        GetUser();
        GetDeliveries();
    }, []);

    const GetUser = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'users.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetUsers"
                }
            });

            setUserList(response.data);
            // alert("Success");
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    }



    const GetProduct = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        // const url = "http://localhost/capstone-api/api/products.php";


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]), // Send an empty object if required
                    operation: "GetProduct"
                }
            });

            setProductList(response.data);
            // alert("Success");
        } catch (error) {
            console.error("Error fetching product list:", error);
        }
    }


    useEffect(() => {
        SearchProduct();
    }, [prodName])

    const SearchProduct = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        const searchD = {
            search: prodName
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(searchD), // Send an empty object if required
                    operation: "SearchProduct"
                }
            });

            if (!response.data) {
                setSearchList([]);
            } else {
                setSearchList(response.data);

            }
            // alert("Success");
        } catch (error) {
            console.error("Error fetching search list:", error);
        }


    }

    const GetLocation = async () => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'location.php';
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

    const GetInventory = async () => {
        // setProdId(id);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        // const url = "http://localhost/capstone-api/api/products.php";

        const locDetails = {
            locID: locID,
            stockLevel: stockLevel,
            search: searchProd
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails), // Send an empty object if required
                    operation: "GetInventory"
                }
            });
            // alert(response.data[0].product_name);
            setInventoryList(response.data);

        } catch (error) {
            console.error("Error fetching invenroty:", error);

        }
        return;


    }


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const s = productList.find(product => product.product_name.toLowerCase() == prodName.toLowerCase() || product.product_id == prodName);

            if (!s) {
                alert("Product is unavailable! Please select other.");
                setSelectedProdName('');

                return;
            }

            setSelectedProdName(s.product_name);
            triggerModal('searchedProduct', s.product_id);
        }


    };

    const searchClick = (prodN) => {
        // alert('searchClick');
        const s = productList.find(product => product.product_name.toLowerCase() == prodN.toLowerCase() || product.product_id == prodN);

        if (!s) {
            alert("Product is unavailable! Please select other.");
            setSelectedProdName('');

            return;
        }

        setSelectedProdName(s.product_name);
        triggerModal('searchedProduct', s.product_id);
        setSearchList([]);
        setProdName('');



    }


    const addInStockList = () => {
        if (

            !prodQty.trim()
        ) {
            setProdQty('');
            setMessage("Please input a qty!");
            setAlertVariant('warning');

            setAlertBG('#cfb040ff');
            setAlert1(true);

            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;
        } else if (prodQty < 1) {
            setModalTitle('Invalid QTY Value');
            setMessage("Qty can't be least than 1, Please input a valid qty!");
            setAlertVariant('danger');

            setAlertBG('#dc7a80');
            setAlert1(true);

            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;

        }

        const s = productList.find(product => product.product_name.toLowerCase() == selectedProdName.toLowerCase());

        // const itemWithQty = { ...s, qty: prodQty };

        setStockInList(prev => {
            const existingIndex = prev.findIndex(item => item.product_name === s.product_name);

            const incomingQty = parseInt(prodQty) || 0;

            if (existingIndex !== -1) {
                const updatedList = [...prev];
                const existingQty = parseInt(updatedList[existingIndex].qty) || 0;
                updatedList[existingIndex].qty = existingQty + (incomingQty / 2);
                return updatedList;
            } else {
                return [...prev, { ...s, qty: incomingQty }];
            }
        });

        setSearchedVisible(true);
        setProdQty('');
        setSelectedProdName('');


    }




    const triggerModal = (operation, id) => {


        switch (operation) {

            case 'viewRequest':
                setViewRequestVisible(false);
                break;
            case 'viewRequestDetails':
                // alert(id);
                setRequestList1([]);
                GetRequestDetails(id);
                GetRequestD(id);
                setViewRequestDetailVisible(false);
                break;
            case 'showDeliver':
                setDeliverVisible(false);
                GetToDeliver();
                break;
            case 'getDeliveryDetails':
                // alert(id);
                setTODeliverList([]);
                GetDeliveryD(id);
                GetDeliveryDetails(id);
                setDeliverDetailsVisible(false);
                break;


        }


    }

    const [editProdID, setEditProdID] = useState('');
    const [editProdName, setEditProdName] = useState('');
    const [editQTY, setEditQty] = useState('');

    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');

    const [tranferDriver, setTransferDriver] = useState('');


    const [clearReq, setClearReq] = useState(true);



    const [requestFrom, setRequestFrom] = useState('');
    const [requestTo, setRequestTo] = useState('');

    const [reqStockOutVisible, setReqStockOutVisible] = useState(true);



    const handleCheckboxChange = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId) // Uncheck
                : [...prev, productId] // Check
        );
    };

    const add_stock_out = () => {
        const selectedItems = stockOutList
            .filter(item => selectedProducts.includes(item.product_id))
            .map(item => ({ ...item, qty: 1 })); // <-- Add qty: 1 here

        setStockInList(prev => {
            const existingIds = new Set(prev.map(item => item.product_id));
            const newItems = selectedItems.filter(item => !existingIds.has(item.product_id));
            return [...prev, ...newItems];
        });

        setSelectedProducts([]);
        setReqStockOutVisible(true);

    };





    const [viewRequestVisibl, setViewRequestVisible] = useState(true);
    const [viewRequestDetailVisibl, setViewRequestDetailVisible] = useState(true);





    const GetRequest = async () => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            locID: LocationID,
            status: 'Pending',
            reqType: 'ReqTo'

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequest"
                }
            });
            // alert(response.data[0].product_name);
            setRequestList1(response.data);
            // console.log(response.data);
            // console.log('Hellow');
            // alert(response.data);



        } catch (error) {
            console.error("Error fetching request list:", error);

        }
        return;
    };


    const [s_reqID, setS_ReqID] = useState('');
    const [s_reqDate, setS_ReqDate] = useState('');
    const [s_reqBy, setS_ReqBy] = useState('');
    const [s_reqFrom, setS_ReqFrom] = useState('');
    const [s_reqStatus, setS_ReqStatus] = useState('');


    const GetRequestDetails = async (req_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            reqID: req_id,
            // locID: LocationID
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequestDetails"
                }
            });
            // alert(response.data[0].product_name);
            // setRequestDetails(response.data);
            // console.log(response.data);
            // console.log('Hellow');
            // alert(response.data);
            setRequestDetails(response.data);



        } catch (error) {
            console.error("Error fetching request details:", error);

        }
        return;
    };

    const [reqFromId, setReqFromId] = useState('');
    const [reqToId, setReqToId] = useState('');


    const GetRequestD = async (req_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'requestStock.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            reqID: req_id,
            locID: LocationID

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetRequestD"
                }
            });
            // alert(response.data[0].product_name);
            // setRequestDetails(response.data);
            setS_ReqBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setS_ReqID(response.data[0].request_stock_id);
            setS_ReqDate(response.data[0].date);
            setS_ReqFrom(response.data[0].reqFrom);
            setS_ReqStatus(response.data[0].request_status);
            setReqFromId(response.data[0].request_from);
            setReqToId(response.data[0].request_to);


            // console.log(response.data);
            // console.log('Hellow');
            // alert(response.data);



        } catch (error) {
            console.error("Error fetching request details:", error);

        }
        return;
    };


    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);


    const GetCurrentSotreInventory = async (lc) => {
        // setProdId(id);
        // alert(location_id);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        // const url = "http://localhost/capstone-api/api/products.php";

        const locDetails = {
            locID: lc,
            stockLevel: '',
            search: ''
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails), // Send an empty object if required
                    operation: "GetInventory"
                }
            });
            // alert(response.data[0].product_name);
            setCurrentStoreInventory(response.data);
            // alert('success');

        } catch (error) {
            console.error("Error fetching inventory:", error);

        }
        return;


    };


    const [deliverVisible, setDeliverVisible] = useState(true);
    const [toDeliverList, setTODeliverList] = useState([]);

    const [deliverDetailsVisible, setDeliverDetailsVisible] = useState(true);
    const [deliverDetails, setDeliverDetails] = useState([]);

    const [appointDriversVisible, setAppointDriverVisible] = useState(true);





    const GetToDeliver = async () => {
        // setProdId(id);
        // alert(location_id);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";

        const locDetails = {
            locID: location_id,
        }


        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails), // Send an empty object if required
                    operation: "GetToDeliver"
                }
            });
            // alert(response.data[0].product_name);
            setTODeliverList(response.data);
            // alert('success');

        } catch (error) {
            console.error("Error fetching ready to deliver:", error);

        }
        return;


    };

    const [transferID, setTransferID] = useState('');
    const [approvedDate, setApprovedDate] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [transferStatus, setTransferStatus] = useState('');
    const [approvedBy, setapprovedBy] = useState('');
    const [requestID, setRequestID] = useState('');



    const GetDeliveryD = async (transfer_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            transID: transfer_id

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetDeliveryD"
                }
            });

            setTransferID(response.data[0].ts_id);
            setApprovedDate(response.data[0].date);
            setapprovedBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setTransferStatus(response.data[0].current_status);
            setTransferTo(response.data[0].receiver);
            setRequestID(response.data[0].request_stock_id);


        } catch (error) {
            console.error("Error fetching delivery details:", error);

        }
        return;
    };

    const GetDeliveryDetails = async (transfer_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            transID: transfer_id

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetDeliveryDetails"
                }
            });
            setDeliverDetails(response.data);
            // console.log(response.data);
        } catch (error) {
            console.error("Error fetching transfer list:", error);

        }
        return;
    };

    const AppointDriver = async () => {
        // setProdId(id);

        if (tranferDriver == '') {
            setMessage('Please appoint driver to continue!');
            // setAlertBG('#0ced93');
            setAlertBG('#dc7a80');
            setAlertVariant('danger');
            setAlert1(true);
            // setClearReq(true);
            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;
        }

        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            accID: tranferDriver,
            reqID: requestID,
            transID: transferID

        }
        // console.log(ID);

        // return;
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "AppointDeliveryTransfer"
                }
            });

            if (response.data == 'Success') {
                setMessage('Successfuly appoint a transfer delivery!');
                setAlertBG('#0ced93');
                // setAlertBG('#dc7a80');
                setAlertVariant('success');
                setAlert1(true);
                // setClearReq(true);
                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
                setAppointDriverVisible(true);
                setDeliverDetailsVisible(true);
                setDeliverVisible(true);
            } else {
                console.log(response.data);
                setMessage('Failed to appoint a transfer delivery!' + response.data);
                // setAlertBG('#0ced93');
                setAlertBG('#dc7a80');
                setAlertVariant('danger');
                setAlert1(true);
                // setClearReq(true);
                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
            }
            // setDeliverDetails(response.data);
            // console.log(response.data);
        } catch (error) {
            alert(error);
            console.error("Error apponting a delivery:", error);

        }
        return;
    };

    const [deliveriesList, setDeliveriesList] = useState([]);

    const GetDeliveries = async () => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        // alert(LocationID);
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        // alert(accountID);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            accID: accountID

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetDeliveries"
                }
            });
            if(response.data){
            setDeliveriesList(response.data);

            } else{
                setDeliveriesList([]);
            }
            // console.log(response.data);
            // alert('D sucess');
        } catch (error) {
            console.error("Error fetching deliveries list:", error);

        }
        return;
    };


    const [deliveriesDataVisible, setDeliveriesDataVisible] = useState(true);

    const [dd_trandferID, setDD_TraferID] = useState('');
    const [dd_dtID, setDD_dtID] = useState('');

    const [dd_tranferTo, setDD_TraferTo] = useState('');
    const [dd_Driver, setDD_Driver] = useState('');
    const [dd_Status, setDD_Status] = useState('');
    const [dd_reqID, setDD_ReqID] = useState('');


    const [updateStatus, setUpdateStatus] = useState('');
    const [updateStatusVisible, setUpdateStatusVisible] = useState(true);


    const GetDeliveriesData = async (transaction_id) => {
        // setProdId(id);

        // alert(sessionStorage.getItem('location_id'));
        // const LocationID = parseInt(sessionStorage.getItem('location_id'));
        // alert(LocationID);
        // const accountID = parseInt(sessionStorage.getItem('user_id'));
        // alert(accountID);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            transID: transaction_id

        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetDeliveriesData"
                }
            });
            // setDeliveriesList(response.data);
            // console.log(response.data);
            // console.log(response.data);
            // alert('D sucess');
            setDD_dtID(response.data[0].dt_id);
            setDD_TraferID(response.data[0].ts_id);
            setDD_TraferTo(response.data[0].receiver);
            setDD_Driver(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
            setDD_Status(response.data[0].delivery_status);
            setUpdateStatus(response.data[0].delivery_status);
            setDD_ReqID(response.data[0].request_stock_id);
        } catch (error) {
            console.error("Error fetching deliveries list:", error);

        }
        return;
    };

    const GetDeliveriesDetails = async (transaction_id) => {

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            transID: transaction_id
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "GetDeliveriesDetails"
                }
            });
            setDeliverDetails(response.data);
            console.log(response.data);

        } catch (error) {
            console.error("Error fetching deliveries list:", error);

        }
        return;
    };

    const updateDeliveryStatus = async () => {

        if (updateStatus == dd_Status) {
            setMessage('Please choose another status!');
            // setAlertBG('#0ced93');
            setAlertBG('#dc7a80');
            setAlertVariant('danger');
            setAlert1(true);
            // setClearReq(true);
            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;
        }

        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'delivery.php';
        // const url = "http://localhost/capstone-api/api/products.php";
        // alert(LocationID);
        const ID = {
            transID: dd_trandferID,
            dtID: dd_dtID,
            reqID: dd_reqID,
            stats: updateStatus,
            accID: accountID
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(ID), // Send an empty object if required
                    operation: "UpdateStatus"
                }
            });

            if (response.data == 'Success') {
                setMessage('Delivery status is successfuly updated!');
                setAlertBG('#0ced93');
                // setAlertBG('#dc7a80');
                setAlertVariant('success');
                setAlert1(true);
                // setClearReq(true);
                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
                setUpdateStatusVisible(true);
                setDeliveriesDataVisible(true);
                GetDeliveries();
                return;
            } else {
                setMessage('Failed to update delivery status!' + response.data);
                // setAlertBG('#0ced93');
                setAlertBG('#dc7a80');
                setAlertVariant('danger');
                setAlert1(true);
                // setClearReq(true);
                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
                return;
            }


        } catch (error) {
            console.error("Error fetching deliveries list:", error);

        }
        return;
    };




    return (
        <>

            <Alert variant={alertVariant} className='alert-inventory' show={alert1} style={{ backgroundColor: alertBG }}>
                {message}
            </Alert>

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



            <Modal show={!deliverVisible} onHide={() => { setDeliverVisible(true); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Ready to deliver list</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body' >
                    <div className='tableContainer' style={{ maxHeight: '350px' }}>
                        <table className='table'>
                            <thead>
                                <tr>

                                    <th className='t2'>TRANSFER ID</th>
                                    {/* <th className='t2'>REQUEST FROM</th> */}
                                    <th className='th1'>TRANSFER TO</th>
                                    <th className='th1'>STATUS</th>

                                </tr>
                            </thead>
                            <tbody>
                                {toDeliverList.map((p, i) => (
                                    <tr
                                        className='table-row'
                                        key={i}
                                        onClick={() => {
                                            triggerModal('getDeliveryDetails', p.ts_id);
                                            // GetCurrentSotreInventory(location_id);

                                        }

                                        }
                                    >

                                        <td className='td-name'>{p.ts_id}</td>
                                        <td>{p.receiver}</td>
                                        <td style={{ color: p.current_status === 'Pending' ? 'red' : p.current_status === 'Approved' ? 'green' : 'black' }}>
                                            {p.current_status}
                                        </td>


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* <div className='view-request-reports'>
                        <Button variant="primary" onClick={add_stock_out}>
                            View Request Reports
                        </Button>
                    </div> */}
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setDeliverVisible(true) }}>
                        Close
                    </Button>

                    {/* <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button> */}
                </Modal.Footer>
            </Modal> {/*ready to deliver list modal */}

            <Modal show={!deliverDetailsVisible} onHide={() => { setDeliverDetailsVisible(true); GetToDeliver(); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Tranfer Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body' >

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>TRANSFER ID:</strong> {transferID}</div>
                            <div><strong>DATE APPROVED:</strong> {approvedDate}</div>

                        </div>
                        {/* <div><strong>TRANSFER FROM:</strong> {s_reqFrom}</div> */}
                        <div><strong>TRANSFER TO:</strong> {transferTo}</div>
                        <div><strong>APPROVED BY:</strong> {approvedBy}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: transferStatus === 'Pending' ? 'red' : transferStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {transferStatus}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer1'>
                        <table className='table'>
                            <thead>
                                <tr>

                                    <th className='t2'>Product Name</th>
                                    <th className='th1'>QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliverDetails.map((p, i) => (
                                    <tr className='table-row' key={i}>
                                        <td className='td-name'>{p.product_name}</td>
                                        <td>{p.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setDeliverDetailsVisible(true); GetToDeliver(); }}>
                        Close
                    </Button>

                    <Button variant="primary" onClick={() => { setAppointDriverVisible(false) }}>
                        Appoint Driver
                    </Button>
                </Modal.Footer>
            </Modal> {/*delivery detials appoint rider modal */}

            <Modal show={!updateStatusVisible} onHide={() => { setUpdateStatusVisible(true); }} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Update Delivery Status</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body' >
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Choose Driver</label>
                        <select className='category-dropdown' onChange={(e) => setUpdateStatus(e.target.value)} value={updateStatus}>
                            <option value={updateStatus}>{updateStatus}</option>
                            <option value={"Ready To Deliver"}>Ready To Deliver</option>
                            <option value={"On Deliver"}>On Deliver</option>
                            <option value={"Delayed"}>Delayed</option>
                            <option value={"Delivered"}>Delivered</option>


                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setUpdateStatusVisible(true); }}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateDeliveryStatus}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal> {/* update delivery status */}



            <Modal show={!deliveriesDataVisible} onHide={() => { setDeliveriesDataVisible(true); }} size='lg' className='request-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title >Delivery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='request-modal-body' >

                    <div className="r-details-head">
                        <div className='r-d-div'>
                            <div className='r-1'><strong>TRANSFER ID:</strong> {dd_trandferID}</div>
                            {/* <div><strong>DATE APPROVED:</strong> {approvedDate}</div> */}

                        </div>
                        {/* <div><strong>TRANSFER FROM:</strong> {s_reqFrom}</div> */}
                        <div><strong>TRANSFER TO:</strong> {dd_tranferTo}</div>
                        <div><strong>DRIVER:</strong> {dd_Driver}</div>
                        <div><strong>STATUS:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: transferStatus === 'Pending' ? 'red' : transferStatus === 'Approved' ? 'green' : 'black',
                                fontWeight: 'bold'
                            }}>
                                {dd_Status}
                            </span>
                        </div>
                    </div>

                    <div className='tableContainer1'>
                        <table className='table'>
                            <thead>
                                <tr>

                                    <th className='t2'>Product Name</th>
                                    <th className='th1'>QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliverDetails.map((p, i) => (
                                    <tr className='table-row' key={i}>
                                        <td className='td-name'>{p.product_name}</td>
                                        <td>{p.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => { setDeliveriesDataVisible(true); }}>
                        Close
                    </Button>

                    <Button variant="primary" onClick={() => { setUpdateStatusVisible(false) }}>
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal> {/*delivery detials  modal */}


            <div className='customer-main'>

                <div className='customer-header'>
                    <h1
                        className='h-customer'>DELIVERY MANAGEMENT </h1>

                    <div className='btn3' ref={dropdownRef}>
                        {/* <button className='add-cust-bttn' onClick={() => { triggerModal('showDeliver', '') }}>Deliver Stock</button> */}
                        {/* <button className='btn4' onClick={toggleDropdown}>...</button> */}

                        {dropdownOpen && (
                            <div className='dropdown-more'>
                                <ul>
                                    <li onClick={() => {
                                        // GetToDeliver();
                                        // triggerModal('viewRequest', '');
                                        // setDropdownOpen(false);
                                    }}>....</li>
                                    <li>....</li>
                                </ul>
                            </div>
                        )}
                    </div>

                </div>


                <div className='search-customer'>
                    {/* <div className='filter'>

                        <div >
                            <label className='label'>Store:</label>
                            <select className='new' onChange={(e) => setLocID(e.target.value)}>
                                <option value={0}> All</option>

                                {locationList.map((r) => (
                                    <option key={r.location_id} value={r.location_id}>
                                        {r.location_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div >
                            <label className='label'>STOCK LEVEL: </label>
                            <select className='new' onChange={(e) => setStockLevel(e.target.value)}>
                                <option value={''}> Select Stock Level</option>
                                <option value={'High'}>High Stock</option>
                                <option value={'Low'}>Low Stock</option>
                            </select>
                        </div>
                        {/* {isOnline ? (
              <span style={{ color: 'green' }}>🟢 You are online</span>
            ) : (
              <span style={{ color: 'red' }}>🔴 You are offline</span>
            )} */}

                    {/* </div> */}

                    {/* <div>
                        <label className='label'>SEARCH: </label>
                        <input
                            className='search-in'
                            value={searchProd}
                            onChange={(e) => setSearchProd(e.target.value)}
                        />
                    </div> */}
                </div>

                <div className='tableContainer'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th className='t2'>TRANSFER ID</th>
                                <th className='th1'>TRANSFER TO</th>
                                <th className='th1'>DRIVER</th>
                                <th className='th1'>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveriesList.map((p, i) => (
                                <tr className='table-row' key={i}
                                    onClick={() => {
                                        setDeliveriesDataVisible(false);
                                        GetDeliveriesData(p.dt_id);
                                        GetDeliveriesDetails(p.ts_id);

                                    }}
                                >
                                    <td className='td-name'>{p.ts_id}</td>
                                    <td style={{ textAlign: 'center', height: '50px' }}>{p.receiver}</td>
                                    <td style={{ textAlign: 'center' }}>{p.fname + " " + p.mname + " " + p.lname}</td>
                                    <td style={{ textAlign: 'center' }}>{p.delivery_status} </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
                <div>

                </div>



            </div>
            {/* for main */}



        </>
    )
}

export default DeliveryDriver;