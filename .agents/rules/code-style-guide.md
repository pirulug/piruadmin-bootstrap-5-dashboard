---
trigger: always_on
---

# PiruAdmin Code Style Guide

### Standard Usage
Always use the `bi` base class followed by the specific icon name:
`<i class="bi bi-{icon-name}"></i>`

Example:
`<i class="bi bi-0-square-fill"></i>`

### Rules
- **Global Availability**: The library is loaded globally in `dashboard.pug`.

## Design Constraints
- **No Shadows**: Do not use `box-shadow` or any type of shadows in the UI. Use borders or background contrasts to separate elements instead.
- **Card Styles**: Do not use utility classes like `.shadow`, `.rounded`, or `.border` on `.card` elements. Cards should rely on their base styles for borders and radius.
- **Theme Support**: Every component must support both Light and Dark modes using Bootstrap 5 theme variables and CSS variables (e.g., `var(--#{$prefix}card-bg)`, `var(--#{$prefix}tertiary-bg)`). Do not use static utility classes like `.bg-light` or `.bg-dark`; use theme-aware alternatives like `.bg-body-secondary` or `.bg-body-tertiary`.