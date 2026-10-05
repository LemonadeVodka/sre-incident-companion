/* Interactive triage decision tree. Renders into #triage-app. Links are relative to the site root. */
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
        { label: "Latency is high", sub: "Responses are slow, P95/P99 is up, users see spinners", go: "lat_scope" },
        { label: "Error rate is high", sub: "Failures, 4xx/5xx, exceptions, 'something went wrong'", go: "err_type" },
        { label: "Users complain, dashboards look fine", sub: "Support tickets or social posts but no clear signal", go: "r_blind" },
        { label: "An alert fired and I don't know why", sub: "Unfamiliar alert, unclear owner", go: "r_alert" },
        { label: "I'm a manager joining the incident", sub: "What should I do and ask?", go: "r_leader" }
      ]
    },
    lat_scope: {
      q: "How widespread is the slowdown?",
      help: "Run “Latency by feature experience” from the query library and compare to the same hour yesterday.",
      query: "q-latency-by-feature",
      options: [
        { label: "One feature experience", sub: "e.g. only Meeting Recap is slow", go: "lat_one" },
        { label: "Several or all features", sub: "Broad slowdown across CFTs", go: "lat_all" },
        { label: "Only some client versions or devices", sub: "Newest desktop build, a region, a hardware SKU", go: "r_client" }
      ]
    },
    lat_one: {
      q: "Where is the time going inside that feature?",
      help: "Run “Dependency breakdown for one operation” to split time between model calls, retrieval, and your own code.",
      query: "q-dependency-breakdown",
      options: [
        { label: "The Foundry model call", sub: "Model dependency duration is up", go: "r_model_one" },
        { label: "Retrieval or tool calls", sub: "Search index, vector store, Graph/tool APIs", go: "r_retrieval" },
        { label: "Our own service code", sub: "Request time up but dependencies look normal", go: "r_service" },
        { label: "I can't tell — traces are missing", sub: "No dependencies, broken operation_Id", go: "r_no_traces" }
      ]
    },
    lat_all: {
      q: "What do Foundry dependency durations look like across deployments?",
      help: "Run “Model latency by deployment” to compare deployments and regions side by side.",
      query: "q-model-latency",
      options: [
        { label: "Model latency is up everywhere", sub: "Every deployment / CFT shows it", go: "r_foundry_wide" },
        { label: "Models look normal, gateway is slow", sub: "APIM or edge time increased", go: "r_gateway" },
        { label: "It started right after a change", sub: "Deploy, config flip, prompt or model version change", go: "r_change" }
      ]
    },
    err_type: {
      q: "What kind of errors dominate?",
      help: "Run “Error rate by feature and result code” to see the mix.",
      query: "q-error-rate",
      options: [
        { label: "429 Too Many Requests", sub: "Throttling from Foundry or APIM", go: "r_429" },
        { label: "5xx from Foundry", sub: "500/502/503 on the model dependency", go: "r_foundry5xx" },
        { label: "5xx or exceptions in our services", sub: "Our code is throwing", go: "r_service_err" },
        { label: "Timeouts / cancellations", sub: "Client gives up, 408/499, TaskCanceled", go: "r_timeouts" },
        { label: "Content filter blocks", sub: "400 with content_filter, responses refused", go: "r_filter" }
      ]
    }
  };

  var R = {
    r_leader: {
      title: "Manager joining: help the response, don't add to it",
      sev: "Let the IC own severity; ask why it's set where it is",
      steps: [
        "Read the incident channel first. Don't ask for a summary that's already been posted.",
        "Ask once: Who is the IC? What's the customer impact in numbers? When is the next update? What do you need from me?",
        "Be ready for decisions only you can make: extra spend, quality vs availability trade-offs, customer comms, pulling in people.",
        "Handle executive questions yourself or through the comms lead, so responders can keep working.",
        "Afterwards, thank the responders, attend the postmortem, and make sure the action items get funded."
      ],
      links: [["Full guide for senior managers", "leaders.html"], ["Decisions only you can make", "leaders.html#decisions-only-you-can-make"], ["Severity levels", "incident-response.html#severity-levels"]]
    },
    r_blind: {
      title: "Blind spot: users feel it, telemetry doesn't show it",
      sev: "Treat as Sev 3 until you can measure impact",
      steps: [
        "Check telemetry volume — a drop in incoming events often means the problem is upstream of your dashboards (client can't reach us, exporter broken, sampling changed).",
        "Slice by client version and region; desktop issues often hide in one cohort.",
        "Pull 3–5 concrete user reports (time, feature, device) and find their operation_Id if possible.",
        "Look at client-side exceptions and crash telemetry, not just server requests."
      ],
      links: [["Playbook: dashboards green, users complaining", "playbooks.html#pb-dashboards-green"], ["Query: telemetry volume", "queries.html#q-telemetry-volume"], ["Advanced: sampling bias", "troubleshooting/advanced.html#sampling-bias-and-broken-trace-propagation"]]
    },
    r_alert: {
      title: "Unknown alert: make it known in 5 minutes",
      sev: "Severity depends on user impact — measure it first",
      steps: [
        "Read the alert query and threshold. Which table, which cloud_RoleName, which time window?",
        "Find the owner: map cloud_RoleName / feature experience to a CFT using the ownership table.",
        "Check whether users are impacted (error rate, latency for the affected feature). No user impact → lower urgency, still log it.",
        "If it's noisy or ownerless, note it for the alert-hygiene backlog after the incident."
      ],
      links: [["Ownership model", "environment.html#who-owns-what"], ["Severity matrix", "incident-response.html#severity-levels"], ["Beginner troubleshooting", "troubleshooting/beginner.html"]]
    },
    r_client: {
      title: "Cohort-specific: likely a client release or device issue",
      sev: "Sev 2 if a staged rollout is still expanding",
      steps: [
        "Confirm with “Errors and latency by client version”.",
        "Pause or halt the staged rollout of the desktop build while you investigate.",
        "Compare the new build's request shape: payload size, prompt template version, retry settings, region pinning.",
        "Engage the client CFT and release manager."
      ],
      links: [["Playbook: errors after client rollout", "playbooks.html#pb-client-rollout"], ["Query: by client version", "queries.html#q-client-version"]]
    },
    r_model_one: {
      title: "One feature's model calls are slow",
      sev: "Sev 2–3 depending on feature usage",
      steps: [
        "Check whether this feature uses its own deployment or shares one with other CFTs.",
        "Look at token counts — did prompt or completion size grow (new context, bigger retrieval chunks)?",
        "Check time-to-first-token vs total duration: slow TTFT points to queueing/capacity; slow total with normal TTFT points to longer outputs.",
        "Check for a recent prompt template, model version, or max_tokens change."
      ],
      links: [["Playbook: latency spike on one feature", "playbooks.html#pb-latency-one-feature"], ["Playbook: slow first token", "playbooks.html#pb-slow-first-token"], ["Query: token growth", "queries.html#q-token-growth"]]
    },
    r_retrieval: {
      title: "Retrieval or tool calls are the bottleneck",
      sev: "Usually Sev 3, Sev 2 if a top feature",
      steps: [
        "Identify which dependency target (search index, vector DB, Graph API) grew.",
        "Check that dependency's own health and throttling (e.g. search service 503/429).",
        "Look for fan-out growth: did the feature start making more retrieval calls per request?",
        "Mitigate with timeouts + degraded mode (answer without retrieval, or with cached results)."
      ],
      links: [["Intermediate: decomposing latency", "troubleshooting/intermediate.html#decomposing-latency-hop-by-hop"], ["Query: dependency breakdown", "queries.html#q-dependency-breakdown"]]
    },
    r_service: {
      title: "Time is spent in our own code",
      sev: "Sev 3 unless widespread",
      steps: [
        "Check CPU/memory and instance count for the service; look for thread-pool starvation or GC pressure.",
        "Correlate with the last deploy of that service — roll back if it lines up.",
        "Look for synchronous work added to the hot path (logging, serialization, large prompt assembly)."
      ],
      links: [["Query: deploy correlation", "queries.html#q-deploy-correlation"], ["Intermediate troubleshooting", "troubleshooting/intermediate.html"]]
    },
    r_no_traces: {
      title: "You're flying blind on this path",
      sev: "Handle the incident first, file the gap after",
      steps: [
        "Fall back to request-level data: compare requests duration vs dependencies duration grouped by cloud_RoleName over time.",
        "Check if sampling hides the slow requests (look at itemCount).",
        "Ask the CFT for service-side logs or a manual repro with a known operation_Id.",
        "Log the missing instrumentation as an incident follow-up — it's a maturity gap, not your fault."
      ],
      links: [["Advanced: broken trace propagation", "troubleshooting/advanced.html#sampling-bias-and-broken-trace-propagation"], ["Observability maturity", "observability-maturity.html"]]
    },
    r_foundry_wide: {
      title: "Platform-wide model latency",
      sev: "Sev 1–2: many CFTs affected",
      steps: [
        "Declare an incident and page the Platform team — this isn't one CFT's problem.",
        "Check Azure status and Foundry resource health for the region.",
        "Check PTU utilization; if saturated, overflow is spilling to slower pay-as-you-go or queuing.",
        "Mitigate: shift traffic to another region/deployment, shed non-interactive load (Proactive Tips, background summarization)."
      ],
      links: [["Playbook: Foundry 5xx / degradation", "playbooks.html#pb-foundry-5xx"], ["Advanced: regional failover", "troubleshooting/advanced.html#regional-failover"], ["Query: model latency", "queries.html#q-model-latency"]]
    },
    r_gateway: {
      title: "Gateway (APIM) is adding latency",
      sev: "Sev 2: sits in front of every feature",
      steps: [
        "Compare APIM backend time vs total time — is it APIM itself or the backend?",
        "Check APIM capacity units and policy changes (new auth, logging, or retry policies).",
        "Look for retry policies amplifying load on struggling backends."
      ],
      links: [["Advanced: retry storms", "troubleshooting/advanced.html#retry-storms-and-cascading-failure"], ["Intermediate troubleshooting", "troubleshooting/intermediate.html"]]
    },
    r_change: {
      title: "A recent change lines up with the problem",
      sev: "Mitigate first: roll back",
      steps: [
        "Roll back or flip the feature flag. Debug after users are unblocked.",
        "Confirm recovery with the same query you used to detect it.",
        "Record the change ID and timeline for the postmortem."
      ],
      links: [["Query: deploy correlation", "queries.html#q-deploy-correlation"], ["Incident response: mitigation first", "incident-response.html#mitigate-before-you-debug"]]
    },
    r_429: {
      title: "Throttling (429)",
      sev: "Sev 2 if interactive features fail",
      steps: [
        "Find which deployment and which caller (feature experience) is consuming quota — noisy neighbor is common on shared deployments.",
        "Check whether clients honor retry-after; aggressive retries make 429s worse.",
        "Mitigate: throttle or pause background workloads, move a CFT to its own deployment, request quota increase, enable spillover.",
        "Engage Platform for quota/PTU decisions."
      ],
      links: [["Playbook: 429 surge", "playbooks.html#pb-429-surge"], ["Query: 429 by caller", "queries.html#q-429"], ["Advanced: noisy neighbor", "troubleshooting/advanced.html#noisy-neighbor-on-shared-foundry-quota"]]
    },
    r_foundry5xx: {
      title: "Foundry returning 5xx",
      sev: "Sev 1–2 depending on spread",
      steps: [
        "Scope by deployment and region — is it one model deployment or all?",
        "Check Azure status / resource health and open a support case early for Sev 1.",
        "Fail over to a secondary deployment or region if one exists.",
        "Return graceful errors in the client instead of hanging."
      ],
      links: [["Playbook: Foundry 5xx", "playbooks.html#pb-foundry-5xx"], ["Query: error rate", "queries.html#q-error-rate"]]
    },
    r_service_err: {
      title: "Our services are failing",
      sev: "Sev 2–3",
      steps: [
        "Group exceptions by type and problemId to find the dominant failure.",
        "Correlate with deploys and config changes; roll back if aligned.",
        "Check downstream dependency failures that surface as our 500s."
      ],
      links: [["Query: top exceptions", "queries.html#q-top-exceptions"], ["Beginner troubleshooting", "troubleshooting/beginner.html#step-4-find-the-dominant-error"]]
    },
    r_timeouts: {
      title: "Timeouts and cancellations",
      sev: "Treat as latency — users are waiting then failing",
      steps: [
        "Timeouts are usually latency in disguise: go back and decompose latency.",
        "Check timeout budgets — does the client time out before the server does? (wasted server work)",
        "Look for streaming disabled or broken, making users wait for the full completion."
      ],
      links: [["Intermediate: timeout budgets", "troubleshooting/intermediate.html#timeout-budgets"], ["Playbook: slow first token", "playbooks.html#pb-slow-first-token"]]
    },
    r_filter: {
      title: "Content filter blocks spiking",
      sev: "Usually Sev 3; Sev 2 if a feature is unusable",
      steps: [
        "Confirm it's content_filter and not a generic 400 (payload or schema error).",
        "Check for a content filter policy change on the deployment or a prompt template change.",
        "Identify the feature and the filter category triggered.",
        "Coordinate with the responsible AI / policy owner before changing filter settings."
      ],
      links: [["Query: content filter blocks", "queries.html#q-content-filter"], ["Advanced: prompt & model regressions", "troubleshooting/advanced.html#prompt-and-model-regressions"]]
    }
  };

  var history = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function crumbs() {
    if (!history.length) return "";
    return '<div class="triage-crumbs" aria-label="Your answers">' + history.map(function (h) { return "<span>" + esc(h.answer) + "</span>"; }).join("") + "</div>";
  }
  function navLinks() {
    if (!history.length) return "";
    return '<div class="triage-nav"><button type="button" class="link-btn" data-act="back">← Back</button><button type="button" class="link-btn" data-act="restart">Start over</button></div>';
  }

  function render(id) {
    var html = crumbs();
    if (Q[id]) {
      var n = Q[id];
      html += '<p class="triage-q" tabindex="-1">' + esc(n.q) + "</p>";
      html += '<p class="triage-help">' + esc(n.help) +
        (n.query ? ' <a href="' + root + "queries.html#" + n.query + '">Open query →</a>' : "") + "</p>";
      html += '<div class="triage-options">' + n.options.map(function (o, i) {
        return '<button type="button" class="triage-opt" data-i="' + i + '"><b>' + esc(o.label) + "</b><small>" + esc(o.sub) + "</small></button>";
      }).join("") + "</div>";
    } else if (R[id]) {
      var r = R[id];
      html += '<div class="triage-result"><h3 tabindex="-1">' + esc(r.title) + "</h3>" +
        '<p><span class="badge sev2">' + esc(r.sev) + "</span></p>" +
        "<p><strong>Do these next:</strong></p><ol>" + r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        '<div class="triage-links">' + r.links.map(function (l) { return '<a class="btn" href="' + root + l[1] + '">' + esc(l[0]) + "</a>"; }).join("") + "</div></div>";
    }
    html += navLinks();
    app.innerHTML = html;
    app.setAttribute("data-node", id);
    var focusEl = app.querySelector("[tabindex='-1']");
    if (focusEl && history.length) focusEl.focus({ preventScroll: false });
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
