import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// كي تفتح الصفحة، نجيبو المعلومات اللي محفوظين من قبل
document.addEventListener('DOMContentLoaded', async () => {
    const docRef = doc(db, "settings", "store_info");
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('store-name').value = data.name || '';
            document.getElementById('store-phone').value = data.phone || '';
            document.getElementById('store-facebook').value = data.facebook || '';
            document.getElementById('store-instagram').value = data.instagram || '';
        }
    } catch (error) {
        console.error("خطأ في جلب الإعدادات: ", error);
    }
});

// كي تدوس على حفظ
document.getElementById('settings-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('store-name').value;
    const phone = document.getElementById('store-phone').value;
    const facebook = document.getElementById('store-facebook').value;
    const instagram = document.getElementById('store-instagram').value;

    try {
        // نحفظو المعلومات في السحابة
        await setDoc(doc(db, "settings", "store_info"), {
            name: name,
            phone: phone,
            facebook: facebook,
            instagram: instagram
        });
        alert("تم حفظ الإعدادات بنجاح! ☁️");
    } catch (error) {
        console.error("خطأ في حفظ الإعدادات: ", error);
        alert("حدث خطأ أثناء الحفظ.");
    }
});