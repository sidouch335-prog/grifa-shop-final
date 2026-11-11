import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let allProducts = [];

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) cartCountElement.innerText = cart.length;
}

// هنا صلحنا المشكل (حيدنا W الزايدة)
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
    
    const toast = document.createElement('div');
    toast.innerText = `تمت إضافة ${productName} إلى السلة ✅`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:15px 30px; border-radius:50px; font-weight:bold; z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

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

window.openProductPage = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product.html';
    }
};

document.getElementById('products-container').addEventListener('click', function(e) {
    const target = e.target;
    if (target.hasAttribute('data-id')) {
        window.openProductPage(target.getAttribute('data-id'));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayProducts();
});
