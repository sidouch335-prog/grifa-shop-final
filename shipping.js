import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// --- 1. أسعار التوصيل (للاستعمال في صفحة الدفع) ---
export const shippingRates = {
    "01": { home: 800, office: 500 }, // أدرار
    "02": { home: 600, office: 350 }, // الشلف
    "03": { home: 700, office: 400 }, // الأغواط
    "04": { home: 600, office: 350 }, // أم البواقي
    "05": { home: 600, office: 350 }, // باتنة
    "06": { home: 500, office: 300 }, // بجاية
    "07": { home: 700, office: 400 }, // بسكرة
    "08": { home: 800, office: 500 }, // بشار
    "09": { home: 400, office: 250 }, // البليدة
    "10": { home: 500, office: 300 }, // البويرة
    "11": { home: 900, office: 600 }, // تمنراست
    "12": { home: 600, office: 350 }, // تبسة
    "13": { home: 600, office: 350 }, // تلمسان
    "14": { home: 500, office: 300 }, // تيارت
    "15": { home: 500, office: 300 }, // تيزي وزو
    "16": { home: 400, office: 250 }, // الجزائر
    "17": { home: 600, office: 350 }, // الجلفة
    "18": { home: 500, office: 300 }, // جيجل
    "19": { home: 500, office: 300 }, // سطيف
    "20": { home: 600, office: 350 }, // سعيدة
    "21": { home: 600, office: 350 }, // سكيكدة
    "22": { home: 600, office: 350 }, // سيدي بلعباس
    "23": { home: 600, office: 350 }, // عنابة
    "24": { home: 600, office: 350 }, // قالمة
    "25": { home: 600, office: 350 }, // قسنطينة
    "26": { home: 500, office: 300 }, // المدية
    "27": { home: 600, office: 350 }, // مستغانم
    "28": { home: 600, office: 350 }, // المسيلة
    "29": { home: 600, office: 350 }, // معسكر
    "30": { home: 700, office: 400 }, // ورقلة
    "31": { home: 600, office: 350 }, // وهران
    "32": { home: 700, office: 400 }, // البيض
    "33": { home: 900, office: 600 }, // إليزي
    "34": { home: 500, office: 300 }, // برج بوعريريج
    "35": { home: 400, office: 250 }, // بومرداس
    "36": { home: 600, office: 350 }, // الطارف
    "37": { home: 900, office: 600 }, // تندوف
    "38": { home: 500, office: 300 }, // تيسمسيلت
    "39": { home: 700, office: 400 }, // الوادي
    "40": { home: 600, office: 350 }, // خنشلة
    "41": { home: 600, office: 350 }, // سوق أهراس
    "42": { home: 400, office: 250 }, // تيبازة
    "43": { home: 500, office: 300 }, // ميلة
    "44": { home: 500, office: 300 }, // عين الدفلى
    "45": { home: 700, office: 400 }, // النعامة
    "46": { home: 600, office: 350 }, // عين تموشنت
    "47": { home: 700, office: 400 }, // غرداية
    "48": { home: 600, office: 350 }, // غليزان
    "49": { home: 800, office: 500 }, // تيميمون
    "50": { home: 900, office: 600 }, // برج باجي مختار
    "51": { home: 700, office: 400 }, // أولاد جلال
    "52": { home: 800, office: 500 }, // بني عباس
    "53": { home: 800, office: 500 }, // عين صالح
    "54": { home: 900, office: 600 }, // عين قزام
    "55": { home: 700, office: 400 }, // تقرت
    "56": { home: 900, office: 600 }, // جانت
    "57": { home: 700, office: 400 }, // المغير
    "58": { home: 700, office: 400 }, // المنيعة
    "default": { home: 800, office: 500 }
};

// --- 2. كود صفحة التوصيل في الداشبورد ---

const form = document.getElementById('add-shipping-form');
const wilayaSelect = document.getElementById('s-wilaya');
const tableBody = document.querySelector('#shipping-table tbody');

// قائمة الولايات للداشبورد
const wilayas = [
    "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة", 
    "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة", 
    "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو", 
    "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة", 
    "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة", 
    "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة", 
    "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس", 
    "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة", 
    "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة", 
    "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار", 
    "51 - أولاد جلال", "52 - بني عباس", "53 - عين صالح", "54 - عين قزام", "55 - تقرت", 
    "56 - جانت", "57 - المغير", "58 - المنيعة"
];

function loadWilayas() {
    if (!wilayaSelect) return;
    wilayas.forEach(w => {
        wilayaSelect.innerHTML += `<option value="${w}">${w}</option>`;
    });
}

async function renderShipping() {
    if (!tableBody) return;
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

if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const wilaya = wilayaSelect.value;
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
}

document.addEventListener('DOMContentLoaded', () => {
    loadWilayas();
    renderShipping();
});