import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let total = 0;
let discount = 0;

// أسعار التوصيل (نقدرو نخليوهم هكذا دوكا، ولا نربطوهم مع صفحة التوصيل)
const shippingPrices = {
    "16": 400, "31": 600, "25": 600, "19": 500, "09": 400, "06": 500, "default": 800
};

// نعرضو ملخص الطلب في الصفحة
function renderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const totalElement = document.getElementById('checkout-total');
    
    summaryItems.innerHTML = '';
    total = 0;
    
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

// كي تبدل الولاية، نزيدو ثمن التوصيل
document.getElementById('wilaya').addEventListener('change', function() {
    const wilayaValue = this.value;
    const wilayaCode = wilayaValue.split(' ')[0];
    const shipping = shippingPrices[wilayaCode] || shippingPrices['default'];
    const finalTotal = total - discount + shipping;
    document.getElementById('checkout-total').innerText = finalTotal + ' دج';
});

// تطبيق الكوبون
window.applyCoupon = async function() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const message = document.getElementById('coupon-message');
    const totalElement = document.getElementById('checkout-total');

    try {
        const q = query(collection(db, "coupons"), where("code", "==", code));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const couponData = querySnapshot.docs[0].data();
            discount = total * (couponData.discount / 100);
            const newTotal = total - discount;
            totalElement.innerText = newTotal + ' دج';
            message.innerText = `تم تطبيق خصم ${couponData.discount}%!`;
            message.style.color = '#27ae60';
        } else {
            discount = 0;
            totalElement.innerText = total + ' دج';
            message.innerText = 'كود الخصم غير صالح.';
            message.style.color = '#e74c3c';
        }
    } catch (error) {
        console.error("خطأ: ", error);
        message.innerText = 'حدث خطأ في الاتصال.';
        message.style.color = '#e74c3c';
    }
};

document.addEventListener('DOMContentLoaded', renderSummary);

// تأكيد الطلب
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("السلة فارغة! زيد منتجات قبل ما تكمل الطلب.");
        window.location.href = "index.html";
        return;
    }

    const name = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    const wilaya = document.getElementById('wilaya').value;
    const address = document.getElementById('address').value;

    const wilayaCode = wilaya.split(' ')[0];
    const shipping = shippingPrices[wilayaCode] || shippingPrices['default'];
    const finalTotal = total - discount + shipping;

    try {
        await addDoc(collection(db, "orders"), {
            name: name,
            phone: phone,
            wilaya: wilaya,
            address: address,
            items: cart,
            total: finalTotal,
            date: new Date().toLocaleString('ar-DZ'),
            status: "قيد الانتظار"
        });

        // ننقصو الكمية من المخزون
        for (const item of cart) {
            const productQuery = await getDocs(collection(db, "products"));
            let productDoc = null;
            productQuery.forEach((doc) => {
                const p = doc.data();
                if (p.name === item.name) {
                    productDoc = { id: doc.id, data: p };
                }
            });
            if (productDoc) {
                const newStock = (productDoc.data.stock || 0) - (item.quantity || 1);
                await updateDoc(doc(db, "products", productDoc.id), { stock: Math.max(0, newStock) });
            }
        }

        alert(`شكراً ${name}!\nتم استلام طلبك بنجاح.\nالمجموع الكلي: ${finalTotal} دج`);
        localStorage.removeItem('grifa_cart');
        window.location.href = "index.html";
    } catch (error) {
        console.error("خطأ: ", error);
        alert("حدث خطأ أثناء حفظ الطلب.");
    }
});