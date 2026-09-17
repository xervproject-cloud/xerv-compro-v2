# XERV design styles

- `xerv.css` — ported visual/motion system from the static site (tone ramp, boot, bridge, stage, shell, section layouts). Asset URLs point at `/assets/...`.
- Tailwind theme tokens live in `src/app/globals.css` (`@theme`) for brand colors, fonts, and breakpoints. Prefer Tailwind utilities for new UI; keep `xerv.css` class hooks that motion JS and existing sections rely on.
