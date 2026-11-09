let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
const container = document.getElementById('cart-items-container');
const summaryBox = document.getElementById('summary-box');
const subtotalElement = document.getElementById('subtotal-price');
const totalElement = document.getElementById('total-price');

function renderCart() {
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><h2>السلة فارغة 🛒</h2><p>روح للمتجر وزيد منتجات.</p></div>';
        summaryBox.style.display = 'none';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * (item.quantity || 1);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.price} دج</p>
            </div>
            <div class="quantity-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity || 1}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">✖</button>
        `;
        container.appendChild(itemDiv);
    });

    summaryBox.style.display = 'block';
    subtotalElement.innerText = total + ' دج';
    totalElement.innerText = total + ' دج';
}

// تحديث الكمية
window.updateQuantity = function(index, change) {
    if (!cart[index].quantity) cart[index].quantity = 1;
    
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('grifa_cart', JSON.stringify(cart));
        renderCart();
    }
};

// حذف منتج
window.removeItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    renderCart();
};

// تشغيل عند فتح الصفحة
document.addEventListener('DOMContentLoaded', renderCart);