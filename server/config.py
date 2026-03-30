# Standard library imports

# Remote library imports
import os
from flask import Flask, make_response
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask import request, jsonify


# Local imports


SECRET_KEY = 'zippy'
# Instantiate app, set attributes
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app, origins=["https://nutrifit-frontend-t4eb.onrender.com", "https://nutrifit-supplements-store-app.onrender.com", "http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)
