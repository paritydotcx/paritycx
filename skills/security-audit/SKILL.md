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

Analyze the provided Solana program for security vulnerabilities.

## Steps

1. Parse the program source and resolve all account structures
2. Check for missing signer validations on privileged instructions
3. Verify arithmetic operations use checked math or overflow protection
4. Validate CPI calls have correct program ID checks
5. Ensure PDA seeds are deterministic and not attacker-controlled
6. Check account constraints (has_one, constraint, seeds)
7. Verify close account logic drains lamports and zeros data
8. Score the program 0-100 based on finding severity
