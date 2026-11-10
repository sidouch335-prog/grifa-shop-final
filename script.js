import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let allProducts = []; // كنخزنو فيها المنتجات باش نفلتروهم

// تحديث عدد السلة
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length;
    }
}

// إضافة منتج للسلة (من الصفحة الرئيسية)
window.addToCart = function(productName, productPrice, productImage) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
    }
    
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    updateCartCount();
    
    if (window.renderSideCart) window.renderSideCart();
    if (window.toggleSideCart) window.toggleSideCart();
};

// جلب وعرض المنتجات من السحابة
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
            product.id = doc.id; // كنحفظو ID
            allProducts.push(product); 
            createProductCard(product);
        });
    } catch (error) {
        console.error("خطأ في جلب المنتجات: ", error);
        container.innerHTML = `<p style="text-align:center; grid-column: span 2; color: red;">Error: ${error.message}</p>`;
    }
}

// دالة تصاوب كارت المنتج
function createProductCard(product) {
    const container = document.getElementById('products-container');
    const card = document.createElement('div'); 
    card.className = 'product-card';
    
    const type = product.type || 'shirt';

    // كنخدمو onclick مع JSON.stringify باش نتفاداو مشكل علامات التنصيص
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="cursor:pointer;" onclick='openProductPage(${JSON.stringify(product).replace(/'/g, "&#39;")})'>
        <div class="product-info">
            <h3 style="cursor:pointer;" onclick='openProductPage(${JSON.stringify(product).replace(/'/g, "&#39;")})'>${product.name}</h3>
            <p class="price">${product.price} دج</p>
            <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">أضف إلى السلة</button>
        </div>
    `;
    container.appendChild(card);
}

// دالة فتح صفحة المنتج
window.openProductPage = function(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'product.html';
};

// تشغيل عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayProducts();
});