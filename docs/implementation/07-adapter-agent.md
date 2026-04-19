# 07 · Adapter: Agent

`src/adapters/agent.ts`

---

## What it does

Bridge to Claude on AWS Bedrock via pi-mono. Opens a session, runs prompts, streams responses back via a callback. Session stays alive between calls so context carries forward.

## pi-mono packages used

| Package | Used for |
|---|---|
| `@mariozechner/pi-ai` | `getModel('amazon-bedrock', modelId)` |
| `@mariozechner/pi-agent-core` | Agent runtime, event types |
| `@mariozechner/pi-coding-agent` | `createAgentSession`, `SessionManager`, `AuthStorage`, `ModelRegistry` |

## Exports

| Function | Arguments | Returns |
|---|---|---|
| `createSession(modelId, region)` | strings | `Promise<GCRSession>` |
| `prompt(session, text, onDelta)` | session, string, callback | `Promise<string>` — full response |
| `closeSession(session)` | session | `void` |

## GCRSession type

Wraps the pi-mono session object. Opaque to callers — they just pass it around.

## Key decisions

- Sessions are in-memory only (`SessionManager.inMemory()`) — nothing written to disk
- AWS region: set via `process.env.AWS_REGION` if not already present in environment
- `onDelta(text)` is called for each streaming chunk — the workflow decides what to do with it (display to terminal, collect, etc.)
- Subscribe/unsubscribe per `prompt()` call so each call gets its own delta stream
- If model ID is not found in pi-mono's registry, throw with a helpful message
- AWS credentials come from standard chain (`~/.aws/credentials` or env vars) — no custom handling

## What it does NOT do

No UI. Does not read config. Does not own prompt text — workflows pass prompts in.
