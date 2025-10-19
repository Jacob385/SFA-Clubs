import { state } from '../stores/state.js';
import { calculateScore } from '../recommendations/scoring.js';
import { displayRecommendations } from '../components/ClubsGrid.js';

const prevQuestionBtn = document.getElementById('prevQuestion');
const nextQuestionBtn = document.getElementById('nextQuestion');
const submitQuestionnaireBtn = document.getElementById('submitQuestionnaire');
const progressBar = document.getElementById('progressBar');
const questionnaireModal = document.getElementById('questionnaireModal');


  // Helpers (dedupe + keys)
function orgKey(org) {
  const uri = (org?.uri || '').trim().toLowerCase();
  if (uri) return `uri:${uri}`;
  const id = (org?.id || '').toString().trim().toLowerCase();
  if (id) return `id:${id}`;
  const name = (org?.name || '').trim().toLowerCase();
  return `name:${name}`;
}

function dedupeByKey(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = orgKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}


// Questionnaire UI wiring
export function attachOptionHandlers() {
  document.querySelectorAll('#questionnaire .options-grid').forEach(grid => {
    const isMulti = grid.getAttribute('data-multi') === 'true';
    grid.querySelectorAll('.option-card').forEach(opt => {
      opt.addEventListener('click', () => {
        if (isMulti) {
          opt.classList.toggle('selected');
        } else {
          grid.querySelectorAll('.option-card').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        }
      });
    });
  });
}

export function showQuestion(n) {
  document.querySelectorAll('.question').forEach(q => q.style.display = 'none');
  const el = document.getElementById(`q${n}`);
  if (el) el.style.display = 'block';
  prevQuestionBtn.style.display = n > 1 ? 'block' : 'none';
  nextQuestionBtn.style.display = n < 10 ? 'block' : 'none';
  submitQuestionnaireBtn.style.display = n === 10 ? 'block' : 'none';
  const pct = Math.round((n - 1) / 9 * 100);
  progressBar.style.width = pct + '%';
}

export function nextQuestion() {
  if (state.currentQuestion < 10) {
    saveQuestionResponse(state.currentQuestion);
    state.currentQuestion++;
    showQuestion(state.currentQuestion);
  }
}

export function prevQuestion() {
  if (state.currentQuestion > 1) {
    state.currentQuestion--;
    showQuestion(state.currentQuestion);
  }
}


//Response collection
function getSelectedValues(qId) 
{
  const grid = document.querySelector(`#${qId} .options-grid`);
  if (!grid) return [];
  return Array.from(grid.querySelectorAll('.option-card.selected')).map(o => o.dataset.value);
}

function getSelectedSingle(qId) 
{
  const vals = getSelectedValues(qId);
  return vals[0] || null;
}

function saveQuestionResponse(qNum) {
  switch (qNum) {
    case 1:  state.surveyResponses.primaryInterests = getSelectedValues('q1'); break;
    case 2:  state.surveyResponses.academicFocus   = (document.getElementById('academicFocus').value || '').trim(); break;
    case 3:  state.surveyResponses.activityPrefs   = getSelectedValues('q3'); break;
    case 4:  state.surveyResponses.culturalFocus   = getSelectedValues('q4'); break;
    case 5:  state.surveyResponses.spiritual       = getSelectedSingle('q5'); break;
    case 6:  state.surveyResponses.sizePreference  = getSelectedSingle('q6'); break;
    case 7:  state.surveyResponses.greekInterest   = getSelectedSingle('q7'); break;
    case 8:  state.surveyResponses.meetingStructure= getSelectedSingle('q8'); break;
    case 9:  state.surveyResponses.passion         = getSelectedSingle('q9'); break;
    case 10: state.surveyResponses.outcomes        = getSelectedValues('q10'); break;
  }
}


//Submit + Score 

export function submitQuestionnaire() {
  saveQuestionResponse(state.currentQuestion);

  // Score all orgs
  let scored = state.allOrganizations.map(org => ({
    ...org,
    score: calculateScore(org, state.surveyResponses)
  }));

  // Sort then dedupe (dedupe preserves first/highest score)
  scored.sort((a, b) => b.score - a.score);
  scored = dedupeByKey(scored);

  // Persist
  localStorage.setItem('recommendations', JSON.stringify(scored));
  localStorage.setItem('surveyResponses', JSON.stringify(state.surveyResponses));
  localStorage.setItem('surveyCompleted', '1');

  // Navigate to recommendations
  questionnaireModal.style.display = 'none';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="recommendations"]').classList.add('active');
  displayRecommendations();
}
