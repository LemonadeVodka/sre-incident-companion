/* LAYERS question framework data + Question Builder.
   Generic first; Nimbus examples in `eg`. Audiences: noc (plain English, observable), sre (spur technical thinking), exec (business translation). */
(function () {
  "use strict";

  var STEPS = [
    { key: "L", name: "Locate", purpose: "Which layer is it in?",
      core: "Where in the path is this happening: device, edge, gateway, orchestrator, feature, partner, or model?",
      noc: ["Which feature is affected? One, or many?", "Which sweep query shows it? Send me the screenshot.", "Is it one client version, one region, or one partner, or everyone?"],
      sre: ["Which layer is returning the errors or adding the time? How do you know it's that layer and not the one in front of it?", "Does the layer comparison (edge vs gateway vs service vs model) agree with your theory?", "If this layer were healthy, what would we expect to see one layer up and one layer down?"],
      exec: ["The problem is in [layer], which affects [features]. The rest of the product is working normally."],
      good: "Names a layer and shows the data that places it there, for example: \"Errors start at the gateway. Edge traffic is normal, and backends barely see the requests.\"",
      red: ["\"The AI is slow.\" (no layer)", "\"It's probably the network.\" (no evidence)", "Different people name different layers and nobody reconciles them"] },
    { key: "A", name: "Assess", purpose: "How bad, and for whom?",
      core: "How many users are affected, how far from normal, and is it the typical experience (P50) or the bad-day experience (P95)?",
      noc: ["What is the number now, and what is normal for this hour?", "Is it more than 2× normal errors, or 1.5× normal P95?", "Is it getting better, worse, or flat over the last 15 minutes?"],
      sre: ["Is P50 moving or only P95? What does that tell you about who is affected?", "What share of requests or users is affected? Are we counting with itemCount (sampling)?", "Is the error rate counting the right things: user-visible failures, not retries we recover from?"],
      exec: ["About [X%] of [feature] users are seeing [slow responses / errors] for [duration]. Normal is [baseline]."],
      good: "A number, a baseline, and a trend: \"P95 is 14 s against a normal 6 s, about 1 in 8 Writing Assist users, rising for 20 minutes.\"",
      red: ["\"Lots of errors.\"", "An average instead of P50/P95", "No baseline, so nobody knows whether this is normal"] },
    { key: "Y", name: "Yesterday", purpose: "Compared to what? What changed?",
      core: "What is normal for this time, and what changed just before it started?",
      noc: ["Did this happen at the same time yesterday or last week?", "Was there a release, rollout, or partner notice in the last 24 hours?", "When exactly did it start? Write down the time."],
      sre: ["What's the first timestamp it deviates from baseline, and what changed within an hour before it (deploys, flags, model version, routing policy, partner changes)?", "Could traffic itself have changed (a launch, a time zone waking up, a batch job)?", "If nothing changed on our side, what changed on someone else's (Cloud Infrastructure, partner, provider)?"],
      exec: ["It started at [time] and lines up with [change / no known change yet]."],
      good: "A start time and a candidate change, with a correlation shown on a chart.",
      red: ["\"Nothing changed.\" (without checking the deploy and change logs)", "Comparing with the wrong baseline (a weekday vs a weekend)"] },
    { key: "E", name: "Evidence", purpose: "How sure are we?",
      core: "What data shows that, how confident are you, and what would prove us wrong?",
      noc: ["Which query or screen shows this? Paste the link.", "Did two different checks show the same thing?"],
      sre: ["What's your confidence: low, medium, or high? What would raise it?", "What else could explain the same chart? How would we rule it out cheaply?", "Is any telemetry missing or sampled that could be hiding the real picture?"],
      exec: ["We're [highly confident / fairly confident / still investigating] that the cause is [X]."],
      good: "States confidence honestly and names the next check that would confirm it or rule it out.",
      red: ["Certainty without data", "A single hypothesis defended against all evidence", "\"We can't see that.\" accepted without a plan to get visibility"] },
    { key: "R", name: "Response", purpose: "What are we doing about it?",
      core: "What's the safest reversible fix, who owns it, what does it cost, and when will we know it worked?",
      noc: ["Who owns this layer, and have they been paged? When?", "Which pre-agreed request fits (pause, halt, restart, banner)? Has it been sent?", "When is the next update?"],
      sre: ["What's the most reversible mitigation, and what's the risk if it's wrong?", "Can we degrade gracefully instead of failing (a smaller model, no retrieval, disable one partner connector)?", "What decision do you need from me, and by when?"],
      exec: ["We're [action] now. We expect improvement by [time]. [Decision needed: X / No decision needed.]"],
      good: "One owner, one reversible action, an expected effect, and a check time. Decisions are escalated with options and cost.",
      red: ["Debugging the root cause while users stay broken", "\"Someone should…\" (no owner)", "A risky change with no undo plan"] },
    { key: "S", name: "Sustain", purpose: "How do we keep it from coming back?",
      core: "What will we change so we see this sooner next time, or never see it again?",
      noc: ["What would have helped you spot this earlier?", "Which runbook or sweep query should we add or fix?"],
      sre: ["Is this a detection gap, a design gap, or a process gap? What's the one change with the most leverage?", "Should this become an SLO, an alert on burn rate, a release gate, or an architectural change (isolation, circuit breaker, capacity)?", "Which postmortem actions do you need me to get funded or prioritized?"],
      exec: ["To prevent recurrence we're [actions] by [dates]. We need [investment / nothing]."],
      good: "2–5 specific, owned, dated actions that change the system, not \"be more careful\".",
      red: ["No postmortem", "Actions with no owner or date", "Repeating last quarter's action items"] }
  ];

  var LAYERS = [
    { id: "device", name: "Device & On-Device Model", owner: "Client team (Nimbus: Client CFT)",
      what: "The app on the user's machine, and a small local AI model that answers simple requests without the cloud.",
      latency: { signs: "Quick tasks slow on some devices. Slow app startup. The local model is slow on older hardware or a new driver.",
        noc: ["Is it one device model, one client version, or one driver version?", "Do support tickets mention a specific laptop or update?"],
        sre: ["Is client telemetry showing local inference time by hardware or driver?", "Did a local model or driver update ship? What's its rollout percentage?"],
        exec: "Some users on [device/version] see slower quick tasks. Cloud features are unaffected." },
      errors: { signs: "Crashes, local model failures, TLS/proxy failures that never reach the server, clock skew causing 401s.",
        noc: ["Is the crash or error tied to the newest client version?", "Is the server quiet even though users complain? (The failure may be before the cloud.)"],
        sre: ["Are failures visible only in client telemetry? What's our coverage there?", "Should we halt the client or model rollout? What's the health gate?"],
        exec: "A recent app update is failing for [X%] of users. The rollout is paused." } },
    { id: "devorch", name: "Device Orchestrator (Local vs Cloud)", owner: "Client team (Nimbus: Client CFT)",
      what: "Decides whether each request is answered on the device or sent to the cloud. If local fails, it falls back to the cloud.",
      latency: { signs: "Cloud traffic and latency rise with no server change, because local answers are falling back to the cloud.",
        noc: ["Did the share of local answers drop (sweep 7)?", "Is a client or local model rollout in progress right now?"],
        sre: ["What's the fallback rate by local model version? Does the rise follow the rollout curve?", "Is the cloud sized for a fallback surge? Do we cap fallback traffic per version?"],
        exec: "A device update is pushing extra work to the cloud, slowing [features]. We've paused the update and added capacity." },
      errors: { signs: "Routing misconfiguration sends requests to the wrong place. A fallback surge triggers cloud 429s.",
        noc: ["Did 429s start at the same time as a client rollout?"],
        sre: ["Was the routing policy changed? Is it canaried?", "Is fallback rate part of the release gate?"],
        exec: "A routing change caused errors for [feature]. It has been reverted." } },
    { id: "edge", name: "Edge / CDN / WAF", owner: "Platform team (Nimbus: Cloud Infrastructure)",
      what: "The internet-facing entrance: TLS, caching, and the firewall (WAF) in front of everything.",
      latency: { signs: "Slow everywhere at once. Origin timeouts (504).",
        noc: ["Is the edge 5xx rate up (sweep 3)?", "Is it all regions or one?"],
        sre: ["Is the edge slow, or is it waiting on the origin behind it? Compare edge time with gateway time.", "Any CDN, DNS, or certificate change?"],
        exec: "Our internet entry point is slow for [regions]. The platform team is on it with the provider." },
      errors: { signs: "502/503/504 at the edge, 403 from WAF rules. Our services may look quiet.",
        noc: ["Is App Insights unusually quiet while users can't connect?", "Are there 403s? Did a security rule change?"],
        sre: ["What does the edge error info say (origin connection, timeout, probe)?", "Can we roll back the WAF/CDN change safely? Who approves?"],
        exec: "Many users can't connect because of a problem at our network entry point. We're rolling back a recent change." } },
    { id: "gateway", name: "Gateway & Auth", owner: "Platform team (Nimbus: Cloud Infrastructure)",
      what: "Checks credentials, applies rate limits, and routes requests.",
      latency: { signs: "Added time in the gateway itself (policies, token validation).",
        noc: ["Is it slow for all features?"],
        sre: ["What's gateway time minus backend time? Did a policy change add work per request?"],
        exec: "A gateway configuration is adding delay to all features." },
      errors: { signs: "401s (token rejected), 429s (rate limits), auth config changes, signing key rollover.",
        noc: ["Are 401s on all APIs or one (sweep 4)? One client version or all?"],
        sre: ["Which layer rejected the token? Cohort: everyone, one build, or scattered devices (clock skew)?", "Did any secret, certificate, or policy change or expire?"],
        exec: "Some users are being asked to sign in again or are blocked. We've found the configuration change and are reverting it." } },
    { id: "cloudorch", name: "Cloud Orchestrator", owner: "Platform team (Nimbus: Cloud Infrastructure)",
      what: "The shared router that sends each cloud request to the right feature service.",
      latency: { signs: "Every feature slows together while models and services look normal inside.",
        noc: ["Are all features slow at the same time?"],
        sre: ["Is the orchestrator saturated, or is one feature exhausting it? Do we have per-feature bulkheads?"],
        exec: "A shared routing component is slowing every feature. The platform team is scaling it." },
      errors: { signs: "Errors across all features at once.",
        noc: ["Did errors start in all features at the same minute?"],
        sre: ["Was a routing change deployed? Is there a canary for routing changes?"],
        exec: "A shared component failed and affected every feature. We've rolled it back." } },
    { id: "feature", name: "Feature Services & Retrieval", owner: "Feature teams (Nimbus: feature CFTs)",
      what: "Each team's code: builds the prompt, retrieves context, calls the model.",
      latency: { signs: "One feature slow. Retrieval slow. Bigger prompts. A stalled instance (Rust runtime).",
        noc: ["Is it only one feature? Which one?", "Is one instance much slower than others?"],
        sre: ["Where is the time: our code, retrieval, or the model call? Show me P50/P95 per hop.", "Did prompts or context grow (token growth)? Did a deploy add work to the hot path?"],
        exec: "[Feature] is slower after a recent change. The team is rolling it back." },
      errors: { signs: "5xx or panics in one feature, failing dependencies.",
        noc: ["Did errors start after this team's deploy?"],
        sre: ["Top exceptions and panics? Correlated with application_Version?", "Can we degrade gracefully (answer without retrieval)?"],
        exec: "[Feature] is failing for [X%] of requests after a change. We're rolling it back." } },
    { id: "partner", name: "Partner Integrations", owner: "Integrations team (Nimbus: Partner Integrations CFT)",
      what: "Connectors to third-party services: meeting platforms, productivity suites, OEM device APIs, partner AI skills.",
      latency: { signs: "One feature slow only for users of one partner. Partner API slow. Webhooks delayed.",
        noc: ["Is it one partner or all partners?", "What does the partner's status page say?"],
        sre: ["Are our timeouts to the partner shorter than our own latency budget?", "Do we have a circuit breaker and a degraded mode per partner?"],
        exec: "A third-party partner ([partner]) is slow, affecting [feature] for their users. We've switched to a fallback and contacted them." },
      errors: { signs: "Partner 5xx, partner rate limits (429), expired OAuth tokens or consent (401), API/schema changes.",
        noc: ["Are errors only for one partner's users?", "Has the partner escalation contact been notified?"],
        sre: ["Is it partner-side (status page, their errors) or our connector (schema change, token refresh)?", "Can we disable just this connector with a flag and keep the rest working?"],
        exec: "[Partner] is having an outage. Users of [feature] with [partner] are affected. Nothing is wrong with our systems. We've disabled the integration temporarily and are working with the partner." } },
    { id: "model", name: "Model Provider (Capacity & Quota)", owner: "Platform team (Nimbus: Cloud Infrastructure, with Azure)",
      what: "The AI model service: reserved capacity (PTU), overflow capacity, quotas, model versions.",
      latency: { signs: "Slow first token (queueing), longer outputs, region problems, capacity saturation.",
        noc: ["Are 429s or model latency up on one deployment or all?"],
        sre: ["First-token time up or generation time up? Which tells us capacity vs output length?", "How close are we to quota at peak? Who is using it (tokens per minute by caller)?", "Did the model version change (auto-upgrade)?"],
        exec: "Our AI provider capacity is saturated, so responses are slower. We're adding overflow capacity at about $[X] per hour." },
      errors: { signs: "429 throttling (noisy neighbor, retry storms), provider 5xx, content-filter blocks.",
        noc: ["Is it 429 or 5xx? (Different owners and fixes.)", "Is Azure status green?"],
        sre: ["Is a background workload or retry storm consuming quota?", "Should we fail over regions? What's the capacity and data-residency impact?"],
        exec: "Our AI provider is [throttling / failing]. We're [shifting load / failing over]. The provider has been engaged." } },
    { id: "telemetry", name: "Telemetry & Visibility", owner: "Platform team (Nimbus: Cloud Infrastructure Observability)",
      what: "The data we use to see all of the above: SDKs, collector, App Insights, logs, dashboards.",
      latency: { signs: "Charts lag or show gaps. Sampling hides the slow tail.",
        noc: ["Did data volume drop (sweep 6)? Missing data looks like health."],
        sre: ["Is the collector healthy? Is sampling hiding the P95 tail?"],
        exec: "We have a gap in monitoring that delayed detection. Closing it is an action item." },
      errors: { signs: "Users complain while dashboards stay green. Traces break between layers.",
        noc: ["Users complain, but our numbers look fine? Raise it anyway."],
        sre: ["Which part of the path is invisible to us? What would it take to see it?"],
        exec: "Customers noticed before our monitoring did. We're fixing that blind spot." } }
  ];

  var CONTEXTS = {
    incident: { name: "Live Incident", steps: ["L", "A", "Y", "E", "R"], frame: "Ask once, in the incident channel. Keep it short and let the coordinator run the room." },
    weekly: { name: "Weekly Review", steps: ["A", "Y", "E", "S"], frame: "Go through latency and error rates by layer against baseline and SLO. Look for trends, not single spikes." },
    design: { name: "Design / Launch Review", steps: ["L", "R", "S"], frame: "Before launch, ask how this change behaves when its layer is slow or failing, and how we'd know." },
    postmortem: { name: "Postmortem", steps: ["Y", "E", "R", "S"], frame: "Blameless. Ask what made sense at the time, and what will change in the system." }
  };
  var DESIGN_EXTRA = {
    noc: ["What will the NOC see if this breaks, and what should they do first?", "Is there a runbook and an owner on PagerDuty before launch?"],
    sre: ["What's the latency budget for this change, and how does it affect P95?", "What happens when the layer below is slow or returns 429/5xx? Timeouts, retries, circuit breaker, degraded mode?", "How will we see it? Which metric, alert, and dashboard?"],
    exec: ["Launch risk: [low/medium/high]. Mitigations in place: [..]. Monitoring ready: [yes/no]."]
  };

  window.NIMBUS_LAYERS = { STEPS: STEPS, LAYERS: LAYERS, CONTEXTS: CONTEXTS, DESIGN_EXTRA: DESIGN_EXTRA };

  var app = document.getElementById("qb-app");
  if (!app) return;
  var AUD = { noc: "NOC", sre: "SRE Engineers", exec: "Executives" };
  var state = { layer: "unknown", signal: "latency", aud: "sre", ctx: "incident" };
  try { var s0 = JSON.parse(localStorage.getItem("nimbus-qb") || "null"); if (s0) state = s0; } catch (e) { /* ignore */ }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function seg(name, opts, cur) {
    return '<div class="seg" role="group" aria-label="' + name + '">' + Object.keys(opts).map(function (k) {
      return '<button type="button" data-' + name + '="' + k + '" aria-pressed="' + (k === cur) + '">' + esc(opts[k]) + "</button>";
    }).join("") + "</div>";
  }
  function build() {
    var ctx = CONTEXTS[state.ctx], L = null, lines = [];
    LAYERS.forEach(function (x) { if (x.id === state.layer) L = x; });
    lines.push("# " + AUD[state.aud] + " · " + (state.signal === "latency" ? "Latency" : "Error Rate") + " · " + (L ? L.name : "Layer Unknown") + " · " + ctx.name);
    lines.push("");
    lines.push("How to use: " + ctx.frame);
    lines.push("");
    STEPS.forEach(function (st) {
      if (ctx.steps.indexOf(st.key) < 0) return;
      if (st.key === "L" && L && state.aud !== "exec") return;
      lines.push(st.key + " · " + st.name.toUpperCase() + " (" + st.purpose + ")");
      st[state.aud].forEach(function (q) { lines.push("  - " + q); });
    });
    if (L) {
      var sig = L[state.signal];
      lines.push("");
      lines.push("AT THIS LAYER: " + L.name + " (owner: " + L.owner + ")");
      lines.push("  What it looks like: " + sig.signs);
      if (state.aud === "exec") lines.push("  - " + sig.exec);
      else sig[state.aud].forEach(function (q) { lines.push("  - " + q); });
    }
    if (state.ctx === "design") {
      lines.push("");
      lines.push("BEFORE LAUNCH");
      DESIGN_EXTRA[state.aud].forEach(function (q) { lines.push("  - " + q); });
    }
    return lines.join("\n");
  }
  function render() {
    var layerOpts = { unknown: "Don't Know Yet" };
    LAYERS.forEach(function (x) { layerOpts[x.id] = x.name; });
    var ctxOpts = {}; Object.keys(CONTEXTS).forEach(function (k) { ctxOpts[k] = CONTEXTS[k].name; });
    app.innerHTML =
      '<div class="seg-row"><span class="seg-label">Signal</span>' + seg("signal", { latency: "Latency", errors: "Error Rate" }, state.signal) + "</div>" +
      '<div class="seg-row"><span class="seg-label">Audience</span>' + seg("aud", AUD, state.aud) + "</div>" +
      '<div class="seg-row"><span class="seg-label">Context</span>' + seg("ctx", ctxOpts, state.ctx) + "</div>" +
      '<div class="seg-row"><span class="seg-label">Layer</span>' + seg("layer", layerOpts, state.layer) + "</div>" +
      '<div class="code-card"><div class="code-head"><span class="lang">Questions</span><span class="title">Your Question Set<span class="answers">Copy into your notes, 1:1 doc, or the channel</span></span>' +
      '<button type="button" class="copy-btn" data-act="copy">Copy</button></div><pre><code id="qb-out">' + esc(build()) + "</code></pre></div>";
    try { localStorage.setItem("nimbus-qb", JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    ["signal", "aud", "ctx", "layer"].forEach(function (k) { if (b.hasAttribute("data-" + k)) state[k] = b.getAttribute("data-" + k); });
    if (b.getAttribute("data-act") === "copy") {
      var t = document.getElementById("qb-out").textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { if (window.nimbusToast) window.nimbusToast("Questions copied"); });
      return;
    }
    render();
  });
  var fb = document.getElementById("qb-static");
  if (fb) fb.hidden = true;
  render();
})();
