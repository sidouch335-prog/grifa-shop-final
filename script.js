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

       // كنشوفو واش الكمية كاينة
    const totalStock = product.hasVariants 
        ? (product.variants || []).reduce((acc, v) => acc + (v.stock || 0), 0)
        : (product.stock || 0);
    
    const isAvailable = totalStock > 0;

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="cursor:pointer;" data-id="${product.id}">
        <div class="product-info">
            <h3 style="cursor:pointer;" data-id="${product.id}">${product.name}</h3>
            <p class="price">${product.price} دج</p>
            ${isAvailable 
                ? `<button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">أضف إلى السلة</button>`
                : `<button style="background: #ccc; cursor: not-allowed;" disabled>غير متوفر</button>`
            }
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
// دالة جلب وعرض التصنيفات من السحابة
async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        // نزيدو زر "الكل" كأول حاجة
        container.innerHTML = '<button class="category-btn active" onclick="filterProducts(\'all\')">الكل</button>';

        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            container.innerHTML += `
                <button class="category-btn" onclick="filterProducts('${cat.name}')">${cat.name}</button>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب التصنيفات: ", error);
    }
}
window.filterProducts = function(category) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // نمسحو المنتجات القديمة

    // نبدلو ستايل الأزرار (اللي ندوزو عليه كيولي كحل)
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // نلقاو الزر اللي كليكا عليه ونفعلوه
    const clickedBtn = Array.from(buttons).find(btn => btn.innerText === category || (category === 'all' && btn.innerText === 'الكل'));
    if (clickedBtn) clickedBtn.classList.add('active');

    // إذا اختار "الكل"، نعرضو كلشي، وإلا نعرضو غير اللي يشبه للتصنيف
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد منتجات في هذا التصنيف.</p>';
    } else {
        filtered.forEach(product => createProductCard(product));
    }
};