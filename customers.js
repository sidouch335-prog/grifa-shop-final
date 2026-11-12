import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

async function renderCustomers() {
    const tableBody = document.querySelector('#customers-table tbody');
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري التحميل...</td></tr>';

    try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const customersMap = new Map();

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            const phone = order.phone;
            const name = order.name;

            if (customersMap.has(phone)) {
                // إذا كان العميل موجود، نزيدو الطلبية
                const existing = customersMap.get(phone);
                existing.ordersCount += 1;
                existing.totalSpent += order.total || 0;
            } else {
                // إذا كان عميل جديد، نزيدوه
                customersMap.set(phone, {
                    name: name,
                    phone: phone,
                    ordersCount: 1,
                    totalSpent: order.total || 0
                });
            }
        });

        tableBody.innerHTML = '';

        if (customersMap.size === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا يوجد عملاء حالياً.</td></tr>';
            return;
        }

        customersMap.forEach((customer) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${customer.name}</td>
                    <td><a href="tel:${customer.phone}" style="color: var(--primary); text-decoration: none;">${customer.phone}</a></td>
                    <td>${customer.ordersCount}</td>
                    <td style="color: var(--danger); font-weight: bold;">${customer.totalSpent} دج</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("خطأ: ", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">حدث خطأ في جلب البيانات.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', renderCustomers);