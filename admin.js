import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

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

// --- 3. إضافة منتج جديد (مع رفع الصورة لـ Cloudinary) ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const type = document.getElementById('p-type').value;
    const fileInput = document.getElementById('p-image-file');
    const file = fileInput.files[0];

    if (!file) {
        alert("خاصك تختار صورة للمنتج!");
        return;
    }

    // نعطلو الزر باش ما يديرش كليكات بزاف
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerText = "جاري رفع الصورة...";
    submitBtn.disabled = true;

    try {
        // رفع الصورة لـ Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'grifa_upload'); // Preset Name اللي درتي

        const response = await fetch('https://api.cloudinary.com/v1_1/vbw7ttog/image/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        const imageUrl = data.secure_url; // رابط الصورة

        // تسجيل المنتج في Firestore
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            type: type,
            image: imageUrl,
            createdAt: new Date()
        });

        alert("تمت إضافة المنتج بنجاح! ☁️");
        form.reset();
        renderAdminProducts();
    } catch (error) {
        console.error("خطأ في الإضافة: ", error);
        alert("حدث خطأ: " + error.message);
    } finally {
        submitBtn.innerText = "إضافة المنتج للمتجر";
        submitBtn.disabled = false;
    }
});

// --- 4. عرض الطلبات من السحابة ---
async function renderAdminOrders() {
    if (!ordersContainer) return;
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
            const id = document.id;
            let itemsList = order.items ? order.items.map(item => `<li>${item.name} (${item.price} دج)</li>`).join('') : 'غير محدد';
            
            ordersContainer.innerHTML += `
                <div style="background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-right: 5px solid #27ae60; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 10px 0;">👤 العميل: ${order.name}</h4>
                    <p style="margin: 5px 0;"><strong>📞 الهاتف:</strong> <a href="tel:${order.phone}" style="color: #2980b9; text-decoration: none;">${order.phone}</a></p>
                    <p style="margin: 5px 0;"><strong>📍 العنوان:</strong> ${order.wilaya} - ${order.address}</p>
                    <div style="background: #f4f4f9; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <strong>🛒 المنتجات:</strong>
                        <ul style="margin: 5px 0; padding-right: 20px;">${itemsList}</ul>
                    </div>
                    <p style="margin: 5px 0; font-size: 18px;"><strong>المجموع:</strong> <span style="color: #e74c3c; font-weight: bold;">${order.total} دج</span></p>
                    <p style="margin: 5px 0; font-size: 12px; color: #777;">🕒 ${order.date}</p>
                    
                    <div style="margin-top: 10px;">
                        <label style="font-weight: bold; margin-left: 10px;">حالة الطلب:</label>
                        <select onchange="updateOrderStatus('${id}', this.value)" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                            <option value="قيد الانتظار" ${order.status === 'قيد الانتظار' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="تم التأكيد" ${order.status === 'تم التأكيد' ? 'selected' : ''}>تم التأكيد</option>
                            <option value="تم الشحن" ${order.status === 'تم الشحن' ? 'selected' : ''}>تم الشحن</option>
                            <option value="تم التوصيل" ${order.status === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                        </select>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب الطلبات: ", error);
    }
}

// --- 5. دالة تحديث حالة الطلب ---
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: newStatus
        });
        alert("تم تحديث حالة الطلب بنجاح! ✅");
        renderAdminOrders();
    } catch (error) {
        console.error("خطأ في تحديث الحالة: ", error);
        alert("ما قدرناش نحدثو الحالة.");
    }
};

// --- تشغيل الدوال كي تفتح الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    renderAdminProducts();
    renderAdminOrders();
});