# Security policy

TierListBase is an actively maintained public production application. Security support tracks the current `main` branch rather than an inherited starter-version number.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, private user data or production payloads.

Use GitHub's private security-advisory reporting path for this repository when available. Include:

- affected commit or current production behavior;
- impact and affected surface;
- minimal reproduction conditions;
- evidence needed to validate the issue;
- whether credentials or user data may have been exposed.

If private vulnerability reporting is unavailable, use an already-approved private owner/maintainer channel.

Never place real credentials, database dumps, OAuth secrets, signed webhook bodies, private Vanguard images, email contents or unnecessary personal data in a report.

## Severity

- **Critical** — exploitable auth/authorization bypass, credential disclosure, remote code execution, broad private-data exposure, or an integrity failure that can materially compromise production.
- **High** — realistic confidentiality/integrity failure with narrower impact.
- **Medium / Low** — bounded security or defense-in-depth defect without the above impact.

Critical and High issues should block affected releases until contained and verified.

## Handling

For a security fix:

1. contain active exposure first;
2. rotate affected credentials when relevant;
3. preserve evidence without copying sensitive payloads into tickets/chat;
4. patch the smallest affected boundary;
5. run the relevant security, unit, integration and browser gates;
6. verify production configuration when the issue involves OAuth, Cloudflare, R2, Workers AI, database access or deployment;
7. document only current operational guidance in the repository.

Do not restore a leaked secret merely to make rollback easier. Roll back only to configurations that remain safe and valid.
