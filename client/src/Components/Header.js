import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";

function Header({cartCount}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); 
      }
    };
    // Add event listener for document clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header-container">
      <div className="logo">NutriFit</div>
      <nav className="nav-links">
      <Link to="/" className="nav-item">Home</Link>
        <div className="account-container" onClick={toggleDropdown}>
        <i className="fa fa-user account-icon" />
          Account 
          {showDropdown && (
          <div ref={dropdownRef} className={`account-dropdown ${showDropdown ? 'show' : ''}`}>
              <Link to="/signin" className="dropdown-item">Sign In</Link>
              <Link to="/login" className="dropdown-item">My Account</Link>
            </div>
          )}
        </div>

        <Link to="/sell">Sell</Link>
        <Link to="/cart" className="cart-icon-link">
          <img src="/images/cart.png" alt="Cart" className="cart-icon" />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
      </nav>
    </header>
  );
}

  export default Header;
  