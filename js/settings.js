import { storage } from './storage.js';

export class Settings {
    renderPage() {
        const settings = storage.getSettings();
        const backup = storage.backup();

        return `
            <div class="py-4">
                <h2 class="mb-4"><i class="bi bi-gear"></i> Settings</h2>

                <div class="row">
                    <div class="col-lg-8">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Business Settings</h5>
                            </div>
                            <form id="settings-form">
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label">Business Name</label>
                                        <input type="text" class="form-control" id="business-name" value="${settings.businessName}">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Currency</label>
                                        <select class="form-select" id="currency">
                                            <option value="PKR" ${settings.currency === 'PKR' ? 'selected' : ''}>Pakistani Rupee (PKR)</option>
                                            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>US Dollar (USD)</option>
                                            <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Euro (EUR)</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Tax Rate (%)</label>
                                        <input type="number" class="form-control" id="tax-rate" value="${settings.taxRate}" min="0" max="100" step="0.01">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Theme</label>
                                        <select class="form-select" id="theme">
                                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <button type="submit" class="btn btn-primary">Save Settings</button>
                                </div>
                            </form>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Data Management</h5>
                            </div>
                            <div class="card-body">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle"></i>
                                    Back up your data regularly to avoid losing important business records.
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-success me-2" id="backup-btn">
                                    <i class="bi bi-download"></i> Backup Data
                                </button>
                                <button class="btn btn-warning me-2" id="restore-btn">
                                    <i class="bi bi-upload"></i> Restore Data
                                </button>
                                <button class="btn btn-danger" id="clear-btn">
                                    <i class="bi bi-exclamation-triangle"></i> Clear All
                                </button>
                                <input type="file" id="restore-file" accept=".json" style="display: none;">
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">System Info</h5>
                            </div>
                            <div class="card-body">
                                <dl class="row">
                                    <dt class="col-sm-6">App Version</dt>
                                    <dd class="col-sm-6">1.0.0</dd>

                                    <dt class="col-sm-6">Storage Used</dt>
                                    <dd class="col-sm-6">${this.getStorageUsage()}</dd>

                                    <dt class="col-sm-6">Last Backup</dt>
                                    <dd class="col-sm-6">${backup.timestamp ? new Date(backup.timestamp).toLocaleString() : 'Never'}</dd>

                                    <dt class="col-sm-6">Products</dt>
                                    <dd class="col-sm-6">${storage.getProducts().length}</dd>

                                    <dt class="col-sm-6">Orders</dt>
                                    <dd class="col-sm-6">${storage.getSales().length}</dd>

                                    <dt class="col-sm-6">Customers</dt>
                                    <dd class="col-sm-6">${storage.getCustomers().length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const kb = (total / 1024).toFixed(2);
        return `${kb} KB`;
    }

    attachEvents(container) {
        // Save settings
        container.querySelector('#settings-form')?.addEventListener('submit', (e) => {
            e.preventDefault();

            storage.updateSettings({
                businessName: container.querySelector('#business-name').value,
                currency: container.querySelector('#currency').value,
                taxRate: parseFloat(container.querySelector('#tax-rate').value) || 0,
                theme: container.querySelector('#theme').value,
            });

            alert('Settings saved!');
        });

        // Backup
        container.querySelector('#backup-btn')?.addEventListener('click', () => {
            const backup = storage.backup();
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `business-suite-backup-${new Date().getTime()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        });

        // Restore
        container.querySelector('#restore-btn')?.addEventListener('click', () => {
            container.querySelector('#restore-file').click();
        });

        container.querySelector('#restore-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        storage.restore(data);
                        alert('Data restored successfully!');
                        this.refresh(container);
                    } catch (err) {
                        alert('Invalid backup file!');
                    }
                };
                reader.readAsText(file);
            }
        });

        // Clear all
        container.querySelector('#clear-btn')?.addEventListener('click', () => {
            if (confirm('This will delete ALL data. This cannot be undone. Continue?')) {
                if (confirm('Are you absolutely sure? This action is irreversible.')) {
                    storage.clear();
                    alert('All data cleared!');
                    this.refresh(container);
                }
            }
        });
    }

    refresh(container) {
        container.innerHTML = this.renderPage();
        this.attachEvents(container);
    }
}
