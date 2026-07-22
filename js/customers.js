import { storage } from './storage.js';

export class Customers {
    constructor() {
        this.searchQuery = '';
    }

    renderPage() {
        const customers = this.searchQuery 
            ? storage.searchCustomers(this.searchQuery)
            : storage.getCustomers();

        return `
            <div class="py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="bi bi-people"></i> Customers</h2>
                    <button class="btn btn-primary" id="add-customer-btn">
                        <i class="bi bi-plus-circle"></i> Add Customer
                    </button>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <input type="text" class="form-control" id="search-input" placeholder="Search by name, phone, or email..." value="${this.searchQuery}">
                    </div>
                </div>

                <div class="row">
                    ${customers.map(c => this.customerCard(c)).join('')}
                </div>

                ${this.modalForm()}
            </div>
        `;
    }

    customerCard(customer) {
        const sales = storage.getSalesByCustomer(customer.id);
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${customer.name}</h5>
                        <p class="card-text text-muted">
                            <i class="bi bi-telephone"></i> ${customer.phone}<br>
                            <i class="bi bi-envelope"></i> ${customer.email}
                        </p>
                        <div class="alert alert-info py-2 px-3 mb-3">
                            <div class="d-flex justify-content-between">
                                <span>Total Purchases:</span>
                                <strong>${sales.length}</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Total Spent:</span>
                                <strong>${this.formatCurrency(customer.totalSpent)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        <button class="btn btn-sm btn-info view-history" data-id="${customer.id}">
                            <i class="bi bi-receipt"></i> History
                        </button>
                        <button class="btn btn-sm btn-warning edit-customer" data-id="${customer.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-customer" data-id="${customer.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    modalForm() {
        return `
            <div class="modal fade" id="customerModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">Add Customer</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="customer-form">
                            <div class="modal-body">
                                <input type="hidden" id="customer-id">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" id="customer-name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-control" id="customer-phone" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="customer-email" required>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="historyModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Purchase History</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="history-content">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents(container) {
        const modal = new bootstrap.Modal(container.querySelector('#customerModal'));
        const historyModal = new bootstrap.Modal(container.querySelector('#historyModal'));

        container.querySelector('#search-input')?.addEventListener('keyup', (e) => {
            this.searchQuery = e.target.value;
            this.refresh(container);
        });

        container.querySelector('#add-customer-btn')?.addEventListener('click', () => {
            container.querySelector('#customer-id').value = '';
            container.querySelector('#customer-form').reset();
            container.querySelector('#modalTitle').textContent = 'Add Customer';
            modal.show();
        });

        container.querySelectorAll('.edit-customer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const customerId = parseInt(e.target.closest('.edit-customer').dataset.id);
                const customer = storage.getCustomerById(customerId);
                
                container.querySelector('#customer-id').value = customer.id;
                container.querySelector('#customer-name').value = customer.name;
                container.querySelector('#customer-phone').value = customer.phone;
                container.querySelector('#customer-email').value = customer.email;
                
                container.querySelector('#modalTitle').textContent = 'Edit Customer';
                modal.show();
            });
        });

        container.querySelectorAll('.delete-customer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const customerId = parseInt(e.target.closest('.delete-customer').dataset.id);
                if (confirm('Delete this customer?')) {
                    // In production, you might want to keep the data for history
                    // For now, we'll just remove it
                    const customers = storage.getCustomers().filter(c => c.id !== customerId);
                    localStorage.setItem('customers', JSON.stringify(customers));
                    this.refresh(container);
                }
            });
        });

        container.querySelectorAll('.view-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const customerId = parseInt(e.target.closest('.view-history').dataset.id);
                const customer = storage.getCustomerById(customerId);
                const sales = storage.getSalesByCustomer(customerId);
                
                let historyHtml = `<h6>${customer.name}</h6>`;
                
                if (sales.length === 0) {
                    historyHtml += '<p class="text-muted">No purchase history</p>';
                } else {
                    historyHtml += '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>';
                    sales.forEach(sale => {
                        const itemCount = sale.items.length;
                        historyHtml += `
                            <tr>
                                <td>${new Date(sale.date).toLocaleDateString()}</td>
                                <td>${itemCount} item(s)</td>
                                <td>${this.formatCurrency(sale.total)}</td>
                            </tr>
                        `;
                    });
                    historyHtml += '</tbody></table></div>';
                }
                
                container.querySelector('#history-content').innerHTML = historyHtml;
                historyModal.show();
            });
        });

        container.querySelector('#customer-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = container.querySelector('#customer-id').value;
            const customer = {
                name: container.querySelector('#customer-name').value,
                phone: container.querySelector('#customer-phone').value,
                email: container.querySelector('#customer-email').value,
            };

            if (id) {
                storage.updateCustomer(parseInt(id), customer);
            } else {
                storage.addCustomer(customer);
            }

            modal.hide();
            this.refresh(container);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    }

    refresh(container) {
        container.innerHTML = this.renderPage();
        this.attachEvents(container);
    }
}
