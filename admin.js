import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
// --- 1. عرض المنتجات والطلبات ---
async function loadDashboardData() {
    try {
        // جلب المنتجات
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsTable = document.getElementById('products-table').getElementsByTagName('tbody')[0];
        productsTable.innerHTML = '';
        let productsCount = 0;

        productsSnapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            productsCount++;
            
            productsTable.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td style="color: #e74c3c; font-weight: bold;">${p.price} دج</td>
                    <td><button onclick="deleteProduct('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
        document.getElementById('total-products').innerText = productsCount;

        // جلب الطلبات
               // جلب الطلبات
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        let totalSales = 0;
        let ordersCount = 0;
        const ordersTable = document.getElementById('orders-table')?.getElementsByTagName('tbody')[0];
        
        if (ordersTable) ordersTable.innerHTML = '';

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            totalSales += order.total || 0;
            ordersCount++;

            // نعرضو الطلب في الجدول (إذا كان الجدول كاين)
            if (ordersTable) {
                let itemsList = order.items ? order.items.map(item => `${item.name} (${item.price} دج)`).join(', ') : 'غير محدد';
                               let statusText = order.status || "قيد الانتظار";
                let statusColor = "#f39c12"; // أصفر
                if (statusText === "تم التأكيد") statusColor = "#3498db"; // أزرق
                if (statusText === "تم الشحن") statusColor = "#9b59b6"; // بنفسجي
                if (statusText === "تم التوصيل") statusColor = "#27ae60"; // أخضر

                ordersTable.innerHTML += `
                    <tr>
                        <td>${order.name}</td>
                        <td>${order.phone}</td>
                        <td>${order.wilaya} - ${order.address}</td>
                        <td>${itemsList}</td>
                        <td style="color: #e74c3c; font-weight: bold;">${order.total} دج</td>
                        <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
                        <td>
                            <select onchange="updateOrderStatus('${doc.id}', this.value)" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc;">
                                <option value="قيد الانتظار" ${statusText === 'قيد الانتظار' ? 'selected' : ''}>قيد الانتظار</option>
                                <option value="تم التأكيد" ${statusText === 'تم التأكيد' ? 'selected' : ''}>تم التأكيد</option>
                                <option value="تم الشحن" ${statusText === 'تم الشحن' ? 'selected' : ''}>تم الشحن</option>
                                <option value="تم التوصيل" ${statusText === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                            </select>
                        </td>
                    </tr>
                `;
            }
        });

        document.getElementById('total-sales').innerText = totalSales + ' دج';
        document.getElementById('total-orders').innerText = ordersCount;
    } catch (error) {
        console.error("خطأ في جلب البيانات: ", error);
    }
}

// --- 2. إضافة منتج جديد ---
const form = document.getElementById('add-product-form');
form.addEventListener('submit', async function(e) {
    e.preventDefault();
        const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const image = document.getElementById('p-image').value;
    const type = document.getElementById('p-type').value; // زدنا هاد السطر

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: image,
            type: type, // زدنا هاد السطر باش يتسجل النوع
            createdAt: new Date()
        });
        alert("تمت إضافة المنتج بنجاح! ☁️");
        form.reset();
        loadDashboardData(); // نحدثو الجدول
    } catch (error) {
        console.error("خطأ في الإضافة: ", error);
        alert("حدث خطأ أثناء إضافة المنتج.");
    }
});

// --- 3. حذف منتج ---
window.deleteProduct = async function(id) {
    if (confirm("واش راك متأكد بلي تحب تحذف هذا المنتج؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            loadDashboardData(); // نحدثو الجدول
        } catch (error) {
            console.error("خطأ في الحذف: ", error);
            alert("ما قدرناش نحذفو المنتج.");
        }
    }
}

// --- تشغيل الدالة كي تفتح الصفحة ---
document.addEventListener('DOMContentLoaded', loadDashboardData);
// دالة تحديث حالة الطلب
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: newStatus
        });
        alert("تم تحديث حالة الطلب بنجاح! ✅");
        loadDashboardData(); // نعاودو نعرضو الطلبات باش تبان الحالة الجديدة
    } catch (error) {
        console.error("خطأ في تحديث الحالة: ", error);
        alert("ما قدرناش نحدثو الحالة.");
    }
};