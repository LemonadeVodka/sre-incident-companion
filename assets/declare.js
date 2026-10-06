/* "Triage or Incident?" checker: four yes/no questions -> Watch / Triage / Incident, with a copyable note. */
(function () {
  "use strict";
  var app = document.getElementById("declare-app");
  if (!app) return;
  var Q = [
    { k: "users", t: "Users: are users affected, or about to be? (support tickets, errors, slowness)" },
    { k: "size", t: "Size and time: clearly above normal (example: 2× error baseline, or P95 1.5× yesterday) AND lasting more than 10 minutes?" },
    { k: "spread", t: "Spread: on a shared layer (edge, gateway, orchestrator, model, partner) or more than one feature?" },
    { k: "help", t: "Help: do we need more than one team, or a decision we cannot make ourselves?" }
  ];
  var a = { users: null, size: null, spread: null, help: null, unsure15: false };

  function verdict() {
    if (a.users === null && a.size === null && a.spread === null && a.help === null && !a.unsure15) return "pending";
    if ((a.users && a.size) || a.spread || a.help || a.unsure15) return "incident";
    if (a.users || a.size) return "triage";
    if (a.users === false && a.size === false && a.spread === false && a.help === false) return "watch";
    return "triage";
  }
  function note(v) {
    var t = new Date(); var hh = String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0");
    if (v === "incident") return "DECLARING INCIDENT [Sev ?] — [feature/layer] — [symptom + numbers] since [time].\nOpening #inc-YYYYMMDD-name. Paging [owner] + SRE (Technical Lead). Next update [HH:MM].";
    if (v === "triage" || v === "pending") return "TRIAGE (not an incident yet): [what you see + numbers] since [time]. Likely owner: @[owner] (FYI).\nRe-check at [" + hh + " + 15 min]. If still unsure then → declare.";
    return "WATCH: [what looked odd] at " + hh + ". Inside normal ranges, no user impact. Re-check at next sweep.";
  }
  function render() {
    var v = verdict();
    var label = { pending: ["amber", "Answer the Four Questions"], watch: ["green", "Watch: Log It and Re-Check"], triage: ["amber", "Triage: Open a Thread, 15-Minute Time Box"], incident: ["red", "Incident: Declare Now"] }[v];
    app.innerHTML = Q.map(function (q) {
      return '<div class="qrow"><p>' + q.t + '</p><div class="seg" role="group" aria-label="' + q.k + '">' +
        '<button type="button" data-q="' + q.k + '" data-v="yes" aria-pressed="' + (a[q.k] === true) + '">Yes</button>' +
        '<button type="button" data-q="' + q.k + '" data-v="no" aria-pressed="' + (a[q.k] === false) + '">No</button></div></div>';
    }).join("") +
      '<div class="qrow"><p>Already triaged 15 minutes and still unsure?</p><div class="seg"><button type="button" data-q="unsure15" data-v="toggle" aria-pressed="' + a.unsure15 + '">Yes, Still Unsure</button></div></div>' +
      '<div class="verdict"><i class="light ' + label[0] + '"></i>' + label[1] + "</div>" +
      '<div class="code-card"><div class="code-head"><span class="lang">Note</span><span class="title">Copy Into the NOC Channel</span><button type="button" class="copy-btn" data-act="copy">Copy</button></div><pre><code id="declare-note">' +
      note(v).replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</code></pre></div>" +
      '<p class="small"><button type="button" class="link-btn" data-act="reset">Reset</button> · When unsure, declare. Declaring is cheap, and you can always downgrade.</p>';
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.getAttribute("data-act") === "copy") {
      var t = document.getElementById("declare-note").textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { if (window.nimbusToast) window.nimbusToast("Note copied"); });
      return;
    }
    if (b.getAttribute("data-act") === "reset") { a = { users: null, size: null, spread: null, help: null, unsure15: false }; render(); return; }
    var k = b.getAttribute("data-q"); if (!k) return;
    if (k === "unsure15") a.unsure15 = !a.unsure15; else a[k] = b.getAttribute("data-v") === "yes";
    render();
  });
  render();
})();
