# ai-agent-standards

A small repository of shared instructions and conventions for AI coding agents and maintainers.

## What this repo contains

These files are the main standards for adoption:

- `README.md` — this human-readable guide.
- `instructions.md` — agent behavior and repository-specific instructions.
- `code-conventions.md` — generation and code style guidance.
- `cicd-conventions.md` — CI/CD placement and workflow guidance.
- `commit-conventions.md` — commit message formatting rules.
- `docs-conventions.md` — documentation and README update guidance.
- `repository.md` — repository essentials guidance.

## Why use it

This repository is designed as a template for projects that want a consistent, modular instruction set for AI agents.

Use it to keep conventions separate and easy to copy or reference across repositories.

## How to use it

### Option 1: Copy files into your project

Copy the standard files into your project root:

```bash
cp /path/to/ai-agent-standards/instructions.md .
cp /path/to/ai-agent-standards/code-conventions.md .
cp /path/to/ai-agent-standards/cicd-conventions.md .
cp /path/to/ai-agent-standards/commit-conventions.md .
cp /path/to/ai-agent-standards/docs-conventions.md .
cp /path/to/ai-agent-standards/repository.md .
```

Then update your local README to point to these files.

### Option 2: Reference this repo

If you prefer to keep the standard external, add it as a git submodule or template and document any local overrides in your project README.

```bash
git submodule add <repo-url> ai-agent-standards
```

## Example usage

A project can adopt this standard by placing the root convention files in its repository and using them as the source of truth for AI agent behavior.

Example project structure after adoption:

```text
my-project/
  README.md
  instructions.md
  code-conventions.md
  cicd-conventions.md
  commit-conventions.md
  docs-conventions.md
  repository.md
```

### Example workflow

1. Copy the standard files into your project.
2. Reference `instructions.md` in your project README.
3. Update `README.md` whenever you change `instructions.md` or any convention file.

## Keep this repo in sync

When you update the standard files, update this `README.md` alongside them so adopters always see the latest guidance.

## Suggested prompt

Use this prompt in your consuming project to update the local AI agent instructions file. The agent should use `instructions.md` from this repository as the base instruction set.

```
You are updating the main AI agent instructions file for this project. Use `instructions.md` from the ai-agent-standards repository as the base standard.

Update the project's main instructions file (typically copilot-instructions.md or the equivalent file for other AI agents) so that it:
- explains the project purpose and key files,
- references `instructions.md` as the canonical base instructions,
- preserves the core rule: do not invent build or CI steps unless explicit manifest/build files exist in this repo,
- includes a short "How to use these standards" section with either:
  - copy files into the project root, or
  - reference ai-agent-standards as a submodule/template.

Also add or update the project README to document that it follows `ai-agent-standards` and where to find the shared standard files.

Do not add unrelated content. Keep the instructions concise, specific, and practical.
```

This repository also includes a reusable prompt file for repository readiness checks:

- `repository.md`
