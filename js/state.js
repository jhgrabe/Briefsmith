const state = {
  currentStep: 1,
  completedSteps: [],
  openTips: [],
  savedBriefs: [],
  savedBriefsPanelOpen: false,
  savedBriefsLoading: false,
  currentBriefId: null,
  fields: {
    name: "",
    description: "",
    stack: "",
    behavior: "",
    outOfScope: "",
    fileStructure: "",
    dataModel: "",
    constraints: "",
    errorHandling: "",
    buildOrder: ""
  }
};

function updateField(key, value) {
  state.fields[key] = value;
  storage.save(state);
  render();
}
