import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUserId, setUserRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://127.0.0.1:5555/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
        mode : "cors",
        credentials: "include"
      });
  
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user.id);
        setUserRole(data.user.role);
        setLoginMessage("You've successfully logged in!");
        navigate("/");
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };
  
  return (
    <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-4">
        <div className="card p-4 shadow">
          <h2 className="text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100">
              Login
            </button>
          </form>

          {loginMessage && (
            <div className="mt-3 text-center">
              <p>{loginMessage}</p>
            </div>
          )}

          <p className="text-center mt-3">
            Don't have an account? <a href="/signin">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
