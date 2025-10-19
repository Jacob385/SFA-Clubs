import { displayOrganizations } from '../components/ClubsGrid.js';
import { populateCategoryFilters } from '../components/FilterPanel.js';
import { state } from '../stores/state.js';
import { escapeHtml } from '../utils/sanitize.js';

const APILink = "https://api.presence.io/sfasu/v1/organizations";


//Build a stable deduplication key for an organization.
//Priority: uri → id → name (normalized).
function orgKey(org) {
  const uri = (org?.uri || '').trim().toLowerCase();
  if (uri) return `uri:${uri}`;
  const id = (org?.id || '').toString().trim().toLowerCase();
  if (id) return `id:${id}`;
  const name = (org?.name || '').trim().toLowerCase();
  return `name:${name}`;
}


//Return a new array with duplicates removed based on orgKey().
function dedupeOrganizations(list = []) {
  const seen = new Set();
  const unique = [];
  for (const org of list) {
    const key = orgKey(org);
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(org);
    }
  }
  return unique;
}

export async function loadOrganizations() {
  const container = document.getElementById('clubsContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const res = await fetch(APILink, { cache: "no-store" });
    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    const unique = dedupeOrganizations(Array.isArray(data) ? data : []);

    state.allOrganizations = unique;
    state.filteredOrganizations = [...unique];

    displayOrganizations(state.allOrganizations);
    populateCategoryFilters();
  } catch (err) {
    container.innerHTML = `
      <div class="error-message">
        <p>Failed to load organizations.</p>
        <p>Error: ${escapeHtml(err.message)}</p>
      </div>`;
    console.error(err);
  }
}

