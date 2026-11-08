# IndexNow production release manifests

TierListBase uses explicit changed-URL manifests for production IndexNow submission.

For a production release that adds, updates, or deletes public indexable URLs, add a new unique
`.txt` file under `.github/indexnow/releases/`. Put one TierListBase URL or same-origin path on
each line. Blank lines and lines beginning with `#` are ignored.

The production workflow considers only manifest files added or modified by that specific push to
`main`. After the Cloudflare deployment succeeds, those explicitly declared URLs are sent to the
existing authenticated `/api/internal/seo/indexnow` endpoint.

No manifest means no IndexNow submission. There is no sitemap, route-registry, or full-site fallback.

A later release may submit the same URL again by adding a new manifest for that release. This is the
explicit contract for genuine add/update/delete events, including deleted same-origin URLs that no
longer exist in the live route registry.

IndexNow submission is a non-blocking post-deploy action. Provider, network, authentication, or
configuration failure is recorded by the workflow but does not roll back or fail an already
successful production deployment.

Production runtime requires `INDEXNOW_KEY`. When IndexNow is enabled, the existing runtime contract
also requires `CRON_SECRET`. The GitHub `production` environment must expose the matching
`CRON_SECRET` to authenticate the post-deploy call. Never commit either secret or put secret values
in a manifest.
