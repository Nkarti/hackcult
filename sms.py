from flask import Flask, request, jsonify
from twilio.rest import Client
import secrets
import time

app = Flask(__name__)

# Mock user database
users = {
    "doctor1": {
        "password": "securepassword123",
        "phone": "+1234567890",  # Doctor's registered phone number
        "phone_token": None,
        "token_expiry": None
    }
}

# Twilio credentials (replace with your own)
account_sid = 'your_account_sid'  # Your Twilio Account SID
auth_token = 'your_auth_token'    # Your Twilio Auth Token
twilio_phone = '+19876543210'     # Your Twilio phone number

# Function to send SMS
def send_sms(phone_number, token):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=f"Your secure token is: {token}",
        from_=twilio_phone,
        to=phone_number
    )
    return message.sid

# Function to validate user credentials
def validate_password(username, password):
    user = users.get(username)
    return user and user["password"] == password

# Function to generate a secure token
def generate_token():
    return secrets.token_urlsafe(16)

# API to generate token
@app.route("/generate-token", methods=["POST"])
def generate_user_token():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Validate username and password
    if not validate_password(username, password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Generate a secure token
    token = generate_token()
    expiry_time = time.time() + 300  # Token valid for 5 minutes

    # Save token and expiry time in user database
    users[username]["phone_token"] = token
    users[username]["token_expiry"] = expiry_time

    # Send token to user's phone
    phone_number = users[username]["phone"]
    send_sms(phone_number, token)

    return jsonify({"message": "Token sent to phone!"}), 200

# API to validate token
@app.route("/validate-token", methods=["POST"])
def validate_token():
    data = request.json
    username = data.get("username")
    token = data.get("token")

    user = users.get(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the token matches and is not expired
    if user["phone_token"] == token and time.time() < user["token_expiry"]:
        return jsonify({"message": "Token validated successfully!"}), 200
    else:
        return jsonify({"error": "Invalid or expired token"}), 401

if __name__ == "__main__":
    app.run(debug=True)
