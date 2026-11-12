import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let currentProduct = null;
let selectedColor = null;
let selectedSize = null;

// دالة اختيار اللون
window.selectColor = function(button, color) {
    const parent = button.parentElement;
    parent.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedColor = color;
};

// دالة اختيار المقاس
window.selectSize = function(button, size) {
    const parent = button.parentElement;
    parent.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedSize = size;
};

// كي تفتح الصفحة، نجيبو معلومات المنتج
document.addEventListener('DOMContentLoaded', () => {
    const productData = localStorage.getItem('selectedProduct');
    
    if (productData) {
        currentProduct = JSON.parse(productData);
        
        // نعرضو المعلومات الأساسية
        document.getElementById('p-name').innerText = currentProduct.name;
        document.getElementById('p-price').innerText = currentProduct.price + ' دج';
        document.getElementById('p-image').src = currentProduct.image || 'https://via.placeholder.com/500';

        // نعرضو الألوان والمقاسات
        const colorContainer = document.getElementById('color-options');
        const sizeContainer = document.getElementById('size-options');
        
        colorContainer.innerHTML = '';
        sizeContainer.innerHTML = '';

        if (currentProduct.variants && currentProduct.variants.length > 0) {
            const colors = [...new Set(currentProduct.variants.map(v => v.color))];
            const sizes = [...new Set(currentProduct.variants.map(v => v.size))];

            colors.forEach(color => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn';
                btn.innerText = color;
                btn.onclick = () => selectColor(btn, color);
                colorContainer.appendChild(btn);
            });

            sizes.forEach(size => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn';
                btn.innerText = size;
                btn.onclick = () => selectSize(btn, size);
                sizeContainer.appendChild(btn);
            });
        } else {
            colorContainer.innerHTML = '<p style="color:#777;">لا توجد ألوان</p>';
            sizeContainer.innerHTML = '<p style="color:#777;">لا توجد مقاسات</p>';
        }

        document.title = currentProduct.name + ' - Grifa Shop';
        
        // نستدعيو دالة التقييمات
        loadReviews(currentProduct.name);
    } else {
        window.location.href = 'index.html';
    }
});

// دالة الإضافة للسلة
window.addToCartWithVariants = function() {
    if (!currentProduct) return;

    if (!selectedColor || !selectedSize) {
        alert("خاصك تختار اللون والمقاس!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
    const fullName = `${currentProduct.name} (${selectedSize} - ${selectedColor})`;
    
    const existingItem = cart.find(item => item.name === fullName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            name: fullName, 
            price: currentProduct.price, 
            image: currentProduct.image, 
            quantity: 1 
        });
    }

    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    
    const toast = document.createElement('div');
    toast.innerText = `تمت إضافة ${fullName} إلى السلة ✅`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:15px 30px; border-radius:50px; font-weight:bold; z-index:9999;';
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
    setTimeout(() => {
        window.location.href = 'cart.html'; 
    }, 1000);
};

// دالة عرض التقييمات
async function loadReviews(productName) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    try {
        const q = query(collection(db, "reviews"), where("productName", "==", productName));
        const querySnapshot = await getDocs(q);
        
        list.innerHTML = '';
        
        if (querySnapshot.empty) {
            list.innerHTML = '<p style="color: #777;">لا توجد تقييمات بعد.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const review = doc.data();
            const stars = '⭐'.repeat(review.rating);
            list.innerHTML += `
                <div style="background: white; padding: 10px; border-radius: 5px; margin-bottom: 10px; border: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong>${review.name}</strong>
                        <span style="color: #f39c12;">${stars}</span>
                    </div>
                    <p style="font-size: 14px; color: #555;">${review.text}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب التقييمات: ", error);
    }
}

// استمارة إرسال التقييم
document.getElementById('review-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentProduct) return;

    const rating = document.getElementById('review-rating').value;
    const name = document.getElementById('review-name').value;
    const text = document.getElementById('review-text').value;

    if (!rating || !name || !text) {
        alert("خاصك تعمر كل الخانات!");
        return;
    }

    try {
        await addDoc(collection(db, "reviews"), {
            productName: currentProduct.name,
            rating: parseInt(rating),
            name: name,
            text: text,
            date: new Date().toLocaleString('ar-DZ')
        });
        alert("تم إرسال تقييمك! شكراً لك. ⭐");
        document.getElementById('review-form').reset();
        loadReviews(currentProduct.name);
    } catch (error) {
        console.error("خطأ: ", error);
        alert("ما قدرناش نرسلو التقييم. تأكد من اتصالك بالأنترنت.");
    }
});