let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
const container = document.getElementById('cart-items-container');
const totalBox = document.getElementById('total-box');
const totalPriceElement = document.getElementById('total-price');

let total = 0;

if (cart.length === 0) {
    container.innerHTML = '<div class="empty-cart"><h2>السلة فارغة 🛒</h2><p>روح للمتجر وزيد منتجات.</p></div>';
} else {
    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.price} دج</p>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
        `;
        container.appendChild(itemDiv);
    });
    totalBox.style.display = 'block';
    totalPriceElement.innerText = total;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    window.location.reload();
}