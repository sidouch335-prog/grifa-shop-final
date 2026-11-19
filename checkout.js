import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { shippingRates } from './shipping.js';

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
console.log("السلة في checkout:", cart);
let subtotal = 0;
let shippingCost = 0;
let discount = 0;
let isSubmitting = false;

// --- 1. عرض ملخص الطلب ---
console.log("السلة في checkout:", cart);
function renderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('subtotal-price');
    const totalElement = document.getElementById('total-price');

    if (!summaryItems) return;

    summaryItems.innerHTML = '';
    subtotal = 0;

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="color: #777;">السلة فارغة</p>';
        if (subtotalElement) subtotalElement.innerText = '0 دج';
        if (totalElement) totalElement.innerText = '0 دج';
        return;
    }

    cart.forEach(item => {
        subtotal += item.price * (item.quantity || 1);
        summaryItems.innerHTML += `
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555;">
                <span>${item.name} (x${item.quantity || 1})</span>
                <span>${item.price * (item.quantity || 1)} دج</span>
            </div>
        `;
    });

    if (subtotalElement) subtotalElement.innerText = subtotal + ' دج';
    updateTotals(); // نستدعيو الدالة باش نحسبو التوصيل والمجموع النهائي
}

// --- 2. حساب المجموع النهائي (مع التوصيل والخصم) ---
function updateTotals() {
    const wilayaSelect = document.getElementById('wilaya');
    const deliveryTypeSelect = document.getElementById('delivery-type');
    const shippingRow = document.getElementById('shipping-row');
    const shippingElement = document.getElementById('shipping-price');
    const totalElement = document.getElementById('total-price');

    if (!wilayaSelect || !deliveryTypeSelect || !shippingRow || !shippingElement || !totalElement) return;

    const wilaya = wilayaSelect.value;
    const deliveryType = deliveryTypeSelect.value;

    if (wilaya) {
        const rates = shippingRates[wilaya] || shippingRates['default'];
        shippingCost = deliveryType === 'home' ? rates.home : rates.office;
        shippingRow.style.display = 'flex';
        shippingElement.innerText = shippingCost + ' دج';
    } else {
        shippingCost = 0;
        shippingRow.style.display = 'none';
    }

    const finalTotal = subtotal - discount + shippingCost;
    totalElement.innerText = finalTotal + ' دج';
}

// --- 3. تطبيق الكوبون ---
window.applyCoupon = async function() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const message = document.getElementById('coupon-message');
    if (!message) return;

    try {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        let found = false;

        querySnapshot.forEach((doc) => {
            const coupon = doc.data();
            if (coupon.code === code) {
                discount = subtotal * (coupon.discount / 100);
                message.innerText = `تم تطبيق خصم ${coupon.discount}%!`;
                message.style.color = '#27ae60';
                found = true;
            }
        });

        if (!found) {
            discount = 0;
            message.innerText = 'كود الخصم غير صالح.';
            message.style.color = '#e74c3c';
        }
        updateTotals();
    } catch (error) {
        console.error("خطأ: ", error);
    }
};

// --- 4. تأكيد الطلب ---
document.getElementById('checkout-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const name = document.getElementById('fullname').value;
    const phone = document.getElementById('phone').value;
    const wilaya = document.getElementById('wilaya').value;
    const address = document.getElementById('address').value;
    const deliveryType = document.getElementById('delivery-type')?.value || 'home';
    const notes = document.getElementById('notes')?.value || '';

    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
        alert("رقم الهاتف غير صحيح. يجب أن يكون 10 أرقام ويبدأ بـ 05 أو 06 أو 07.");
        return;
    }

    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    isSubmitting = true;
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري المعالجة...';
    }

    try {
        const orderData = {
            orderNumber: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            name: name,
            phone: phone,
            wilaya: wilaya,
            address: address,
            deliveryType: deliveryType,
            notes: notes,
            items: cart,
            subtotal: subtotal,
            shipping: shippingCost,
            discount: discount,
            total: subtotal - discount + shippingCost,
            status: "جديد"
        };

        await addDoc(collection(db, "orders"), orderData);

        for (const item of cart) {
            const productQuery = await getDocs(collection(db, "products"));
            let productDoc = null;
            productQuery.forEach((doc) => {
                if (doc.data().name === item.name) productDoc = { id: doc.id, data: doc.data() };
            });
            if (productDoc) {
                const newStock = (productDoc.data.stock || 0) - (item.quantity || 1);
                await updateDoc(doc(db, "products", productDoc.id), { stock: Math.max(0, newStock) });
            }
        }

        let localOrders = JSON.parse(localStorage.getItem('orders')) || [];
        localOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(localOrders));

        alert(`شكراً ${name}!\nتم استلام طلبك بنجاح.\nرقم الطلب: ${orderData.orderNumber}`);
        
        localStorage.removeItem('grifa_cart');
        window.location.href = "index.html";

    } catch (error) {
        console.error("خطأ: ", error);
        alert("حدث خطأ أثناء حفظ الطلب: " + error.message);
    } finally {
        isSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'تأكيد الطلب';
        }
    }
});

// --- 5. ربط الأحداث كي تفتح الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    renderSummary();
    document.getElementById('wilaya')?.addEventListener('change', updateTotals);
    document.getElementById('delivery-type')?.addEventListener('change', updateTotals);
});