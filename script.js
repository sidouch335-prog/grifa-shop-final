let allProducts = [];
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length;
    }
}

// هنا صلحنا المشكل: درنا window.addToCart باش الأزرار يقدرو يشوفوها
window.addToCart = function(productName, productPrice, productImage) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
    }
    
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    updateCartCount();
    renderSideCart();
    
    // إظهار الإشعار بدل الـ alert
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500); // كيتخبى بعد ثانيتين ونص
    }
    
    toggleSideCart(); // نفتحو السلة
};

async function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; grid-column: span 2;">جاري تحميل المنتجات من السحابة... ☁️</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        container.innerHTML = ''; 

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="text-align:center; grid-column: span 2;">لا توجد منتجات في المتجر حالياً.</p>';
            return;
        }

                querySnapshot.forEach((doc) => {
            const product = doc.data();  
            product.category = product.category || 'shirt'; // تصنيف افتراضي
            allProducts.push(product); // نزيدو المنتج للقائمة
            createProductCard(product); // نعرضوه
        });
    } catch (error) {
        console.error("خطأ في جلب المنتجات: ", error);
        container.innerHTML = `<p style="text-align:center; grid-column: span 2; color: red; direction: ltr;">Error: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayProducts();
});
// دالة تصاوب كارت المنتج (كتستعمل في العرض والفلترة)
function createProductCard(product) {
    const container = document.getElementById('products-container');
    const card = document.createElement('div'); 
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">${product.price} دج</p>
            <button onclick="addToCart('${product.name}', ${product.price})">أضف إلى السلة</button>
        </div>
    `;
    container.appendChild(card);
}

// دالة الفلترة (كي تكليكي على زر)
window.filterProducts = function(category) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // نمسحو المنتجات القديمة

    // نبدلو ستايل الأزرار (اللي ندوزو عليه كيولي كحل)
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // إذا اختار "الكل"، نعرضو كلشي، وإلا نعرضو غير اللي يشبه للتصنيف
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد منتجات في هذا التصنيف.</p>';
    } else {
        filtered.forEach(product => createProductCard(product));
    }
}
// دالة باش نفتحو ونسكرو السلة
window.toggleSideCart = function() {
    const sideCart = document.getElementById('side-cart');
    const overlay = document.getElementById('side-cart-overlay');
    if (sideCart) sideCart.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// دالة باش نعرضو المنتجات داخل السلة الجانبية
function renderSideCart() {
    const container = document.getElementById('side-cart-items');
    const totalElement = document.getElementById('side-cart-total');
    if (!container || !totalElement) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777;">السلة فارغة</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            container.innerHTML += `
                <div class="side-cart-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.price} دج</p>
                    </div>
                    <button onclick="removeFromSideCart(${index})">✖</button>
                </div>
            `;
        });
    }
    totalElement.innerText = total;
}

// دالة باش نحذفو منتج من السلة
window.removeFromSideCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    updateCartCount();
    renderSideCart();
};

// كي تفتح الصفحة، نعرضو السلة
document.addEventListener('DOMContentLoaded', () => {
    renderSideCart();
});