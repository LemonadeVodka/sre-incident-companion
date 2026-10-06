# The Reliability Operations Manager's Playbook

A playbook for **senior managers of reliability and service operations**. It has frameworks, copy-paste templates, guidance for leading a contract NOC and a global SRE team, a section on managing up and politics, and a **Technical Corner** that teaches cloud AI infrastructure troubleshooting at manager depth. It's grounded in the Google SRE books and modern practice, uses a realistic, immature environment as a worked example, and is written to apply anywhere.

**Live site:** https://lemonadevodka.github.io/sre-incident-companion/

## Who It's For

A manager who:

- leads a **fully contracted NOC** (through a vendor);
- leads **FTE SREs in the US and India**;
- is developing an **Ops lead** who is still building technical depth;
- reports to a **highly technical director with low EQ**.

Everything is written as **generic archetypes**. Nothing describes a real person or company.

## The Worked Example: Nimbus

Nimbus is a fictional **hybrid, local-first, cross-device AI assistant**:

- **On-device first:** a device orchestrator answers most requests on the device's NPU, using an encrypted on-device personal knowledge base. It sends harder requests to the cloud.
- **Cross-device context:** devices sync directly on the same network, otherwise through an encrypted **sync relay**.
- **Features:** Ask Nimbus, Catch Up, Next Step, Writing Assist, Device Care, Live.
- **Cloud path:** Front Door (CDN/WAF) → APIM → a cloud orchestrator in **Rust** → feature services → Azure AI Foundry.
- **Integrations:** an integration platform (iPaaS) for mail, calendar, chat, and notes, plus a research partner.
- **Telemetry:**
  - OpenTelemetry flows to Application Insights and Grafana, with under 10% dashboard coverage.
  - Latency is measured at **P50 and P95**.
- **Reality:** a new team, few runbooks, weak postmortems, a locked-down Jira, PagerDuty, a Slack/Teams split, slow CFTs, and a powerful Cloud Infrastructure team. **Morgan**, the director archetype, appears in the background story and the tabletop injects.

## Site Map

| Section | Pages |
|---|---|
| **Start** | Manager dashboard (triage, This Week, quick templates) · How to Use · Background: Nimbus · Be the Expert in the Room |
| **Playbook · Frameworks** | `playbook/`: all frameworks · LAYERS · Triage or Incident? · SITREP & BLUF · After Action Review · Decision Memo · RACI & Severity · Weak / Good / Best |
| **Run the Operation** | `operate/`: service operations model · incident operations · during / after an incident · metrics & reporting · vendors & partners · ways of working |
| **Lead the Team** | `team/`: managing a contract NOC · enabling the NOC · leading global SREs · enabling SREs · developing your Ops lead · 1:1s, feedback & performance · hiring & onboarding · morale |
| **Manage Up & Politics** | `politics/`: principles & political capital · stakeholders & influence · managing up (the highly technical, low-EQ leader) · escalation & narrative |
| **Technical Corner** | `tech/`: learning path · know the layers · latency & errors · AI serving & capacity · RAG, agents & model changes · network & identity · observability for AI · troubleshooting walkthrough · deep dives · failure catalog · KQL Training (`kql/`) · Nimbus KQL |
| **Templates** | `templates.html` (22 filterable copy-paste templates) · LAYERS pocket card |
| **Reference** | Playbooks · scenarios · incident process · postmortems · tabletop kit · investing · fundamentals · observability maturity · jargon · using this anywhere · references |

The old NOC and SRE track URLs (`noc/*`, `sre/*`, `troubleshooting/*`, `cards/noc|sre|index.html`, `leaders.html`) redirect to their new pages.

## The LAYERS Framework

**LAYERS** is a six-step question loop asked at the right layer of an AI product, for **latency** and **error rates**. The layers run from the device and local/cloud routing, through the sync relay, edge, gateway, orchestrator, and services, to the integration platform, model provider, and telemetry. The six steps:

**L**ocate · **A**ssess · **Y**esterday · **E**vidence · **R**esponse · **S**ustain

## Design

- Tactical "Night Ops" theme by default, with a "Day Ops" toggle.
- One type system: Barlow Condensed, Barlow, and JetBrains Mono.
- Headings use standard Title Case.
- Click any heading's `#` to copy a link to that section.
- Interactive tools run entirely in the browser: triage, Triage or Incident?, the SITREP builder, the Question Builder, the postmortem writer, the tabletop kit, the KQL quiz, the template filter, and checklists.

## Adapting

See **Using This Guide Anywhere** (`adapt.html`). In the KQL, Nimbus-specific values are tagged `[NIMBUS]` and highlighted. The generic queries live in **[kql-toolkit](https://github.com/LemonadeVodka/kql-toolkit)**.

## Running Locally

The site is plain HTML, CSS, and JavaScript, with no build step and no dependencies. Open `index.html`, or serve the folder:

```sh
npx serve .
```

## Disclaimer

Nimbus, its teams, people, numbers, and incidents are fictional, and the people described are generic archetypes. The SRE and management practices are real and summarized in this guide's own words. The original sources are linked on the references page. Contract-workforce guidance is general. Confirm specifics with your HR, legal, and procurement teams.
