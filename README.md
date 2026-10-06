# SRE Incident Companion

A role-based incident-response companion for the **NOC (Incident Coordinator)**, **SRE On-Call (Technical Lead)**, and **Senior Manager**. It's grounded in the Google SRE books and modern practice, uses a realistic, immature environment as a worked example, and is written to apply anywhere.

**Live site:** https://lemonadevodka.github.io/sre-incident-companion/

## The Worked Example: Nimbus

Nimbus is a fictional desktop AI companion:

- **Built in Rust:** the desktop client, the local Agent, and the cloud services.
- **Two orchestrators:**
  - A **device orchestrator** answers simple requests **on-device** or sends them to the cloud.
  - In the cloud, requests go Front Door (CDN/WAF) → APIM → **cloud orchestrator** → feature services → Azure AI Foundry.
- **Telemetry:** Rust OpenTelemetry → OTel Collector → Application Insights. Front Door and APIM logs go to Log Analytics. Grafana sits on top, with **under 10% dashboard coverage**.
- **Measured at P50 and P95.**
- **Common incidents:** AI latency, error rates, CDN errors, 401s, and local-to-cloud fallback surges.
- **People:**
  - The NOC coordinates incidents but has no production tooling yet.
  - SRE is centralized, not embedded in the CFTs.
  - Five feature CFTs own the features.
  - A powerful **Cloud Infrastructure** CFT owns the shared cloud.
- **Partners:** third-party integrations (meeting platforms, productivity suites, OEM device APIs, partner AI skills) owned by a Partner Integrations CFT.
- **Reality:** a new team, few runbooks, weak postmortems, a locked-down Jira, PagerDuty for paging, a Slack/Teams split, and slow-responding CFTs. The background story also includes **Morgan**, a well-meaning director who dives into the weeds.

## Site Map

| Section | Pages |
|---|---|
| **Start** | Home & Triage · Background · How to Use This Guide · What Good Looks Like (Weak / Good / Best selector) · Onboarding Paths · Using This Guide Anywhere |
| **NOC · Incident Coordinator** | `noc/`: role · watch & detect · triage & escalate · coordinate the incident · requesting actions |
| **SRE · Technical Lead** | `sre/`: role (incl. centralized SRE) · investigate · deep dives · leading the technical response |
| **Senior Manager** | `leaders/`: **Be the Expert in the Room** · Know the Layers · Latency & Errors Primer · **The LAYERS Framework** (Question Builder) · Enabling the NOC · Enabling SRE Engineers · **Updating Executives** (SITREP builder) · During an Incident · **Post-Incident Actions** (After Action Review) · Scenarios · Operating Rhythm · Investing · Jargon |
| **Post-Incident** | `postmortems/`: process · template & writer · running the review · worked example · action items |
| **Practice** | Tabletop exercise kit (timed injects, scored debrief) · printable role cards (`cards/`) |
| **Shared Toolkit** | Fundamentals · incident process · ways of working · starter playbooks · Nimbus KQL · observability maturity · references |

Old URLs (`troubleshooting/*`, `leaders.html`, `noc/safe-actions.html`, `sre/incident-command.html`) redirect to their new pages.

## The LAYERS Framework

The senior manager track is built around **LAYERS**, a six-step question loop asked at the right layer of an AI product (device, local/cloud routing, edge, gateway, cloud orchestrator, feature services, partner integrations, model provider, telemetry) for **latency** and **error rates**:

**L**ocate · **A**ssess · **Y**esterday · **E**vidence · **R**esponse · **S**ustain

Every step has a version for the **NOC** (plain English, scripted), **SRE engineers** (spurs technical thinking), and **executives** (business translation, delivered as a BLUF + SITREP).

## Design

- Tactical "Night Ops" theme by default, with a "Day Ops" toggle. One type system (Barlow Condensed, Barlow, JetBrains Mono via Google Fonts), and a clean monochrome print style for the role cards.
- Headings use standard Title Case.
- Click any heading's `#` to copy a link to that section.
- Interactive tools (triage, What Good Looks Like, postmortem writer, tabletop kit, checklists, KQL "Make It Yours") run entirely in the browser. Saved state stays in that browser.

## Adapting

See **Using This Guide Anywhere** (`adapt.html`) for a term map. In the KQL, Nimbus-specific values are tagged `[NIMBUS]` and highlighted. The generic queries live in **[kql-toolkit](https://github.com/LemonadeVodka/kql-toolkit)**.

## Running Locally

The site is plain HTML, CSS, and JavaScript, with no build step and no dependencies. Open `index.html`, or serve the folder:

```sh
npx serve .          # or: python -m http.server 8000
```

## Disclaimer

Nimbus, its teams, people, numbers, flags, and incidents are fictional. The SRE practices are real and are summarized in this guide's own words, with links to the original sources on the references page.
