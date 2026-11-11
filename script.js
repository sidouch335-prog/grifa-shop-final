import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let allProducts = [];

// --- 1. تحديث عدد السلة ---
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.innerText = cart.length;
}

// --- 2. إضافة منتج للسلة (من الواجهة) ---
window.addToCart = function(productName, productPrice, productImage) {
    let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
    
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
    }
    
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    
    if (window.updateCartCount) window.updateCartCount();
    if (window.renderSideCart) window.renderSideCart();
    if (window.toggleSideCart) window.toggleSideCart();
    
    // إشعار خفيف
    const toast = document.createElement('div');
    toast.innerText = `تمت إضافة ${productName} إلى السلة ✅`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:15px 30px; border-radius:50px; font-weight:bold; z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

// --- 3. عرض المنتجات من السحابة ---
async function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; grid-column: span 2;">جاري تحميل المنتجات... ☁️</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        container.innerHTML = ''; 

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="text-align:center; grid-column: span 2;">لا توجد منتجات.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            product.id = doc.id;
            allProducts.push(product); 
            createProductCard(product);
        });
    } catch (error) {
        console.error("خطأ: ", error);
        container.innerHTML = `<p style="text-align:center; grid-column: span 2; color: red;">Error: ${error.message}</p>`;
    }
}

// --- 4. إنشاء كارت المنتج ---
function createProductCard(product) {
    const container = document.getElementById('products-container');
    const card = document.createElement('div'); 
    card.className = 'product-card';

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="cursor:pointer;" data-id="${product.id}">
        <div class="product-info">
            <h3 style="cursor:pointer;" data-id="${product.id}">${product.name}</h3>
            <p class="price">${product.price} دج</p>
            <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">أضف إلى السلة</button>
        </div>
    `;
    container.appendChild(card);
}

// --- 5. فتح صفحة المنتج ---
window.openProductPage = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product.html';
    }
};

// --- 6. أحداث النقر على المنتجات ---
document.getElementById('products-container').addEventListener('click', function(e) {
    const target = e.target;
    if (target.hasAttribute('data-id')) {
        window.openProductPage(target.getAttribute('data-id'));
    }
});

// --- 7. تحميل إعدادات المتجر (الفوتر) ---
async function loadStoreSettings() {
    try {
        const docRef = doc(db, "settings", "store_info");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // تحديث اسم المتجر في الفوتر
            const footerName = document.querySelector('.footer-section h3');
            if (footerName && data.name) footerName.innerText = data.name;

            // تحديث رقم الهاتف (مع تصحيح اتجاه الأرقام)
            const footerPhone = document.querySelectorAll('.footer-section p')[0];
            if (footerPhone && data.phone) {
                footerPhone.innerHTML = `📞 الهاتف: <span style="direction: ltr; display: inline-block;">${data.phone}</span>`;
            }

            // تحديث روابط السوشيال ميديا
            const facebookLink = document.getElementById('footer-facebook');
            if (facebookLink && data.facebook) facebookLink.href = data.facebook;

            const instagramLink = document.getElementById('footer-instagram');
            if (instagramLink && data.instagram) instagramLink.href = data.instagram;
        }
    } catch (error) {
        console.error("خطأ في جلب إعدادات المتجر: ", error);
    }
}

// --- 8. تشغيل كلشي كي تفتح الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayProducts();
    loadStoreSettings();
});