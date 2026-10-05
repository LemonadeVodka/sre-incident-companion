# SRE Incident Companion

An incident-response companion organized around three roles: **NOC (first line of defense)**, **SRE On-Call**, and **Senior Manager**. It's grounded in the Google SRE books and modern practice, and written for a new team in an immature environment.

**Live site:** https://lemonadevodka.github.io/sre-incident-companion/

## The scenario

The guide is set in **Nimbus**, a fictional desktop AI companion:

- **Built in Rust:** the desktop client, the local Agent, and the backend orchestration services.
- **Request path:** Client → Azure Front Door (CDN/WAF) → APIM → Rust services → Azure AI Foundry, with Entra ID auth.
- **Telemetry:** Rust OpenTelemetry → OTel Collector → Application Insights. Front Door and APIM logs go to Log Analytics. Grafana sits on top, with **under 10% dashboard coverage**.
- **Latency measured at P50 and P95 only.**
- **Common incidents:** AI latency, error rates, CDN/edge errors, and 401s.
- **Organization:** five CFTs, each owning a feature experience, plus a Platform team.
- **Reality:** a new team with few runbooks, a locked-down Jira, PagerDuty for paging, our team on Slack while some CFTs use Teams (workflows are Slack-only), and CFTs that sometimes respond slowly.

## Site map

| Track | Pages |
|---|---|
| **Start** | `index.html` (role chooser, handoff diagram, triage) · `environment.html` (background) |
| **NOC** | `noc/`: role · watch & detect (shift health sweep) · triage & escalate · pre-approved actions |
| **SRE On-Call** | `sre/`: role · investigate (layers, P50/P95, CDN, 401, Rust) · deep dives · incident command |
| **Senior Manager** | `leaders/`: path · during an incident · scenarios in plain English · after & between · investing · jargon decoder |
| **Shared** | fundamentals · incident process · ways of working · starter playbooks · Nimbus KQL · observability maturity · references |

Old URLs (`troubleshooting/*.html`, `leaders.html`) redirect to their new homes.

## Adapting the KQL

Every query starts with a parameter block. Nimbus-specific values are tagged `[NIMBUS]` and highlighted on the site. `[TUNE]` values depend on your data, and `[AZURE]` values are real schema. The **Make it yours** form on the Nimbus KQL page swaps in your own names across the whole site.

For generic queries that work in any Azure environment, see **[kql-toolkit](https://github.com/LemonadeVodka/kql-toolkit)**.

## Running locally

The site is plain HTML, CSS, and JavaScript, with no build step and no dependencies. Open `index.html`, or serve the folder:

```sh
npx serve .          # or: python -m http.server 8000
```

## Disclaimer

Nimbus, its teams, numbers, flags, and incidents are fictional. The SRE practices are real and are summarized in this guide's own words, with links to the original sources on the references page.
