import { storage } from './storage.js';
import { Dashboard } from './dashboard.js';
import { POS } from './pos.js';
import { Inventory } from './inventory.js';
import { Customers } from './customers.js';
import { Analytics } from './analytics.js';
import { Settings } from './settings.js';

class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.modules = {
            dashboard: new Dashboard(),
            pos: new POS(),
            inventory: new Inventory(),
            customers: new Customers(),
            analytics: new Analytics(),
            settings: new Settings(),
        };
    }

    init() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showApp();
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.querySelector('#login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login(
                document.querySelector('#username').value,
                document.querySelector('#password').value
            );
        });

        // Sidebar navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('[data-page]').dataset.page;
                this.navigateTo(page);
            });
        });

        // Logout
        document.querySelector('#logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    login(username, password) {
        // Simple demo authentication
        if (username === 'user' && password === '1234') {
            const user = { username, loginTime: new Date().toISOString() };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser = user;
            this.showApp();
        } else {
            alert('Invalid credentials. Demo: user / 1234');
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.querySelector('#login-page').classList.remove('d-none');
        document.querySelector('#main-app').classList.add('d-none');
    }

    showApp() {
        document.querySelector('#login-page').classList.add('d-none');
        document.querySelector('#main-app').classList.remove('d-none');
        document.querySelector('#user-info').textContent = `Welcome, ${this.currentUser.username}`;
        this.navigateTo('dashboard');
    }

    navigateTo(page) {
        this.currentPage = page;
        this.renderPage();
        this.updateNavigation();
    }

    renderPage() {
        const content = document.querySelector('#page-content');
        const module = this.modules[this.currentPage];

        if (module) {
            content.innerHTML = module.renderPage();
            module.attachEvents(content);
        }
    }

    updateNavigation() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === this.currentPage);
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
