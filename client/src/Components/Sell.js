import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplementCard from "./SupplementCard";

function Sell({ items = [], setItems, userId }) {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const navigate = useNavigate();

  // Redirect to login if user is not logged in
  if (!userId) {
    navigate("/login");
    return null; // Prevent rendering if not logged in
  }

  // Handle item submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      image: itemImage,
      sellerId: userId, // Associate item with the logged-in seller
    };

    fetch("http://127.0.0.1:5555/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    })
      .then((response) => response.json())
      .then((data) => {
        setItems([...items, data]);
      })
      .catch((error) => {
        console.error("Error posting item:", error);
      });

    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemImage("");
  };

  return (
    <div className="container mt-5">
      <p className="mb-4">Fill this Form to post a supplement:</p>
      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Description..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Price (Ksh)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="url"
            className="form-control"
            placeholder="Image URL"
            value={itemImage}
            onChange={(e) => setItemImage(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Post Item
        </button>
      </form>

      <div className="mt-4 row">
        {items.length === 0 ? (
          <p>No items listed for sale yet!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <SupplementCard
                name={item.name}
                description={item.description}
                image={item.image}
                price={item.price}
                showCartIcon={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sell;
