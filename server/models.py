from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime

from config import db

# User model
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-cart_items.user', '-purchases.user', '-items.seller', '-cart_items.item.cart_items', '-purchases.item.purchases')

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')  # 'buyer', 'seller', or 'admin'

    # Relationships
    cart_items = db.relationship('CartItem', backref='user', lazy=True)
    purchases = db.relationship('Purchase', backref='user', lazy=True)
    items = db.relationship('Item', backref='seller', lazy=True)  # Seller relationship

    # Association proxies
    cart_items_details = association_proxy('cart_items', 'item')  # Access items in the cart directly
    purchased_items = association_proxy('purchases', 'item')  # Access items from purchases

    def __repr__(self):
        return f'<User {self.username}>'
    
    def is_valid(self):
        if not self.username or not self.email or not self.password:
            raise ValueError("Username, email, and password are required fields.")
        if self.role not in ['buyer', 'seller']:
            raise ValueError("Role must be 'buyer' or 'seller'.")


# Item Category model
class ItemCategory(db.Model, SerializerMixin):
    __tablename__ = 'item_categories'

    serialize_rules = ('-items.category',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    # Relationships
    items = db.relationship('Item', backref='category', lazy=True)

    def __repr__(self):
        return f'<ItemCategory {self.name}>'


# Item model
class Item(db.Model, SerializerMixin):
    __tablename__ = 'items'

    serialize_rules = ('-cart_items.item', '-purchases.item', '-seller.items', '-category.items', '-cart_items.user.cart_items', '-purchases.user.purchases')

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    image = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    itemCategory_id = db.Column(db.Integer, db.ForeignKey('item_categories.id'), nullable=True)

    # Relationships
    cart_items = db.relationship('CartItem', backref='item', lazy=True)
    purchases = db.relationship('Purchase', backref='item', lazy=True)

    buyers = association_proxy('purchases', 'user')  # Access users who purchased the item

    def __repr__(self):
        return f'<Item {self.name}>'


# Cart Item model
class CartItem(db.Model, SerializerMixin):
    __tablename__ = 'cart_items'

    serialize_rules = ('-user.cart_items', '-item.cart_items', '-user.purchases', '-item.purchases')

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)

    def __repr__(self):
        return f'<CartItem User:{self.user_id} Item:{self.item_id}>'


# Purchase model
class Purchase(db.Model, SerializerMixin):
    __tablename__ = 'purchases'

    serialize_rules = ('-user.purchases', '-item.purchases', '-user.cart_items', '-item.cart_items')

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)

    # Association proxies
    buyer = association_proxy('user', 'username')  # Access buyer username directly
    purchased_item = association_proxy('item', 'name')  # Access item name directly

    def __repr__(self):
        return f'<Purchase User:{self.user_id} Item:{self.item_id} Total:{self.total_price}>'
