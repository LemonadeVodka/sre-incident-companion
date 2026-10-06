/* Interactive triage decision tree. Renders into #triage-app. Links are relative to the site root.
   Results give separate steps for the NOC and for SRE on-call. */
(function () {
  "use strict";
  var app = document.getElementById("triage-app");
  if (!app) return;
  var root = document.body.getAttribute("data-root") || "./";

  var Q = {
    start: {
      q: "What Are You Seeing Right Now?",
      help: "Pick the closest match. You can step back at any point.",
      options: [
        { label: "Latency Is High", sub: "P50/P95 up, spinners, slow answers", go: "lat_scope" },
        { label: "Error Rate Is High", sub: "Failures, 4xx/5xx, exceptions", go: "err_type" },
        { label: "Everything Is Failing at Once", sub: "All features, \"can't connect\"", go: "r_cdn" },
        { label: "Cloud Load Up With No Server Change", sub: "429s/traffic climbing, maybe after a client or model rollout", go: "r_fallback" },
        { label: "One Partner Integration Failing", sub: "Only users of one partner (e.g. Zoom) affected", go: "r_partner" },
        { label: "Users Complain, Signals Look Fine", sub: "Support tickets, quiet telemetry", go: "r_blind" },
        { label: "An Alert Fired and I Don't Know Why", sub: "Unfamiliar alert, unclear owner", go: "r_alert" },
        { label: "I'm a Manager Joining", sub: "What should I do and ask?", go: "r_leader" }
      ]
    },
    lat_scope: {
      q: "How Widespread Is the Slowdown?",
      help: "Run sweep query 2 (P50/P95 by feature, now vs yesterday).",
      link: ["Open the query", "queries.html#q-latency-by-feature"],
      options: [
        { label: "One Feature", sub: "e.g. only Writing Assist", go: "lat_one" },
        { label: "Several or All Features", sub: "Broad slowdown", go: "r_foundry_wide" },
        { label: "Some Client Versions or Devices Only", sub: "Newest build, a region", go: "r_client" }
      ]
    },
    lat_one: {
      q: "Is It Slow to Start, or Slow Overall?",
      help: "Streaming features: compare time-to-first-token with total time.",
      link: ["Open the query", "queries.html#q-ttft"],
      options: [
        { label: "Slow to Start (First Token)", sub: "Spinner stays longer", go: "r_ttft" },
        { label: "Slow Overall / Not Streamed", sub: "Total time is up", go: "r_latency_one" },
        { label: "One Instance Much Slower Than Others", sub: "Rust runtime stall?", go: "r_instance" }
      ]
    },
    err_type: {
      q: "What Kind of Errors Dominate?",
      help: "Run the error-rate query, and the layer comparison if you can.",
      link: ["Errors by layer", "sre/investigate.html#q-layers"],
      options: [
        { label: "401 Unauthorized", sub: "Credentials rejected", go: "r_401" },
        { label: "5xx / 403 at the Edge (Front Door)", sub: "Before our code runs", go: "r_cdn" },
        { label: "429 Too Many Requests", sub: "Foundry throttling", go: "r_429" },
        { label: "5xx From Foundry", sub: "Model dependency failing", go: "r_foundry_wide" },
        { label: "5xx or Panics in Our Services", sub: "Our Rust code failing", go: "r_service_err" },
        { label: "Only the Newest Client Version", sub: "Since an update", go: "r_client" }
      ]
    }
  };

  var R = {
    r_leader: {
      title: "Manager Joining: Help the Response, Don't Add to It",
      noc: [], sre: [],
      lead: [
        "Read the Slack incident channel first. It's the source of truth.",
        "Ask once: Who is IC? What's the impact in numbers? When is the next update? What do you need from me?",
        "Be ready to decide on spend, quality trade-offs, customer messaging, and pulling in people.",
        "If a CFT hasn't responded in 45 minutes, contact its leadership directly."
      ],
      links: [["During an incident", "leaders/during-an-incident.html"], ["Decisions only you can make", "leaders/during-an-incident.html#decisions-only-you-can-make"], ["Jargon decoder", "leaders/jargon.html"]]
    },
    r_fallback: {
      title: "Local-to-Cloud Fallback Surge (Device Orchestrator)",
      noc: ["Check what client or on-device model version is ramping.", "Send the halt-rollout request to the Client CFT.", "Declare, page Cloud Infrastructure and SRE, and get both teams into one channel."],
      sre: ["Confirm with the fallback rate by local model version, and the local vs cloud split.", "Recommend capacity or background-load shedding to Cloud Infrastructure.", "Check which features are absorbing the extra cloud load."],
      links: [["Playbook: fallback surge", "playbooks.html#pb-fallback-surge"], ["Fallback rate", "queries.html#q-fallback-rate"], ["Routing split", "queries.html#q-routing-split"]]
    },
    r_partner: {
      title: "Partner Integration Degraded",
      noc: ["Check the partner's status page, and confirm only that partner's users are affected.", "Declare and page the Partner Integrations CFT and SRE. Notify the partner contact.", "If the partner is down, request the per-partner kill switch from the Partner Integrations CFT."],
      sre: ["Partner-side or our connector? Check 401 (token/consent), 429 (rate limit), or 5xx (outage).", "Recommend disabling only that connector, with a user-facing fallback.", "Confirm timeouts and the circuit breaker kept the rest of the feature healthy."],
      links: [["Playbook: partner degraded", "playbooks.html#pb-partner-degraded"], ["Partner health", "queries.html#q-partner-health"], ["Partner 401/429", "queries.html#q-partner-auth"]]
    },
    r_alert: {
      title: "Unknown Alert: Make It Known in 5 Minutes",
      noc: ["Read the alert: which table, which service, what threshold?", "Check user impact with the sweep queries. If there's none, it's lower urgency, but still note it.", "Find the owner in the ownership table and page them. If unclear, page SRE as Technical Lead."],
      sre: ["Decide whether the alert reflects user impact. If not, file it for alert cleanup.", "Make sure someone owns writing a runbook for it."],
      links: [["Who owns what", "environment.html#who-owns-what"], ["NOC sweep", "noc/detect.html#shift-health-sweep"], ["Severity levels", "incident-response.html#severity-levels"]]
    },
    r_blind: {
      title: "Blind Spot: Users Feel It, Telemetry Doesn't Show It",
      noc: ["Run the telemetry-volume sweep. A drop means data loss, not health.", "Collect 3–5 concrete user reports (time, feature, version).", "Declare at Sev 3, open a channel, and page SRE."],
      sre: ["Check the OTel Collector and the edge logs. Failures before our code won't appear in App Insights.", "Slice by client version and region.", "Build an ad-hoc panel to measure impact, then follow the evidence."],
      links: [["Playbook: dashboards green", "playbooks.html#pb-dashboards-green"], ["Telemetry volume", "queries.html#q-telemetry-volume"], ["Edge errors", "sre/investigate.html#q-edge-errors"]]
    },
    r_client: {
      title: "Cohort-Specific: A Client Release or Device Issue",
      noc: ["Confirm with the by-client-version query.", "Send the halt-rollout request to the Client CFT.", "Declare, and page the Client CFT and SRE."],
      sre: ["Compare the new build's errors, 401s, and crashes with the previous build.", "Disable the new code path with a server flag if possible.", "Keep the rollout paused until a fix is verified."],
      links: [["Playbook: client rollout", "playbooks.html#pb-client-rollout"], ["By client version", "queries.html#q-client-version"], ["Halt-rollout request", "noc/action-requests.html#req-halt-rollout"]]
    },
    r_latency_one: {
      title: "One Feature Is Slow",
      noc: ["Confirm against yesterday, then declare and open the channel.", "Page the owning CFT, plus SRE for Sev 2."],
      sre: ["Split P50/P95 per hop: model, retrieval, or our own code?", "Check for a deploy or prompt change and roll back if it lines up.", "Check token growth."],
      links: [["Playbook: one feature", "playbooks.html#pb-latency-one-feature"], ["Per-hop query", "sre/investigate.html#q-hops"], ["Token growth", "queries.html#q-token-growth"]]
    },
    r_ttft: {
      title: "Slow First Token",
      noc: ["Page the feature CFT. Page SRE and Cloud Infrastructure if other features on the same deployment are slow too."],
      sre: ["Capacity (PTU queueing) or prompt size? Check token growth and PTU utilization.", "Shed background load, trim context, and confirm streaming is on."],
      links: [["Playbook: slow first token", "playbooks.html#pb-slow-first-token"], ["TTFT query", "queries.html#q-ttft"]]
    },
    r_instance: {
      title: "One Instance Stalled (Likely Rust Async Runtime)",
      noc: ["Confirm with P50/P95 by instance.", "Send the restart-one-instance request to the owner (CFT or Cloud Infrastructure).", "Tell SRE the instance name."],
      sre: ["Look for blocking work on the tokio runtime, or pool exhaustion.", "If it recurs, roll back the latest deploy."],
      links: [["By instance", "sre/investigate.html#q-by-instance"], ["Rust failure modes", "sre/investigate.html#rust-service-failure-modes"], ["Restart request", "noc/action-requests.html#req-restart-instance"]]
    },
    r_foundry_wide: {
      title: "Model Layer Degraded Across Features",
      noc: ["Declare at high urgency, and page Cloud Infrastructure and SRE.", "Check the Azure status page.", "Request the in-app banner from the Client CFT for Sev 1–2, and name a comms buffer."],
      sre: ["Scope by deployment and region.", "Coordinate failover with Cloud Infrastructure, and open an Azure support case.", "Shed background load."],
      links: [["Playbook: Foundry 5xx", "playbooks.html#pb-foundry-5xx"], ["Model latency", "queries.html#q-model-latency"]]
    },
    r_429: {
      title: "Throttling (429)",
      noc: ["Run sweep query 5 to find the deployment.", "If the Proactive Tips batch is running and Device Care is hit, send the pause-batch request to the Insights CFT.", "Page Cloud Infrastructure and SRE. Never request a scale-out for 429s."],
      sre: ["Find the noisy neighbor with tokens per minute by caller.", "Check retries and concurrency in the Rust services.", "Enable spillover with Cloud Infrastructure if needed."],
      links: [["Playbook: 429 surge", "playbooks.html#pb-429-surge"], ["Token share", "queries.html#q-token-share"], ["Pause-batch request", "noc/action-requests.html#req-pause-tips"]]
    },
    r_401: {
      title: "401 Surge",
      noc: ["Run sweep query 4: all APIs, or one?", "One client version: send the halt-rollout request. All versions: page Cloud Infrastructure.", "Page SRE. Secrets and policies are Cloud Infrastructure decisions."],
      sre: ["Which layer rejected the token: APIM or the Foundry dependency (managed identity)?", "Which cohort: everyone, one build, or scattered devices (clock skew)?", "What changed: APIM policy, app registration, secret expiry, role assignment?"],
      links: [["Playbook: 401 surge", "playbooks.html#pb-401-surge"], ["401 investigation", "sre/investigate.html#401-investigation"], ["401 by client", "queries.html#q-401-by-client"]]
    },
    r_cdn: {
      title: "Edge / CDN Problem (Front Door)",
      noc: ["Run sweep query 3 (edge status codes).", "Declare at high urgency, and page Cloud Infrastructure and SRE.", "Check Azure status for Front Door, and name a comms buffer early."],
      sre: ["Use the layer query to separate the edge from the origin (APIM).", "Read the error info: origin connection, timeout, health probe, WAF?", "Check recent Front Door, WAF, DNS, or certificate changes."],
      links: [["Playbook: CDN / edge", "playbooks.html#pb-cdn-edge"], ["Edge errors", "sre/investigate.html#q-edge-errors"], ["WAF blocks", "queries.html#q-waf"]]
    },
    r_service_err: {
      title: "Our Rust Services Are Failing",
      noc: ["Confirm with the error-rate query, declare, and page the owning CFT plus SRE.", "If one instance is failing health checks, send the restart request to its owner."],
      sre: ["Look at the top exceptions and search for panics.", "Correlate with the service version and roll back if it lines up.", "Check downstream dependency failures that surface as our 500s."],
      links: [["Panics", "sre/investigate.html#q-panics"], ["Top exceptions", "queries.html#q-top-exceptions"], ["Deploy correlation", "queries.html#q-deploy-correlation"]]
    }
  };

  var history = [];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function list(title, cls, items) {
    if (!items || !items.length) return "";
    return '<div class="leader ' + cls + '"><div class="leader-head">' + title + '</div>' +
      '<div class="leader-grid"><ol>' + items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div></div>";
  }

  function render(id) {
    var html = "";
    if (history.length) html += '<div class="triage-crumbs" aria-label="Your answers">' + history.map(function (h) { return "<span>" + esc(h.answer) + "</span>"; }).join("") + "</div>";
    if (Q[id]) {
      var n = Q[id];
      html += '<p class="triage-q" tabindex="-1">' + esc(n.q) + "</p>";
      html += '<p class="triage-help">' + esc(n.help) + (n.link ? ' <a href="' + root + n.link[1] + '">' + esc(n.link[0]) + " →</a>" : "") + "</p>";
      html += '<div class="triage-options">' + n.options.map(function (o, i) {
        return '<button type="button" class="triage-opt" data-i="' + i + '"><b>' + esc(o.label) + "</b><small>" + esc(o.sub) + "</small></button>";
      }).join("") + "</div>";
    } else if (R[id]) {
      var r = R[id];
      html += '<div class="triage-result"><h3 tabindex="-1">' + esc(r.title) + "</h3>" +
        list("NOC Coordinator: Do Now", "noc", r.noc) + list("SRE Technical Lead: Investigate", "sre", r.sre) + list("Manager: Do and Ask", "lead", r.lead) +
        '<div class="triage-links">' + r.links.map(function (l) { return '<a class="btn" href="' + root + l[1] + '">' + esc(l[0]) + "</a>"; }).join("") + "</div>" +
        '<p class="triage-help">No playbook fits? Follow the <a href="' + root + 'sre/investigate.html#method-when-there-is-no-runbook">no-runbook method</a> and write one afterwards.</p></div>';
    }
    if (history.length) html += '<div class="triage-nav"><button type="button" class="link-btn" data-act="back">← Back</button><button type="button" class="link-btn" data-act="restart">Start Over</button></div>';
    app.innerHTML = html;
    app.setAttribute("data-node", id);
    var focusEl = app.querySelector("[tabindex='-1']");
    if (focusEl && history.length) focusEl.focus();
  }

  app.addEventListener("click", function (e) {
    var opt = e.target.closest(".triage-opt");
    var act = e.target.closest("[data-act]");
    var cur = app.getAttribute("data-node");
    if (opt && Q[cur]) {
      var o = Q[cur].options[+opt.getAttribute("data-i")];
      history.push({ node: cur, answer: o.label });
      render(o.go);
    } else if (act) {
      if (act.getAttribute("data-act") === "back" && history.length) render(history.pop().node);
      else { history = []; render("start"); }
    }
  });

  render("start");
})();
