# Design Tokens That Scale 

-   Tokens prevent style drift and make global changes safe — they’re essential for scaling UIs
-   Tailwind v4 uses a CSS-first approach: all design tokens are exposed as native CSS variables
-   Use three token layers: base (raw values), semantic (purpose-driven), component (variants)
-   The `@theme` directive creates tokens that automatically generate utility classes
-   Define motion tokens for consistent animation across your site
-   Tailwind v4 delivers 5x faster builds and 100x faster incremental builds


| Problem | What Happens |
| --- | --- |
| **Style drift** | Random hex codes, one-off spacing values |
| **Refactor risk** | Changing one color breaks unknown components |
| **Inconsistency** | Same UI element looks different in different places |
| **Onboarding friction** | New devs don’t know which values to use |
| **Theming difficulty** | Dark mode becomes a massive undertaking |


| Benefit | How |
| --- | --- |
| **Single source of truth** | Change once, update everywhere |
| **Safe refactoring** | Modify semantic tokens without touching components |
| **Consistency** | All components use the same values |
| **Theming** | Swap token values for dark mode, brands, etc. |
| **Communication** | Designers and devs speak the same language |


```
@theme {
  /* Color primitives (OKLCH for perceptual evenness) */
  --color-blue-100: oklch(95% 0.02 250);
  --color-blue-200: oklch(90% 0.04 250);
  --color-blue-300: oklch(80% 0.08 250);
  --color-blue-400: oklch(70% 0.12 250);
  --color-blue-500: oklch(60% 0.16 250);
  --color-blue-600: oklch(50% 0.16 250);
  --color-blue-700: oklch(40% 0.14 250);
  --color-blue-800: oklch(30% 0.12 250);
  --color-blue-900: oklch(20% 0.10 250);
  
  /* Spacing primitives */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  /* Radius primitives */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
}
```

```
@theme {
  /* Semantic colors */
  --color-background: var(--color-gray-50);
  --color-foreground: var(--color-gray-900);
  --color-muted: var(--color-gray-500);
  --color-border: var(--color-gray-200);
  --color-ring: var(--color-blue-500);
  
  /* Semantic surfaces */
  --color-surface-primary: var(--color-white);
  --color-surface-secondary: var(--color-gray-100);
  --color-surface-elevated: var(--color-white);
  
  /* Semantic actions */
  --color-action-primary: var(--color-blue-600);
  --color-action-primary-hover: var(--color-blue-700);
  --color-action-destructive: var(--color-red-600);
  
  /* Semantic states */
  --color-success: var(--color-green-600);
  --color-warning: var(--color-amber-500);
  --color-error: var(--color-red-600);
  --color-info: var(--color-blue-500);
  
  /* Semantic spacing */
  --space-content: var(--spacing-4);
  --space-section: var(--spacing-12);
  --space-page: var(--spacing-16);
}
```

```
@theme {
  /* Button tokens */
  --button-radius: var(--radius-md);
  --button-padding-x: var(--spacing-4);
  --button-padding-y: var(--spacing-2);
  
  /* Card tokens */
  --card-radius: var(--radius-lg);
  --card-padding: var(--spacing-6);
  --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Input tokens */
  --input-radius: var(--radius-md);
  --input-border-width: 1px;
  --input-padding-x: var(--spacing-3);
  --input-padding-y: var(--spacing-2);
}
```

**Never skip semantic tokens** — they’re what makes refactors safe. Component tokens should reference semantic tokens, semantic tokens reference base tokens.


### The Motion Token Set

```
@theme {
  /* Duration scale */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* Easing curves */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Stagger delays */
  --stagger-base: 50ms;
  --stagger-fast: 30ms;
  --stagger-slow: 100ms;
}
```

### Using Motion Tokens

```
.button {
  transition: all var(--duration-normal) var(--ease-out);
}

.dropdown-item {
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.modal {
  transition: 
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}
```

### Motion Token Guidelines

| Element | Duration | Easing |
| --- | --- | --- |
| Hover states | fast (100ms) | ease-out |
| Button clicks | normal (200ms) | ease-out |
| Tooltips | fast (100ms) | ease-out |
| Dropdowns | normal (200ms) | ease-out |
| Modals | slow (300ms) | ease-spring |
| Page transitions | slower (500ms) | ease-in-out |

