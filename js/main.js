import { storage } from './storage.js';
import { state } from './state.js';
import { updateField } from './state.js';
import { render, forceFormRebuild, assembleFullPrompt } from './render.js';
import { db } from './db.js';
import { calculateScore } from './score.js';
import { toggleTip, next, prev, startOver, toggleSavedBriefsPanel } from './steps.js';

document.addEventListener("DOMContentLoaded", function() {

  // ── 1. Restore saved draft ──────────────────────────────────────────────

  var saved = storage.load();
  if (saved) {
    state.currentStep    = saved.currentStep;
    state.completedSteps = saved.completedSteps;
    state.fields         = saved.fields;
    state.openTips       = [];
  }

  // ── 1b. Restore dark mode preference ────────────────────────────────────

  if (localStorage.getItem("briefsmith_dark") === "1") {
    document.documentElement.setAttribute("data-theme", "dark");
    var dmBtn = document.getElementById("btn-dark-mode");
    if (dmBtn) dmBtn.textContent = "☀";
  }

  // ── 2. Initial render ───────────────────────────────────────────────────

  render();

  // ── 3. Form input — event delegation on the form container ─────────────

  var formArea = document.getElementById("form-area");

  formArea.addEventListener("input", function(e) {
    var key = e.target.dataset.fieldKey;
    if (key) updateField(key, e.target.value);
  });

  // ── 4. "Why this matters" badge click (also delegated) ─────────────────

  formArea.addEventListener("click", function(e) {
    var badge = e.target.closest("[data-tip-toggle]");
    if (badge) {
      var fieldKey = badge.dataset.tipToggle;
      toggleTip(fieldKey);
    }
  });

  // ── 5. Navigation buttons ───────────────────────────────────────────────

  document.getElementById("btn-prev").addEventListener("click", function() {
    prev();
  });

  document.getElementById("btn-next").addEventListener("click", function() {
    next();
  });

  // ── 6. Copy button ──────────────────────────────────────────────────────

  document.getElementById("btn-copy").addEventListener("click", function() {
    copyPrompt();
  });

  // ── 7. Start over ───────────────────────────────────────────────────────

  document.getElementById("start-over").addEventListener("click", function(e) {
    e.preventDefault();
    startOver();
  });

  // ── 8. Supabase init ─────────────────────────────────────────────────────

  db.init();

  // ── 8b. Dark mode toggle ──────────────────────────────────────────────────

  document.getElementById("btn-dark-mode").addEventListener("click", function() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      this.textContent = "🌙";
      localStorage.setItem("briefsmith_dark", "0");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      this.textContent = "☀";
      localStorage.setItem("briefsmith_dark", "1");
    }
  });

  // ── 9. Save brief ────────────────────────────────────────────────────────

  document.getElementById("btn-save").addEventListener("click", function() {
    saveBrief();
  });

  // ── 10. Toggle saved briefs panel ────────────────────────────────────────

  document.getElementById("btn-saved-briefs").addEventListener("click", function() {
    toggleSavedBriefsPanel();
  });

  // ── 11. Close drawer ─────────────────────────────────────────────────────

  document.getElementById("btn-close-drawer").addEventListener("click", function() {
    state.savedBriefsPanelOpen = false;
    render();
  });

  // ── 12. Drawer action delegation (load / delete) ─────────────────────────

  document.getElementById("drawer-body").addEventListener("click", function(e) {
    var loadBtn = e.target.closest("[data-brief-id]");
    if (loadBtn) {
      loadBriefIntoForm(loadBtn.dataset.briefId);
      return;
    }
    var delBtn = e.target.closest("[data-delete-brief-id]");
    if (delBtn) {
      confirmDeleteBrief(delBtn.dataset.deleteBriefId);
    }
  });

});

// ── Save brief ───────────────────────────────────────────────────────────────

function saveBrief() {
  var btn = document.getElementById("btn-save");
  var statusEl = document.getElementById("save-status");

  btn.disabled = true;
  btn.textContent = "Saving…";

  var score = calculateScore(state.fields).total;
  var op = state.currentBriefId
    ? db.updateBrief(state.currentBriefId, state.fields, score)
    : db.saveCurrentBrief(state.fields, score);

  op.then(function(saved) {
    btn.textContent = "Save brief";
    btn.disabled = !db.isReady();
    if (state.currentBriefId) {
      state.savedBriefs = state.savedBriefs.map(function(b) {
        return b.id === saved.id ? saved : b;
      });
    } else {
      state.currentBriefId = saved.id;
      state.savedBriefs.unshift(saved);
    }
    if (statusEl) {
      statusEl.textContent = "Saved!";
      statusEl.style.color = "";
      setTimeout(function() { statusEl.textContent = ""; }, 2500);
    }
    render();
  }).catch(function() {
    btn.textContent = "Save brief";
    btn.disabled = !db.isReady();
    if (statusEl) {
      statusEl.textContent = "Could not save — try again.";
      statusEl.style.color = "var(--err)";
      setTimeout(function() {
        statusEl.textContent = "";
        statusEl.style.color = "";
      }, 3000);
    }
  });
}

function loadBriefIntoForm(briefId) {
  var brief = null;
  for (var i = 0; i < state.savedBriefs.length; i++) {
    if (state.savedBriefs[i].id === briefId) { brief = state.savedBriefs[i]; break; }
  }
  if (!brief) return;

  var hasContent = Object.values(state.fields).some(function(v) { return v.trim().length > 0; });
  if (hasContent && !window.confirm("Load this brief? Your current unsaved draft will be lost.")) return;

  var defaults = { name:"", description:"", stack:"", behavior:"", outOfScope:"", fileStructure:"", dataModel:"", constraints:"", errorHandling:"", buildOrder:"" };
  state.fields = Object.assign({}, defaults, brief.fields);
  state.currentStep = 1;
  state.completedSteps = [1, 2, 3, 4, 5];
  state.openTips = [];
  state.savedBriefsPanelOpen = false;
  state.currentBriefId = brief.id;

  forceFormRebuild();
  storage.save(state);
  render();
}

function confirmDeleteBrief(briefId) {
  if (!window.confirm("Delete this brief? This cannot be undone.")) return;

  db.deleteBrief(briefId).then(function(ok) {
    if (ok) {
      state.savedBriefs = state.savedBriefs.filter(function(b) { return b.id !== briefId; });
      render();
    }
  });
}

// ── Copy prompt ───────────────────────────────────────────────────────────────

function copyPrompt() {
  var btn = document.getElementById("btn-copy");
  var errorEl = document.getElementById("copy-error");
  var text = assembleFullPrompt(state.fields);

  if (!text.trim()) {
    if (errorEl) {
      errorEl.textContent = "Nothing to copy yet — fill in at least one field.";
      errorEl.style.display = "block";
      setTimeout(function() { errorEl.style.display = ""; }, 2500);
    }
    return;
  }

  navigator.clipboard.writeText(text).then(function() {
    var original = btn.textContent;
    btn.textContent = "Copied!";
    if (errorEl) errorEl.style.display = "";
    setTimeout(function() {
      btn.textContent = original;
    }, 1500);
  }).catch(function() {
    if (errorEl) {
      errorEl.textContent = "Could not copy — try selecting the text manually.";
      errorEl.style.display = "block";
      setTimeout(function() { errorEl.style.display = ""; }, 3500);
    }
  });
}
