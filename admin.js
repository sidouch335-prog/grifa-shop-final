import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// --- 1. عرض الإحصائيات الأساسية ---
async function loadDashboardData() {
    try {
        // جلب المنتجات
        const productsSnapshot = await getDocs(collection(db, "products"));
        document.getElementById('total-products').innerText = productsSnapshot.size;

        // جلب الطلبات
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

// --- 2. عرض الرسوم البيانية ---
async function renderCharts() {
    try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        
        // نجمعو المبيعات والطلبات حسب اليوم (آخر 7 أيام)
        const last7Days = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ar-DZ');
            last7Days[dateStr] = { sales: 0, orders: 0 };
        }

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.date) {
                const datePart = order.date.split(',')[0].trim();
                if (last7Days[datePart]) {
                    last7Days[datePart].sales += order.total || 0;
                    last7Days[datePart].orders += 1;
                }
            }
        });

        const labels = Object.keys(last7Days);
        const salesData = Object.values(last7Days).map(d => d.sales);
        const ordersData = Object.values(last7Days).map(d => d.orders);

        // رسم بياني للمبيعات
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المبيعات',
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