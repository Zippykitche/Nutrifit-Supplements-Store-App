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
    
class ItemsbyUser(Resource):
    def get(self, user_id):
        user = User.query.filter_by(id=user_id).first()
        items = user.items
        item_with_details = []
        for item in items:
             if item:
                item_with_details.append({
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "image": item.image,
                    "price": item.price,
                    "stock": item.stock,
                    "user_id": item.user_id
                })
    
        return make_response( item_with_details, 200)


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
class CartItemsbyUser(Resource):
    def get(self, user_id):
        
        cart_items = CartItem.query.filter(CartItem.user_id == user_id).all()
        cart_item_data = []
        for cart_item in cart_items:
            item = cart_item.item  # Get the associated item object
            cart_item_data.append({
                "item_id": item.id,
                "name": item.name,
                "description": item.description,
                "price": item.price,
                "quantity": cart_item.quantity,
                "image": item.image,
                "category": item.category.name,
            })
        
        return make_response(cart_item_data, 200)

class ItembyCarts(Resource):
    def get(self, item_id):
        item = Item.query.filter_by(id=item_id).first()
        cart_items = CartItem.query.filter_by(item_id=item.id).all()
        carts_with_item = []
        for cart_item in cart_items:
            if cart_item.user_id == "guest":
                carts_with_item.append({
                    "user_id": "guest",
                    "username": "Guest User",
                    "quantity": cart_item.quantity
                })
            else:
                user = User.query.filter_by(id=cart_item.user_id).first()
                if user:
                    carts_with_item.append({
                        "user_id": user.id,
                        "username": user.username,
                        "quantity": cart_item.quantity
                    })
                else:
                    print(f"Warning: No user found for cart_item with user_id {cart_item.user_id}")

        return make_response(jsonify(carts_with_item), 200)
    
     
class CartItemsbyId(Resource): 
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
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        quantity = data.get('quantity')
        purchase_date = data.get('purchase_date')

        item = Item.query.get(item_id)
        user = User.query.get(user_id)

        if not item or not user:
            return jsonify({'error': 'Item or User not found'}), 404
        total_price = item.price * quantity

        if purchase_date:
            try:
                purchase_date = datetime.strptime(purchase_date, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                return jsonify({'error': 'Invalid date format, expected "YYYY-MM-DD HH:MM:SS"'}), 400
        else:
            purchase_date = datetime.now() 

        print(f"user_id: {user_id}, item_id: {item_id}, quantity: {quantity}, total_price: {total_price}")
 
        
        new_purchase = Purchase(
            quantity=quantity,
            total_price=total_price,
            purchase_date=purchase_date,
            user_id=user.id,
            item_id=item.id
        )


        db.session.add(new_purchase)
        db.session.commit()
    
        response = make_response(
            new_purchase.to_dict(),
            201
        )
        return response
    
class UsersbyItem(Resource):
    def get(self, item_id):
        purchases = Purchase.query.filter_by(item_id=item_id).all()
        
        buyers = [purchase.buyer for purchase in purchases]
       
        response = make_response(
            jsonify(buyers),
            200
        )
        return response
    
class PurchasesByUser(Resource):
    def get(self, user_id):
       purchases = Purchase.query.filter_by(user_id=user_id).all()
    
       items = [purchase.purchased_item for purchase in purchases]

       response = make_response(
           jsonify(items), 
           200
        )
       return response




# Register API Routes
api.add_resource(Users, '/users')
api.add_resource(UserbyId, '/users/<int:id>')
api.add_resource(ItemCategories, '/categories')
api.add_resource(Items, '/items')
api.add_resource(ItemsbyId, '/items/<int:id>')
api.add_resource(ItemsbyUser, '/user/<int:user_id>/items')
api.add_resource(ItembyCarts, '/item/<int:item_id>/carts')
api.add_resource(CartItems, '/cart')
api.add_resource(Purchases, '/purchases')
api.add_resource(CartItemsbyId, '/cart/<int:id>') 
api.add_resource(CartItemsbyUser, '/cart/user/<int:user_id>')
api.add_resource(Login, '/login')  
api.add_resource(Logout, '/logout')
api.add_resource(UsersbyItem, '/item/<int:item_id>/purchasers')
api.add_resource(PurchasesByUser, '/purchases/items/<int:user_id>')





if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5555, debug=True)