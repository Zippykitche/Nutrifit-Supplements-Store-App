import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplementCard from "./SupplementCard";

function Sell({ items = [], setItems }) {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Handle login function
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5555/users"); // Ensure this API exists
      const users = await response.json();

      const user = users.find((u) => u.username === username && u.password === password);

      if (user) {
        setIsLoggedIn(true); // Set login status
      } else {
        setError("Invalid credentials. Would you like to sign up?");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  // Handle item submission (only for logged-in users)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("You must be logged in to sell an item.");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      image: itemImage,
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
        setItems([...items, data]); // Update items state
      })
      .catch((error) => {
        console.error("Error posting item:", error);
      });

    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemImage("");
  };

  const validItems = items.filter((item) => item && item.id && item.name);

  return (
    <div className="container mt-5">
      {!isLoggedIn ? (
        <div>
          <h2>Login to Sell</h2>
          <form onSubmit={handleLogin}>
            <input
              type="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>

          {error && (
            <div>
              <p style={{ color: "red" }}>{error}</p>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
          )}
        </div>
      ) : (
        <>
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
            {validItems.length === 0 ? (
              <p>No items listed for sale yet!</p>
            ) : (
              validItems.map((item) => (
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
        </>
      )}
    </div>
  );
}

export default Sell;
