<!-- Project-wide AI agent guide: concise, actionable, and specific to this repo. -->
# Copilot / AI Agent Instructions — ai-agent-standards

Purpose
- This repository defines the organisation-level standard for AI assistants working on projects. Use these instructions when editing or generating code, docs, or configuration for projects that adopt this standard.

Big picture
- This repo is a standards repository (not an application). The canonical file is `instructions.md` (which becomes `.agent` in consumer projects).
- Base convention files are in `.agent/base/`: `code-conventions.md`, `assistant-conventions.md`, `cicd-conventions.md`, `commit-conventions.md`, `docs-conventions.md`, `repository-conventions.md`.
- Treat the repo as a template: consumer projects should copy these files into a `.agent/` folder structure so local agents inherit the same conventions.

Modular conventions
- Read `.agent/base/code-conventions.md` for code generation and agent behavior rules.
- Read `.agent/base/assistant-conventions.md` for interactive agent workflow and developer collaboration conventions.
- Read `.agent/base/cicd-conventions.md` for CI/CD placement, workflow conventions, and repo structure.
- Read `.agent/base/commit-conventions.md` for commit message format.
- Read `.agent/base/docs-conventions.md` for documentation and README update rules.
- Read `.agent/base/repository-conventions.md` for repository essentials guidance and suggestion to make repository standard.

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
- Create a `.agent/` folder in your project root
- Copy `instructions.md` and rename it to `.agent` (or place as `.agent/.instructions.md`)
- Copy all convention files into `.agent/base/`: `code-conventions.md`, `assistant-conventions.md`, `cicd-conventions.md`, `commit-conventions.md`, `docs-conventions.md`, `repository-conventions.md`
- Option B (reference): Add this repo as a git submodule; keep a small `.agent` file that references ai-agent-standards base files.

Agent behavior rules (concrete)
- Do not invent project-specific build steps unless you find explicit files such as `package.json`, `pyproject.toml`, or `Makefile`.
- When adding examples or code snippets, prefer small, runnable artifacts and include exact file paths.
- If you cannot determine a convention from repository files, ask a clarifying question rather than guessing.

Files to inspect first
- `README.md`
- `.agent` (or `instructions.md` in ai-agent-standards)
- `.agent/base/assistant-conventions.md`
- `.agent/base/code-conventions.md`
- `.agent/base/cicd-conventions.md`
- `.agent/base/commit-conventions.md`
- `.agent/base/docs-conventions.md`
- `.agent/base/repository-conventions.md`

Questions for maintainers
- Are consuming projects using the `.agent/base/` folder structure consistently?
- Should the base conventions folder be `.agent/base/` or another naming convention?

Prompt library
- This repo includes `repository-conventions.md` (in `.agent/base/`) for developer-facing repository essentials checks.
- Use `instructions.md` (copied as `.agent` in consumer projects) as the master instruction file; other files in `.agent/base/` are topic-specific support documents.

If you update this file
- Update `README.md` concurrently to reflect the change.
