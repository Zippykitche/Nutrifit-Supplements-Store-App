import React, { useState, useEffect } from "react";
import SupplementCard from "./SupplementCard";

function Sell({ items = [], setItems, userId }) {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  
  const sellerItems = items.filter((item) => item.user_id === userId);
//fetch category
  useEffect(() => {
    fetch("https://nutrifit-supplements-store-app.onrender.com/categories")
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

    fetch("https://nutrifit-supplements-store-app.onrender.com/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),  
    })
    .then((response) => response.json())
    .then((data) => {
      setItems((prevItems) => [...prevItems, data]);
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
    fetch(`https://nutrifit-supplements-store-app.onrender.com/items/${itemId}`, {
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

  // Handle edit button click
  const handleEditClick = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price);
    setItemImage(item.image);
    setItemCategory(item.itemCategory_id.toString());
  };

  // Handle update item
  const handleUpdate = (e) => {
    e.preventDefault();

    if (!editingItem) return;

    const updatedItem = {
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      image: itemImage,
      itemCategory_id: parseInt(itemCategory),
    };

    fetch(`https://nutrifit-supplements-store-app.onrender.com/items/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    })
      .then((response) => response.json())
      .then((data) => {
        setItems(items.map((item) => (item.id === data.id ? data : item)));
        resetForm();
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  // Reset form fields
  const resetForm = () => {
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemImage("");
    setItemCategory("");
    setEditingItem(null);
  };
  

  return (
    <div className="container mt-5">
      <p className="mb-4">{editingItem ? "Edit Supplement" : "Post a Supplement"}</p>
      <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="bg-light p-4 rounded shadow-sm">
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
          {editingItem ? "Update Item" : "Post Item"}
        </button>
        {editingItem && (
          <button type="button" className="btn btn-secondary ms-2" onClick={resetForm}>
            Cancel
          </button>
        )}
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
              <button className="btn btn-warning mt-2 me-2" onClick={() => handleEditClick(item)}>
                Edit
              </button>
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