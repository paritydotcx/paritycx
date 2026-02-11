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
|           |-- solana_provider.py
|           `-- parser.py         # SKILL.md parser
|-- api/
|   |-- package.json
|   |-- tsconfig.json
|   `-- src/
|       |-- server.ts             # Express entry point
|       |-- middleware/
|       |   |-- auth.ts           # JWT / API key auth
|       |   `-- error.ts          # Global error handler
|       |-- routes/
|       |   |-- analyze.ts        # POST /v1/analyze
|       |   |-- skills.ts         # GET  /v1/skills
|       |   |-- context.ts        # GET  /v1/context
|       |   |-- programs.ts       # CRUD /v1/programs
|       |   `-- health.ts         # GET  /v1/health
|       |-- services/
|       |   |-- analysis.ts       # Core analysis engine
|       |   |-- skills.ts         # Skill definitions
|       |   `-- context.ts        # Context engine data
|       `-- utils/
|           `-- logger.ts         # Winston logger
`-- skills/
    |-- security-audit/SKILL.md
    |-- best-practices/SKILL.md
    |-- gas-optimization/SKILL.md
    `-- deep-audit/SKILL.md
```

---

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) 1.75+
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) 0.30.1+
- [Node.js](https://nodejs.org/) 18+
- [Python](https://python.org/) 3.10+
- [Solana CLI](https://docs.solanalabs.com/cli/install) 1.18+

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/parity-cx/parity.git
cd parity

# Build the Solana program
anchor build

# Install TypeScript SDK dependencies
cd sdk/typescript && npm install && npm run build && cd ../..

# Install Python SDK dependencies
cd sdk/python && pip install -e ".[dev]" && cd ../..

# Install API dependencies
cd api && npm install && cd ..
```

### Environment Setup

```bash
# Create a .env file at the project root
cat > .env << 'EOF'
PARITY_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.devnet.solana.com
PORT=3100
NODE_ENV=development
EOF
```

---

## On-Chain Program

The Parity Solana program is an Anchor-based on-chain registry that stores program entries, analysis reports, skill registrations, auditor accounts, verification badges, and context patterns.

### Program Architecture

```
+---------------------+
|      Registry       |  <-- Global singleton PDA
|  authority: Pubkey   |
|  total_programs: u64 |
|  total_analyses: u64 |
+----------+----------+
           |
    +------+-------+-------+----------+-----------+
    |      |       |       |          |           |
    v      v       v       v          v           v
Program  Analysis  Skill  Auditor   Badge    Context
Entry    Report    Entry  Account   Verify   Pattern
```

### Account State

The program defines the following on-chain accounts:

```rust
#[account]
pub struct Registry {
    pub authority: Pubkey,
    pub total_programs: u64,
    pub total_analyses: u64,
    pub total_skills: u64,
    pub total_auditors: u64,
    pub total_patterns: u64,
    pub min_score_for_badge: u8,
    pub analysis_fee_lamports: u64,
    pub is_paused: bool,
    pub bump: u8,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
pub struct ProgramEntry {
    pub owner: Pubkey,
    pub program_hash: [u8; 32],
    pub framework: Framework,
    pub metadata_uri: String,
    pub registered_at: i64,
    pub analysis_count: u32,
    pub latest_score: u8,
    pub is_verified: bool,
    pub bump: u8,
}

#[account]
pub struct AnalysisReport {
    pub program_entry: Pubkey,
    pub auditor: Pubkey,
    pub score: u8,
    pub findings_hash: [u8; 32],
    pub skills_used: Vec<String>,
    pub findings_count: AnalysisFindingsCount,
    pub submitted_at: i64,
    pub version: u8,
    pub bump: u8,
}
```

### PDA Derivation

All accounts use deterministic PDA derivation:

```
Registry:       seeds = ["registry"]
ProgramEntry:   seeds = ["program", program_hash]
AnalysisReport: seeds = ["analysis", program_entry, auditor]
SkillEntry:     seeds = ["skill", skill_name]
AuditorAccount: seeds = ["auditor", authority]
Badge:          seeds = ["badge", program_entry]
ContextPattern: seeds = ["pattern", pattern_id]
```

### Instructions

| Instruction | Description |
|---|---|
| `initialize_registry` | Create the global registry singleton with configuration |
| `register_program` | Register a new program entry with its hash and framework |
| `submit_analysis` | Submit a scored analysis report for a registered program |
| `update_analysis` | Update an existing analysis with new findings |
| `register_skill` | Register a new analysis skill on-chain |
| `update_skill` | Update skill version and description |
| `deprecate_skill` | Mark a skill as deprecated |
| `register_auditor` | Register a new auditor with credentials |
| `update_auditor_status` | Activate or deactivate an auditor |
| `create_verification_badge` | Issue a tier-based verification badge |
| `revoke_verification_badge` | Revoke an issued badge |
| `submit_context_pattern` | Submit a new vulnerability detection pattern |
| `update_registry_config` | Update registry-wide configuration |

### Verification Tiers

Badges are issued based on analysis scores:

| Tier | Minimum Score | Description |
|---|---|---|
| Bronze | 50 | Basic security review passed |
| Silver | 70 | Standard security requirements met |
| Gold | 85 | High security standards with best practices |
| Platinum | 95 | Near-perfect audit with comprehensive coverage |

---

## TypeScript SDK

### Installation

```bash
git clone https://github.com/parity-cx/parity.git
cd parity/sdk/typescript
npm install
npm run build
```

### Quick Start

```typescript
import { ParityClient } from "@parity/sdk";

const client = new ParityClient({
  apiKey: process.env.PARITY_KEY,
});

// Analyze a Solana program
const result = await client.analyze({
  program: "./programs/counter/src/lib.rs",
  framework: "anchor",
  skills: ["security-audit", "best-practices"],
});

console.log(result.score);     // 0-100
console.log(result.findings);  // Finding[]
console.log(result.summary);   // Human-readable summary
```

### Skills API

```typescript
// List all available skills
const skills = await client.skills.list();

// Get a specific skill definition
const skill = await client.skills.get("security-audit");
console.log(skill.name);        // "security-audit"
console.log(skill.version);     // "1.0.0"
console.log(skill.inputs);      // SkillInput[]
console.log(skill.outputs);     // SkillOutput[]

// Resolve a deep-audit into its chain
const chain = await client.skills.getChain("deep-audit");
// chain = ["security-audit", "best-practices", "gas-optimization"]
```

### Context Engine

```typescript
// Query the context engine
const ctx = await client.context.get({
  pattern: "missing-signer-check",
  framework: "anchor",
});

console.log(ctx.rules);              // StaticRule[]
console.log(ctx.auditFindings);      // AuditFindingEntry[]
console.log(ctx.frameworkPatterns);   // FrameworkPatternEntry[]

// Calculate risk score from findings
const score = client.context.calculateRiskScore(ctx.auditFindings);
```

### Solana Provider

```typescript
import { SolanaProvider } from "@parity/sdk";

const provider = new SolanaProvider("https://api.devnet.solana.com");

// Derive PDA addresses
const [registryAddr] = await provider.getRegistryAddress();
const [programAddr]  = await provider.getProgramEntryAddress(programHash);
const [analysisAddr] = await provider.getAnalysisAddress(programEntry, auditor);
const [skillAddr]    = await provider.getSkillAddress("security-audit");

// Fetch on-chain state
const stats = await provider.getRegistryStats();
console.log(stats.totalPrograms);
console.log(stats.totalAnalyses);
```

### SKILL.md Parser

```typescript
import { SkillParser } from "@parity/sdk";

// Parse a SKILL.md file
const skill = SkillParser.parseFile("./skills/security-audit/SKILL.md");
console.log(skill.name);    // "security-audit"
console.log(skill.steps);   // ["Parse the program source...", ...]

// Validate SKILL.md content
const { valid, errors } = SkillParser.validate(content);
if (!valid) {
  console.error("Invalid SKILL.md:", errors);
}

// Serialize back to SKILL.md format
const markdown = SkillParser.serialize(skill);
```

### Output Formats

The analysis engine supports multiple output formats:

```typescript
import { AnalysisEngine } from "@parity/sdk";

// Markdown report
const markdown = AnalysisEngine.formatFindingsAsMarkdown(result.findings);

// SARIF for GitHub Code Scanning
const sarif = AnalysisEngine.formatFindingsAsSarif(
  result.findings,
  "./programs/vault/src/lib.rs"
);
```

---

## Python SDK

### Installation

```bash
git clone https://github.com/parity-cx/parity.git
cd parity/sdk/python
pip install -e .
```

### Quick Start

```python
from parity_sdk import ParityClient, ParityConfig, AnalyzeOptions

config = ParityConfig(api_key="your_api_key_here")

with ParityClient(config) as client:
    result = client.analyze(AnalyzeOptions(
        program="./programs/counter/src/lib.rs",
        framework="anchor",
        skills=["security-audit", "best-practices"],
    ))

    print(f"Score: {result.score}")
    print(f"Summary: {result.summary}")

    for finding in result.findings:
        print(f"  [{finding.severity}] {finding.title}")
        print(f"    Location: {finding.location.file}:{finding.location.line}")
        print(f"    Fix: {finding.recommendation}")
```

### Skills API

```python
from parity_sdk import ParityClient, ParityConfig

with ParityClient(ParityConfig(api_key="key")) as client:
    # List all skills
    skills = client.skills.list()
    for skill in skills:
        print(f"{skill.name} v{skill.version}: {skill.description}")

    # Get a specific skill
    audit = client.skills.get("security-audit")
    print(audit.inputs)   # [SkillInput(...), ...]
    print(audit.outputs)  # [SkillOutput(...), ...]

    # Resolve deep-audit chain
    chain = client.skills.get_chain("deep-audit")
    # ["security-audit", "best-practices", "gas-optimization"]
```

### Context Engine

```python
from parity_sdk import ParityClient, ParityConfig, ContextQuery

with ParityClient(ParityConfig(api_key="key")) as client:
    # Query the context engine
    ctx = client.context.get(ContextQuery(
        pattern="missing-signer-check",
        framework="anchor",
    ))

    for rule in ctx.rules:
        print(f"[{rule.severity}] {rule.id}: {rule.description}")

    # Calculate risk score
    score = client.context.calculate_risk_score(ctx.audit_findings)
    print(f"Risk score: {score}/100")
```

### Solana Provider

```python
from parity_sdk import SolanaProvider

provider = SolanaProvider(rpc_url="https://api.devnet.solana.com")

# Derive PDA addresses
registry_addr, bump = provider.get_registry_address()
program_addr, bump = provider.get_program_entry_address(program_hash_bytes)
skill_addr, bump = provider.get_skill_address("security-audit")
```

### SKILL.md Parser

```python
from parity_sdk import SkillParser

# Parse from file
skill = SkillParser.parse_file("./skills/security-audit/SKILL.md")
print(f"{skill.name} v{skill.version}")
print(f"Steps: {len(skill.steps)}")

# Validate
valid, errors = SkillParser.validate(content)
if not valid:
    for err in errors:
        print(f"  Error: {err}")

# Serialize
markdown = SkillParser.serialize(skill)
```

---

## REST API

The Parity API provides programmatic access to all analysis capabilities.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/analyze` | Analyze a Solana program |
| `POST` | `/v1/analyze/batch` | Batch analyze multiple programs |
| `GET` | `/v1/skills` | List all available skills |
| `GET` | `/v1/skills/:name` | Get a specific skill definition |
| `GET` | `/v1/skills/:name/chain` | Get skill execution chain |
| `GET` | `/v1/context` | Query the context engine |
| `GET` | `/v1/context/rules` | Get static analysis rules |
| `GET` | `/v1/context/findings` | Get curated audit findings |
| `GET` | `/v1/context/patterns` | Get framework patterns |
| `GET` | `/v1/context/categories` | List vulnerability categories |
| `GET` | `/v1/programs` | List registered programs |
| `GET` | `/v1/programs/stats` | Get registry statistics |
| `GET` | `/v1/programs/:hash` | Get a program by hash |
| `POST` | `/v1/programs` | Register a new program |
| `GET` | `/v1/health` | Health check |

### Analysis Request

```bash
curl -X POST https://api.parity.cx/v1/analyze \
  -H "Authorization: Bearer $PARITY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "program": "use anchor_lang::prelude::*; ...",
    "framework": "anchor",
    "skills": ["security-audit", "best-practices"],
    "output": "json"
  }'
```

### Analysis Response

```json
{
  "score": 62,
  "findings": [
    {
      "severity": "critical",
      "title": "Missing signer check on withdraw instruction",
      "location": {
        "file": "program.rs",
        "line": 47,
        "instruction": "withdraw"
      },
      "description": "The withdraw instruction does not verify that the authority account has signed the transaction.",
      "recommendation": "Add a Signer constraint to the authority account.",
      "pattern": "missing-signer-check"
    }
  ],
  "summary": "Found 1 critical and 2 high severity issues. Overall score: 62/100.",
  "skills": ["security-audit", "best-practices"],
  "metadata": {
    "framework": "anchor",
    "analyzedAt": "2026-02-17T00:00:00.000Z",
    "duration": 342
  }
}
```

### Running the API Server

```bash
cd api
npm install
npm run dev
# Server starts on http://localhost:3100
```

---

## Skills

Skills are modular analysis workflows defined in SKILL.md files. Each skill follows the SKILL.md specification with YAML frontmatter and natural-language instructions.

### Built-in Skills

| Skill | Type | Description |
|---|---|---|
| `security-audit` | Security | Comprehensive vulnerability analysis: signer checks, arithmetic, PDAs, CPI |
| `best-practices` | Quality | Code organization, error handling, events, typed accounts |
| `gas-optimization` | Performance | Compute unit efficiency, account packing, rent optimization |
| `deep-audit` | Comprehensive | Multi-pass chained audit with cross-skill correlation |

### SKILL.md Format

```yaml
---
name: security-audit
version: 1.0.0
description: Comprehensive Solana program security analysis
inputs:
  - name: program
    type: file
    required: true
  - name: framework
    type: string
    default: anchor
outputs:
  - name: findings
    type: Finding[]
  - name: score
    type: number
---

# Security Audit Skill

## Steps

1. Parse the program source and resolve all account structures
2. Check for missing signer validations on privileged instructions
3. Verify arithmetic operations use checked math or overflow protection
4. Validate CPI calls have correct program ID checks
5. Ensure PDA seeds are deterministic and not attacker-controlled
6. Check account constraints (has_one, constraint, seeds)
7. Verify close account logic drains lamports and zeros data
8. Score the program 0-100 based on finding severity
```

### Skill Chaining

The `deep-audit` skill automatically chains three skills:

```
security-audit --> best-practices --> gas-optimization
                                          |
                                          v
                                   Cross-correlation
                                          |
                                          v
                                   Optimized Code
```

---

## Context Engine

The Context Engine provides structured knowledge across three layers:

### Static Analysis Rules

500+ AST-level vulnerability patterns covering:
