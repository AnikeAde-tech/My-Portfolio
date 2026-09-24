# PayPro images

Drop these files into this folder with exactly these names. Pages already point here;
until a file exists its slot shows the styled placeholder, never a broken image.

## Required

| File | Size | Used for | Should show (matches the page's alt text) |
| --- | --- | --- | --- |
| `cover.webp` | 1600×1000 | Work card (homepage + work index) and the case study lead image | Three phone screens from the send flow: recipient details, an amount screen showing a two hundred pound send with the fee and the amount the recipient will receive, and fingerprint confirmation. |
| `shot-1.webp` | 1600×1000 | Figure after block 02 | Three card screens: physical card with its benefits, an empty no-cards state, and an active virtual card with top up, details, freeze and settings. |
| `shot-2.webp` | 1600×1000 | Figure after block 03 | Three phone screens from the invoicing flow: an invoice list with paid, waiting, overdue and draft states, the create invoice form, and a finished invoice ready to share. |

## Optional

More screens the page already has slots for (carousel frames and extra figures).
Same size, 1600×1000 (16:10); anything missing stays a placeholder.

| File | Should show |
| --- | --- |
| `home.webp` | The home screen showing a naira balance, add, send, request and more actions, quick send contacts and recent transactions. |
| `hidden.webp` | The same home screen with the balance masked behind asterisks and an eye icon to reveal it. |
| `accounts.webp` | The home screen with an account selector sheet open, listing naira, US dollar, pound and Canadian dollar balances. |
| `onboard-1.webp` | Onboarding screen one: Get Paid Globally, Anytime, Anywhere. |
| `onboard-2.webp` | Onboarding screen two: Protected Transaction, your transactions are always protected. |
| `onboard-3.webp` | Onboarding screen three: Instant Payment Request, effortless billing for faster payment. |

Export as WebP at 1600×1000 (16:10). The images are cropped to 16:10 with `object-fit: cover`,
so keep the important part of the screen away from the edges.
