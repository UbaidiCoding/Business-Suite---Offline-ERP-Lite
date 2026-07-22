import { storage } from './storage.js';

export class Inventory {
    renderPage() {
        const products = storage.getProducts();
        const lowStock = products.filter(p => p.stock < 10);

        return `
            <div class="py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="bi bi-box"></i> Inventory</h2>
                    <button class="btn btn-primary" id="add-product-btn">
                        <i class="bi bi-plus-circle"></i> Add Product
                    </button>
                </div>

                ${lowStock.length > 0 ? `
                    <div class="alert alert-warning" role="alert">
                        <i class="bi bi-exclamation-triangle"></i>
                        <strong>${lowStock.length} products</strong> have low stock levels
                    </div>
                ` : ''}

                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => {
                                const stockStatus = p.stock === 0 ? 'danger' : p.stock < 10 ? 'warning' : 'success';
                                const statusText = p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock';
                                return `
                                    <tr>
                                        <td><strong>${p.name}</strong></td>
                                        <td>${p.category}</td>
                                        <td><code>${p.sku}</code></td>
                                        <td>${this.formatCurrency(p.price)}</td>
                                        <td>${p.stock}</td>
                                        <td><span class="badge bg-${stockStatus}">${statusText}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-warning edit-product" data-id="${p.id}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                ${this.modalForm()}
            </div>
        `;
    }

    modalForm() {
        return `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">Add Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="product-form">
                            <div class="modal-body">
                                <input type="hidden" id="product-id">
                                <div class="mb-3">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control" id="product-name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <input type="text" class="form-control" id="product-category" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">SKU</label>
                                    <input type="text" class="form-control" id="product-sku" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Price (PKR)</label>
                                    <input type="number" class="form-control" id="product-price" step="0.01" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Stock Quantity</label>
                                    <input type="number" class="form-control" id="product-stock" min="0" required>
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
        `;
    }

    attachEvents(container) {
        const modal = new bootstrap.Modal(container.querySelector('#productModal'));

        container.querySelector('#add-product-btn')?.addEventListener('click', () => {
            container.querySelector('#product-id').value = '';
            container.querySelector('#product-form').reset();
            container.querySelector('#modalTitle').textContent = 'Add Product';
            modal.show();
        });

        container.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.edit-product').dataset.id);
                const product = storage.getProductById(productId);
                
                container.querySelector('#product-id').value = product.id;
                container.querySelector('#product-name').value = product.name;
                container.querySelector('#product-category').value = product.category;
                container.querySelector('#product-sku').value = product.sku;
                container.querySelector('#product-price').value = product.price;
                container.querySelector('#product-stock').value = product.stock;
                
                container.querySelector('#modalTitle').textContent = 'Edit Product';
                modal.show();
            });
        });

        container.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.delete-product').dataset.id);
                if (confirm('Delete this product?')) {
                    storage.deleteProduct(productId);
                    this.refresh(container);
                }
            });
        });

        container.querySelector('#product-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = container.querySelector('#product-id').value;
            const product = {
                name: container.querySelector('#product-name').value,
                category: container.querySelector('#product-category').value,
                sku: container.querySelector('#product-sku').value,
                price: parseFloat(container.querySelector('#product-price').value),
                stock: parseInt(container.querySelector('#product-stock').value),
            };

            if (id) {
                storage.updateProduct(parseInt(id), product);
            } else {
                storage.addProduct(product);
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
