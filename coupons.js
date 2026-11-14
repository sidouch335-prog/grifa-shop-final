import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const form = document.getElementById('add-coupon-form');

// عرض الكوبونات
async function renderCoupons() {
    const tableBody = document.querySelector('#coupons-table tbody');
    tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">جاري التحميل...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">لا توجد كوبونات.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const c = doc.data();
            const id = doc.id;
            tableBody.innerHTML += `
                <tr>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.discount}%</td>
                    <td><button onclick="deleteCoupon('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
    } catch (error) { console.error("خطأ: ", error); }
}

// حذف كوبون
window.deleteCoupon = async function(id) {
    if (confirm("واش راك متأكد؟")) {
        try {
            await deleteDoc(doc(db, "coupons", id));
            renderCoupons();
        } catch (error) { alert("ما قدرناش نحذفو."); }
    }
}

// إضافة كوبون
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const code = document.getElementById('c-code').value.trim().toUpperCase();
    const discount = parseFloat(document.getElementById('c-discount').value);

    if (!code || !discount) return;

    try {
        await addDoc(collection(db, "coupons"), {
            code: code,
            discount: discount,
            createdAt: new Date()
        });
        alert("تمت إضافة الكوبون! ✅");
        form.reset();
        renderCoupons();
    } catch (error) { alert("حدث خطأ."); }
});

document.addEventListener('DOMContentLoaded', renderCoupons);