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

        // هنا كنعرضو المقاسات حسب النوع
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
            selectedSize = 'S'; // القيمة الافتراضية للقميص
        } else if (type === 'pants') {
            sizeContainer.innerHTML = `
                <button class="variant-btn active" onclick="selectVariant(this, 'size', '38')">38</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '40')">40</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '42')">42</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '44')">44</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '46')">46</button>
            `;
            selectedSize = '38'; // القيمة الافتراضية للسروال
        } else if (type === 'shoes') {
            sizeContainer.innerHTML = `
                <button class="variant-btn active" onclick="selectVariant(this, 'size', '40')">40</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '41')">41</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '42')">42</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '43')">43</button>
                <button class="variant-btn" onclick="selectVariant(this, 'size', '44')">44</button>
            `;
            selectedSize = '40'; // القيمة الافتراضية للحذاء
        } else {
            // إكسسوار: ما كاينش مقاسات
            sizeContainer.innerHTML = '<p style="color:#777;">لا توجد مقاسات لهذا المنتج</p>';
            selectedSize = 'بدون مقاس';
        }

        document.title = currentProduct.name + ' - Grifa Shop';
    } else {
        // إذا ما كاينش منتج، نرجعوه للرئيسية
        window.location.href = 'index.html';
    }
});

// دالة الإضافة للسلة مع المقاس واللون
window.addToCartWithVariants = function() {
    if (!currentProduct) return;

    // نجيبو السلة من الذاكرة
    let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
    
    // نصاوبو اسم خاص بالمنتج مع المقاس واللون
    const fullName = `${currentProduct.name} (${selectedSize} - ${selectedColor})`;
    
    // نشوفو واش كاين نفس المنتج بنفس المقاس واللون
    const existingItem = cart.find(item => item.name === fullName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            name: fullName, 
            price: currentProduct.price, 
            image: currentProduct.image, 
            quantity: 1 
        });
    }

    // نحفظو في الذاكرة
    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    
    // نطلعو إشعار بلي تزاد
      // نطلعو إشعار بلي تزاد
        // نطلعو إشعار بلي تزاد
    const toast = document.createElement('div');
    toast.innerText = `تمت إضافة ${fullName} إلى السلة ✅`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:15px 30px; border-radius:50px; font-weight:bold; z-index:9999;';
    document.body.appendChild(toast);
    
    // نمسحو الإشعار بعد ثانيتين
    setTimeout(() => toast.remove(), 2000);

    // نرجعوه لصفحة السلة بعد ثانية (باش الإشعار يبان)
    setTimeout(() => {
        window.location.href = 'cart.html'; 
    }, 1000);