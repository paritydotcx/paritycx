---
name: deep-audit
version: 1.0.0
description: Multi-pass deep audit with cross-skill correlation
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
  - name: optimized_code
    type: string
---

# Deep Audit Skill

Execute a comprehensive multi-pass audit combining security, best practices, and optimization analysis.

## Steps

1. Execute security-audit skill and collect findings
2. Execute best-practices skill and collect findings
3. Execute gas-optimization skill and collect findings
4. Correlate findings across skills for compound vulnerabilities
5. Generate risk-prioritized remediation plan
6. Produce optimized code artifact with all fixes applied
