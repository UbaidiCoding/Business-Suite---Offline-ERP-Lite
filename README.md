# Business Suite - Offline ERP Lite

A modern, fully functional offline-first business management system built with vanilla JavaScript, Bootstrap 5, and LocalStorage.

**Founder:** Samiullah Samejo  
**Company:** Ubaidi IT Community  
**Email:** devsamiubaidi@gmail.com

## 🚀 Quick Start

1. Extract `business-suite.zip`
2. Open `index.html` in your browser (works offline)
3. Login with:
   - **Username:** user
   - **Password:** 1234

## ✨ Features

### 📊 Dashboard
- Real-time revenue tracking
- Sales trend chart (last 7 days)
- Quick stats: inventory value, low stock alerts
- Recent sales history

### 🛒 Point of Sale (POS)
- Product search by name/SKU
- Shopping cart with quantity controls
- Checkout with optional customer selection
- Receipt printing
- Automatic stock deduction
- Tax calculation

### 📦 Inventory Management
- Add/Edit/Delete products
- Real-time stock tracking
- Low stock alerts
- Category organization
- SKU management

### 👥 Customers
- Add customer details
- Purchase history tracking
- Search by name/phone/email
- Total purchases & spending metrics
- Customer relationship management

### 📈 Analytics
- Daily/Weekly/Monthly/Yearly revenue trends
- Top products chart
- Order analytics
- Revenue insights

### ⚙️ Settings
- Business configuration
- Currency selection (PKR, USD, EUR)
- Tax rate settings
- Theme preferences
- **Data Backup/Restore** (JSON export/import)
- System information

## 🔧 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules)
- **UI Framework:** Bootstrap 5
- **Charts:** Chart.js
- **Icons:** Bootstrap Icons
- **Storage:** LocalStorage (expandable to IndexedDB)
- **Architecture:** Modular OOP pattern

## 📁 Project Structure

```
business-suite/
├── index.html           # Main entry point
├── css/
│   └── style.css       # Styling
├── js/
│   ├── app.js          # Core application logic
│   ├── storage.js      # Data persistence layer
│   ├── dashboard.js    # Dashboard module
│   ├── pos.js          # POS module
│   ├── inventory.js    # Inventory module
│   ├── customers.js    # Customers module
│   ├── analytics.js    # Analytics module
│   ├── settings.js     # Settings module
│   └── cart.js         # Shopping cart utility
└── assets/
    ├── images/
    └── icons/
```

## 💾 Data Persistence

All data is stored in browser's LocalStorage. Upgrade path to IndexedDB available.

### Stored Data:
- Products (with stock tracking)
- Sales transactions
- Customers
- Settings

## 📤 Backup & Restore

1. Go to **Settings**
2. Click **"Backup Data"** to download JSON file
3. Click **"Restore Data"** to upload previous backup

Backups are timestamped and contain all business data.

## 🎨 Customization

### Change Business Name:
Settings → Business Settings → Business Name

### Add Tax Rate:
Settings → Business Settings → Tax Rate (%)

### Switch Theme:
Settings → Business Settings → Theme (Light/Dark)

### Add Products:
Inventory → Add Product

### Modify Currency:
Settings → Business Settings → Currency

## 🔐 Authentication

Demo mode with hardcoded credentials. For production, implement:
- Backend authentication
- JWT tokens
- Role-based access control
- User management

## 📊 Sample Data

The app comes pre-loaded with:
- 4 sample products (Electronics category)
- 2 sample customers
- Demo transactions (optional)

Delete and add your own data as needed.

## 🚀 Features Ready to Implement

- [ ] MultiUser support with roles
- [ ] Expense tracking
- [ ] Discount management
- [ ] Payment methods
- [ ] Invoice generation
- [ ] Email/SMS notifications
- [ ] Cloud sync
- [ ] Mobile app version
- [ ] Advanced reporting

## 🐛 Known Limitations

- Offline only (no cloud sync)
- Browser LocalStorage limit (~5-10MB)
- No multi-device sync
- Single user per browser

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 support

## 💡 Tips

1. **Export regularly:** Backup your data weekly
2. **Browser clear data warning:** Clearing browser cache will delete all data
3. **Large datasets:** Use browser DevTools > Application > LocalStorage to monitor storage
4. **Print receipts:** POS automatically opens print dialog
5. **Search:** Most pages support real-time search

## 🔄 Migration to Backend

To migrate to a server:

1. Replace `storage.js` with API calls
2. Implement backend with Node.js/Python/Java
3. Add database (PostgreSQL/MongoDB)
4. Implement authentication
5. Add multi-user support

## 📧 Support

For issues or questions:
- Email: devsamiubaidi@gmail.com
- GitHub: github.com/UbaidiCoding

## 📄 License

Built by Ubaidi IT Community - All Rights Reserved

---

**Version:** 1.0.0  
**Last Updated:** July 2026  
**Built with:** ❤️ for Pakistani business owners
