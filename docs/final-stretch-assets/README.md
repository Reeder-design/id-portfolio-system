# Final Stretch Asset Pack

The production WebP extractions are installed under `portfolio/assets/`. This folder keeps their source and page-use inventory in `asset-ledger.json`; it does not contain a second copy of the image files.

## Install destinations

- `icons/<group>/` in the ledger -> `portfolio/assets/icons/pixel/<group>/`
- `project-images/<group>/` in the ledger -> `portfolio/assets/project-images/<group>/`

All 223 ledger entries resolve to installed assets. The installed folders are organized first by asset type, then by page or subject. Upload dates are not used as folder names.

## Asset rules

- Source sheets are not installed into the public site.
- Individual icons are extracted separately.
- Multi-screen certification sheets are split into single screens.
- Use each asset once by default unless reuse is clearly useful.
- These source sets were explicitly supplied for the public portfolio final-stretch pass.
- Keep labels/copy in HTML when practical; use raster text only when it is part of a designed visual composition.
- The 124 unused mascot images under `portfolio/assets/mascot/` are reserved for a later approved animation pass. Do not treat them as installed card icons or silently add them to the current site.

## Primary page mapping

- `hiring-guide` -> Hiring Guide UI, prompt library, capability guidance
- `ai-evaluation` -> Evaluation Practice, Rubric, Workflow demos
- `ai-training-evaluation` -> AI Training & Evaluation landing / Quality Signals
- `ai-integrations` -> new AI Integrations in Learning Content page
- `lms` + `lms-topics` -> LMS Administration / System Operations / Learner Journey
- `microlearning-performance-support` -> methodology hub + child pages
- `meddpicc` -> MEDDPICC demo redesign
- `pursuit-determination` -> Pursuit Determination demo redesign
- `portfolio-general` -> Home / Projects / Contact / shared CTAs
- `cellular-certification` -> sanitized Cellular Networking Sales Certification
- `main-pages` -> major portfolio-page/category illustrations
