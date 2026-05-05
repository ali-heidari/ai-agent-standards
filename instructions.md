<!-- Project-wide AI agent guide: concise, actionable, and specific to this repo. -->
# Copilot / AI Agent Instructions — ai-agent-standards

Purpose
- This repository defines the organisation-level standard for AI assistants working on projects. Use these instructions when editing or generating code, docs, or configuration for projects that adopt this standard.

Big picture
- This repo is a standards repository (not an application). The canonical files are `README.md`, `instructions.md`, `code-conventions.md`, `cicd-conventions.md`, `commit-conventions.md`, and `docs-conventions.md`.
- Treat the repo as a template: consumer projects should copy or reference these files (submodule, template, or CI copy) so local agents inherit the same conventions.

Modular conventions
- Read `code-conventions.md` for code generation and agent behavior rules.
- Read `assistant-conventions.md` for interactive agent workflow and developer collaboration conventions.
- Read `cicd-conventions.md` for CI/CD placement, workflow conventions, and repo structure.
- Read `commit-conventions.md` for commit message format.
- Read `docs-conventions.md` for documentation and README update rules.
- Read `repository-conventions.md` for repository essentials guidance and suggestion to make repository standard.

When editing this repo
- Preserve the top-level README and update the standards files when conventions change.
- Keep changes minimal and explain rationale in the commit message.

Project-specific conventions
- Commit message format: `type(scope): short summary\n\nBody (optional)\n\nRefs: #<issue>` — types are `feat`, `fix`, `chore`, `docs`, `ci`, `style`, `refactor`, `test`.
- Documentation updates: When code or standards change, update `README.md` and the relevant convention markdown files together.
- CI/CD: No CI is defined here; if you add CI examples, place them under `.github/workflows/` and reference them in `README.md`.

Examples from this repo
- Use `README.md` as the canonical adoption guide.
- Add or update `.gitignore` at project root; this repository includes a minimal example.

How to adopt in your project
- Option A (copy): Copy `instructions.md`, `README.md`, and the convention markdown files into your repo root.
- Option B (reference): Add this repo as a git submodule or use it as a template; keep a small wrapper README explaining local overrides.

Agent behavior rules (concrete)
- Do not invent project-specific build steps unless you find explicit files such as `package.json`, `pyproject.toml`, or `Makefile`.
- When adding examples or code snippets, prefer small, runnable artifacts and include exact file paths.
- If you cannot determine a convention from repository files, ask a clarifying question rather than guessing.

Files to inspect first
- `README.md`
- `instructions.md`
- `assistant-conventions.md`
- `code-conventions.md`
- `cicd-conventions.md`
- `commit-conventions.md`
- `docs-conventions.md`
- `repository-conventions.md`

Questions for maintainers
- Where will consuming projects keep copies of these files (submodule, template, or manual copy)?
- Any language-specific ignore patterns or CI templates you want shipped here?

Prompt library
- This repo includes `repository-conventions.md` for developer-facing repository essentials checks.
- Use `instructions.md` as the single base instruction file for consuming repos; other files in this repository are topic-specific support documents.

If you update this file
- Update `README.md` concurrently to reflect the change.
