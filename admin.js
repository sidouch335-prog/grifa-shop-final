import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// --- 1. عرض الإحصائيات الأساسية ---
async function loadDashboardData() {
    try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        document.getElementById('total-products').innerText = productsSnapshot.size;

        const ordersSnapshot = await getDocs(collection(db, "orders"));
        let totalSales = 0;
        
        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            totalSales += order.total || 0;
        });

        document.getElementById('total-orders').innerText = ordersSnapshot.size;
        document.getElementById('total-sales').innerText = totalSales + ' دج';

    } catch (error) {
        console.error("خطأ في جلب البيانات: ", error);
    }
}

// --- 2. عرض الرسوم البيانية (بالبيانات التجريبية) ---
async function renderCharts() {
    try {
        // ⚠️ بيانات تجريبية باش نتأكدو بلي الرسم البياني خدام
        const labels = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];
        const salesData = [0, 5000, 12000, 8000, 15000, 10000, 175266];
        const ordersData = [0, 1, 3, 2, 4, 2, 5];

        // رسم بياني للمبيعات
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المبيعات (دج)',
                    data: salesData,
                    borderColor: '#6B46C1',
                    backgroundColor: 'rgba(107, 70, 193, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // رسم بياني للطلبات
        const ordersCtx = document.getElementById('ordersChart').getContext('2d');
        new Chart(ordersCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'الطلبات',
                    data: ordersData,
                    backgroundColor: '#9F7AEA',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (error) {
        console.error("خطأ في الرسوم: ", error);
    }
}

// --- 3. تشغيل الدوال كي تفتح الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    renderCharts();
});