// Dark Passenger Shop Logic – إصلاح كامل وموحّد (Products, Cart, Modal, Background, AI, Summary)

console.log('Dark Passenger JS initializing...');

// Default / Demo Products (DEXTER T-shirts كما حددت، مع fallback للصور)
let products = [
    { 
        id: 1, 
        name: 'DEXTER_T-shirt', 
        image: 'https://i.pinimg.com/1200x/c2/ef/ab/c2efab46e530e36b74382a57ac4fcc56.jpg',
        description: 'Embrace the night', 
        price: 500, 
        stock: true,
        featured: true
    },
    { 
        id: 2, 
        name: 'DEXTER_T-shirt', 
        image: 'https://m.media-amazon.com/images/I/61W2xyZCrlL._AC_SX679_.jpg', 
        description: 'Embrace the night', 
        price: 500, 
        stock: true,
        featured: true
    },
    {
        id: 3, 
        name: 'DEXTER_T-shirt', 
        image: '3.png',  // لو مش موجودة، fallback في render
        description: 'Stealthy boots for shadowy journeys.', 
        price: 500, 
        stock: true,
        featured: true
    }
];

// Cart كـ Array (متوافق مع cart.html: {id, name, image, description, price, quantity})
let cart = [];

// دالة init: تحميل/إنشاء products وcart من localStorage
function initData() {
    try {
        // Products: حفظ أول مرة، ثم تحميل
        let storedProducts = localStorage.getItem('products');
        if (!storedProducts) {
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Products saved to localStorage:', products.length, 'items');
        } else {
            products = JSON.parse(storedProducts);
            console.log('Products loaded from localStorage:', products.length, 'items');
        }

        // Cart: تحميل أو empty array
        let storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
        console.log('Cart loaded:', cart.length, 'items');
    } catch (error) {
        console.error('Error initializing data:', error);
        // Reset corrupted data
        localStorage.removeItem('products');
        localStorage.removeItem('cart');
        products = products; // Use default
        cart = [];
    }
}

// دالة إضافة المنتج للسلة (مُصححة: qty increment، no duplicates)
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found.');
        return;
    }
    if (!product.stock) {
        alert('Out of stock!');
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
        alert(`تم زيادة كمية ${product.name} إلى ${existing.quantity}!`);
    } else {
        const newItem = { ...product, quantity };
        cart.push(newItem);
        alert(`${product.name} added to cart!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Item added/updated:', product.name, 'Qty:', existing ? existing.quantity : quantity);

    updateCartUI();
    renderOrderSummary(); // تحديث summary فوراً
}

// إزالة من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Item removed:', productId);
    updateCartUI();
    renderOrderSummary();
}

// تحديث كمية
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            removeFromCart(productId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Quantity updated:', productId, 'to', quantity);
        updateCartUI();
        renderOrderSummary();
    }
}

// حساب total
function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

// مسح السلة
function clearCart() {
    if (confirm('Clear all items?')) {
        cart = [];
        localStorage.removeItem('cart');
        console.log('Cart cleared');
        updateCartUI();
        renderOrderSummary();
    }
}

// تحديث UI (counter + event)
function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = totalQty || 0;
        console.log('Cart UI updated: Total qty', totalQty);
    }
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

// عرض Order Summary
function renderOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');

    if (!orderItems || !orderTotal) return;

    if (cart.length === 0) {
        orderItems.innerHTML = '<p>Your cart is empty.</p>';
        orderTotal.textContent = '';
        return;
    }

    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" width="50" onerror="this.src='https://via.placeholder.com/50?text=${item.name}';">
            <span>${item.name}</span>
            <span>Qty: ${item.quantity}</span>
            <span>$${ (item.price * item.quantity).toFixed(2) }</span>
        </div>
    `).join('');

    orderTotal.textContent = `Total: $${getCartTotal()}`;
    console.log('Order summary rendered: Total', getCartTotal());
}

// Modal (إصلاح: يفتح/يغلق، add button داخل)
function openModal(product) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=${product.name}';">
        <h3 id="modal-title">${product.name}</h3>
        <p>${product.description || ''}</p>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        ${!product.stock ? '<p class="out-of-stock">Out of Stock</p>' : ''}
        ${product.stock ? `<button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>` : ''}
    `;

    modal.showModal();
    if (modalClose) modalClose.focus();

    // Close event
    modal.addEventListener('close', () => console.log('Modal closed'));
}

// Render Products (موحّدة: في containerId، featured slice(0,3))
function renderProducts(containerId, featured = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    const prodsToShow = featured ? products.slice(0, 3) : products;
    console.log('Rendering', prodsToShow.length, 'products (featured:', featured, ')');

    container.innerHTML = prodsToShow.map(product => `
        <article class="product-card" tabindex="0" data-product='${JSON.stringify(product)}' onclick="openModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" aria-label="View ${product.name}">
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=${product.name}';">
            <h3>${product.name}</h3>
            <p>${(product.description || '').substring(0, 100)}...</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            ${!product.stock ? '<p class="out-of-stock">Out of Stock</p>' : ''}
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
        </article>
    `).join('');

    // Keyboard support
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const prodData = JSON.parse(card.dataset.product);
                openModal(prodData);
            }
        });
    });
}

// AI Widget (بسيط: chat mock)
function initAI() {
    const aiWidget = document.getElementById('ai-widget');
    if (!aiWidget) return;

    const aiChat = document.getElementById('ai-chat');
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const aiToggle = document.getElementById('ai-toggle');

    if (aiToggle) {
        aiToggle.addEventListener('click', () => {
            aiWidget.classList.toggle('hidden');
            aiToggle.textContent = aiWidget.classList.contains('hidden') ? '+' : '−';
        });
    }

    if (aiSend && aiInput && aiChat) {
        aiSend.addEventListener('click', () => {
            const message = aiInput.value.trim();
            if (!message) return;
            aiChat.innerHTML += `<div class="ai-message ai-user">${message}</div>`;
            setTimeout(() => {
                let response = 'Shadows whisper: ';
                if (message.toLowerCase().includes('t-shirt') || message.toLowerCase().includes('dexter')) {
                    response += 'DEXTER T-shirt is our top pick for the night.';
                } else if (message.toLowerCase().includes('recommend')) {
                    response += 'Try the DEXTER T-shirt collection.';
                } else {
                    response += 'Explore our dark treasures.';
                }
                aiChat.innerHTML += `<div class="ai-message ai-bot">${response}</div>`;
                aiChat.scrollTop = aiChat.scrollHeight;
            }, 500);
            aiInput.value = '';
            aiChat.scrollTop = aiChat.scrollHeight;
        });
        aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') aiSend.click(); });
    }
    console.log('AI Widget initialized');
}

// Background Animation (particles – مُصحح)
function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const PARTICLE_COUNT = 50;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: 'rgba(255, 255, 255, 0.8)'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
    console.log('Background animation started');
}

// Single DOMContentLoaded: Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded – Initializing Dark Passenger...');
});
    initData(); // Products + Cart
    renderProducts('product-grid', false); // أو 'featured-products' لو featured
    updateCartUI();
    renderOrderSummary();
    initBackground();
    initAI();

    // Event for add buttons (fallback لو مش في render)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const id = parseInt(e.target.dataset.id || e.target.getAttribute('onclick').match(/addToCart\$(\d+)\$/)?.[1]);
            if (id) addToCart(id);
        }
    });

    // Modal close (لو dialog)
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        }
        );
    }
    console.log('Dark Passenger initialized successfully.');