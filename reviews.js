import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// عرض التقييمات
async function renderReviews() {
    const tableBody = document.querySelector('#reviews-table tbody');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">جاري التحميل...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد تقييمات حالياً.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const r = doc.data();
            const id = doc.id;
            const stars = '⭐'.repeat(r.rating);
            tableBody.innerHTML += `
                <tr>
                    <td>${r.productName}</td>
                    <td>${r.name}</td>
                    <td class="stars">${stars}</td>
                    <td>${r.text}</td>
                    <td>${r.date}</td>
                    <td><button onclick="deleteReview('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("خطأ: ", error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">حدث خطأ.</td></tr>';
    }
}

// حذف تقييم
window.deleteReview = async function(id) {
    if (confirm("واش راك متأكد بلي تحب تحذف هذا التقييم؟")) {
        try {
            await deleteDoc(doc(db, "reviews", id));
            renderReviews();
        } catch (error) {
            console.error("خطأ: ", error);
            alert("ما قدرناش نحذفو التقييم.");
        }
    }
};

document.addEventListener('DOMContentLoaded', renderReviews);