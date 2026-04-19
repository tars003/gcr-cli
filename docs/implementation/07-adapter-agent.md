# 07 — Adapter: Agent

Covers: `src/adapters/agent.ts`

---

## What it is

The bridge to Claude on AWS Bedrock via pi-mono. Opens an agent session, runs prompts, streams responses back to whoever is listening. The session stays alive between operations so context carries forward.

## Dependencies

- `@mariozechner/pi-ai` — `getModel()`
- `@mariozechner/pi-agent-core` — `Agent` class, event types
- `@mariozechner/pi-coding-agent` — `createAgentSession()`, `SessionManager`, `AuthStorage`, `ModelRegistry`
- AWS credentials from the standard chain (`~/.aws/credentials` or environment variables)

## What it gives out

A class or set of functions that wrap a session lifecycle:

- `createSession(modelId, region)` — opens an in-memory agent session with the given Bedrock model. Returns a session handle.
- `prompt(session, promptText, onDelta)` — sends a prompt to the session. Streams response back via `onDelta(text)` callback as each chunk arrives. Returns the full response text when complete.
- `closeSession(session)` — disposes the session and frees resources.

## Key decisions

- Sessions are **in-memory only** (`SessionManager.inMemory()`) — nothing is written to disk. GCR does not persist agent conversations.
- The session stays open between the code review and task matching steps. This is intentional — the AI's review analysis is already in context when it matches tasks.
- `onDelta` callback is how the calling code shows streaming output in the terminal. The adapter does not know or care about UI — it just fires the callback with each text chunk.
- AWS region is passed in from config. AWS credentials come from the standard chain — no custom credential handling needed.
- A new session is created per workflow run. Sessions are not shared across `gcr` invocations.

## What it does NOT do

No UI. Does not read config directly — receives model ID and region as arguments. Does not decide what prompts to send — workflows own the prompts.

## Build order

Step 4. No dependencies on other project modules. Most complex adapter — build last among the four.
