import {useState, useEffect} from "react";
import SupplementCard from "./SupplementCard";

function Home({items, addToCart}) {
const [supplements, setSupplements] = useState([]);
const url = process.env.NODE_ENV === 'development' 
    ? "http://localhost:3000/supplements" 
    : "https://my-json-server.typicode.com/Zippykitche/Nutrifit-supplements/supplements";

const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
    fetch (url)
    .then((response) => response.json())
    .then((data) => setSupplements (data))
    .catch((error)=> console.error('error fetching supplements:', error));
}, [url]);

const allSupplements = [...supplements, ...items];

const filteredSupplements = allSupplements.filter((supplement) =>
  (supplement && supplement.name && supplement.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
  (supplement && supplement.description && supplement.description.toLowerCase().includes(searchQuery.toLowerCase()))
);

const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};

return (
 <div>
      <div className="page-title">
        <p>SAVE UPTO 50% OFF</p>
      <h1>Elevate Your Health</h1>
      <div className="shop-now-box">SHOP NOW</div>
      <div className="title-images">
        <img src="/images/person.png" alt="person" className="person-image" />
      </div>
    </div>

    <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for supplements..."
          className="search-input"
        />
      </div>

    <div className="supplements-container">
      <div className="supplements-list">
        {filteredSupplements.map((supplement) => (
          <div key={supplement.id} className="supplement-card-container">
            <SupplementCard
              name={supplement.name}
              description={supplement.description}
              image={supplement.image}
              price={supplement.price}
              onAddToCart={() => addToCart(supplement)}
            />
          </div>
        ))}
   
      </div>
    </div>
 </div>
  );
}

  export default Home;
 