let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
const container = document.getElementById('cart-items-container');
const orderSummary = document.getElementById('order-summary');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const cartCountElement = document.getElementById('cart-count');
const mobileBottomBar = document.getElementById('mobile-bottom-bar');
const mobileTotalElement = document.getElementById('mobile-total');

// تنسيق السعر مع فواصل الآلاف
function formatPrice(price) {
    return price.toLocaleString('fr-DZ') + ' دج';
}

function renderCart() {
    container.innerHTML = '';
    let subtotal = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-card">
                <div class="icon">🛒</div>
                <h2>سلتك فارغة</h2>
                <p>لم تقم بإضافة أي منتج إلى السلة بعد.</p>
                <a href="index.html" class="btn">تصفح المنتجات</a>
            </div>
        `;
        orderSummary.style.display = 'none';
        mobileBottomBar.style.display = 'none';
        cartCountElement.innerText = '';
        return;
    }

    cart.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;
        totalItems += quantity;

        // استخراج المتغيرات (المقاس واللون) إذا وجدت
        let variantText = '';
        if (item.name.includes('(') && item.name.includes(')')) {
            const match = item.name.match(/\((.*?)\)/);
            if (match) {
                variantText = match[1];
                // إزالة المتغيرات من الاسم الأساسي
                item.name = item.name.replace(/\(.*?\)/, '').trim();
            }
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        // تحديد الصورة أو البديل
        const imgSrc = item.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'96\' height=\'96\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ccc\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'%3E%3C/rect%3E%3Ccircle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'%3E%3C/circle%3E%3Cpolyline points=\'21 15 16 10 5 21\'%3E%3C/polyline%3E%3C/svg%3E';

              itemDiv.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                ${variantText ? `<div class="item-variant">${variantText}</div>` : ''}
                <div class="item-unit-price">${formatPrice(item.price)} للقطعة</div> <!-- زدنا "للقطعة" -->
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-left: auto;">
                <div class="item-total-price" style="margin-top: 0;">${formatPrice(itemTotal)}</div> <!-- السعر الإجمالي بالأحمر -->
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${index}, -1)">−</button> <!-- بدلنا - بـ − -->
                        <span>${quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
                </div>
            </div>
        `;

        container.appendChild(itemDiv);
    });

    orderSummary.style.display = 'block';
    subtotalElement.innerText = formatPrice(subtotal);
    totalElement.innerText = formatPrice(subtotal);
    cartCountElement.innerText = `(${totalItems} قطعة)`;

    if (window.innerWidth <= 800) {
        mobileBottomBar.style.display = 'flex';
        mobileTotalElement.innerText = formatPrice(subtotal);
    } else {
        mobileBottomBar.style.display = 'none';
    }
}

window.updateQuantity = function(index, change) {
    if (!cart[index].quantity) cart[index].quantity = 1;
    
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('grifa_cart', JSON.stringify(cart));
        renderCart();
    }
};

window.removeItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    renderCart();
};

// إعادة رسم السلة عند تغيير حجم الشاشة
window.addEventListener('resize', renderCart);

document.addEventListener('DOMContentLoaded', renderCart);