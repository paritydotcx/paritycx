---
name: gas-optimization
version: 1.0.0
description: Compute unit optimization for Solana programs
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
  - name: compute_units
    type: number
---

# Gas Optimization Skill

Analyze the provided Solana program for compute unit efficiency and rent cost optimization.

## Steps

1. Analyze account data layout for packing efficiency
2. Check for unnecessary account reallocations
3. Identify redundant deserialization operations
4. Measure instruction handler compute unit consumption
5. Suggest data structure optimizations for reduced rent
6. Evaluate CPI overhead and suggest batching strategies
