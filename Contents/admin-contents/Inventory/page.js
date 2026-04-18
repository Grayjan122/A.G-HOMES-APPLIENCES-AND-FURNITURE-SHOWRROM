'use client';
import { useState, useEffect, useRef } from 'react';
import "../../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
const ITEMS_PER_PAGE_INVENTORY = 10;



const Inventory = () => {

  const [user_id, setUser_id] = useState('');

  useEffect(() => {
    setUser_id(sessionStorage.getItem('user_id'));


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
  const [productList, setProductList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [stockInList, setStockInList] = useState([]);

  const [inventoryList, setInventoryList] = useState([]);

  const [searcList, setSearchList] = useState([]);

  const [stockOutList, setStockOutList] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);

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

  const [storeReq, setStoreReq] = useState('');
  const [statusReq, setStatusReq] = useState('');



  useEffect(() => {
    // alert(locID);
    GetInventory();
  }, [locID, stockLevel, searchProd]);

  useEffect(() => {
    GetProduct();
    GetLocation();
    GetInventory();
    GetRequest();
    MyGetRequest();
  }, []);

  useEffect(() => {

    // alert(statusReq);
    if (storeReq) {
      MyGetRequest();

    } else if (statusReq) {
      setMessage('Choose a store first!');
      setAlertBG('#dc7a80');
      // setAlertBG('#0ced93');
      setAlertVariant('danger');
      setAlert1(true);

      setTimeout(() => {
        setAlert1(false);
      }, 3000);

    }

  }, [storeReq, statusReq]);



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
  const [isAdding, setIsAdding] = useState(false);

  const addInStockList = () => {


    if (!prodQty.trim()) {
      setProdQty('');
      setMessage("Please input a qty!");
      setAlertVariant('warning');
      setAlertBG('#cfb040ff');
      setAlert1(true);
      setTimeout(() => {
        setAlert1(false);
        setIsAdding(false); // Unlock
      }, 3000);
      return;
    }

    if (prodQty < 1) {
      setModalTitle('Invalid QTY Value');
      setMessage("Qty can't be less than 1, Please input a valid qty!");
      setAlertVariant('danger');
      setAlertBG('#dc7a80');
      setAlert1(true);
      setTimeout(() => {
        setAlert1(false);
        setIsAdding(false); // Unlock
      }, 3000);
      return;
    }

    const s = productList.find(product => product.product_name.toLowerCase() === selectedProdName.toLowerCase());
    const incomingQty = parseInt(prodQty) || 0;

    setStockInList(prev => {
      const existingIndex = prev.findIndex(item => item.product_name === s.product_name);
      if (existingIndex !== -1) {
        // const updatedList = [...prev];
        // const existingQty = parseInt(updatedList[existingIndex].qty) || 0;
        // updatedList[existingIndex].qty = existingQty + (incomingQty/2);
        // return updatedList;
        setMessage('Product is already on list!');
        setAlertVariant('danger');
        setAlertBG('#dc7a80');
        setAlert1(true);

        setTimeout(() => {
          setAlert1(false);
        }, 3000);
        const updatedList = [...prev];
        const existingQty = parseInt(updatedList[existingIndex].qty) || 0;
        // updatedList[existingIndex].qty = existingQty + (incomingQty/2);
        return updatedList;

      } else {
        return [...prev, { ...s, qty: incomingQty }];
      }
    });

    // Clear and reset
    setSearchedVisible(true);
    setProdQty('');
    setSelectedProdName('');


  };

  const close_modal = () => {

    setRequestStockVisible(true);
    setAddInventoryVisible(true);
    setViewInventoryVisible(true);
    setEditInventoryVisible(true);
  }


  const open_view_Inventory = () => {
    setBgVisible(false);
    setViewInventoryVisible(false);
  }

  const open_edit_Inventory = () => {
    setBgVisible(false);
    setEditInventoryVisible(false);
  }

  const [requestList1, setRequestList1] = useState([]);
  const [myRequestList, setMyRequestList] = useState([]);


  const GetRequest = async () => {
    // setProdId(id);

    // alert(sessionStorage.getItem('location_id'));
    // const LocationID = parseInt(sessionStorage.getItem('location_id'));
    const LocationID = 12;
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

  const MyGetRequest = async () => {
    // setProdId(id);

    // alert(sessionStorage.getItem('location_id'));
    // const LocationID = parseInt(sessionStorage.getItem('location_id'));
    const LocationID = storeReq;
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'requestStock.php';
    // const url = "http://localhost/capstone-api/api/products.php";
    // alert(LocationID);
    const ID = {
      locID: LocationID,
      status: statusReq,
      reqType: 'ReqFrom',

    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(ID), // Send an empty object if required
          operation: "GetRequest"
        }
      });
      if (!response.data) {
        setMyRequestList([]);
      } else {
        setMyRequestList(response.data);

      }
      // console.log(response.data);
      // console.log('Hellow');
      // alert(response.data);



    } catch (error) {
      console.error("Error fetching request list:", error);

    }
    return;
  };

  const triggerModal = (operation, id) => {


    switch (operation) {
      case 'requestStock':
        setRequestStockVisible(false);
        break;
      case 'searchedProduct':
        setSearchedVisible(false);
        break;
      case 'editList':
        setEditProdID(id);
        const s = stockInList.find(product => product.product_id === id);
        if (s) {
          setEditProdName(s.product_name);
          setEditQty(s.qty);
        }

        setEditListVisible(false);
        break;
      case 'clearList':
        // alert('je');
        setClearReq(false);
        break;
      case 'reqStockOut':

        if (requestFrom == '') {
          setMessage("Please choose a store request from first!");
          setAlertVariant('danger');
          setAlertBG('#dc7a80');
          setAlert1(true);

          setTimeout(() => {
            setAlert1(false);
          }, 3000);
          return;

        } else {
          GetStockOut();
          setReqStockOutVisible(false);
        }
        break;
      case 'trackRequest':
        setTrackRequestVisible(false);
        break;
      case 'viewRequest':
        setViewRequestVisible(false);
        break;
      case 'trackRequestDetails':
        // alert(id);
        setMyRequestList([]);
        setTrackRequestDetailsVisible(false);
        GetTrackRequestDetails(id);
        GetTrackRequestD(id);
        // GetRequestDetails(id);
        // GetRequestD(id);

        break;


    }


  };

  const [editProdID, setEditProdID] = useState('');
  const [editProdName, setEditProdName] = useState('');
  const [editQTY, setEditQty] = useState('');

  const [alert1, setAlert1] = useState(false);
  const [alertBG, setAlertBG] = useState('');
  const [alertVariant, setAlertVariant] = useState('');




  const edit_item_from_list = () => {

    if (editQTY < 1) {
      setModalTitle('Invalid QTY Value');
      setMessage("Qty can't be least than 1, Please input a valid qty!");
      setAlertBG('#dc7a80')
      // setShow(true);
      setAlert1(true);
      setAlertVariant('danger');

      setTimeout(() => {
        setAlert1(false);
      }, 3000);

      return;
    }


    setStockInList(prevList =>
      prevList.map(item =>
        item.product_id === editProdID
          ? { ...item, qty: editQTY }
          : item
      )
    );

    setEditProdID('');
    setEditProdName('');
    setEditQty('');
    setEditListVisible(true);

  }

  const removeItem = () => {
    setStockInList(prevList =>
      prevList.filter(item => item.product_id !== editProdID)
    );

    setEditProdID('');
    setEditProdName('');
    setEditQty('');
    setEditListVisible(true);
    setMessage('Item remove!');
    setAlertBG('#0ced93');
    setAlertVariant('success');
    setAlert1(true);

    setTimeout(() => {
      setAlert1(false);
    }, 3000);



  };

  const [clearReq, setClearReq] = useState(true);

  const clearList = () => {
    setStockInList([]);
    setMessage('Your request list is now empty!');
    setAlertBG('#0ced93');
    setAlertVariant('success');
    setAlert1(true);
    setClearReq(true);

    setTimeout(() => {
      setAlert1(false);
    }, 3000);
  }

  const [requestFrom, setRequestFrom] = useState('');
  const [requestTo, setRequestTo] = useState('');

  const [reqStockOutVisible, setReqStockOutVisible] = useState(true);

  const GetStockOut = async () => {
    // setProdId(id);

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'inventory.php';
    // const url = "http://localhost/capstone-api/api/products.php";

    const locDetails = {
      locID: requestFrom,
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locDetails), // Send an empty object if required
          operation: "GetStockOut"
        }
      });
      // alert(response.data[0].product_name);
      setStockOutList(response.data);

    } catch (error) {
      console.error("Error fetching invenroty stock out:", error);

    }
    return;
  };

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

  const sendRequest = async () => {


    const showAlert = (msg, variant, bg) => {
      setMessage(msg);
      setAlertVariant(variant);
      setAlertBG(bg);
      setAlert1(true);
      setTimeout(() => setAlert1(false), 3000);
    };

    if (!stockInList || stockInList.length === 0) {
      showAlert("You can't send an empty request!", 'danger', '#dc7a80');
      return;
    } else if (!requestFrom.trim() || !requestTo.trim()) {
      showAlert("Please fill in all needed details", 'danger', '#dc7a80');
      return;
    } else if (requestFrom === requestTo) {
      showAlert("You can't request a stock from a same store/location!", 'danger', '#dc7a80');
      return;
    } else {
      // showAlert("Your request is already sent!", 'success', '#0ced93');
      sendSuccess();
      MyGetRequest();
      return;
    }


  };

  const sendSuccess = async () => {

    const showAlert = (msg, variant, bg) => {
      setMessage(msg);
      setAlertVariant(variant);
      setAlertBG(bg);
      setAlert1(true);
      setTimeout(() => setAlert1(false), 3000);
    };

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'requestStock.php';
    // const url = "http://localhost/capstone-api/api/products.php";
    const LocDetails = {
      reqFrom: requestFrom,
      reqTo: requestTo,
      reqBy: user_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(LocDetails), // Send an empty object if required
          operation: "SendRequest",
          requestList: JSON.stringify(stockInList)
        }
      });

      if (response.data == 'Success') {
        showAlert("Your request is already sent!", 'success', '#0ced93');
        // setReqStockOutVisible(false);
        setRequestStockVisible(true);
        setStockInList([]);
        setRequestFrom('');
        setRequestTo('');

      }
      // alert("Success");
    } catch (error) {
      console.error("Error sending request:", error);
    }


  }


  const [myRequestDetails, setMyRequestDetails] = useState([]);
  const GetTrackRequestDetails = async (req_id) => {
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
      setMyRequestDetails(response.data);



    } catch (error) {
      console.error("Error fetching request details:", error);

    }
    return;
  };

  const [s_reqID, setS_ReqID] = useState('');
  const [s_reqDate, setS_ReqDate] = useState('');
  const [s_reqBy, setS_ReqBy] = useState('');
  const [s_reqFrom, setS_ReqFrom] = useState('');
  const [s_reqStatus, setS_ReqStatus] = useState('');

  const GetTrackRequestD = async (req_id) => {
    // setProdId(id);

    // alert(sessionStorage.getItem('location_id'));
    const LocationID = 12;
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
      // setReqFromId(response.data[0].request_from);
      // setReqToId(response.data[0].request_to);


      // console.log(response.data);
      // console.log('Hellow');
      // alert(response.data);



    } catch (error) {
      console.error("Error fetching request details:", error);

    }
    return;
  };


  const [trackRequestVisible, setTrackRequestVisible] = useState(true);


  const [viewRequestVisibl, setViewRequestVisible] = useState(true);

  const [trackRequestDetailsVsible, setTrackRequestDetailsVisible] = useState(true);

  const [receiveStockDetailsVsible, setReceiveStockDetailsVisible] = useState(true);
  const [rs_StoreID, setRs_StoreID] = useState('');
  const [deliverdList, setDeliverdList] = useState([]);


  useEffect(() => {
    GetDelivered();
    GetCurrentSotreInventory();

  }, [rs_StoreID])

  const GetDelivered = async () => {

    const accountID = parseInt(sessionStorage.getItem('user_id'));
    // alert(accountID);

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'delivery.php';
    // const url = "http://localhost/capstone-api/api/products.php";
    // alert(LocationID);
    const ID = {
      locID: rs_StoreID

    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(ID), // Send an empty object if required
          operation: "GetDelivered"
        }
      });
      if (response.data) {
        setDeliverdList(response.data);
        // console.log(response.data);

      } else {
        setDeliverdList([]);
      }
      // console.log(response.data);
      // alert('D sucess');
    } catch (error) {
      console.error("Error fetching deliveries list:", error);

    }
    return;
  };


  const [stockReceiveDetails, setStockReceiveDetails] = useState([]);
  const [stockReceiveVisible, setStockReceiveVisible] = useState(true);

  const [deliverDetails, setDeliverDetails] = useState([]);
  const [unavailDetails, setUnavailDetails] = useState([]);



  const [d_transferID, setD_TransferID] = useState('');
  const [d_From, setD_From] = useState('');
  const [d_deliveredBy, setD_DeliveredBy] = useState('');
  const [d_status, setD_status] = useState('');
  const [d_dtID, setD_dtID] = useState('');
  const [d_reqID, setD_ReqID] = useState('');







  const GetDeliveredData = async (transaction_id) => {
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
    // alert(transaction_id);
    const ID = {
      transID: transaction_id

    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(ID), // Send an empty object if required
          operation: "GetDeliveredData"
        }
      });
      // setDeliveriesList(response.data);
      // console.log(response.data);
      // console.log(response.data);
      // alert('D sucess');
      setD_TransferID(response.data[0].ts_id);
      setD_From(response.data[0].sender);
      setD_DeliveredBy(response.data[0].fname + " " + response.data[0].mname + " " + response.data[0].lname);
      setD_status(response.data[0].delivery_status);
      setD_dtID(response.data[0].dt_id);
      setD_ReqID(response.data[0].request_stock_id);

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

  const GetUnavailDetails = async (transaction_id) => {

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
          operation: "GetUnavail"
        }
      });
      setUnavailDetails(response.data);
      console.log(response.data);

    } catch (error) {
      console.error("Error fetching unavailable list:", error);

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
      locID: rs_StoreID,
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
      if (response.data) {
        setCurrentStoreInventory(response.data);
        console.log(response.data);


      } else {
        setCurrentStoreInventory([]);
      }
      // alert('success');

    } catch (error) {
      console.error("Error fetching inventory:", error);

    }
    return;


  };


  const ReveiceStock = async () => {


    const oldProduct = [];
    const newProduct = [];
    const report = [];


    console.log('Deliver Details:', deliverDetails);
    console.log('Current Inventory:', currentStoreInventory);

    deliverDetails.forEach((invProd) => {
      const match = currentStoreInventory.find(delProd =>
        String(delProd.product_id) === String(invProd.product_id)
      );

      if (match) {
        oldProduct.push({
          ...invProd,
          qty: invProd.qty + match.qty
        });

        report.push({
          prodID: match.product_id,
          pastBalance: match.qty,
          qty: invProd.qty,
          currentBalance: invProd.qty + match.qty
        });

      } else {
        newProduct.push(invProd);
        report.push({
          prodID: invProd.product_id,
          pastBalance: 0,
          qty: invProd.qty,
          currentBalance: invProd.qty + 0
        });
      }
    });









    const accountID = parseInt(sessionStorage.getItem('user_id'));
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'delivery.php';
    // const url = "http://localhost/capstone-api/api/products.php";

    const ID = {
      transID: d_transferID,
      dtID: d_dtID,
      reqID: d_reqID,
      accID: accountID,
      locID: parseInt(rs_StoreID)


    }

    console.log(ID);
    console.log('OLD:', oldProduct);
    console.log('NEW:', newProduct);
    console.log('Reports:', report);



    try {
      const response = await axios.get(url, {
        params: {
          updatedInventory: JSON.stringify(oldProduct),
          newInventory: JSON.stringify(newProduct),
          reportInventory: JSON.stringify(report),
          json: JSON.stringify(ID), // Send an empty object if required
          operation: "ReceiveStock"
        }
      });
      // alert(response.data[0].product_name);
      if (response.data == 'Success') {
        // alert(response.data);
        setMessage('Successfuly received the stock!');
        // setAlertBG('#dc7a80');
        setAlertBG('#0ced93');
        setAlertVariant('success');
        setAlert1(true);

        setTimeout(() => {
          setAlert1(false);
        }, 3000);
        // setReceiveStockDetailsVisible(true);
        setReceiveStockDetailsVisible(true);
        setStockReceiveVisible(true);
        return;


      } else {
        // alert(response.data);

        setMessage('Failed to recieve the stock!' + response.data);
        setAlertBG('#dc7a80');
        // setAlertBG('#0ced93');
        setAlertVariant('danger');
        setAlert1(true);

        setTimeout(() => {
          setAlert1(false);
        }, 3000);
        return;
      }
      // alert('success');

    } catch (error) {
      console.error("Error fetching inventory:", error);

    }
    return;


  };

  const [invenReport, setInvenReport] = useState([]);
  const [invenReportVisible, setInvenReportVisible] = useState(true);


  const GetInventoryReport = async () => {
    // setProdId(id);
    // alert(location_id);
    const locationID = parseInt(sessionStorage.getItem('location_id'));

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'inventory.php';
    // const url = "http://localhost/capstone-api/api/products.php";

    const locDetails = {
      locID: 12,

    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(locDetails), // Send an empty object if required
          operation: "GetInventoryReport"
        }
      });
      // alert(response.data[0].product_name);
      setInvenReport(response.data);
      // alert('success');

    } catch (error) {
      console.error("Error fetching inventory:", error);

    }
    return;


  };


  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(invenReport.length / ITEMS_PER_PAGE);
  const paginatedItems = invenReport.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  const totalPages1 = Math.ceil(inventoryList.length / ITEMS_PER_PAGE_INVENTORY);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_INVENTORY;
  const currentItems = inventoryList.slice(startIndex, startIndex + ITEMS_PER_PAGE_INVENTORY);











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

      <Modal show={!clearReq} onHide={() => { setClearReq(true) }} size='md' className='searched-product-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Continue this actions?</Modal.Title>
        </Modal.Header>
        <Modal.Body className='searched-product-body' >
          Are you sure you want to clear your request list?
        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setClearReq(true) }}>
            Close
          </Button>
          <Button variant="primary" onClick={clearList}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal> {/* searched product modal */}

      <Modal show={!searchedProdkVisible} onHide={() => { setSearchedVisible(true) }} size='md' className='searched-product-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Input QTY</Modal.Title>
        </Modal.Header>
        <Modal.Body className='searched-product-body' >

          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Product Name</label>
            <div className='stock-in-prod'>
              <input
                className='prod-name'
                disabled={true}
                value={selectedProdName}
              />
              <div className="input-wrapper">
                <input type="number" className="qty-stock" value={prodQty}
                  onChange={(e) => setProdQty(e.target.value)}
                />
                <label className="qty-label">QTY: </label>
              </div>
            </div>

          </div>

        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setSearchedVisible(true) }}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={addInStockList}

          >
            Add to Request
          </Button>
        </Modal.Footer>
      </Modal> {/* searched product modal */}

      <Modal show={!editListVisible} onHide={() => { setEditListVisible(true) }} size='md' className='searched-product-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body className='searched-product-body' >
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Product Name</label>
            <div className='stock-in-prod'>
              <input
                className='prod-name'
                disabled={true}
                value={editProdName}
              />
              <div className="input-wrapper">
                <input type="number" className="qty-stock" value={editQTY}
                  onChange={(e) => setEditQty(e.target.value)}
                />
                <label className="qty-label">QTY: </label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          {/* <Button variant="secondary" onClick={() => { setEditListVisible(true) }}>
            Close
          </Button> */}
          <Button variant="outline-danger" onClick={removeItem}>
            Remove
          </Button>
          <Button variant="primary" onClick={edit_item_from_list}>
            Save
          </Button>
        </Modal.Footer>
      </Modal> {/* searched product modal */}

      <Modal show={!reqStockOutVisible} onHide={() => { setReqStockOutVisible(true) }} size='md' className='searched-product-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Stock Out List</Modal.Title>
        </Modal.Header>
        <Modal.Body className='searched-product-body' >
          {stockOutList.length > 0 ? (
            <>
              <div className='tableContainer1'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th className='t2'></th>
                      <th className='t2'>PRODUCT ID</th>
                      <th className='t2'>PRODUCT NAME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockOutList.map((p, i) => (
                      <tr
                        className='table-row'
                        key={i}
                      // onClick={() => triggerModal('editList', p.product_id)}
                      >
                        <td>
                          <input
                            type='checkbox'
                            checked={selectedProducts.includes(p.product_id)}
                            onChange={(e) => {
                              e.stopPropagation(); // Stop modal on checkbox click
                              handleCheckboxChange(p.product_id);
                            }}
                          />
                        </td>
                        <td>{p.product_id}</td>
                        <td>{p.product_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>

          ) : null}
        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          {/* <Button variant="secondary" onClick={() => { setEditListVisible(true) }}>
            Close
          </Button> */}

          <Button variant="primary" onClick={add_stock_out}>
            Add
          </Button>
        </Modal.Footer>
      </Modal> {/*request stock out modal */}

      <Modal show={!requestStockVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton >
          <Modal.Title >Request Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-request-body' >
          <div className='side-by-side'>
            <div>
              <label className='add-prod-label'>Request From:</label>
              <select className='category-dropdown' value={requestFrom} onChange={(e) => setRequestFrom(e.target.value)}>
                <option value={''}>Select Store / Location</option>
                {locationList.map((r) => (
                  <option key={r.location_id} value={r.location_id}>
                    {r.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='add-prod-label'>Request To:</label>
              <select className='category-dropdown' value={requestTo} onChange={(e) => setRequestTo(e.target.value)}>
                <option value={''}>Select Store / Location</option>
                {locationList.map((r) => (
                  <option key={r.location_id} value={r.location_id}>
                    {r.location_name}
                  </option>
                ))}
              </select>
            </div>

          </div>


          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Search Product</label>

            <div className='stock-in-prod'>
              <input
                className='input'
                onKeyDown={handleKeyDown}
                type='text'
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
              />

              <button className='add-to-stock1' onClick={() => { triggerModal('reqStockOut', '0') }}>REQUEST STOCK OUT</button>

            </div>

            <div className='dropdown-search' hidden={!prodName.trim()}>
              <ul>
                {searcList.map((p, i) => (
                  <li key={i} onClick={() => searchClick(p.product_name)}>{p.product_name}</li>
                ))}
              </ul>
            </div>

          </div>
          <label className='im'>Stock Request List</label>

          {stockInList.length > 0 ? (
            <>

              <div className='tableContainer1'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th className='t2'>PRODUCT ID</th>
                      <th className='t2'>PRODUCT NAME</th>
                      <th className='t2'>QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockInList.map((p, i) => (
                      <tr className='table-row' key={i} onClick={() => triggerModal('editList', p.product_id)}>
                        <td>{p.product_id}</td>
                        <td>{p.product_name}</td>
                        <td>{p.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='clear-list'>
                <Button variant="primary" onClick={() => { triggerModal('clearList', '0') }}>
                  Clear List
                </Button>
              </div>

            </>

          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={sendRequest}>
            Request Stock
          </Button>
        </Modal.Footer>
      </Modal> {/* request stock modal */}

      <Modal show={!trackRequestVisible} onHide={() => { setTrackRequestVisible(true) }} size='lg' className='request-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Track Request</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' >
          <div className='track-request'>
            <div className='t-drop'>
              <label className='track-request-label'>Store:</label>
              <select className='drop-track' value={storeReq} onChange={(e) => setStoreReq(e.target.value)}>
                <option value={''}>Select Store / Location</option>
                {locationList.map((r) => (
                  <option key={r.location_id} value={r.location_id}>
                    {r.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div className='t-drop'>
              <label className='track-request-label'>Status:</label>
              <select className='drop-track' value={statusReq} onChange={(e) => setStatusReq(e.target.value)}>
                <option value={''}>All</option>
                <option value={'Pending'}>Pending</option>
                <option value={'Approved'}>Approved</option>
              </select>
            </div>


          </div>
          <div className='tableContainer1' style={{ maxHeight: '300px' }}>
            <table className='table'>
              <thead>
                <tr>

                  <th className='t2'>REQUEST ID</th>
                  <th className='th1'>REQUEST DATE</th>
                  <th className='th1'>REQUEST BY</th>
                  <th className='th1'>STATUS</th>

                </tr>
              </thead>
              <tbody>
                {myRequestList.map((p, i) => (
                  <tr
                    className='table-row'
                    key={i}
                    onClick={() => {
                      triggerModal('trackRequestDetails', p.request_stock_id);
                    }

                    }
                  >

                    <td className='td-name'>{p.request_stock_id}</td>
                    <td style={{ textAlign: 'center' }}>{p.date}</td>
                    <td style={{ textAlign: 'center' }}>{p.fname} {p.mname} {p.lname}</td>
                    <td style={{ color: p.request_status === 'Pending' ? 'red' : p.request_status === 'Approved' ? 'green' : 'black', textAlign: 'center' }}>
                      {p.request_status}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setTrackRequestVisible(true) }}>
            Close
          </Button>

          {/* <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button> */}
        </Modal.Footer>
      </Modal > {/*track request modal */}

      <Modal show={!trackRequestDetailsVsible} onHide={() => { setTrackRequestDetailsVisible(true); MyGetRequest(); }} size='lg' className='request-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Request Detials</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' >

          <div className="r-details-head">
            <div className='r-d-div'>
              <div className='r-1'><strong>REQUEST ID:</strong> {s_reqID}</div>
              <div><strong>REQUEST DATE:</strong> {s_reqDate}</div>

            </div>
            <div><strong>REQUEST FROM:</strong> {s_reqFrom}</div>
            <div><strong>REQUEST BY:</strong> {s_reqBy}</div>
            <div><strong>STATUS:</strong>
              <span style={{
                marginLeft: '8px',
                color: s_reqStatus === 'Pending' ? 'red' : s_reqStatus === 'Approved' ? 'green' : 'black',
                fontWeight: 'bold'
              }}>
                {s_reqStatus}
              </span>
            </div>
          </div>

          <div className='tableContainer1'>
            <table className='table'>
              <thead>
                <tr>

                  <th className='t2'>Product Name</th>
                  <th className='th1'>Requested QTY</th>

                </tr>
              </thead>
              <tbody>
                {myRequestDetails.map((p, i) => (
                  <tr className='table-row' key={i}>

                    <td className='td-name'>{p.product_name}</td>
                    <td style={{ textAlign: 'center' }}>{p.qty}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => {
            setTrackRequestDetailsVisible(true);
            MyGetRequest();

          }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal> {/*my request details modal */}

      <Modal show={!viewRequestVisibl} onHide={() => { setViewRequestVisible(true) }} size='lg' className='request-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Stock Transfer Request List</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' >
          <div className='tableContainer1'>
            <table className='table'>
              <thead>
                <tr>

                  <th className='t2'>REQUEST ID</th>
                  <th className='t2'>REQUEST FROM</th>
                  <th className='t2'>REQUEST BY</th>
                  <th className='t2'>STATUS</th>

                </tr>
              </thead>
              <tbody>
                {requestList1.map((p, i) => (
                  <tr
                    className='table-row'
                    key={i}
                    onClick={() => {
                      triggerModal('viewRequestDetails', p.request_stock_id);
                      GetCurrentSotreInventory(location_id);

                    }

                    }
                  >

                    <td>{p.request_stock_id}</td>
                    <td>{p.reqFrom}</td>
                    <td>{p.fname} {p.mname} {p.lname}</td>
                    <td style={{ color: p.request_status === 'Pending' ? 'red' : p.request_status === 'Approved' ? 'green' : 'black' }}>
                      {p.request_status}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='view-request-reports'>
            <Button variant="primary" onClick={add_stock_out}>
              View Request Reports
            </Button>
          </div>

        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setViewRequestVisible(true) }}>
            Close
          </Button>

          {/* <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button> */}
        </Modal.Footer>
      </Modal> {/*request list modal */}

      <Modal show={!invenReportVisible} onHide={() => { setInvenReportVisible(true) }} size='xl' className='request-modal' >
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Inventory Ledger</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' style={{ maxHeight: '800px' }}>
          <div className='tableContainer1' style={{ maxHeight: '550px' }}>
            <table className='table' >
              <thead>
                <tr>

                  <th className='t2'>PRODUCT NAME</th>
                  <th className='th1'>TYPE</th>
                  <th className='th1'>PAST BALANCE</th>
                  <th className='th1'>QTY</th>
                  <th className='th1'>CURRENT BALANCE</th>
                  <th className='th1'>DATE</th>
                  <th className='th1'>TIME</th>
                  <th className='th1'>DONE BY</th>

                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p, i) => (
                  <tr key={i} className='table-row'>
                    <td className='td-name'>{p.product_name}</td>
                    <td>{p.type}</td>
                    <td>{p.past_balance}</td>
                    <td>{p.qty}</td>
                    <td>{p.current_balance}</td>
                    <td>{p.date}</td>
                    <td>{p.time}</td>
                    <td>{`${p.fname} ${p.mname} ${p.lname}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
            <Button variant="secondary" onClick={handlePrev} disabled={currentPage === 1}>
              Previous
            </Button>
            <span style={{ alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
            <Button variant="secondary" onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>



        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setInvenReportVisible(true) }}>
            Close
          </Button>

          {/* <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button> */}
        </Modal.Footer>
      </Modal> {/*ledger modal */}

      <Modal show={!receiveStockDetailsVsible} onHide={() => { setReceiveStockDetailsVisible(true); }} size='lg' className='request-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Receive Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' style={{ minHeight: '300px' }}>
          <div style={{ marginBottom: '20px' }} >
            <label className='add-prod-label'>STORE:</label>
            <select className='category-dropdown' value={rs_StoreID} onChange={(e) => setRs_StoreID(e.target.value)}>
              <option value={''}>Select Store / Location</option>
              {locationList.map((r) => (
                <option key={r.location_id} value={r.location_id}>
                  {r.location_name}
                </option>
              ))}
            </select>
          </div>

          {deliverdList.length > 0 && deliverdList.map((item, index) => (
            <div key={index} className="r-details-head1" style={{ margin: '10px', }}
              onClick={() => {
                setStockReceiveVisible(false);
                setDeliverdList([]);
                GetDeliveredData(item.dt_id);
                GetDeliveriesDetails(item.ts_id);
                GetUnavailDetails(item.ts_id);
                // alert(item.ts_id);
              }}>
              <div className='r-d-div'>
                <div className='r-1'>
                  <strong>TRANSFER ID:</strong> {item.ts_id}
                </div>
                {/* <div><strong>DATE APPROVED:</strong> {item.dateApproved}</div> */}
              </div>

              {/* <div><strong>TRANSFER FROM:</strong> {item.from}</div> */}
              <div>
                <strong>SENDER:</strong> {item.sender}
              </div>
              <div>
                <strong>DRIVER:</strong> {item.fname + ' ' + item.mname + ' ' + item.lname}
              </div>
              <div>
                <strong>STATUS:</strong>
                <span style={{
                  marginLeft: '8px',
                  color: item.delivery_status === 'Pending'
                    ? 'red'
                    : item.delivery_status === 'Approved'
                      ? 'green'
                      : 'black',
                  fontWeight: 'bold'
                }}>
                  {item.delivery_status}
                </span>
              </div>
            </div>
          ))}




        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setReceiveStockDetailsVisible(true); }}>
            Close
          </Button>

          {/* <Button variant="primary" onClick={add_stock_out}>
                        Add
                    </Button> */}
        </Modal.Footer>
      </Modal> {/*receive stock modal */}


      <Modal show={!stockReceiveVisible} onHide={() => { setStockReceiveVisible(true); GetDelivered(); }} size='lg' className='request-modal'>
        <Modal.Header closeButton className='searched-product-header'>
          <Modal.Title >Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='request-modal-body' style={{ minHeight: '300px' }}>

          <div className="r-details-head">
            <div className='r-d-div'>
              <div className='r-1'><strong>TRANSFER ID:</strong> {d_transferID}</div>
              {/* <div><strong>DATE APPROVED:</strong> {approvedDate}</div> */}

            </div>
            {/* <div><strong>TRANSFER FROM:</strong> {s_reqFrom}</div> */}
            <div><strong>STOCK FROM:</strong> {d_From}</div>
            <div><strong>DILIVEREDs BY:</strong> {d_deliveredBy}</div>
            <div><strong>STATUS:</strong>
              <span style={{
                marginLeft: '8px',
                color: d_status === 'Pending' ? 'red' : d_status === 'Approved' ? 'green' : 'black',
                fontWeight: 'bold'
              }}>
                {d_status}
              </span>
            </div>
          </div>

          <div className='tableContainer1'>
            <label style={{ color: 'green' }}>Stock To Receive</label>
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

          {unavailDetails.length > 0 && (
            <div className='tableContainer1'>
              <label style={{ color: 'red' }}>Unavailable Product</label>
              <table className='table'>
                <thead>
                  <tr>
                    <th className='t2'>Product Name</th>
                    {/* <th className='th1'>QTY</th> */}
                  </tr>
                </thead>
                <tbody>
                  {unavailDetails.map((p, i) => (
                    <tr className='table-row' key={i}>
                      <td className='td-name'>{p.product_name}</td>
                      {/* <td>{p.qty}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </Modal.Body>
        <Modal.Footer className='searched-product-footer'>
          <Button variant="secondary" onClick={() => { setStockReceiveVisible(true); GetDelivered(); }}>
            Close
          </Button>

          <Button variant="primary" onClick={ReveiceStock}>
            Reveice Stock
          </Button>
        </Modal.Footer>
      </Modal> {/*receive stock modal */}






      < div className='customer-main' >

        <div className='customer-header'>
          <h1 className='h-customer'>INVENTORY MANAGEMENT  </h1>

          {/* <div className='btn3' ref={dropdownRef}>
            <button className='add-cust-bttn' onClick={() => { setReceiveStockDetailsVisible(false); }}>Receive Stock</button>
            <button className='btn4' onClick={toggleDropdown}>...</button>

            {dropdownOpen && (
              <div className='dropdown-more'>
                <ul>
                  <li onClick={() => {
                    triggerModal('requestStock', '');
                    setDropdownOpen(false);
                  }}>Request Stock</li>
                  <li onClick={() => {
                    triggerModal('trackRequest', '');
                    setDropdownOpen(false);
                  }}>Track Request</li>
                  <li onClick={() => {
                    triggerModal('viewRequest', '');
                    setDropdownOpen(false);
                  }}>Stock Transfer Request</li>
                  <li
                    onClick={() => {
                      setInvenReportVisible(false);
                      GetInventoryReport();
                      setDropdownOpen(false);
                    }}
                  >Inventory Report</li>
                </ul>
              </div>
            )}
          </div> */}

        </div>


        <div className='search-customer'>
          <div className='filter'>

            <div >
              <label className='label'>STORE:</label>
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
                <option value={'High'}>In Stock</option>
                <option value={'Low'}>No Stock</option>
              </select>
            </div>
            {/* {isOnline ? (
              <span style={{ color: 'green' }}>🟢 You are online</span>
            ) : (
              <span style={{ color: 'red' }}>🔴 You are offline</span>
            )} */}

          </div>

          <div>
            <label className='label'>SEARCH: </label>
            <input
              className='search-in'
              value={searchProd}
              onChange={(e) => setSearchProd(e.target.value)}
            />
          </div>
        </div>

        <div className='tableContainer' style={{ height: '52vh', overflow: 'hidden' }} >
          <table className='table'>
            <thead>
              <tr>
                <th className='t2'>PRODUCT CODE</th>
                <th className='t2'>PRODUCT DESCRIPTION</th>
                <th className='th1'>STOCK</th>
                <th className='th1'>STORE</th>
                <th className='t2'>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p, i) => (
                <tr className='table-row' key={i}
                  onClick={open_view_Inventory}
                >
                  <td className='td-name'>{p.product_name}</td>
                  <td className='td-name'>{p.description}</td>
                  <td style={{ textAlign: 'center' }}>{p.qty}</td>
                  <td style={{ textAlign: 'center' }}>{p.location_name}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px", // space between circle and text
                        fontSize: "12px",
                        fontWeight: "bold",
                        // justifyContent: 'center'
                      }}
                    >
                      <span
                        style={{
                          height: "20px",
                          width: "20px",
                          borderRadius: "50%",
                          backgroundColor:
                            p.qty > 2 ? "yellow" :
                              p.qty > 0 ? "green" :
                                "red"
                        }}
                      ></span>
                      <span>
                        {p.qty > 2 ? "Overstocked" :
                          p.qty > 0 ? "In Stock" :
                            "Out of Stock"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
        {/* Pagination Controls */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className='pagination-btn'
          >
            Previous
          </button>

          <span style={{ margin: '0 10px' }}>
            Page {currentPage} of {totalPages1}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages1))}
            disabled={currentPage === totalPages1}
            className='pagination-btn'
          >
            Next
          </button>
        </div>





      </div >
      {/* for main */}



    </>
  )
}

export default Inventory;