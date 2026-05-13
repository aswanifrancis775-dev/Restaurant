// ===== HAMBURGER MENU =====
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// ===== SAMPLE DATA (since no backend) =====
const sampleProperties = [
    {
        id: 1,
        title: "Modern City Apartment",
        location: "New York, NY",
        price: 450000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        property_type: "Apartment",
        listing_type: "Sale",
        description: "A beautiful modern apartment in the heart of the city.",
        agent: "John Smith",
        agent_email: "john@dreamhome.com",
        agent_phone: "+1 234 567 890"
    },
    {
        id: 2,
        title: "Cozy Suburban House",
        location: "Los Angeles, CA",
        price: 2500,
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        property_type: "House",
        listing_type: "Rent",
        description: "A cozy house in a quiet suburban neighborhood.",
        agent: "Jane Doe",
        agent_email: "jane@dreamhome.com",
        agent_phone: "+1 234 567 891"
    },
    {
        id: 3,
        title: "Luxury Villa",
        location: "Miami, FL",
        price: 1200000,
        bedrooms: 5,
        bathrooms: 4,
        area: 4500,
        property_type: "Villa",
        listing_type: "Sale",
        description: "A stunning luxury villa with pool and ocean views.",
        agent: "Mike Johnson",
        agent_email: "mike@dreamhome.com",
        agent_phone: "+1 234 567 892"
    },
    {
        id: 4,
        title: "Downtown Studio",
        location: "Chicago, IL",
        price: 1200,
        bedrooms: 1,
        bathrooms: 1,
        area: 600,
        property_type: "Studio",
        listing_type: "Rent",
        description: "A compact studio in the heart of downtown Chicago.",
        agent: "Sarah Lee",
        agent_email: "sarah@dreamhome.com",
        agent_phone: "+1 234 567 893"
    },
    {
        id: 5,
        title: "Country Cottage",
        location: "Austin, TX",
        price: 320000,
        bedrooms: 2,
        bathrooms: 1,
        area: 900,
        property_type: "Cottage",
        listing_type: "Sale",
        description: "A charming country cottage with a large garden.",
        agent: "Tom Brown",
        agent_email: "tom@dreamhome.com",
        agent_phone: "+1 234 567 894"
    },
    {
        id: 6,
        title: "Commercial Space",
        location: "Seattle, WA",
        price: 5000,
        bedrooms: 0,
        bathrooms: 2,
        area: 2000,
        property_type: "Commercial",
        listing_type: "Rent",
        description: "Prime commercial space in a busy shopping district.",
        agent: "Lisa White",
        agent_email: "lisa@dreamhome.com",
        agent_phone: "+1 234 567 895"
    }
];

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
                        <button class="btn-fav" onclick="addToFavourites(${p.id})">❤️</button>
                        <a href="property.html?id=${p.id}">
                            <button class="btn-view">View</button>
                        </a>
                        ${showRemove ? `
                            <button class="btn-danger" onclick="removeFromFavourites(${p.id})">
                                Remove
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== LOAD FEATURED PROPERTIES =====
function loadFeaturedProperties() {
    const div = document.getElementById('featuredProperties');
    if (!div) return;
    div.innerHTML = '';
    sampleProperties.slice(0, 6).forEach(p => {
        div.innerHTML += createPropertyCard(p, false);
    });
}

// ===== LOAD ALL PROPERTIES =====
function loadAllProperties() {
    displayProperties(sampleProperties);
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

// ===== SEARCH PROPERTIES =====
function searchProperties() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const listing = document.getElementById('listingFilter') ?
        document.getElementById('listingFilter').value : '';

    const filtered = sampleProperties.filter(p => {
        const matchSearch = !search ||
            p.title.toLowerCase().includes(search) ||
            p.location.toLowerCase().includes(search);
        const matchListing = !listing || p.listing_type === listing;
        return matchSearch && matchListing;
    });

    const div = document.getElementById('featuredProperties') ||
                document.getElementById('propertiesList');
    if (!div) return;
    div.innerHTML = '';
    filtered.forEach(p => {
        div.innerHTML += createPropertyCard(p, false);
    });
}

// ===== LOAD HOME STATS =====
function loadHomeStats() {
    const total = sampleProperties.length;
    const forSale = sampleProperties.filter(p => p.listing_type === 'Sale').length;
    const forRent = sampleProperties.filter(p => p.listing_type === 'Rent').length;

    if (document.getElementById('totalProps')) {
        document.getElementById('totalProps').textContent = total;
    }
    if (document.getElementById('forSale')) {
        document.getElementById('forSale').textContent = forSale;
    }
    if (document.getElementById('forRent')) {
        document.getElementById('forRent').textContent = forRent;
    }
}

// ===== ADD TO FAVOURITES =====
function addToFavourites(id) {
    let favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    if (!favs.includes(id)) {
        favs.push(id);
        localStorage.setItem('favourites', JSON.stringify(favs));
        alert('Added to favourites!');
    } else {
        alert('Already in favourites!');
    }
}

// ===== REMOVE FROM FAVOURITES =====
function removeFromFavourites(id) {
    let favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    favs = favs.filter(f => f !== id);
    localStorage.setItem('favourites', JSON.stringify(favs));
    alert('Removed from favourites!');
    window.location.reload();
}

// ===== LOAD FAVOURITES PAGE =====
function loadFavourites() {
    const div = document.getElementById('favouritesList');
    if (!div) return;
    const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    const favProperties = sampleProperties.filter(p => favs.includes(p.id));

    if (favProperties.length === 0) {
        div.innerHTML = `
            <div class="empty-state">
                <div style="font-size:4rem">💔</div>
                <h3>No favourites yet!</h3>
                <p>Browse properties and click ❤️ to save them here</p>
            </div>
        `;
        return;
    }

    favProperties.forEach(p => {
        div.innerHTML += createPropertyCard(p, true);
    });
}

// ===== LOGIN =====
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('message');

    if (!email || !password) {
        msg.textContent = 'Please fill in all fields!';
        msg.style.color = 'red';
        return;
    }

    // Simple demo login
    msg.textContent = 'Logging in...';
    msg.style.color = 'green';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ===== REGISTER =====
function register() {
    const msg = document.getElementById('message');
    msg.textContent = 'Account created! Redirecting...';
    msg.style.color = 'green';
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ===== TOGGLE PASSWORD =====
function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}