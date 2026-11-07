import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let total = 0;

cart.forEach(item => {
    total += item.price;
});

document.getElementById('checkout-total').innerText = total;

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

    // نسجلو الطلب
    const order = {
        name: name,
        phone: phone,
        wilaya: wilaya,
        address: address,
        items: cart,
        total: total,
        date: new Date().toLocaleString('ar-DZ')
    };

    try {
        // نزيدو الطلب في مجموعة "orders" في السحابة
        await addDoc(collection(db, "orders"), order);

        alert(`شكراً ${name}!\nتم استلام طلبك بنجاح في السحابة.\nالمجموع: ${total} دج\nسنقوم بالاتصال بك على الرقم ${phone} للتأكيد.`);
        
        localStorage.removeItem('grifa_cart'); // نمسحو السلة
        window.location.href = "index.html"; // نرجعوه للرئيسية
    } catch (error) {
        console.error("خطأ في حفظ الطلب: ", error);
        alert("حدث خطأ أثناء حفظ الطلب. جرب مرة أخرى.");
    }
});