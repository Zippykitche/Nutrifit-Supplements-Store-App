NutriFit

NutriFit is a user-friendly platform for buying and selling supplements. The app allows users to browse available supplements, view their details, and make purchases. Additionally, users can list their own supplements for sale, creating a dynamic marketplace.

Features

User authentication with login and signup functionality.

Role-based access control for buyers and sellers.

Browse and purchase supplements as a buyer.

List supplements for sale as a seller.

Cart functionality to track selected items.

Backend integration with a RESTful API.

Tech Stack

Frontend: React, React Router, Bootstrap (for styling)

Backend: Flask, SQLAlchemy

Database: SQLite

Authentication: JWT (JSON Web Token)

Installation

Prerequisites

Ensure you have the following installed:

Node.js and npm

Python (with Flask and SQLAlchemy installed)

Backend Setup

Clone the repository:

git clone <repo-url>
cd NutriFit-backend

Create a virtual environment and activate it:

python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

Install dependencies:

pip install -r requirements.txt

Run the Flask backend:

flask run

The backend will be available at http://127.0.0.1:5555/.

Frontend Setup

Navigate to the frontend directory:

cd NutriFit-frontend

Install dependencies:

npm install

Start the development server:

npm start

The frontend will be available at http://localhost:3000/.

API Endpoints

POST /login: Authenticate user and return JWT token.

GET /supplements: Fetch all available supplements.

POST /supplements: Add a new supplement (seller only).

GET /cart: Retrieve items in the cart.

POST /cart: Add item to cart (buyer only).

Usage

Sign Up / Login

Navigate to the Account page to log in or sign up.

Upon login, users receive a JWT token for authentication.

Browsing Supplements

Buyers can browse supplements on the homepage.

Clicking on an item displays details.

Adding Items to Cart

Buyers can add supplements to their cart, and the cart icon updates dynamically.

Selling Supplements

Sellers can navigate to the Sell page and add new products.

Logout

Users can log out, clearing their session.

Future Improvements

Implement order history for users.

Add a review/rating system for supplements.

Enhance UI/UX with improved styling.