import React from "react";
import SupplementCard from './SupplementCard';
import { useState, useEffect } from "react";

function Cart({ cart, setCart }) {
  
  useEffect(() => {
    fetch("http://127.0.0.1:5555/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure authentication if needed
      mode: "cors",
    })
      .then(response => response.json())
      .then(data => {
        console.log("Cart Data:", data);
        setCart(Array.isArray(data) ? data : []); // Ensure it's always an array
      })
      .catch(error => {
        console.error("Error fetching cart:", error);
        setCart([]); // Set cart to empty if there's an error
      });
  }, [setCart]); 
  

  const removeFromCart = (id) => {
    fetch(`http://127.0.0.1:5555/cart/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setCart(cart.filter((item) => item.id !== id));
      })
      .catch((error) => console.error("Error deleting item:", error));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Cart:</h2>
      {cart.length === 0 ? (
        <p>Cart is empty!</p>
      ) : (
        <div className="row">
          {cart.map((item, index) => (
            <div key={item.id || index} className="col-md-4 mb-4">
              <SupplementCard
                name={item.name}
                description={item.description}
                image={item.image}
                price={item.price}
                showCartIcon={false}
              />
              <button className="btn btn-danger mt-2" onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;

  