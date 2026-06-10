// Wraps every localStorage call in try/catch.
// If localStorage is unavailable (private browsing, blocked, quota exceeded),
// the app continues in-memory and no error is shown to the user.

var storage = (function() {
  var KEY = "briefsmith_v1";

  function save(state) {
    try {
      // openTips is intentionally excluded — it is never persisted
      var payload = {
        currentStep:    state.currentStep,
        completedSteps: state.completedSteps,
        fields:         state.fields
      };
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch (e) {
      // Storage unavailable — continue in-memory only
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;

      // Merge saved fields over the defaults so new fields added later still get empty strings
      var defaultFields = {
        name: "", description: "", stack: "",
        behavior: "", outOfScope: "",
        fileStructure: "", dataModel: "",
        constraints: "", errorHandling: "",
        buildOrder: ""
      };
      var mergedFields = Object.assign({}, defaultFields, parsed.fields || {});

      return {
        currentStep:    (typeof parsed.currentStep === "number") ? parsed.currentStep : 1,
        completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
        openTips:       [], // always start fresh
        fields:         mergedFields
      };
    } catch (e) {
      return null;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      // Silently ignore
    }
  }

  return { save: save, load: load, clear: clear };
})();
