# Firmly images

Drop these files into this folder with exactly these names. Pages already point here;
until a file exists its slot shows the styled placeholder, never a broken image.

## Required

| File | Size | Used for | Should show (matches the page's alt text) |
| --- | --- | --- | --- |
| `cover.webp` | 1600×1000 | Work card (homepage + work index) and the case study lead image | The Firmly marketing site, splitting its entry between legal professionals and individuals or clients. |
| `shot-1.webp` | 1600×1000 | Figure after block 02 | The client management table, with a conflict status column reading No Conflict, Potential Conflict and Confirmed conflict per client. |
| `shot-2.webp` | 1600×1000 | Figure after block 03 | The invoice approval panel, showing invoice number, client, case reference, line items, total, and reject or approve actions. |

## Optional

More screens the page already has slots for (carousel frames and extra figures).
Same size, 1600×1000 (16:10); anything missing stays a placeholder.

| File | Should show |
| --- | --- |
| `cases.webp` | Case management, with total, active, pending conflict and completed case counts, upcoming hearings, and cases pending closure approval. |
| `calendar.webp` | The calendar and tasks month view, with court dates, client consultations and invoice payments colour coded. |
| `documents.webp` | Case documents in a card grid, each with an approved, under review, locked or archived status and its case reference. |
| `analytics.webp` | Reporting and analytics, with revenue forecast, case status distribution including a conflicted segment, and lawyer performance. |
| `identity.webp` | The Choose Your Identity onboarding screen, offering a law firm profile with multi-user access or a solo lawyer profile. |
| `dashboard.webp` | The Firmly firm overview dashboard, with a verification banner, case and invoice metrics, billing summary and the conflict of interest queue. |

Export as WebP at 1600×1000 (16:10). The images are cropped to 16:10 with `object-fit: cover`,
so keep the important part of the screen away from the edges.
