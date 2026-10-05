/* Interactive triage decision tree. Renders into #triage-app. Links are relative to the site root.
   Results give separate steps for the NOC and for SRE on-call. */
(function () {
  "use strict";
  var app = document.getElementById("triage-app");
  if (!app) return;
  var root = document.body.getAttribute("data-root") || "./";

  var Q = {
    start: {
      q: "What are you seeing right now?",
      help: "Pick the closest match. You can step back at any point.",
      options: [
        { label: "Latency is high", sub: "P50/P95 up, spinners, slow answers", go: "lat_scope" },
        { label: "Error rate is high", sub: "Failures, 4xx/5xx, exceptions", go: "err_type" },
        { label: "Everything is failing at once", sub: "All features, \"can't connect\"", go: "r_cdn" },
        { label: "Users complain, signals look fine", sub: "Support tickets, quiet telemetry", go: "r_blind" },
        { label: "An alert fired and I don't know why", sub: "Unfamiliar alert, unclear owner", go: "r_alert" },
        { label: "I'm a manager joining", sub: "What should I do and ask?", go: "r_leader" }
      ]
    },
    lat_scope: {
      q: "How widespread is the slowdown?",
      help: "Run sweep query 2 (P50/P95 by feature, now vs yesterday).",
      link: ["Open the query", "queries.html#q-latency-by-feature"],
      options: [
        { label: "One feature", sub: "e.g. only Writing Assist", go: "lat_one" },
        { label: "Several or all features", sub: "Broad slowdown", go: "r_foundry_wide" },
        { label: "Some client versions or devices only", sub: "Newest build, a region", go: "r_client" }
      ]
    },
    lat_one: {
      q: "Is it slow to start, or slow overall?",
      help: "Streaming features: compare time-to-first-token with total time.",
      link: ["Open the query", "queries.html#q-ttft"],
      options: [
        { label: "Slow to start (first token)", sub: "Spinner stays longer", go: "r_ttft" },
        { label: "Slow overall / not streamed", sub: "Total time is up", go: "r_latency_one" },
        { label: "One instance much slower than others", sub: "Rust runtime stall?", go: "r_instance" }
      ]
    },
    err_type: {
      q: "What kind of errors dominate?",
      help: "Run the error-rate query, and the layer comparison if you can.",
      link: ["Errors by layer", "sre/investigate.html#q-layers"],
      options: [
        { label: "401 Unauthorized", sub: "Credentials rejected", go: "r_401" },
        { label: "5xx / 403 at the edge (Front Door)", sub: "Before our code runs", go: "r_cdn" },
        { label: "429 Too Many Requests", sub: "Foundry throttling", go: "r_429" },
        { label: "5xx from Foundry", sub: "Model dependency failing", go: "r_foundry_wide" },
        { label: "5xx or panics in our services", sub: "Our Rust code failing", go: "r_service_err" },
        { label: "Only the newest client version", sub: "Since an update", go: "r_client" }
      ]
    }
  };

  var R = {
    r_leader: {
      title: "Manager joining: help the response, don't add to it",
      noc: [], sre: [],
      lead: [
        "Read the Slack incident channel first. It's the source of truth.",
        "Ask once: Who is IC? What's the impact in numbers? When is the next update? What do you need from me?",
        "Be ready to decide on spend, quality trade-offs, customer messaging, and pulling in people.",
        "If a CFT hasn't responded in 45 minutes, contact its leadership directly."
      ],
      links: [["During an incident", "leaders/during-an-incident.html"], ["Decisions only you can make", "leaders/during-an-incident.html#decisions-only-you-can-make"], ["Jargon decoder", "leaders/jargon.html"]]
    },
    r_alert: {
      title: "Unknown alert: make it known in 5 minutes",
      noc: ["Read the alert: which table, which service, what threshold?", "Check user impact with the sweep queries. If there's none, it's lower urgency, but still note it.", "Find the owner in the ownership table and page them. If unclear, page SRE."],
      sre: ["Decide whether the alert reflects user impact. If not, file it for alert cleanup.", "Make sure someone owns writing a runbook for it."],
      links: [["Who owns what", "environment.html#who-owns-what"], ["NOC sweep", "noc/detect.html#shift-health-sweep"], ["Severity levels", "incident-response.html#severity-levels"]]
    },
    r_blind: {
      title: "Blind spot: users feel it, telemetry doesn't show it",
      noc: ["Run the telemetry-volume sweep. A drop means data loss, not health.", "Collect 3–5 concrete user reports (time, feature, version).", "Open a channel and page SRE."],
      sre: ["Check the OTel Collector and the edge logs. Failures before our code won't appear in App Insights.", "Slice by client version and region.", "Build an ad-hoc panel to measure impact, then follow the evidence."],
      links: [["Playbook: dashboards green", "playbooks.html#pb-dashboards-green"], ["Telemetry volume", "queries.html#q-telemetry-volume"], ["Edge errors", "sre/investigate.html#q-edge-errors"]]
    },
    r_client: {
      title: "Cohort-specific: a client release or device issue",
      noc: ["Confirm with the by-client-version query.", "Halt the staged rollout (pre-approved).", "Page the Client CFT and SRE."],
      sre: ["Compare the new build's errors, 401s, and crashes with the previous build.", "Disable the new code path with a server flag if possible.", "Keep the rollout paused until a fix is verified."],
      links: [["Playbook: client rollout", "playbooks.html#pb-client-rollout"], ["By client version", "queries.html#q-client-version"], ["Halt rollout", "noc/safe-actions.html#act-halt-rollout"]]
    },
    r_latency_one: {
      title: "One feature is slow",
      noc: ["Confirm against yesterday and open the channel.", "Page the owning CFT, plus SRE if it's Sev 2."],
      sre: ["Split P50/P95 per hop: model, retrieval, or our own code?", "Check for a deploy or prompt change and roll back if it lines up.", "Check token growth."],
      links: [["Playbook: one feature", "playbooks.html#pb-latency-one-feature"], ["Per-hop query", "sre/investigate.html#q-hops"], ["Token growth", "queries.html#q-token-growth"]]
    },
    r_ttft: {
      title: "Slow first token",
      noc: ["Page the feature CFT, and SRE if other features on the same deployment are slow too."],
      sre: ["Capacity (PTU queueing) or prompt size? Check token growth and PTU utilization.", "Shed background load, trim context, and confirm streaming is on."],
      links: [["Playbook: slow first token", "playbooks.html#pb-slow-first-token"], ["TTFT query", "queries.html#q-ttft"]]
    },
    r_instance: {
      title: "One instance stalled (likely Rust async runtime)",
      noc: ["Confirm with P50/P95 by instance.", "Restart that one instance (pre-approved), and only one.", "Tell SRE and the CFT, with the instance name."],
      sre: ["Look for blocking work on the tokio runtime, or pool exhaustion.", "If it recurs, roll back the latest deploy."],
      links: [["By instance", "sre/investigate.html#q-by-instance"], ["Rust failure modes", "sre/investigate.html#rust-service-failure-modes"], ["Restart instance", "noc/safe-actions.html#act-restart-instance"]]
    },
    r_foundry_wide: {
      title: "Model layer degraded across features",
      noc: ["Page Platform and SRE at high urgency.", "Check the Azure status page.", "Turn on the in-app banner if Sev 1–2 is declared."],
      sre: ["Scope by deployment and region.", "Coordinate failover with Platform, and open an Azure support case.", "Shed background load."],
      links: [["Playbook: Foundry 5xx", "playbooks.html#pb-foundry-5xx"], ["Model latency", "queries.html#q-model-latency"]]
    },
    r_429: {
      title: "Throttling (429)",
      noc: ["Run sweep query 5 to find the deployment.", "If the Proactive Tips batch is running and Device Care is hit, pause it (pre-approved).", "Page Platform and SRE. Don't scale out."],
      sre: ["Find the noisy neighbor with tokens per minute by caller.", "Check retries and concurrency in the Rust services.", "Enable spillover with Platform if needed."],
      links: [["Playbook: 429 surge", "playbooks.html#pb-429-surge"], ["Token share", "queries.html#q-token-share"], ["Pause batch", "noc/safe-actions.html#act-pause-tips"]]
    },
    r_401: {
      title: "401 surge",
      noc: ["Run sweep query 4: all APIs, or one?", "Check whether it's one client version. If so, halt the rollout.", "Page Platform (all versions) or the Client CFT (one version), plus SRE. Don't touch secrets or policies."],
      sre: ["Which layer rejected the token: APIM or the Foundry dependency (managed identity)?", "Which cohort: everyone, one build, or scattered devices (clock skew)?", "What changed: APIM policy, app registration, secret expiry, role assignment?"],
      links: [["Playbook: 401 surge", "playbooks.html#pb-401-surge"], ["401 investigation", "sre/investigate.html#401-investigation"], ["401 by client", "queries.html#q-401-by-client"]]
    },
    r_cdn: {
      title: "Edge / CDN problem (Front Door)",
      noc: ["Run sweep query 3 (edge status codes).", "Page Platform and SRE at high urgency, because impact is usually broad.", "Check Azure status for Front Door."],
      sre: ["Use the layer query to separate the edge from the origin (APIM).", "Read the error info: origin connection, timeout, health probe, WAF?", "Check recent Front Door, WAF, DNS, or certificate changes."],
      links: [["Playbook: CDN / edge", "playbooks.html#pb-cdn-edge"], ["Edge errors", "sre/investigate.html#q-edge-errors"], ["WAF blocks", "queries.html#q-waf"]]
    },
    r_service_err: {
      title: "Our Rust services are failing",
      noc: ["Confirm with the error-rate query and page the owning CFT plus SRE.", "If one instance is failing health checks, restart it (pre-approved)."],
      sre: ["Look at the top exceptions and search for panics.", "Correlate with the service version and roll back if it lines up.", "Check downstream dependency failures that surface as our 500s."],
      links: [["Panics", "sre/investigate.html#q-panics"], ["Top exceptions", "queries.html#q-top-exceptions"], ["Deploy correlation", "queries.html#q-deploy-correlation"]]
    }
  };

  var history = [];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function list(title, cls, items) {
    if (!items || !items.length) return "";
    return '<div class="leader ' + cls + '" style="margin:12px 0"><div class="leader-head" style="padding:8px 14px">' + title + '</div>' +
      '<div class="leader-grid" style="padding:8px 14px 2px"><ol>' + items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div></div>";
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
        list("NOC: do now", "noc", r.noc) + list("SRE on-call: investigate", "sre", r.sre) + list("Manager: do and ask", "lead", r.lead) +
        '<div class="triage-links">' + r.links.map(function (l) { return '<a class="btn" href="' + root + l[1] + '">' + esc(l[0]) + "</a>"; }).join("") + "</div>" +
        '<p class="triage-help" style="margin-top:12px">No playbook fits? Follow the <a href="' + root + 'sre/investigate.html#method-when-there-is-no-runbook">no-runbook method</a> and write one afterwards.</p></div>';
    }
    if (history.length) html += '<div class="triage-nav"><button type="button" class="link-btn" data-act="back">← Back</button><button type="button" class="link-btn" data-act="restart">Start over</button></div>';
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
