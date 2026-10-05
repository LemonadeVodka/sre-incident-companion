/* Weak / Good / Best-in-Class response data, plus the "What Good Looks Like" selector.
   Data is generic first; `nimbus` is a short worked example. Also used by the tabletop debrief. */
(function () {
  "use strict";
  var Q = [
    { id: "detection", name: "Detection",
      weak: { noc: "Finds out from a customer or a CFT. Alerts are ignored because they're noisy.", sre: "Hears about it only when paged, with no signal of their own.", lead: "Learns about the incident from an executive or a customer." },
      good: { noc: "Regular health sweep, and alerts acknowledged within 5 minutes and checked against a baseline.", sre: "Keeps the sweep queries and alerts tuned, and fixes noisy alerts after incidents.", lead: "Gets notified for Sev 1, and tracks how incidents were detected each month." },
      best: { noc: "Spots slow-burning issues before alerts fire, and notices when telemetry goes quiet.", sre: "Alerts are based on error-budget burn rate, and user-impacting problems are caught before customers notice.", lead: "Most incidents are detected by our own monitoring, and that share is a goal they track." },
      nimbus: "The NOC's sweep includes the local vs cloud routing split, which catches fallback surges before the 429s start." },
    { id: "triage", name: "Triage",
      weak: { noc: "\"Something is wrong with the product.\" Pages everyone, or nobody.", sre: "Starts debugging before confirming scope.", lead: "Pushes for a severity based on who's asking." },
      good: { noc: "Within 15 minutes: confirmed, scoped (feature, layer, version, region), severity proposed, right owner paged.", sre: "Confirms impact, finds the failing layer, and narrows down the owner.", lead: "Accepts severity based on user impact and asks why it was set there." },
      best: { noc: "Scopes by layer straight away and pages the owner directly. Rarely needs a reroute.", sre: "Triage queries are saved and shared, so anyone can scope in minutes.", lead: "Severity definitions are agreed in advance, so nobody argues about them mid-incident." },
      nimbus: "Use the which-layer table: edge, gateway, cloud orchestrator, feature, model, or device." },
    { id: "coordination", name: "Coordination",
      weak: { noc: "Nobody is clearly in charge. Several channels, side calls, and decisions scattered across them.", sre: "Tries to coordinate and debug at once, and does both badly.", lead: "Takes over the call without being asked." },
      good: { noc: "One channel, a named coordinator, assigned roles, a regular update loop, and a pinned record.", sre: "Acts as Technical Lead and gives the coordinator workstreams and recommendations.", lead: "Backs the coordinator's authority and stays in their own lane." },
      best: { noc: "Runs the room calmly, keeps the handover-ready record current, and absorbs interruptions before they reach responders.", sre: "Runs named technical workstreams and hands over cleanly at shift change.", lead: "Coordination is a trained skill, practiced in tabletop exercises." },
      nimbus: "The NOC is Incident Coordinator, and SRE is Technical Lead. Teams-only CFTs are reached through a named bridge." },
    { id: "communication", name: "Communication",
      weak: { noc: "Updates are irregular and vague, with no next-update time.", sre: "Posts raw query output that only engineers understand.", lead: "Gives executives conflicting information from side channels." },
      good: { noc: "Updates on a schedule with status, impact, changes, next step, and next update time.", sre: "Gives the coordinator one plain-language technical summary each cycle.", lead: "Uses the coordinator's updates as the single source for executives." },
      best: { noc: "Mirrors updates to every audience (Slack, Teams, executives) automatically or through a named buffer.", sre: "Shares one clear chart that explains the problem to everyone.", lead: "Executives get a standard update format, so they stop asking responders." },
      nimbus: "Slack is the source of truth. The bridge mirrors updates to Teams with the same template." },
    { id: "escalation", name: "Escalation",
      weak: { noc: "Posts in chat and waits, hoping someone notices.", sre: "Escalates by complaining instead of with evidence.", lead: "Isn't told about stuck escalations until it's too late." },
      good: { noc: "Pages through PagerDuty, runs timers (15, 30, 45 minutes), and records acknowledgement times.", sre: "Explains the technical case for pulling in another team.", lead: "Acts as the top rung of the ladder and contacts other teams' leaders quickly." },
      best: { noc: "Every team has a PagerDuty service, and timers are rarely needed.", sre: "Has working relationships with every CFT through a liaison.", lead: "Response expectations are agreed with every team and reviewed monthly using real numbers." },
      nimbus: "Some CFTs have no PagerDuty service, so the NOC pages the CFT leads policy instead." },
    { id: "mitigation", name: "Mitigation",
      weak: { noc: "Can't act and doesn't ask, so waits for someone to notice.", sre: "Hunts for the root cause while users stay broken.", lead: "Delays costly mitigations while asking for more analysis." },
      good: { noc: "Sends specific, timed action requests to owners, and checks back.", sre: "Recommends reversible mitigations (pause, halt, shift, roll back) with evidence and undo steps.", lead: "Decides on spend and trade-offs within minutes when asked." },
      best: { noc: "Has scoped tooling to run the common safe actions directly.", sre: "Common mitigations are rehearsed and documented in runbooks.", lead: "Pre-approves categories of spend so the team doesn't have to ask mid-incident." },
      nimbus: "The NOC can't change production yet, so it uses pre-agreed requests to the Client CFT, Insights CFT, and Cloud Infrastructure." },
    { id: "cross-team", name: "Working With CFTs and Platform Teams",
      weak: { noc: "Blames or bypasses the platform team, and teams argue about fault mid-incident.", sre: "Debates owners without data, so \"not us\" goes unchallenged.", lead: "Escalates around other leaders, or avoids conflict entirely." },
      good: { noc: "Brings evidence to owners and uses their process.", sre: "Answers \"not us\" with the evidence that would change their mind.", lead: "Escalates peer to peer, calmly, with data." },
      best: { noc: "Owners trust the coordinator's requests and act on them quickly.", sre: "Has joint postmortem actions with the platform team that actually ship.", lead: "Shared-layer changes have agreed review and announcement rules." },
      nimbus: "Cloud Infrastructure is powerful and owns the shared cloud. Lead with evidence, and escalate through managers." },
    { id: "stakeholders", name: "Managing Stakeholder Pressure",
      weak: { noc: "Lets an executive's questions pull responders off the fix.", sre: "Answers every DM from a director, and loses the thread.", lead: "Is the director diving into the weeds, or lets one do it unchallenged." },
      good: { noc: "Names a comms buffer, redirects executive questions to the update schedule, and pulls side calls back.", sre: "Routes DMs to the coordinator and shares one chart, not raw queries.", lead: "Acts as the buffer, gives anxious leaders real decisions to make, and has a private word early." },
      best: { noc: "An exec update format exists and executives follow it.", sre: "Is never interrupted mid-investigation, because the system absorbs it.", lead: "Directors are briefed on incident etiquette in advance, and interruptions are reviewed blamelessly in postmortems." },
      nimbus: "Morgan, the deep-diving director, is a recurring character in the tabletop exercises." },
    { id: "postmortem", name: "Post-Mortem",
      weak: { noc: "No postmortem is scheduled. The timeline is rebuilt from memory weeks later.", sre: "Writes \"human error\" as the root cause.", lead: "Asks who did it, and action items are never funded." },
      good: { noc: "The postmortem is scheduled before standing down, and the timeline is handed over the same day.", sre: "Blameless analysis of contributing factors, with SMART action items owned by the right teams.", lead: "Chairs Sev 1–2 reviews, protects blamelessness, and reviews action items monthly." },
      best: { noc: "Timelines are postmortem-ready at close, and the NOC tracks follow-through.", sre: "Postmortems change the system: alerts, gates, runbooks, and architecture.", lead: "Action-item completion and repeat incidents are tracked as organizational goals." },
      nimbus: "Postmortems are a known weakness. See the Post-Incident track." }
  ];
  window.NIMBUS_QUALITY = Q;

  var app = document.getElementById("quality-app");
  if (!app) return;
  var ROLES = { noc: "NOC / Coordinator", sre: "SRE / Technical Lead", lead: "Senior Manager" };
  var LEVELS = { weak: "Weak", good: "Good", best: "Best in Class" };
  var state = { level: "good", role: "all" };
  try { var saved = JSON.parse(localStorage.getItem("nimbus-quality") || "null"); if (saved) state = saved; } catch (e) { /* ignore */ }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function seg(name, opts, cur) {
    return '<div class="seg" role="group" aria-label="' + name + '">' + Object.keys(opts).map(function (k) {
      return '<button type="button" data-' + name + '="' + k + '" aria-pressed="' + (k === cur) + '">' + esc(opts[k]) + "</button>";
    }).join("") + "</div>";
  }
  function render() {
    var roles = state.role === "all" ? ["noc", "sre", "lead"] : [state.role];
    var html = '<div class="seg-row"><span><b>Level</b></span>' + seg("level", LEVELS, state.level) +
      '<span><b>Role</b></span>' + seg("role", { all: "All", noc: "NOC", sre: "SRE", lead: "Manager" }, state.role) + "</div>";
    html += '<div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">' + Q.map(function (d) {
      return '<div class="card"><span class="q-level q-' + state.level + '">' + LEVELS[state.level] + '</span><h3>' + esc(d.name) + "</h3>" +
        roles.map(function (r) { return '<p style="margin:.5em 0 0"><b style="font-family:var(--ui);font-size:.8rem">' + ROLES[r] + "</b><br>" + esc(d[state.level][r]) + "</p>"; }).join("") +
        '<p style="margin-top:.7em;font-size:.82rem"><i>At Nimbus: ' + esc(d.nimbus) + "</i></p></div>";
    }).join("") + "</div>";
    app.innerHTML = html;
    try { localStorage.setItem("nimbus-quality", JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-level")) state.level = b.getAttribute("data-level");
    if (b.hasAttribute("data-role")) state.role = b.getAttribute("data-role");
    render();
  });
  var fallback = document.getElementById("quality-static");
  if (fallback) fallback.hidden = true;
  render();
})();
