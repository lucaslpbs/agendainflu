# AgendaInflu — Design System

All tokens are driven by CSS custom properties defined in `globals.css` and
referenced in `tailwind.config.ts`. Colours use HSL.

---

## Color Palette

Semantic tokens map to `hsl(var(--token))` in Tailwind. Values below are the
light-mode defaults; dark-mode overrides are declared in the `.dark` selector.

| Token | Class | Light value | Description |
|-------|-------|-------------|-------------|
| Background | `bg-background` | `hsl(30 100% 97%)` | Warm off-white page background |
| Foreground | `text-foreground` | `hsl(340 30% 15%)` | Dark rose-tinted body text |
| Card | `bg-card` | `hsl(0 0% 100%)` | Pure white surface |
| Card foreground | `text-card-foreground` | `hsl(340 30% 15%)` | Same as foreground |
| Primary | `bg-primary` / `text-primary` | `hsl(340 82% 43%)` | Brand rose — CTAs, links, focus rings |
| Primary foreground | `text-primary-foreground` | `hsl(0 0% 100%)` | White text on primary |
| Secondary | `bg-secondary` | `hsl(30 50% 94%)` | Warm cream — hover states, chips |
| Secondary foreground | `text-secondary-foreground` | `hsl(340 30% 15%)` | Same as foreground |
| Muted | `bg-muted` | `hsl(30 30% 93%)` | Subtle backgrounds, disabled areas |
| Muted foreground | `text-muted-foreground` | `hsl(340 10% 45%)` | Placeholder and caption text |
| Accent | `bg-accent` / `text-accent` | `hsl(43 89% 38%)` | Golden amber — badges, secondary actions |
| Accent foreground | `text-accent-foreground` | `hsl(0 0% 100%)` | White text on accent |
| Destructive | `bg-destructive` / `text-destructive` | `hsl(0 84% 60%)` | Error and danger states |
| Border | `border-border` | `hsl(30 30% 88%)` | Warm divider lines |
| Input | `border-input` | `hsl(30 30% 88%)` | Form field borders |
| Ring | `ring` | `hsl(340 82% 43%)` | Focus ring (= primary) |

### Brand Extras

| Token | Class | Value | Usage |
|-------|-------|-------|-------|
| Gold | `text-gold` | `hsl(43 89% 38%)` | Alias for accent |
| Gold light | `text-gold-light` | `hsl(43 70% 70%)` | Tinted gold fills |
| Rosa light | `bg-rosa-light` | `hsl(340 60% 90%)` | Light pink wash |
| Rosa dark | `text-rosa-dark` | `hsl(340 82% 35%)` | Darker rose variant |

### Gradients (CSS utilities)

| Class | Definition |
|-------|------------|
| `.gradient-gold` | `linear-gradient(135deg, hsl(43 89% 38%), hsl(43 70% 55%))` |
| `.gradient-rosa` | `linear-gradient(135deg, hsl(340 82% 43%), hsl(340 60% 55%))` |
| `.text-gradient-gold` | Gold gradient clipped to text |

---

## Typography Scale

### Font families

| Token | Class | Stack |
|-------|-------|-------|
| Display | `font-display` | Playfair Display, serif — headings and brand wordmarks |
| Body | `font-body` | DM Sans, sans-serif — all other text |

`h1`–`h6` use `font-display` by default (set in `globals.css`).
`body` uses `font-body` by default.

### Type scale (Tailwind defaults, 1rem = 16px)

| Class | Size | Line height | Typical use |
|-------|------|-------------|-------------|
| `text-xs` | 12px | 1rem (16px) | Labels, badges, captions |
| `text-sm` | 14px | 1.25rem (20px) | Secondary body, table cells |
| `text-base` | 16px | 1.5rem (24px) | Primary body copy |
| `text-lg` | 18px | 1.75rem (28px) | Lead paragraphs |
| `text-xl` | 20px | 1.75rem (28px) | Section sub-headings |
| `text-2xl` | 24px | 2rem (32px) | Card metrics, stat numbers |
| `text-3xl` | 30px | 2.25rem (36px) | Page headings |
| `text-4xl` | 36px | 2.5rem (40px) | Hero headings |

### Font weights

| Class | Weight | Use |
|-------|--------|-----|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | UI labels, nav items |
| `font-semibold` | 600 | Card titles, section headings |
| `font-bold` | 700 | Stat numbers, brand wordmarks |

---

## Spacing — 4 px Grid

Base unit: **4 px** (Tailwind `spacing-1` = 0.25 rem = 4 px).
All spacing is a multiple of this base.

| Class | rem | px | Typical use |
|-------|-----|----|-------------|
| `1` | 0.25 rem | 4 px | Icon internal padding |
| `2` | 0.5 rem | 8 px | Tight gaps, compact padding |
| `3` | 0.75 rem | 12 px | Small gaps between items |
| `4` | 1 rem | 16 px | Default padding unit |
| `5` | 1.25 rem | 20 px | Card inner padding (compact) |
| `6` | 1.5 rem | 24 px | Card inner padding (default) |
| `8` | 2 rem | 32 px | Section internal spacing |
| `10` | 2.5 rem | 40 px | Large padding blocks |
| `12` | 3 rem | 48 px | Section gaps |
| `16` | 4 rem | 64 px | Page-level vertical rhythm |
| `18` ¹ | 4.5 rem | 72 px | Large section spacing |
| `20` | 5 rem | 80 px | Section `py` on landing pages |
| `22` ¹ | 5.5 rem | 88 px | Extra-large section gaps |

¹ Custom token added in `tailwind.config.ts > theme.extend.spacing`.

---

## Border Radius

`--radius: 0.75rem` (12 px) is the base CSS variable.
Tokens defined in `tailwind.config.ts > theme.extend.borderRadius`:

| Token | Value | px | Use |
|-------|-------|----|-----|
| `rounded-sm` | `calc(var(--radius) - 4px)` | 8 px | Compact chips, small buttons |
| `rounded-md` | `calc(var(--radius) - 2px)` | 10 px | Inputs, select elements |
| `rounded-lg` | `var(--radius)` | 12 px | Cards, dialogs (default radius) |
| `rounded-xl` ² | `0.75rem` | 12 px | Tailwind default |
| `rounded-2xl` ² | `1rem` | 16 px | Dashboard cards, image thumbnails |
| `rounded-3xl` ² | `1.5rem` | 24 px | Large hero cards |
| `rounded-full` | `9999px` | — | Avatars, badges, pill buttons |

² Tailwind defaults (not overridden by this project).

---

## Shadow Tokens

Defined in `tailwind.config.ts > theme.extend.boxShadow`.
`shadow-rosa` and `shadow-gold` are also available as CSS utilities in `globals.css`.

| Token | Class | Value |
|-------|-------|-------|
| Rosa glow | `shadow-rosa` | `0 10px 40px -10px hsl(340 82% 43% / 0.25)` |
| Gold glow | `shadow-gold` | `0 10px 40px -10px hsl(43 89% 38% / 0.25)` |
| Card resting | `shadow-card` | `0 1px 3px 0 hsl(340 30% 15% / 0.08), 0 1px 2px -1px hsl(340 30% 15% / 0.05)` |
| Elevated | `shadow-elevated` | `0 4px 20px -4px hsl(340 30% 15% / 0.12)` |

**Usage guide:**
- `shadow-rosa` — primary CTAs, featured cards, influencer profile cards
- `shadow-gold` — gold/accent button variants
- `shadow-card` — resting card surfaces (no interaction)
- `shadow-elevated` — hovered cards, popovers, dropdowns

---

## Animation Tokens

Defined in `tailwind.config.ts > theme.extend.keyframes` and `theme.extend.animation`.

| Class | Keyframe | Duration | Easing | Trigger |
|-------|----------|----------|--------|---------|
| `animate-fade-in` | opacity 0→1 + `translateY(20px→0)` | 0.6 s | ease-out forwards | Page sections, cards on mount |
| `animate-slide-in-right` | opacity + `translateX(20px→0)` | 0.5 s | ease-out forwards | Sidebar panels, drawers |
| `animate-float` | `translateY(0 → -10px → 0)` | 3 s | ease-in-out infinite | Decorative floating elements |
| `animate-accordion-down` | height `0 → content` | 0.2 s | ease-out | Radix accordion open |
| `animate-accordion-up` | height `content → 0` | 0.2 s | ease-out | Radix accordion close |
| `animate-pulse` ² | opacity oscillation | 2 s | cubic-bezier | Skeleton loading placeholders |
| `animate-spin` ² | 360° rotation | 1 s | linear | Loading spinners (`Loader2`) |

² Tailwind built-ins, listed here for completeness.

**Staggered entrance pattern** (used in `FeaturedInfluencers`):
```tsx
style={{ animationDelay: `${index * 0.1}s` }}
className="animate-fade-in"
```
