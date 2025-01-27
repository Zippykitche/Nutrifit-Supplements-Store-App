import React from "react";

function SupplementCard({name, description, image, price, onAddToCart, showCartIcon = true }){
    
return (
    <div className="supplement-display">
      <div className="image-container">
        <img src={image} alt={name} className="supplement-image" />
        {showCartIcon && (
          <button
            title="Add to Cart"
            className="cart-icon-link"
            onClick={() => onAddToCart({ name, price, image })}
            style={{
              border: "none",
              background: "none",
              padding: "0",
              cursor: "pointer",
            }}
          >
          <img
            src="/images/cart.png"
            alt="Add to cart"
            className="cart-icon-img"
          />
        </button>
         )}
      </div>
      <h5 className="supplement-title">{name}</h5>
      <p className="supplement-description">{description}</p>
      <p className="supplement-price"><strong>Price: KSH {price}</strong></p>
    </div>
);
}

export default SupplementCard;

