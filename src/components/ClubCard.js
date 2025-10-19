import { showClubDetails } from './DetailModal.js';
import { escapeHtml } from '../utils/sanitize.js';

const ImageAPILink = "https://sfasu-cdn.presence.io/organization-photos/8317246b-60de-41af-9823-4a35504099d4/";

export function createClubCard(org, includeScore = false) {
  const el = document.createElement('div');
  el.className = 'club-card';
  el.addEventListener('click', () => showClubDetails(org));
  const imageUrl = org.photoUri ? (ImageAPILink + org.photoUri) : 'placeholder.jpg';

  let nameHtml = `<h3 class="club-name">${escapeHtml(org.name)}`;
  if (includeScore && org.score !== undefined) {
    nameHtml += ` <span class="recommendation-badge">Score: ${Math.round(org.score)}</span>`;
  }
  nameHtml += '</h3>';

  el.innerHTML = `
    <img src="${imageUrl}" alt="${escapeHtml(org.name)}" class="club-image" onerror="this.src='placeholder.jpg'">
    <div class="club-info">
      ${nameHtml}
      <div class="club-categories">
        ${(org.categories && org.categories.length
          ? org.categories.map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('')
          : '<span class="category-tag">Uncategorized</span>')}
      </div>
      <div class="club-members">${Number(org.memberCount || 0)} members</div>
      <p class="club-description">${escapeHtml(org.description || 'No description available.')}</p>
    </div>`;
  return el;
}

