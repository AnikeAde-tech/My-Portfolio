# Nerdbug images

Drop these files into this folder with exactly these names. Pages already point here;
until a file exists its slot shows the styled placeholder, never a broken image.

## Required

| File | Size | Used for | Should show (matches the page's alt text) |
| --- | --- | --- | --- |
| `cover.webp` | 1600×1000 | Work card (homepage + work index) and the case study lead image | The Nerdbug button sheet: block, large and small sizes across primary, secondary, outline and transparent styles, each with default, hover and disabled states, shown in light and dark themes side by side. |
| `shot-1.webp` | 1600×1000 | Figure after block 02 | A component audit board: screens from three recent client projects with every repeated component (buttons, date pickers, tables, empty states) circled and tallied. |
| `shot-2.webp` | 1600×1000 | Figure after block 03 | The Nerdbug popover sheet: confirmation, error, input and media variants on phone frames, each shown in light and dark themes. |

> `shot-1.webp` is a new slot. Its alt text and caption describe a component audit
> board (decision 01). If you use a different screen, update the `alt` and caption
> after block 02 in `nerdbug.html`.

Export as WebP at 1600×1000 (16:10). The images are cropped to 16:10 with `object-fit: cover`,
so keep the important part of the screen away from the edges.
