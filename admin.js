import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const form = document.getElementById('add-product-form');
const productList = document.getElementById('product-list');
const ordersContainer = document.getElementById('orders-container');

// --- 1. عرض المنتجات ---
async function renderAdminProducts() {
    productList.innerHTML = '<h3>المنتجات الحالية:</h3><p>جاري التحميل...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productList.innerHTML = '<h3>المنتجات الحالية:</h3>';
        if (querySnapshot.empty) {
            productList.innerHTML += '<p>لا توجد منتجات حالياً.</p>';
            return;
        }
        querySnapshot.forEach((document) => {
            const p = document.data();
            const id = document.id;
            productList.innerHTML += `
                <div class="admin-product" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #eee;">
                    <span>${p.name} - ${p.price} دج</span>
                    <button onclick="deleteProduct('${id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">حذف</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب المنتجات: ", error);
    }
}

// --- 2. حذف منتج ---
window.deleteProduct = async function(id) {
    if (confirm("واش راك متأكد بلي تحب تحذف هذا المنتج؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            renderAdminProducts();
        } catch (error) {
            alert("ما قدرناش نحذفو المنتج.");
        }
    }
}

// --- 3. إضافة منتج جديد ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const image = document.getElementById('p-image').value;

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: image,
            createdAt: new Date()
        });
        alert("تمت إضافة المنتج بنجاح في السحابة! ☁️");
        form.reset();
        renderAdminProducts();
    } catch (error) {
        alert("حدث خطأ أثناء إضافة المنتج: " + error.message);
    }
});

// --- 4. عرض الطلبات من السحابة (مع التشخيص) ---
async function renderAdminOrders() {
    if (!ordersContainer) {
        alert("المشكل في admin.html: orders-container ماموجودش!");
        return;
    }
    ordersContainer.innerHTML = '<h3>الطلبات الواردة:</h3><p>جاري التحميل...</p>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        ordersContainer.innerHTML = '<h3>الطلبات الواردة:</h3>';
        
        if (querySnapshot.empty) {
            ordersContainer.innerHTML += '<p>لا توجد طلبات جديدة.</p>';
            return;
        }

        querySnapshot.forEach((document) => {
            const order = document.data();
            
            // نتحققو واش items كاينة باش ما يطيحش الكود
            let itemsList = '';
            if (order.items && Array.isArray(order.items)) {
                itemsList = order.items.map(item => `<li>${item.name} (${item.price} دج)</li>`).join('');
            } else {
                itemsList = '<li>معلومات المنتجات غير متوفرة</li>';
            }
            
            ordersContainer.innerHTML += `
                <div class="order-card">
                    <h4>👤 العميل: ${order.name}</h4>
                    <p><strong>📞 الهاتف:</strong> <a href="tel:${order.phone}" style="color: #2980b9; text-decoration: none;">${order.phone}</a></p>
                    <p><strong>📍 العنوان:</strong> ${order.wilaya} - ${order.address}</p>
                    <div class="order-items">
                        <strong>🛒 المنتجات:</strong>
                        <ul style="margin: 5px 0; padding-right: 20px;">${itemsList}</ul>
                    </div>
                    <p class="order-total"><strong>المجموع:</strong> <span style="color: #e74c3c; font-weight: bold;">${order.total} دج</span></p>
                    <p style="font-size: 12px; color: #777;">🕒 ${order.date}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب الطلبات: ", error);
        // هاد السطر راح يوريلنا الخطأ بعينو في الشاشة
        ordersContainer.innerHTML += `<p style="color: red; font-weight: bold;">Error: ${error.message}</p>`;
    }
}

// التشغيل
renderAdminProducts();
renderAdminOrders();