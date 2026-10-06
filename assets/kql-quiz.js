/* KQL quiz: read the query, spot the bug, pick the operator. Instant feedback; score kept in this browser. */
(function () {
  "use strict";
  var app = document.getElementById("quiz-app");
  if (!app) return;
  var Q = [
    { tag: "Read the Query", q: "What does this query return?", code: "requests\n| where timestamp > ago(1h)\n| summarize total = sum(itemCount) by cloud_RoleName",
      opts: ["The 10 most recent requests", "The number of requests per service in the last hour", "The average duration per service", "Failed requests only"], a: 1,
      why: "summarize … by cloud_RoleName gives one row per service. sum(itemCount) is the real request count." },
    { tag: "Read the Query", q: "A manager sees P50 = 2.4 s (normal 2.5 s) and P95 = 14 s (normal 6 s). What does that most likely mean?", code: "",
      opts: ["Everyone is slower", "A subset of requests is much slower: one region, instance, partner, or long prompts", "The data is wrong", "Errors are up"], a: 1,
      why: "The typical request (P50) is normal. Only the slowest 5% got worse, so look for the subset." },
    { tag: "Spot the Bug", q: "This error-rate query always shows 0. Why?", code: "requests\n| where timestamp > ago(1h)\n| summarize total = count(), failed = countif(success == false)\n| extend error_pct = failed / total * 100",
      opts: ["count() is not allowed", "Whole-number division: failed / total is 0 before multiplying. Use 100.0 * failed / total", "success should be in quotes", "ago(1h) is wrong"], a: 1,
      why: "With whole numbers, 3 / 1000 = 0. Write 100.0 * failed / total. Also prefer sum(itemCount) over count() on sampled tables." },
    { tag: "Spot the Bug", q: "This query is very slow and mixes old data with today's incident. What's missing?", code: "requests\n| where cloud_RoleName == \"writing-assist-svc\"\n| summarize p95 = percentile(duration, 95)",
      opts: ["A time filter, like where timestamp > ago(1h)", "A take 10", "render timechart", "Nothing"], a: 0,
      why: "Always filter on time first. It's faster and it keeps you looking at the right moment." },
    { tag: "Pick the Operator", q: "You want the number of real requests in a sampled Application Insights table. Which do you use?", code: "",
      opts: ["count()", "sum(itemCount)", "dcount(operation_Id)", "avg(itemCount)"], a: 1,
      why: "With sampling, one row may stand for several requests. itemCount says how many." },
    { tag: "Pick the Operator", q: "Which shows WHEN a problem started?", code: "",
      opts: ["top 10 by duration desc", "summarize … by bin(timestamp, 5m) | render timechart", "project timestamp", "take 100"], a: 1,
      why: "Bucketing by time and drawing a chart shows when the line changes." },
    { tag: "Pick the Operator", q: "You want only columns timestamp, name, and resultCode. Which operator?", code: "",
      opts: ["extend", "project", "summarize", "where"], a: 1,
      why: "project keeps only the listed columns. extend adds columns, and where filters rows." },
    { tag: "Read the Query", q: "Which layer is this query looking at?", code: "dependencies\n| where timestamp > ago(1h) and target has_any (dynamic([\"api.zoom.us\", \"graph.microsoft.com\"]))\n| summarize failed = sumif(itemCount, success == false) by target",
      opts: ["The edge / CDN", "Partner integrations", "The device", "The model provider"], a: 1,
      why: "Zoom and Microsoft Graph are third-party partner APIs our services call." },
    { tag: "Spot the Bug", q: "The query finds nothing in the demo workspace. Why?", code: "AppRequests\n| where timestamp > ago(1h)\n| take 10",
      opts: ["AppRequests uses TimeGenerated, not timestamp", "take must come first", "ago only works with days", "AppRequests needs quotes"], a: 0,
      why: "Workspace tables use TimeGenerated. Classic tables (requests) use timestamp." },
    { tag: "Read the Query", q: "Where should you run this query?", code: "AzureDiagnostics\n| where TimeGenerated > ago(1h) and Category == \"FrontDoorAccessLog\"",
      opts: ["Application Insights → Logs", "The Log Analytics workspace that receives Front Door logs", "Grafana only", "The device"], a: 1,
      why: "Front Door (edge) and APIM (gateway) logs go to Log Analytics, not Application Insights." },
    { tag: "Pick the Operator", q: "You want to connect each request to the dependency calls it made. Which operator and key?", code: "",
      opts: ["union on timestamp", "join on operation_Id", "summarize by target", "extend operation_Id"], a: 1,
      why: "A request and its dependencies share operation_Id (the trace ID). join lines them up." },
    { tag: "Read the Query", q: "Why do our queries start with a block of let statements tagged [NIMBUS], [TUNE], [AZURE]?", code: "",
      opts: ["KQL requires it", "So environment-specific values sit in one place and the query is easy to adapt safely", "To make queries faster", "It's for Grafana only"], a: 1,
      why: "Change the top block and leave the body alone. [NIMBUS] means must change, [TUNE] means adjust, and [AZURE] means real schema." }
  ];
  var KEY = "nimbus-kql-quiz";
  var picks = {};
  try { picks = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { picks = {}; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render() {
    var answered = Object.keys(picks).length, right = 0;
    Object.keys(picks).forEach(function (i) { if (picks[i] === Q[i].a) right++; });
    var html = '<div class="score-out"><b>' + right + "/" + Q.length + '</b><div class="meter" aria-hidden="true"><i style="width:' + Math.round(100 * right / Q.length) + '%"></i></div><span>' + answered + " answered · " +
      '<button type="button" class="link-btn" data-act="reset">Reset</button></span></div>';
    html += Q.map(function (x, i) {
      var p = picks[i], done = p !== undefined;
      return '<div class="panel"><span class="badge neutral">' + esc(x.tag) + '</span> <b>Q' + (i + 1) + ".</b> " + esc(x.q) +
        (x.code ? '<pre class="quiz-code"><code>' + esc(x.code) + "</code></pre>" : "") +
        '<div class="seg quiz-opts" role="group">' + x.opts.map(function (o, j) {
          var cls = done ? (j === x.a ? "right" : (j === p ? "wrong" : "")) : "";
          return '<button type="button" class="' + cls + '" data-q="' + i + '" data-o="' + j + '" aria-pressed="' + (p === j) + '"' + (done ? " disabled" : "") + ">" + esc(o) + "</button>";
        }).join("") + "</div>" +
        (done ? '<p class="quiz-why"><b class="' + (p === x.a ? "q-best" : "q-weak") + '">' + (p === x.a ? "Correct." : "Not quite.") + "</b> " + esc(x.why) + "</p>" : "") + "</div>";
    }).join("");
    app.innerHTML = html;
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.getAttribute("data-act") === "reset") { picks = {}; } else if (b.hasAttribute("data-q")) { picks[b.getAttribute("data-q")] = +b.getAttribute("data-o"); } else return;
    try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch (e2) { /* ignore */ }
    render();
  });
  render();
})();
