#!/usr/bin/env python3

# Standard library imports
import json
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from server.models import db, User, Item, ItemCategory, CartItem, Purchase

def load_json_data(filepath):
    """Load JSON data from a file."""
    with open(filepath, 'r') as file:
        return json.load(file)


if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!

        # Clear existing data
        db.session.query(Item).delete()
        db.session.query(CartItem).delete()
        db.session.query(Purchase).delete()
        db.session.query(ItemCategory).delete()
        db.session.query(User).delete()
        db.session.commit()

        # Load db.json data
        data = load_json_data('../client/db.json')

        # Seed Users
        print("Seeding users...")
        users = []
        for _ in range(10):  # Add 10 fake users
            user = User(
                username=fake.user_name(),
                email=fake.email(),
                password=fake.password(),
                role=rc(['buyer', 'seller'])
            )
            users.append(user)
        db.session.add_all(users)
        db.session.commit()

        # Seed Categories
        print("Seeding categories...")
        categories = ['Pre-workout', 'Hair Growth', 'Infant Nutrition', 'Health Supplement', 'Probiotic', 'Weight Gain']

        for category in categories:
            category_obj = ItemCategory(name=category)
            db.session.add(category_obj)

        db.session.commit()

        # Seed Items
        print("Seeding items...")
        items = []
        sellers = [user.id for user in users if user.role == 'seller']
        if sellers:
            user_id = rc(sellers)
        else:
            print("No sellers found in the database!")
            user_id = None

        category_ids = [category.id for category in ItemCategory.query.all()]

        if not category_ids:
            print("No categories found. Please check your category seeding.")
        
        for supplement_data in data['supplements']:
            item = Item(
                name=supplement_data['name'],
                description=supplement_data.get('description', fake.text()),
                price=supplement_data['price'],
                stock=randint(1, 50),  # Add random stock
                image=supplement_data['image'],
                user_id=user_id,
                itemCategory_id=rc(category_ids)
            )
            items.append(item)
        db.session.add_all(items)
        db.session.commit()


        # Seed CartItems
        print("Seeding cart items...")
        cart_items = []
        buyers = [user.id for user in users if user.role == 'buyer']
        if not buyers:
            print("No buyers found in the database! Skipping cart item seeding.")
        else:
            for _ in range(15):  # Add 15 random cart items
                cart_item = CartItem(
                    quantity=randint(1, 5),
                    user_id=rc(buyers),
                    item_id=rc([item.id for item in items])
                )
                cart_items.append(cart_item)
            db.session.add_all(cart_items)

        # Seed Purchases
        print("Seeding purchases...")
        purchases = []
        if not buyers:
            print("No buyers found in the database! Skipping purchase seeding.")
        else:
            for _ in range(20):  # Add 20 random purchases
                purchase = Purchase(
                    quantity=randint(1, 3),
                    total_price=randint(20, 500),
                    purchase_date=fake.date_time_this_year(),
                    user_id=rc(buyers),
                    item_id=rc([item.id for item in items])
                )
                purchases.append(purchase)
            db.session.add_all(purchases)

        # Commit changes
        db.session.commit()
        print("Seeding completed!")