import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const form = document.getElementById('add-product-form');

// --- 1. عرض المنتجات ---
async function renderAdminProducts() {
    const tableBody = document.querySelector('#products-table tbody');
    tableBody.innerHTML = '<tr><td colspan="4">جاري التحميل...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        tableBody.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            let stock = p.hasVariants ? p.variants.reduce((acc, v) => acc + v.stock, 0) : (p.stock || 0);
            tableBody.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.price} دج</td>
                    <td>${stock}</td>
                    <td><button onclick="deleteProduct('${id}')" class="delete-btn">حذف</button></td>
                </tr>
            `;
        });
    } catch (error) { console.error("خطأ: ", error); }
}

// --- 2. حذف منتج ---
window.deleteProduct = async function(id) {
    if (confirm("واش راك متأكد؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            renderAdminProducts();
        } catch (error) { alert("ما قدرناش نحذفو."); }
    }
}

// --- 3. إضافة منتج جديد ---
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const type = document.getElementById('p-type').value;
    const file = document.getElementById('p-image-file').files[0];
    const hasVariants = document.getElementById('has-variants').value === 'yes';
    const category = document.getElementById('p-category').value;

    if (!file) { alert("خاصك تختار صورة!"); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerText = "جاري الرفع...";
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'grifa_upload'); 
        const response = await fetch('https://api.cloudinary.com/v1_1/vbw7ttog/image/upload', { method: 'POST', body: formData });
        const data = await response.json();
        const imageUrl = data.secure_url;

        let variants = [];
        let totalStock = 0;
        if (hasVariants) {
            document.querySelectorAll('.variant-stock-input').forEach(input => {
                const stock = parseInt(input.value) || 0;
                if (stock > 0) {
                    variants.push({ color: input.getAttribute('data-color'), size: input.getAttribute('data-size'), stock });
                    totalStock += stock;
                }
            });
        } else {
            totalStock = parseInt(document.getElementById('p-stock').value) || 0;
        }

                await addDoc(collection(db, "products"), {
            name, price, type, image: imageUrl, hasVariants,
            stock: hasVariants ? 0 : totalStock, variants,
            category: category, // هنا زدنا التصنيف
            createdAt: new Date()
        });

        alert("تمت الإضافة! ☁️");
        form.reset();
        document.getElementById('variants-container').style.display = 'none';
        document.getElementById('single-stock-group').style.display = 'block';
        renderAdminProducts();
    } catch (error) { alert("حدث خطأ: " + error.message); }
    finally {
        submitBtn.innerText = "إضافة المنتج للمتجر";
        submitBtn.disabled = false;
    }
});

// --- 4. دوال المتغيرات ---
window.toggleVariants = function() {
    const hasVariants = document.getElementById('has-variants').value;
    document.getElementById('single-stock-group').style.display = hasVariants === 'yes' ? 'none' : 'block';
    document.getElementById('variants-container').style.display = hasVariants === 'yes' ? 'block' : 'none';

    // هنا كنخبيو ونبينو المقاسات حسب النوع
    const type = document.getElementById('p-type').value;
    const shirtSizes = document.querySelectorAll('.size-shirt');
    const shoeSizes = document.querySelectorAll('.size-shoes');

    if (type === 'shirt' || type === 'pants') {
        shirtSizes.forEach(btn => btn.style.display = 'inline-block');
        shoeSizes.forEach(btn => btn.style.display = 'none');
    } else if (type === 'shoes') {
        shirtSizes.forEach(btn => btn.style.display = 'none');
        shoeSizes.forEach(btn => btn.style.display = 'inline-block');
    }
};

window.toggleSelection = function(button, type, value) { button.classList.toggle('selected'); };

window.generateVariants = function() {
    const sizeButtons = document.querySelectorAll('.variant-select-btn[onclick*="size"]');
    const colorButtons = document.querySelectorAll('.variant-select-btn[onclick*="color"]');
    const selectedSizes = Array.from(sizeButtons).filter(b => b.classList.contains('selected')).map(b => b.innerText);
    const selectedColors = Array.from(colorButtons).filter(b => b.classList.contains('selected')).map(b => b.innerText);

    if (selectedSizes.length === 0 || selectedColors.length === 0) { alert("اختر مقاس ولون!"); return; }

    const container = document.getElementById('generated-variants-list');
    container.innerHTML = '';

    selectedColors.forEach(color => {
        selectedSizes.forEach(size => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 10px; background: #f9f9f9; padding: 10px; border-radius: 5px;';
            row.innerHTML = `
                <span style="flex: 1; font-weight: bold;">${color} - ${size}</span>
                <input type="number" class="variant-stock-input" data-color="${color}" data-size="${size}" placeholder="الكمية" min="0" value="0" style="width: 100px; padding: 5px;">
            `;
            container.appendChild(row);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    renderAdminProducts();
    loadCategories();
});async function loadCategories() {
    const select = document.getElementById('p-category');
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        select.innerHTML = '<option value="">اختر التصنيف...</option>';
        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    } catch (error) {
        console.error("خطأ في جلب التصنيفات: ", error);
    }
}