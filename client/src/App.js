import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import Sell from "./Components/Sell";
import SignIn from "./Components/SignIn";
import Login from "./Components/Login";
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(); 
  const [saleItems, setSaleItems] = useState([]);
  

  // check whether loggedin
  useEffect(() => {
    fetch("http://127.0.0.1:5555/login", {
      method: "GET",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUserId(data.id);
          setUserRole(data.role);
        }
      })
      .catch(() => {
        setUserId(null);
        setUserRole(null);
      });
  }, []);

  // logout
  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:5555/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  
    setUserId(null);
    setUserRole(null);
    setCart([]);
  };

  //cart
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

  // Function to add an item to the cart
  const addToCart = (item) => {  
    if (userRole !== 'buyer') {
      alert('Only buyers can add items to the cart!');
      return; 
    }
    if (!userId) {
      alert('Please log in to add items to the cart!');
      return;
    }

    fetch(`http://127.0.0.1:5555/cart/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: item.id, 
        quantity: item.quantity || 1,
        user_id: userId 
      }),
      credentials: 'include',
      mode: 'cors'
    })
    .then((res) => res.json())
    .then((newItem) => {
      setCart((prevCart) => Array.isArray(prevCart) ? [...prevCart, newItem] : [newItem]); // ✅ Ensure prevCart is an array
    })
    .catch((error) => console.error("Error adding to cart:", error));
};

  // Fetch items for sale on page load
  useEffect(() => {
    fetch("http://127.0.0.1:5555/items")
      .then((res) => res.json())
      .then((data) => setSaleItems(data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  return (
    <>
      <Header cartCount={cart?.length || 0} handleLogout={handleLogout}/>
      <Routes>
        <Route path="/" element={<Home items={saleItems} addToCart={addToCart} />} />
        <Route path="/cart" element={userId ? (userRole === "buyer" ? (<Cart cart={cart} setCart={setCart} />)
         : userRole === "guest" ? (<Navigate to="/login" />) : (<Navigate to="/" />)) : (<Navigate to="/login" />)}/>
        <Route path="/sell" element={userId ? (userRole === "seller" ? (<Sell items={saleItems} setItems={setSaleItems} userId={userId} />) 
         : userRole === "guest" ? (<Navigate to="/login" />) : (<Navigate to="/" />)) : (<Navigate to="/login" />)}/>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login setUserId={setUserId} setUserRole={setUserRole}/>} />
      </Routes>
    </>
  );
}

export default App;