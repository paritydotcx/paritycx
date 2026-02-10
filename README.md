<p align="center">
  <img src="https://img.shields.io/badge/PARITY-Solana%20Verification%20Layer-0f0f0f?style=for-the-badge&labelColor=0f0f0f&color=6366f1" alt="Parity" />
</p>

<p align="center">
  <strong>AI-native verification layer for Solana smart contracts.</strong><br/>
  Composable analysis skills and APIs that enable AI agents to perform audit-level code review.
</p>

<p align="center">
  <a href="https://parity.cx/"><img src="https://img.shields.io/badge/Website-parity.cx-6366f1?style=flat-square&logo=safari&logoColor=white&labelColor=1e1b4b" alt="Website" /></a>
  <a href="https://x.com/paritydotcx"><img src="https://img.shields.io/badge/Twitter-@paritydotcx-6366f1?style=flat-square&logo=x&logoColor=white&labelColor=1e1b4b" alt="Twitter" /></a>
  <img src="https://img.shields.io/badge/Solana-Devnet-6366f1?style=flat-square&logo=solana&logoColor=white&labelColor=1e1b4b" alt="Solana" />
  <img src="https://img.shields.io/badge/Anchor-0.30.1-6366f1?style=flat-square&logo=rust&logoColor=white&labelColor=1e1b4b" alt="Anchor" />
  <img src="https://img.shields.io/badge/License-MIT-6366f1?style=flat-square&logoColor=white&labelColor=1e1b4b" alt="License" />
</p>

---

Parity ships a Solana on-chain registry, a TypeScript SDK, a Python SDK, a REST API, and a set of composable analysis skills that turn general-purpose AI coding agents into specialized Solana auditors. Point any agent -- Claude Code, Cursor, Cline, OpenCode -- at a program and get structured, severity-scored findings with remediation guidance.

---

## Table of Contents

- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
- [On-Chain Program (Rust / Anchor)](#on-chain-program)
- [TypeScript SDK](#typescript-sdk)
- [Python SDK](#python-sdk)
- [REST API](#rest-api)
- [Skills](#skills)
- [Context Engine](#context-engine)
- [Analysis Pipeline](#analysis-pipeline)
- [CI/CD Integration](#cicd-integration)
- [License](#license)

---

## Architecture

```
+------------------------------------------------------------------+
|                        AI Coding Agent                           |
|         (Claude Code / Cursor / Cline / OpenCode)                |
+-------------------------------+----------------------------------+
                                |
                   SKILL.md Instructions
                                |
                                v
+-------------------------------+----------------------------------+
|                          Parity SDK                              |
|                   (TypeScript / Python)                          |
|                                                                  |
|  +------------+  +------------+  +-----------+  +-------------+  |
|  |  Analyze   |  |   Skills   |  |  Context  |  |   Solana    |  |
|  |  Engine    |  |   API      |  |  Engine   |  |   Provider  |  |
|  +------+-----+  +------+-----+  +-----+-----+  +------+------+  |
|         |               |              |                |         |
+---------+---------------+--------------+----------------+---------+
          |               |              |                |
          v               v              v                v
+------------------------------------------------------------------+
|                        Parity REST API                           |
|                                                                  |
|  POST /v1/analyze    GET /v1/skills    GET /v1/context           |
|  GET  /v1/programs   GET /v1/health                              |
+-------------------------------+----------------------------------+
                                |
                                v
+-------------------------------+----------------------------------+
|                    Solana Program (Anchor)                        |
|                                                                  |
|  +----------+  +----------+  +--------+  +-------+  +---------+ |
|  | Registry |  | Analysis |  | Skills |  | Badge |  | Context | |
|  | init     |  | submit   |  | register| | create|  | pattern | |
|  | register |  | update   |  | update |  | revoke|  | submit  | |
|  +----------+  +----------+  +--------+  +-------+  +---------+ |
+------------------------------------------------------------------+
```

## Repository Layout

```
parity/
|-- Anchor.toml                   # Anchor framework configuration
|-- Cargo.toml                    # Rust workspace root
|-- LICENSE
|-- README.md
|-- programs/
|   `-- parity/
|       |-- Cargo.toml
|       |-- Xargo.toml
|       `-- src/
|           |-- lib.rs            # Program entry point
|           |-- state.rs          # Account state definitions
|           |-- errors.rs         # Custom error codes
|           |-- context_engine.rs # Vulnerability rules & patterns
|           |-- skills.rs         # Built-in skill definitions
|           `-- instructions/
|               |-- mod.rs
|               |-- registry.rs   # Registry & program registration
|               |-- analysis.rs   # Analysis submission & update
|               |-- skill_registry.rs
|               |-- auditor.rs    # Auditor management
|               |-- badge.rs      # Verification badges
|               `-- context.rs    # Context pattern submission
|-- sdk/
|   |-- typescript/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   `-- src/
|   |       |-- index.ts
|   |       |-- client.ts         # ParityClient
|   |       |-- types.ts          # Type definitions
|   |       |-- constants.ts
|   |       |-- skills.ts         # SkillsApi
|   |       |-- context.ts        # ContextApi
|   |       |-- analysis.ts       # AnalysisEngine
|   |       |-- solana.ts         # SolanaProvider
|   |       `-- parser.ts         # SKILL.md parser
|   `-- python/
|       |-- pyproject.toml
|       `-- parity_sdk/
|           |-- __init__.py
|           |-- client.py         # ParityClient
|           |-- types.py          # Dataclass definitions
|           |-- constants.py
|           |-- skills.py         # SkillsApi
|           |-- context.py        # ContextApi
|           |-- analysis.py       # AnalysisEngine