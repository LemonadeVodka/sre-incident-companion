# SRE Incident Companion

A practical incident-response companion for SREs. It draws on the Google SRE books and modern practice, with beginner, intermediate, and advanced troubleshooting guides.

**Live site:** https://lemonadevodka.github.io/sre-incident-companion/

## The scenario

The guide is set in **Nimbus**, a fictional desktop AI companion:

- **Backbone:** Azure AI Foundry model deployments, shared by every team, behind an Azure API Management gateway.
- **Telemetry:** OpenTelemetry → Azure Application Insights → Grafana.
- **Organization:** five cross-functional teams (CFTs), each owning a "feature experience", plus a Platform team.
- **Maturity:** low on purpose. Fewer than 10% of services have a usable dashboard, naming is inconsistent, and trace propagation is patchy. The guide is written to work in those conditions.
- **Typical incidents:** high latency and high error rates.

## Site map

| Page | What's in it |
|---|---|
| `index.html` | Interactive triage decision tree and a first-15-minutes checklist |
| `environment.html` | Architecture, ownership, telemetry pipeline, and known gaps |
| `leaders.html` | For senior managers: what to do, ask, and avoid, and the decisions only they can make |
| `fundamentals.html` | SLIs/SLOs, error budgets, golden signals, LLM signals, burn-rate alerting |
| `incident-response.html` | Lifecycle, severity levels, roles, mitigation levers, comms templates |
| `troubleshooting/beginner.html` | First responder: confirm, scope, escalate |
| `troubleshooting/intermediate.html` | Latency decomposition, tracing, error types, timeout budgets |
| `troubleshooting/advanced.html` | Noisy neighbors, retry storms, sampling bias, failover, model regressions |
| `playbooks.html` | Six scenario runbooks |
| `queries.html` | KQL query library for Application Insights and Grafana |
| `observability-maturity.html` | Maturity model, scorecard, and a 90-day roadmap |
| `references.html` | Glossary and sources |

## Running locally

The site is plain HTML, CSS, and JavaScript, with no build step and no dependencies.

Open `index.html` directly in a browser, or serve the folder:

```sh
npx serve .          # or: python -m http.server 8000
```

Every page also has a **For senior managers** panel. It frames the topic for non-engineering leaders: what to do, what to ask, and what to avoid.

## Disclaimer

Nimbus, its teams, numbers, and incidents are fictional. The SRE practices are real and are summarized in this guide's own words, with links to the original sources on the references page.
