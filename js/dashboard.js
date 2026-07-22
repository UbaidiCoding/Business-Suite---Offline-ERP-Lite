import { storage } from './storage.js';

export class Dashboard {
    renderPage() {
        const sales = storage.getSales();
        const products = storage.getProducts();
        const customers = storage.getCustomers();
        const settings = storage.getSettings();

        const stats = this.calculateStats(sales, products, customers);

        return `
            <div class="py-4">
                <h2 class="mb-4"><i class="bi bi-house-door"></i> Dashboard</h2>

                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-uppercase opacity-75">Total Revenue</h6>
                                        <h3 class="mb-0">${this.formatCurrency(stats.totalRevenue)}</h3>
                                    </div>
                                    <i class="bi bi-cash-coin" style="font-size: 2rem; opacity: 0.5;"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 mb-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-uppercase opacity-75">Total Orders</h6>
                                        <h3 class="mb-0">${sales.length}</h3>
                                    </div>
                                    <i class="bi bi-box" style="font-size: 2rem; opacity: 0.5;"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 mb-3">
                        <div class="card bg-info text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-uppercase opacity-75">Products</h6>
                                        <h3 class="mb-0">${products.length}</h3>
                                    </div>
                                    <i class="bi bi-grid" style="font-size: 2rem; opacity: 0.5;"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 mb-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title text-uppercase opacity-75">Customers</h6>
                                        <h3 class="mb-0">${customers.length}</h3>
                                    </div>
                                    <i class="bi bi-people" style="font-size: 2rem; opacity: 0.5;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Sales Trend (Last 7 Days)</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="sales-chart" height="80"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Quick Stats</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span>Avg Order Value</span>
                                        <strong>${this.formatCurrency(stats.avgOrderValue)}</strong>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span>Low Stock Items</span>
                                        <strong>${stats.lowStockCount}</strong>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span>Total Inventory Value</span>
                                        <strong>${this.formatCurrency(stats.inventoryValue)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Recent Sales</h5>
                    </div>
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.slice(-10).reverse().map(sale => {
                                    const customer = sale.customerId ? storage.getCustomerById(sale.customerId) : null;
                                    return `
                                        <tr>
                                            <td>${new Date(sale.date).toLocaleString()}</td>
                                            <td>${sale.items.length} item(s)</td>
                                            <td>${customer ? customer.name : 'Walk-in'}</td>
                                            <td><strong>${this.formatCurrency(sale.total)}</strong></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    calculateStats(sales, products, customers) {
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
        const lowStockCount = products.filter(p => p.stock < 10).length;
        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        return { totalRevenue, avgOrderValue, lowStockCount, inventoryValue };
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    attachEvents(container) {
        const sales = storage.getSales();
        const last7Days = this.getLast7Days();

        const dailyRevenue = last7Days.map(day => {
            const daySales = sales.filter(s => s.date.split('T')[0] === day);
            return daySales.reduce((sum, s) => sum + s.total, 0);
        });

        const ctx = container.querySelector('#sales-chart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Daily Revenue (PKR)',
                        data: dailyRevenue,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        tension: 0.4,
                        fill: true,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    }

    refresh(container) {
        container.innerHTML = this.renderPage();
        this.attachEvents(container);
    }
}
