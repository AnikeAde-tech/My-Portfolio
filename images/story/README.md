# Story images

| File | Size | Used for |
| --- | --- | --- |
| `victoria-portrait.webp` | 1200×1500 (4:5), 158KB | The portrait in the story page hero. Alt: "Victoria Olorunsola, product designer, Lagos." |

WebP, at most 1200px wide, under 200KB. It loads eagerly (it's at the top of the page).
On desktop it sits beside the headline at about a third of the content width; below 768px
it goes above the headline at full width, never taller than half the screen, cropped from
the top (`object-position: 50% 20%`). To replace it, keep the filename and a 4:5 shape, or
update `width`/`height` in `story.html`.
