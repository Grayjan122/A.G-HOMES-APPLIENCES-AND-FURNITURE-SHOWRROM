'use client';
import React from 'react';
import "../../../css/delivery.css";
import { useState } from 'react';
import { useEffect } from 'react';


const Delivery = () => {

  const [bgVisible, setBgVisible] = useState(true);

  const [addInventoryVisible, setAddInventoryVisible] = useState(true);
  const [viewInventoryVisible, setViewInventoryVisible] = useState(true);
  const [editInventoryVisible, setEditInventoryVisible] = useState(true);

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




  const inventoryList = [
  // 10 - Agura Main
  { id: '0001', ProductName: 'Bed 001', CurrentStock: 2, Category: 'Bed', stock_store: 'Agura Main' },
  { id: '0002', ProductName: 'Sofa 001', CurrentStock: 5, Category: 'Sofa', stock_store: 'Agura Main' },
  { id: '0003', ProductName: 'Chair 001', CurrentStock: 10, Category: 'Chair', stock_store: 'Agura Main' },
  { id: '0004', ProductName: 'Table 001', CurrentStock: 4, Category: 'Table', stock_store: 'Agura Main' },
  { id: '0005', ProductName: 'Cabinet 001', CurrentStock: 3, Category: 'Cabinet', stock_store: 'Agura Main' },
  { id: '0006', ProductName: 'Dresser 001', CurrentStock: 6, Category: 'Dresser', stock_store: 'Agura Main' },
  { id: '0007', ProductName: 'Shelf 001', CurrentStock: 7, Category: 'Shelf', stock_store: 'Agura Main' },
  { id: '0008', ProductName: 'Recliner 001', CurrentStock: 2, Category: 'Sofa', stock_store: 'Agura Main' },
  { id: '0009', ProductName: 'Bench 001', CurrentStock: 1, Category: 'Chair', stock_store: 'Agura Main' },
  { id: '0010', ProductName: 'Stool 001', CurrentStock: 8, Category: 'Chair', stock_store: 'Agura Main' },

  // 10 - Warehouse
  { id: '0011', ProductName: 'Bed 002', CurrentStock: 4, Category: 'Bed', stock_store: 'Warehouse' },
  { id: '0012', ProductName: 'Sofa 002', CurrentStock: 6, Category: 'Sofa', stock_store: 'Warehouse' },
  { id: '0013', ProductName: 'Chair 002', CurrentStock: 3, Category: 'Chair', stock_store: 'Warehouse' },
  { id: '0014', ProductName: 'Table 002', CurrentStock: 9, Category: 'Table', stock_store: 'Warehouse' },
  { id: '0015', ProductName: 'Cabinet 002', CurrentStock: 2, Category: 'Cabinet', stock_store: 'Warehouse' },
  { id: '0016', ProductName: 'Dresser 002', CurrentStock: 4, Category: 'Dresser', stock_store: 'Warehouse' },
  { id: '0017', ProductName: 'Shelf 002', CurrentStock: 5, Category: 'Shelf', stock_store: 'Warehouse' },
  { id: '0018', ProductName: 'Recliner 002', CurrentStock: 7, Category: 'Sofa', stock_store: 'Warehouse' },
  { id: '0019', ProductName: 'Bench 002', CurrentStock: 1, Category: 'Chair', stock_store: 'Warehouse' },
  { id: '0020', ProductName: 'Stool 002', CurrentStock: 2, Category: 'Chair', stock_store: 'Warehouse' },

  // 10 - Jasaan Branch
  { id: '0021', ProductName: 'Bed 003', CurrentStock: 3, Category: 'Bed', stock_store: 'Jasaan Branch' },
  { id: '0022', ProductName: 'Sofa 003', CurrentStock: 6, Category: 'Sofa', stock_store: 'Jasaan Branch' },
  { id: '0023', ProductName: 'Chair 003', CurrentStock: 2, Category: 'Chair', stock_store: 'Jasaan Branch' },
  { id: '0024', ProductName: 'Table 003', CurrentStock: 7, Category: 'Table', stock_store: 'Jasaan Branch' },
  { id: '0025', ProductName: 'Cabinet 003', CurrentStock: 3, Category: 'Cabinet', stock_store: 'Jasaan Branch' },
  { id: '0026', ProductName: 'Dresser 003', CurrentStock: 5, Category: 'Dresser', stock_store: 'Jasaan Branch' },
  { id: '0027', ProductName: 'Shelf 003', CurrentStock: 4, Category: 'Shelf', stock_store: 'Jasaan Branch' },
  { id: '0028', ProductName: 'Recliner 003', CurrentStock: 6, Category: 'Sofa', stock_store: 'Jasaan Branch' },
  { id: '0029', ProductName: 'Bench 003', CurrentStock: 2, Category: 'Chair', stock_store: 'Jasaan Branch' },
  { id: '0030', ProductName: 'Stool 003', CurrentStock: 1, Category: 'Chair', stock_store: 'Jasaan Branch' },
];




  const close_modal = () => {

    setBgVisible(true);
    setAddInventoryVisible(true);
    setViewInventoryVisible(true);
    setEditInventoryVisible(true);
  }

  const open_add_Inventory = () => {
    setBgVisible(false);
    setAddInventoryVisible(false);
  }

  const open_view_Inventory = () => {
    setBgVisible(false);
    setViewInventoryVisible(false);
  }

   const open_edit_Inventory = () => {
    setBgVisible(false);
    setEditInventoryVisible(false);
  }



  return (
    <>

      <div className='black-bg-cust'
        onClick={close_modal}
        hidden={bgVisible} ></div>


      <div className='delivery-main' style={{ height: mainSize }}>




        {/* ADD CUSTOMER */}
        <div className='add-cust' hidden={addInventoryVisible}>
          <div className='add-cust-header'>
            <h1 className='header-ad'>ADD CUSTOMER</h1>
            <button onClick={close_modal} className="close-btn" >&times;</button>
          </div>

          <div className='div-body-cust'>

            <label className='add-cust-label-1'>*Customer Name</label>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>First Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Middle Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Last Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Phone Number</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Email</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-cat'>
              <label className='add-prod-label'>Address</label>
              <textarea
                className='description-input'

              />
            </div>






            <div className='buttons'>
              <button className='button-1'
              onClick={close_modal}
              >Cancel</button>
              <button className='button-2'>Save</button>
            </div>


          </div>
        </div>
        {/* ADD CUSTOMER */}

        {/* VIEW CUSTOMER */}
        <div className='add-cust' hidden={viewInventoryVisible}>
          <div className='add-cust-header'>
            <h1 className='header-ad'>VIEW CUSTOMER INFORMATION</h1>
            <button onClick={close_modal} className="close-btn" >&times;</button>
          </div>

          <div className='div-body-cust'>

            <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                            <label className='add-prod-label'>Customer ID</label>
                            <input
                                className='prod-name-input'
                                disabled={true}
                            />
                        </div>

            <label className='add-cust-label-1'>*Customer Name</label>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>First Name</label>
              <input
                disabled={true}
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Middle Name</label>
              <input
                disabled={true}
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Last Name</label>
              <input
                disabled={true}
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Phone Number</label>
              <input
                disabled={true}
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Email</label>
              <input
                disabled={true}
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-cat'>
              <label className='add-prod-label'>Address</label>
              <textarea
                disabled={true}
                className='description-input'

              />
            </div>

          </div>
        </div>
        {/* VIEW CUSTOMER */}


        {/* EDIT CUSTOMER */}
        <div className='add-cust' hidden={editInventoryVisible}>
          <div className='add-cust-header'>
            <h1 className='header-ad'>EDIT CUSTOMER INFORMATION</h1>
            <button onClick={close_modal} className="close-btn" >&times;</button>
          </div>

          <div className='div-body-cust'>

            <label className='add-cust-label-1'>Customer Name</label>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>First Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Middle Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Last Name</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Phone Number</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-prod'>
              <label className='add-prod-label'>Email</label>
              <input
                className='prod-name-input'
              />
            </div>
            <div className='div-input-add-cat'>
              <label className='add-prod-label'>Address</label>
              <textarea
                className='description-input'

              />
            </div>


            <div className='buttons'>
              <button className='button-1'
              onClick={close_modal}
              >Cancel</button>
              <button className='button-2'>UPDATE</button>
            </div>


          </div>
        </div>
        {/* EDIT CUSTOMER */}

        


        <div className='customer-header'>
          <h1
            className='h-customer'>DELIVERY</h1>
            
          {/* <button className='add-cust-bttn' onClick={open_add_customer}>ADD CUSTOMER+</button> */}

        </div>

        <div className='search-customer'>
          <div className='filter'>

             <div >
              <label className='label'>STORE: </label>
              <select className='s'>
                <option>Hello</option>
                <option>Hi</option>
              </select>
            </div>
            <div >
              <label className='label'>STOCK LEVEL: </label>
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
        </div>

        <div className='tableContainer' style={{ maxHeight: maxH }}>
          <table className='table'>
            <thead>
              <tr>
                <th className='t2'>PRODUCT NAME</th>
                <th className='th1'>STOCK</th>
                <th className='th1'>STORE</th>
                <th className='th1'>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((p, i) => (
                <tr className='table-row' key={i}
                  onClick={open_view_Inventory}
                >
                  <td className='td-name'>{p.ProductName}</td>
                  <td>{p.CurrentStock}</td>
                  <td>{p.stock_store}</td>
                  <td>
                    <span className='action-cust' onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevent tr onClick
                      open_edit_Inventory();
                    }}>
                      👁️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>



      </div>
      {/* for main */}



    </>
  )
}

export default Delivery;