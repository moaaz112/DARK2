document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        const customerName = document.getElementById('customer-name').value.trim();
        const customerEmail = document.getElementById('customer-email').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;

        if (!customerName || !customerEmail || !customerAddress || !paymentMethod) {
            alert('Please fill all required fields!');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.10;
        const shipping = 5;
        const total = subtotal + tax + shipping;

        const newOrder = {
            id: Date.now(),
            customer: customerName,
            email: customerEmail,
            total,
            address: customerAddress,
            payment: paymentMethod,
            items: [...cart]
        };

        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        alert(`Order placed! ID: ${newOrder.id}`);

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartUI();
        renderOrderSummary();

    } catch (err) {
        console.error(err);
        alert('Something went wrong.');
    }
});
