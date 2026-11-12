import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// --- 1. عرض الطلبات ---
async function renderOrders() {
    const tableBody = document.querySelector('#orders-table tbody');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">جاري التحميل...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد طلبات حالياً.</td></tr>';
            return;
        }

        querySnapshot.forEach((document) => {
            const order = document.data();
            const id = document.id;
            let itemsList = order.items ? order.items.map(item => `<li>${item.name} (${item.price} دج)</li>`).join('') : 'غير محدد';
            
            let statusText = order.status || "قيد الانتظار";
            let statusClass = "status-pending";
            if (statusText === "تم التأكيد") statusClass = "status-confirmed";
            if (statusText === "تم الشحن") statusClass = "status-shipped";
            if (statusText === "تم التوصيل") statusClass = "status-delivered";

            tableBody.innerHTML += `
                <tr>
                    <td>${order.name}</td>
                    <td><a href="tel:${order.phone}" style="color: var(--primary); text-decoration: none;">${order.phone}</a></td>
                    <td>${order.wilaya} - ${order.address}</td>
                    <td><ul style="font-size:12px; padding-right:15px;">${itemsList}</ul></td>
                    <td style="color: var(--danger); font-weight: bold;">${order.total} دج</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <select class="action-select" onchange="updateOrderStatus('${id}', this.value)">
                            <option value="قيد الانتظار" ${statusText === 'قيد الانتظار' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="تم التأكيد" ${statusText === 'تم التأكيد' ? 'selected' : ''}>تم التأكيد</option>
                            <option value="تم الشحن" ${statusText === 'تم الشحن' ? 'selected' : ''}>تم الشحن</option>
                            <option value="تم التوصيل" ${statusText === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("خطأ في جلب الطلبات: ", error);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">حدث خطأ في الاتصال.</td></tr>';
    }
}

// --- 2. تحديث حالة الطلب ---
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        alert("تم تحديث حالة الطلب بنجاح! ✅");
        renderOrders(); // نحدثو الجدول
    } catch (error) {
        console.error("خطأ: ", error);
        alert("ما قدرناش نحدثو الحالة.");
    }
};

document.addEventListener('DOMContentLoaded', renderOrders);