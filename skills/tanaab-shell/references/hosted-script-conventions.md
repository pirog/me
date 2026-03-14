# Hosted Script Conventions

Use this pattern when a repository distributes a shell entrypoint directly from a public URL and the hosted artifact is part of the product surface.

## Product Surface

- Treat the hosted script URL as a real user-facing entrypoint.
- Treat the generated `dist/` entrypoint as the shipped artifact when that is what the URL serves.
- Keep the hosted artifact path stable across builds and releases unless the user explicitly wants a breaking distribution change.

## Distribution Shape

- Prefer a clean generated `dist/` directory that contains only publishable assets.
- Copy the releasable shell entrypoint into `dist/` instead of serving source-tree files directly.
- Preserve the executable bit on distributed shell entrypoints.
- Keep any landing page, `robots.txt`, or other static support files alongside the hosted script in `dist/` when they belong to the public surface.

## Hosting

- Netlify is a valid default host for static shell distribution when the repo needs a landing page plus raw script download URLs.
- When serving `*.sh` or `*.ps1`, set explicit `text/plain; charset=utf-8` headers instead of relying on host defaults.
- Keep cache behavior explicit in the hosting config when long-lived script URLs are part of the delivery model.

## Release And Validation

- Stamp the distributed entrypoint in `dist/` when release automation owns version injection.
- Prefer testing the release-shaped `dist/` entrypoint when users run the hosted URL rather than the source file.
- If the public surface includes metadata such as sitemap lastmod or landing-page release dates, derive it from explicit release env first, then fall back to repository history or file timestamps.

## Documentation

- Lead the main README with the hosted quickstart when the hosted URL is the primary user path.
- Explain how the hosted URL maps to the generated `dist/` entrypoint.
- Keep local install or advanced usage paths secondary to the hosted quickstart.
