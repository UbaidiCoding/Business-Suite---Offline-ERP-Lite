export class Storage {
    constructor() {
        this.initData();
    }

    initData() {
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify([
                { id: 1, name: 'Laptop', category: 'Electronics', price: 50000, stock: 5, sku: 'ELEC001' },
                { id: 2, name: 'Mouse', category: 'Electronics', price: 1500, stock: 50, sku: 'ELEC002' },
                { id: 3, name: 'Keyboard', category: 'Electronics', price: 3000, stock: 30, sku: 'ELEC003' },
                { id: 4, name: 'Monitor', category: 'Electronics', price: 25000, stock: 8, sku: 'ELEC004' },
            ]));
        }

        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }

        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([
                { id: 1, name: 'Ali Ahmad', phone: '03001234567', email: 'ali@example.com', totalPurchases: 0, totalSpent: 0 },
                { id: 2, name: 'Fatima Khan', phone: '03009876543', email: 'fatima@example.com', totalPurchases: 0, totalSpent: 0 },
            ]));
        }

        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                theme: 'light',
                businessName: 'Ubaidi IT Community',
                currency: 'PKR',
                taxRate: 0,
            }));
        }
    }

    // Products
    getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = Math.max(...products.map(p => p.id), 0) + 1;
        product.stock = parseInt(product.stock) || 0;
        product.price = parseFloat(product.price) || 0;
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
    }

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
    }

    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    }

    // Sales
    getSales() {
        return JSON.parse(localStorage.getItem('sales')) || [];
    }

    addSale(sale) {
        sale.id = Math.max(...this.getSales().map(s => s.id), 0) + 1;
        sale.date = sale.date || new Date().toISOString();
        const sales = this.getSales();
        sales.push(sale);
        localStorage.setItem('sales', JSON.stringify(sales));
        return sale;
    }

    getSalesByCustomer(customerId) {
        return this.getSales().filter(s => s.customerId === customerId);
    }

    getSalesByDate(date) {
        return this.getSales().filter(s => new Date(s.date).toDateString() === new Date(date).toDateString());
    }

    // Customers
    getCustomers() {
        return JSON.parse(localStorage.getItem('customers')) || [];
    }

    addCustomer(customer) {
        customer.id = Math.max(...this.getCustomers().map(c => c.id), 0) + 1;
        customer.totalPurchases = 0;
        customer.totalSpent = 0;
        const customers = this.getCustomers();
        customers.push(customer);
        localStorage.setItem('customers', JSON.stringify(customers));
        return customer;
    }

    updateCustomer(id, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            localStorage.setItem('customers', JSON.stringify(customers));
            return customers[index];
        }
    }

    getCustomerById(id) {
        return this.getCustomers().find(c => c.id === id);
    }

    searchCustomers(query) {
        const lower = query.toLowerCase();
        return this.getCustomers().filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.phone.includes(query) ||
            c.email.toLowerCase().includes(lower)
        );
    }

    // Settings
    getSettings() {
        return JSON.parse(localStorage.getItem('settings')) || {};
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        localStorage.setItem('settings', JSON.stringify(newSettings));
        return newSettings;
    }

    // Backup/Restore
    backup() {
        return {
            products: this.getProducts(),
            sales: this.getSales(),
            customers: this.getCustomers(),
            settings: this.getSettings(),
            timestamp: new Date().toISOString(),
        };
    }

    restore(data) {
        if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
        if (data.sales) localStorage.setItem('sales', JSON.stringify(data.sales));
        if (data.customers) localStorage.setItem('customers', JSON.stringify(data.customers));
        if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
    }

    clear() {
        localStorage.clear();
        this.initData();
    }
}

export const storage = new Storage();
