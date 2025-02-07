import React from "react";
import SupplementCard from './SupplementCard';
import { useEffect } from "react";

function Cart({ cart, setCart, userId }) {
  
  useEffect(() => {
    if (userId) {
      fetch(`http://127.0.0.1:5555/cart/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure authentication if needed
        mode: "cors",
      })
        .then(response => response.json())
        .then(data => {
          setCart(Array.isArray(data) ? data : []); // Ensure it's always an array
        })
        .catch(error => {
          console.error("Error fetching cart:", error);
          setCart([]); // Set cart to empty if there's an error
        });
    }
  }, [userId, setCart]);
  

  const removeFromCart = (userId, itemId) => {
    fetch(`http://127.0.0.1:5555/cart/user/${userId}/item/${itemId}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to delete item");
        }
        return response.json();
      })
      .then(() => {
        setCart(cart.filter((item) => item.item_id !== itemId)); // Remove the item from the UI
      })
      .catch(error => console.error("Error deleting item:", error));
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
              <button className="btn btn-danger mt-2" onClick={() => removeFromCart(userId, item.item_id)}>
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

  