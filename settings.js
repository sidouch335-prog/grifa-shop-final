import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// جلب الإعدادات
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
            document.getElementById('store-logo').value = data.logo || '';
        }
    } catch (error) { console.error("خطأ: ", error); }
});

// رفع الشعار لـ Cloudinary
window.uploadLogo = async function() {
    const fileInput = document.getElementById('logo-file');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'grifa_upload'); 

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/vbw7ttog/image/upload', { method: 'POST', body: formData });
        const data = await response.json();
        document.getElementById('store-logo').value = data.secure_url;
        alert("تم رفع الشعار بنجاح! يرجى حفظ الإعدادات. ✅");
    } catch (error) {
        console.error("خطأ: ", error);
        alert("حدث خطأ أثناء رفع الشعار.");
    }
};

// حفظ الإعدادات
document.getElementById('settings-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('store-name').value;
    const phone = document.getElementById('store-phone').value;
    const facebook = document.getElementById('store-facebook').value;
    const instagram = document.getElementById('store-instagram').value;
    const logo = document.getElementById('store-logo').value;

    try {
        await setDoc(doc(db, "settings", "store_info"), {
            name: name, phone: phone, facebook: facebook, instagram: instagram, logo: logo
        });
        alert("تم حفظ الإعدادات! ☁️");
    } catch (error) { alert("حدث خطأ."); }
});