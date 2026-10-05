/* Nimbus SRE Incident Companion — shared page chrome and behaviors.
   Pages provide <body data-root="./|../" data-page="id"> and empty #site-header, #sidebar, #pager, #toc, #footer slots. */
(function () {
  "use strict";

  var NAV = [
    { group: "Start", items: [
      { id: "index", href: "index.html", title: "Home & triage" },
      { id: "environment", href: "environment.html", title: "The Nimbus environment" },
      { id: "leaders", href: "leaders.html", title: "For senior managers", lead: true }
    ]},
    { group: "Foundations", items: [
      { id: "fundamentals", href: "fundamentals.html", title: "SRE fundamentals" },
      { id: "incident-response", href: "incident-response.html", title: "Incident response" }
    ]},
    { group: "Troubleshooting", items: [
      { id: "beginner", href: "troubleshooting/beginner.html", title: "Beginner", tier: "beginner" },
      { id: "intermediate", href: "troubleshooting/intermediate.html", title: "Intermediate", tier: "intermediate" },
      { id: "advanced", href: "troubleshooting/advanced.html", title: "Advanced", tier: "advanced" }
    ]},
    { group: "Toolkit", items: [
      { id: "playbooks", href: "playbooks.html", title: "Playbooks" },
      { id: "queries", href: "queries.html", title: "KQL query library" },
      { id: "observability-maturity", href: "observability-maturity.html", title: "Observability maturity" }
    ]},
    { group: "Reference", items: [
      { id: "references", href: "references.html", title: "Glossary & references" }
    ]}
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || "./";
  var page = body.getAttribute("data-page") || "";
  var flat = [];
  NAV.forEach(function (g) { g.items.forEach(function (i) { flat.push(i); }); });

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var CLOUD = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/>' +
    '<path d="M10.5 22.5h11.2a4.3 4.3 0 0 0 .6-8.56 6 6 0 0 0-11.5 1.4 3.6 3.6 0 0 0-.3 7.16z" fill="var(--accent-fg)"/>' +
    '<path d="M12.5 19.2h2l1.2-2.4 1.6 4 1.2-1.6h2" stroke="var(--accent)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  /* ---------- Header ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="sidebar">' + MENU + '</button>' +
      '<a class="brand" href="' + root + 'index.html">' + CLOUD + '<span>Nimbus SRE<small>Incident Companion</small></span></a>' +
      '<div class="header-spacer"></div>' +
      '<a class="incident-cta" href="' + root + 'index.html#triage"><i class="pulse"></i><span>In an incident<span class="cta-long">? Start triage</span></span></a>' +
      '<button class="icon-btn theme-btn" type="button" aria-label="Toggle dark mode"></button>';

    var themeBtn = header.querySelector(".theme-btn");
    var isDark = function () {
      var t = document.documentElement.getAttribute("data-theme");
      if (t) return t === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    var paintTheme = function () {
      themeBtn.innerHTML = isDark() ? SUN : MOON;
      themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
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
      return '<div class="nav-group"><h4>' + esc(g.group) + '</h4>' + g.items.map(function (i) {
        var cur = i.id === page ? ' aria-current="page"' : "";
        var badge = i.tier ? '<span class="badge ' + i.tier + '">' + (i.tier === "beginner" ? "L1" : i.tier === "intermediate" ? "L2" : "L3") + '</span>'
          : i.lead ? '<i class="lead-dot" aria-hidden="true"></i>' : "";
        return '<a href="' + root + i.href + '"' + cur + '><span>' + esc(i.title) + '</span>' + badge + '</a>';
      }).join("") + '</div>';
    }).join("");
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a")) body.classList.remove("nav-open");
    });
  }

  /* ---------- Pager ---------- */
  var pager = document.getElementById("pager");
  if (pager) {
    var idx = -1;
    flat.forEach(function (i, n) { if (i.id === page) idx = n; });
    var html = "";
    if (idx > 0) html += '<a class="prev" href="' + root + flat[idx - 1].href + '"><small>← Previous</small>' + esc(flat[idx - 1].title) + '</a>';
    if (idx >= 0 && idx < flat.length - 1) html += '<a class="next" href="' + root + flat[idx + 1].href + '"><small>Next →</small>' + esc(flat[idx + 1].title) + '</a>';
    pager.innerHTML = html;
    pager.setAttribute("aria-label", "Previous and next pages");
  }

  /* ---------- Footer ---------- */
  var footer = document.getElementById("footer");
  if (footer) {
    footer.innerHTML = 'Nimbus is a fictional product used for training. SRE concepts are summarized from public sources — see ' +
      '<a href="' + root + 'references.html">references</a>. · <a href="https://github.com/LemonadeVodka/sre-incident-companion">Source on GitHub</a>';
  }

  /* ---------- Heading anchors + TOC ---------- */
  var article = document.querySelector("main.content article");
  var toc = document.getElementById("toc");
  if (article) {
    var used = {};
    var heads = article.querySelectorAll("h2, h3");
    var tocLinks = [];
    Array.prototype.forEach.call(heads, function (h) {
      if (h.closest(".card, .triage, .leader")) return;
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
        a.setAttribute("aria-label", "Link to this section");
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

  /* ---------- Senior-manager panels: icon + link to the full guide ---------- */
  var LEAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/><path d="M12 11v3"/></svg>';
  Array.prototype.forEach.call(document.querySelectorAll(".leader-head"), function (h) {
    h.insertAdjacentHTML("afterbegin", LEAD_ICON);
    if (page !== "leaders") {
      h.insertAdjacentHTML("beforeend", '<a href="' + root + 'leaders.html" style="margin-left:auto;font-weight:600;font-size:.85rem">Full manager guide →</a>');
    }
  });

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
    tools.innerHTML = '<span class="progress"></span><button type="button" class="link-btn">Reset checklist</button>';
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
