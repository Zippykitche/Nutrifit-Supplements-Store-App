#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, make_response, session
from flask_restful import Resource
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import timedelta
from flask_cors import cross_origin
from flask_session import Session



# Local imports
from config import app, db, api, token_required
from models import User, Item, ItemCategory, CartItem, Purchase

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # For cross-origin cookies
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SECRET_KEY'] = 'zippy'
app.config['SESSION_COOKIE_HTTPONLY'] = False
 


Session(app)
# Views go here!

@app.route('/')
@cross_origin()
def index():
    items = Item.query.all()
    items_to_dict = [item.to_dict() for item in items]
    response = make_response(
        items_to_dict,
        200
    )
    return response

class Login(Resource):
    
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()
        

        if not user or not check_password_hash(user.password, password):
            message = {"error": "Invalid username or password"}
            response = make_response(
                message,
                401

            )
            return response

        # Store user ID in session to keep track of authentication
        
        session["user_id"] = user.id
        session["user_role"] = user.role
        print("Session after login:", session) 

        response_data = {
            "message": "Login successful",
            "user": user.to_dict()
        }
        response = make_response(
            response_data,
            200
        )

        return response
    
    def get(self):
        user_id = session.get("user_id")
        user_role = session.get("user_role")

        if not user_id:
            if "guest_id" not in session:
                session["guest_id"] = f"guest_{session.sid}"  
            user_id = session["guest_id"]
            user_role = "guest"

        response = make_response({"id": user_id, "role": user_role}, 200)
        return response

class Logout(Resource):
    def post(self):
        session.pop("user_id", None)  # Remove user from session
        response = make_response(jsonify({"message": "Logged out successfully"}), 200)
        
        response.delete_cookie('session')
        return response

# User Resource
class Users(Resource):
    @cross_origin( supports_credentials=True)
    def get(self):
        users = User.query.all()
        users_to_dict = [user.to_dict() for user in users]
        response = make_response(
            users_to_dict,
            200
        )
        return response
    
    @cross_origin(supports_credentials=True)
    def post(self):
        data = request.get_json()

        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({"message": "Username already taken"}), 400
        
        hashed_password = generate_password_hash(data['password'], method='sha256')
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password, 
            role=data['role']
            )

        db.session.add(new_user)
        db.session.commit()

        response = (jsonify(new_user.to_dict()), 201)
        return response
    
class UserbyId(Resource):
    def get(self, id):
        user = User.query.filter(User.id==id).first()
        response = make_response(
            user.to_dict(),
            200
        )
        return response
    def delete(self, id):
        user = User.query.filter(User.id==id).first()

        db.session.delete(user)
        db.session.commit()

        response_dict = {"message": "user successfully deleted"}
        response = make_response(
            response_dict,
            200
        )
        return response

# Item Categories Resource
class ItemCategories(Resource):
    def get(self):
        categories = ItemCategory.query.all()
        categories_to_dict = [category.to_dict() for category in categories]
        response = make_response(
            categories_to_dict,
            200
        )
        return response

# Items Resource
class Items(Resource):
    @cross_origin()
    def get(self):
        items = Item.query.all()
        items_to_dict = [item.to_dict() for item in items]
        response = make_response(
            items_to_dict,
            200
        )
        return response
    
    @cross_origin()
    def post(self):
        data = request.get_json()
        new_item = Item(
            name=data['name'],
            description=data['description'],
            price=float(data["price"]),
            stock=data.get('stock', 10),
            image=data['image'],
            user_id=int(data["user_id"]),
            itemCategory_id=int(data["itemCategory_id"])
        )
        db.session.add(new_item)
        db.session.commit()

        response = make_response(
            new_item.to_dict(),
            201
        )
        return response
    
    
class ItemsbyId(Resource):
    @cross_origin()
    def get(self, id):
        item = Item.query.filter(Item.id==id).first()
        response = make_response(
            item.to_dict(),
            200
        )
        return response
    
    @cross_origin()
    def patch(self, id):
        item = Item.query.filter(Item.id==id).first()
        for attr in request.form:
            setattr(item, attr, request.form[attr])

        db.session.add(item)
        db.session.commit()

        response_dict = item.to_dict()
        response = make_response(
            response_dict,
            200
        )

        return response
    
    @cross_origin()
    def delete(self, id):
        item = Item.query.filter(Item.id==id).first()

        db.session.delete(item)
        db.session.commit()

        response_dict = {"message": "record successfully deleted"}
        response = make_response(
            response_dict,
            200
        )

        return response

# Cart Items Resource
class CartItems(Resource):
    def get(self):
        cart_items = CartItem.query.all()
        cart_with_details = []
        for cart_item in cart_items:
            item = Item.query.get(cart_item.item_id)  
            if item:
                cart_with_details.append({
                    "id": cart_item.id,
                    "name": item.name,
                    "description": item.description,
                    "image": item.image,
                    "price": item.price,
                    "quantity": cart_item.quantity,
                    "item_id": cart_item.item_id,
                    "user_id": cart_item.user_id
                })

        return make_response(jsonify(cart_with_details), 200)
    
    def post(self):
        data = request.get_json()
        user_id = session.get("user_id")

        if not user_id:
            if "guest_id" not in session:
                session["guest_id"] = f"guest_{session.sid}"  
            user_id = session["guest_id"]

  
        if 'item_id' not in data:
            return make_response({'message': 'item_id is required'}, 400)
           
        new_cart_item = CartItem(
            quantity=data.get('quantity', 1),
            user_id=user_id,
            item_id=int(data['item_id'])
        )
        db.session.add(new_cart_item)
        db.session.commit()

        response = make_response(
            new_cart_item.to_dict(),
            201
        )
        return response
    
    # def patch(self, id):
    #     item = Item.query.filter(Item.id==id).first()
    #     for attr in request.form:
    #         setattr(item, attr, request.form[attr])

    #     db.session.add(item)
    #     db.session.commit()

    #     response_dict = item.to_dict()
    #     response = make_response(
    #         response_dict,
    #         200
    #     )
     
class CartItemsbyId(Resource):
    def get(self, id):
        print("Session:", session)
        user_id = session.get("user_id")
        if "user_id" not in session:
            return make_response({"error": "Not authenticated"}, 401)
        
        user_id = session["user_id"]
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        
        return make_response({"cart_items": [item.to_dict() for item in cart_items]}, 200)
    
    def post(self, id):
        data = request.get_json()
        user_id = session.get("user_id")

        if not user_id:
            if "guest_id" not in session:
                session["guest_id"] = f"guest_{session.sid}"  
            user_id = session["guest_id"]

        if 'item_id' not in data:
            return make_response({'message': 'item_id is required'}, 400)
           
        new_cart_item = CartItem(
            quantity=data.get('quantity', 1),
            user_id=user_id,
            item_id=int(data['item_id'])
        )
        db.session.add(new_cart_item)
        db.session.commit()

        response = make_response(
            new_cart_item.to_dict(),
            201
        )
        return response  
    def delete(self, id):
        cart_item = CartItem.query.filter(CartItem.id==id).first()

        db.session.delete(cart_item)
        db.session.commit()

        response_dict = {"message": "record successfully deleted"}
        response = make_response(
            response_dict,
            200
        )

        return response  

# Purchases Resource
class Purchases(Resource):
    def get(self):
        purchases = Purchase.query.all()
        purchases_to_dict = [purchase.to_dict() for purchase in purchases]
        response = make_response(
            purchases_to_dict,
            200
        )
        return response

    def post(self):
        data = request.get_json()
        new_purchase = Purchase(
            quantity=int(data['quantity']),
            total_price=int(data['total_price']),
            purchase_date=datetime.strptime(data["purchase_date"], "%Y-%m-%d %H:%M:%S"),
            user_id=int(data['user_id']),
            item_id=int(data['item_id'])
        )
        db.session.add(new_purchase)
        db.session.commit()
    
        response = make_response(
            new_purchase.to_dict(),
            201
        )
        return response




# Register API Routes
api.add_resource(Users, '/users')
api.add_resource(UserbyId, '/users/<int:id>')
api.add_resource(ItemCategories, '/categories')
api.add_resource(Items, '/items')
api.add_resource(ItemsbyId, '/items/<int:id>')
api.add_resource(CartItems, '/cart')
api.add_resource(Purchases, '/purchases')
api.add_resource(CartItemsbyId, '/cart/<int:id>')
api.add_resource(Login, "/login")  
api.add_resource(Logout, "/logout")



if __name__ == '__main__':
    app.run(port=5555, debug=True)