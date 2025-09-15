'use client';
import React, { use } from 'react';
import "../../css/products.css";

import { useState } from 'react';
import { useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const CategoryAdmin = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);



    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageCategory, setCurrentPageCategory] = useState(1);

    // Filter states for products
    const [productNameFilter, setProductNameFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Filter states for categories
    const [categorySearchFilter, setCategorySearchFilter] = useState('');



    const [productsVisible, setProductsVisible] = useState(false);
    const [categoryVisible, setCategoryVisible] = useState(true);

    const [bgVisible, setBgVisible] = useState(true);

    const [addProductVisible, setAddProductVisible] = useState(true);
    const [viewProductVisible, setViewProductVisible] = useState(true);
    const [editProductVisible, setEditProductVisible] = useState(true);

    const [addCategoryVisible, setAddCategoryVisible] = useState(true);
    const [viewCategoryVisible, setViewCategoryVisible] = useState(true);
    const [editCategoryVisible, setEditCategoryVisible] = useState(true);

    const [message, setMessage] = useState('');
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');

    const [modalTitle, setModalTitle] = useState('');

    const [modalBody, setModalBody] = useState('');
    const [modalHeader, setModalHeader] = useState('');
    const [modalFooter, setModalFooter] = useState('');

    //product inputs
    const [prodName, setProdName] = useState('');
    const [cat, setCat] = useState('');
    const [i_color, setI_Color] = useState('');
    const [i_price, setI_Price] = useState('');
    const [i_description, setI_Descrition] = useState('');
    const [i_material, setI_Marterial] = useState('');
    const [dimension, setDimension] = useState('');
    const [catId, setCatID] = useState('');
    const [catName, setCatName] = useState('');
    const [dateCreated, setDateCreated] = useState('');

    //category inputs
    const [category_name, setCategory_Name] = useState('');
    const [category_description, setCategory_Description] = useState('');
    const [category_id, setCategory_Id] = useState('');

    const [prodId, setProdId] = useState('');

    //arrays
    const [productList, setProductList] = useState([]);
    const [viewProductList, setViewtProductList] = useState([]);
    const [categoryList, setCategorytList] = useState([]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return productList.filter(product => {
            // Product name filter
            if (productNameFilter && !product.product_name.toLowerCase().includes(productNameFilter.toLowerCase())) {
                return false;
            }

            // Category filter
            console.log(categoryFilter);

            if (categoryFilter && product.category_name != categoryFilter) {
                return false;
            }

            // Search filter (searches in product name and description)
            if (searchFilter.trim()) {
                const searchTerm = searchFilter.toLowerCase();
                return product.product_name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm);
            }

            return true;
        });
    }, [productList, productNameFilter, categoryFilter, searchFilter]);

    // Filter categories
    const filteredCategories = useMemo(() => {
        return categoryList.filter(category => {
            if (categorySearchFilter.trim()) {
                const searchTerm = categorySearchFilter.toLowerCase();
                return category.category_name.toLowerCase().includes(searchTerm) ||
                    category.category_description.toLowerCase().includes(searchTerm);
            }
            return true;
        });
    }, [categoryList, categorySearchFilter]);

    // Pagination for products
    const totalPagesProducts = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndexProducts = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProductItems = filteredProducts.slice(startIndexProducts, startIndexProducts + ITEMS_PER_PAGE);

    // Pagination for categories
    const totalPagesCategories = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
    const startIndexCategories = (currentPageCategory - 1) * ITEMS_PER_PAGE;
    const currentCategoryItems = filteredCategories.slice(startIndexCategories, startIndexCategories + ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [productNameFilter, categoryFilter, searchFilter]);

    useEffect(() => {
        setCurrentPageCategory(1);
    }, [categorySearchFilter]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPagesProducts) {
            setCurrentPage(page);
        }
    };

    const handlePageChangeCategory = (page) => {
        if (page >= 1 && page <= totalPagesCategories) {
            setCurrentPageCategory(page);
        }
    };

    useEffect(() => {
        GetProduct();
        GetCategory();
    }, []);

    const resetForm = () => {
        setProdName('');
        setCat('');
        setI_Color('');
        setI_Price('');
        setI_Descrition('');
        setI_Marterial('');
        setDimension('');
        setCategory_Name('');
        setCategory_Description('');
        setModalBody('');
        setModalTitle('');
        setModalFooter('');
    };

    const clearProductFilters = () => {
        setProductNameFilter('');
        setCategoryFilter('');
        setSearchFilter('');
    };

    const clearCategoryFilters = () => {
        setCategorySearchFilter('');
    };

    const removeProductFilter = (filterType) => {
        switch (filterType) {
            case 'productName':
                setProductNameFilter('');
                break;
            case 'category':
                setCategoryFilter('');
                break;
            case 'search':
                setSearchFilter('');
                break;
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
    }

    const GetCategory = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCategory"
                }
            });

            setCategorytList(response.data);
        } catch (error) {
            console.error("Error fetching category list:", error);
        }
    }

    const add_category = async (e) => {
        e.preventDefault();

        if (
            !category_name?.trim() ||
            !category_description?.trim()
        ) {
            setMessage('Please filled all the needed details!');
            setModalTitle('Alert ⚠️');
            setShow(true);
            return false;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const categoryDetails = {
            categoryName: category_name,
            categoryDescription: category_description
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryDetails),
                    operation: "AddCategory"
                }
            });

            if (response.data == 'Success') {
                getCategory();
                close_modal();
                AlertSucces(
                    "New category is successfully added!",
                    "success",
                    true,
                    'Okay'
                );
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to add new category!',
                    button: 'Try Again'
                });
                return;
            }



        } catch (error) {
            console.error("Error adding product:", error);
        }
    }

    const AddProduct = async (e) => {
        e.preventDefault();

        if (
            !prodName?.trim() ||
            !cat?.trim() ||
            !dimension?.trim() ||
            !i_color?.trim() ||
            !i_price?.toString().trim() ||
            !i_description?.trim() ||
            !i_material?.trim()
        ) {
            setMessage("Please fill in all needed details!");
            setAlertVariant('danger');
            setAlertBG('#dc7a80');
            setAlert1(true);

            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productDetails = {
            prodName: prodName,
            category: cat,
            description: i_description,
            dimension: dimension,
            material: i_material,
            color: i_color,
            price: i_price,
            product_preview_image: 'Nothing as for now'
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productDetails),
                    operation: "AddProduct"
                }
            });

            if (response.data == 'Success') {
                GetProduct();
                resetForm();
                close_modal();
                setMessage("New product is successfully added!");
                setAlertBG('#0ced93');
                setAlertVariant('success');
                setAlert1(true);

                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
                return;

            } else {
                setMessage("Failed to add new product.");
                setAlertBG('#dc7a80');
                setAlertVariant('danger');
                setAlert1(true);
                setTimeout(() => {
                    setAlert1(false);
                }, 3000);
                return;
            }

        } catch (error) {
            console.error("Error adding product:", error);
        }
    }

    const show_products = () => {
        setProductsVisible(true);
        setCategoryVisible(false);
    }

    const show_category = () => {
        setCategoryVisible(true);
        setProductsVisible(false);
    }

    const close_modal = () => {
        handleClose();
        setAddProductVisible(true);
        setBgVisible(true);
        setViewProductVisible(true);
        setEditProductVisible(true);
        setAddCategoryVisible(true);
        setViewCategoryVisible(true);
        setEditCategoryVisible(true);
        resetForm();
    }

    const GetProductDetail = async (operation, id) => {
        setProdId(id);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const productId = {
            product_id: id
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productId),
                    operation: "ViewProductDetails"
                }
            });

            setProdName(response.data[0].product_name);
            setI_Descrition(response.data[0].description);
            setI_Marterial(response.data[0].material);
            setI_Color(response.data[0].color);
            setI_Price(parseFloat(response.data[0].price));
            setDimension(response.data[0].dimensions);
            setCat(parseInt(response.data[0].category_id));
            setCatID(response.data[0].category_id);
            setCatName(response.data[0].category_name);
            setCat(response.data[0].category_name);
            setProdId(response.data[0].product_id);
            setDateCreated(response.data[0].date_created);

        } catch (error) {
            console.error("Error fetching product details:", error);
        }
        return;
    }

    const UpdateProduct = async (e) => {
        e.preventDefault();

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productDetails = {
            prodName: prodName,
            category: catId,
            description: i_description,
            dimension: dimension,
            material: i_material,
            color: i_color,
            price: i_price,
            product_preview_image: 'Nothing as for now',
            catID: catId,
            prodId: prodId
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productDetails),
                    operation: "UpdateProduct"
                }
            });

            if (response.data == 'Success') {
                GetProduct();
                resetForm();
                close_modal();

                AlertSucces(
                    "Product details is successfully updated!",
                    "success",
                    true,
                    'Okay'
                );

            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to update product details!',
                    button: 'Try Again'
                });
                return;
            }

        } catch (error) {
            console.error("Error updating product:", error);
        }
    }

    const GetCategoryDetail = async (category_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const categoryID = {
            categoryID: category_id
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryID),
                    operation: "ViewCategoryDetails"
                }
            });

            setCategory_Id(response.data[0].category_id);
            setCategory_Name(response.data[0].category_name);
            setCategory_Description(response.data[0].category_description);

        } catch (error) {
            console.error("Error fetching category details:", error);
        }
    }

    const updateCategoryDetail = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const categoryDetails = {
            catID: category_id,
            catName: category_name,
            catDescription: category_description
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryDetails),
                    operation: "UpdateCategory"
                }
            });

            if (response.data == 'Success') {
                GetCategory();
                resetForm();
                close_modal();
                AlertSucces(
                    "Category details is successfully updated!",
                    "success",
                    true,
                    'Okay'
                );
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to update category details!',
                    button: 'Try Again'
                });
                return;
            }

         

        } catch (error) {
            console.error("Error updating category details:", error);
        }
    }

    const category_change = (e) => {
        const selectedCategoryName = e.target.value;
        setCatName(selectedCategoryName);

        const c = categoryList.find(u => u.category_name === selectedCategoryName);
        setCatID(c.category_id);
    };

    const triggerModal = (operation, id, e) => {
        switch (operation) {
            case 'addProduct':
                setAddProductVisible(false);
                break;
            case 'viewProduct':
                GetProductDetail(operation, id);
                setViewProductVisible(false);
                break;
            case 'editProduct':
                GetProductDetail(operation, id);
                setEditProductVisible(false);
                break;
            case 'addCategory':
                setAddCategoryVisible(false);
                break;
            case 'viewCategory':
                GetCategoryDetail(id);
                setViewCategoryVisible(false);
                break;
            case 'editCategory':
                GetCategoryDetail(id);
                setEditCategoryVisible(false);
                break;
        }
    }

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

            {/* All the existing modals remain the same - Edit Product Modal */}
            <Modal show={!editProductVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Edit Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Product Name</label>
                            <input
                                type='text'
                                className='prod-name-input'
                                value={prodName}
                                onChange={(e) => setProdName(e.target.value)}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Category</label>
                            <select className='category-dropdown' onChange={(e) => category_change(e)} value={catName}>
                                <option value="" disabled hidden>
                                    {cat}
                                </option>
                                {categoryList.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_name}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimension</label>
                        <input
                            type='text'
                            className='dimension-input'
                            value={dimension}
                            onChange={(e) => setDimension(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Color</label>
                        <input
                            type='text'
                            className='prod-name-input1'
                            value={i_color}
                            onChange={(e) => setI_Color(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Price</label>
                        <input
                            type='number'
                            className='prod-name-input1'
                            value={i_price}
                            onChange={(e) => setI_Price(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            value={i_description}
                            onChange={(e) => setI_Descrition(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            value={i_material}
                            onChange={(e) => setI_Marterial(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        <input
                            type='file'
                            className='files-input'
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={UpdateProduct}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Product Modal */}
            <Modal show={!addProductVisible} onHide={close_modal} size='lg' >
                <Modal.Header closeButton >
                    <Modal.Title >Add Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Name</label>
                        <input
                            type="text"
                            className="prod-name-input"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category</label>
                        <select className='category-dropdown' onChange={(e) => setCat(e.target.value)} value={cat}>
                            <option value="" disabled hidden>Select Category</option>
                            {categoryList.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimensions</label>
                        <input
                            type='text'
                            className='dimension-input'
                            value={dimension}
                            onChange={e => setDimension(e.target.value)}
                        />
                    </div>

                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Color</label>
                            <input
                                type='text'
                                className='prod-name-input1'
                                value={i_color}
                                onChange={(e) => setI_Color(e.target.value)}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Price</label>
                            <input
                                type='number'
                                className='prod-name-input1'
                                value={i_price}
                                onChange={e => setI_Price(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            value={i_description}
                            onChange={(e) => setI_Descrition(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            value={i_material}
                            onChange={(e) => setI_Marterial(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        <input
                            type='file'
                            className='files-input'
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={AddProduct}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Product Modal */}
            <Modal show={!viewProductVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>Product ID</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={prodId}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={prodName}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category</label>
                        <select className='category-dropdown' disabled={true}>
                            <option>{catName}</option>
                        </select>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimensions</label>
                        <input
                            className='dimension-input'
                            disabled={true}
                            value={dimension}
                        />
                    </div>
                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Color</label>
                            <input
                                className='prod-name-input1'
                                disabled={true}
                                value={i_color}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Price</label>
                            <input
                                type='number'
                                className='prod-name-input1'
                                disabled={true}
                                value={i_price}
                            />
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={i_description}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={i_material}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Date Created</label>
                        <input
                            className='dimension-input'
                            disabled={true}
                            value={dateCreated}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        <input
                            type='file'
                            className='files-input'
                            disabled={true}
                        />
                    </div>
                </Modal.Body>
            </Modal>

            {/* Add Category Modal */}
            <Modal show={!addCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Add Category</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={category_name}
                            onChange={(e) => setCategory_Name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            value={category_description}
                            onChange={(e) => setCategory_Description(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={add_category}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Category Modal */}
            <Modal show={!viewCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Category Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>Category ID</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={category_id}
                        />
                    </div>
                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Category Name</label>
                            <input
                                className='prod-name-input'
                                disabled={true}
                                value={category_name}
                            />
                        </div>
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={category_description}
                        />
                    </div>
                </Modal.Body>
            </Modal>

            {/* Edit Category Modal */}
            <Modal show={!editCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Edit Category Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={category_name}
                            onChange={(e) => setCategory_Name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            value={category_description}
                            onChange={(e) => setCategory_Description(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateCategoryDetail}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='product-header'>
                    <div className='head'>
                        <h1
                            onClick={show_category}
                            style={{ color: categoryVisible ? 'black' : '' }}
                            className='h-product'>CATEGORY MANAGEMENT</h1>
                    </div>
                    <div>
                        <button className='add-pro-bttn' hidden={!categoryVisible} onClick={(e) => triggerModal('addCategory', '0', e)}>ADD CATEGORY+</button>
                    </div>
                </div>



                {/* Category Search Filter */}
                {categoryVisible && (
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
                                gridTemplateColumns: '1fr',
                                gap: '15px',
                                alignItems: 'end'
                            }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                        Search Categories
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
                                            placeholder="Search by name or description..."
                                            value={categorySearchFilter}
                                            onChange={(e) => setCategorySearchFilter(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px 8px 35px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />

                                        {categorySearchFilter && (
                                            <button
                                                type="button"
                                                onClick={() => setCategorySearchFilter('')}
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

                        {/* Category Active Filters */}
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

                                {categorySearchFilter && (
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
                                        Search: "{categorySearchFilter}"
                                        <button
                                            type="button"
                                            onClick={() => setCategorySearchFilter('')}
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

                                {!categorySearchFilter && (
                                    <span style={{ color: '#6c757d' }}>None</span>
                                )}

                                <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                                    ({filteredCategories.length} of {categoryList.length} categories shown)
                                </span>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={clearCategoryFilters}
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



                {/* Categories Table */}
                <div className='tableContainer' hidden={!categoryVisible} style={{ height: '35vh', overflowY: 'auto' }}>
                    {currentCategoryItems && currentCategoryItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='t2'>CATEGORY NAME</th>
                                    <th className='t2'>DESCRIPTION</th>
                                    <th className='th1'>TOTAL PRODUCT</th>
                                    <th className='th1'>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCategoryItems.map((p, i) => (
                                    <tr className='table-row' key={i} onClick={() => triggerModal('viewCategory', p.category_id)}>
                                        <td className='td-name'>{p.category_name}</td>
                                        <td className='td-name'>{p.category_description}</td>
                                        <td style={{textAlign: 'center'}}>{productList.filter(prod => prod.category_id === p.category_id).length}</td>
                                        <td>
                                            <span className='action' onClick={(e) => {
                                                e.stopPropagation();
                                                triggerModal('editCategory', p.category_id, e);
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
                                📂
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {categoryList.length === 0 ? 'No categories available' : 'No categories match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {categoryList.length === 0
                                    ? 'Categories will appear here once added.'
                                    : 'Try adjusting your search to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div>



                {/* Categories Pagination */}
                {categoryVisible && totalPagesCategories > 1 && currentCategoryItems && currentCategoryItems.length > 0 && (
                    <div style={{ justifySelf: 'center' }}>
                        <CustomPagination
                            currentPage={currentPageCategory}
                            totalPages={totalPagesCategories}
                            onPageChange={handlePageChangeCategory}
                            color="green"
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default CategoryAdmin;