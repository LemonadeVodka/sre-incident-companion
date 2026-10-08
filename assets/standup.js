/* Standup Question Picker: pick a Linear column, a signal, and a person to get questions for the SRE daily.
   Mirrors the Question Builder in questions.js. State is remembered in this browser only. */
(function () {
  "use strict";

  var COLUMNS = {
    todo: { name: "Todo", frame: "Is the next thing ready, and is it the right next thing?", q: [
      ["Who owns this, and do they know it's next?", "A named owner who has read the issue."],
      ["What does done look like? Is it written in the issue?", "Acceptance criteria someone else could check."],
      ["Why is this next, rather than the item below it?", "A link to a project, SLO, incident action, or deadline."],
      ["Is it small enough to finish in three days? If not, how would you split it?", "A split, not a shrug."]
    ]},
    progress: { name: "In Progress", frame: "Is it moving, and will it finish?", q: [
      ["How many days has this been In Progress? What's left?", "A concrete remaining step, not \"almost done\"."],
      ["What's the next visible milestone, and when?", "A date or event, not \"soon\"."],
      ["What would make this smaller or faster to finish?", "Cut scope, pair, or ship the first slice."],
      ["Is anything slowing you down that I can clear?", "A specific ask, or an honest \"no\"."]
    ]},
    review: { name: "In Review", frame: "Work in review is finished work that isn't delivering value yet.", q: [
      ["Who's reviewing, and do they know?", "A named reviewer who has been asked directly."],
      ["How long has it been waiting?", "Under a day is healthy. Two or more days is a queue."],
      ["Can someone in the other region review it overnight?", "Follow-the-sun reviews keep work moving."],
      ["What happens once it's approved? Deploy, announce, update the runbook?", "A clear path to done."]
    ]},
    blocked: { name: "Blocked", frame: "Blocked items are your job. Find out what you need to unblock today.", q: [
      ["Blocked on whom, exactly, and since when?", "A person or team and a date, not \"waiting on infra\"."],
      ["What have we already tried?", "Direct ask, channel, ticket, a follow-up with a date."],
      ["What's the cost if this stays blocked another week?", "Impact in user, SLO, or project terms."],
      ["Do you want me to escalate today, or give it one more day?", "Agree a trigger, then follow through."]
    ]},
    done: { name: "Done", frame: "Celebrate it, and check it's really done.", q: [
      ["Did it meet the definition of done: tested, deployed, documented?", "Yes to all three, or a follow-up issue."],
      ["Who needs to know? NOC, the CFT, your director?", "A named audience and channel."],
      ["Does a runbook, dashboard, or alert need updating because of this?", "A link, or a new issue."],
      ["What did we learn that would make the next one faster?", "One concrete lesson."]
    ]}
  };

  var SIGNALS = {
    none: { name: "No Concern", q: [] },
    aging: { name: "Aging (3+ Days)", q: [
      ["This has been In Progress for a while. What changed since we last talked about it?", "Real progress, or a new obstacle."],
      ["If we had to finish it by Friday, what would we cut?", "A smaller first slice."]
    ]},
    wip: { name: "Too Much WIP", q: [
      ["You have several items in flight. Which one should finish first?", "A clear order."],
      ["What can we pause, hand off, or move back to Todo?", "Fewer items in progress, finishing sooner."]
    ]},
    noowner: { name: "No Owner or Estimate", q: [
      ["Who will own this? Let's decide now rather than after the call.", "A name, today."],
      ["Roughly how big is it: a day, three days, or a week or more?", "A size that leads to a split if it's large."]
    ]},
    scope: { name: "Scope Creep", q: [
      ["Is this still the same piece of work we planned?", "Honest yes or no."],
      ["What's the original ask, and what's new? Can the new part be its own issue?", "New work becomes new issues."]
    ]},
    dependency: { name: "Waiting on Another Team", q: [
      ["Which team, which person, and what's their tracking ticket?", "A named contact and a Jira key, linked in Linear."],
      ["When did we last follow up, and what did they say?", "A date and a response."],
      ["Should this go to their manager? Who should send it?", "An agreed escalation, with an owner."]
    ]},
    unplanned: { name: "Unplanned Work", q: [
      ["Where did this come from: incident, NOC request, director ask?", "A source, labeled in Linear."],
      ["What planned work does it push out?", "An explicit trade-off, not a silent slip."],
      ["Should this come back in the next cycle instead of now?", "Not everything urgent is important."]
    ]},
    almostdone: { name: "Always \"Almost Done\"", q: [
      ["What's the very last step, and what's stopping it today?", "A specific step."],
      ["Would pairing for an hour finish it?", "Offer help, without blame."]
    ]}
  };

  var PEOPLE = {
    any: { name: "Anyone", tip: "" },
    junior: { name: "Junior SRE", tip: "Coach, don't rescue. Ask \"How would you find out?\" and wait. Offer the next step only if they're stuck." },
    quiet: { name: "Quiet Engineer", tip: "Invite them by name with an open question, and give the floor before seniors speak. In overlap calls, alternate which region goes first." },
    senior: { name: "Senior SRE", tip: "Challenge the plan: \"What would make this fail?\" \"What's the simpler version?\" \"Who could you teach this to?\"" },
    opslead: { name: "Ops Lead", tip: "Treat them as your TPM apprentice: let them facilitate, then debrief privately on which questions worked." }
  };

  var app = document.getElementById("sp-app");
  if (!app) return;
  var state = { col: "progress", sig: "none", who: "any" };
  try { var s0 = JSON.parse(localStorage.getItem("sre-standup-picker") || "null"); if (s0 && COLUMNS[s0.col] && SIGNALS[s0.sig] && PEOPLE[s0.who]) state = s0; } catch (e) { /* ignore */ }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function seg(name, opts, cur) {
    return '<div class="seg" role="group" aria-label="' + name + '">' + Object.keys(opts).map(function (k) {
      return '<button type="button" data-' + name + '="' + k + '" aria-pressed="' + (k === cur) + '">' + esc(opts[k].name) + "</button>";
    }).join("") + "</div>";
  }
  function build() {
    var c = COLUMNS[state.col], s = SIGNALS[state.sig], p = PEOPLE[state.who], lines = [];
    lines.push("# " + c.name + (state.sig !== "none" ? " · " + s.name : "") + (state.who !== "any" ? " · " + p.name : ""));
    lines.push("Frame: " + c.frame);
    lines.push("");
    var qs = s.q.concat(c.q).slice(0, 5);
    qs.forEach(function (q) { lines.push("- " + q[0]); lines.push("    Listen for: " + q[1]); });
    if (p.tip) { lines.push(""); lines.push("How to ask: " + p.tip); }
    lines.push("");
    lines.push("PULSE check: Priority · Unblock · Load · Scope · ETA");
    return lines.join("\n");
  }
  function render() {
    app.innerHTML =
      '<div class="seg-row"><span class="seg-label">Column</span>' + seg("col", COLUMNS, state.col) + "</div>" +
      '<div class="seg-row"><span class="seg-label">Signal</span>' + seg("sig", SIGNALS, state.sig) + "</div>" +
      '<div class="seg-row"><span class="seg-label">Person</span>' + seg("who", PEOPLE, state.who) + "</div>" +
      '<div class="code-card"><div class="code-head"><span class="lang">Questions</span><span class="title">Ask in the Daily<span class="answers">Up to five questions, with what to listen for</span></span>' +
      '<button type="button" class="copy-btn" data-act="copy">Copy</button></div><pre><code id="sp-out">' + esc(build()) + "</code></pre></div>";
    try { localStorage.setItem("sre-standup-picker", JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    ["col", "sig", "who"].forEach(function (k) { if (b.hasAttribute("data-" + k)) state[k] = b.getAttribute("data-" + k); });
    if (b.getAttribute("data-act") === "copy") {
      var t = document.getElementById("sp-out").textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { if (window.nimbusToast) window.nimbusToast("Questions copied"); });
      return;
    }
    render();
  });
  var fb = document.getElementById("sp-static");
  if (fb) fb.hidden = true;
  render();
})();
