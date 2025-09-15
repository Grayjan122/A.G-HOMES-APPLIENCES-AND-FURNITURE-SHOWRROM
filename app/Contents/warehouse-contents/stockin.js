'use client';
import { useState, useEffect, useRef } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Col, Row, Container } from 'react-bootstrap';
import CustomPagination from '@/app/Components/Pagination/pagination';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

import InputGroup from 'react-bootstrap/InputGroup';
import SplitButton from 'react-bootstrap/SplitButton';
import Form from 'react-bootstrap/Form';


const ITEMS_PER_PAGE_REQUEST = 10;

const StockInWR = () => {
    // Core state
    const [user_id, setUser_id] = useState('');
    const [productList, setProductList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [stockInList, setStockInList] = useState([]);
    const [currentStoreInventory, setCurrentStoreInventory] = useState([]);
    const [searchList, setSearchList] = useState([]);

    // Input states
    const [prodName, setProdName] = useState('');
    const [prodQty, setProdQty] = useState(1);
    const [selectedProdName, setSelectedProdName] = useState('');

    // Modal states
    const [searchedProdVisible, setSearchedProdVisible] = useState(true);
    const [editListVisible, setEditListVisible] = useState(true);
    const [clearReq, setClearReq] = useState(true);
    const [continueSendReq, setContinueSendReq] = useState(true);

    // Edit states
    const [editProdID, setEditProdID] = useState('');
    const [editProdName, setEditProdName] = useState('');
    const [editQTY, setEditQty] = useState('');

    // Alert states
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    // Pagination
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const totalRequestPages = Math.ceil(stockInList.length / ITEMS_PER_PAGE_REQUEST);
    const startRequestIndex = (currentRequestPage - 1) * ITEMS_PER_PAGE_REQUEST;
    const currentRequestItems = stockInList.slice(startRequestIndex, startRequestIndex + ITEMS_PER_PAGE_REQUEST);

    // Initialize
    useEffect(() => {
        setUser_id(sessionStorage.getItem('user_id'));
        document.getElementById("prod-search")?.focus();
    }, []);

    useEffect(() => {
        GetProduct();
        GetLocation();
        GetCurrentStoreInventory();
    }, []);

    useEffect(() => {
        SearchProduct();
    }, [prodName]);

    // API Functions
    const Logs = async (accID, activity) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'audit-log.php';
        const Details = { accID, activity };

        try {
            await axios.get(url, {
                params: {
                    json: JSON.stringify(Details),
                    operation: "Logs"
                }
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const GetProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct"
                }
            });
            setProductList(response.data);
        } catch (error) {
            console.error("Error fetching product list:", error);
        }
    };

    const SearchProduct = async () => {
        if (!prodName.trim()) {
            setSearchList([]);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const searchD = { search: prodName };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(searchD),
                    operation: "SearchProduct"
                }
            });
            setSearchList(response.data || []);
        } catch (error) {
            console.error("Error fetching search list:", error);
        }
    };

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
    };

    const GetCurrentStoreInventory = async () => {
        const locID = sessionStorage.getItem('location_id');
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';
        const locDetails = { locID, stockLevel: '', search: '' };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(locDetails),
                    operation: "GetInventory"
                }
            });
            setCurrentStoreInventory(response.data || []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    // Utility Functions
    const showAlert = (msg, variant, bg, duration = 3000) => {
        setMessage(msg);
        setAlertVariant(variant);
        setAlertBG(bg);
        setAlert1(true);
        setTimeout(() => setAlert1(false), duration);
    };

    const clearListAlert = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to clear the list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, clear it!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Cleared!",
                    text: "Your list has been cleared out.",
                    icon: "success"
                });
                setStockInList([]);
            }
        });
    };

    // Event Handlers
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const product = productList.find(product =>
                product.product_name.toLowerCase() === prodName.toLowerCase() ||
                product.product_id == prodName
            );

            if (!product) {
                alert("Product is unavailable! Please select other.");
                setSelectedProdName('');
                return;
            }

            setSelectedProdName(product.product_name);
            triggerModal('searchedProduct', product.product_id);
        }
    };

    const searchClick = (prodN) => {
        const product = productList.find(product =>
            product.product_name.toLowerCase() === prodN.toLowerCase() ||
            product.product_id == prodN
        );

        if (!product) {
            alert("Product is unavailable! Please select other.");
            setSelectedProdName('');
            return;
        }

        setSelectedProdName(product.product_name);
        triggerModal('searchedProduct', product.product_id);
        setSearchList([]);
        setProdName('');
    };

    const addInStockList = () => {


        if (prodQty < 1) {
            // showAlert("Qty can't be less than 1, Please input a valid qty!", 'danger', '#dc7a80');
            showAlertError({
                icon: "error",
                title: "Something Went Wrong!",
                text: "Qty can't be less than 1, Please input a valid qty!",
                button: 'Try Again'
            });
            return;
        }

        const product = productList.find(product =>
            product.product_name.toLowerCase() === selectedProdName.toLowerCase()
        );
        const incomingQty = parseInt(prodQty) || 0;

        setStockInList(prev => {
            const existingIndex = prev.findIndex(item => item.product_name === product.product_name);
            if (existingIndex !== -1) {
                // showAlert('Product is already on list!', 'danger', '#dc7a80');
                showAlertError({
                    icon: "warning",
                    title: "Product is already on list!!",
                    text: "Click to edit the qty it or to remove",
                    button: 'Try Again'
                });
                return prev;
            } else {
                return [...prev, { ...product, qty: incomingQty }];
            }
        });

        setSearchedProdVisible(true);
        setProdQty(1);
        setSelectedProdName('');
    };

    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'searchedProduct':
                setSearchedProdVisible(false);
                break;
            case 'editList':
                setEditProdID(id);
                const product = stockInList.find(product => product.product_id === id);
                if (product) {
                    setEditProdName(product.product_name);
                    setEditQty(product.qty);
                }
                setEditListVisible(false);
                break;
        }
    };

    const editItemFromList = () => {
        if (editQTY < 1) {
            showAlertError({
                icon: "error",
                title: "Something Went Wrong!",
                text: "Qty can't be less than 1, Please input a valid qty!",
                button: 'Try Again'
            });
            return;
        }

        setStockInList(prevList =>
            prevList.map(item =>
                item.product_id === editProdID
                    ? { ...item, qty: editQTY }
                    : item
            )
        );

        resetEditState();
    };

    const removeItem = () => {
        setStockInList(prevList =>
            prevList.filter(item => item.product_id !== editProdID)
        );

        resetEditState();
        AlertSucces(
            "Item removed!",
            "success",
            true,
            'Ok'
        );
    };

    const resetEditState = () => {
        setEditProdID('');
        setEditProdName('');
        setEditQty('');
        setEditListVisible(true);
    };

    const clearList = () => {
        setStockInList([]);
        showAlert('Your request list is now empty!', 'success', '#0ced93');
        setClearReq(true);
    };

    const StockIn = async () => {
        const oldProduct = [];
        const newProduct = [];
        const report = [];

        console.log('Stock In List:', stockInList);
        console.log('Current Inventory:', currentStoreInventory);

        stockInList.forEach((invProd) => {
            const match = currentStoreInventory.find(delProd =>
                delProd.product_id == invProd.product_id
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

        const locationID = parseInt(sessionStorage.getItem('location_id'));
        const accountID = parseInt(sessionStorage.getItem('user_id'));
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'inventory.php';

        const ID = {
            accID: accountID,
            locID: locationID
        };

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
                    json: JSON.stringify(ID),
                    operation: "StockIn"
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "The stock is successfully added to your inventory!",
                    "success",
                    true,
                    'Ok'
                );
                setStockInList([]);
                Logs(accountID, 'Stock In A Product');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to save stock in!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error in stock in:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalRequestPages) {
            setCurrentRequestPage(page);
        }
    };

    return (
        <>
            <Alert
                variant={alertVariant}
                className='alert-inventory'
                show={alert1}
                style={{ backgroundColor: alertBG }}
            >
                {message}
            </Alert>

            {/* Clear List Confirmation Modal */}
            <Modal show={!clearReq} onHide={() => setClearReq(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Continue this action?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to clear your request list?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setClearReq(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={clearList}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Continue Stock In Modal */}
            <Modal show={!continueSendReq} onHide={() => setContinueSendReq(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Continue stock in?</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    Are you sure you want to add this list to your inventory?
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setContinueSendReq(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => { StockIn(); setContinueSendReq(true); }}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Product Modal */}
            <Modal show={!searchedProdVisible} onHide={() => setSearchedProdVisible(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Input QTY</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Code</label>
                        <div className='stock-in-prod'>
                            <input
                                className='prod-name'
                                disabled={true}
                                value={selectedProdName}
                            />
                            <InputGroup className="mb-3" style={{ maxWidth: "150px", height: '50px' }}>
                                <Button variant="outline-secondary" onClick={
                                    () => {
                                        setProdQty(prodQty - 1)
                                    }}>
                                    –
                                </Button>
                                <Form.Control
                                    type="number"
                                    value={prodQty}
                                    min="1"
                                    onChange={(e) => setProdQty(e.target.value)}
                                    aria-label="Quantity"
                                />
                                <Button variant="outline-secondary" onClick={
                                    () => {
                                        setProdQty(parseInt(prodQty) + 1)
                                    }}>
                                    +
                                </Button>
                            </InputGroup>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="secondary" onClick={() => setSearchedProdVisible(true)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={addInStockList}>
                        Add to list
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Item Modal */}
            <Modal show={!editListVisible} onHide={() => setEditListVisible(true)} size='md' className='searched-product-modal'>
                <Modal.Header closeButton className='searched-product-header'>
                    <Modal.Title>Edit Item</Modal.Title>
                </Modal.Header>
                <Modal.Body className='searched-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Code</label>
                        <div className='stock-in-prod'>
                            <input
                                className='prod-name'
                                disabled={true}
                                value={editProdName}
                            />
                            <InputGroup className="mb-3" style={{ maxWidth: "150px", height: '50px' }}>
                                <Button variant="outline-secondary" onClick={
                                    () => {
                                        setEditQty(editQTY - 1)
                                    }}>
                                    –
                                </Button>
                                <Form.Control
                                    type="number"
                                    value={editQTY}
                                    min="1"
                                    onChange={(e) => setEditQty(e.target.value)}
                                    aria-label="Quantity"
                                />
                                <Button variant="outline-secondary" onClick={
                                    () => {
                                        setEditQty(parseInt(editQTY) + 1)
                                    }}>
                                    +
                                </Button>
                            </InputGroup>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='searched-product-footer'>
                    <Button variant="outline-danger" onClick={removeItem}>
                        Remove
                    </Button>
                    <Button variant="primary" onClick={editItemFromList}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Content */}
            <div className='customer-main'>
                <div className='customer-header'>
                    <h1 className='h-customer'>STOCK IN</h1>
                </div>

                <Container>
                    <Row>
                        <Col md={3}>
                            <div className='div-input-add-prod'>
                                <label className='add-prod-label'>Search Product</label>
                                <div>
                                    <input
                                        className='input'
                                        onKeyDown={handleKeyDown}
                                        type='text'
                                        value={prodName}
                                        onChange={(e) => setProdName(e.target.value)}
                                        id='prod-search'
                                    />
                                    <div className='dropdown-search1' hidden={!prodName.trim()}>
                                        <ul>
                                            {searchList.map((p, i) => (
                                                <li key={i} onClick={() => searchClick(p.product_name)}>
                                                    {p.product_name + " - " + p.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Col>

                       <Col md={9}>
    <div className='tableContainer1' style={{ height: '52vh', overflow: 'hidden' }}>
        {stockInList && stockInList.length > 0 ? (
            <table className='table'>
                <thead>
                    <tr>
                        <th className='t2'>PRODUCT ID</th>
                        <th className='t2'>PRODUCT CODE</th>
                        <th className='t2'>PRODUCT DESCRIPTION</th>
                        <th className='th1'>QTY</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRequestItems.map((p, i) => (
                        <tr
                            className='table-row'
                            key={p.product_id || i}
                            onClick={() => triggerModal('editList', p.product_id)}
                        >
                            <td className='td-name'>{p.product_id}</td>
                            <td className='td-name'>{p.product_name}</td>
                            <td className='td-name'>{p.description}</td>
                            <td>{p.qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            // Empty State
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
                    📦
                </div>
                <h4 style={{
                    color: '#495057',
                    marginBottom: '10px',
                    fontWeight: '500'
                }}>
                    No items in stock in list
                </h4>
                <p style={{
                    margin: '0',
                    fontSize: '14px',
                    maxWidth: '300px',
                    lineHeight: '1.4'
                }}>
                    Search for products in left side and add them to your stock in list to get started.
                </p>
            </div>
        )}
    </div>

    <Container style={{
        display: 'flex',
        flexDirection: 'row',
        marginTop: '20px',
        marginLeft: '20px',
        justifyContent: 'space-between',
        height: '40px'
    }}>
        <div style={{ justifySelf: 'center', marginTop: '20px' }}>
            {totalRequestPages > 1 && stockInList && stockInList.length > 0 && (
                <CustomPagination
                    currentPage={currentRequestPage}
                    totalPages={totalRequestPages}
                    onPageChange={handlePageChange}
                    color="green"
                />
            )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginRight: '10px' }}>
            <Button
                variant="danger"
                onClick={clearListAlert}
                disabled={!stockInList || stockInList.length === 0}
            >
                Clear List
            </Button>
            <Button
                variant="primary"
                onClick={() => {
                    if (stockInList.length > 0) {
                        setContinueSendReq(false);
                        GetCurrentStoreInventory();
                    } else {
                        showAlertError({
                            icon: "error",
                            title: "Something Went Wrong!",
                            text: 'Your list is currently empty!',
                            button: 'Okay'
                        });
                    }
                }}
                disabled={!stockInList || stockInList.length === 0}
            >
                Save Stock In
            </Button>
        </div>
    </Container>
</Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default StockInWR;