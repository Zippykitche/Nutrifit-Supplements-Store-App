import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = ({setUserId, setUserRole}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sending POST request to register user
    try {
      const response = await fetch("http://127.0.0.1:5555/users", {
        method: "POST",
        body: JSON.stringify({ username, email, password, role }),
        headers: {
          "Content-Type": "application/json",
        },
        mode : "cors",
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.user.id);
        setUserRole(data.user.role);
  
        if (role === "buyer") {
          navigate("/Cart");
        } else {
          navigate("/Sell");
        }
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      alert("An error occurred during registration");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card p-4 shadow">
            <h2 className="text-center">Sign In</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
