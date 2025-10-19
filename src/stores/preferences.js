import { applyFilters } from '../components/FilterPanel.js';
import { cssEscape } from '../utils/sanitize.js';

const categoryFilters = document.getElementById('categoryFilters');
const sizeFilters = document.getElementById('sizeFilters');
const searchInput = document.getElementById('searchInput');

export function storeFilterPreferences(searchTerm, categories, sizes) {
  const pref = { searchTerm, categories, sizes, timestamp: Date.now() };
  localStorage.setItem('filterPreferences', JSON.stringify(pref));
}
export function loadStoredPreferences() {
  const pref = JSON.parse(localStorage.getItem('filterPreferences') || 'null');
  if (pref) {
    if (Date.now() - pref.timestamp < 24 * 60 * 60 * 1000) {
      searchInput.value = pref.searchTerm || '';
      (pref.categories || []).forEach(cat => {
        const cb = categoryFilters.querySelector(`input[value="${cssEscape(cat)}"]`);
        if (cb) cb.checked = true;
      });
      (pref.sizes || []).forEach(sz => {
        const cb = sizeFilters.querySelector(`input[value="${cssEscape(sz)}"]`);
        if (cb) cb.checked = true;
      });
      applyFilters();
    } else {
      localStorage.removeItem('filterPreferences');
    }
  }
  // Do NOT auto-show or alter the Recommendations tab here.
}
