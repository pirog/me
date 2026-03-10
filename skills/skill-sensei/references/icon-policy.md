# Icon Policy

## Default Selection Order

1. Preserve the skill's current icon when standardizing and it still matches the skill domain.
2. Reuse a local icon asset that clearly matches the skill domain.
3. Generate a branded fallback icon automatically.

Do not block skill creation on a missing custom icon.

Brand-specific sourcing guidance:

- `piro`: use the Pirog primary accent `#00c88a`
- `tanaab`: use the Tanaab primary accent `#ffffff` and prefer lighter base icons when sourcing or drawing new artwork, because the watermark treatment itself is dark

## Watermark Inputs

Preferred watermark formats:

- `SVG` for logos, marks, and simple graphic symbols
- transparent `PNG` for photos, avatars, or raster artwork

Preferred source dimensions:

- square is best
- `1024x1024` is ideal
- `512x512` is acceptable

Rectangular images are acceptable when the subject is centered and not cropped too tightly. The icon compositor uses centered `xMidYMid slice` scaling inside a circular clip path, so rectangular watermark images can be auto-cropped into circular badges.

On macOS, prefer the system SVG renderer via Quick Look for final PNG generation because it matches Finder/AppKit rendering more closely than ImageMagick. Use `imagemagick` as a fallback or for one-off image cleanup. The bundled SVG compositor still works without external image tooling.

When a skill UI fails to render a branded SVG correctly, export the final icon as `PNG` and point `agents/openai.yaml` at the raster asset instead of the intermediate SVG.

## Watermark Placement

- lower-right corner
- circular crop
- fixed badge size
- light backing circle for contrast
- subtle outer ring in the brand primary color
