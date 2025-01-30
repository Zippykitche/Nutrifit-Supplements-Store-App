import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import Cart from './Components/Cart';
import Sell from './Components/Sell';
import Header from './Components/Header';
import SignIn from "./Components/SignIn";
import Login from "./Components/Login";
import { Navigate } from "react-router-dom";
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch sale items from backend
    fetch('http://127.0.0.1:5555/items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors' // Explicitly set to 'cors'
    })
    .then(response => response.json())
    .then(data => setSaleItems(data))
    .catch(error => console.error('Error:', error));
    

    // Fetch cart items from backend
    fetch('http://127.0.0.1:5555/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors' // Explicitly set to 'cors'
    })
    .then(response => response.json())
    .then(data => setCart(data))
    .catch(error => console.error('Error:', error));

    // Check for logged-in user
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUserId(loggedInUser.id);
    }
  }, []);

  // Update backend when cart or sale items change
  useEffect(() => {
    const updateCart = async () => {
      for (const item of cart) {
        await fetch(`http://127.0.0.1:5555/cart/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(err => console.error("Error updating cart:", err));
      }
    };
  
    const updateSaleItems = async () => {
      for (const item of saleItems) {
        await fetch(`http://127.0.0.1:5555/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(err => console.error("Error updating items:", err));
      }
    };
  
    if (cart.length > 0) updateCart();
    if (saleItems.length > 0) updateSaleItems();
  }, [cart, saleItems]);
  

  // Add new item for sale
  const addItemForSale = (newItem) => {
    setSaleItems((prevItems) => [...prevItems, newItem]);
  };

  // Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  return (
    <Router>
      <Header cartCount={cart.length} />
      <div className={`notification ${showNotification ? "show" : ""}`}>
        Supplement added to cart!
      </div>
      <Routes>
        <Route path="/" element={<Home items={saleItems} addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cartItems={cart} />} />
        <Route
          path="/sell"
          element={
            userId ? (
              <Sell userId={userId} categoryId={1} items={saleItems} setItems={addItemForSale} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
