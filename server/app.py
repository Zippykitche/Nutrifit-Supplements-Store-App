#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, make_response
from flask_restful import Resource
from datetime import datetime


# Local imports
from config import app, db, api
from models import User, Item, ItemCategory, CartItem, Purchase


# Views go here!

@app.route('/')
def index():
    items = Item.query.all()
    items_to_dict = [item.to_dict() for item in items]
    response = make_response(
        items_to_dict,
        200
    )
    return response

# User Resource
class Users(Resource):
    def get(self):
        users = User.query.all()
        users_to_dict = [user.to_dict() for user in users]
        response = make_response(
            users_to_dict,
            200
        )
        return response
        
    def post(self):
        data = request.get_json()

        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({"message": "Username already taken"}), 400
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data['role']
            )

        db.session.add(new_user)
        db.session.commit()

        response = make_response(
            new_user.to_dict(),
            201
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
    def get(self):
        items = Item.query.all()
        items_to_dict = [item.to_dict() for item in items]
        response = make_response(
            items_to_dict,
            200
        )
        return response

    def post(self):
        data = request.get_json()
        new_item = Item(
            name=data['name'],
            description=data['description'],
            price=float(data["price"]),
            stock=int(data["stock"]),
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

# Cart Items Resource
class CartItems(Resource):
    def get(self):
        cart_items = CartItem.query.all()
        cart_item_to_dict = [cart_item.to_dict() for cart_item in cart_items]
        response = make_response(
            cart_item_to_dict,
            200
        )
        return response

    def post(self):
        data = request.get_json()
        new_cart_item = CartItem(
            quantity=data['quantity'],
            user_id=int(data['user_id']),
            item_id=int(data['item_id'])
        )
        db.session.add(new_cart_item)
        db.session.commit()

        response = make_response(
            new_cart_item.to_dict(),
            201
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
api.add_resource(ItemCategories, '/categories')
api.add_resource(Items, '/items')
api.add_resource(CartItems, '/cart')
api.add_resource(Purchases, '/purchases')

if __name__ == '__main__':
    app.run(port=5555, debug=True)