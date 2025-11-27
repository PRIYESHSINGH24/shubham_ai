/**
 * Smart Kitchen - Main JavaScript
 * Utility functions and event listeners
 */

// Initialize tooltips and popovers (Bootstrap)
document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add smooth animations to tables
    const tables = document.querySelectorAll('table tbody tr');
    tables.forEach((row, index) => {
        row.style.animationDelay = (index * 0.05) + 's';
    });
});

/**
 * Format date to readable format
 */
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('main .container-lg');
    if (container) {
        container.insertAdjacentHTML('afterbegin', toastHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

/**
 * Confirm delete action
 */
function confirmDelete(itemName) {
    return confirm(`Are you sure you want to delete "${itemName}"?`);
}

/**
 * Format number with thousand separators
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Debounce function for search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Live search filter
 */
const liveSearch = debounce(function(query) {
    const rows = document.querySelectorAll('table tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show "no results" message if needed
    if (visibleCount === 0) {
        const table = document.querySelector('table tbody');
        if (table) {
            const emptyRow = table.querySelector('.empty-state') || 
                document.createElement('tr');
            if (!table.querySelector('.empty-state')) {
                emptyRow.className = 'empty-state';
                emptyRow.innerHTML = '<td colspan="7" class="text-center py-4">No items found</td>';
                table.appendChild(emptyRow);
            }
        }
    }
}, 300);

// Attach live search to search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            liveSearch(this.value);
        });
    }
});

/**
 * Export table to CSV
 */
function exportTableToCSV(filename = 'inventory.csv') {
    const table = document.querySelector('table');
    if (!table) return;

    let csv = [];
    
    // Get headers
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
    csv.push(headers.join(','));
    
    // Get rows
    table.querySelectorAll('tbody tr').forEach(row => {
        if (row.style.display !== 'none') { // Skip hidden rows
            const cells = Array.from(row.querySelectorAll('td'))
                .slice(0, -1) // Exclude action column
                .map(td => {
                    let text = td.textContent.trim();
                    // Escape quotes and wrap in quotes if contains comma
                    if (text.includes(',')) {
                        text = `"${text.replace(/"/g, '""')}"`;
                    }
                    return text;
                });
            csv.push(cells.join(','));
        }
    });

    // Create blob and download
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Print friendly view
 */
function printInventory() {
    window.print();
}

/**
 * Sort table by column
 */
function sortTable(columnIndex, order = 'asc') {
    const table = document.querySelector('table tbody');
    const rows = Array.from(table.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent;
        const bValue = b.cells[columnIndex].textContent;

        // Try to parse as number
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return order === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Sort as string
        return order === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });

    // Clear and repopulate
    table.innerHTML = '';
    rows.forEach(row => table.appendChild(row));
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
    // Ctrl+S for search
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Ctrl+A for add item (if on items page)
    if (event.ctrlKey && event.key === 'a') {
        const addBtn = document.querySelector('a[href*="add"]');
        if (addBtn) {
            event.preventDefault();
            addBtn.click();
        }
    }
});

/**
 * Add keyboard hint tooltip to search
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        searchInput.title = 'Tip: Press Ctrl+S to focus search';
    }
});

/**
 * Real-time item count updates
 */
function updateItemCount() {
    const rows = document.querySelectorAll('table tbody tr:not([style*="display: none"])');
    const count = rows.length;
    const countElement = document.querySelector('.item-count');
    if (countElement) {
        countElement.textContent = count + ' item' + (count !== 1 ? 's' : '');
    }
}

// Call on page load and after search
document.addEventListener('DOMContentLoaded', updateItemCount);
document.addEventListener('keyup', updateItemCount);

/**
 * Status badge helper
 */
function getStatusBadge(expired, expiring, lowStock) {
    if (expiredexpired) {
        return '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Expired</span>';
    }
    if (expiring) {
        return '<span class="badge bg-warning"><i class="bi bi-exclamation-circle"></i> Expiring</span>';
    }
    if (lowStock) {
        return '<span class="badge bg-info"><i class="bi bi-exclamation-triangle"></i> Low Stock</span>';
    }
    return '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Good</span>';
}
