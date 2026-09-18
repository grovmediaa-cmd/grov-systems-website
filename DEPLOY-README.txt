GROV SYSTEMS — FINAL SITE

This package is ready for static hosting.

ROOT FILE
- index.html is the homepage and must remain at the site root.

DEPLOYMENT
1. Upload the contents of this folder to a GitHub repository (for example: grov-systems-website).
2. Connect that repository to Cloudflare Pages.
3. Production branch: main.
4. Build command: exit 0 (or leave blank if the Cloudflare UI accepts no build command).
5. Build output directory: / (the repository root).
6. Deploy.
7. Add grovsystems.com as the custom domain in Cloudflare Pages.

NOTES
- This is a static HTML/CSS/JS site; there is no Node build step.
- The Revenue Leak Calculator is a modal on internal pages, opens from calculator links, and has desktop exit-intent/mobile dwell behavior.
- Calculator results include an illustrative scenario and a direct booking CTA.
- The homepage was not intentionally redesigned in this final fix pass.
