import { Link } from 'react-router-dom';

function Header({cartCount}) {
    return (
      <header className="header-container">
      <div className="logo">NutriFit</div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/Sell">Sell</Link>
        <Link to="/Cart" className="cart-icon-link">
    <img src="/Nutrifit-supplements/images/cart.png" alt="Cart" className="cart-icon" />
    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
  </Link>
      </nav>
    </header>
    );
  }
  
  export default Header;
  