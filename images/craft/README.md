# Craft images

The craft grid, in page order. Each tile's frame takes the image's own shape (masonry at 768px and wider), so any
aspect ratio works; keep `width`/`height` in `craft.html` matching the file.

- `cNN.webp` is the grid tile: WebP, at most 1600px wide, under 250KB.
- `full/cNN.webp` is what the lightbox opens: WebP, at most 2000px wide, under 500KB.
- The first row (01–03) loads eagerly; everything else is lazy. The hero deck at the top reuses five of the tiles.
- Images with a transparent background were flattened onto white.

| File | Size | Tile | Title |
| --- | --- | --- | --- |
| `c01.webp` | 1000×750 | 01 · vitalswap | Landing hero |
| `c14.webp` | 1000×750 | 02 · fsdh group | Corporate site |
| `c04.webp` | 1000×750 | 03 · focal | Add product, admin |
| `c02.webp` | 1000×750 | 04 · vitalswap | Send money |
| `c07.webp` | 1000×750 | 05 · pet app | Onboarding |
| `c08s.webp` | 1000×750 | 06 · firmly | Choose a user type |
| `c03.webp` | 1000×750 | 07 · fixmate | Splash and home |
| `c19.webp` | 1000×750 | 08 · pal pensions | Landing hero |
| `c05.webp` | 1000×750 | 09 · vitalswap | Wallet home |
| `c20.webp` | 1000×750 | 10 · firmly | Onboarding |
| `c15.webp` | 1000×750 | 11 · fsdh merchant bank | Landing hero |
| `c17.webp` | 1000×750 | 12 · pet app | Home, welcome, pet profile |
| `c12.webp` | 1000×563 | 13 · fixmate | Onboarding flow |
| `c16.webp` | 1000×750 | 14 · vitalswap | Features section |
| `c11s.webp` | 1000×646 | 15 · firmly | Marketing site |
| `c06.webp` | 1000×750 | 16 · fixmate | Home and providers |
| `c18.webp` | 1000×750 | 17 · error states | 404, said kindly |
| `c13.webp` | 1000×563 | 18 · fixmate | Booking flow |
| `c21.webp` | 1000×750 | 19 · fsdh group | Full site |
| `c22.webp` | 1000×750 | 20 · member platform | Member home |
| `c25.webp` | 490×406 | 21 · firmly | Appointment confirmed |
| `c27.webp` | 832×624 | 22 · trydive | Job board site |
| `c23.webp` | 1000×1094 | 23 · member platform | Feature overview |
| `c24.webp` | 1000×750 | 24 · firmly | Splash and dashboards |
| `c26.webp` | 832×624 | 25 · agency site | Marketing site |
| `c28.webp` | 1000×750 | 26 · vitalswap | Send, home, confirm |
| `c29.webp` | 1000×563 | 27 · firmly | Firm dashboard |
| `c30.webp` | 1000×750 | 28 · firmly | Case management |

To replace one, export both files under the same name and update `width`/`height` (and the tile's
`aspect-ratio`) if the shape changes.
