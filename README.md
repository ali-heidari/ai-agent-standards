# ai-agent-standards

A small repository of shared instructions and conventions for AI coding agents and maintainers.

## What this repo contains

These files are the main standards for adoption:

- `README.md` — this human-readable guide.
- `instructions.md` — agent behavior and repository-specific instructions.
- `assistant-conventions.md` — interactive collaboration and step-by-step agent workflow.
- `code-conventions.md` — generation and code style guidance.
- `cicd-conventions.md` — CI/CD placement and workflow guidance.
- `commit-conventions.md` — commit message formatting rules.
- `docs-conventions.md` — documentation and README update guidance.
- `repository-conventions.md` — repository essentials guidance.

## Why use it

This repository is designed as a template for projects that want a consistent, modular instruction set for AI agents.

Use it to keep conventions separate and easy to copy or reference across repositories.

## How to use it

### Option 1: Copy files into your project

Create a `.agent/` folder structure in your project root and copy files from ai-agent-standards:

```bash
mkdir -p .agent/base
cp /path/to/ai-agent-standards/instructions.md .agent
cp /path/to/ai-agent-standards/code-conventions.md .agent/base/
cp /path/to/ai-agent-standards/assistant-conventions.md .agent/base/
cp /path/to/ai-agent-standards/cicd-conventions.md .agent/base/
cp /path/to/ai-agent-standards/commit-conventions.md .agent/base/
cp /path/to/ai-agent-standards/docs-conventions.md .agent/base/
cp /path/to/ai-agent-standards/repository-conventions.md .agent/base/
```

Then update your local README to document ai-agent-standards adoption.

### Option 2: Reference this repo

If you prefer to keep the standard external, add it as a git submodule and reference it from your `.agent` file:

```bash
git submodule add <repo-url> ai-agent-standards
```

Then create `.agent` file that references the base conventions in the submodule.

## Example usage

A project can adopt this standard by placing the root convention files in its repository and using them as the source of truth for AI agent behavior.

Example project structure after adoption:

```text
my-project/
  README.md
  .agent
  .agent/
    base/
      code-conventions.md
      assistant-conventions.md
      cicd-conventions.md
      commit-conventions.md
      docs-conventions.md
      repository-conventions.md
```

### Example workflow

1. Create `.agent/` folder with base conventions in `.agent/base/`
2. Copy the master instruction file from ai-agent-standards as `.agent`
3. Reference `instructions.md` content in your project's `.agent` file
4. Update `README.md` to document ai-agent-standards adoption with the new folder structure

## Keep this repo in sync

When you update the standard files, update this `README.md` alongside them so adopters always see the latest guidance.

## Setup prompt (for new or existing projects)

Use this prompt in any project (new or under development) to enforce ai-agent-standards.

**COPY AND USE EXACTLY:**

```
You must follow ai-agent-standards/instructions.md (https://github.com/ali-heidari/ai-agent-standards/blob/main/instructions.md) as your base rules for this project.

If this project has existing agent instructions (claude.md, copilot-instructions.md, or any other agent instruction file), check for any explicit rules that differ from ai-agent-standards/instructions.md:
- If a rule is explicitly defined in the project's existing instructions, use that rule (project override takes priority)
- Otherwise, use the rule from ai-agent-standards/instructions.md

Report any conflicts found so I can decide which rule to use. All other rules not explicitly overridden come from ai-agent-standards/instructions.md.
```

### After setup is complete

All AI agent work in this project will follow ai-agent-standards rules, with the project's explicit rules taking priority where defined.

This repository also includes a reusable prompt file for repository readiness checks:

- `repository-conventions.md`
