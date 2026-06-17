import { state } from './state.js';
import { STEPS } from './data.js';
import { storage } from './storage.js';
import { render, forceFormRebuild } from './render.js';
import { db } from './db.js';

export function next() {
  var current = state.currentStep;

  if (state.completedSteps.indexOf(current) === -1) {
    state.completedSteps.push(current);
  }

  if (current < STEPS.length) {
    state.currentStep = current + 1;
  }

  state.openTips = [];
  forceFormRebuild();
  storage.save(state);
  render();
}

export function prev() {
  if (state.currentStep > 1) {
    state.currentStep--;
    state.openTips = [];
    forceFormRebuild();
    storage.save(state);
    render();
  }
}

export function jumpTo(stepId) {
  if (state.completedSteps.indexOf(stepId) === -1) return;
  if (stepId === state.currentStep) return;

  state.currentStep = stepId;
  state.openTips = [];
  forceFormRebuild();
  storage.save(state);
  render();
}

export function toggleTip(fieldKey) {
  var idx = state.openTips.indexOf(fieldKey);
  if (idx === -1) {
    state.openTips.push(fieldKey);
  } else {
    state.openTips.splice(idx, 1);
  }
  render();
}

export function startOver() {
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

export function toggleSavedBriefsPanel() {
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
