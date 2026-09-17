<script lang="ts">
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import {
    Button,
    Popup,
    Drawer,
    Dropdown,
    Dialog,
    Switch,
    Input,
    Textarea,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    Slider,
    Badge,
    Callout,
    Card,
    Tag,
    Accordion,
    AccordionItem,
    TabGroup,
    Tab,
    TabPanel,
    Toast,
    ToastItem,
    Tree,
    TreeItem,
    NumberInput,
    Pagination,
    Carousel,
    SplitPanel,
    Scroller,
    Comparison
  } from '$lib/components/generated';

  // Interactive Button state
  let buttonClicks = $state(0);
  let isLoading = $state(false);

  // Wave 2: Accordion state
  let accordionMode: 'multiple' | 'single' | 'single-collapsible' = $state('multiple');
  let accordionAppearance: 'outlined' | 'separated' = $state('outlined');

  // Wave 2: Tabs state
  let activeTab = $state('tab-overview');

  // Wave 2: Tags state
  let tagList = $state(['Svelte 5', 'Runes', 'Pure Sass', 'Design Tokens', 'Zero Bloat', 'Compiler']);
  function removeTag(tag: string) {
    tagList = tagList.filter(t => t !== tag);
  }
  function resetTags() {
    tagList = ['Svelte 5', 'Runes', 'Pure Sass', 'Design Tokens', 'Zero Bloat', 'Compiler'];
  }

  // Wave 2: Toast state
  interface ToastNotice {
    id: number;
    variant: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    title: string;
    message: string;
  }
  let toasts = $state<ToastNotice[]>([]);
  let toastSeq = 0;
  function triggerToast(variant: 'brand' | 'neutral' | 'success' | 'warning' | 'danger') {
    const id = ++toastSeq;
    const titles = {
      brand: 'Design Token Synced',
      success: 'Component Compiled Successfully',
      warning: 'High Memory Threshold Approaching',
      danger: 'Build Pipeline Interrupted',
      neutral: 'Theme Preference Saved'
    };
    const messages = {
      brand: 'New semantic variable applied across all 4 theme presets.',
      success: '100% token purity verified with zero TypeScript diagnostics.',
      warning: 'Component payload exceeds standard 15kb budget.',
      danger: 'Fatal AST validation error on unmapped element.',
      neutral: 'Local storage synced to cui-theme configuration.'
    };
    toasts = [...toasts, { id, variant, title: titles[variant], message: messages[variant] }];
  }

  // Wave 2: Tree state
  let selectedTreeNodes = $state<string[]>(['compiler.ts']);
  let treeSelectionMode: 'single' | 'multiple' = $state('single');

  // Switch states
  let switchA = $state(true);
  let switchB = $state(false);
  let switchC = $state(true);
  let switchDisabled = $state(false);

  // Input states
  let userName = $state('Amrit');
  let userEmail = $state('amrit@fractalmandala.in');
  let searchQuery = $state('Closed-vocabulary compiler');
  let inputError = $state('');

  // Textarea state
  let userBio = $state('Building autonomous UI generation engines with pure Sass and Svelte 5 runes.');

  // Checkbox states
  let agreeTerms = $state(true);
  let newsletter = $state(false);
  let indeterminateCheck = $state(true);
  let featAutoLayout = $state(true);
  let featTokenParity = $state(true);
  let featZeroBloat = $state(false);

  // Radio state
  let selectedTier = $state('pro');

  // Slider states
  let volumeLevel = $state(72);
  let brightnessLevel = $state(45);

  // Popup state
  let popupOpen = $state(false);
  let popupPlacement: 'top' | 'bottom' | 'left' | 'right' = $state('bottom');

  // Drawer state
  let drawerOpen = $state(false);
  let drawerPlacement: 'left' | 'right' | 'top' | 'bottom' = $state('right');

  // Dropdown state
  let dropdownOpen = $state(false);
  let selectedDropdownAction = $state('None');

  // Dialog state
  let dialogOpen = $state(false);
  let dialogSize: 'sm' | 'md' | 'lg' = $state('md');
  import { onMount } from 'svelte';

  // Wave 4: NumberInput state
  let numValue = $state(42);
  let numStep = $state(1);

  // Wave 4: Pagination state
  let currentPage = $state(4);
  let paginationSiblings = $state(1);
  let paginationEdges = $state(true);

  // Wave 4: Carousel state
  let carouselIndex = $state(0);
  let carouselLoop = $state(false);
  const carouselSlides = [
    { id: 's1', title: 'Anatomy Extraction' },
    { id: 's2', title: 'Recipe Mapping' },
    { id: 's3', title: 'Pure Compilation' },
    { id: 's4', title: 'Token Purity Gates' }
  ];

  // Wave 4: SplitPanel state
  let splitValue = $state(50);
  let splitOrientation: 'horizontal' | 'vertical' = $state('horizontal');

  // Wave 4: Scroller state
  let scrollDirection: 'vertical' | 'horizontal' | 'both' = $state('vertical');
  let scrollFade = $state(true);
  let scrollSnap: 'none' | 'proximity' | 'mandatory' = $state('none');

  // Wave 4: Comparison state
  let comparePosition = $state(50);

  // Geometry, Density & Sizing Token Tuning States
  let selectedRadius: 'theme' | 'square' | 'subtle' | 'modern' | 'round' = $state('theme');
  let selectedDensity: 'theme' | 'compact' | 'normal' | 'spacious' = $state('theme');
  let selectedScale: 'compact' | 'normal' | 'expanded' = $state('normal');

  function setRadius(r: 'theme' | 'square' | 'subtle' | 'modern' | 'round') {
    selectedRadius = r;
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const radiusVars = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];

    if (r === 'theme') {
      delete root.dataset.radius;
      radiusVars.forEach(v => root.style.removeProperty(v));
    } else if (r === 'square') {
      root.dataset.radius = 'square';
      root.style.setProperty('--radius-xs', '0px');
      root.style.setProperty('--radius-sm', '0px');
      root.style.setProperty('--radius-md', '0px');
      root.style.setProperty('--radius-lg', '0px');
      root.style.setProperty('--radius-xl', '0px');
      root.style.setProperty('--radius-full', '0px');
    } else if (r === 'subtle') {
      root.dataset.radius = 'subtle';
      root.style.setProperty('--radius-xs', '1px');
      root.style.setProperty('--radius-sm', '2px');
      root.style.setProperty('--radius-md', '4px');
      root.style.setProperty('--radius-lg', '6px');
      root.style.setProperty('--radius-xl', '8px');
      root.style.setProperty('--radius-full', '9999px');
    } else if (r === 'modern') {
      root.dataset.radius = 'modern';
      root.style.setProperty('--radius-xs', '2px');
      root.style.setProperty('--radius-sm', '4px');
      root.style.setProperty('--radius-md', '8px');
      root.style.setProperty('--radius-lg', '12px');
      root.style.setProperty('--radius-xl', '16px');
      root.style.setProperty('--radius-full', '9999px');
    } else if (r === 'round') {
      root.dataset.radius = 'round';
      root.style.setProperty('--radius-xs', '6px');
      root.style.setProperty('--radius-sm', '10px');
      root.style.setProperty('--radius-md', '18px');
      root.style.setProperty('--radius-lg', '26px');
      root.style.setProperty('--radius-xl', '36px');
      root.style.setProperty('--radius-full', '9999px');
    }
  }

  function setDensity(d: 'theme' | 'compact' | 'normal' | 'spacious') {
    selectedDensity = d;
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const spaceVars = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8', '--space-12', '--space-16'];

    if (d === 'theme') {
      delete root.dataset.density;
      spaceVars.forEach(v => root.style.removeProperty(v));
    } else if (d === 'compact') {
      root.dataset.density = 'compact';
      root.style.setProperty('--space-1', '0.15rem');
      root.style.setProperty('--space-2', '0.35rem');
      root.style.setProperty('--space-3', '0.5rem');
      root.style.setProperty('--space-4', '0.75rem');
      root.style.setProperty('--space-5', '1rem');
      root.style.setProperty('--space-6', '1.25rem');
      root.style.setProperty('--space-8', '1.5rem');
    } else if (d === 'normal') {
      root.dataset.density = 'normal';
      root.style.setProperty('--space-1', '0.25rem');
      root.style.setProperty('--space-2', '0.5rem');
      root.style.setProperty('--space-3', '0.75rem');
      root.style.setProperty('--space-4', '1rem');
      root.style.setProperty('--space-5', '1.25rem');
      root.style.setProperty('--space-6', '1.5rem');
      root.style.setProperty('--space-8', '2rem');
    } else if (d === 'spacious') {
      root.dataset.density = 'spacious';
      root.style.setProperty('--space-1', '0.375rem');
      root.style.setProperty('--space-2', '0.75rem');
      root.style.setProperty('--space-3', '1.125rem');
      root.style.setProperty('--space-4', '1.5rem');
      root.style.setProperty('--space-5', '1.875rem');
      root.style.setProperty('--space-6', '2.25rem');
      root.style.setProperty('--space-8', '3rem');
    }
  }

  function setScale(s: 'compact' | 'normal' | 'expanded') {
    selectedScale = s;
    document.documentElement.dataset.scale = s;
  }

  let dialogConfirmed = $state(false);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('radius')) {
      const r = params.get('radius') as any;
      if (['theme', 'square', 'subtle', 'modern', 'round'].includes(r)) {
        setRadius(r);
      }
    }
    if (params.has('density')) {
      const d = params.get('density') as any;
      if (['theme', 'compact', 'normal', 'spacious'].includes(d)) {
        setDensity(d);
      }
    }
    if (params.has('scale')) {
      const sc = params.get('scale') as any;
      if (['compact', 'normal', 'expanded'].includes(sc)) {
        setScale(sc);
      }
    }
    if (params.has('drawer')) {
      const p = params.get('drawer');
      if (p === 'left' || p === 'right' || p === 'top' || p === 'bottom') {
        drawerPlacement = p;
      }
      drawerOpen = true;
    }
    if (params.has('dialog')) {
      const s = params.get('dialog');
      if (s === 'sm' || s === 'md' || s === 'lg') {
        dialogSize = s;
      }
      dialogOpen = true;
    }
    if (params.has('popup')) {
      popupOpen = true;
    }
  });

  function simulateLoad() {
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
      buttonClicks++;
    }, 1200);
  }

  function validateEmail() {
    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      inputError = 'Please enter a valid email address';
    } else {
      inputError = '';
    }
  }
</script>

<div class="gen-showcase-container">
  <!-- Top Navigation Bar with Theme & Mode Switcher -->
  <header class="gen-header">
    <div class="gen-brand">
      <a href="/" class="gen-back-link">&larr; Main</a>
      <a href="/playground2" class="gen-back-link" style="background-color: var(--color-primary-subtle); color: var(--color-primary); font-weight: 600;">👉 Playground 2 (Neo-Brutalist Lab) &rarr;</a>
      <span class="gen-badge">32 Components Active</span>
      <h1>Create UI Automated Component Lab</h1>
    </div>
    <div class="gen-actions">
      <ThemeSwitcher />
    </div>
  </header>

  <!-- Live Token Tuning Console (Radius, Density, Sizing, Gaps) -->
  <div class="gen-tuning-bar" role="toolbar" aria-label="Token Tuning Controls">
    <div class="gen-tuning-group">
      <span class="gen-tuning-label">Corner Geometry:</span>
      <div class="gen-btn-toggle-group">
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedRadius === 'theme'}
          onclick={() => setRadius('theme')}
        >Default</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedRadius === 'square'}
          onclick={() => setRadius('square')}
        >Square (0px)</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedRadius === 'subtle'}
          onclick={() => setRadius('subtle')}
        >Subtle (4px)</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedRadius === 'modern'}
          onclick={() => setRadius('modern')}
        >Modern (8px)</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedRadius === 'round'}
          onclick={() => setRadius('round')}
        >Round / Pill</button>
      </div>
    </div>

    <div class="gen-tuning-divider"></div>

    <div class="gen-tuning-group">
      <span class="gen-tuning-label">Space &amp; Gaps:</span>
      <div class="gen-btn-toggle-group">
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedDensity === 'theme'}
          onclick={() => setDensity('theme')}
        >Default</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedDensity === 'compact'}
          onclick={() => setDensity('compact')}
        >Compact</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedDensity === 'normal'}
          onclick={() => setDensity('normal')}
        >Normal</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedDensity === 'spacious'}
          onclick={() => setDensity('spacious')}
        >Spacious</button>
      </div>
    </div>

    <div class="gen-tuning-divider"></div>

    <div class="gen-tuning-group">
      <span class="gen-tuning-label">Base Sizing:</span>
      <div class="gen-btn-toggle-group">
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedScale === 'compact'}
          onclick={() => setScale('compact')}
        >0.875x</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedScale === 'normal'}
          onclick={() => setScale('normal')}
        >1.0x</button>
        <button
          type="button"
          class="gen-tune-btn"
          class:active={selectedScale === 'expanded'}
          onclick={() => setScale('expanded')}
        >1.125x</button>
      </div>
    </div>
  </div>

  <main class="gen-main">
    <div class="gen-intro">
      <p>
        <strong>13 Components Synthesized</strong> via pure mechanical compilation (<code>CORE-IDEA.md</code>):
        Zero in-component styles, pure single-tab indented Sass, strict 102-token semantic parity scale, and 4 Invariant Layout Laws.
        Toggle the <strong>Theme Switcher</strong> above and use the <strong>Token Tuning Console</strong> to test real-time extensibility across themes, corner geometry (Square vs Round), spacing density, and component sizing.
      </p>
    </div>

    <div class="gen-grid">
      <!-- 1. BUTTON SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>1. Button</h2>
          <span class="gen-tag">control.button</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Variants</div>
          <div class="gen-flex-row">
            <Button variant="primary" onclick={() => buttonClicks++}>Primary</Button>
            <Button variant="secondary" onclick={() => buttonClicks++}>Secondary</Button>
            <Button variant="ghost" onclick={() => buttonClicks++}>Ghost</Button>
            <Button variant="danger" onclick={() => buttonClicks++}>Danger</Button>
          </div>

          <div class="gen-row-label">Sizes</div>
          <div class="gen-flex-row" style="align-items: center">
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
          </div>

          <div class="gen-row-label">States &amp; Feedback</div>
          <div class="gen-flex-row" style="align-items: center">
            <Button variant="primary" loading={isLoading} onclick={simulateLoad}>
              {isLoading ? 'Saving...' : 'Click to Load'}
            </Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <span class="gen-live-text">Clicks: <strong>{buttonClicks}</strong></span>
          </div>
        </div>
      </section>

      <!-- 2. SWITCH / TOGGLE SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>2. Switch (Toggle)</h2>
          <span class="gen-tag">control.switch</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Sizes &amp; Live Reactivity</div>
          <div class="gen-flex-col">
            <Switch size="sm" bind:checked={switchA} label="Small Switch" hint="Compact table density" />
            <Switch size="md" bind:checked={switchB} label="Medium Switch (Default)" hint="Standard form input" />
            <Switch size="lg" bind:checked={switchC} label="Large Switch" hint="Accessible touch target" />
            <Switch size="md" disabled bind:checked={switchDisabled} label="Disabled Switch" hint="Cannot be toggled" />
          </div>

          <div class="gen-status-box">
            <span>Switch States:</span>
            <code>A: {switchA ? 'ON' : 'OFF'}</code> |
            <code>B: {switchB ? 'ON' : 'OFF'}</code> |
            <code>C: {switchC ? 'ON' : 'OFF'}</code>
          </div>
        </div>
      </section>

      <!-- 3. INPUT SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>3. Text Input</h2>
          <span class="gen-tag">control.input</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Text &amp; Validation</div>
          <div class="gen-flex-col">
            <Input
              label="Full Name"
              placeholder="e.g. Amrit Sharma"
              bind:value={userName}
              hint="Your public profile display name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              bind:value={userEmail}
              error={inputError}
              oninput={validateEmail}
              hint="We will send confirmation here"
              clearable
            />

            <Input
              label="Clearable Search"
              placeholder="Search components..."
              bind:value={searchQuery}
              appearance="filled"
              clearable
            >
              {#snippet start()}
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              {/snippet}
            </Input>
          </div>
        </div>
      </section>

      <!-- 4. TEXTAREA SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>4. Textarea</h2>
          <span class="gen-tag">control.textarea</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Multi-line Editor</div>
          <div class="gen-flex-col">
            <Textarea
              label="Bio &amp; Notes"
              placeholder="Describe your design system workflow..."
              bind:value={userBio}
              rows={4}
              maxlength={200}
              hint="Supports live length count and auto-scroll"
            />
            <Textarea
              label="Readonly Output"
              value="Generated from anatomy and closed-vocabulary roles.sass.json specifications."
              readonly
              rows={2}
            />
          </div>
        </div>
      </section>

      <!-- 5. CHECKBOX & CHECKBOXGROUP SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>5. Checkbox &amp; Group</h2>
          <span class="gen-tag">control.checkbox</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Single &amp; Indeterminate</div>
          <div class="gen-flex-col">
            <Checkbox
              bind:checked={agreeTerms}
              label="Accept Terms &amp; Conditions"
              hint="Required to proceed with code generation"
            />
            <Checkbox
              bind:indeterminate={indeterminateCheck}
              label="Indeterminate Tri-State"
              hint="Click to resolve indeterminate state"
            />
          </div>

          <div class="gen-row-label">Checkbox Group</div>
          <CheckboxGroup label="Compiler Flags" hint="Select features to bundle" orientation="vertical">
            <Checkbox bind:checked={featAutoLayout} label="Enforce 4 Invariant Layout Laws" />
            <Checkbox bind:checked={featTokenParity} label="Strict 102-Token Parity Check" />
            <Checkbox bind:checked={featZeroBloat} label="Zero In-Component CSS Bloat" />
          </CheckboxGroup>
        </div>
      </section>

      <!-- 6. RADIO & RADIOGROUP SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>6. Radio &amp; RadioGroup</h2>
          <span class="gen-tag">control.radio</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Radio Selection Group</div>
          <RadioGroup label="Deployment Strategy" hint="Active license configuration" orientation="vertical">
            <Radio
              name="deploy-tier"
              value="starter"
              checked={selectedTier === 'starter'}
              onchange={(v) => selectedTier = v}
              label="Starter Tier"
              hint="Local compiler and single theme"
            />
            <Radio
              name="deploy-tier"
              value="pro"
              checked={selectedTier === 'pro'}
              onchange={(v) => selectedTier = v}
              label="Pro Tier (Recommended)"
              hint="Full 4-theme token suite + all 13 components"
            />
            <Radio
              name="deploy-tier"
              value="enterprise"
              checked={selectedTier === 'enterprise'}
              onchange={(v) => selectedTier = v}
              label="Enterprise Suite"
              hint="Custom headless anatomy parser and AST compiler"
            />
          </RadioGroup>

          <div class="gen-status-box">
            <span>Selected Tier:</span>
            <strong>{selectedTier.toUpperCase()}</strong>
          </div>
        </div>
      </section>

      <!-- 7. SLIDER SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>7. Slider (Range)</h2>
          <span class="gen-tag">control.slider</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Dynamic Values &amp; Progress Fills</div>
          <div class="gen-flex-col">
            <Slider
              label="Audio Gain (Volume)"
              bind:value={volumeLevel}
              min={0}
              max={100}
              step={1}
              size="md"
              hint="Calculates live --slider-pct fill gradient"
            />
            <Slider
              label="Display Brightness"
              bind:value={brightnessLevel}
              min={0}
              max={100}
              step={5}
              size="sm"
            />
            <Slider
              label="Disabled Control"
              value={30}
              disabled
              hint="Interactions disabled via token opacity"
            />
          </div>

          <div class="gen-status-box">
            <span>Volume: <code>{volumeLevel}%</code></span> |
            <span>Brightness: <code>{brightnessLevel}%</code></span>
          </div>
        </div>
      </section>

      <!-- 8. POPUP SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>8. Popup</h2>
          <span class="gen-tag">surface.floating</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Placement Controls</div>
          <div class="gen-flex-row">
            {#each (['top', 'bottom', 'left', 'right'] as ('top' | 'bottom' | 'left' | 'right')[]) as p}
              <Button
                variant={popupPlacement === p ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => { popupPlacement = p; popupOpen = true; }}
              >
                {p}
              </Button>
            {/each}
          </div>

          <div class="gen-center-stage">
            <Popup bind:open={popupOpen} placement={popupPlacement}>
              {#snippet trigger()}
                <Button variant="primary">
                  Popup Target ({popupPlacement})
                </Button>
              {/snippet}
              {#snippet content()}
                <div style="width: 14rem">
                  <strong style="display: block; margin-bottom: 4px">Anchored Tooltip</strong>
                  <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-xs)">
                    Positioned via pure CSS offsets relative to trigger with rotating arrow geometry.
                  </p>
                </div>
              {/snippet}
            </Popup>
          </div>
        </div>
      </section>

      <!-- 9. DROPDOWN SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>9. Dropdown Menu</h2>
          <span class="gen-tag">control.menu-item</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Interactive Action Menu</div>
          <div class="gen-flex-row">
            <Dropdown
              bind:open={dropdownOpen}
              items={[
                { id: 'profile', label: 'View Profile' },
                { id: 'team', label: 'Workspace Settings' },
                { id: 'docs', label: 'API Reference' },
                { id: 'div-1', label: '', divider: true },
                { id: 'logout', label: 'Sign Out', danger: true }
              ]}
              onselect={(item) => selectedDropdownAction = item.label}
            />
          </div>

          <div class="gen-status-box" style="margin-top: var(--space-4)">
            <span>Last Selected:</span>
            <strong>{selectedDropdownAction}</strong>
          </div>
        </div>
      </section>

      <!-- 10. DRAWER SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>10. Drawer (Verified 0-Scroll)</h2>
          <span class="gen-tag">surface.drawer-panel</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Open Direction</div>
          <div class="gen-flex-row">
            <Button variant="secondary" onclick={() => { drawerPlacement = 'left'; drawerOpen = true; }}>Left</Button>
            <Button variant="primary" onclick={() => { drawerPlacement = 'right'; drawerOpen = true; }}>Right (Default)</Button>
            <Button variant="secondary" onclick={() => { drawerPlacement = 'bottom'; drawerOpen = true; }}>Bottom Sheet</Button>
            <Button variant="secondary" onclick={() => { drawerPlacement = 'top'; drawerOpen = true; }}>Top Banner</Button>
          </div>

          <Drawer bind:open={drawerOpen} placement={drawerPlacement} title={`Slide-out (${drawerPlacement})`}>
            <div style="display: flex; flex-direction: column; gap: var(--space-4)">
              <p>
                This drawer enforces the <strong>4 Invariant Layout Laws</strong>: intrinsic height (<code>auto</code>),
                <code>min-height: 0</code> on body, <code>flex-shrink: 0</code> on header/footer, and ceiling bounds to eliminate accidental scrollbars.
              </p>
              <div class="gen-status-box">
                <span>Placement: <code>{drawerPlacement}</code></span>
              </div>
              <Switch bind:checked={switchB} label="Reactivity synced across drawer" />
            </div>
            {#snippet footer()}
              <Button variant="secondary" onclick={() => drawerOpen = false}>Cancel</Button>
              <Button variant="primary" onclick={() => drawerOpen = false}>Save Changes</Button>
            {/snippet}
          </Drawer>
        </div>
      </section>

      <!-- 11. DIALOG SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>11. Dialog (Modal)</h2>
          <span class="gen-tag">surface.dialog-panel</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Modal Trigger</div>
          <div class="gen-flex-row">
            <Button variant="primary" onclick={() => { dialogSize = 'sm'; dialogOpen = true; }}>Small Modal</Button>
            <Button variant="secondary" onclick={() => { dialogSize = 'md'; dialogOpen = true; }}>Standard Modal</Button>
            <Button variant="secondary" onclick={() => { dialogSize = 'lg'; dialogOpen = true; }}>Large Modal</Button>
          </div>

          <div class="gen-status-box" style="margin-top: var(--space-4)">
            <span>Confirmed Status:</span>
            <strong>{dialogConfirmed ? 'Confirmed!' : 'Not confirmed'}</strong>
          </div>

          <Dialog bind:open={dialogOpen} size={dialogSize} title="Confirm Environment Update">
            <p>
              Are you sure you want to promote the generated components to production? This will update token adapters for all 4 themes across light and dark modes.
            </p>
            {#snippet footer()}
              <Button variant="ghost" onclick={() => dialogOpen = false}>Dismiss</Button>
              <Button variant="primary" onclick={() => { dialogConfirmed = true; dialogOpen = false; }}>Confirm &amp; Proceed</Button>
            {/snippet}
          </Dialog>
        </div>
      </section>

      <!-- 12. GEOMETRY, SIZING & GAP STRESS MATRIX -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>12. Geometry, Sizing &amp; Gap Stress Matrix</h2>
          <span class="gen-tag">stress.matrix</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Corner Geometry: Square (0px) vs Modern (8px) vs Pill / Round</div>
          <div class="gen-matrix-row">
            <!-- 1. Square -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Square (0px Radius)</span>
              <div class="gen-stress-box" data-radius="square">
                <div class="gen-flex-row">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
                <Input size="sm" placeholder="Square Input (0px)" value="No border-radius applied" />
                <div class="gen-flex-row" style="align-items: center; justify-content: space-between">
                  <Switch size="sm" checked={true} label="Square Switch" />
                  <Checkbox checked={true} label="Square Box" />
                </div>
              </div>
            </div>

            <!-- 2. Modern -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Modern (8px Radius)</span>
              <div class="gen-stress-box" data-radius="modern">
                <div class="gen-flex-row">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
                <Input size="sm" placeholder="Modern Input (8px)" value="Balanced 8px radius" />
                <div class="gen-flex-row" style="align-items: center; justify-content: space-between">
                  <Switch size="sm" checked={true} label="Modern Switch" />
                  <Checkbox checked={true} label="Modern Box" />
                </div>
              </div>
            </div>

            <!-- 3. Round / Pill -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Round / Pill (Capsule)</span>
              <div class="gen-stress-box" data-radius="round">
                <div class="gen-flex-row">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
                <Input size="sm" placeholder="Pill Input" value="Capsule radius geometry" style="--radius-md: var(--radius-full)" />
                <div class="gen-flex-row" style="align-items: center; justify-content: space-between">
                  <Switch size="sm" checked={true} label="Pill Switch" />
                  <Checkbox checked={true} label="Round Box" style="--radius-xs: var(--radius-full)" />
                </div>
              </div>
            </div>
          </div>

          <div class="gen-row-label" style="margin-top: var(--space-4)">Gap Scale Comparison: Tight (0.25rem) vs Balanced (0.75rem) vs Spacious (1.5rem)</div>
          <div class="gen-matrix-row">
            <!-- Tight Gap -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Tight Gap (--space-1)</span>
              <div class="gen-stress-box" style="gap: var(--space-1)">
                <div style="display: flex; gap: var(--space-1); width: 100%">
                  <Input size="sm" placeholder="First Name" />
                  <Input size="sm" placeholder="Last Name" />
                  <Button size="sm" variant="primary">Submit</Button>
                </div>
                <div style="display: flex; gap: var(--space-1)">
                  <Button size="sm" variant="secondary">Cut</Button>
                  <Button size="sm" variant="secondary">Copy</Button>
                  <Button size="sm" variant="secondary">Paste</Button>
                </div>
              </div>
            </div>

            <!-- Balanced Gap -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Balanced Gap (--space-3)</span>
              <div class="gen-stress-box" style="gap: var(--space-3)">
                <div style="display: flex; gap: var(--space-3); width: 100%">
                  <Input size="sm" placeholder="First Name" />
                  <Input size="sm" placeholder="Last Name" />
                  <Button size="sm" variant="primary">Submit</Button>
                </div>
                <div style="display: flex; gap: var(--space-3)">
                  <Button size="sm" variant="secondary">Cut</Button>
                  <Button size="sm" variant="secondary">Copy</Button>
                  <Button size="sm" variant="secondary">Paste</Button>
                </div>
              </div>
            </div>

            <!-- Spacious Gap -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Spacious Gap (--space-6)</span>
              <div class="gen-stress-box" style="gap: var(--space-6)">
                <div style="display: flex; gap: var(--space-6); width: 100%">
                  <Input size="sm" placeholder="First Name" />
                  <Input size="sm" placeholder="Last Name" />
                  <Button size="sm" variant="primary">Submit</Button>
                </div>
                <div style="display: flex; gap: var(--space-6)">
                  <Button size="sm" variant="secondary">Cut</Button>
                  <Button size="sm" variant="secondary">Copy</Button>
                  <Button size="sm" variant="secondary">Paste</Button>
                </div>
              </div>
            </div>
          </div>

          <div class="gen-row-label" style="margin-top: var(--space-4)">Component Sizing Spectrum: Small (sm) vs Medium (md) vs Large (lg)</div>
          <div class="gen-matrix-row">
            <!-- Small -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Small Control Suite (size="sm")</span>
              <div class="gen-stress-box">
                <Button size="sm" variant="primary">Small Button (sm)</Button>
                <Input size="sm" placeholder="Small Input" value="Compact density" />
                <Switch size="sm" checked={true} label="Small Switch" />
                <Slider size="sm" value={35} label="Small Slider" />
              </div>
            </div>

            <!-- Medium -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Medium Control Suite (size="md" - Default)</span>
              <div class="gen-stress-box">
                <Button size="md" variant="primary">Medium Button (md)</Button>
                <Input size="md" placeholder="Medium Input" value="Standard density" />
                <Switch size="md" checked={true} label="Medium Switch" />
                <Slider size="md" value={60} label="Medium Slider" />
              </div>
            </div>

            <!-- Large -->
            <div class="gen-matrix-col">
              <span class="gen-matrix-title">Large Control Suite (size="lg")</span>
              <div class="gen-stress-box">
                <Button size="lg" variant="primary">Large Button (lg)</Button>
                <Input size="lg" placeholder="Large Input" value="Generous touch target" />
                <Switch size="lg" checked={true} label="Large Switch" />
                <Slider size="lg" value={85} label="Large Slider" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 13. ACCORDION SUITE -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>13. Accordion & Collapsible Hierarchy</h2>
          <div class="gen-header-actions">
            <span class="gen-tag">accordion.svelte</span>
          </div>
        </div>
        <div class="gen-card-body">
          <div class="gen-control-toolbar" style="display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4);">
            <div class="gen-tuning-group">
              <span class="gen-tuning-label">Mode:</span>
              <div class="gen-btn-toggle-group">
                <button type="button" class="gen-tune-btn" class:active={accordionMode === 'multiple'} onclick={() => accordionMode = 'multiple'}>Multiple</button>
                <button type="button" class="gen-tune-btn" class:active={accordionMode === 'single'} onclick={() => accordionMode = 'single'}>Single</button>
                <button type="button" class="gen-tune-btn" class:active={accordionMode === 'single-collapsible'} onclick={() => accordionMode = 'single-collapsible'}>Single-Collapsible</button>
              </div>
            </div>
            <div class="gen-tuning-group">
              <span class="gen-tuning-label">Appearance:</span>
              <div class="gen-btn-toggle-group">
                <button type="button" class="gen-tune-btn" class:active={accordionAppearance === 'outlined'} onclick={() => accordionAppearance = 'outlined'}>Outlined</button>
                <button type="button" class="gen-tune-btn" class:active={accordionAppearance === 'separated'} onclick={() => accordionAppearance = 'separated'}>Separated</button>
              </div>
            </div>
          </div>

          <Accordion mode={accordionMode} appearance={accordionAppearance}>
            <AccordionItem value="item-1" title="AST Anatomy Extraction">
              The compiler parses headless component sources using <code>svelte/compiler</code> to extract slot roles, reactive props, and data attributes into structured JSON contracts without human intervention.
            </AccordionItem>
            <AccordionItem value="item-2" title="Closed-Vocabulary Design System">
              Tokens are locked to strict semantic CSS variables (<code>--bg</code>, <code>--stroke-weaker</code>, <code>--radius-md</code>, <code>--space-3</code>). Hardcoded hex codes and pixel leaks are statically blocked by the token linter.
            </AccordionItem>
            <AccordionItem value="item-3" title="Single-Tab Indented Sass Architecture">
              Every component stylesheet is emitted as a pure, brace-free, semicolon-free <code>.sass</code> document that forwards cleanly into the central stylesheet registry.
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <!-- 14. BADGE & STATUS MARKERS -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>14. Badge & Status Markers</h2>
          <span class="gen-tag">badge.svelte</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-group">
            <span class="gen-sublabel">Accent Appearance (Subtle Tints)</span>
            <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2);">
              <Badge variant="brand">Brand</Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Review</Badge>
              <Badge variant="danger">Blocked</Badge>
            </div>
          </div>

          <div class="gen-group" style="margin-top: var(--space-4);">
            <span class="gen-sublabel">Filled & Outlined Appearances</span>
            <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2);">
              <Badge variant="brand" appearance="filled">Filled Brand</Badge>
              <Badge variant="success" appearance="filled">Filled Success</Badge>
              <Badge variant="danger" appearance="filled">Filled Danger</Badge>
              <Badge variant="brand" appearance="outlined">Outlined Brand</Badge>
              <Badge variant="warning" appearance="outlined">Outlined Warning</Badge>
            </div>
          </div>

          <div class="gen-group" style="margin-top: var(--space-4);">
            <span class="gen-sublabel">Pill Geometry & Scale Spectrum</span>
            <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2);">
              <Badge variant="brand" size="sm" pill={true}>99+</Badge>
              <Badge variant="success" size="md" pill={true}>v2.4.0</Badge>
              <Badge variant="warning" size="lg" pill={true}>Beta Release</Badge>
            </div>
          </div>
        </div>
      </section>

      <!-- 15. CALLOUT & ALERT BANNERS -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>15. Callouts & Alert Banners</h2>
          <span class="gen-tag">callout.svelte</span>
        </div>
        <div class="gen-card-body" style="display: flex; flex-direction: column; gap: var(--space-3);">
          <Callout variant="brand" title="Zero In-Component Styles">
            Components are compiled with zero <code>&lt;style&gt;</code> blocks, ensuring 100% style isolation and token portability.
          </Callout>

          <Callout variant="success" title="Token Parity Verified" closable={true}>
            All 21 component stylesheets passed strict token validation with zero raw hex or hardcoded pixel dimensions.
          </Callout>

          <Callout variant="warning" title="Memory Allocation Notice" closable={true}>
            Heap footprint is within standard margins, but caching layers will flush on the next compilation cycle.
          </Callout>

          <Callout variant="danger" title="Compilation Guardrail" closable={true}>
            Unmapped CSS variables will trigger immediate build failure to guarantee design system compliance.
          </Callout>
        </div>
      </section>

      <!-- 16. CARDS & MEDIA SURFACES -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>16. Cards & Media Surfaces</h2>
          <span class="gen-tag">card.svelte</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-grid" style="grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));">
            <!-- Vertical Elevated Card -->
            <Card appearance="elevated" orientation="vertical">
              {#snippet header()}
                <span>Autonomous Compiler</span>
              {/snippet}
              {#snippet headerActions()}
                <Badge variant="brand" pill={true}>Wave 2</Badge>
              {/snippet}
              <p style="margin: 0;">Generates production-grade Svelte 5 components with runes, slots, and single-tab indented Sass stylesheets without human coding.</p>
              {#snippet footer()}
                <span>Updated 2 minutes ago</span>
              {/snippet}
              {#snippet footerActions()}
                <Button size="sm" variant="primary">Deploy</Button>
              {/snippet}
            </Card>

            <!-- Horizontal Outlined Card -->
            <Card appearance="outlined" orientation="horizontal">
              {#snippet media()}
                <div style="width: 100%; height: 100%; min-height: 8rem; background: var(--bg-weaker); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
              {/snippet}
              {#snippet header()}
                <span>Multi-Theme Engine</span>
              {/snippet}
              <p style="margin: 0;">Instant switching across CreateUI, Terminal Mono, Cyber Neon, and Stone Editorial with 100% token consistency.</p>
              {#snippet footer()}
                <Badge variant="success" size="sm">4 Themes</Badge>
              {/snippet}
              {#snippet footerActions()}
                <Button size="sm" variant="secondary">Inspect</Button>
              {/snippet}
            </Card>
          </div>
        </div>
      </section>

      <!-- 17. TAB GROUP & ROVING PANES -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>17. Tabs & Roving Panes</h2>
          <span class="gen-tag">tab.svelte</span>
        </div>
        <div class="gen-card-body">
          <TabGroup bind:active={activeTab}>
            <div class="cui-tab-nav" role="tablist">
              <Tab value="tab-overview">Overview</Tab>
              <Tab value="tab-tokens">Tokens</Tab>
              <Tab value="tab-ast">AST Pipeline</Tab>
              <Tab value="tab-disabled" disabled={true}>Deprecated</Tab>
            </div>
            <TabPanel value="tab-overview">
              <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">
                The automated UI compiler turns headless component anatomy into fully styled, accessible components with zero in-component styles.
              </p>
            </TabPanel>
            <TabPanel value="tab-tokens">
              <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">
                Consumes 2-layer semantic design variables. All 4 theme presets implement the exact same closed vocabulary token contract.
              </p>
            </TabPanel>
            <TabPanel value="tab-ast">
              <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">
                AST analysis extracts <code>data-slot</code>, <code>$props()</code> destructuring, and template snippets deterministically.
              </p>
            </TabPanel>
          </TabGroup>
        </div>
      </section>

      <!-- 18. TAGS & REMOVABLE CHIPS -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>18. Tags & Removable Metadata</h2>
          <span class="gen-tag">tag.svelte</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-group">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
              <span class="gen-sublabel">Interactive Removable Tags ({tagList.length})</span>
              {#if tagList.length < 6}
                <button type="button" class="gen-tune-btn" onclick={resetTags}>Reset Tags</button>
              {/if}
            </div>
            <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              {#each tagList as t (t)}
                <Tag variant="neutral" withRemove={true} onremove={() => removeTag(t)}>{t}</Tag>
              {/each}
            </div>
          </div>

          <div class="gen-group" style="margin-top: var(--space-4);">
            <span class="gen-sublabel">Semantic Variants & Pill Geometry</span>
            <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2);">
              <Tag variant="brand" pill={true}>Compiler</Tag>
              <Tag variant="success" pill={true}>Clean Build</Tag>
              <Tag variant="warning" pill={true}>In Progress</Tag>
              <Tag variant="danger" pill={true}>Fatal Stop</Tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 19. TOAST NOTIFICATION STACK -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>19. Toast Notification System</h2>
          <span class="gen-tag">toast.svelte</span>
        </div>
        <div class="gen-card-body">
          <p style="margin-top: 0; color: var(--text-secondary); font-size: var(--text-sm);">
            Notifications stack dynamically at the <strong>bottom-right corner</strong> of the page with auto-dismiss timers and dismiss buttons:
          </p>
          <div class="gen-row-wrap" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3);">
            <Button size="sm" variant="primary" onclick={() => triggerToast('brand')}>Trigger Brand Toast</Button>
            <Button size="sm" variant="secondary" onclick={() => triggerToast('success')}>Trigger Success Toast</Button>
            <Button size="sm" variant="secondary" onclick={() => triggerToast('warning')}>Trigger Warning Toast</Button>
            <Button size="sm" variant="danger" onclick={() => triggerToast('danger')}>Trigger Danger Toast</Button>
          </div>
          <div style="margin-top: var(--space-3); font-size: var(--text-xs); color: var(--text-muted);">
            Active toasts in stack: <strong>{toasts.length}</strong>
          </div>
        </div>
      </section>

      <!-- 20. TREE HIERARCHY & SELECTION -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>20. Tree Hierarchy & Selection</h2>
          <span class="gen-tag">tree.svelte</span>
        </div>
        <div class="gen-card-body">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
            <span class="gen-sublabel">Selected: <code>{selectedTreeNodes.join(', ') || 'None'}</code></span>
            <div class="gen-btn-toggle-group">
              <button type="button" class="gen-tune-btn" class:active={treeSelectionMode === 'single'} onclick={() => treeSelectionMode = 'single'}>Single</button>
              <button type="button" class="gen-tune-btn" class:active={treeSelectionMode === 'multiple'} onclick={() => treeSelectionMode = 'multiple'}>Multiple</button>
            </div>
          </div>

          <div style="border: 1px solid var(--stroke-weakest); border-radius: var(--radius-md); padding: var(--space-3); background: var(--bg-weakest);">
            <Tree selection={treeSelectionMode} bind:selected={selectedTreeNodes}>
              <TreeItem value="src" label="src" expanded={true}>
                <TreeItem value="src/lib" label="lib" expanded={true}>
                  <TreeItem value="src/lib/components" label="components">
                    <TreeItem value="src/lib/components/generated" label="generated (21 components)" />
                  </TreeItem>
                  <TreeItem value="src/lib/styles" label="styles">
                    <TreeItem value="src/lib/styles/tokens" label="tokens (4 themes)" />
                    <TreeItem value="src/lib/styles/components" label="components (.sass)" />
                  </TreeItem>
                </TreeItem>
                <TreeItem value="src/routes" label="routes">
                  <TreeItem value="src/routes/generator" label="generator/+page.svelte" />
                </TreeItem>
              </TreeItem>
              <TreeItem value="scripts" label="scripts" expanded={true}>
                <TreeItem value="scripts/gen.mjs" label="gen.mjs" />
                <TreeItem value="scripts/lint-tokens.mjs" label="lint-tokens.mjs" />
                <TreeItem value="scripts/extract-anatomy.mjs" label="extract-anatomy.mjs" />
              </TreeItem>
            </Tree>
          </div>
        </div>
      </section>

      <!-- 21. LIVE FORM STATE DEBUG PANEL -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>21. Real-Time Reactive State Inspector (All 21 Components)</h2>
          <span class="gen-tag">debugger.json</span>
        </div>
        <div class="gen-card-body">
          <pre class="gen-debug-pre">{JSON.stringify({
            wave1: {
              buttons: { clicks: buttonClicks, loading: isLoading },
              switches: { a: switchA, b: switchB, c: switchC, disabled: switchDisabled },
              inputs: { userName, userEmail, searchQuery, error: inputError || null },
              textarea: { bioLength: userBio.length, userBio },
              checkboxes: { agreeTerms, newsletter, indeterminateCheck, flags: { featAutoLayout, featTokenParity, featZeroBloat } },
              radio: { selectedTier },
              sliders: { volumeLevel, brightnessLevel },
              dialog: { confirmed: dialogConfirmed, size: dialogSize }
            },
            wave2: {
              accordion: { mode: accordionMode, appearance: accordionAppearance },
              tabs: { activeTab },
              tags: { activeTags: tagList },
              toast: { activeCount: toasts.length },
              tree: { selectionMode: treeSelectionMode, selected: selectedTreeNodes }
            },
            wave4: {
              numberinput: { value: numValue, step: numStep },
              pagination: { page: currentPage, siblings: paginationSiblings, edges: paginationEdges },
              carousel: { index: carouselIndex, loop: carouselLoop, slides: carouselSlides.length },
              splitpanel: { split: splitValue, orientation: splitOrientation },
              scroller: { direction: scrollDirection, fade: scrollFade, snap: scrollSnap },
              comparison: { position: comparePosition }
            },
            tokens: {
              radius: selectedRadius,
              density: selectedDensity,
              scale: selectedScale
            }
          }, null, 2)}</pre>
        </div>
      </section>

      <!-- 22. NUMBER INPUT SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>22. NumberInput (Stepper)</h2>
          <span class="gen-tag">control.spinbutton</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Step Size</div>
          <div class="gen-flex-row">
            {#each (['1', '5', '10'] as ('1' | '5' | '10')[]) as s}
              <Button
                variant={numStep === Number(s) ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => numStep = Number(s)}
              >
                ±{s}
              </Button>
            {/each}
          </div>

          <NumberInput
            bind:value={numValue}
            min={0}
            max={100}
            step={numStep}
            label="Token Budget"
            hint="Clamped between 0 and 100"
          />

          <NumberInput value={0} min={0} max={10} label="Disabled" disabled />
          <NumberInput value={7} min={0} max={10} label="With Error" error="Value out of policy" />

          <div class="gen-status-box">
            <span>Live Value:</span>
            <strong>{numValue}</strong>
          </div>
        </div>
      </section>

      <!-- 23. PAGINATION SHOWCASE -->
      <section class="gen-card">
        <div class="gen-card-header">
          <h2>23. Pagination</h2>
          <span class="gen-tag">control.pagination</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Sibling Count</div>
          <div class="gen-flex-row">
            {#each ([0, 1, 2] as number[]) as s}
              <Button
                variant={paginationSiblings === s ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => paginationSiblings = s}
              >
                {s} sibling{s === 1 ? '' : 's'}
              </Button>
            {/each}
          </div>

          <div class="gen-flex-row">
            <Switch bind:checked={paginationEdges} label="Show first / last edges" />
          </div>

          <Pagination
            bind:page={currentPage}
            totalPages={12}
            siblingCount={paginationSiblings}
            showEdges={paginationEdges}
          />

          <div class="gen-status-box">
            <span>Active Page:</span>
            <strong>{currentPage} / 12</strong>
          </div>
        </div>
      </section>

      <!-- 24. CAROUSEL SHOWCASE -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>24. Carousel</h2>
          <span class="gen-tag">surface.carousel-track</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-flex-row">
            <Switch bind:checked={carouselLoop} label="Loop navigation" />
          </div>

          <Carousel
            bind:index={carouselIndex}
            items={carouselSlides}
            loop={carouselLoop}
            onchange={(i) => carouselIndex = i}
          >
            {#snippet slide({ item, position })}
              <div class="gen-carousel-meta">
                <strong>{item.title}</strong>
                <span>slide {position + 1} of {carouselSlides.length}</span>
              </div>
            {/snippet}
          </Carousel>

          <div class="gen-status-box">
            <span>Active Slide Index:</span>
            <strong>{carouselIndex}</strong>
          </div>
        </div>
      </section>

      <!-- 25. SPLIT PANEL SHOWCASE -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>25. SplitPanel (Drag Divider)</h2>
          <span class="gen-tag">layout.split</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Orientation</div>
          <div class="gen-flex-row">
            {#each (['horizontal', 'vertical'] as ('horizontal' | 'vertical')[]) as o}
              <Button
                variant={splitOrientation === o ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => splitOrientation = o}
              >
                {o}
              </Button>
            {/each}
          </div>

          <SplitPanel bind:split={splitValue} orientation={splitOrientation} min={15} max={85}>
            {#snippet start()}
              <div class="gen-pane-fill">
                <strong>Start Pane</strong>
                <span>Drag the divider — arrow keys nudge by 1, Shift+arrows by 10.</span>
              </div>
            {/snippet}
            {#snippet end()}
              <div class="gen-pane-fill">
                <strong>End Pane</strong>
                <span>Panes clamp between 15% and 85%.</span>
              </div>
            {/snippet}
          </SplitPanel>

          <div class="gen-status-box">
            <span>Split:</span>
            <strong>{Math.round(splitValue)}%</strong>
            <span>({splitOrientation})</span>
          </div>
        </div>
      </section>

      <!-- 26. SCROLLER SHOWCASE -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>26. Scroller (Layout-Law Scroll Body)</h2>
          <span class="gen-tag">layout.scroll-body</span>
        </div>
        <div class="gen-card-body">
          <div class="gen-row-label">Direction</div>
          <div class="gen-flex-row">
            {#each (['vertical', 'horizontal', 'both'] as ('vertical' | 'horizontal' | 'both')[]) as d}
              <Button
                variant={scrollDirection === d ? 'primary' : 'secondary'}
                size="sm"
                onclick={() => scrollDirection = d}
              >
                {d}
              </Button>
            {/each}
          </div>

          <div class="gen-flex-row">
            <Switch bind:checked={scrollFade} label="Edge fade mask" />
            <Switch
              checked={scrollSnap === 'mandatory'}
              label="Mandatory scroll snap"
              onchange={(v) => scrollSnap = v ? 'mandatory' : 'none'}
            />
          </div>

          <Scroller direction={scrollDirection} fade={scrollFade} snap={scrollSnap} maxHeight="14rem">
            {#if scrollDirection === 'vertical'}
              {#each Array.from({ length: 40 }, (_, i) => i + 1) as n}
                <span class="gen-scroll-chip">Row {n} — dense stress fixture</span>
              {/each}
            {:else}
              {#each Array.from({ length: 24 }, (_, i) => i + 1) as n}
                <span class="gen-scroll-chip">Column {n}</span>
              {/each}
            {/if}
          </Scroller>
        </div>
      </section>

      <!-- 27. COMPARISON SHOWCASE -->
      <section class="gen-card gen-card-span-all">
        <div class="gen-card-header">
          <h2>27. Comparison (Before / After Reveal)</h2>
          <span class="gen-tag">surface.comparison</span>
        </div>
        <div class="gen-card-body">
          <Comparison bind:position={comparePosition} beforeLabel="Draft" afterLabel="Shipped">
            {#snippet before()}
              <div class="gen-pane-fill">
                <strong>Draft UI</strong>
                <span>Arrow keys move the reveal by 2, Shift+arrows by 10.</span>
              </div>
            {/snippet}
            <div class="gen-pane-fill">
              <strong>Shipped UI</strong>
              <span>Drag the handle to reveal the layer underneath.</span>
            </div>
          </Comparison>

          <div class="gen-status-box">
            <span>Reveal Position:</span>
            <strong>{Math.round(comparePosition)}%</strong>
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Fixed Global Toast Region (Bottom-Right) -->
  <Toast placement="bottom-end">
    {#each toasts as t (t.id)}
      <ToastItem
        variant={t.variant}
        title={t.title}
        onclose={() => { toasts = toasts.filter(item => item.id !== t.id); }}
      >
        {t.message}
      </ToastItem>
    {/each}
  </Toast>
</div>

<style>
  .gen-showcase-container {
    min-height: 100vh;
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-sans);
    padding: var(--space-6);
    transition: background-color var(--duration-normal) var(--ease-out), color var(--duration-normal) var(--ease-out);
  }

  .gen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--stroke-weakest);
    margin-bottom: var(--space-6);
  }

  .gen-brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .gen-back-link {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    background: var(--bg-weaker);
    transition: background var(--duration-fast) var(--ease-out);
  }

  .gen-back-link:hover {
    background: var(--bg-base);
  }

  .gen-badge {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--color-primary);
    background-color: var(--color-primary-subtle);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    font-weight: 600;
  }

  .gen-brand h1 {
    font-size: var(--text-xl);
    font-weight: 700;
    margin: 0;
  }

  .gen-intro {
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-6);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .gen-intro code {
    font-family: var(--font-mono);
    color: var(--color-primary);
  }

  .gen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
    gap: var(--space-5);
  }

  .gen-card {
    background-color: var(--bg);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xs);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .gen-card-span-all {
    grid-column: 1 / -1;
  }

  .gen-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    background-color: var(--bg-weakest);
    border-bottom: 1px solid var(--stroke-weakest);
  }

  .gen-card-header h2 {
    font-size: var(--text-base);
    font-weight: 600;
    margin: 0;
  }

  .gen-tag {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .gen-card-body {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1;
  }

  .gen-row-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-top: var(--space-2);
  }

  .gen-flex-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .gen-flex-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .gen-live-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-left: auto;
  }

  .gen-status-box {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    background-color: var(--bg-weakest);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    border: 1px solid var(--stroke-weakest);
  }

  .gen-center-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) var(--space-4);
    background-color: var(--bg-weakest);
    border-radius: var(--radius-md);
    border: 1px dashed var(--stroke-weaker);
  }

  .gen-debug-pre {
    background-color: var(--bg-weakest);
    color: var(--text-primary);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    overflow-x: auto;
    margin: 0;
  }

  /* Live Token Tuning Console */
  .gen-tuning-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-6);
  }

  .gen-tuning-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .gen-tuning-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .gen-btn-toggle-group {
    display: inline-flex;
    background-color: var(--bg-weakest);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    padding: 2px;
    gap: 2px;
  }

  .gen-tune-btn {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-family: var(--font-sans);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
  }

  .gen-tune-btn:hover {
    color: var(--text-primary);
  }

  .gen-tune-btn.active {
    background-color: var(--bg);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: var(--shadow-xs);
  }

  .gen-tuning-divider {
    width: 1px;
    height: 1.25rem;
    background-color: var(--stroke-weakest);
  }

  /* Geometry & Gap Stress Matrix */
  .gen-matrix-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: var(--space-4);
  }

  .gen-matrix-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .gen-matrix-title {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .gen-stress-box {
    background-color: var(--bg-weakest);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Wave 4 specimens */
  .gen-carousel-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .gen-carousel-meta strong {
    font-size: var(--text-base);
    color: var(--text-primary);
  }

  .gen-carousel-meta span {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .gen-pane-fill {
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .gen-pane-fill strong {
    color: var(--text-primary);
  }

  .gen-scroll-chip {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    background-color: var(--bg-weakest);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    white-space: nowrap;
  }
</style>
