import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupplementCard from "./SupplementCard";

function Sell({ items = [], setItems, userId }) {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  
  const sellerItems = items.filter((item) => item.user_id === userId);
//fetch category
  useEffect(() => {
    fetch("http://127.0.0.1:5555/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);
  

  // Handle item submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      image: itemImage,
      user_id: userId, 
      itemCategory_id: parseInt(itemCategory),
      stock: 10
    };

    fetch("http://127.0.0.1:5555/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),  
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
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
    setItemCategory("");
  };
// delete item
  const handleDelete = (itemId) => {
    fetch(`http://127.0.0.1:5555/items/${itemId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete item");
        }
        setItems(items.filter((item) => item.id !== itemId));
      })
      .catch((error) => console.error("Error deleting item:", error));
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
        <div className="mb-3">
          <select
            className="form-control"
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Post Item
        </button>
      </form>

      <div className="mt-4 row">
        {sellerItems.length === 0 ? (
          <p>No items listed for sale yet!</p>
        ) : (
          sellerItems.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <SupplementCard
                name={item.name}
                description={item.description}
                image={item.image}
                price={item.price}
                showCartIcon={false}
              />
               <button className="btn btn-danger mt-2" onClick={() => handleDelete(item.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sell;