import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

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
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        let totalSales = 0;
        let ordersCount = 0;

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            totalSales += order.total || 0;
            ordersCount++;
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

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: image,
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