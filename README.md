# Victoria Olorunsola — portfolio

Live at https://anikesportfolio.vercel.app. Plain HTML, CSS and JavaScript, with no build step.
Vercel serves the repository root as-is (`vercel.json`: clean URLs, no trailing slash).

## Layout

- One HTML file per page: `index.html` (home), `work`, `decisions`, `craft`, `story`, and the seven
  case studies (`anywork`, `firmly`, `nextvibe`, `homemade`, `paypro`, `help-app-africa`, `nerdbug`).
- Shared: `styles.css`, `motion.css`, `site.js` (image placeholders), `page.js` (reveals, carousels),
  `motion.js`, `nav-menu.js` (mobile menu, CV viewer). Page-specific: `home.js`, `character.js`, `craft.js`.
- `vendor/` pins three.js and pdf.js locally, so nothing loads from a third-party CDN.
- `images/<page>/` holds each page's images as WebP. Each folder's `README.md` lists every file,
  its size and where it's used.

## How changes go live

Vercel deploys `main`. Commits authored by Claude and pushed straight to `main` have not been
deploying; merges you make on GitHub have. So:

1. Changes are made on a working branch, never pushed straight to `main`.
2. Each change is opened as a pull request into `main`.
3. Merge it on GitHub with **Create a merge commit**. Not squash, not rebase: those keep the
   original author on the commit that lands on `main`. The merge commit is authored by you, and
   the deploy of it includes everything before it on `main`.
