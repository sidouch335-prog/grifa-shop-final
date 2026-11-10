import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let total = 0;

// نعرضو ملخص الطلب في الصفحة
function renderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const totalElement = document.getElementById('checkout-total');
    
    summaryItems.innerHTML = '';
    
    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="color: #ccc;">السلة فارغة</p>';
        totalElement.innerText = '0 دج';
        return;
    }

    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
        summaryItems.innerHTML += `
            <div class="summary-item">
                <span>${item.name} (x${item.quantity || 1})</span>
                <span>${item.price * (item.quantity || 1)} دج</span>
            </div>
        `;
    });

    totalElement.innerText = total + ' دج';
}

// تشغيل الملخص كي تفتح الصفحة
document.addEventListener('DOMContentLoaded', renderSummary);

// كي يدوس على تأكيد الطلب
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("السلة فارغة! زيد منتجات قبل ما تكمل الطلب.");
        window.location.href = "index.html";
        return;
    }

    const name = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    const wilaya = document.getElementById('wilaya').options[document.getElementById('wilaya').selectedIndex].text;
    const address = document.getElementById('address').value;

    // نسجلو الطلب في السحابة
    try {
        await addDoc(collection(db, "orders"), {
            name: name,
            phone: phone,
            wilaya: wilaya,
            address: address,
            items: cart,
            total: total,
            date: new Date().toLocaleString('ar-DZ'),
            status: "قيد الانتظار"
        });

        alert(`شكراً ${name}!\nتم استلام طلبك بنجاح.\nالمجموع: ${total} دج\nسنقوم بالاتصال بك على الرقم ${phone} للتأكيد.`);
        
        localStorage.removeItem('grifa_cart'); // نمسحو السلة
        window.location.href = "index.html"; // نرجعوه للرئيسية
    } catch (error) {
        console.error("خطأ في حفظ الطلب: ", error);
        alert("حدث خطأ أثناء حفظ الطلب. جرب مرة أخرى.");
    }
});