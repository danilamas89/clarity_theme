# CLAUDE.md — Drupal Admin Theme

## Project context

This is a Drupal 10/11 administration theme built **from scratch**, with no base theme. The goal is to produce a modern, calm, and professional visual experience — inspired by Filament PHP (Laravel) — publishable as a contributed theme on drupal.org.

The theme name is **Clarity**. The machine name is `clarity`.

### Visual philosophy

- **Clarity** — sharp visual hierarchies, nothing competing for attention
- **Calm** — generous spacing, soft colors, no visual noise
- **Professional** — comparable to Filament, Linear, or modern SaaS tools
- **Restraint** — no decorative effects, no gradients, no superfluous animations

---

## Technical stack

- **Drupal 10 / 11** — mandatory compatibility with both versions
- **Drupal 12** — target compatibility once released (avoid deprecated APIs)
- **No base theme** — no dependency on Claro, Gin, Seven or any other
- **CSS custom properties** — the entire design system runs on CSS variables, no mandatory preprocessor (SCSS optional for file organization only)
- **Alpine.js 3.x** — declarative UI interactions, loaded locally (see below)
- **Vanilla JS** — for anything Alpine does not cover; no jQuery, no other framework
- **Inter** — primary typeface, loaded locally (no Google Fonts request in production)
- **No npm runtime dependencies** — build tools (if any) must not be runtime dependencies

### Why Alpine.js and not vanilla JS or jQuery

Alpine.js is the single accepted JS dependency. The decision is based on three reasons:

1. **Colocation** — interaction logic lives in the Twig template alongside the HTML it controls. No separate JS file to keep in sync.
2. **Autonomy** — each component is self-contained. A dropdown template works anywhere without knowledge of the rest of the page.
3. **Readability** — declarative syntax (`x-data`, `x-show`, `@click`) is immediately understandable by any contributor, without reading a JS file.

Alpine.js must **never** be used for:
- Data fetching (use Drupal's JS API or vanilla `fetch()`)
- Complex application state (out of scope for an admin theme)
- Anything that requires a build step

### Alpine.js loading

Alpine.js must be loaded as the **last library before `</body>`**, after Drupal core JS, to avoid conflicts with Drupal behaviors. Configured in `clarity.libraries.yml`:

```yaml
global:
  js:
    js/theme.js:
      scope: footer
    vendor/alpinejs/dist/cdn.min.js:
      scope: footer
      weight: -1
```

Alpine.js is bundled locally in `vendor/alpinejs/` — no CDN dependency.

### Other external dependencies

Any additional library may be introduced **only if**:
1. It solves a problem that Alpine.js and vanilla JS cannot solve
2. It is lightweight (< 10kb gzipped)
3. It is documented in this file with a clear justification

---

## Design system — CSS tokens

These values are the absolute reference. Do not modify without an explicit decision.

```css
:root {
  /* Colors — surfaces */
  --admin-bg:            #f8f8fb;
  --admin-surface:       #ffffff;
  --admin-surface-2:     #f1f0f7;

  /* Colors — borders */
  --admin-border:        #e4e2f0;
  --admin-border-focus:  #6d52e8;

  /* Colors — sidebar */
  --admin-sidebar-bg:          #1e1b2e;
  --admin-sidebar-text:        #a09bbf;
  --admin-sidebar-active-bg:   #312d4b;
  --admin-sidebar-active:      #ffffff;
  --admin-sidebar-hover:       #2a2740;

  /* Colors — accent (indigo/violet) */
  --admin-accent:        #6d52e8;
  --admin-accent-light:  #ede9fd;
  --admin-accent-text:   #4c35c4;

  /* Colors — text */
  --admin-text:          #1a1825;
  --admin-text-2:        #6b6884;
  --admin-text-3:        #9b98b0;

  /* Colors — semantic */
  --admin-success-bg:    #ecfdf5;
  --admin-success:       #059669;
  --admin-warning-bg:    #fffbeb;
  --admin-warning:       #d97706;
  --admin-danger-bg:     #fef2f2;
  --admin-danger:        #dc2626;
  --admin-info-bg:       #eff6ff;
  --admin-info:          #2563eb;

  /* Typography */
  --admin-font:          'Inter', system-ui, -apple-system, sans-serif;
  --admin-font-mono:     'JetBrains Mono', 'Fira Code', monospace;
  --admin-font-size-xs:  11px;
  --admin-font-size-sm:  12px;
  --admin-font-size-md:  13px;
  --admin-font-size-base: 14px;
  --admin-font-size-lg:  16px;
  --admin-font-size-xl:  18px;

  /* Spacing */
  --admin-space-1:  4px;
  --admin-space-2:  8px;
  --admin-space-3:  12px;
  --admin-space-4:  16px;
  --admin-space-5:  20px;
  --admin-space-6:  24px;
  --admin-space-8:  32px;

  /* Border radius */
  --admin-radius-sm:   5px;
  --admin-radius-md:   8px;
  --admin-radius-lg:   12px;
  --admin-radius-full: 9999px;

  /* Layout */
  --admin-sidebar-width:            220px;
  --admin-sidebar-width-collapsed:  56px;
  --admin-topbar-height:            56px;
  --admin-content-max-width:        1200px;
}
```

### Dark mode

Dark mode is supported via `[data-theme="dark"]` on the `<html>` element, allowing user-controlled switching. Alpine.js handles the toggle: `@click="$store.theme.toggle()"`. All variables above must have a dark equivalent. To be implemented post-v1.

---

## File structure

```
/
├── clarity.info.yml
├── clarity.libraries.yml
├── clarity.theme
├── css/
│   ├── tokens.css           — CSS variables only, no styles
│   ├── base.css             — reset, typography, native HTML elements
│   ├── layout.css           — sidebar, topbar, content area, responsive
│   └── components/
│       ├── buttons.css
│       ├── forms.css
│       ├── tables.css
│       ├── navigation.css
│       ├── messages.css
│       ├── badges.css
│       ├── cards.css
│       ├── modals.css
│       └── toolbar.css      — Drupal admin toolbar (top black bar)
├── js/
│   └── theme.js             — vanilla JS + Alpine stores, Drupal behaviors wrapper
├── vendor/
│   └── alpinejs/            — Alpine.js bundled locally
├── fonts/
│   └── inter/               — Inter bundled locally
├── templates/
│   ├── layout/
│   ├── navigation/
│   └── form/
├── CLAUDE.md                — this file
└── README.md
```

---

## CSS conventions

### Naming

All theme CSS classes are prefixed `.at-` (admin theme) to avoid collisions with Drupal core and contrib modules.

```css
/* ✅ Correct */
.at-sidebar { }
.at-nav-item { }
.at-btn-primary { }
.at-form-input { }

/* ❌ Incorrect */
.sidebar { }
.nav-item { }
```

### Rules

- Use exclusively `--admin-*` variables for design values
- Never hardcode hex colors directly in components
- No `!important` except documented exceptions
- No selectors with specificity > 0,2,0
- Mobile-first: breakpoints add styles, they do not override

### Breakpoints

```css
/* sm  */ @media (min-width: 640px)  { }
/* md  */ @media (min-width: 768px)  { }
/* lg  */ @media (min-width: 1024px) { }
/* xl  */ @media (min-width: 1280px) { }
```

---

## Alpine.js conventions

### Pattern — self-contained component

All Alpine state is declared with `x-data` directly on the component root element. Never use global state (`Alpine.store`) unless the state genuinely needs to be shared across multiple components (e.g. dark mode, sidebar collapsed state).

```twig
{# ✅ Self-contained dropdown #}
<div class="at-user-menu" x-data="{ open: false }">
  <button class="at-user-btn"
    @click="open = !open"
    @click.outside="open = false"
    :aria-expanded="open">
    Admin
  </button>
  <div class="at-user-dropdown" x-show="open" x-transition>
    <a href="/profile">Profile</a>
    <a href="/logout">Log out</a>
  </div>
</div>
```

### Accepted global stores

Declared in `js/theme.js` via `Alpine.store()`, only for truly global state:

```javascript
// js/theme.js
document.addEventListener('alpine:init', () => {
  Alpine.store('sidebar', {
    collapsed: false,
    toggle() { this.collapsed = !this.collapsed; }
  });

  Alpine.store('theme', {
    dark: false,
    toggle() {
      this.dark = !this.dark;
      document.documentElement.setAttribute(
        'data-theme',
        this.dark ? 'dark' : 'light'
      );
    }
  });
});
```

### Accessibility with Alpine

Always bind ARIA attributes dynamically alongside visibility:

```html
<button :aria-expanded="open" :aria-controls="'menu-' + id">...</button>
<div :id="'menu-' + id" x-show="open" role="menu">...</div>
```

### What not to do with Alpine

```html
<!-- ❌ Never fetch data with Alpine -->
<div x-data="{ items: [] }" x-init="fetch('/api/items').then(...)">

<!-- ❌ Never put business logic in x-data -->
<div x-data="{ save() { /* complex logic */ } }">

<!-- ❌ Never use Alpine for transitions that CSS alone can handle -->
<div x-show="open" x-transition:enter="...long custom transition...">
```

---

## Twig conventions

- Override only necessary templates — do not copy a Drupal core template just to make a minor change
- Use Drupal template suggestions rather than modifying generic templates
- Document each overridden template with a comment explaining why
- No business logic in templates — presentation only
- Alpine `x-data` attributes belong in Twig templates, not in JS files

---

## Drupal components to cover (v1)

### High priority
- [ ] Main layout (sidebar + topbar + content area)
- [ ] Sidebar navigation (admin menu) — collapsible via Alpine store
- [ ] Forms (inputs, selects, textareas, checkboxes, radios, file upload)
- [ ] Buttons (primary, secondary, danger, ghost)
- [ ] Tables (Views, content listings)
- [ ] System messages (status, warning, error, info) — dismissible via Alpine
- [ ] Breadcrumb
- [ ] Tabs (local and primary)
- [ ] Pager
- [ ] User menu dropdown — Alpine dropdown pattern

### Medium priority
- [ ] Media Library
- [ ] CKEditor 5
- [ ] Content Moderation (workflow status badges)
- [ ] Drupal Toolbar (top bar)
- [ ] Login form

### Low priority (post-v1)
- [ ] Layout Builder
- [ ] Views UI
- [ ] Module admin pages
- [ ] Dark mode — Alpine store + CSS variables
- [ ] Drupal 12 compatibility pass

---

## Accessibility

The theme must comply with WCAG 2.1 AA. Key requirements:

- Minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text
- Visible focus on all interactive elements (`outline` never removed without an alternative)
- RTL support via `[dir="rtl"]`
- No content conveyed by color alone
- All Alpine-driven interactive components must maintain correct ARIA state

---

## What not to do

- Do not introduce Bootstrap, Tailwind, or any CSS framework
- Do not rely on jQuery (Drupal loads it but do not depend on it)
- Do not modify files outside the theme folder
- Do not duplicate CSS already defined in `tokens.css`
- Do not hardcode any spacing, color, or radius value — always use tokens
- Do not forget `:hover`, `:focus`, `:active`, `:disabled` states on interactive components
- Do not use Alpine.js for data fetching or complex application logic

---

## Visual reference

Two key screens define the visual identity:

**Dashboard** — dark sidebar `#1e1b2e`, white surfaces, clean stat cards, table with colored status pills, topbar with search and user avatar.

**Edit form** — two-column layout (main content + metadata sidebar), integrated CKEditor toolbar, tag pills input, sidebar with Publication / Author / Revisions / URL sections, sticky actions in the topbar.

---

## Drupal Behaviors (js/theme.js)

All theme behaviors are registered via `Drupal.behaviors` in `js/theme.js`:

- `clarityInit` — initializes Alpine stores (`sidebar`, `theme`)
- `claritySidebarOverlay` — closes the sidebar on mobile when clicking the overlay
- `clarityAutoDismiss` — auto-dismisses messages that have a `data-auto-dismiss` attribute
- `clarityDropbutton` — repositions dropbutton dropdowns using `fixed` positioning to escape `overflow` clipping in table wrappers
- `clarityNavFlyout` — aligns sub-menus using `fixed` positioning so they are never clipped by the sidebar
- `clarityNodeAddList` — makes `<dd>` elements in the node-add list fully clickable
- `clarityFocusTrap` — traps focus inside modals for accessibility compliance

---

## Drush commands

All Drush commands run inside the Docker container:

```bash
# Clear all caches — run after EVERY file change (CSS, JS, Twig, PHP, YML)
docker compose exec php drush cr

# Export active config to files
docker compose exec php drush cex

# Import config from files into the database
docker compose exec php drush cim
```

**Rule:** after modifying any theme file, always run `docker compose exec php drush cr` before testing in the browser.

---

## Development workflow

1. Implement one component at a time
2. Run `docker compose exec php drush cr` after every file change
3. Test on a real Drupal instance with actual content
4. Check rendering with common contrib modules (Admin Toolbar, Webform, etc.)
5. Verify accessibility before considering a component done
6. Commit the component with a descriptive message

---

## Git workflow

After every task that produces a confirmed working result, automatically run:

1. git add -A web/themes/custom/clarity/
2. git commit -m "<type>(<scope>): <short description>"

Commit types: feat / fix / style / refactor
Scope: the component name (e.g. dropbutton, buttons, forms, layout)

Examples:
- feat(dropbutton): split button base styles
- fix(dropbutton): dropdown positioning and arrow alignment
- style(buttons): reduce padding, fix hover state

Rules:
- Never commit if the user has not explicitly confirmed the result is working
- Never commit files outside web/themes/custom/clarity/
- Always use conventional commits format
- Keep the message short and descriptive

---

## Useful resources

- [Drupal theming guide](https://www.drupal.org/docs/theming-drupal)
- [Drupal template suggestions](https://www.drupal.org/docs/theming-drupal/twig-in-drupal/working-with-twig-templates)
- [Alpine.js documentation](https://alpinejs.dev)
- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [Filament PHP](https://filamentphp.com) — visual reference
