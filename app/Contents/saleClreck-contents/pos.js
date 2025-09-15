// app/salePage/page.js
'use client';

import React, { useState, useEffect } from 'react';

export default function PosSale() {

  
  // Sample data based on your database structure
  const sampleProducts = [
    { product_id: 19, product_name: 'A.G-71', category: 'Furniture', description: 'Checkered L-type', color: 'Gray', price: 29700, stock: 2 },
    { product_id: 20, product_name: 'A.G-42', category: 'Furniture', description: 'Checkered', color: 'Blue', price: 33400, stock: 6 },
    { product_id: 21, product_name: 'A.G-27', category: 'Furniture', description: '311', color: 'Dark Gray', price: 29700, stock: 6 },
    { product_id: 43, product_name: 'A.G-53', category: 'Furniture', description: '311 with buttons', color: 'Gray', price: 25500, stock: 6 },
    { product_id: 44, product_name: 'A.G-103', category: 'Furniture', description: 'Cleopata', color: 'Red', price: 28300, stock: 1 },
    { product_id: 45, product_name: 'A.G-29', category: 'Furniture', description: 'Hallow', color: 'Gray', price: 28500, stock: 0 },
    { product_id: 46, product_name: 'A.G-96', category: 'Furniture', description: 'With Buttons 311', color: 'Gray', price: 33800, stock: 5 },
    { product_id: 47, product_name: 'A.G-122', category: 'Furniture', description: '211', color: 'Gray', price: 27500, stock: 7 },
    { product_id: 48, product_name: 'A.G-5', category: 'Furniture', description: 'High End Sofa Single', color: 'Brown', price: 41700, stock: 12 },
    { product_id: 49, product_name: 'A.G-137', category: 'Furniture', description: 'L-Type', color: 'Red', price: 29700, stock: 10 },
    { product_id: 50, product_name: 'A.G-46', category: 'Furniture', description: 'High End Sofa With Buttons', color: 'Black', price: 46400, stock: 8 },
    { product_id: 65, product_name: 'A.G-1', category: 'Furniture', description: 'Standard', color: 'Gray', price: 38900, stock: 0 }
  ];

  const sampleCustomers = [
    { cust_id: 1, cust_name: 'John Renein', phone: '09123456789', email: 'johnrenein@gmail.com', address: 'Canitoan' },
    { cust_id: 2, cust_name: 'Claire Ivy Arcay', phone: '09234567890', email: 'claire@gmail.com', address: 'Canitoan' },
    { cust_id: 3, cust_name: 'Walk-in Customer', phone: 'N/A', email: 'N/A', address: 'N/A' }
  ];

  const [isClient, setIsClient] = useState(false);
  const [products] = useState(sampleProducts);
  const [customers] = useState(sampleCustomers);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [inventory, setInventory] = useState(
    products.reduce((acc, product) => {
      acc[product.product_id] = product.stock;
      return acc;
    }, {})
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    if (inventory[product.product_id] <= 0) {
      alert('Product out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      if (existingItem.quantity >= inventory[product.product_id]) {
        alert('Not enough stock available!');
        return;
      }
      updateQuantity(product.product_id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (newQuantity > inventory[productId]) {
      alert('Not enough stock available!');
      return;
    }
    
    setCart(cart.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return Math.min(discountValue, subtotal);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const processPurchase = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (!selectedCustomer) {
      alert('Please select a customer!');
      return;
    }

    // Create transaction record
    const transaction = {
      transaction_id: Date.now(),
      customer: selectedCustomer,
      items: [...cart],
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      payment_method: paymentMethod,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      location: 'Agora Showroom Main'
    };

    // Update inventory (deduct sold items)
    const newInventory = { ...inventory };
    cart.forEach(item => {
      newInventory[item.product_id] -= item.quantity;
    });
    setInventory(newInventory);

    // Store transaction and show receipt
    setLastTransaction(transaction);
    setShowReceipt(true);

    // Clear cart and reset
    setCart([]);
    setDiscountValue(0);
    setSelectedCustomer(null);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  };

  // Prevent server-side rendering issues
  if (!isClient) {
    return <div>Loading...</div>;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f3e7fc, #e0e7ff)', padding: '16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Agora POS System</h1>
          <p style={{ color: '#6b7280' }}>Location: Agora Showroom Main | Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '2fr 1fr', gap: '24px' }}>
          {/* Products Section */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
              {filteredProducts.map(product => (
                <div
                  key={product.product_id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    opacity: inventory[product.product_id] <= 0 ? 0.5 : 1,
                    transition: 'box-shadow 0.3s'
                  }}
                  onClick={() => addToCart(product)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '16px' }}>{product.product_name}</h3>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: inventory[product.product_id] > 5 ? '#d1fae5' : inventory[product.product_id] > 0 ? '#fed7aa' : '#fee2e2',
                      color: inventory[product.product_id] > 5 ? '#065f46' : inventory[product.product_id] > 0 ? '#92400e' : '#991b1b'
                    }}>
                      Stock: {inventory[product.product_id]}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{product.description}</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Color: {product.color}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>₱{product.price.toLocaleString()}</span>
                    <button
                      style={{
                        background: inventory[product.product_id] <= 0 ? '#d1d5db' : '#7c3aed',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: inventory[product.product_id] <= 0 ? 'not-allowed' : 'pointer'
                      }}
                      disabled={inventory[product.product_id] <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Cart</h2>

            {/* Customer Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Customer</label>
              <select
                value={selectedCustomer?.cust_id || ''}
                onChange={(e) => setSelectedCustomer(customers.find(c => c.cust_id === parseInt(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.cust_id} value={customer.cust_id}>
                    {customer.cust_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div style={{ marginBottom: '16px', maxHeight: '256px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontWeight: '600' }}>{item.product_name}</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>₱{item.price.toLocaleString()} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ width: '48px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontWeight: '600' }}>₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Discount</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  onClick={() => setDiscountType('percentage')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: discountType === 'percentage' ? '#7c3aed' : '#f3f4f6',
                    color: discountType === 'percentage' ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  Percentage %
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: discountType === 'fixed' ? '#7c3aed' : '#f3f4f6',
                    color: discountType === 'fixed' ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  Fixed ₱
                </button>
              </div>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: paymentMethod === 'cash' ? '#7c3aed' : '#f3f4f6',
                    color: paymentMethod === 'cash' ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: paymentMethod === 'card' ? '#7c3aed' : '#f3f4f6',
                    color: paymentMethod === 'card' ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  Card
                </button>
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>₱{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ef4444' }}>
                <span>Discount:</span>
                <span>-₱{calculateDiscount().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: '#7c3aed' }}>₱{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={processPurchase}
              style={{
                width: '100%',
                marginTop: '24px',
                background: '#7c3aed',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            maxWidth: '448px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>✓ Payment Successful!</h2>
                <button
                  onClick={closeReceipt}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '16px 0', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Transaction Details</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>ID: #{lastTransaction.transaction_id}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Date: {lastTransaction.date}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Time: {lastTransaction.time}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Location: {lastTransaction.location}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Customer</h3>
                <p style={{ fontSize: '14px' }}>{lastTransaction.customer.cust_name}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{lastTransaction.customer.phone}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{lastTransaction.customer.address}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Items Purchased</h3>
                {lastTransaction.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal:</span>
                  <span>₱{lastTransaction.subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#ef4444' }}>
                  <span>Discount:</span>
                  <span>-₱{lastTransaction.discount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#7c3aed' }}>₱{lastTransaction.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <span>Payment Method:</span>
                  <span style={{ textTransform: 'capitalize' }}>{lastTransaction.payment_method}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#d1fae5', borderRadius: '8px' }}>
                <p style={{ color: '#065f46', fontSize: '14px', textAlign: 'center' }}>
                  ✓ Inventory has been updated automatically
                </p>
              </div>

              <button
                onClick={closeReceipt}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: '#7c3aed',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}