import { state } from './state.js';
import { APP_TITLE, APP_TAGLINE, STEPS } from './data.js';
import { calculateScore } from './score.js';
import { db } from './db.js';
import { jumpTo } from './steps.js';

export function render() {
  renderHeader();
  renderPills();
  renderFormStep();
  updateTipVisibility();
  renderNavButtons();
  renderPreview();
  renderScore();
  renderDbStatus();
  renderSavedBriefsDrawer();
}

function renderHeader() {
  var titleEl = document.getElementById("app-title");
  var taglineEl = document.getElementById("app-tagline");
  if (titleEl) titleEl.textContent = APP_TITLE;
  if (taglineEl) taglineEl.textContent = APP_TAGLINE;
}

function renderPills() {
  var container = document.getElementById("step-pills");
  if (!container) return;
  container.innerHTML = "";

  STEPS.forEach(function(step) {
    var btn = document.createElement("button");
    btn.type = "button";

    var isDone = state.completedSteps.indexOf(step.id) !== -1;
    var isActive = step.id === state.currentStep;

    var label = document.createElement("span");
    label.className = "pill-number";
    label.textContent = step.id;
    btn.appendChild(label);

    var text = document.createElement("span");
    text.className = "pill-label";
    text.textContent = step.label;
    btn.appendChild(text);

    if (isActive) {
      btn.className = "pill pill-active";
      btn.setAttribute("aria-current", "step");
    } else if (isDone) {
      btn.className = "pill pill-done";
      btn.addEventListener("click", (function(id) {
        return function() { jumpTo(id); };
      })(step.id));
    } else {
      btn.className = "pill pill-future";
      btn.disabled = true;
    }

    container.appendChild(btn);
  });
}

function renderFormStep() {
  var container = document.getElementById("form-area");
  if (!container) return;

  var renderedStep = parseInt(container.dataset.renderedStep, 10) || 0;
  if (renderedStep === state.currentStep) return;
  container.dataset.renderedStep = state.currentStep;

  container.innerHTML = "";

  var step = null;
  for (var i = 0; i < STEPS.length; i++) {
    if (STEPS[i].id === state.currentStep) { step = STEPS[i]; break; }
  }
  if (!step) return;

  var stepHeading = document.createElement("h2");
  stepHeading.className = "step-heading";
  stepHeading.textContent = "Step " + step.id + ": " + step.label;
  container.appendChild(stepHeading);

  step.fields.forEach(function(field) {
    var fieldGroup = document.createElement("div");
    fieldGroup.className = "field-group";

    var label = document.createElement("label");
    label.className = "field-label";
    label.setAttribute("for", "field-" + field.key);
    label.textContent = field.label;
    fieldGroup.appendChild(label);

    var tipRow = document.createElement("div");
    tipRow.className = "tip-row";

    var tipBadge = document.createElement("button");
    tipBadge.type = "button";
    tipBadge.className = "tip-badge";
    tipBadge.dataset.tipToggle = field.key;
    tipBadge.setAttribute("aria-expanded", "false");

    var tipIcon = document.createElement("span");
    tipIcon.className = "tip-icon";
    tipIcon.textContent = "?";
    tipBadge.appendChild(tipIcon);

    var tipText = document.createElement("span");
    tipText.textContent = "why this matters";
    tipBadge.appendChild(tipText);

    tipRow.appendChild(tipBadge);
    fieldGroup.appendChild(tipRow);

    var tipPanel = document.createElement("div");
    tipPanel.id = "tip-" + field.key;
    tipPanel.className = "tip-panel";
    tipPanel.setAttribute("role", "note");
    tipPanel.textContent = step.tip;
    fieldGroup.appendChild(tipPanel);

    var hint = document.createElement("p");
    hint.className = "field-hint";
    hint.textContent = field.hint;
    fieldGroup.appendChild(hint);

    var input;
    if (field.multiline) {
      input = document.createElement("textarea");
      input.rows = 8;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    input.id = "field-" + field.key;
    input.dataset.fieldKey = field.key;
    input.className = "field-input" + (field.monospace ? " monospace" : "");
    input.placeholder = field.placeholder;
    input.value = state.fields[field.key];
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    fieldGroup.appendChild(input);

    container.appendChild(fieldGroup);
  });

  step.callouts.forEach(function(callout) {
    var calloutEl = document.createElement("div");
    calloutEl.className = "callout callout-" + callout.type;

    var iconEl = document.createElement("span");
    iconEl.className = "callout-icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.textContent = callout.type === "warning" ? "⚠" : "✓";

    var textEl = document.createElement("span");
    textEl.className = "callout-text";
    textEl.textContent = callout.text;

    calloutEl.appendChild(iconEl);
    calloutEl.appendChild(textEl);
    container.appendChild(calloutEl);
  });
}

function updateTipVisibility() {
  var step = null;
  for (var i = 0; i < STEPS.length; i++) {
    if (STEPS[i].id === state.currentStep) { step = STEPS[i]; break; }
  }
  if (!step) return;

  step.fields.forEach(function(field) {
    var panel = document.getElementById("tip-" + field.key);
    var badge = document.querySelector("[data-tip-toggle='" + field.key + "']");
    var isOpen = state.openTips.indexOf(field.key) !== -1;

    if (panel) {
      if (isOpen) {
        panel.classList.add("tip-open");
      } else {
        panel.classList.remove("tip-open");
      }
    }
    if (badge) {
      badge.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        badge.classList.add("tip-badge-open");
      } else {
        badge.classList.remove("tip-badge-open");
      }
    }
  });
}

function renderNavButtons() {
  var prevBtn = document.getElementById("btn-prev");
  var nextBtn = document.getElementById("btn-next");

  if (prevBtn) {
    prevBtn.disabled = state.currentStep === 1;
  }

  if (nextBtn) {
    if (state.currentStep === STEPS.length) {
      nextBtn.textContent = "Done ✓";
      nextBtn.className = "btn btn-done";
    } else {
      nextBtn.textContent = "Next →";
      nextBtn.className = "btn btn-primary";
    }
    nextBtn.disabled = false;
  }
}

function renderPreview() {
  var f = state.fields;

  var conceptParts = [];
  if (f.name) conceptParts.push("# " + f.name);
  if (f.description) conceptParts.push(f.description);
  if (f.stack) conceptParts.push("\nStack: " + f.stack);
  setPreviewBlock(
    "preview-concept",
    conceptParts.join("\n"),
    "Project name, description, and stack will appear here."
  );

  var behaviorParts = [];
  if (f.behavior) behaviorParts.push(f.behavior);
  if (f.outOfScope) behaviorParts.push("\nOut of scope:\n" + f.outOfScope);
  setPreviewBlock(
    "preview-behavior",
    behaviorParts.join("\n"),
    "What the app does and what it doesn't do will appear here."
  );

  setPreviewBlock(
    "preview-structure",
    f.fileStructure,
    "File and folder structure will appear here."
  );

  setPreviewBlock(
    "preview-datamodel",
    f.dataModel,
    "Data model will appear here."
  );

  var constraintParts = [];
  if (f.constraints) constraintParts.push(f.constraints);
  if (f.errorHandling) constraintParts.push("\nError handling:\n" + f.errorHandling);
  setPreviewBlock(
    "preview-constraints",
    constraintParts.join("\n"),
    "Constraints and error handling will appear here."
  );

  setPreviewBlock(
    "preview-buildorder",
    f.buildOrder,
    "Build order will appear here."
  );
}

function setPreviewBlock(id, content, emptyText) {
  var el = document.getElementById(id);
  if (!el) return;

  while (el.firstChild) el.removeChild(el.firstChild);

  if (content && content.trim().length > 0) {
    el.classList.remove("preview-block-empty");
    el.textContent = content;
  } else {
    el.classList.add("preview-block-empty");
    var em = document.createElement("em");
    em.textContent = emptyText;
    el.appendChild(em);
  }
}

function renderScore() {
  var result = calculateScore(state.fields);
  var total = result.total;

  var fill = document.getElementById("score-bar-fill");
  var label = document.getElementById("score-label");
  var tag = document.getElementById("score-tag");
  var track = document.querySelector(".score-bar-track");
  if (track) track.setAttribute("aria-valuenow", total);

  var colorClass = total >= 80 ? "score-green" : total >= 50 ? "score-amber" : "score-red";
  var tagText = total >= 80 ? "Ready to use" : total >= 50 ? "Getting there" : "Needs more detail";

  if (fill) {
    fill.style.width = total + "%";
    fill.className = "score-bar-fill " + colorClass;
  }

  if (label) {
    label.textContent = total + " / 100";
    label.className = "score-number " + colorClass;
  }

  if (tag) {
    tag.textContent = tagText;
  }
}

function renderDbStatus() {
  var btn = document.getElementById("btn-save");
  var drawer = document.getElementById("saved-briefs-drawer");

  if (btn) {
    var canSave = db.isReady() && state.fields.name.trim().length > 0;
    btn.disabled = !canSave;
  }

  if (drawer) {
    if (state.savedBriefsPanelOpen) {
      drawer.removeAttribute("hidden");
    } else {
      drawer.setAttribute("hidden", "");
    }
  }
}

function renderSavedBriefsDrawer() {
  var body = document.getElementById("drawer-body");
  if (!body) return;

  while (body.firstChild) body.removeChild(body.firstChild);

  if (state.savedBriefsLoading) {
    var loading = document.createElement("div");
    loading.className = "drawer-loading";
    loading.textContent = "Loading saved briefs…";
    body.appendChild(loading);
    return;
  }

  if (!state.savedBriefs.length) {
    var empty = document.createElement("div");
    empty.className = "drawer-empty";
    empty.textContent = "No saved briefs yet. Fill out a brief and click Save.";
    body.appendChild(empty);
    updateSavedBriefsCount(0);
    return;
  }

  state.savedBriefs.forEach(function(brief) {
    var card = document.createElement("div");
    card.className = "brief-card";

    var header = document.createElement("div");
    header.className = "brief-card-header";

    var titleEl = document.createElement("span");
    titleEl.className = "brief-card-title";
    titleEl.textContent = brief.title;
    header.appendChild(titleEl);

    var scoreBadge = document.createElement("span");
    scoreBadge.className = "brief-card-score" +
      (brief.score >= 80 ? " score-green" : brief.score >= 50 ? " score-amber" : " score-red");
    scoreBadge.textContent = brief.score + "/100";
    header.appendChild(scoreBadge);

    var meta = document.createElement("span");
    meta.className = "brief-card-meta";
    var date = new Date(brief.created_at);
    meta.textContent = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    header.appendChild(meta);

    card.appendChild(header);

    var actions = document.createElement("div");
    actions.className = "brief-card-actions";

    var loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "btn-brief-load";
    loadBtn.textContent = "Load";
    loadBtn.dataset.briefId = brief.id;
    actions.appendChild(loadBtn);

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-brief-delete";
    delBtn.textContent = "Delete";
    delBtn.dataset.deleteBriefId = brief.id;
    actions.appendChild(delBtn);

    card.appendChild(actions);
    body.appendChild(card);
  });

  updateSavedBriefsCount(state.savedBriefs.length);
}

function updateSavedBriefsCount(count) {
  var countEl = document.getElementById("saved-briefs-count");
  if (!countEl) return;
  if (count > 0) {
    countEl.textContent = count;
    countEl.style.display = "";
  } else {
    countEl.style.display = "none";
  }
}

export function forceFormRebuild() {
  var formArea = document.getElementById("form-area");
  if (formArea) formArea.dataset.renderedStep = "0";
}

export function assembleFullPrompt(fields) {
  var parts = [];

  if (fields.name) parts.push("# " + fields.name);
  if (fields.description) parts.push(fields.description);
  if (fields.stack) parts.push("\nStack: " + fields.stack);

  if (fields.behavior) parts.push("\n## Behavior\n\n" + fields.behavior);
  if (fields.outOfScope) parts.push("\n## Out of Scope\n\n" + fields.outOfScope);
  if (fields.fileStructure) parts.push("\n## File Structure\n\n" + fields.fileStructure);
  if (fields.dataModel) parts.push("\n## Data Model\n\n" + fields.dataModel);
  if (fields.constraints) parts.push("\n## Constraints\n\n" + fields.constraints);
  if (fields.errorHandling) parts.push("\n## Error Handling\n\n" + fields.errorHandling);
  if (fields.buildOrder) parts.push("\n## Build Order\n\n" + fields.buildOrder);

  return parts.join("\n");
}
