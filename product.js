let currentProduct = null;
let selectedSize = 'S';
let selectedColor = 'أسود';

// دالة باش نختارو المقاس ولا اللون
window.selectVariant = function(button, type, value) {
    // نمسحو الـ active من كامل الأزرار في هاد المجموعة
    const parent = button.parentElement;
    parent.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
    // نضيفو الـ active للزر اللي كليكا عليه
    button.classList.add('active');

    if (type === 'size') selectedSize = value;
    if (type === 'color') selectedColor = value;
};

// كي تفتح الصفحة، نجيبو معلومات المنتج
document.addEventListener('DOMContentLoaded', () => {
    const productData = localStorage.getItem('selectedProduct');
    
    if (productData) {
        currentProduct = JSON.parse(productData);
        document.getElementById('p-name').innerText = currentProduct.name;
        document.getElementById('p-price').innerText = currentProduct.price + ' دج';
        document.getElementById('p-image').src = currentProduct.image;

        // --- هنا كنعرضو المقاسات حسب النوع ---
        const sizeContainer = document.getElementById('size-options');
        sizeContainer.innerHTML = ''; // نمسحو المقاسات القديمة

        const type = currentProduct.type || 'shirt'; // إذا ماكانش النوع، نخليوه قميص

        if (type === 'shirt') {
            sizeContainer.innerHTML = `
                <button class="variant-btn active" onclick="selectVariant(this, 'size', 'S')">S</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', 'M')">M</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', 'L')">L</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', 'XL')">XL</button>
            `;
        } else if (type === 'pants') {
            sizeContainer.innerHTML = `
                <button class="variant-btn active" onclick="selectVariant(this, 'size', '38')">38</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '40')">40</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '42')">42</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '44')">44</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '46')">46</button>
            `;
        } else if (type === 'shoes') {
            sizeContainer.innerHTML = `
                <button class="variant-btn active" onclick="selectVariant(this, 'size', '40')">40</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '41')">41</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '42')">42</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '43')">43</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '44')">44</button>
            `;
        } else {
            // إكسسوار: ما كاينش مقاسات
            sizeContainer.innerHTML = '<p style="color:#777;">لا توجد مقاسات لهذا المنتج</p>';
        }

        document.title = currentProduct.name + ' - Grifa Shop';
    } else {
        window.location.href = 'index.html';
    }
});