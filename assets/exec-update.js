/* Executive SITREP builder: form -> BLUF + SITREP text. Draft kept in this browser only. */
(function () {
  "use strict";
  var form = document.getElementById("sitrep-form");
  if (!form) return;
  var out = document.getElementById("sitrep-out");
  var KEY = "nimbus-sitrep";
  var CONF = { high: "We are confident", medium: "We believe", low: "We don't yet know, but our leading theory is" };

  function data() { var d = {}; Array.prototype.forEach.call(form.elements, function (el) { if (el.name) d[el.name] = el.value.trim(); }); return d; }
  function text(d) {
    var type = d.type || "live";
    var head = type === "live" ? "SITREP" : type === "post" ? "POST-INCIDENT SITREP" : "WEEKLY RELIABILITY SITREP";
    var status = d.status || "Investigating";
    var bluf = type === "weekly"
      ? (d.summary || "[One sentence: overall reliability this week vs target.]")
      : (d.feature || "[Feature]") + " is " + (d.symptom || "[slow / failing]") + " for " + (d.impact || "[who / how many]") + ". " + status + ". " +
        (d.decision ? "Decision needed: " + d.decision + "." : "No decision needed from you right now.");
    var lines = [
      "[" + (d.sev || "Sev ?") + "] " + head + " — " + (d.title || "[short name]") + (d.time ? " — as of " + d.time : ""),
      "",
      "BLUF: " + bluf,
      "",
      "SITUATION: " + (d.situation || "[What is happening, in plain language. Which layer: e.g. a partner, our AI provider, a recent update.]"),
      "IMPACT: " + (d.impact || "[Users / % / features / regions]") + (d.duration ? " for " + d.duration : "") + (d.baseline ? " (normal: " + d.baseline + ")" : ""),
      "CAUSE: " + (CONF[d.conf || "medium"]) + " " + (d.cause || "[cause]") + ".",
      "ACTIONS: " + (d.actions || "[What we are doing, who owns it]"),
      "DECISIONS NEEDED: " + (d.decision || "None at this time"),
      type === "post" ? "PREVENTION: " + (d.prevent || "[Top 2–3 actions with owners and dates]") : "NEXT UPDATE: " + (d.next || "[time]") + (d.eta ? " · Expected recovery: " + d.eta : "")
    ];
    return lines.join("\n");
  }
  function render() { var d = data(); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ } out.textContent = text(d); }
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  Array.prototype.forEach.call(form.elements, function (el) { if (el.name && saved[el.name] != null) el.value = saved[el.name]; });
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  document.getElementById("sitrep-copy").addEventListener("click", function () {
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(function () { if (window.nimbusToast) window.nimbusToast("SITREP copied"); });
  });
  document.getElementById("sitrep-clear").addEventListener("click", function () {
    form.reset(); try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } render();
  });
  render();
})();
