// Dark Passenger - Admin JS
// Production Note: Client-side demo only. Replace with server-side auth (e.g., JWT via /api/login, /api/products CRUD endpoints). Use secure sessions, hashed passwords (bcrypt), and database (e.g., MongoDB). Never store creds in localStorage.

// Default Admin Credentials (hardcoded for demo; change here and in login.html)
const ADMIN_CREDS = {
    username: 'admin@example.com',
    password: 'AdminPass123'
};

// Check Login on Load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'dashboard.html'; // Redirect if not logged in
        return;
    }

    initAdmin();
    renderProductsList();
    setupEventListeners();
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});

// Init Admin UI
function initAdmin() {
    // Load products from localStorage (shared with main.js)
    window.DarkPassenger.products = JSON.parse(localStorage.getItem('products')) || [];

    // Add Product Form
    document.getElementById('add-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(), // Simple ID (use UUID in production)
            name: document.getElementById('new-name').value,
            price: parseFloat(document.getElementById('new-price').value),
            description: document.getElementById('new-description').value,
            image: document.getElementById('new-image').value,
            stock: document.getElementById('new-stock').checked
        };

        window.DarkPassenger.products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(window.DarkPassenger.products));
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: window.DarkPassenger.products })); // Sync event
        e.target.reset();
        renderProductsList();
        alert('Product added to shadows.');
    });
}

// Render Products List (with Edit/Delete)
function renderProductsList() {
    const container = document.getElementById('products-list');
    if (!container) return;

    const listHTML = window.DarkPassenger.products.map(product => `
        <div class="admin-list-item" role="listitem">
            <div>
                <h4>${product.name} - $${product.price.toFixed(2)}</h4>
                <p>${product.description.substring(0, 50)}... | Stock: ${product.stock ? 'Yes' : 'No'}</p>
                <small>Image: ${product.image}</small>
            </div>
            <div>
                <button class="edit-btn" onclick="editProduct(${product.id})" aria-label="Edit ${product.name}">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})" aria-label="Delete ${product.name}">Delete</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<h3>Current Products (${window.DarkPassenger.products.length})</h3>${listHTML}`;
}

// Edit Product (Simple: Prompt for new price/description/stock; update in array)
function editProduct(id) {
    const product = window.DarkPassenger.products.find(p => p.id === id);
    if (!product) return;

    const newPrice = prompt('New Price ($):', product.price);
    const newDesc = prompt('New Description:', product.description);
    const newStock = confirm('In Stock? (OK=Yes, Cancel=No)');

    if (newPrice !== null) product.price = parseFloat(newPrice) || product.price;
    if (newDesc !== null) product.description = newDesc;
    if (newStock !== null) product.stock = newStock;

    localStorage.setItem('products', JSON.stringify(window.DarkPassenger.products));
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: window.DarkPassenger.products }));
    renderProductsList();
}

// Delete Product
function deleteProduct(id) {
    if (confirm('Delete this product from the shadows?')) 
        window.DarkPassenger.products = window.DarkPassenger.products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(window.DarkPassenger.products));
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: window.DarkPassenger.products }));
        renderProductsList();
    }


function setupEventListeners() {
    // Listen for productsUpdated (e.g., from other tabs)
    window.addEventListener('productsUpdated'), (e) => 
        window.DarkPassenger.products = e.detail;}
