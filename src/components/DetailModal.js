import { escapeHtml } from '../utils/sanitize.js';

const ImageAPILink = "https://sfasu-cdn.presence.io/organization-photos/8317246b-60de-41af-9823-4a35504099d4/";
const clubDetailModal = document.getElementById('clubDetailModal');
const clubDetailContent = document.getElementById('clubDetailContent');

export function showClubDetails(org) {
  const imageUrl = org.photoUri ? (ImageAPILink + org.photoUri) : 'placeholder.jpg';
  clubDetailContent.innerHTML = `
    <div class="club-detail-header">
      <img src="${imageUrl}" alt="${escapeHtml(org.name)}" class="club-detail-image" onerror="this.src='placeholder.jpg'">
      <div class="club-detail-info">
        <h2>${escapeHtml(org.name)}</h2>
        <div class="club-detail-meta">
          <div class="meta-item"><span>${Number(org.memberCount||0)} members</span></div>
          ${org.meetingTime ? `<div class="meta-item"><span>Meets: ${escapeHtml(org.meetingTime)}</span></div>` : ''}
          ${org.meetingLocation ? `<div class="meta-item"><span>Location: ${escapeHtml(org.meetingLocation)}</span></div>` : ''}
        </div>
        <div class="club-categories">
          ${(org.categories && org.categories.length
            ? org.categories.map(c => `<span class="category-tag">${escapeHtml(c)}</span>`).join('')
            : '<span class="category-tag">Uncategorized</span>')}
        </div>
      </div>
    </div>
    <div class="club-detail-description">
      <h3>About</h3>
      <p>${escapeHtml(org.description || 'No description available.')}</p>
    </div>
    <button class="join-button" onclick="window.open('https://sfasu.presence.io/organization/${encodeURIComponent(org.uri||'')}', '_blank')">
      Join This Organization
    </button>
  `;
  clubDetailModal.style.display = 'block';
}
