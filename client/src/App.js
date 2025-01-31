import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import Sell from "./Components/Sell";
import SignIn from "./Components/SignIn";
import Login from "./Components/Login";
import { useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
   
    fetch("http://127.0.0.1:5555/login", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
        },
      mode: "cors",
      credentials: "include"
    })
      .then(response => response.json())
      .then((data) => {
        setUserId(data.id);
        setUserRole(data.role);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setUserId(null);
        setUserRole(null);
      });
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:5555/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors' 
    })
    .then(response => response.json())
    .then(data => setCart(data))
    .catch(error => console.error('Error:', error) );
  }, [] )

  useEffect(() => {
    fetch('http://127.0.0.1:5555/items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors' 
    })
    .then(response => response.json())
    .then(data => setSaleItems(data))
    .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    const updateCart = async () => {
      for (const item of cart) {
        await fetch(`http://127.0.0.1:5555/cart/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(err => console.error("Error updating cart:", err));
      }
    };

    if (cart.length > 0) updateCart();
  }, [cart]);

  useEffect(() => {
    const updateSaleItems = async () => {
      for (const item of saleItems) {
        await fetch(`http://127.0.0.1:5555/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(err => console.error("Error updating items:", err));
      }
    };

    if (saleItems.length > 0) updateSaleItems();
  }, [saleItems]);

  const addItemForSale = async (newItem) => {
    await fetch('http://127.0.0.1:5555/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(response => response.json())
      .then(data => setSaleItems((prevItems) => [...prevItems, data]))
      .catch(error => console.error('Error adding item for sale:', error));
  };

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  return (
    <>
      <Header cartCount={cart.length} />
      <Routes>
        <Route path="/" element={<Home items={saleItems} />} />
        <Route path="/cart" element={userRole === "buyer" ? <Cart cartItems={cart} /> : <Navigate to="/" />} />
        <Route path="/sell" element={userRole === "seller" ? <Sell items={saleItems} setItems={setSaleItems} userId={userId} /> : <Navigate to="/" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login setUserId={setUserId} setUserRole={setUserRole} />} />
      </Routes>
    </>
  );
}

export default App;