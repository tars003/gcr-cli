# 02 · Config

`src/config.ts`

---

## What it does

Reads config and context files from disk. Everything else in the app gets what it needs through this — nothing else reads files directly.

## Files it reads

| File | Location | Committed? |
|---|---|---|
| `config.json` | `.gcr/config.json` in project repo | Yes |
| `credentials.json` | `~/.config/gcr/credentials.json` | No |
| `project-awareness.md` | `.gcr/project-awareness.md` in project repo | Yes |
| `clickup-awareness.md` | `.gcr/clickup-awareness.md` in project repo | Yes |

## What it exports

```
loadConfig()           → GCRConfig
loadCredentials()      → Credentials
loadProjectAwareness() → string
loadClickUpAwareness() → string
```

## Types

**GCRConfig**
- `projectName` — string
- `branches.staging` — string
- `branches.production` — string
- `clickup.lists` — array of `{ name, id }`
- `agent.model` — Bedrock model ID string
- `agent.region` — AWS region string

**Credentials**
- `clickup.apiKey` — string

## Error behaviour

If a required file is missing, throw with a clear message telling the developer exactly which file is missing and where it should be. No silent failures.

Awareness files are optional — return empty string if not found.
