<script lang="ts">
  import { onMount } from 'svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import {
    Button,
    ButtonGroup,
    Input,
    Textarea,
    Select,
    Option,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    Switch,
    Slider,
    Badge,
    Tag,
    Callout,
    Card,
    Divider,
    ProgressBar,
    ProgressRing,
    Breadcrumb,
    BreadcrumbItem,
    TabGroup,
    Tab,
    TabPanel,
    Tree,
    TreeItem,
    Dialog,
    Drawer,
    Popup,
    Popover,
    Tooltip,
    Accordion,
    AccordionItem,
    Details,
    Avatar,
    CopyButton,
    Toast,
    ToastItem,
    NumberInput,
    Pagination,
    Carousel,
    SplitPanel,
    Scroller,
    Comparison
  } from '$lib/components/generated';

  // State: Playground Modifiers
  let activeDensity: 'compact' | 'normal' | 'spacious' = $state('normal');
  let activeRadius: 'sharp' | 'normal' | 'round' = $state('normal');

  // State: Interactive controls
  let buttonClicks = $state(0);
  let isLoading = $state(false);
  let progressVal = $state(68);
  let sliderVal = $state(42);
  let switchState1 = $state(true);
  let switchState2 = $state(false);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);
  let activeTab = $state('tab-system');
  let selectedFramework = $state('svelte5');

  // State: Wave 4 — Complex Layout
  let pg2NumValue = $state(25);
  let pg2Page = $state(3);
  let pg2CarouselIndex = $state(0);
  const pg2CarouselSlides = [
    { id: 'p1', title: 'Stark Borders' },
    { id: 'p2', title: 'Offset Shadows' },
    { id: 'p3', title: 'Canary Pop' },
    { id: 'p4', title: 'Boxy Geometry' }
  ];
  let pg2Split = $state(50);
  let pg2Compare = $state(50);

  // Dynamic tags
  let tagList = $state(['Zero-Bloat', 'Pure Sass', 'Svelte 5 Runes', 'Neo-Brutalist', 'Design Tokens', '100% Type-Safe']);
  function removeTag(tag: string) {
    tagList = tagList.filter(t => t !== tag);
  }
  function addSampleTag() {
    const next = ['Speed-Optimized', 'No Style Blocks', 'AST Validated', 'Hard Shadows'][Math.floor(Math.random() * 4)];
    if (!tagList.includes(next)) tagList.push(next);
  }

  // Dynamic toasts
  interface Notice {
    id: number;
    variant: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    title: string;
    message: string;
  }
  let toasts = $state<Notice[]>([]);
  let toastId = 0;

  function pushToast(variant: Notice['variant'], title: string, message: string) {
    const id = ++toastId;
    toasts = [...toasts, { id, variant, title, message }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  const RADIUS_VARS = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];
  const SPACE_VARS = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8', '--space-12', '--space-16'];

  onMount(() => {
    // Default this page to neobrutalist theme if not set
    const curTheme = document.documentElement.dataset.theme;
    if (!curTheme) {
      document.documentElement.dataset.theme = 'neobrutalist';
      localStorage.setItem('cui-theme', 'neobrutalist');
    }
    applyModifiers();
  });

  function applyModifiers() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Synchronize ClassList
    root.classList.remove('density-compact', 'density-normal', 'density-spacious', 'radius-square', 'radius-sharp', 'radius-normal', 'radius-round');

    // 1. DENSITY (Spacing scale)
    if (activeDensity === 'compact') {
      root.dataset.density = 'compact';
      root.classList.add('density-compact');
      root.style.setProperty('--space-1', '0.15rem');
      root.style.setProperty('--space-2', '0.35rem');
      root.style.setProperty('--space-3', '0.5rem');
      root.style.setProperty('--space-4', '0.75rem');
      root.style.setProperty('--space-5', '1rem');
      root.style.setProperty('--space-6', '1.25rem');
      root.style.setProperty('--space-8', '1.5rem');
      root.style.setProperty('--space-12', '2.25rem');
      root.style.setProperty('--space-16', '3rem');
    } else if (activeDensity === 'spacious') {
      root.dataset.density = 'spacious';
      root.classList.add('density-spacious');
      root.style.setProperty('--space-1', '0.375rem');
      root.style.setProperty('--space-2', '0.75rem');
      root.style.setProperty('--space-3', '1.125rem');
      root.style.setProperty('--space-4', '1.5rem');
      root.style.setProperty('--space-5', '1.875rem');
      root.style.setProperty('--space-6', '2.25rem');
      root.style.setProperty('--space-8', '3rem');
      root.style.setProperty('--space-12', '4.5rem');
      root.style.setProperty('--space-16', '6rem');
    } else {
      delete root.dataset.density;
      root.classList.add('density-normal');
      SPACE_VARS.forEach(v => root.style.removeProperty(v));
    }

    // 2. GEOMETRY (Corner radius scale)
    if (activeRadius === 'sharp') {
      root.dataset.radius = 'square';
      root.classList.add('radius-square', 'radius-sharp');
      root.style.setProperty('--radius-xs', '0px');
      root.style.setProperty('--radius-sm', '0px');
      root.style.setProperty('--radius-md', '0px');
      root.style.setProperty('--radius-lg', '0px');
      root.style.setProperty('--radius-xl', '0px');
      root.style.setProperty('--radius-full', '0px');
    } else if (activeRadius === 'round') {
      root.dataset.radius = 'round';
      root.classList.add('radius-round');
      root.style.setProperty('--radius-xs', '6px');
      root.style.setProperty('--radius-sm', '10px');
      root.style.setProperty('--radius-md', '20px');
      root.style.setProperty('--radius-lg', '28px');
      root.style.setProperty('--radius-xl', '36px');
      root.style.setProperty('--radius-full', '9999px');
    } else {
      // theme default: Brutalist 2-4px
      delete root.dataset.radius;
      root.classList.add('radius-normal');
      RADIUS_VARS.forEach(v => root.style.removeProperty(v));
    }
  }

  function setDensity(d: 'compact' | 'normal' | 'spacious') {
    activeDensity = d;
    applyModifiers();
  }

  function setRadius(r: 'sharp' | 'normal' | 'round') {
    activeRadius = r;
    applyModifiers();
  }
</script>

<div class="pg2-wrapper">
  <!-- Header & Live Navigation -->
  <header class="pg2-header">
    <div class="pg2-header-top">
      <Breadcrumb>
        <BreadcrumbItem href="/generator">CreateUI Suite</BreadcrumbItem>
        <BreadcrumbItem href="#">Playgrounds</BreadcrumbItem>
        <BreadcrumbItem current>Playground 2: Neo-Brutalist Lab</BreadcrumbItem>
      </Breadcrumb>
      <div class="pg2-header-actions">
        <ThemeSwitcher />
      </div>
    </div>

    <div class="pg2-hero">
      <div class="pg2-hero-badge-row">
        <span class="pg2-status-pill">
          <span class="pg2-status-dot"></span>
          ALL 32 GENERATED COMPONENTS
        </span>
        <span class="pg2-status-pill alt">100% RUNES // ZERO IN-COMPONENT STYLES</span>
      </div>
      <h1 class="pg2-hero-title">NEO-BRUTALIST SPECIMEN LAB</h1>
      <p class="pg2-hero-desc">
        Demonstrating total decoupling of component markup and visual grammar. The identical 32 generated components
        render under stark black/white outlines, unyielding offset shadows, and high-energy pop palettes without a single markup edit.
      </p>

      <!-- Modifier Toolbar -->
      <div class="pg2-modifier-toolbar">
        <div class="pg2-mod-group">
          <span class="pg2-mod-label">DENSITY:</span>
          <ButtonGroup orientation="horizontal">
            <Button variant={activeDensity === 'compact' ? 'primary' : 'secondary'} size="sm" onclick={() => setDensity('compact')}>Compact</Button>
            <Button variant={activeDensity === 'normal' ? 'primary' : 'secondary'} size="sm" onclick={() => setDensity('normal')}>Normal</Button>
            <Button variant={activeDensity === 'spacious' ? 'primary' : 'secondary'} size="sm" onclick={() => setDensity('spacious')}>Spacious</Button>
          </ButtonGroup>
        </div>

        <div class="pg2-mod-group">
          <span class="pg2-mod-label">GEOMETRY:</span>
          <ButtonGroup orientation="horizontal">
            <Button variant={activeRadius === 'sharp' ? 'primary' : 'secondary'} size="sm" onclick={() => setRadius('sharp')}>0px Stark</Button>
            <Button variant={activeRadius === 'normal' ? 'primary' : 'secondary'} size="sm" onclick={() => setRadius('normal')}>Brutalist (2-4px)</Button>
            <Button variant={activeRadius === 'round' ? 'primary' : 'secondary'} size="sm" onclick={() => setRadius('round')}>Round Pill</Button>
          </ButtonGroup>
        </div>

        <div class="pg2-mod-group">
          <span class="pg2-mod-label">QUICK SPAWN:</span>
          <ButtonGroup orientation="horizontal">
            <Button variant="secondary" size="sm" onclick={() => pushToast('success', 'Production Sync', 'Asset pipeline synced in 14ms.')}>+ Toast</Button>
            <Button variant="secondary" size="sm" onclick={() => isDialogOpen = true}>Launch Dialog</Button>
            <Button variant="secondary" size="sm" onclick={() => isDrawerOpen = true}>Open Drawer</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Showcase Grid -->
  <main class="pg2-grid">
    <!-- SECTION 1: ACTIONS & BUTTON GROUPS -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">01</div>
        <div>
          <h2 class="pg2-sec-title">Action Architecture</h2>
          <p class="pg2-sec-desc">Button variants, loading runes, grouped toolbars</p>
        </div>
      </div>

      <div class="pg2-row-wrap">
        <Button variant="primary" onclick={() => buttonClicks++}>Primary ({buttonClicks})</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="primary" loading={isLoading} onclick={() => { isLoading = true; setTimeout(() => isLoading = false, 1500); }}>
          {isLoading ? 'Processing...' : 'Click to Load'}
        </Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>

      <Divider orientation="horizontal">BUTTON TOOLBAR GROUPS</Divider>

      <div class="pg2-row-wrap">
        <ButtonGroup orientation="horizontal">
          <Button variant="secondary" size="sm">Format</Button>
          <Button variant="secondary" size="sm">Align</Button>
          <Button variant="secondary" size="sm">Transform</Button>
        </ButtonGroup>

        <ButtonGroup orientation="horizontal">
          <Button variant="primary" size="sm">Cut</Button>
          <Button variant="primary" size="sm">Copy</Button>
          <Button variant="primary" size="sm">Paste</Button>
        </ButtonGroup>
      </div>
    </section>

    <!-- SECTION 2: INPUTS & SELECTION CONTROLS -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">02</div>
        <div>
          <h2 class="pg2-sec-title">Form Inputs & Select</h2>
          <p class="pg2-sec-desc">Input, Textarea, Select with Option subcomponents</p>
        </div>
      </div>

      <div class="pg2-stack">
        <Input label="Repository URL" placeholder="https://github.com/org/repo" hint="HTTPS or SSH git link" />
        <Select label="Engine Choice" placeholder="Choose execution engine...">
          <Option value="svelte5" label="Svelte 5 (Runes)" />
          <Option value="ast-compiler" label="Deterministic AST Synthesizer" />
          <Option value="vite-engine" label="Vite 6 Fast Rollup" />
          <Option value="pnpm-monorepo" label="PNPM Workspace Engine" />
        </Select>
        <Textarea label="Manifest Configuration" placeholder="Enter custom YAML or JSON specs..." rows={3} />
      </div>
    </section>

    <!-- SECTION 3: TOGGLES & RANGE SELECTION -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">03</div>
        <div>
          <h2 class="pg2-sec-title">Toggles, Radios & Sliders</h2>
          <p class="pg2-sec-desc">Switch, Checkbox, CheckboxGroup, RadioGroup, Slider</p>
        </div>
      </div>

      <div class="pg2-stack">
        <div class="pg2-row-wrap">
          <Switch bind:checked={switchState1} label="Autonomous Mode" />
          <Switch bind:checked={switchState2} label="Strict Token Enforcement" />
        </div>

        <div class="pg2-split-col">
          <CheckboxGroup label="Target Environments" orientation="vertical">
            <Checkbox value="prod" checked label="Production Edge" />
            <Checkbox value="staging" checked label="Staging Mirror" />
            <Checkbox value="dev" label="Local Sandbox" />
          </CheckboxGroup>

          <RadioGroup name="strategy" label="Deployment Strategy" value="canary">
            <Radio value="instant" label="Instant Cutover" />
            <Radio value="canary" label="Canary (10% Traffic)" />
            <Radio value="blue-green" label="Blue/Green Partition" />
          </RadioGroup>
        </div>

        <div class="pg2-slider-box">
          <div class="pg2-slider-header">
            <span>Throttle Threshold</span>
            <strong>{sliderVal}%</strong>
          </div>
          <Slider min={0} max={100} step={1} bind:value={sliderVal} />
        </div>
      </div>
    </section>

    <!-- SECTION 4: METRICS & FEEDBACK -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">04</div>
        <div>
          <h2 class="pg2-sec-title">Feedback & Progress</h2>
          <p class="pg2-sec-desc">ProgressBar, ProgressRing, Badge, Tag, Callout</p>
        </div>
      </div>

      <div class="pg2-stack">
        <div class="pg2-row-space">
          <div>
            <span class="pg2-label-micro">COMPILER TELEMETRY ({progressVal}%)</span>
            <ProgressBar value={progressVal} />
          </div>
          <div class="pg2-ring-pair">
            <ProgressRing value={progressVal} />
            <ProgressRing value={94}>
              <span class="pg2-ring-inner">94%</span>
            </ProgressRing>
          </div>
        </div>

        <div class="pg2-row-wrap">
          <Button variant="secondary" size="sm" onclick={() => progressVal = Math.max(0, progressVal - 15)}>-15%</Button>
          <Button variant="secondary" size="sm" onclick={() => progressVal = Math.min(100, progressVal + 15)}>+15%</Button>
          <Badge variant="brand">Active</Badge>
          <Badge variant="success">Verified</Badge>
          <Badge variant="warning">Review</Badge>
          <Badge variant="danger">Locked</Badge>
          <Badge variant="neutral">v2.4.0</Badge>
        </div>

        <div class="pg2-tags-cloud">
          {#each tagList as tag}
            <Tag variant="neutral" withRemove onremove={() => removeTag(tag)}>{tag}</Tag>
          {/each}
          <Button variant="ghost" size="sm" onclick={addSampleTag}>+ Tag</Button>
        </div>

        <Callout variant="brand" title="Deterministic Synthesis Active">
          All 38 components are generated via pure AST scripts. Component styles inherit directly from semantic Sass variables.
        </Callout>
      </div>
    </section>

    <!-- SECTION 5: STRUCTURAL CARDS & ELEVATION -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">05</div>
        <div>
          <h2 class="pg2-sec-title">Structural Cards & Elevation</h2>
          <p class="pg2-sec-desc">Card with media, headers, footers & Divider</p>
        </div>
      </div>

      <div class="pg2-cards-layout">
        <Card appearance="outlined">
          {#snippet header()}
            <div class="pg2-card-hdr">
              <Avatar initials="AD" shape="rounded" size="sm" status="online" />
              <div>
                <strong class="pg2-card-title">Engine Instance 01</strong>
                <span class="pg2-card-sub">Cluster: us-east-brutalist</span>
              </div>
            </div>
          {/snippet}
          <p class="pg2-card-p">Running 12 synthetic agents in parallel with sub-millisecond AST parser dispatch.</p>
          {#snippet footer()}
            <div class="pg2-card-ftr">
              <Badge variant="success">Healthy</Badge>
              <CopyButton value="cluster-us-east-brutalist-01" label="Copy ID" />
            </div>
          {/snippet}
        </Card>

        <Card appearance="outlined">
          {#snippet header()}
            <div class="pg2-card-hdr">
              <Avatar initials="TK" shape="circle" size="sm" status="away" />
              <div>
                <strong class="pg2-card-title">Token Registry</strong>
                <span class="pg2-card-sub">102 Semantic Tokens</span>
              </div>
            </div>
          {/snippet}
          <p class="pg2-card-p">Zero hardcoded hex values or px dimensions > 2px in all component stylesheets.</p>
          {#snippet footer()}
            <div class="pg2-card-ftr">
              <Badge variant="brand">Strict</Badge>
              <Button variant="secondary" size="sm">Inspect</Button>
            </div>
          {/snippet}
        </Card>
      </div>
    </section>

    <!-- SECTION 6: NAVIGATION, TABS & TREE -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">06</div>
        <div>
          <h2 class="pg2-sec-title">Hierarchy & Navigation</h2>
          <p class="pg2-sec-desc">TabGroup, TabPanel, Tree with TreeItem hierarchy</p>
        </div>
      </div>

      <div class="pg2-stack">
        <TabGroup bind:active={activeTab}>
          <Tab value="tab-system">System State</Tab>
          <Tab value="tab-files">Tree Inspector</Tab>
          <Tab value="tab-matrix">Tokens Matrix</Tab>

          <TabPanel value="tab-system">
            <div class="pg2-tab-box">
              <p>Active Preset: <strong>Neo-Brutalist</strong></p>
              <p>All component markup utilizes <code>data-slot</code> selectors and pure single-tab indented Sass.</p>
              <div class="pg2-row-wrap" style="margin-top: var(--space-3);">
                <Badge variant="brand">Svelte 5</Badge>
                <Badge variant="success">32 Components</Badge>
                <Badge variant="neutral">0 Warnings</Badge>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="tab-files">
            <div class="pg2-tree-container">
              <Tree>
                <TreeItem value="src-lib" label="src/lib" expanded>
                  <TreeItem value="comp-gen" label="components/generated" expanded>
                    <TreeItem value="comp-btn" label="Button.svelte" />
                    <TreeItem value="comp-btngrp" label="ButtonGroup.svelte" />
                    <TreeItem value="comp-input" label="Input.svelte" />
                    <TreeItem value="comp-select" label="Select.svelte" />
                    <TreeItem value="comp-pbar" label="ProgressBar.svelte" />
                    <TreeItem value="comp-pring" label="ProgressRing.svelte" />
                    <TreeItem value="comp-toast" label="Toast.svelte" />
                  </TreeItem>
                  <TreeItem value="styles" label="styles" expanded>
                    <TreeItem value="style-tokens" label="tokens/_05_neobrutalist.sass" />
                    <TreeItem value="style-comps" label="components/*.sass" />
                  </TreeItem>
                </TreeItem>
              </Tree>
            </div>
          </TabPanel>

          <TabPanel value="tab-matrix">
            <div class="pg2-tab-box">
              <p>Token Parity Scale: 102 tokens mapped 1:1 across Light and Dark mode.</p>
              <div class="pg2-row-wrap" style="margin-top: var(--space-2);">
                <Tag variant="neutral">--bg</Tag>
                <Tag variant="neutral">--stroke-base</Tag>
                <Tag variant="neutral">--color-primary</Tag>
                <Tag variant="neutral">--shadow-md</Tag>
              </div>
            </div>
          </TabPanel>
        </TabGroup>
      </div>
    </section>

    <!-- SECTION 7: OVERLAYS, POPOVER & FLOATING CONTEXT -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">07</div>
        <div>
          <h2 class="pg2-sec-title">Overlays & Floating Context</h2>
          <p class="pg2-sec-desc">Popover, Tooltip, Popup, Dialog & Drawer</p>
        </div>
      </div>

      <div class="pg2-row-wrap">
        <Popover>
          {#snippet trigger()}
            <Button variant="secondary">Hover / Click Popover</Button>
          {/snippet}
          <div class="pg2-popover-content">
            <h4 class="pg2-pop-hdr">Brutalist Popover</h4>
            <p class="pg2-pop-p">Floating popover with 4px hard shadow and bold border.</p>
            <Button variant="primary" size="sm">Acknowledge</Button>
          </div>
        </Popover>

        <Tooltip content="Instant helper tooltip anchor" placement="top">
          <Button variant="ghost">Hover for Tooltip</Button>
        </Tooltip>

        <Popup>
          {#snippet trigger()}
            <Button variant="secondary">Interactive Popup</Button>
          {/snippet}
          <div class="pg2-popup-card">
            <strong>Popup Dialog Card</strong>
            <p>Floating contextual popover surface.</p>
          </div>
        </Popup>

        <Button variant="primary" onclick={() => isDialogOpen = true}>Launch Dialog Modal</Button>
        <Button variant="secondary" onclick={() => isDrawerOpen = true}>Slide Drawer</Button>
      </div>
    </section>

    <!-- SECTION 8: DISCLOSURE & DETAILS -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">08</div>
        <div>
          <h2 class="pg2-sec-title">Disclosure & Expansion</h2>
          <p class="pg2-sec-desc">Accordion (AccordionItem) and Details element</p>
        </div>
      </div>

      <div class="pg2-stack">
        <Accordion mode="multiple" appearance="outlined">
          <AccordionItem value="acc-1" title="Why zero in-component style blocks?" open>
            <p>By extracting all styling into external single-tab indented Sass files governed by semantic tokens, components remain completely decoupled from design decisions. Changing themes requires zero changes to component templates.</p>
          </AccordionItem>
          <AccordionItem value="acc-2" title="How does the AST synthesizer work?">
            <p>A deterministic Node compiler inspects headless component anatomies, reads the design tokens schema, and emits both pure Svelte 5 runes markup and matching Sass rules.</p>
          </AccordionItem>
        </Accordion>

        <Details summary="Advanced Architecture Specs" open>
          <p>The system enforces a 102-token semantic parity scale. Every component uses <code>--bg</code> surfaces, <code>--stroke-*</code> borders, and <code>--shadow-*</code> elevations without ever referencing hardcoded colors or raw pixel margins.</p>
        </Details>
      </div>
    </section>

    <!-- SECTION 9: IDENTITY & CLIPBOARD UTILITIES -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">09</div>
        <div>
          <h2 class="pg2-sec-title">Identity & Copy Utilities</h2>
          <p class="pg2-sec-desc">Avatar variations (initials, status) and CopyButton</p>
        </div>
      </div>

      <div class="pg2-row-wrap" style="align-items: center;">
        <Avatar initials="FM" shape="circle" size="lg" status="online" />
        <Avatar initials="NB" shape="square" size="md" status="busy" />
        <Avatar initials="AG" shape="rounded" size="sm" status="away" />
        <Avatar initials="DEV" shape="circle" size="md" status="offline" />

        <div class="pg2-copy-block">
          <code>pnpm install @affedo/cui-components</code>
          <CopyButton value="pnpm install @affedo/cui-components" label="Copy Command" />
        </div>
      </div>
    </section>

    <!-- SECTION 10: DYNAMIC TOASTS -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">10</div>
        <div>
          <h2 class="pg2-sec-title">Toast Notification Viewport</h2>
          <p class="pg2-sec-desc">Trigger dynamic notifications to bottom-right viewport</p>
        </div>
      </div>

      <div class="pg2-row-wrap">
        <Button variant="primary" onclick={() => pushToast('brand', 'System Broadcast', 'Autonomous agent harness connected.')}>Spawn Brand Toast</Button>
        <Button variant="secondary" onclick={() => pushToast('success', 'Build Complete', 'SvelteKit SSG built in 1.84s.')}>Spawn Success Toast</Button>
        <Button variant="secondary" onclick={() => pushToast('warning', 'Memory Spike', 'Heap pressure reached 62% threshold.')}>Spawn Warning Toast</Button>
        <Button variant="danger" onclick={() => pushToast('danger', 'Socket Timeout', 'Connection to edge cluster reset.')}>Spawn Danger Toast</Button>
      </div>
    </section>

    <!-- SECTION 11: WAVE 4 — COMPLEX LAYOUT -->
    <section class="pg2-card-section">
      <div class="pg2-section-header">
        <div class="pg2-sec-num">11</div>
        <div>
          <h2 class="pg2-sec-title">Complex Layout & Precision Controls</h2>
          <p class="pg2-sec-desc">NumberInput, Pagination, Carousel, SplitPanel, Scroller and Comparison under the active theme</p>
        </div>
      </div>

      <div class="pg2-row-wrap" style="align-items: flex-start;">
        <div class="pg2-wave4-col">
          <NumberInput bind:value={pg2NumValue} min={0} max={100} label="Budget" hint="0 – 100" />
          <Pagination bind:page={pg2Page} totalPages={9} showEdges />
          <div class="pg2-status-pill">Page {pg2Page} / 9</div>
        </div>

        <div class="pg2-wave4-col">
          <Carousel
            bind:index={pg2CarouselIndex}
            items={pg2CarouselSlides}
            loop
          >
            {#snippet slide({ item, position })}
              <div class="pg2-carousel-meta">
                <strong>{item.title}</strong>
                <span>{position + 1} / {pg2CarouselSlides.length}</span>
              </div>
            {/snippet}
          </Carousel>
          <div class="pg2-status-pill">Slide {pg2CarouselIndex + 1}</div>
        </div>
      </div>

      <SplitPanel bind:split={pg2Split} min={15} max={85}>
        {#snippet start()}
          <div class="pg2-pane-fill">
            <strong>Inspector</strong>
            <span>{Math.round(pg2Split)}%</span>
          </div>
        {/snippet}
        {#snippet end()}
          <div class="pg2-pane-fill">
            <strong>Canvas</strong>
            <span>Drag the divider</span>
          </div>
        {/snippet}
      </SplitPanel>

      <Scroller direction="vertical" fade snap="mandatory" maxHeight="10rem">
        {#each Array.from({ length: 12 }, (_, i) => i + 1) as n}
          <span class="pg2-scroll-chip">Sector {n}</span>
        {/each}
      </Scroller>

      <Comparison bind:position={pg2Compare} beforeLabel="Raw" afterLabel="Styled">
        {#snippet before()}
          <div class="pg2-pane-fill">
            <strong>Raw</strong>
            <span>Untokenized markup</span>
          </div>
        {/snippet}
        <div class="pg2-pane-fill">
          <strong>Styled</strong>
          <span>Semantic tokens end-to-end</span>
        </div>
      </Comparison>

      <div class="pg2-status-pill">Reveal {Math.round(pg2Compare)}%</div>
    </section>
  </main>

  <!-- Modals & Drawers -->
  <Dialog bind:open={isDialogOpen} title="Deploy Configuration">
    <div class="pg2-dialog-body">
      <p>Confirm automated promotion to production edge nodes under the active Neo-Brutalist theme.</p>
      <div class="pg2-dialog-details">
        <Badge variant="success">Status: Ready</Badge>
        <span>Build Hash: <code>#a8f90c4</code></span>
      </div>
    </div>
    {#snippet footer()}
      <div class="pg2-row-wrap" style="justify-content: flex-end;">
        <Button variant="ghost" onclick={() => isDialogOpen = false}>Cancel</Button>
        <Button variant="primary" onclick={() => { isDialogOpen = false; pushToast('success', 'Deployed', 'Cluster updated successfully.'); }}>Deploy Now</Button>
      </div>
    {/snippet}
  </Dialog>

  <Drawer bind:open={isDrawerOpen} placement="right" title="Settings & Environment">
    <div class="pg2-drawer-body">
      <h4>Active Configuration</h4>
      <div class="pg2-stack" style="margin-top: var(--space-4);">
        <Switch bind:checked={switchState1} label="Real-time Telemetry" />
        <Switch bind:checked={switchState2} label="Strict Linting" />
        <Input label="Worker Threads" value="8" />
        <Button variant="primary" onclick={() => isDrawerOpen = false}>Apply & Close</Button>
      </div>
    </div>
  </Drawer>

  <!-- Fixed Bottom-Right Toast Viewport -->
  {#if toasts.length > 0}
    <Toast>
      {#each toasts as t (t.id)}
        <ToastItem
          variant={t.variant}
          title={t.title}
          onclose={() => toasts = toasts.filter(item => item.id !== t.id)}
        >
          {t.message}
        </ToastItem>
      {/each}
    </Toast>
  {/if}
</div>

<style>
  .pg2-wrapper {
    min-height: 100vh;
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-sans);
    padding: var(--space-6) var(--space-8);
    transition: background-color var(--duration-normal) var(--ease-out), color var(--duration-normal) var(--ease-out);
  }

  .pg2-header {
    max-width: 1400px;
    margin: 0 auto var(--space-8) auto;
  }

  .pg2-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: 2px solid var(--stroke-base);
  }

  .pg2-hero {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .pg2-hero-badge-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .pg2-status-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: var(--space-1) var(--space-3);
    background-color: var(--color-primary);
    color: var(--color-primary-fg);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    text-transform: uppercase;
    transition: border-radius var(--duration-fast) var(--ease-out);
  }

  .pg2-status-pill.alt {
    background-color: var(--bg-weaker);
    color: var(--text-primary);
  }

  .pg2-status-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background-color: #22c55e;
    box-shadow: 0 0 6px #22c55e;
  }

  .pg2-hero-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--text-primary);
  }

  .pg2-hero-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    max-width: 850px;
    line-height: 1.6;
    margin: 0;
  }

  .pg2-modifier-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-4);
    padding: var(--space-4);
    background-color: var(--bg-weaker);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: border-radius var(--duration-fast) var(--ease-out), padding var(--duration-fast) var(--ease-out), gap var(--duration-fast) var(--ease-out);
  }

  .pg2-mod-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .pg2-mod-label {
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .pg2-grid {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: var(--space-6);
  }

  .pg2-card-section {
    background-color: var(--bg);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    transition: border-radius var(--duration-fast) var(--ease-out), padding var(--duration-fast) var(--ease-out), gap var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
  }

  .pg2-card-section:hover {
    box-shadow: var(--shadow-lg);
  }

  .pg2-section-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: 2px solid var(--stroke-weakest);
  }

  .pg2-sec-num {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 900;
    color: var(--color-primary);
    background-color: var(--bg-weaker);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    line-height: 1;
    transition: border-radius var(--duration-fast) var(--ease-out);
  }

  .pg2-sec-title {
    font-size: var(--text-lg);
    font-weight: 800;
    margin: 0 0 var(--space-1) 0;
    color: var(--text-primary);
  }

  .pg2-sec-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
  }

  .pg2-row-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .pg2-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .pg2-split-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .pg2-slider-box {
    padding: var(--space-3);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    transition: border-radius var(--duration-fast) var(--ease-out), padding var(--duration-fast) var(--ease-out);
  }

  .pg2-slider-header {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    font-weight: 600;
    margin-bottom: var(--space-2);
  }

  .pg2-row-space {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .pg2-label-micro {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--text-secondary);
    display: block;
    margin-bottom: var(--space-1);
  }

  .pg2-ring-pair {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .pg2-ring-inner {
    font-size: var(--text-xs);
    font-weight: 800;
    font-family: var(--font-mono);
  }

  .pg2-tags-cloud {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .pg2-cards-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .pg2-card-hdr {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .pg2-card-title {
    display: block;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
  }

  .pg2-card-sub {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .pg2-card-p {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .pg2-card-ftr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .pg2-tab-box {
    padding: var(--space-4);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    transition: border-radius var(--duration-fast) var(--ease-out), padding var(--duration-fast) var(--ease-out);
  }

  .pg2-tree-container {
    padding: var(--space-3);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    transition: border-radius var(--duration-fast) var(--ease-out), padding var(--duration-fast) var(--ease-out);
  }

  .pg2-popover-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .pg2-pop-hdr {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .pg2-pop-p {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .pg2-popup-card {
    padding: var(--space-3);
    background-color: var(--bg);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    font-size: var(--text-xs);
    transition: border-radius var(--duration-fast) var(--ease-out);
  }

  .pg2-copy-block {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background-color: var(--bg-weaker);
    border: 2px solid var(--stroke-base);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    transition: border-radius var(--duration-fast) var(--ease-out);
  }

  .pg2-dialog-body, .pg2-drawer-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    font-size: var(--text-sm);
  }

  .pg2-dialog-details {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    transition: border-radius var(--duration-fast) var(--ease-out);
  }

  /* Wave 4 specimens */
  .pg2-wave4-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1 1 16rem;
    min-width: 0;
  }

  .pg2-carousel-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .pg2-carousel-meta strong {
    font-size: var(--text-base);
    color: var(--text-primary);
  }

  .pg2-carousel-meta span {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  .pg2-pane-fill {
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .pg2-pane-fill strong {
    color: var(--text-primary);
  }

  .pg2-scroll-chip {
    flex-shrink: 0;
    display: block;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-sm);
    background-color: var(--bg-weakest);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    white-space: nowrap;
  }
</style>
