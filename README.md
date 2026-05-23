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

Copy the standard files into your project root:

```bash
cp /path/to/ai-agent-standards/instructions.md .
cp /path/to/ai-agent-standards/assistant-conventions.md .
cp /path/to/ai-agent-standards/code-conventions.md .
cp /path/to/ai-agent-standards/cicd-conventions.md .
cp /path/to/ai-agent-standards/commit-conventions.md .
cp /path/to/ai-agent-standards/docs-conventions.md .
cp /path/to/ai-agent-standards/repository-conventions.md .
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
  repository-conventions.md
```

### Example workflow

1. Copy the standard files into your project.
2. Reference `instructions.md` in your project README.
3. Update `README.md` whenever you change `instructions.md` or any convention file.

## Keep this repo in sync

When you update the standard files, update this `README.md` alongside them so adopters always see the latest guidance.

## Setup prompt (for new or existing projects)

Use this prompt in any project (new, empty, or under development) to enforce ai-agent-standards. This prompt will merge ai-agent-standards with your project's existing instructions if they exist, flagging conflicts for you to resolve.

**COPY AND USE EXACTLY:**

```
**SETUP: Enforce ai-agent-standards for this project**

You are integrating ai-agent-standards (https://github.com/ali-heidari/ai-agent-standards) into this project.

**Step 1: Detect existing instructions**
Check if this project has existing instructions files (instructions.md, .instructions.md, copilot-instructions.md, or similar).

If NO existing instructions found:
- Copy `instructions.md` from ai-agent-standards into this project root: https://github.com/ali-heidari/ai-agent-standards/blob/main/instructions.md
- Skip to Step 3

If YES, existing instructions found:
- Proceed to Step 2

**Step 2: Merge and resolve conflicts**
Compare the existing project instructions with ai-agent-standards/instructions.md. For each difference:
1. Show me the conflict (which rule exists in both, but differs)
2. Show the ai-agent-standards version
3. Show the project's existing version
4. Ask me: "Which rule do you want to use?" (project's explicit rule should generally win, but you're asking for confirmation)

After all conflicts are identified and resolved, merge both files into a final `instructions.md` that:
- Includes ai-agent-standards rules as the base
- Preserves all of the project's explicit rules (especially those that won differently from ai-agent-standards)
- Clearly documents which rules are project-specific overrides

**Step 3: Ensure all referenced files exist**
The `instructions.md` file references other convention files. Ensure they exist in this project (copy from ai-agent-standards or indicate they should be added):
- Check if any convention files mentioned in instructions.md are missing
- Ask me if you should copy them from ai-agent-standards

**Step 4: Update project README**
Add or update a section in this project's README:
```markdown
## Standards and Conventions

This project follows [ai-agent-standards](https://github.com/ali-heidari/ai-agent-standards) for AI agent behavior and conventions, with project-specific overrides documented in `instructions.md`.
```

**Step 5: Confirm completion**
- [ ] `instructions.md` exists and contains merged rules (ai-agent-standards + project overrides)
- [ ] All referenced convention files exist or are noted as missing
- [ ] README documents ai-agent-standards adoption
- [ ] All conflicts have been reviewed and resolved

Reply with: "✓ Setup complete: [list any project-specific overrides]"

Once confirmed, this project will follow ai-agent-standards rules, with your explicit rules taking priority where defined.
```

### After setup is complete

All subsequent AI agent work in that project will automatically follow ai-agent-standards rules, with the project's explicit rules taking priority where they exist.

This repository also includes a reusable prompt file for repository readiness checks:

- `repository-conventions.md`
