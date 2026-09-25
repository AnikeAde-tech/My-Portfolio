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

Vercel deploys `main`: every push to `main` is a production deploy, and pushes to other branches
make preview deploys.

The Vercel account is on the Hobby plan, which allows 100 deployments in any 24 hours. Past that,
pushes are rejected with "Resource is limited" and nothing goes live until the window clears;
then redeploy the latest `main` from Vercel → Deployments, or push again. Two Vercel projects
(`anikesportfolio`, which serves the live site, and `my-portfolio`) are connected to this
repository, so every push deploys twice. Push finished changes in batches, not every step.
