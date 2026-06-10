const API = 'http://127.0.0.1:5000';

// ===== CART FUNCTIONS =====
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, name, price) {
    let cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    showCartNotification();
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    loadCart();
    updateCartCount();
}

function updateQuantity(id, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
    }
    saveCart(cart);
    loadCart();
    updateCartCount();
}

function clearCart() {
    localStorage.removeItem('cart');
    loadCart();
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count;
}

function showCartNotification() {
    const el = document.getElementById('cartNotification');
    if (el) {
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 3000);
    }
}

// ===== MENU FUNCTIONS =====
async function loadMenu(category = '') {
    const res = await fetch(`${API}/get-menu?category=${category}`);
    const items = await res.json();
    const div = document.getElementById('menuItems');
    if (!div) return;
    div.innerHTML = '';

    if (items.length === 0) {
        div.innerHTML = '<p class="no-items">No items available!</p>';
        return;
    }

    items.forEach(item => {
        div.innerHTML += createMenuCard(item);
    });
}

async function loadPopularItems() {
    const res = await fetch(`${API}/get-menu`);
    const items = await res.json();
    const div = document.getElementById('popularItems');
    if (!div) return;
    div.innerHTML = '';

    items.slice(0, 4).forEach(item => {
        div.innerHTML += createMenuCard(item);
    });
}

function createMenuCard(item) {
    const emojis = {
        'Main Course': '🍲',
        'Soups': '🍜',
        'Sides': '🍚',
        'Drinks': '🥤',
        'Desserts': '🍰'
    };

    const colors = {
        'Main Course': '#ff6b6b',
        'Soups': '#4fc3f7',
        'Sides': '#81c784',
        'Drinks': '#ffb74d',
        'Desserts': '#ce93d8'
    };

    const emoji = emojis[item.category] || '🍽️';
    const color = colors[item.category] || '#90a4ae';

    return `
        <div class="menu-card">
            <div class="menu-card-emoji" style="background:${color}20">
                ${emoji}
            </div>
            <div class="menu-card-body">
                <div class="menu-card-category" style="color:${color}">
                    ${item.category}
                </div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-card-footer">
                    <span class="menu-price">$${item.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" 
                        style="background:${color}"
                        onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
                        Add to Cart +
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== CART PAGE =====
function loadCart() {
    const cart = getCart();
    const cartDiv = document.getElementById('cartItems');
    const summaryDiv = document.getElementById('cartSummary');
    const emptyDiv = document.getElementById('emptyCart');
    if (!cartDiv) return;

    cartDiv.innerHTML = '';

    if (cart.length === 0) {
        if (summaryDiv) summaryDiv.style.display = 'none';
        if (emptyDiv) emptyDiv.style.display = 'block';
        return;
    }

    if (summaryDiv) summaryDiv.style.display = 'block';
    if (emptyDiv) emptyDiv.style.display = 'none';

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        cartDiv.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// ===== PLACE ORDER =====
async function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const res = await fetch(`${API}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
    });

    const data = await res.json();
    const msg = document.getElementById('orderMessage');

    if (res.ok) {
        msg.textContent = '✅ Order placed successfully!';
        msg.style.color = 'green';
        clearCart();
        setTimeout(() => window.location.href = '/orders', 2000);
    } else {
        msg.textContent = data.message;
        msg.style.color = 'red';
    }
}