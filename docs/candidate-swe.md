# SWE Onsite Prompt

You are working on the cash application system for a SaaS company. The product needs to reconcile customer invoices against bank transaction exports.

Use the existing product and codebase to identify a focused backend improvement.

During the initial analysis period, do not use AI tools. After you present your analysis and align with your interviewer on a scoped build, you may use AI tools during implementation. Be ready to explain your reasoning, tradeoffs, and code.

For SWE, bias toward backend correctness, matching quality, data modeling judgment, scalability, edge cases, and tests.

Some customer payments include messy remittance evidence. A strong backend approach may include a model-assisted or semantic matching layer, with structured validation, confidence/reasoning boundaries, and tests that protect against unsafe false positives.

In the discussion portion, be ready to cover:

- what behavior you think matters most
- what risks or edge cases you would prioritize
- what change you would build first and why
- how you would test or validate it
- how deterministic candidates, model-assisted recommendations, and review states should be represented

Then choose a scoped backend improvement and build it. Optimize for correctness, maintainability, and clear reviewability.
