/* Tabletop exercise kit: pick a scenario, run a timer, reveal injects, score the debrief (Weak/Good/Best), export Markdown.
   State is kept in this browser only. Debrief dimensions come from assets/quality.js (window.NIMBUS_QUALITY). */
(function () {
  "use strict";
  var app = document.getElementById("tabletop-app");
  if (!app) return;
  var root = document.body.getAttribute("data-root") || "./";
  var KEY = "nimbus-tabletop";

  var S = [
    { id: "noisy-neighbor", title: "Device Care Throttled by a Background Batch", sev: "Sev 2", playbook: "pb-429-surge",
      setup: "09:05 on a Monday. Device Care users report \"Nimbus is busy\". The Proactive Tips batch started at 09:00 on the shared chat-small deployment.",
      objectives: ["Declare and coordinate within 10 minutes", "Prove the noisy neighbor with evidence", "Get the batch paused through a pre-agreed request", "Keep Morgan from derailing the Technical Lead"],
      injects: [
        { t: 0, text: "NOC sweep: 429s at 9% on chat-small. Device Care error rate 8% (baseline 0.6%)." },
        { t: 5, text: "Device CFT is on Teams and hasn't acknowledged the page." },
        { t: 10, text: "Morgan (director) DMs the SRE: \"What query are you running? Why isn't this fixed yet?\"", morgan: true },
        { t: 15, text: "Token-share query: Proactive Tips is using 70% of chat-small tokens per minute." },
        { t: 20, text: "Insights CFT acknowledges the pause request but asks, \"Who approved this?\"" },
        { t: 25, text: "Morgan opens a separate Teams call with the Device CFT and asks them to roll back their last deploy.", morgan: true },
        { t: 30, text: "Batch paused. 429s drop to 1%. Do you resolve? What's next?" }
      ] },
    { id: "fallback-surge", title: "Devices Suddenly Lean on the Cloud", sev: "Sev 2 → Sev 1?", playbook: "pb-fallback-surge",
      setup: "10:40. Cloud traffic on chat-small is up 40% over an hour with no server deploys. The on-device model v2.3 rollout is at 25%.",
      objectives: ["Connect the device rollout to the cloud load", "Get the Client CFT and Cloud Infrastructure working together", "Get a spend decision from the manager quickly"],
      injects: [
        { t: 0, text: "429s appearing on Writing Assist and Device Care. Server dashboards show more traffic, but no errors." },
        { t: 5, text: "Cloud Infrastructure: \"Our layer is fine. Someone is sending too much traffic.\"" },
        { t: 10, text: "Fallback rate for local model v2.3 is 31% (normally under 2%)." },
        { t: 12, text: "Morgan joins the channel: \"Can someone walk me through the architecture? I want to understand the root cause now.\"", morgan: true },
        { t: 18, text: "The Client CFT says halting the rollout needs release manager approval, who is in a meeting." },
        { t: 22, text: "Cloud Infrastructure can enable spillover at about $900/hour, and wants a manager to approve." },
        { t: 30, text: "Errors spread to Smart Search. Do you raise the severity?" }
      ] },
    { id: "edge-outage", title: "Everything Fails at the Edge", sev: "Sev 1", playbook: "pb-cdn-edge",
      setup: "14:02. Support reports that Nimbus \"can't connect\" for many users. App Insights looks unusually quiet.",
      objectives: ["Recognize an edge problem from quiet telemetry", "Bring Cloud Infrastructure evidence, not accusations", "Run executive comms through a buffer"],
      injects: [
        { t: 0, text: "Front Door logs: 5xx at 22%, error info OriginConnectionError. APIM traffic has dropped by 70%." },
        { t: 4, text: "Morgan posts in the main channel: \"Is this the AI model again? Get Microsoft on the phone.\"", morgan: true },
        { t: 8, text: "Cloud Infrastructure on-call: \"We changed a private endpoint at 13:55, but it's unrelated.\"" },
        { t: 14, text: "The SRE layer query shows the edge failing while APIM is healthy for traffic that does arrive." },
        { t: 20, text: "Cloud Infrastructure reverts the private endpoint change. Recovery starts." },
        { t: 26, text: "Morgan asks for a full written root cause before the end of the day.", morgan: true }
      ] },
    { id: "auth-401", title: "Users Locked Out After an Update", sev: "Sev 2", playbook: "pb-401-surge",
      setup: "16:20. 401s at APIM rose from 0.3% to 6% over the last hour. Client 4.13.0 started ramping at 15:10.",
      objectives: ["Find the rejecting layer and cohort", "Halt the rollout through a request", "Avoid unsafe secret or policy changes under pressure"],
      injects: [
        { t: 0, text: "401s concentrated in client 4.13.0. Older versions are normal." },
        { t: 6, text: "Someone suggests rotating the APIM signing keys \"just in case\"." },
        { t: 10, text: "Morgan DMs the NOC: \"Just roll everything back. Why is this taking so long?\"", morgan: true },
        { t: 15, text: "Token validation errors show ExpiredSignature about 60 minutes after login, so it's a refresh bug." },
        { t: 22, text: "The Client CFT pauses the ramp. Users already on 4.13.0 still fail every hour." }
      ] },
    { id: "blind-spot", title: "Dashboards Green, Users Angry", sev: "Sev 3 → ?", playbook: "pb-dashboards-green",
      setup: "11:00. Social posts say Nimbus quick rewrites are \"broken\". Every server metric looks normal.",
      objectives: ["Take user reports seriously", "Find the invisible local path", "Turn a blind spot into a measurement and an action"],
      injects: [
        { t: 0, text: "Support has 140 tickets in 2 hours, all about quick rewrites on one laptop model." },
        { t: 6, text: "Server error rates are normal, and request volume is slightly <em>down</em>." },
        { t: 12, text: "Client customEvents show on-device model crashes on one NPU driver version." },
        { t: 16, text: "Morgan asks why the dashboards didn't show this, and wants a dashboard built right now during the incident.", morgan: true },
        { t: 24, text: "The Client CFT can route that driver version to the cloud with a config change, which adds load to chat-small." }
      ] }
  ];

  var state = { sc: null, revealed: 0, start: null, elapsed: 0, running: false, scores: {}, notes: "" };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || "null"); if (s0) state = s0; } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function now() { return state.elapsed + (state.running && state.start ? Date.now() - state.start : 0); }
  function mmss(ms) { var s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function sc() { for (var i = 0; i < S.length; i++) if (S[i].id === state.sc) return S[i]; return null; }
  var dims = (window.NIMBUS_QUALITY || []).map(function (d) { return { id: d.id, name: d.name }; });

  function picker() {
    return '<h2 id="pick-a-scenario">Pick a Scenario</h2><div class="card-grid">' + S.map(function (x) {
      return '<button type="button" class="card" style="text-align:left;cursor:pointer;font:inherit" data-pick="' + x.id + '"><span class="badge sev2">' + esc(x.sev) +
        '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.setup) + "</p></button>";
    }).join("") + "</div>";
  }

  function run(x) {
    var n = x.injects.length;
    var html = '<div class="seg-row no-print"><button type="button" class="btn" data-act="change">← Change Scenario</button>' +
      '<span class="badge sev2">' + esc(x.sev) + '</span><a href="' + root + "playbooks.html#" + x.playbook + '">Matching playbook →</a></div>';
    html += '<h2 id="scenario">' + esc(x.title) + "</h2><p>" + esc(x.setup) + "</p>";
    html += '<div class="panel"><b>Objectives</b><ul>' + x.objectives.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" +
      '<b>Roles</b><ul><li><span class="badge noc">NOC</span> Incident Coordinator: declare, coordinate, request actions, buffer stakeholders.</li>' +
      '<li><span class="badge sre">SRE</span> Technical Lead: find the layer, recommend mitigations.</li>' +
      '<li><span class="badge lead">Manager</span> Decide, unblock, handle Morgan.</li>' +
      '<li><b>Facilitator</b> reads the injects and plays CFTs, Cloud Infrastructure, and Morgan.</li></ul></div>';
    html += '<h2 id="run-the-exercise">Run the Exercise</h2><div class="seg-row"><span style="font:700 2rem var(--mono)" id="tt-clock">' + mmss(now()) + "</span>" +
      '<button type="button" class="btn primary" data-act="timer">' + (state.running ? "Pause Timer" : (now() ? "Resume Timer" : "Start Timer")) + "</button>" +
      '<button type="button" class="btn" data-act="reveal"' + (state.revealed >= n ? " disabled" : "") + ">Reveal Next Inject (" + state.revealed + "/" + n + ")</button>" +
      '<button type="button" class="link-btn" data-act="reset">Reset</button></div>';
    html += '<ol class="steps" id="tt-injects">' + x.injects.slice(0, state.revealed).map(function (i) {
      return '<li><strong>T+' + i.t + " min" + (i.morgan ? ' <span class="badge sev2">Morgan</span>' : "") + "</strong>" + i.text + "</li>";
    }).join("") + "</ol>";
    if (state.revealed < n) html += '<p class="triage-help">Next inject is planned for T+' + x.injects[state.revealed].t + " min. Reveal it when the group is ready, or on time.</p>";
    html += '<h2 id="debrief">Debrief: Weak / Good / Best</h2><p>Score each dimension together. See <a href="' + root + 'response-quality.html">What Good Looks Like</a> for the descriptions.</p>';
    html += '<div class="table-wrap"><table><thead><tr><th>Dimension</th><th>Score</th></tr></thead><tbody>' + dims.map(function (d) {
      var v = state.scores[d.id] || "";
      return "<tr><td>" + esc(d.name) + '</td><td><div class="seg" role="group" aria-label="' + esc(d.name) + '">' + ["Weak", "Good", "Best in Class"].map(function (l) {
        return '<button type="button" data-score="' + d.id + '" data-val="' + l + '" aria-pressed="' + (v === l) + '">' + l + "</button>";
      }).join("") + "</div></td></tr>";
    }).join("") + "</tbody></table></div>";
    html += '<label class="pm-form" style="display:block">Notes and action items<textarea id="tt-notes" rows="5">' + esc(state.notes || "") + "</textarea></label>";
    html += '<div class="hero-actions"><button type="button" class="btn primary" data-act="export">Copy Debrief Summary</button></div>';
    html += '<div class="code-card"><div class="code-head"><span class="lang">Markdown</span><span class="title">Debrief Summary</span></div><pre><code id="tt-summary">' + esc(summary(x)) + "</code></pre></div>";
    return html;
  }

  function summary(x) {
    return ["# Tabletop Debrief: " + x.title, "", "- Date: " + new Date().toISOString().slice(0, 10), "- Duration: " + mmss(now()),
      "- Injects revealed: " + state.revealed + "/" + x.injects.length, "", "## Scores", "| Dimension | Score |", "|---|---|"]
      .concat(dims.map(function (d) { return "| " + d.name + " | " + (state.scores[d.id] || "—") + " |"; }))
      .concat(["", "## Notes and Action Items", state.notes || "-"]).join("\n");
  }

  function render() {
    var x = sc();
    app.innerHTML = x ? run(x) : picker();
    save();
  }

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var x = sc();
    if (b.hasAttribute("data-pick")) { state = { sc: b.getAttribute("data-pick"), revealed: 0, start: null, elapsed: 0, running: false, scores: {}, notes: "" }; render(); return; }
    var act = b.getAttribute("data-act");
    if (act === "change") { state.sc = null; state.running = false; render(); return; }
    if (act === "timer") {
      if (state.running) { state.elapsed = now(); state.running = false; state.start = null; }
      else { state.start = Date.now(); state.running = true; }
      render(); return;
    }
    if (act === "reveal" && x && state.revealed < x.injects.length) { state.revealed++; if (!state.running && !now()) { state.start = Date.now(); state.running = true; } render(); return; }
    if (act === "reset") { state.revealed = 0; state.elapsed = 0; state.start = null; state.running = false; state.scores = {}; state.notes = ""; render(); return; }
    if (act === "export" && x) {
      var t = summary(x);
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { if (window.nimbusToast) window.nimbusToast("Debrief copied"); });
      return;
    }
    if (b.hasAttribute("data-score")) { state.scores[b.getAttribute("data-score")] = b.getAttribute("data-val"); render(); }
  });
  app.addEventListener("input", function (e) {
    if (e.target.id === "tt-notes") {
      state.notes = e.target.value; save();
      var x = sc(), out = document.getElementById("tt-summary");
      if (x && out) out.textContent = summary(x);
    }
  });
  setInterval(function () { var c = document.getElementById("tt-clock"); if (c && state.running) c.textContent = mmss(now()); }, 500);
  render();
})();
