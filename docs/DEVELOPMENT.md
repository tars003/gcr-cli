# Development Philosophy

## How We Build

We vibe code this. That means:
- Ajay is in charge of what gets built and when
- No module gets coded until Ajay has read and approved its implementation doc
- We build one thing at a time, fully, before moving to the next

---

## The Implementation Doc System

Before writing a single line of code for any module or feature, we create an implementation doc.

These docs live in `docs/implementation/`.

**The doc is the plan. The code follows the plan.**

If something changes during coding (and it will), we update the doc to reflect reality.
The docs are always the source of truth for what was built and why.

### Format rules
- Written for a human to read in 2 minutes
- Also precise enough that an AI coding session can use it as a spec
- No pseudocode, no code snippets
- Short sections: what it does, what goes in, what comes out, key decisions
- If a decision is not obvious, explain the reasoning in one line

### Naming
```
docs/implementation/
  01-project-setup.md
  02-config-system.md
  03-agent-adapter.md
  ... and so on
```

Numbers keep them in build order.

---

## The Docs System (User-Facing)

We write user-facing docs in `docs/guide/` as we build.

**Philosophy: simple and straightforward.**
- No jargon
- One thing per page
- If a developer can't understand it in 5 minutes, rewrite it

These docs are written for Darshan (developer) and Ajay (tech lead).
Not for everyone. Specific audience, specific tone.

---

## How a Build Session Works

1. Ajay picks the next thing to build
2. We write (or review) its implementation doc together
3. Ajay approves it — or redirects
4. We code it
5. We update any affected docs
6. Repeat

This keeps Ajay in the driver's seat at every step.
No surprises, no 500-line diffs that went in a direction nobody agreed on.
