import { displayOrganizations, displayRecommendations } from './ClubsGrid.js';
import { state, hasCompletedSurvey } from '../stores/state.js';

export function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const container = document.getElementById('clubsContainer');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      if (this.dataset.tab === 'recommendations') 
        {
        // If survey not completed, show a message instead of being blank
        if (!hasCompletedSurvey()) {
          container.innerHTML = `
            <div class="error-message">
              <p>No recommendations yet. Please complete the survey.</p>
            </div>`;
          return;
        }
        displayRecommendations();
      } else {
        displayOrganizations(state.filteredOrganizations);
      }
    });
  });
}
