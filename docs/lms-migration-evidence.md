# LMS migration evidence

The custom LMS Migration Experience page uses four representative illustrations plus a reconstructed learner-route simulator. Its factual scope remains the documented Absorb-to-Docebo contribution in `portfolio-data/projects/learning-platform-operations-migration-readiness.json`.

## Image provenance

Public derivatives are in `portfolio/assets/project-images/lms-migration/`. The source masters stay outside the repository. Both masters are 1536 × 1024; crop coordinates are `(left, top, right, bottom)` with exclusive right/bottom edges. Crops follow the visible panel boundaries rather than equal grid divisions, which cut off controls in the LMS master. WebP exports use quality 94 with no upscaling.

| Derivative | Source master | Crop | Purpose |
| --- | --- | --- | --- |
| `learner-home.webp` | `lms-learner-admin-series.png` | `(5, 1, 518, 531)` | Audience visibility, assigned learning, navigation |
| `course-player.webp` | `lms-learner-admin-series.png` | `(526, 1, 1013, 531)` | Content launch, sequencing, completion checks |
| `admin-dashboard.webp` | `lms-learner-admin-series.png` | `(5, 535, 518, 1008)` | Learning administration and operational follow-up |
| `learning-pathway.webp` | `learning-pathway-architecture-series.png` | `(517, 0, 1024, 511)` | Required modules, prerequisites, and assessment relationships |

These are fictional generic interfaces, not screenshots of Absorb or Docebo. Names, numbers, progress, and outcomes inside them are illustrative. Page captions and structured asset records preserve that distinction.

## Simulator behavior

The three sample routes cover employee catalog visibility, partner prerequisites, and customer renewal eligibility. Each begins untested. Running a route reveals a configuration issue and marks later steps as not reached. An unrelated diagnosis supplies explanatory feedback without advancing the state. The relevant diagnosis applies a simulated fix; a separate retest is required before the route passes and its sample record closes. Switching audiences or resetting clears previous results.

The scenarios illustrate the documented UAT scope; they are not historical issue records or evidence of actual migration outcomes. All state is local to the page and resets on reload. No real learner data or platform connection is involved.

## Maintenance

`lms-migration-case.js` owns tabs and simulator behavior. `lms-migration-case.css` owns page-specific layout, contrasting surfaces, and responsive behavior. The pre-existing validation explorer is available under “Explore the full validation scope.” Image tabs and audience tabs support arrow keys, Home, and End; status feedback announces interaction results.
