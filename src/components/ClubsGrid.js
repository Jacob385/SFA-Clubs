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

  let recs;
  try {
    recs = JSON.parse(raw);
  } catch (error) {
    console.error('Error parsing recommendations:', error);
    container.innerHTML = `
      <div class="error-message">
        <p>Error loading recommendations. Please try again.</p>
      </div>`;
    return;
  }
  
  // Sort by score in descending order to ensure proper ranking
  const top = recs.filter(o => o && o.score > 0).sort((a, b) => b.score - a.score).slice(0, 18);
  if (!top.length) {
    container.innerHTML = `
      <div class="error-message">
        <p>No recommendations yet. Please complete the survey.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  top.forEach((org, index) => {
    // Create rankInfo object for proper color coding
    const rankInfo = {
      rank: index + 1, // 1-based ranking
      totalCount: top.length
    };
    const card = createClubCard(org, true, rankInfo);
    container.appendChild(card);
  });
}


