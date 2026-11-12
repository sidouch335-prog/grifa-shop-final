let currentProduct = null;
let selectedColor = null;
let selectedSize = null;

// دالة اختيار اللون
window.selectColor = function(button, color) {
    const parent = button.parentElement;
    parent.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedColor = color;
};

// دالة اختيار المقاس
window.selectSize = function(button, size) {
    const parent = button.parentElement;
    parent.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    selectedSize = size;
};

// كي تفتح الصفحة، نجيبو معلومات المنتج
document.addEventListener('DOMContentLoaded', () => {
    const productData = localStorage.getItem('selectedProduct');
    
    if (productData) {
        currentProduct = JSON.parse(productData);
        
        // نعرضو المعلومات الأساسية
        document.getElementById('p-name').innerText = currentProduct.name;
        document.getElementById('p-price').innerText = currentProduct.price + ' دج';
        document.getElementById('p-image').src = currentProduct.image || 'https://via.placeholder.com/500';

        // نعرضو الألوان والمقاسات
        const colorContainer = document.getElementById('color-options');
        const sizeContainer = document.getElementById('size-options');
        
        colorContainer.innerHTML = '';
        sizeContainer.innerHTML = '';

        if (currentProduct.variants && currentProduct.variants.length > 0) {
            // نجيبو الألوان الفريدة
            const colors = [...new Set(currentProduct.variants.map(v => v.color))];
            // نجيبو المقاسات الفريدة
            const sizes = [...new Set(currentProduct.variants.map(v => v.size))];

            // نعرضو الألوان
            colors.forEach(color => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn';
                btn.innerText = color;
                btn.onclick = () => selectColor(btn, color);
                colorContainer.appendChild(btn);
            });

            // نعرضو المقاسات
            sizes.forEach(size => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn';
                btn.innerText = size;
                btn.onclick = () => selectSize(btn, size);
                sizeContainer.appendChild(btn);
            });
        } else {
            colorContainer.innerHTML = '<p style="color:#777;">لا توجد ألوان</p>';
            sizeContainer.innerHTML = '<p style="color:#777;">لا توجد مقاسات</p>';
        }

        document.title = currentProduct.name + ' - Grifa Shop';
    } else {
        window.location.href = 'index.html';
    }
});

// دالة الإضافة للسلة
window.addToCartWithVariants = function() {
    if (!currentProduct) return;

    if (!selectedColor || !selectedSize) {
        alert("خاصك تختار اللون والمقاس!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('grifa_cart')) || [];
    const fullName = `${currentProduct.name} (${selectedSize} - ${selectedColor})`;
    
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

    localStorage.setItem('grifa_cart', JSON.stringify(cart));
    
    const toast = document.createElement('div');
    toast.innerText = `تمت إضافة ${fullName} إلى السلة ✅`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:15px 30px; border-radius:50px; font-weight:bold; z-index:9999;';
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
    setTimeout(() => {
        window.location.href = 'cart.html'; 
    }, 1000);
};