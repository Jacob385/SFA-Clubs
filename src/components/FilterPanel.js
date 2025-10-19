import { state } from '../stores/state.js';
import { displayOrganizations } from './ClubsGrid.js';
import { storeFilterPreferences } from '../stores/preferences.js';
import { escapeHtml } from '../utils/sanitize.js';
import { debounce } from '../utils/debounce.js';

const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const sizeFilters = document.getElementById('sizeFilters');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

export function populateCategoryFilters() {
  const set = new Set();
  state.allOrganizations.forEach(o => {
    (o.categories || []).forEach(c => set.add(c));
  });
  categoryFilters.innerHTML = '';
  [...set].sort().forEach(category => {
    const label = document.createElement('label');
    label.className = 'filter-checkbox';
    label.innerHTML = `<input type="checkbox" value="${escapeHtml(category)}"> ${escapeHtml(category)}`;
    categoryFilters.appendChild(label);
  });
}

export function applyFilters() {
  const searchTerm = (searchInput.value || '').toLowerCase();
  const selectedCategories = Array.from(categoryFilters.querySelectorAll('input:checked')).map(cb => cb.value);
  const selectedSizes = Array.from(sizeFilters.querySelectorAll('input:checked')).map(cb => cb.value);

  state.filteredOrganizations = state.allOrganizations.filter(org => {
    const matchesSearch = !searchTerm
      || (org.name && org.name.toLowerCase().includes(searchTerm))
      || (org.description && org.description.toLowerCase().includes(searchTerm));
    const matchesCategory = !selectedCategories.length
      || ((org.categories || []).some(c => selectedCategories.includes(c)));
    let matchesSize = !selectedSizes.length;
    if (!matchesSize && typeof org.memberCount !== 'undefined') {
      if (selectedSizes.includes('large') && org.memberCount > 50) matchesSize = true;
      if (selectedSizes.includes('medium') && org.memberCount >= 20 && org.memberCount <= 50) matchesSize = true;
      if (selectedSizes.includes('small') && org.memberCount < 20) matchesSize = true;
    }
    return matchesSearch && matchesCategory && matchesSize;
  });

  displayOrganizations(state.filteredOrganizations);
  storeFilterPreferences(searchTerm, selectedCategories, selectedSizes);
}

export function clearFilters() {
  // Reset search and checkboxes
  searchInput.value = '';
  categoryFilters.querySelectorAll('input').forEach(cb => cb.checked = false);
  sizeFilters.querySelectorAll('input').forEach(cb => cb.checked = false);

  // Clear localStorage survey/recommendation data
  localStorage.removeItem('recommendations');
  localStorage.removeItem('surveyResponses');
  localStorage.removeItem('surveyCompleted');

  // Reset filters and show browse organizations
  state.filteredOrganizations = [...state.allOrganizations];
  displayOrganizations(state.filteredOrganizations);

  // Switch UI tab back to "Browse Organizations"
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const browseTab = document.querySelector('.tab[data-tab="browse"]');
  if (browseTab) browseTab.classList.add('active');
}

export function setupFilterPanel() {
  searchInput.addEventListener('input', debounce(applyFilters, 300));
  applyFiltersBtn.addEventListener('click', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
}
