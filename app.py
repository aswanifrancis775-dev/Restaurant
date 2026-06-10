from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///restaurant.db"
app.config["SECRET_KEY"] = "restaurant-secret-key-123"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login_page"

# ===== MODELS =====

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='customer')
    orders = db.relationship('Order', backref='customer', lazy=True)
    bookings = db.relationship('Booking', backref='guest', lazy=True)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    available = db.Column(db.Boolean, default=True)
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')
    payment_status = db.Column(db.String(50), default='Unpaid')
    date = db.Column(db.String(50), default=str(datetime.now().date()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='Pending')
    special_request = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

with app.app_context():
    db.create_all()
    # Create admin account automatically
    admin = User.query.filter_by(email='admin@restaurant.com').first()
    if not admin:
        hashed = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = User(
            username='admin',
            email='admin@restaurant.com',
            password=hashed,
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()

    # Add sample menu items
    if MenuItem.query.count() == 0:
        items = [
            MenuItem(name="Jollof Rice", description="Delicious West African rice dish", price=15.99, category="Main Course"),
            MenuItem(name="Grilled Chicken", description="Juicy grilled chicken with spices", price=18.99, category="Main Course"),
            MenuItem(name="Fried Fish", description="Fresh fish fried to perfection", price=16.99, category="Main Course"),
            MenuItem(name="Vegetable Soup", description="Fresh vegetables in rich broth", price=12.99, category="Soups"),
            MenuItem(name="Pounded Yam", description="Smooth pounded yam", price=10.99, category="Sides"),
            MenuItem(name="Plantain", description="Sweet fried plantain", price=8.99, category="Sides"),
            MenuItem(name="Chapman", description="Refreshing Nigerian cocktail", price=5.99, category="Drinks"),
            MenuItem(name="Zobo", description="Hibiscus flower drink", price=4.99, category="Drinks"),
            MenuItem(name="Chin Chin", description="Crunchy Nigerian snack", price=6.99, category="Desserts"),
            MenuItem(name="Puff Puff", description="Sweet deep fried dough", price=5.99, category="Desserts"),
        ]
        db.session.add_all(items)
        db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ===== PAGES =====

@app.route("/")
@login_required
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/menu")
@login_required
def menu_page():
    return render_template("menu.html")

@app.route("/cart")
@login_required
def cart_page():
    return render_template("cart.html")

@app.route("/orders")
@login_required
def orders_page():
    return render_template("orders.html")

@app.route("/booking")
@login_required
def booking_page():
    return render_template("booking.html")

@app.route("/admin")
@login_required
def admin_page():
    if current_user.role != 'admin':
        return redirect(url_for('home'))
    return render_template("admin.html")

# ===== AUTH =====

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"message": "Email already exists!"}), 400
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    new_user = User(
        username=data["username"],
        email=data["email"],
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Account created!"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user and bcrypt.check_password_hash(user.password, data["password"]):
        login_user(user)
        return jsonify({
            "message": "Login successful!",
            "role": user.role,
            "is_admin": user.role == 'admin'
        }), 200
    return jsonify({"message": "Invalid email or password!"}), 401

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login_page'))

@app.route("/get-current-user")
@login_required
def get_current_user():
    return jsonify({
        "username": current_user.username,
        "role": current_user.role,
        "is_admin": current_user.role == 'admin'
    }), 200

# ===== MENU =====

@app.route("/get-menu", methods=["GET"])
def get_menu():
    category = request.args.get("category", "")
    if category:
        items = MenuItem.query.filter_by(category=category, available=True).all()
    else:
        items = MenuItem.query.filter_by(available=True).all()
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "category": item.category
        })
    return jsonify(result), 200

@app.route("/add-menu-item", methods=["POST"])
@login_required
def add_menu_item():
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized!"}), 403
    data = request.get_json()
    new_item = MenuItem(
        name=data["name"],
        description=data["description"],
        price=data["price"],
        category=data["category"]
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Menu item added!"}), 201

@app.route("/delete-menu-item/<int:id>", methods=["DELETE"])
@login_required
def delete_menu_item(id):
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized!"}), 403
    item = MenuItem.query.get(id)
    if not item:
        return jsonify({"message": "Item not found!"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted!"}), 200

# ===== ORDERS =====

@app.route("/place-order", methods=["POST"])
@login_required
def place_order():
    data = request.get_json()
    items = data["items"]
    total = sum(item["price"] * item["quantity"] for item in items)
    new_order = Order(
        total=total,
        user_id=current_user.id
    )
    db.session.add(new_order)
    db.session.flush()
    for item in items:
        order_item = OrderItem(
            quantity=item["quantity"],
            price=item["price"],
            order_id=new_order.id,
            menu_item_id=item["id"]
        )
        db.session.add(order_item)
    db.session.commit()
    return jsonify({"message": "Order placed!", "order_id": new_order.id}), 201

@app.route("/get-orders", methods=["GET"])
@login_required
def get_orders():
    if current_user.role == 'admin':
        orders = Order.query.all()
    else:
        orders = Order.query.filter_by(user_id=current_user.id).all()
    result = []
    for order in orders:
        items = []
        for item in order.items:
            items.append({
                "name": item.menu_item.name,
                "quantity": item.quantity,
                "price": item.price
            })
        result.append({
            "id": order.id,
            "total": order.total,
            "status": order.status,
            "payment_status": order.payment_status,
            "date": order.date,
            "items": items,
            "customer": order.customer.username
        })
    return jsonify(result), 200

@app.route("/update-order-status/<int:id>", methods=["PUT"])
@login_required
def update_order_status(id):
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized!"}), 403
    data = request.get_json()
    order = Order.query.get(id)
    if not order:
        return jsonify({"message": "Order not found!"}), 404
    order.status = data.get("status", order.status)
    order.payment_status = data.get("payment_status", order.payment_status)
    db.session.commit()
    return jsonify({"message": "Order updated!"}), 200

# ===== BOOKINGS =====

@app.route("/make-booking", methods=["POST"])
@login_required
def make_booking():
    data = request.get_json()
    new_booking = Booking(
        date=data["date"],
        time=data["time"],
        guests=data["guests"],
        special_request=data.get("special_request", ""),
        user_id=current_user.id
    )
    db.session.add(new_booking)
    db.session.commit()
    return jsonify({"message": "Table booked!"}), 201

@app.route("/get-bookings", methods=["GET"])
@login_required
def get_bookings():
    if current_user.role == 'admin':
        bookings = Booking.query.all()
    else:
        bookings = Booking.query.filter_by(user_id=current_user.id).all()
    result = []
    for booking in bookings:
        result.append({
            "id": booking.id,
            "date": booking.date,
            "time": booking.time,
            "guests": booking.guests,
            "status": booking.status,
            "special_request": booking.special_request,
            "customer": booking.guest.username
        })
    return jsonify(result), 200

@app.route("/update-booking-status/<int:id>", methods=["PUT"])
@login_required
def update_booking_status(id):
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized!"}), 403
    data = request.get_json()
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({"message": "Booking not found!"}), 404
    booking.status = data.get("status", booking.status)
    db.session.commit()
    return jsonify({"message": "Booking updated!"}), 200

# ===== STATS =====

@app.route("/get-stats", methods=["GET"])
@login_required
def get_stats():
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized!"}), 403
    total_orders = Order.query.count()
    total_revenue = db.session.query(
        db.func.sum(Order.total)).scalar() or 0
    total_bookings = Booking.query.count()
    total_customers = User.query.filter_by(role='customer').count()
    return jsonify({
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings,
        "total_customers": total_customers
    }), 200

if __name__ == "__main__":
    app.run(debug=True)