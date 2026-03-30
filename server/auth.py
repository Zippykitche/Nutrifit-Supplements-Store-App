from functools import wraps
from flask import request, jsonify
import jwt
from server.config import SECRET_KEY

# Decorator to check if token is present and valid
def token_required(f):
    from server.models import User
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]  # Get token from 'Bearer token' format

        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        
        try:
            # Decode the token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found!'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 403
        except Exception as e:
            # Log the exception for debugging (optional)
            print(f"Error decoding token: {e}")
            return jsonify({'message': 'Token is invalid!'}), 403

        return f(current_user, *args, **kwargs)

    return decorated_function
