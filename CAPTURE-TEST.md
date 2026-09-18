# Capture Test — DeepSeek Agent Capture Setup

## Summary
This document verifies that AI prompt and response logs are preserved in `.agent-logs/` for the duration of this project, as required by the assignment.

**Verdict:** Capture workflow VERIFIED (manual protocol).

## Tool & Method
- AI Tool: DeepSeek Free
- Interface: Web chat at https://chat.deepseek.com
- Capture Method: Manual protocol
- Log Location: `.agent-logs/`
- Verification Date: 2026-09-18

### Why manual capture?
The browser-based DeepSeek web chat does not support automatically writing prompts/responses to a local folder. We therefore use a documented manual protocol: after each canary session, the prompt and response are saved to `.agent-logs/` with screenshots as supporting evidence.

## Canary Prompt
CANARY TEST — Session [N]
Please respond with exactly this line and nothing else:
"AGENT CAPTURE VERIFIED — Session [N] — <current date and time in ISO format>"

## Session 1 Results
- Prompt: `.agent-logs/session-01-prompt.md`
- Response: `.agent-logs/session-01-response.md`
- Screenshot: `.agent-logs/session-01-canary.png`
- Verification: Prompt captured, Response captured

## Session 2 Results
- Prompt: `.agent-logs/session-02-prompt.md`
- Response: `.agent-logs/session-02-response.md`
- Screenshot: `.agent-logs/session-02-canary.png`
- Verification: Prompt captured, Response captured

## Known Limitations
1. Not automatic — the DeepSeek browser interface cannot write to local disk.
2. Only canary prompts/responses are stored here.
3. Two PNG screenshots are included as evidence.

## Conclusion
The canary test was executed in two independent browser sessions. Prompt and response pairs are preserved in `.agent-logs/`.
