export function calculateScore(fields) {
  function nonEmptyLines(text) {
    return text.trim().split("\n").filter(function(l) { return l.trim().length > 0; }).length;
  }

  var items = [
    {
      label: "Project name",
      max: 10,
      pass: function() { return fields.name.trim().length > 0; }
    },
    {
      label: "Description (20+ chars)",
      max: 10,
      pass: function() { return fields.description.trim().length > 20; }
    },
    {
      label: "Stack specified",
      max: 10,
      pass: function() { return fields.stack.trim().length > 0; }
    },
    {
      label: "Behavior detail (50+ chars)",
      max: 15,
      pass: function() { return fields.behavior.trim().length > 50; }
    },
    {
      label: "Out of scope (2+ items)",
      max: 10,
      pass: function() { return nonEmptyLines(fields.outOfScope) >= 2; }
    },
    {
      label: "File structure (4+ lines)",
      max: 15,
      pass: function() { return nonEmptyLines(fields.fileStructure) >= 4; }
    },
    {
      label: "Data model (2+ lines)",
      max: 15,
      pass: function() { return nonEmptyLines(fields.dataModel) >= 2; }
    },
    {
      label: "Build order (3+ steps)",
      max: 15,
      pass: function() { return nonEmptyLines(fields.buildOrder) >= 3; }
    }
  ];

  var breakdown = items.map(function(item) {
    return {
      label: item.label,
      points: item.pass() ? item.max : 0,
      max: item.max
    };
  });

  var total = breakdown.reduce(function(sum, item) { return sum + item.points; }, 0);

  return { total: total, breakdown: breakdown };
}
