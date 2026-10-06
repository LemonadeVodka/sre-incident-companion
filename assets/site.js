/* Reliability Ops Manager's Playbook — shared page chrome and behaviors.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #pager, #toc, #footer slots. */
(function () {
  "use strict";

  /* Each group is a track. Prev/next paging stays inside the track. */
  var NAV = [
    { group: "Start", track: "start", items: [
      { id: "index", href: "index.html", title: "Manager Dashboard" },
      { id: "how-to-use", href: "how-to-use.html", title: "How to Use This Playbook" },
      { id: "environment", href: "environment.html", title: "Background: Nimbus" },
      { id: "lead", href: "leaders/index.html", title: "Be the Expert in the Room" }
    ]},
    { group: "Playbook · Frameworks", track: "frameworks", items: [
      { id: "playbook", href: "playbook/index.html", title: "All Frameworks" },
      { id: "lead-framework", href: "leaders/layers-framework.html", title: "LAYERS" },
      { id: "pb-triage", href: "playbook/triage-or-incident.html", title: "Triage or Incident?" },
      { id: "lead-exec", href: "leaders/executive-updates.html", title: "SITREP & BLUF" },
      { id: "lead-post", href: "leaders/post-incident.html", title: "After Action Review" },
      { id: "pb-decision", href: "playbook/decision-memo.html", title: "Decision Memo" },
      { id: "pb-raci", href: "playbook/raci-and-severity.html", title: "RACI & Severity" },
      { id: "response-quality", href: "response-quality.html", title: "Weak / Good / Best" }
    ]},
    { group: "Run the Operation", track: "operate", items: [
      { id: "op-model", href: "operate/service-model.html", title: "Service Operations Model" },
      { id: "op-incident", href: "operate/incident-operations.html", title: "Incident Operations" },
      { id: "lead-during", href: "leaders/during-an-incident.html", title: "During an Incident" },
      { id: "lead-after", href: "leaders/after-and-between.html", title: "Operating Rhythm" },
      { id: "op-metrics", href: "operate/metrics-and-reporting.html", title: "Metrics & Reporting" },
      { id: "op-vendors", href: "operate/vendors-and-partners.html", title: "Vendors & Partners" },
      { id: "ways-of-working", href: "ways-of-working.html", title: "Ways of Working" }
    ]},
    { group: "Lead the Team", track: "team", items: [
      { id: "team-noc", href: "team/contract-noc.html", title: "Managing a Contract NOC" },
      { id: "lead-noc", href: "leaders/enabling-the-noc.html", title: "Growing the NOC" },
      { id: "team-global", href: "team/global-sre.html", title: "SREs Across US & India" },
      { id: "lead-sre", href: "leaders/enabling-sre.html", title: "Developing SRE Engineers" },
      { id: "team-ops-lead", href: "team/ops-lead.html", title: "Developing Your Ops Lead" },
      { id: "team-1on1", href: "team/one-on-ones.html", title: "1:1s, Feedback & Performance" },
      { id: "onboarding", href: "onboarding.html", title: "Hiring & Onboarding" },
      { id: "team-morale", href: "team/morale.html", title: "Morale & Burnout" }
    ]},
    { group: "Manage Up & Politics", track: "politics", items: [
      { id: "pol", href: "politics/index.html", title: "Politics Playbook" },
      { id: "pol-stakeholders", href: "politics/stakeholders.html", title: "Stakeholders & Influence" },
      { id: "pol-up", href: "politics/managing-up.html", title: "A Technical, Low-EQ Leader" },
      { id: "pol-escalate", href: "politics/escalation-and-narrative.html", title: "Escalation & Narrative" }
    ]},
    { group: "Technical Corner", track: "tech", items: [
      { id: "tech", href: "tech/index.html", title: "Start Here" },
      { id: "lead-layers", href: "leaders/ai-product-layers.html", title: "Know the Layers" },
      { id: "lead-primer", href: "leaders/latency-and-errors.html", title: "Latency & Errors Primer" },
      { id: "tech-serving", href: "tech/ai-serving.html", title: "LLM Serving & Capacity" },
      { id: "tech-rag", href: "tech/rag-and-agents.html", title: "RAG, Agents & Models" },
      { id: "tech-net", href: "tech/network-and-identity.html", title: "Network & Identity" },
      { id: "tech-obs", href: "tech/observability.html", title: "Observability for AI" },
      { id: "tech-trouble", href: "tech/troubleshooting.html", title: "Troubleshooting Walkthrough" },
      { id: "tech-deep", href: "tech/deep-dives.html", title: "Deep Dives" },
      { id: "tech-catalog", href: "tech/failure-catalog.html", title: "Failure Catalog" },
      { id: "kql", href: "kql/index.html", title: "KQL Training" },
      { id: "kql-basics", href: "kql/basics.html", title: "KQL 1 · Basics" },
      { id: "kql-latency-errors", href: "kql/latency-and-errors.html", title: "KQL 2 · Latency & Errors" },
      { id: "kql-advanced", href: "kql/advanced.html", title: "KQL 3 · Across Layers" },
      { id: "kql-practice", href: "kql/practice.html", title: "KQL Quiz & Cheat Sheet" },
      { id: "queries", href: "queries.html", title: "Nimbus KQL Library" }
    ]},
    { group: "Templates", track: "templates", items: [
      { id: "templates", href: "templates.html", title: "Template Library" },
      { id: "cards", href: "cards/manager.html", title: "LAYERS Pocket Card" }
    ]},
    { group: "Reference", track: "ref", items: [
      { id: "playbooks", href: "playbooks.html", title: "Incident Playbooks" },
      { id: "lead-scenarios", href: "leaders/scenarios.html", title: "Scenarios in Plain English" },
      { id: "incident-response", href: "incident-response.html", title: "Incident Process" },
      { id: "pm", href: "postmortems/index.html", title: "Postmortems" },
      { id: "pm-template", href: "postmortems/template.html", title: "Postmortem Writer" },
      { id: "pm-review", href: "postmortems/review-meeting.html", title: "Running the Review" },
      { id: "pm-example", href: "postmortems/example.html", title: "Worked Postmortem" },
      { id: "pm-actions", href: "postmortems/action-items.html", title: "Action Items" },
      { id: "tabletop", href: "tabletop.html", title: "Tabletop Exercise Kit" },
      { id: "lead-invest", href: "leaders/investing.html", title: "Investing in Reliability" },
      { id: "fundamentals", href: "fundamentals.html", title: "SRE Fundamentals" },
      { id: "observability-maturity", href: "observability-maturity.html", title: "Observability Maturity" },
      { id: "lead-jargon", href: "leaders/jargon.html", title: "Jargon Decoder" },
      { id: "adapt", href: "adapt.html", title: "Using This Anywhere" },
      { id: "references", href: "references.html", title: "Glossary & References" }
    ]}
  ];
  var TRACK_HOME = {};
  var TRACK_LABEL = { noc: "Growing the NOC", sre: "Developing SREs", lead: "Manager Playbook" };
  var PANEL_HOME = { noc: "leaders/enabling-the-noc.html", sre: "leaders/enabling-sre.html", lead: "leaders/index.html" };

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var current = null, currentTrack = "shared";
  NAV.forEach(function (g) { g.items.forEach(function (i) { if (i.id === page) { current = i; currentTrack = g.track; } }); });
  if (TRACK_HOME[currentTrack]) store("nimbus-role", currentTrack);
  var myRole = store("nimbus-role");
  body.setAttribute("data-track", currentTrack);

  var CLOUD = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/>' +
    '<path d="M10.5 22.5h11.2a4.3 4.3 0 0 0 .6-8.56 6 6 0 0 0-11.5 1.4 3.6 3.6 0 0 0-.3 7.16z" fill="var(--accent-fg)"/>' +
    '<path d="M12.5 19.2h2l1.2-2.4 1.6 4 1.2-1.6h2" stroke="var(--accent)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  var ICONS = {
    lead: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>',
    noc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 11l2.5-3 2.5 4 2-2.5L17 11"/></svg>',
    sre: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/></svg>'
  };

  /* ---------- Header ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="sidebar">' + MENU + '</button>' +
      '<a class="brand" href="' + root + 'index.html">' + CLOUD + '<span>Reliability Ops<small>Manager&rsquo;s Playbook</small></span></a>' +
      '<div class="header-spacer"></div>' +
      '<a class="incident-cta" href="' + root + 'index.html#triage"><i class="pulse"></i><span>In an Incident<span class="cta-long">? Start Triage</span></span></a>' +
      '<button class="icon-btn theme-btn" type="button" aria-label="Toggle dark mode"></button>';

    var themeBtn = header.querySelector(".theme-btn");
    var isDark = function () {
      var t = document.documentElement.getAttribute("data-theme");
      return t !== "light";
    };
    var paintTheme = function () {
      themeBtn.innerHTML = isDark() ? SUN : MOON;
      themeBtn.setAttribute("aria-label", isDark() ? "Switch to Day Ops theme" : "Switch to Night Ops theme"); themeBtn.title = isDark() ? "Day Ops" : "Night Ops";
    };
    paintTheme();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      store("nimbus-theme", next);
      paintTheme();
    });

    var menuBtn = header.querySelector(".menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Sidebar ---------- */
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.innerHTML = NAV.map(function (g) {
      var role = !!TRACK_HOME[g.track];
      var cls = "nav-group" + (role ? " t-" + g.track : "") + (role && g.track === myRole ? " mine" : "");
      var open = g.track === "start" || g.track === currentTrack;
      if (open) cls += " open";
      return '<div class="' + cls + '"><h4><button type="button" class="nav-toggle" aria-expanded="' + open + '">' + esc(g.group) + '</button></h4><div class="nav-items">' + g.items.map(function (i) {
        var cur = i.id === page ? ' aria-current="page"' : "";
        return '<a href="' + root + i.href + '"' + cur + '><span>' + esc(i.title) + '</span></a>';
      }).join("") + '</div></div>';
    }).join("");
    sidebar.addEventListener("click", function (e) {
      var t = e.target.closest(".nav-toggle");
      if (t) { var grp = t.closest(".nav-group"); var o = grp.classList.toggle("open"); t.setAttribute("aria-expanded", o ? "true" : "false"); return; }
      if (e.target.closest("a")) body.classList.remove("nav-open");
    });
  }

  /* ---------- Pager (stays inside the current track) ---------- */
  var pager = document.getElementById("pager");
  if (pager && current) {
    var seq = [];
    NAV.forEach(function (g) { if (g.track === currentTrack) g.items.forEach(function (i) { seq.push(i); }); });
    var idx = seq.indexOf(current);
    var html = "";
    if (idx > 0) html += '<a class="prev" href="' + root + seq[idx - 1].href + '"><small>← Previous</small>' + esc(seq[idx - 1].title) + '</a>';
    if (idx >= 0 && idx < seq.length - 1) html += '<a class="next" href="' + root + seq[idx + 1].href + '"><small>Next →</small>' + esc(seq[idx + 1].title) + '</a>';
    pager.innerHTML = html;
    pager.setAttribute("aria-label", "Previous and next pages");
  }

  /* ---------- Role chooser cards remember the role ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-choose-role]"), function (a) {
    a.addEventListener("click", function () { store("nimbus-role", a.getAttribute("data-choose-role")); });
  });

  /* ---------- Footer ---------- */
  var footer = document.getElementById("footer");
  if (footer) {
    footer.innerHTML = 'Nimbus is a fictional product used for training. SRE concepts are summarized from public sources — see ' +
      '<a href="' + root + 'references.html">references</a>. · <a href="https://github.com/LemonadeVodka/kql-toolkit">KQL toolkit</a> · ' +
      '<a href="https://github.com/LemonadeVodka/sre-incident-companion">Source on GitHub</a>';
  }

  /* ---------- Role panels: icon + link to that role's track ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".leader"), function (panel) {
    var role = panel.classList.contains("noc") ? "noc" : panel.classList.contains("sre") ? "sre" : "lead";
    var h = panel.querySelector(".leader-head");
    if (!h) return;
    h.insertAdjacentHTML("afterbegin", ICONS[role]);
    if (!panel.hasAttribute("data-noguide")) {
      var target = panel.getAttribute("data-guide") || PANEL_HOME[role];
      h.insertAdjacentHTML("beforeend", '<a class="guide-link" href="' + root + target + '">' + TRACK_LABEL[role] + ' →</a>');
    }
  });

  /* ---------- KQL placeholder highlighting ----------
     Lines like:  let role = "svc";  // [NIMBUS] explanation
     get the value highlighted and tagged. Copy still copies plain text. */
  var PARAM_RE = /^(\s*let\s+)([A-Za-z_]\w*)(\s*=\s*)(.+?)(;\s*)(\/\/\s*\[(NIMBUS|AZURE|TUNE|CHANGE)\].*)$/;
  Array.prototype.forEach.call(document.querySelectorAll(".code-card pre code"), function (code) {
    var lines = code.textContent.split("\n"), adapt = 0, touched = false;
    var out = lines.map(function (line) {
      var m = line.match(PARAM_RE);
      if (!m) return esc(line);
      touched = true;
      var tag = m[7], val = esc(m[4]);
      if (tag === "NIMBUS" || tag === "CHANGE") { adapt++; val = '<mark class="p-nimbus" data-param="' + m[2] + '" data-orig="' + val + '">' + val + '</mark>'; }
      else if (tag === "TUNE") { adapt++; val = '<span class="p-tune">' + val + '</span>'; }
      return esc(m[1]) + esc(m[2]) + esc(m[3]) + val + esc(m[5]) +
        '<span class="p-tag' + (tag === "NIMBUS" || tag === "CHANGE" ? " nimbus" : "") + '">' + esc(m[6]) + '</span>';
    });
    if (!touched) return;
    code.innerHTML = out.join("\n");
    var head = code.closest(".code-card").querySelector(".code-head");
    if (head && adapt) {
      var chip = document.createElement("span");
      chip.className = "adapt-chip";
      chip.title = "Values to change for your environment";
      chip.textContent = "Adapts: " + adapt + " value" + (adapt > 1 ? "s" : "");
      head.insertBefore(chip, head.querySelector(".title").nextSibling);
    }
  });

  /* ---------- "Make it yours": swap Nimbus values for the reader's own (saved per browser) ---------- */
  var params = {};
  try { params = JSON.parse(store("nimbus-kql-params") || "{}") || {}; } catch (e) { params = {}; }
  function applyParams() {
    Array.prototype.forEach.call(document.querySelectorAll("mark.p-nimbus[data-param]"), function (mk) {
      var v = params[mk.getAttribute("data-param")];
      mk.textContent = v ? JSON.stringify(v) : mk.getAttribute("data-orig");
    });
  }
  applyParams();
  var form = document.getElementById("myq");
  if (form) {
    Array.prototype.forEach.call(form.querySelectorAll("input[data-param]"), function (inp) {
      var k = inp.getAttribute("data-param");
      if (params[k]) inp.value = params[k];
      inp.addEventListener("input", function () {
        var v = inp.value.trim();
        if (v) params[k] = v; else delete params[k];
        store("nimbus-kql-params", JSON.stringify(params));
        applyParams();
      });
    });
    var resetBtn = document.getElementById("myq-reset");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      params = {}; store("nimbus-kql-params", null);
      Array.prototype.forEach.call(form.querySelectorAll("input"), function (i) { i.value = ""; });
      applyParams();
    });
  }

  /* ---------- Heading anchors + TOC ---------- */
  var article = document.querySelector("main.content article");
  var toc = document.getElementById("toc");
  if (article) {
    var used = {};
    var heads = article.querySelectorAll("h2, h3");
    var tocLinks = [];
    Array.prototype.forEach.call(heads, function (h) {
      if (h.closest(".card, .triage, .leader, .role-card")) return;
      if (!h.id) {
        var base = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
        var id = base, n = 2;
        while (used[id] || document.getElementById(id)) id = base + "-" + n++;
        h.id = id;
      }
      used[h.id] = true;
      if (!h.querySelector(".anchor")) {
        var a = document.createElement("a");
        a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#";
        a.setAttribute("aria-label", "Copy link to this section");
        a.title = "Copy link to this section";
        a.addEventListener("click", function (ev) {
          var url = location.href.split("#")[0] + "#" + h.id;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            ev.preventDefault();
            history.replaceState(null, "", "#" + h.id);
            navigator.clipboard.writeText(url).then(function () { toast("Link copied"); }, function () { location.hash = h.id; });
          }
        });
        h.appendChild(a);
      }
      if (h.hasAttribute("data-notoc")) return;
      var clone = h.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".anchor, .badge"), function (el) { el.remove(); });
      tocLinks.push({ id: h.id, text: clone.textContent.trim(), depth: h.tagName === "H2" ? 2 : 3 });
    });
    if (toc) {
      if (tocLinks.length > 2) {
        toc.innerHTML = '<h4>On this page</h4>' + tocLinks.map(function (t) {
          return '<a class="depth-' + t.depth + '" href="#' + t.id + '">' + esc(t.text) + '</a>';
        }).join("");
        toc.setAttribute("aria-label", "On this page");
        if ("IntersectionObserver" in window) {
          var links = toc.querySelectorAll("a");
          var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                Array.prototype.forEach.call(links, function (l) {
                  l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
                });
              }
            });
          }, { rootMargin: "-70px 0px -70% 0px" });
          tocLinks.forEach(function (t) { obs.observe(document.getElementById(t.id)); });
        }
      } else {
        toc.style.visibility = "hidden";
      }
    }
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 1500);
  }
  window.nimbusToast = toast;

  /* ---------- Copy buttons ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".code-card"), function (card) {
    var head = card.querySelector(".code-head");
    var code = card.querySelector("pre");
    if (!head || !code) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.addEventListener("click", function () {
      var text = code.innerText.replace(/\n$/, "");
      var done = function () {
        btn.textContent = "Copied ✓"; btn.classList.add("copied");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
    head.appendChild(btn);
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------- Checklists (state stays in this browser only) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("ul.checklist[data-key]"), function (ul) {
    var key = "nimbus-check-" + ul.getAttribute("data-key");
    var saved = {};
    try { saved = JSON.parse(store(key) || "{}") || {}; } catch (e) { saved = {}; }
    var items = ul.querySelectorAll(":scope > li");
    Array.prototype.forEach.call(items, function (li, n) {
      var label = document.createElement("label");
      var box = document.createElement("input");
      box.type = "checkbox"; box.checked = !!saved[n];
      var span = document.createElement("span");
      while (li.firstChild) span.appendChild(li.firstChild);
      label.appendChild(box); label.appendChild(span); li.appendChild(label);
      box.addEventListener("change", function () {
        saved[n] = box.checked; store(key, JSON.stringify(saved)); count();
      });
    });
    var tools = document.createElement("div");
    tools.className = "checklist-tools";
    tools.innerHTML = '<span class="progress"></span><button type="button" class="link-btn">Reset Checklist</button>';
    ul.parentNode.insertBefore(tools, ul.nextSibling);
    function count() {
      var boxes = ul.querySelectorAll("input"), c = 0;
      Array.prototype.forEach.call(boxes, function (b) { if (b.checked) c++; });
      tools.querySelector(".progress").textContent = c + " of " + boxes.length + " done";
    }
    tools.querySelector("button").addEventListener("click", function () {
      saved = {}; store(key, null);
      Array.prototype.forEach.call(ul.querySelectorAll("input"), function (b) { b.checked = false; });
      count();
    });
    count();
  });
})();
