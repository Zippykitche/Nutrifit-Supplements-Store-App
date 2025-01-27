import React, {useState, useEffect} from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import Cart from './Components/Cart';
import Sell from './Components/Sell';
import Header from './Components/Header';
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

  return (
    <Router>
        <Header cartCount={cart.length} />
        <div className={`notification ${showNotification ? "show" : ""}`}>
        Supplement added to cart!
      </div>
      <Routes>
        <Route path="/" element={<Home items={saleItems} addToCart={addToCart} />} />
        <Route path="/Cart" element={<Cart cartItems={cart} />}  />
        <Route path="/Sell" element={<Sell items={saleItems} setItems={addItemForSale} />} />
      </Routes>
    </Router>
  );
}

export default App;
