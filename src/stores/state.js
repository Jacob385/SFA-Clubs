export const state = {
  allOrganizations: [],
  filteredOrganizations: [],
  currentQuestion: 1,
  surveyResponses: {}
};

export function hasCompletedSurvey() {
  return !!localStorage.getItem('surveyCompleted');
}
