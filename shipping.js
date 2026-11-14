import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const form = document.getElementById('add-shipping-form');

// دالة جلب الولايات (بلا ما نعاودو نكتبو 58 ولاية، نقدرو نستعملو ليستة جاهزة)
const wilayas = ["01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة", "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة", "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو", "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة", "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة", "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة", "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس", "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة", "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة", "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار", "51 - أولاد جلال", "52 - بني عباس", "53 - عين صالح", "54 - عين قزام", "55 - تقرت", "56 - جانت", "57 - المغير", "58 - المنيعة"];

// نعرضو الولايات في القائمة
function loadWilayas() {
    const select = document.getElementById('s-wilaya');
    wilayas.forEach(w => {
        select.innerHTML += `<option value="${w}">${w}</option>`;
    });
}

// عرض التوصيلات
async function renderShipping() {
    const tableBody = document.querySelector('#shipping-table tbody');
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري التحميل...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "shipping"));
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد توصيلات مضافة.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const s = doc.data();
            const id = doc.id;
            tableBody.innerHTML += `
                <tr>
                    <td>${s.wilaya}</td>
                    <td>${s.homePrice} دج</td>
                    <td>${s.officePrice} دج</td>
                    <td><button onclick="deleteShipping('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("خطأ: ", error);
    }
}

window.deleteShipping = async function(id) {
    if (confirm("واش راك متأكد؟")) {
        try {
            await deleteDoc(doc(db, "shipping", id));
            renderShipping();
        } catch (error) { alert("ما قدرناش نحذفو."); }
    }
}

// إضافة توصيل جديد
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const wilaya = document.getElementById('s-wilaya').value;
    const homePrice = parseFloat(document.getElementById('s-home-price').value);
    const officePrice = parseFloat(document.getElementById('s-office-price').value);

    try {
        await addDoc(collection(db, "shipping"), {
            wilaya, homePrice, officePrice
        });
        alert("تمت الإضافة! ✅");
        form.reset();
        renderShipping();
    } catch (error) { alert("حدث خطأ."); }
});

document.addEventListener('DOMContentLoaded', () => {
    loadWilayas();
    renderShipping();
});