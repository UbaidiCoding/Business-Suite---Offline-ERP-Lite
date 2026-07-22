import { storage } from './storage.js';

export class Analytics {
    constructor() {
        this.period = 'monthly';
    }

    renderPage() {
        const sales = storage.getSales();
        const products = storage.getProducts();

        return `
            <div class="py-4">
                <h2 class="mb-4"><i class="bi bi-bar-chart"></i> Analytics</h2>

                <div class="card mb-4">
                    <div class="card-body">
                        <div class="btn-group" role="group">
                            <input type="radio" class="btn-check" name="period" id="period-daily" value="daily" ${this.period === 'daily' ? 'checked' : ''}>
                            <label class="btn btn-outline-primary" for="period-daily">Daily</label>

                            <input type="radio" class="btn-check" name="period" id="period-weekly" value="weekly" ${this.period === 'weekly' ? 'checked' : ''}>
                            <label class="btn btn-outline-primary" for="period-weekly">Weekly</label>

                            <input type="radio" class="btn-check" name="period" id="period-monthly" value="monthly" ${this.period === 'monthly' ? 'checked' : ''}>
                            <label class="btn btn-outline-primary" for="period-monthly">Monthly</label>

                            <input type="radio" class="btn-check" name="period" id="period-yearly" value="yearly" ${this.period === 'yearly' ? 'checked' : ''}>
                            <label class="btn btn-outline-primary" for="period-yearly">Yearly</label>
                        </div>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-lg-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Revenue Trend</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="revenue-chart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Top Products</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="products-chart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Total Orders</h6>
                                <h3 class="mb-0">${sales.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Total Revenue</h6>
                                <h3 class="mb-0">${this.formatCurrency(sales.reduce((sum, s) => sum + s.total, 0))}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Avg Order Value</h6>
                                <h3 class="mb-0">${this.formatCurrency(sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    groupDataByPeriod(sales, period) {
        const grouped = {};

        sales.forEach(sale => {
            const date = new Date(sale.date);
            let key;

            if (period === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `Week of ${weekStart.toLocaleDateString()}`;
            } else if (period === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'yearly') {
                key = date.getFullYear().toString();
            }

            if (!grouped[key]) {
                grouped[key] = 0;
            }
            grouped[key] += sale.total;
        });

        return Object.entries(grouped).sort().reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }

    getTopProducts(sales) {
        const productSales = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = 0;
                }
                productSales[item.name] += item.quantity;
            });
        });

        return Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    attachEvents(container) {
        const sales = storage.getSales();

        container.querySelectorAll('input[name="period"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.period = e.target.value;
                this.refresh(container);
            });
        });

        const groupedData = this.groupDataByPeriod(sales, this.period);
        const labels = Object.keys(groupedData);
        const data = Object.values(groupedData);

        // Revenue chart
        const revenueCtx = container.querySelector('#revenue-chart')?.getContext('2d');
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Revenue (PKR)',
                        data,
                        backgroundColor: '#0d6efd',
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatCurrency(value),
                            },
                        },
                    },
                },
            });
        }

        // Top products chart
        const topProducts = this.getTopProducts(sales);
        const productsCtx = container.querySelector('#products-chart')?.getContext('2d');
        if (productsCtx && topProducts.length > 0) {
            new Chart(productsCtx, {
                type: 'doughnut',
                data: {
                    labels: topProducts.map(p => p[0]),
                    datasets: [{
                        data: topProducts.map(p => p[1]),
                        backgroundColor: [
                            '#0d6efd',
                            '#198754',
                            '#ffc107',
                            '#dc3545',
                            '#0dcaf0',
                        ],
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            });
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    }

    refresh(container) {
        container.innerHTML = this.renderPage();
        this.attachEvents(container);
    }
}
