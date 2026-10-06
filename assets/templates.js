/* Template Library filter: hides template sections that don't match the query. */
(function () {
  var input = document.getElementById("tpl-q");
  if (!input) return;
  var sections = Array.prototype.slice.call(document.querySelectorAll("section.tpl"));
  var count = document.getElementById("tpl-count");
  var empty = document.getElementById("tpl-empty");
  var groups = Array.prototype.slice.call(document.querySelectorAll("article h2"));

  function apply() {
    var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    sections.forEach(function (s) {
      var hay = (s.getAttribute("data-tags") + " " + s.textContent).toLowerCase();
      var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; });
      s.hidden = !ok;
      if (ok) shown++;
    });
    // Hide a group heading when none of its templates are visible.
    groups.forEach(function (h) {
      var el = h.nextElementSibling, any = false;
      while (el && el.tagName !== "H2") {
        if (el.matches("section.tpl") && !el.hidden) any = true;
        el = el.nextElementSibling;
      }
      h.hidden = !any;
    });
    if (count) count.textContent = terms.length ? shown + " of " + sections.length : sections.length + " templates";
    if (empty) empty.hidden = shown !== 0;
  }

  input.addEventListener("input", apply);
  apply();
})();
