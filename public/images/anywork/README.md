# Anywork images

Drop these files into this folder with exactly these names. Pages already point here;
until a file exists its slot shows the styled placeholder, never a broken image.

## Required

| File | Size | Used for | Should show (matches the page's alt text) |
| --- | --- | --- | --- |
| `cover.webp` | 1600×1000 | Work card (homepage + work index) and the case study lead image | Three phone screens showing the Anywork welcome step, where a new user chooses between I'm a Client and I'm a worker. |
| `shot-1.webp` | 1600×1000 | Figure after block 02 | The Anywork client dashboard on web, showing hot bundles, top rated artisans and artisans near you. |
| `shot-2.webp` | 1600×1000 | Figure after block 03 | Step two of five in the Anywork booking flow: choose your provider, with available providers listed and an option to auto-assign. |

## Optional

More screens the page already has slots for (carousel frames and extra figures).
Same size, 1600×1000 (16:10); anything missing stays a placeholder.

| File | Should show |
| --- | --- |
| `client-mobile.webp` | Anywork client mobile screens: browse artisans, view a provider profile and track a booking. |
| `service-modal.webp` | The Anywork service detail modal, showing what a category covers before a client commits to booking. |
| `booking-landing.webp` | The Anywork booking landing screen where a client picks a service category to begin. |
| `admin.webp` | The Anywork admin dashboard used to oversee bookings, artisans and verification status. |
| `marketing.webp` | Anywork marketing site hero introducing the artisan marketplace. |

Export as WebP at 1600×1000 (16:10). The images are cropped to 16:10 with `object-fit: cover`,
so keep the important part of the screen away from the edges.
