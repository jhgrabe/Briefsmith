// Step navigation — never reads/writes DOM directly, only mutates state then calls render()

function next() {
  var current = state.currentStep;

  // Mark this step as completed (idempotent)
  if (state.completedSteps.indexOf(current) === -1) {
    state.completedSteps.push(current);
  }

  if (current < STEPS.length) {
    state.currentStep = current + 1;
  }
  // On the last step "Done" just marks it complete and stays

  // Clear open tips on step change — tips are not persisted
  state.openTips = [];

  // Force form rebuild by clearing the DOM's cached step
  forceFormRebuild();

  storage.save(state);
  render();
}

function prev() {
  if (state.currentStep > 1) {
    state.currentStep--;
    state.openTips = [];
    forceFormRebuild();
    storage.save(state);
    render();
  }
}

function jumpTo(stepId) {
  // Can only jump to a step that has been completed
  if (state.completedSteps.indexOf(stepId) === -1) return;
  if (stepId === state.currentStep) return;

  state.currentStep = stepId;
  state.openTips = [];
  forceFormRebuild();
  storage.save(state);
  render();
}

function toggleTip(fieldKey) {
  var idx = state.openTips.indexOf(fieldKey);
  if (idx === -1) {
    state.openTips.push(fieldKey);
  } else {
    state.openTips.splice(idx, 1);
  }
  // openTips is NOT persisted to localStorage — do not call storage.save here
  render();
}

function startOver() {
  state.currentStep = 1;
  state.completedSteps = [];
  state.openTips = [];
  state.currentBriefId = null;

  var keys = Object.keys(state.fields);
  for (var i = 0; i < keys.length; i++) {
    state.fields[keys[i]] = "";
  }

  forceFormRebuild();
  storage.clear();
  render();
}

// Clears the DOM data attribute that render() uses to decide whether to rebuild.
// Call before render() whenever the step changes.
function forceFormRebuild() {
  var formArea = document.getElementById("form-area");
  if (formArea) formArea.dataset.renderedStep = "0";
}

function toggleSavedBriefsPanel() {
  state.savedBriefsPanelOpen = !state.savedBriefsPanelOpen;
  if (state.savedBriefsPanelOpen) {
    loadAndRenderSavedBriefs();
  } else {
    render();
  }
}

function loadAndRenderSavedBriefs() {
  state.savedBriefsLoading = true;
  render();
  db.loadSavedBriefs().then(function(briefs) {
    state.savedBriefs = briefs;
    state.savedBriefsLoading = false;
    render();
  }).catch(function() {
    state.savedBriefs = [];
    state.savedBriefsLoading = false;
    render();
  });
}
