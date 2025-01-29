import React, {useState, useEffect} from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Components/Home';
import Cart from './Components/Cart';
import Sell from './Components/Sell';
import Header from './Components/Header';
import SignIn from "./Components/SignIn";
import Login from "./Components/Login";
import './App.css';

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [saleItems, setSaleItems] = useState(() => {
    const savedItems = localStorage.getItem("saleItems");
    const parsedItems = savedItems? JSON.parse(savedItems) : [];
    return parsedItems.filter(item => item !== null);
  });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const sanitizedSaleItems = saleItems.filter(item => item !== null);
    localStorage.setItem("saleItems", JSON.stringify(sanitizedSaleItems));
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [saleItems, cart]);

  const addItemForSale = (newItem) => {
    setSaleItems((prevItems) => [...prevItems, newItem]);
    
  };

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };
  const ProtectedRoute = ({ children, roleRequired, ...rest }) => {
    const userRole = localStorage.getItem("role");
    const username = localStorage.getItem("username"); // Check for username

    if (!username) {
      return <Navigate to="/login" />; // Redirect to login if no username
    }

    if (userRole !== roleRequired) {
      return <Navigate to="/" />; // Redirect if role doesn't match
    }

    return children;
  };

  return (
    
    <Router>
      <Header cartCount={cart.length} />
      <div className={`notification ${showNotification ? "show" : ""}`}>
        Supplement added to cart!
      </div>
      <Routes>
        <Route path="/" element={<Home items={saleItems} addToCart={addToCart} />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route 
          path="/Cart" 
          element={
            <ProtectedRoute roleRequired="buyer">
              <Cart cartItems={cart} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Sell" 
          element={
            <ProtectedRoute roleRequired="seller">
              <Sell items={saleItems} setItems={addItemForSale} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
