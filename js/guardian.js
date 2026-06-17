const FUNCTIONS_BASE = "https://ejkkgkuruaozgrzpbdzy.supabase.co/functions/v1";

function fetchTechNews() {
  return fetch(FUNCTIONS_BASE + "/get-tech-news")
    .then(function(r) { return r.json(); })
    .then(function(data) { return data.articles || []; })
    .catch(function() { return []; });
}

function searchArticles(query) {
  return fetch(FUNCTIONS_BASE + "/search-articles?q=" + encodeURIComponent(query))
    .then(function(r) { return r.json(); })
    .then(function(data) { return data.articles || []; })
    .catch(function() { return []; });
}

function renderArticles(articles) {
  var container = document.getElementById("inspiration-results");
  if (!container) return;

  if (!articles.length) {
    container.innerHTML = '<p class="inspiration-empty">No articles found.</p>';
    return;
  }

  container.innerHTML = articles.map(function(a) {
    var date = a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
    var summary = a.summary ? '<p class="article-summary">' + a.summary + '</p>' : "";
    return (
      '<a class="article-card" href="' + a.url + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="article-date">' + date + "</span>" +
        '<span class="article-title">' + a.title + "</span>" +
        summary +
      "</a>"
    );
  }).join("");
}

export function initGuardian() {
  var input     = document.getElementById("inspiration-input");
  var button    = document.getElementById("btn-inspiration-search");
  var container = document.getElementById("inspiration-results");

  if (!input || !button || !container) return;

  fetchTechNews().then(renderArticles);

  function runSearch() {
    var q = input.value.trim();
    if (!q) return;
    container.innerHTML = '<p class="inspiration-loading">Searching…</p>';
    searchArticles(q).then(renderArticles);
  }

  button.addEventListener("click", runSearch);
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") runSearch();
  });
}
