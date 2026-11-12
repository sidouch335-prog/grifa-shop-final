import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
let total = 0;

// أسعار التوصيل حسب الولايات (تقدر تبدلها من بعد)
const shippingPrices = {
    "16": 400, // الجزائر
    "31": 600, // وهران
    "25": 600, // قسنطينة
    "19": 500, // سطيف
    "09": 400, // البليدة
    "06": 500, // بجاية
    "default": 800 // باقي الولايات
};

// نعرضو ملخص الطلب في الصفحة
function renderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const totalElement = document.getElementById('checkout-total');
    
    summaryItems.innerHTML = '';
    total = 0; // نعاودو نحسبو المجموع من الصفر
    
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

    // نعرضو المجموع بلا التوصيل دوكا
    totalElement.innerText = total + ' دج';
}

// كي تبدل الولاية، نزيدو ثمن التوصيل
document.getElementById('wilaya').addEventListener('change', function() {
    const wilayaValue = this.value;
    const wilayaCode = wilayaValue.split(' ')[0]; // ناخدو رقم الولاية فقط
    const shipping = shippingPrices[wilayaCode] || shippingPrices['default'];
    const finalTotal = total + shipping;
    
    // نعرضو المجموع الجديد مع التوصيل
    document.getElementById('checkout-total').innerText = finalTotal + ' دج';
});

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
    const wilaya = document.getElementById('wilaya').value;
    const address = document.getElementById('address').value;

    // نحسبو السعر النهائي (المنتجات + التوصيل)
    const wilayaCode = wilaya.split(' ')[0];
    const shipping = shippingPrices[wilayaCode] || shippingPrices['default'];
    const finalTotal = total + shipping;

    // نسجلو الطلب في السحابة
    try {

                // ننقصو الكمية من المخزون
        for (const item of cart) {
            // نلقاو المنتج الأصلي في السحابة
            const productQuery = await getDocs(collection(db, "products"));
            let productDoc = null;
            
            productQuery.forEach((doc) => {
                const p = doc.data();
                // إذا كان المنتج فيه متغيرات، نلقاو التركيبة المناسبة
                if (p.hasVariants && item.name.includes('(')) {
                    // نستخرجو المقاس واللون من الاسم (مثال: "قميص (S - أحمر)")
                    // ... (هذا الجزء معقد شوية، راح نبسطوه دوكا)
                } else if (p.name === item.name) {
                    productDoc = { id: doc.id, data: p };
                }
            });

            if (productDoc) {
                const newStock = (productDoc.data.stock || 0) - (item.quantity || 1);
                await updateDoc(doc(db, "products", productDoc.id), {
                    stock: Math.max(0, newStock)
                });
            }
        }
                // ننقصو الكمية من المخزون
        for (const item of cart) {
            // نلقاو المنتج الأصلي في السحابة
            const productQuery = await getDocs(collection(db, "products"));
            let productDoc = null;
            
            productQuery.forEach((doc) => {
                const p = doc.data();
                // إذا كان المنتج فيه متغيرات، نلقاو التركيبة المناسبة
                if (p.hasVariants && item.name.includes('(')) {
                    // نستخرجو المقاس واللون من الاسم (مثال: "قميص (S - أحمر)")
                    // ... (هذا الجزء معقد شوية، راح نبسطوه دوكا)
                } else if (p.name === item.name) {
                    productDoc = { id: doc.id, data: p };
                }
            });

            if (productDoc) {
                const newStock = (productDoc.data.stock || 0) - (item.quantity || 1);
                await updateDoc(doc(db, "products", productDoc.id), {
                    stock: Math.max(0, newStock)
                });
            }
        }
        await addDoc(collection(db, "orders"), {
            name: name,
            phone: phone,
            wilaya: wilaya,
            address: address,
            items: cart,
            total: finalTotal, // نسجلو المجموع مع التوصيل
            date: new Date().toLocaleString('ar-DZ'),
            status: "قيد الانتظار"
        });

        alert(`شكراً ${name}!\nتم استلام طلبك بنجاح.\nالمجموع الكلي مع التوصيل: ${finalTotal} دج\nسنقوم بالاتصال بك على الرقم ${phone} للتأكيد.`);
        
        localStorage.removeItem('grifa_cart'); // نمسحو السلة
        window.location.href = "index.html"; // نرجعوه للرئيسية
    } catch (error) {
        console.error("خطأ في حفظ الطلب: ", error);
        alert("حدث خطأ أثناء حفظ الطلب. جرب مرة أخرى.");
    }
});