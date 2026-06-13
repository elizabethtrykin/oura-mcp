# Security Review: oura-mcp

**Date:** 2026-06-13
**Reviewer:** Claude Sonnet 4.6 (automated)
**Scope:** Full codebase audit — API call inventory, data exfiltration paths, syscall/system resource access

---

## Summary

No high-confidence security vulnerabilities were found. All flagged candidates were assessed and filtered as false positives or design non-issues.

---

## API Call Audit

**Data stays within the MCP boundary.** The codebase makes outbound HTTP calls to exactly two URLs, both on `api.ouraring.com`:

| Endpoint | Purpose |
|---|---|
| `https://api.ouraring.com/v2/usercollection/*` | Fetching health/activity data |
| `https://api.ouraring.com/oauth/token` | OAuth token refresh (dead code — see below) |

No Oura health data is forwarded to any third-party service. The MCP server acts as a pure proxy: it fetches data from Oura and returns it to the MCP client (Claude). There are no analytics calls, webhook notifications, or secondary egress paths.

---

## Syscall / System Resource Audit

No suspicious system-level calls found:

- No `eval()`, `exec()`, `child_process.exec()`, or `os.system()` usage in any production source file.
- `spawn()` appears only in `src/__tests__/oura_provider.test.ts` with fully hardcoded arguments — no user input reaches it.
- No filesystem access with user-controlled paths.
- No use of `pickle`, `yaml.load()`, or other unsafe deserializers — only `response.json()` (safe).

---

## Filtered Candidates (Not Vulnerabilities)

| Finding | Verdict | Reason |
|---|---|---|
| HTTP OAuth redirect URI default (`src/index.ts:15`) | Not a vulnerability | The `redirectUri` parameter is accepted but never stored or used — the OAuth flow is entirely unimplemented. Dead code with no attack surface. |
| `clientSecret` not stored (`src/provider/oura_connection.ts:13`) | Not a vulnerability | Not storing the secret is actually more secure. The incomplete OAuth2 code is a functionality bug, not an exploitable vulnerability. |
| Timestamp logging via `console.log` (`src/provider/oura_provider.ts:38,54`) | Not a vulnerability | Only ISO date strings and endpoint names are logged — no health metric values, tokens, or PII. |

---

## Positive Security Properties

- All Oura health data returned only to the MCP client — no third-party exfiltration
- Credentials loaded from environment variables / `.env` (properly listed in `.gitignore`)
- No hardcoded secrets in source
- All API calls use HTTPS; Node.js `fetch` validates certificates by default
- Allowed endpoints are a hardcoded allowlist — no user-controlled URL path construction
- No shell injection vectors anywhere in production code
- No insecure deserialization

---

## Notes

The OAuth2 code path (`src/provider/oura_connection.ts`) is incomplete — `clientSecret` is accepted but never stored, making token refresh impossible. This is a functionality gap rather than a security issue, but the dead code is worth removing to avoid confusion.
