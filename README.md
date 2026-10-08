# The Senior Manager's SRE & Operations Playbook

Six playbooks for a **senior manager of SRE and operations**, plus the frameworks behind them, copy-paste templates, and a **Technical Corner** that teaches cloud AI infrastructure troubleshooting at manager depth. It's grounded in the Google SRE books and modern practice, uses a realistic, immature environment as a worked example, and is written to apply anywhere.

**Live site:** https://lemonadevodka.github.io/sre-ops-playbook/

## Who It's For

A manager who:

- leads a **fully contracted NOC** (through a vendor);
- leads **FTE SREs in the US and India**;
- is developing an **Ops lead** who is still building technical depth;
- reports to a **highly technical director with low EQ**.

The SRE team runs a daily standup in the US/India overlap hours over a **Linear** board. Everything is written as **generic archetypes**. Nothing describes a real person or company.

## The Playbooks

| # | Playbook | What's in it |
|---|---|---|
| 1 | **Incident Management** (`leaders/index.html`) | Triage or Incident? · incident operations · during an incident · LAYERS · SITREP & BLUF · RACI & severity · incident process · scenario runbooks · scenarios in plain English · tabletop kit |
| 2 | **Post-Incident & Problem Management** (`postmortems/`) | After Action Review · postmortem writer · running the review · worked postmortem · action items |
| 3 | **Execution & Delivery: The TPM Hat** (`delivery/`) | The SRE daily (walk the board, **PULSE**, Standup Question Picker) · Linear operating model · planning & capacity · risks & dependencies (RAID) |
| 4 | **Service Operations** (`operate/`) | Five practices · SLOs & error budgets · operating rhythm · metrics & reporting · vendors & partners · ways of working · observability maturity · investing in reliability |
| 5 | **People & Team** (`team/`) | Contract NOC: vendor management and building capability · SRE team: global operating model and developing engineers · Ops lead · 1:1s & feedback · hiring & onboarding · morale |
| 6 | **Stakeholders & Politics** (`politics/`) | Political capital · stakeholder mapping · pre-wiring · decision memo · a technical, low-EQ director · escalation & narrative |

Every playbook hub has the same **Playbook at a Glance** block: when to use it, the plays, the frameworks, the templates, how you know it's working, and a Weak / Good / Best rubric.

The rest of the site:

- **Start:** a manager dashboard with incident triage, a This Week checklist, and the six playbooks. Also How to Use, Background: Nimbus, and the Framework Index.
- **Technical Corner** (`tech/`, `kql/`): AI serving & capacity, RAG & agents, network & identity, observability for AI, a troubleshooting walkthrough, deep dives, a failure catalog, SRE fundamentals, and KQL Training.
- **Toolkit:** a filterable Template Library (28 templates), the LAYERS pocket card, the Nimbus KQL library, Weak / Good / Best, Using This Anywhere, and references.

Old URLs (`noc/*`, `sre/*`, `troubleshooting/*`, `cards/noc|sre|index.html`, `leaders.html`) redirect to their new pages.

## The Worked Example: Nimbus

Nimbus is a fictional **hybrid, local-first, cross-device AI assistant**:

- **On-device first:** a device orchestrator answers most requests locally on the NPU. It sends harder requests to the cloud.
- **Cross-device sync:** an encrypted sync relay keeps context in step across devices.
- **Features:** Ask Nimbus, Catch Up, Next Step, Writing Assist, Device Care, Live.
- **Cloud path:** Front Door → APIM → a cloud orchestrator in Rust → feature services → Azure AI Foundry.
- **Integrations:** an integration platform (iPaaS) and a research partner.
- **Telemetry:** OpenTelemetry → Application Insights → Grafana, measured at **P50 and P95**.
- **Reality:** a new team, few runbooks, weak postmortems, a locked-down Jira, PagerDuty, a Slack/Teams split, slow CFTs, and a powerful Cloud Infrastructure team. **Morgan**, the director archetype, appears in the background story and the tabletop injects.

## Design

- Tactical "Night Ops" theme by default, with a "Day Ops" toggle.
- One type system: Barlow Condensed, Barlow, and JetBrains Mono.
- Headings use standard Title Case.
- Click any heading's `#` to copy a link to that section.
- Interactive tools run entirely in the browser: triage, Triage or Incident?, the SITREP builder, the LAYERS Question Builder, the Standup Question Picker, the postmortem writer, the tabletop kit, the KQL quiz, the template filter, and checklists.

## Adapting

See **Using This Anywhere** (`adapt.html`). In the KQL, Nimbus-specific values are tagged `[NIMBUS]`. The generic queries live in **[kql-toolkit](https://github.com/LemonadeVodka/kql-toolkit)**.

## Running Locally

The site is plain HTML, CSS, and JavaScript, with no build step and no dependencies. Open `index.html`, or run `npx serve .`.

## Disclaimer

Nimbus, its teams, people, numbers, and incidents are fictional, and the people described are generic archetypes. The practices are real and summarized in this guide's own words, with sources on the references page. Contract-workforce guidance is general. Confirm specifics with your HR, legal, and procurement teams.
