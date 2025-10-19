import { createClubCard } from './ClubCard.js';

export function displayOrganizations(orgs) {
  const container = document.getElementById('clubsContainer');
  container.innerHTML = '';
  if (!orgs.length) {
    container.innerHTML = '<div class="error-message"><p>No organizations found matching your criteria.</p></div>';
    return;
  }
  orgs.forEach(org => {
    const card = createClubCard(org);
    container.appendChild(card);
  });
}

export function displayRecommendations() {
  const container = document.getElementById('clubsContainer');

  const raw = localStorage.getItem('recommendations');
  if (!raw) {
    container.innerHTML = `
      <div class="error-message">
        <p>No recommendations yet. Please complete the survey.</p>
      </div>`;
    return;
  }

  const recs = JSON.parse(raw);
  const top = recs.filter(o => o.score > 0).slice(0, 18);
  if (!top.length) {
    container.innerHTML = `
      <div class="error-message">
        <p>No recommendations yet. Please complete the survey.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  top.forEach(org => {
    const card = createClubCard(org, true);
    container.appendChild(card);
  });
}
