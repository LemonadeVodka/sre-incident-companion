/* Postmortem writer: fill the form, get blameless Markdown. Draft is kept in this browser only. */
(function () {
  "use strict";
  var form = document.getElementById("pm-form");
  if (!form) return;
  var out = document.getElementById("pm-output");
  var KEY = "nimbus-pm-draft";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ } }
  function data() {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) d[el.name] = el.value; });
    return d;
  }
  function lines(s) { return String(s || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function bullets(s, empty) { var l = lines(s); return l.length ? l.map(function (x) { return "- " + x; }).join("\n") : "- " + empty; }

  function markdown(d) {
    var actions = lines(d.actions).map(function (l) {
      var p = l.split("|").map(function (x) { return x.trim(); });
      return "| " + (p[0] || "") + " | " + (p[1] || "") + " | " + (p[2] || "") + " | " + (p[3] || "") + " |";
    });
    var ratings = ["detection", "triage", "coordination", "communication", "escalation", "mitigation", "postmortem"].map(function (k) {
      return "| " + k.charAt(0).toUpperCase() + k.slice(1) + " | " + (d["r_" + k] || "—") + " |";
    });
    return [
      "# Postmortem: " + (d.title || "[Title]"),
      "",
      "**Severity:** " + (d.sev || "—") + "  ·  **Date:** " + (d.date || "—") + "  ·  **Duration:** " + (d.duration || "—"),
      "**Coordinator (NOC):** " + (d.ic || "—") + "  ·  **Technical Lead (SRE):** " + (d.tl || "—") + "  ·  **Authors:** " + (d.authors || "—"),
      "**Status:** Draft  ·  *Blameless: we describe what happened and why it made sense at the time.*",
      "",
      "## Summary",
      d.summary || "[Two or three sentences a senior manager can read.]",
      "",
      "## User Impact",
      d.impact || "[Who was affected, how badly, for how long — in numbers.]",
      "",
      "## Detection",
      d.detection || "[How did we find out? Alert, NOC sweep, CFT, or customer? How long after it started?]",
      "",
      "## Timeline",
      bullets(d.timeline, "HH:MM — event"),
      "",
      "## Contributing Factors",
      bullets(d.factors, "[Conditions that together allowed this to happen — not a single root cause, not a person]"),
      "",
      "## What Went Well",
      bullets(d.well, "[..]"),
      "",
      "## What Was Hard",
      bullets(d.hard, "[..]"),
      "",
      "## Where We Got Lucky",
      bullets(d.lucky, "[..]"),
      "",
      "## Response Quality (Weak / Good / Best in Class)",
      "| Dimension | Rating |",
      "|---|---|"
    ].concat(ratings, [
      "",
      "## Action Items",
      "| Owner | Action | Due | Type |",
      "|---|---|---|---|"
    ], actions.length ? actions : ["| [team] | [specific action] | [date] | [prevent / detect / mitigate / process] |"], [
      "",
      "## Follow-Up",
      "- Review date: " + (d.review || "[within 5 business days]"),
      "- Action items reviewed monthly until closed."
    ]).join("\n");
  }

  function render() {
    var d = data();
    save(d);
    out.textContent = markdown(d);
  }

  var saved = load();
  Array.prototype.forEach.call(form.elements, function (el) { if (el.name && saved[el.name] != null) el.value = saved[el.name]; });
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  document.getElementById("pm-copy").addEventListener("click", function () {
    var text = out.textContent;
    var done = function () { if (window.nimbusToast) window.nimbusToast("Markdown copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
  });
  document.getElementById("pm-download").addEventListener("click", function () {
    var d = data();
    var name = "postmortem-" + (d.date || "draft") + "-" + (d.title || "incident").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".md";
    var blob = new Blob([out.textContent], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById("pm-clear").addEventListener("click", function () {
    if (!window.confirm("Clear this draft? It's only stored in this browser.")) return;
    form.reset();
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    render();
  });
  render();
})();
