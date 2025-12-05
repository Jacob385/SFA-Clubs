import { loadOrganizations } from './api/organizations.js';
import { setupTabs } from './components/Tabs.js';
import { setupFilterPanel } from './components/FilterPanel.js';
import { loadStoredPreferences } from './stores/preferences.js';
import { state } from './stores/state.js';
import { showQuestion, attachOptionHandlers, nextQuestion, prevQuestion, submitQuestionnaire, clearSurveyForm } from './questionnaire/Questionnaire.js';
import { displayOrganizations } from './components/ClubsGrid.js';

document.addEventListener('DOMContentLoaded', () => {
  // No clearing on page load, we clear when Refresh is clicked
  loadOrganizations();
  setupTabs();
  setupFilterPanel();
  loadStoredPreferences();
});

// Close modals on clicking X or outside
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('clubDetailModal').style.display = 'none';
    document.getElementById('questionnaireModal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('clubDetailModal')) {
    document.getElementById('clubDetailModal').style.display = 'none';
  }
  if (e.target === document.getElementById('questionnaireModal')) {
    document.getElementById('questionnaireModal').style.display = 'none';
  }
});

const takeSurveyBtn = document.getElementById('takeSurveyBtn');
const questionnaireModal = document.getElementById('questionnaireModal');
const nextQuestionBtn = document.getElementById('nextQuestion');
const prevQuestionBtn = document.getElementById('prevQuestion');
const submitQuestionnaireBtn = document.getElementById('submitQuestionnaire');

// Open survey modal
takeSurveyBtn.addEventListener('click', () => {
  questionnaireModal.style.display = 'block';
  state.currentQuestion = 1;
  showQuestion(state.currentQuestion);
  attachOptionHandlers();
});

//  Refresh Data: clear recs + switch to Browse + reload orgs
document.getElementById('refreshDataBtn').addEventListener('click', () => {
  // Clear all survey/recommendation data from localStorage
  localStorage.removeItem('recommendations');
  localStorage.removeItem('surveyResponses');
  localStorage.removeItem('surveyCompleted');

  // Clear the survey form (inputs, selections, etc.)
  clearSurveyForm();

  // Close questionnaire modal if it's open
  if (questionnaireModal) {
    questionnaireModal.style.display = 'none';
  }

  // Switch tab UI to "Browse Organizations"
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const browseTab = document.querySelector('.tab[data-tab="browse"]');
  if (browseTab) browseTab.classList.add('active');

  // Immediately render browse view (so UI flips right away)
  displayOrganizations(state.filteredOrganizations);

  // Then refresh organizations from the API
  loadOrganizations();
});

// Questionnaire navigation
nextQuestionBtn.addEventListener('click', nextQuestion);
prevQuestionBtn.addEventListener('click', prevQuestion);
submitQuestionnaireBtn.addEventListener('click', submitQuestionnaire);
