---
trigger: always_on
glob:
description:
---# PiruAdmin Code Style Guide

## Icons (PiruIcons)
The project uses **PiruIcons** as the primary icon library.

### Standard Usage
Always use the `pi` base class followed by the specific icon name:
`<i class="pi pi-{icon-name}"></i>`

Example:
`<i class="pi pi-0-square-fill"></i>`

### Rules
- **Mandatory Prefix**: Every icon must have both `pi` and `pi-name` classes.
- **Reference**: To find available icons, check the manifest file: `src/data/piruicons.json`.
- **Global Availability**: The library is loaded globally in `dashboard.pug`.
- **No Legacy Icons**: Do not use Feather Icons or Font Awesome unless specifically required for brands not available in PiruIcons.
