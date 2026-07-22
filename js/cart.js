export class Cart {
    constructor() {
        this.items = [];
        this.tax = 0;
    }

    addItem(product, quantity = 1) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                product: product,
            });
        }
        return this;
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        return this;
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(productId);
            }
        }
        return this;
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getSubtotal() * (this.tax / 100);
    }

    getTotal() {
        return this.getSubtotal() + this.getTax();
    }

    clear() {
        this.items = [];
        return this;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    toJSON() {
        return {
            items: this.items,
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            total: this.getTotal(),
            itemCount: this.items.length,
        };
    }
}
