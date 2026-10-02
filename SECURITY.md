# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest on `main` | Yes |
| older releases | Best effort |

## Reporting a Vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Prefer one of:

1. **GitHub Private Vulnerability Reporting** (Repo → Security → Advisories / Report a vulnerability), when enabled
2. Contact the repository owner via a private channel listed in the repository profile

Include:

- Description of the issue
- Steps to reproduce (minimal PoC)
- Potential impact
- Suggested remediation (optional)

### Response targets

- Acknowledgment: within 48 hours
- Initial assessment: within 1 week
- Fix for critical/high: within 2 weeks when feasible
- Disclosure: coordinated after a fix is available

## Baseline expectations

- No real secrets in the repository or examples (use placeholders like `YOUR_API_TOKEN`)
- Dependabot or Renovate for dependency updates
- Secret scanning mindset (gitleaks / GitHub secret scanning)
- Least-privilege tokens in CI

## Example placeholders only

```bash
# .env.example — never commit real values
API_TOKEN=YOUR_API_TOKEN_HERE
DATABASE_URL=postgres://user:password@localhost:5432/app
```
