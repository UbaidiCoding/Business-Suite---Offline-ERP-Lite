import { storage } from './storage.js';
import { Cart } from './cart.js';

export class POS {
    constructor() {
        this.cart = new Cart();
        this.selectedCustomer = null;
    }

    renderPage() {
        const products = storage.getProducts();
        const settings = storage.getSettings();
        
        return `
            <div class="py-4">
                <h2 class="mb-4"><i class="bi bi-credit-card"></i> Point of Sale</h2>
                
                <div class="row gap-3">
                    <div class="col-lg-8">
                        <div class="card mb-4">
                            <div class="card-body">
                                <input type="text" class="form-control" id="product-search" placeholder="Search products by name or SKU...">
                            </div>
                        </div>

                        <div class="row" id="products-container">
                            ${products.map(p => this.productCard(p)).join('')}
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card sticky-top">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">Shopping Cart</h5>
                            </div>
                            <div class="card-body">
                                <div id="cart-items" class="mb-3" style="max-height: 400px; overflow-y: auto;">
                                    ${this.cart.isEmpty() ? '<p class="text-muted">Cart is empty</p>' : this.renderCart()}
                                </div>
                                
                                <hr>
                                
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>${this.formatCurrency(this.cart.getSubtotal())}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Tax:</span>
                                        <span>${this.formatCurrency(this.cart.getTax())}</span>
                                    </div>
                                    <div class="d-flex justify-content-between fw-bold fs-5">
                                        <span>Total:</span>
                                        <span>${this.formatCurrency(this.cart.getTotal())}</span>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Customer (Optional)</label>
                                    <select class="form-select" id="customer-select">
                                        <option value="">Walk-in Customer</option>
                                        ${storage.getCustomers().map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                    </select>
                                </div>

                                <button class="btn btn-success w-100 mb-2" id="checkout-btn" ${this.cart.isEmpty() ? 'disabled' : ''}>
                                    <i class="bi bi-check-circle"></i> Checkout
                                </button>
                                <button class="btn btn-outline-danger w-100" id="clear-cart-btn">
                                    <i class="bi bi-trash"></i> Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    productCard(product) {
        const stockClass = product.stock === 0 ? 'text-danger' : product.stock < 10 ? 'text-warning' : 'text-success';
        
        return `
            <div class="col-sm-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h6 class="card-title">${product.name}</h6>
                        <p class="card-text text-muted small">${product.category}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fw-bold">${this.formatCurrency(product.price)}</span>
                            <span class="badge bg-secondary ${stockClass}">Stock: ${product.stock}</span>
                        </div>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control qty-input" value="1" min="1" max="${product.stock}" data-product-id="${product.id}">
                            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCart() {
        return this.cart.items.map(item => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">${this.formatCurrency(item.price)} each</small>
                        </div>
                        <button class="btn btn-sm btn-close" data-remove-item="${item.id}"></button>
                    </div>
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary qty-decrease" data-product-id="${item.id}">−</button>
                        <input type="number" class="form-control text-center cart-qty" value="${item.quantity}" data-product-id="${item.id}" readonly>
                        <button class="btn btn-outline-secondary qty-increase" data-product-id="${item.id}">+</button>
                    </div>
                    <div class="text-end mt-2">
                        <strong>${this.formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachEvents(container) {
        // Product search
        container.querySelector('#product-search')?.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = container.querySelectorAll('[class*="col-"]');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
        });

        // Add to cart
        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart').dataset.productId);
                const quantity = parseInt(e.target.closest('.card').querySelector('.qty-input').value);
                const product = storage.getProductById(productId);
                this.cart.addItem(product, quantity);
                this.refresh(container);
            });
        });

        // Cart quantity buttons
        container.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const item = this.cart.items.find(i => i.id === productId);
                if (item) {
                    this.cart.updateQuantity(productId, item.quantity - 1);
                    this.refresh(container);
                }
            });
        });

        container.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const item = this.cart.items.find(i => i.id === productId);
                if (item && item.quantity < item.product.stock) {
                    this.cart.updateQuantity(productId, item.quantity + 1);
                    this.refresh(container);
                }
            });
        });

        // Remove item
        container.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.removeItem);
                this.cart.removeItem(productId);
                this.refresh(container);
            });
        });

        // Clear cart
        container.querySelector('#clear-cart-btn')?.addEventListener('click', () => {
            if (confirm('Clear cart?')) {
                this.cart.clear();
                this.refresh(container);
            }
        });

        // Checkout
        container.querySelector('#checkout-btn')?.addEventListener('click', () => {
            this.checkout(container);
        });
    }

    checkout(container) {
        const customerId = container.querySelector('#customer-select')?.value;
        const sale = {
            items: this.cart.items,
            subtotal: this.cart.getSubtotal(),
            tax: this.cart.getTax(),
            total: this.cart.getTotal(),
            customerId: customerId ? parseInt(customerId) : null,
            date: new Date().toISOString(),
        };

        storage.addSale(sale);

        // Update stock
        this.cart.items.forEach(item => {
            const product = storage.getProductById(item.id);
            storage.updateProduct(item.id, { stock: product.stock - item.quantity });
        });

        // Update customer if selected
        if (customerId) {
            const customer = storage.getCustomerById(parseInt(customerId));
            storage.updateCustomer(parseInt(customerId), {
                totalPurchases: customer.totalPurchases + 1,
                totalSpent: customer.totalSpent + sale.total,
            });
        }

        this.printReceipt(sale);
        this.cart.clear();
        this.refresh(container);
        alert('Sale completed successfully!');
    }

    printReceipt(sale) {
        const settings = storage.getSettings();
        const printContent = `
            <html>
                <head>
                    <style>
                        body { font-family: monospace; width: 80mm; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .items { margin-bottom: 20px; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .total { border-top: 1px dashed; border-bottom: 1px dashed; padding: 10px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h3>${settings.businessName}</h3>
                        <p>${new Date(sale.date).toLocaleString()}</p>
                    </div>
                    <div class="items">
                        ${sale.items.map(item => `
                            <div class="item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>${this.formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total">
                        <div class="item">
                            <span>Subtotal:</span>
                            <span>${this.formatCurrency(sale.subtotal)}</span>
                        </div>
                        <div class="item">
                            <span>Tax:</span>
                            <span>${this.formatCurrency(sale.tax)}</span>
                        </div>
                        <div class="item" style="font-size: 16px;">
                            <span>TOTAL:</span>
                            <span>${this.formatCurrency(sale.total)}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Thank you for your purchase!</p>
                    </div>
                </body>
            </html>
        `;

        const win = window.open('', '', 'width=400,height=600');
        win.document.write(printContent);
        win.print();
        win.close();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    }

    refresh(container) {
        container.innerHTML = this.renderPage();
        this.attachEvents(container);
    }
}
