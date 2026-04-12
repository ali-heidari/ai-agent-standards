# ai-agent-standards

This repository defines a lightweight, repo-level standard for AI coding agents and human maintainers to follow.

Adopt this standard
- Option A (copy): Copy `instructions.md`, `code-conventions.md`, `cicd-conventions.md`, `commit-conventions.md`, and `docs-conventions.md` into your project's repository root.
- Option B (reference): Add this repository as a git submodule or use it as a template; keep a small wrapper README explaining local overrides.

Recommended files
- `README.md` — adoption instructions and high-level purpose.
- `instructions.md` — agent behavior and conventions.
- `code-conventions.md` — code generation and file creation rules.
- `cicd-conventions.md` — CI/CD placement and workflow conventions.
- `commit-conventions.md` — commit message format.
- `docs-conventions.md` — documentation update rules.
- `.gitignore` — root ignore patterns.

When you update these standards
- Update this `README.md` at the same time you edit `instructions.md` or any convention markdown file so adopters see the change.
