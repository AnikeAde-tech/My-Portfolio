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

Vercel deploys `main`. Changes are pushed straight to `main`, and the push deploys.

If a push doesn't reach the live site (a new file 404s there although it's on `main`), check
Vercel → Deployments for that commit. Direct pushes of Claude-authored commits have been skipped
there before, while merges made on GitHub by the repo owner deployed. The fallback when that
happens:

1. The change is opened as a pull request into `main`.
2. Merge it on GitHub with **Create a merge commit**, not squash or rebase. Those keep the
   original author on the commit that lands on `main`. The merge commit is authored by you, and
   its deploy includes everything before it on `main`.
