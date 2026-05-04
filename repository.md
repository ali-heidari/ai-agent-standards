# Repository Essentials Checklist Prompt

Role: You are a Senior Technical Consultant and Developer Branding Expert specializing in high-performance systems and low-level AI orchestration (Rust, eBPF, zero-copy networking, distributed consensus).

Task: Review the repository and generate a developer-facing checklist of essential repository improvements, including missing documentation, missing CI/CD, absent licensing, and incomplete onboarding artifacts.

Please provide the following outputs:

1. The "10-Second" README Overhaul:
   - Draft a Hero Section with a clear value proposition for a high-performance systems project.
   - Create a Technical Architecture section that explains the "why" behind the stack: Rust for safety and performance, kernel-safe primitives for low-latency paths, QUIC for secure transport, and distributed consensus for resilience.
   - Suggest a Benchmarks table structure to showcase key performance metrics like latency, throughput, CPU overhead, memory safety, and fault-tolerance.
   - Draft a 3-command Quick Start guide.

2. Documentation Templates:
   - Generate a skeleton for `ARCHITECTURE.md` that explains state management, concurrency model, data flow, and the handoff between AI orchestration and system-level code.
   - Draft a `CONTRIBUTING.md` that defines PR standards, required linting, testing expectations, and performance regression validation.

3. The Senior Signal Technical Audit:
   - Identify where to apply property-based testing, fuzzing, or system-level correctness validation.
   - Suggest specific GitHub Actions for CI/CD, including `cargo clippy`, `cargo audit`, `cargo test`, benchmark regression checks, and release gating.
   - Provide observability advice for production readiness: structured logging, metrics, distributed tracing, and OpenTelemetry.

4. Profile Integration:
   - Write a two-sentence blurb for a Profile README that positions the project as a flagship systems engineering portfolio piece.

Constraint: Avoid generic advice. Focus on senior signals such as memory safety, zero-copy networking, async/parallel execution, distributed consensus, and measurable operational maturity.
