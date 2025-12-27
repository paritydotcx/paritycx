---
name: best-practices
version: 1.0.0
description: Solana and Anchor best practices analysis
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

# Best Practices Skill

Evaluate the provided Solana program against Anchor and Solana best practices.

## Steps

1. Verify program uses InitSpace derive for automatic space calculation
2. Check error definitions provide descriptive messages
3. Validate event emissions for critical state changes
4. Ensure account constraints use typed wrappers over raw AccountInfo
5. Verify instruction handlers follow single-responsibility principle
6. Check for proper use of msg! logging in instruction handlers
