import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const form = document.getElementById('add-category-form');

// --- 1. عرض التصنيفات ---
async function renderCategories() {
    const tableBody = document.querySelector('#categories-table tbody');
    tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">جاري التحميل...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">لا توجد تصنيفات حالياً.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const category = doc.data();
            const id = doc.id;
            tableBody.innerHTML += `
                <tr>
                    <td>${category.name}</td>
                    <td><button onclick="deleteCategory('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("خطأ: ", error);
        tableBody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:red;">حدث خطأ.</td></tr>';
    }
}

// --- 2. حذف تصنيف ---
window.deleteCategory = async function(id) {
    if (confirm("واش راك متأكد بلي تحب تحذف هذا التصنيف؟")) {
        try {
            await deleteDoc(doc(db, "categories", id));
            renderCategories();
        } catch (error) {
            console.error("خطأ: ", error);
            alert("ما قدرناش نحذفو التصنيف.");
        }
    }
}

// --- 3. إضافة تصنيف جديد ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('c-name').value.trim();

    if (!name) return;

    try {
        await addDoc(collection(db, "categories"), {
            name: name,
            createdAt: new Date()
        });
        alert("تمت إضافة التصنيف! ✅");
        form.reset();
        renderCategories();
    } catch (error) {
        console.error("خطأ: ", error);
        alert("حدث خطأ أثناء الإضافة.");
    }
});

document.addEventListener('DOMContentLoaded', renderCategories);