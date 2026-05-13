const API = 'http://127.0.0.1:5000';

// ===== LOAD FEATURED PROPERTIES =====
async function loadFeaturedProperties() {
    const res = await fetch(`${API}/get-properties`);
    const properties = await res.json();
    const div = document.getElementById('featuredProperties');
    if (!div) return;
    div.innerHTML = '';

    properties.slice(0, 6).forEach(p => {
        div.innerHTML += createPropertyCard(p, false);
    });
}

// ===== LOAD ALL PROPERTIES =====
async function loadAllProperties() {
    const res = await fetch(`${API}/get-properties`);
    const properties = await res.json();
    displayProperties(properties);
}

// ===== LOAD WITH FILTERS =====
async function loadProperties(search='', type='', listing='', bedrooms='', minPrice='', maxPrice='') {
    let url = `${API}/get-properties?`;
    if (search) url += `search=${search}&`;
    if (type) url += `type=${type}&`;
    if (listing) url += `listing=${listing}&`;
    if (bedrooms) url += `bedrooms=${bedrooms}&`;
    if (minPrice) url += `min_price=${minPrice}&`;
    if (maxPrice) url += `max_price=${maxPrice}&`;

    const res = await fetch(url);
    const properties = await res.json();
    displayProperties(properties);
}

// ===== DISPLAY PROPERTIES =====
function displayProperties(properties) {
    const div = document.getElementById('propertiesList');
    const count = document.getElementById('propertiesCount');
    if (!div) return;
    div.innerHTML = '';

    if (count) {
        count.textContent = `${properties.length} properties found`;
    }

    if (properties.length === 0) {
        div.innerHTML = `
            <div class="empty-state">
                <div style="font-size:4rem">🏠</div>
                <h3>No properties found!</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }

    properties.forEach(p => {
        div.innerHTML += createPropertyCard(p, false);
    });
}

// ===== CREATE PROPERTY CARD =====
function createPropertyCard(p, showRemove) {
    const typeEmojis = {
        'Apartment': '🏢',
        'House': '🏡',
        'Villa': '🏰',
        'Studio': '🛋️',
        'Cottage': '🏚️',
        'Commercial': '🏪'
    };

    const emoji = typeEmojis[p.property_type] || '🏠';

    return `
        <div class="property-card">
            <div class="property-image">
                <div class="property-emoji">${emoji}</div>
                <div class="property-badge ${p.listing_type === 'Sale' ? 'sale' : 'rent'}">
                    ${p.listing_type === 'Sale' ? '💰 For Sale' : '🔑 For Rent'}
                </div>
            </div>
            <div class="property-body">
                <h3 class="property-title">${p.title}</h3>
                <p class="property-location">📍 ${p.location}</p>
                <div class="property-features">
                    <span>🛏️ ${p.bedrooms} beds</span>
                    <span>🚿 ${p.bathrooms} baths</span>
                    <span>📐 ${p.area} sqft</span>
                </div>
                <div class="property-footer">
                    <div class="property-price">
                        $${p.price.toLocaleString()}
                        ${p.listing_type === 'Rent' ? '<span>/month</span>' : ''}
                    </div>
                    <div class="property-actions">
                        <button class="btn-fav" 
                            onclick="addToFavourites(${p.id})">
                            ❤️
                        </button>
                        <a href="/property/${p.id}">
                            <button class="btn-view">View</button>
                        </a>
                        ${showRemove ? `
                            <button class="btn-danger" 
                                onclick="removeFromFavourites(${p.id})">
                                Remove
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== SEARCH PROPERTIES =====
async function searchProperties() {
    const search = document.getElementById('searchInput').value;
    const listing = document.getElementById('listingFilter') ? 
        document.getElementById('listingFilter').value : '';
    window.location.href = `/properties?search=${search}&listing=${listing}`;
}

// ===== LOAD PROPERTY DETAILS =====
async function loadPropertyDetails(id) {
    const res = await fetch(`${API}/get-property/${id}`);
    const p = await res.json();
    const div = document.getElementById('propertyDetails');
    if (!div) return;

    div.innerHTML = `
        <div class="property-detail-container">
            <div class="property-detail-header">
                <div class="property-detail-image">
                    <div style="font-size:8rem; text-align:center; padding:40px;">
                        🏠
                    </div>
                </div>
                <div class="property-detail-info">
                    <div class="property-badge ${p.listing_type === 'Sale' ? 'sale' : 'rent'}" 
                        style="display:inline-block; margin-bottom:15px;">
                        ${p.listing_type === 'Sale' ? '💰 For Sale' : '🔑 For Rent'}
                    </div>
                    <h1>${p.title}</h1>
                    <p class="property-location">📍 ${p.location}</p>
                    <div class="property-price" style="font-size:2rem; margin:15px 0;">
                        $${p.price.toLocaleString()}
                        ${p.listing_type === 'Rent' ? '/month' : ''}
                    </div>
                    <div class="property-features" style="margin-bottom:20px;">
                        <span>🛏️ ${p.bedrooms} Bedrooms</span>
                        <span>🚿 ${p.bathrooms} Bathrooms</span>
                        <span>📐 ${p.area} sqft</span>
                        <span>🏷️ ${p.property_type}</span>
                    </div>
                    <button class="btn-primary" onclick="addToFavourites(${p.id})">
                        ❤️ Save to Favourites
                    </button>
                </div>
            </div>

            <div class="property-detail-body">
                <div class="property-description">
                    <h3>Description</h3>
                    <p>${p.description}</p>
                </div>

                <div class="agent-card">
                    <h3>Contact Agent</h3>
                    <div class="agent-info">
                        <div class="agent-avatar">👤</div>
                        <div>
                            <h4>${p.agent}</h4>
                            <p>📧 ${p.agent_email}</p>
                            <p>📞 ${p.agent_phone}</p>
                        </div>
                    </div>

                    <div class="contact-form">
                        <input type="text" id="contactName" 
                            placeholder="Your name">
                        <input type="email" id="contactEmail" 
                            placeholder="Your email">
                        <textarea id="contactMessage" rows="4"
                            placeholder="I am interested in this property..."></textarea>
                        <button class="btn-primary" 
                            onclick="contactAgent(${p.id})">
                            Send Message
                        </button>
                        <p id="contactResult"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== ADD TO FAVOURITES =====
async function addToFavourites(id) {
    const res = await fetch(`${API}/add-favourite/${id}`, {
        method: 'POST'
    });
    const data = await res.json();
    alert(data.message);
}

// ===== REMOVE FROM FAVOURITES =====
async function removeFromFavourites(id) {
    const res = await fetch(`${API}/remove-favourite/${id}`, {
        method: 'DELETE'
    });
    const data = await res.json();
    alert(data.message);
    window.location.reload();
}

// ===== CONTACT AGENT =====
async function contactAgent(propertyId) {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !email || !message) {
        document.getElementById('contactResult').textContent = 
            'Please fill in all fields!';
        document.getElementById('contactResult').style.color = 'red';
        return;
    }

    const res = await fetch(`${API}/contact-agent/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();
    const result = document.getElementById('contactResult');
    result.textContent = data.message;
    result.style.color = res.ok ? 'green' : 'red';

    if (res.ok) {
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
    }
}

// ===== LOAD HOME STATS =====
async function loadHomeStats() {
    const res = await fetch(`${API}/get-stats`);
    if (!res.ok) return;
    const data = await res.json();

    if (document.getElementById('totalProps')) {
        document.getElementById('totalProps').textContent = 
            data.total_properties;
    }
    if (document.getElementById('forSale')) {
        document.getElementById('forSale').textContent = data.for_sale;
    }
    if (document.getElementById('forRent')) {
        document.getElementById('forRent').textContent = data.for_rent;
    }
}
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}