function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });

    localStorage.setItem("cart", JSON.stringify(cart));

    renderCartUI();
    renderOrderSummary();
}

// ربط الأزرار بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            addToCart(id);
        });
    });
});
function renderCartUI() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" width="50">
            <span>${item.name}</span>
            <span>Qty: ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} EGP</span>
        </div>
    `).join('');
}

function renderOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');

    if (!cart.length) {
        orderItems.innerHTML = '<p>Cart is empty</p>';
        orderTotal.textContent = '';
        return;
    }

    orderItems.innerHTML = cart.map(item => `
        <div>${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)} EGP</div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderTotal.textContent = `Total: ${total.toFixed(2)} EGP`;
}
