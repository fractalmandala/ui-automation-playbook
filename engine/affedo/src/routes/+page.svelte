<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { getDefaultProps, WA_CATEGORIES } from '$lib/data/playgroundDefaults';
	import {
		Accordion,
		AccordionItem,
		Button,
		Carousel,
		CarouselItem,
		Checkbox,
		CheckboxGroup,
		Comparison,
		CopyButton,
		Details,
		Dialog,
		Divider,
		Drawer,
		Dropdown,
		DropdownItem,
		Include,
		Input,
		Option,
		Popover,
		Popup,
		Scroller,
		Select,
		SplitPanel,
		Tab,
		TabGroup,
		TabPanel,
		Toast,
		ToastItem,
		Tooltip,
		Tree,
		TreeItem
	} from '$lib/wa';

	// Dynamically discover all Web Awesome Svelte components via Vite glob
	const modules = import.meta.glob('/src/lib/wa/*/*.svelte');

	type ComponentEntry = {
		name: string;
		dir: string;
		path: string;
		category: string;
		loader: () => Promise<any>;
	};

	const allComponents: ComponentEntry[] = Object.entries(modules)
		.map(([path, loader]) => {
			const parts = path.split('/');
			const name = parts.pop()?.replace('.svelte', '') ?? '';
			const dir = parts.pop() ?? '';
			return {
				name,
				dir,
				path,
				category: WA_CATEGORIES[name] ?? 'General',
				loader
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	// Unique categories
	const categories = ['All', ...Array.from(new Set(allComponents.map((c) => c.category))).sort()];

	// State
	let searchQuery = $state('');
	let selectedCategory = $state('All');
	let activeName = $state<string | null>(null);
	let activePath = $state<string | null>(null);
	let activeDir = $state<string | null>(null);
	let ActiveComponent = $state<any>(null);
	let isLoading = $state(false);
	let loadError = $state<string | null>(null);
	let renderKey = $state(0);
	let copied = $state(false);

	// Interactive states for overlays & compound components
	let dialogOpen = $state(false);
	let drawerOpen = $state(false);
	let popoverOpen = $state(true);
	let tooltipOpen = $state(true);
	let comparisonPos = $state(50);
	let splitPos = $state(45);
	let selectValue = $state('svelte');
	let selectMultiple = $state(['svelte', 'kit']);
	let toastTriggerCount = $state(0);
	let activeToastList = $state<
		{ id: number; variant: 'brand' | 'success' | 'warning' | 'danger' | 'neutral'; text: string }[]
	>([
		{ id: 1, variant: 'brand', text: 'Web Awesome runtime ready.' },
		{ id: 2, variant: 'success', text: 'Theme tokens cascading cleanly.' }
	]);

	function triggerSampleToast() {
		toastTriggerCount++;
		activeToastList = [
			...activeToastList,
			{
				id: Date.now(),
				variant: (['brand', 'success', 'warning', 'neutral'] as const)[toastTriggerCount % 4],
				text: `Live notification triggered (#${toastTriggerCount}).`
			}
		];
	}

	// Viewport & Stage
	let viewportWidth = $state<'100%' | '768px' | '375px'>('100%');
	let showGrid = $state(false);

	// Filtered list
	const filteredComponents = $derived(
		allComponents.filter((comp) => {
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery = !query || comp.name.toLowerCase().includes(query);
			if (!matchesQuery) return false;

			if (selectedCategory !== 'All' && comp.category !== selectedCategory) {
				return false;
			}
			return true;
		})
	);

	const activeProps = $derived(activeName ? getDefaultProps(activeName) : {});

	async function selectComponent(
		name: string,
		dir: string,
		path: string,
		loader: () => Promise<any>,
		updateUrl = true
	) {
		activeName = name;
		activeDir = dir;
		activePath = path;
		isLoading = true;
		loadError = null;
		ActiveComponent = null;

		if (updateUrl) {
			const url = new URL(page.url);
			url.searchParams.set('c', name);
			goto(url.toString(), { keepFocus: true, replaceState: true, noScroll: true });
		}

		try {
			const mod = await loader();
			ActiveComponent = mod.default;
			renderKey++;
		} catch (err: any) {
			loadError = err?.message || `Failed to load component: ${name}`;
		} finally {
			isLoading = false;
		}
	}

	function reloadCurrent() {
		if (!activeName) return;
		const target = allComponents.find((c) => c.name === activeName);
		if (target) {
			selectComponent(target.name, target.dir, target.path, target.loader, false);
		}
	}

	async function copyImport() {
		if (!activeName) return;
		const statement = `import { ${activeName} } from '$lib/wa';`;
		await navigator.clipboard.writeText(statement);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	onMount(() => {
		const param = page.url.searchParams.get('c');
		const match = param
			? allComponents.find((c) => c.name.toLowerCase() === param.toLowerCase())
			: allComponents.find((c) => c.name === 'Button') || allComponents[0];

		if (match) {
			selectComponent(match.name, match.dir, match.path, match.loader, false);
		}
	});
</script>

<svelte:head>
	<title>{activeName ? `${activeName} · Web Awesome Playground` : 'Web Awesome Playground'}</title>
</svelte:head>

<div class="playground-wrapper">
	<!-- Left Sidebar -->
	<aside class="sidebar-left border-right playground-sidebar">
		<div class="sidebar-header border-bottom pad-3">
			<div class="row justify-between ycenter mb-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-muted">WA Components</span>
				<span class="count-badge">{filteredComponents.length} / {allComponents.length}</span>
			</div>
			<div class="search-box">
				<input
					type="search"
					placeholder="Search components..."
					class="playground-search"
					bind:value={searchQuery}
				/>
			</div>

			<!-- Category Select -->
			<div class="category-select-wrapper mt-2">
				<select class="category-select" bind:value={selectedCategory}>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="sidebar-scrollable">
			{#if filteredComponents.length === 0}
				<div class="empty-notice text-center pad-6 text-muted text-xs">
					No components matching "{searchQuery}"
				</div>
			{:else}
				<ul class="component-nav-list">
					{#each filteredComponents as comp (comp.path)}
						<li>
							<button
								type="button"
								class="component-nav-btn {activeName === comp.name ? 'active' : ''}"
								onclick={() => selectComponent(comp.name, comp.dir, comp.path, comp.loader)}
							>
								<span class="component-name">{comp.name}</span>
								<span class="category-tag">{comp.category}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>

	<!-- Main Preview Area -->
	<main class="main-section playground-main">
		{#if !activeName}
			<div class="stage-placeholder text-muted">
				<p>Select a Web Awesome component from the sidebar to inspect and preview it.</p>
			</div>
		{:else}
			<!-- Stage Header Toolbar -->
			<div class="playground-stage-toolbar border-bottom pad-3 row justify-between ycenter wrap gap-2">
				<div class="row ycenter gap-2">
					<h1 class="text-base font-bold m-0">{activeName}</h1>
					<span class="file-path-tag text-xs text-muted">
						{activePath?.replace('/src/lib/wa/', '')}
					</span>
				</div>

				<div class="row ycenter gap-2">
					<!-- Viewport Selector -->
					<div class="btn-group row gap-1">
						<button
							type="button"
							class="tool-btn {viewportWidth === '100%' ? 'active' : ''}"
							title="Full Viewport (100%)"
							onclick={() => (viewportWidth = '100%')}
						>
							Full
						</button>
						<button
							type="button"
							class="tool-btn {viewportWidth === '768px' ? 'active' : ''}"
							title="Tablet Viewport (768px)"
							onclick={() => (viewportWidth = '768px')}
						>
							768px
						</button>
						<button
							type="button"
							class="tool-btn {viewportWidth === '375px' ? 'active' : ''}"
							title="Mobile Viewport (375px)"
							onclick={() => (viewportWidth = '375px')}
						>
							375px
						</button>
					</div>

					<div class="divider-v"></div>

					<!-- Grid Toggle -->
					<button
						type="button"
						class="tool-btn {showGrid ? 'active' : ''}"
						title="Toggle coordinate grid"
						onclick={() => (showGrid = !showGrid)}
					>
						Grid
					</button>

					<!-- Generator Test Lab -->
					<a
						href="/generator"
						class="tool-btn"
						style="text-decoration: none; color: var(--color-primary); font-weight: 600"
						title="Open Generated Components Test Lab"
					>
						⚡ Test Lab
					</a>

					<!-- Mode Toggle (Sun/Moon) -->
					<ModeToggle />

					<!-- Copy Import -->
					<button
						type="button"
						class="tool-btn"
						title="Copy import statement"
						onclick={copyImport}
					>
						{copied ? '✓ Copied' : 'Import'}
					</button>

					<!-- Reload / Remount -->
					<button
						type="button"
						class="tool-btn"
						title="Reload component"
						onclick={reloadCurrent}
					>
						↻
					</button>
				</div>
			</div>

			<!-- Component Canvas Stage -->
			<div class="stage-viewport-container pad-4">
				<div
					class="stage-frame {showGrid ? 'with-grid' : ''}"
					style="width: {viewportWidth};"
				>
					{#if isLoading}
						<div class="stage-status text-muted pad-8 text-center">
							<span>Loading module for {activeName}...</span>
						</div>
					{:else if loadError}
						<div class="stage-error pad-4 border m-4">
							<div class="row ycenter gap-2 text-danger font-semibold mb-2">
								<span>⚠ Module Resolution Error</span>
							</div>
							<pre class="error-pre text-xs">{loadError}</pre>
							<button class="tool-btn mt-3" onclick={reloadCurrent}>Retry Loading</button>
						</div>
					{:else if ActiveComponent}
						{#key renderKey}
							<div class="component-mount-boundary pad-8">
								<svelte:boundary>
									<div class="stage-content-wrapper">
										{#if activeName === 'Accordion'}
											<Accordion mode="multiple" appearance="outlined">
												<AccordionItem text="What is Web Awesome?" expanded>
													Web Awesome is a comprehensive UI component suite built with modern web standards, design tokens, and cascade layers.
												</AccordionItem>
												<AccordionItem text="Svelte 5 Runes & Snippets">
													Every component is engineered using modern runes ($state, $derived, $effect) and typed snippets for maximum reactivity performance.
												</AccordionItem>
												<AccordionItem text="Design Token System">
													Theme tokens cascade cleanly via CSS variables with light and dark mode view transitions.
												</AccordionItem>
											</Accordion>
										{:else if activeName === 'AccordionItem'}
											<AccordionItem text="Standalone Accordion Item" expanded>
												This accordion item works standalone outside a parent accordion group, governing its own expanded state.
											</AccordionItem>
										{:else if activeName === 'Carousel'}
											<Carousel pagination navigation loop mouseDragging slidesPerPage={1}>
												<CarouselItem>
													<div class="carousel-slide-card slide-bg-1">
														<span class="slide-num">01</span>
														<div class="slide-text">
															<h4>First Showcase Slide</h4>
															<p>Swipe or use the navigation controls to advance slides.</p>
														</div>
													</div>
												</CarouselItem>
												<CarouselItem>
													<div class="carousel-slide-card slide-bg-2">
														<span class="slide-num">02</span>
														<div class="slide-text">
															<h4>Second Showcase Slide</h4>
															<p>Supports touch dragging, keyboard focus, and autoplay cadence.</p>
														</div>
													</div>
												</CarouselItem>
												<CarouselItem>
													<div class="carousel-slide-card slide-bg-3">
														<span class="slide-num">03</span>
														<div class="slide-text">
															<h4>Third Showcase Slide</h4>
															<p>Infinite loop navigation with CSS scroll snap physics.</p>
														</div>
													</div>
												</CarouselItem>
											</Carousel>
										{:else if activeName === 'CarouselItem'}
											<div class="carousel-slide-card slide-bg-1">
												<span class="slide-num">01</span>
												<div class="slide-text">
													<h4>Standalone Slide Item</h4>
													<p>CarouselItem encapsulates slide layout and item registration.</p>
												</div>
											</div>
										{:else if activeName === 'CheckboxGroup'}
											<CheckboxGroup label="Notification Preferences" hint="Choose the channels where you wish to receive updates">
												<Checkbox label="Product announcements and releases" checked />
												<Checkbox label="Security advisories and maintenance" checked />
												<Checkbox label="Weekly developer digest" />
												<Checkbox label="Marketing communications" disabled />
											</CheckboxGroup>
										{:else if activeName === 'Comparison'}
											<div class="stage-flow-column gap-2">
												<div class="comparison-container">
													<Comparison bind:position={comparisonPos}>
														{#snippet before()}
															<div class="comparison-panel before-panel">
																<span class="comparison-label">BEFORE</span>
																<div class="panel-inner">Raw Wireframe</div>
															</div>
														{/snippet}
														{#snippet after()}
															<div class="comparison-panel after-panel">
																<span class="comparison-label">AFTER</span>
																<div class="panel-inner">Web Awesome Render</div>
															</div>
														{/snippet}
													</Comparison>
												</div>
												<span class="text-xs text-muted text-center">Drag the center slider handle left and right</span>
											</div>
										{:else if activeName === 'CopyButton'}
											<div class="stage-flow-column ycenter gap-2">
												<div class="copy-button-demo-box">
													<code class="copy-code-text">pnpm add @webawesome/svelte</code>
													<CopyButton value="pnpm add @webawesome/svelte" />
												</div>
												<span class="text-xs text-muted text-center">Click the button to test clipboard copying and feedback tooltip</span>
											</div>
										{:else if activeName === 'Details'}
											<div class="stage-flow-column gap-3">
												<Details summary="What are cascade layers in Web Awesome?" open appearance="outlined">
													<p class="details-body-p">Cascade layers (@layer wa-component) allow component styling to integrate cleanly without colliding with global resets or utility libraries. Theme tokens cascade cleanly down the DOM tree.</p>
												</Details>
												<Details summary="How does dark mode switching work?">
													<p class="details-body-p">The ModeToggle triggers document.startViewTransition() with a circular wipe across the screen while switching data-mode and wa-dark classes.</p>
												</Details>
											</div>
										{:else if activeName === 'Dialog'}
											<div class="stage-flow-column ycenter gap-3">
												<Button variant="brand" onclick={() => (dialogOpen = true)}>
													Open Dialog Window
												</Button>
												<span class="text-xs text-muted">Click to open the modal dialog with backdrop blur</span>

												<Dialog bind:open={dialogOpen} label="Workspace Configuration" lightDismiss>
													<p class="dialog-body-text">
														Manage active preferences for your Web Awesome playground environment. Changes take effect immediately across all sessions.
													</p>
													{#snippet footer()}
														<div class="row gap-2 justify-end">
															<Button variant="neutral" onclick={() => (dialogOpen = false)}>Cancel</Button>
															<Button variant="brand" onclick={() => (dialogOpen = false)}>Confirm</Button>
														</div>
													{/snippet}
												</Dialog>
											</div>
										{:else if activeName === 'Divider'}
											<div class="stage-flow-column" style="width: 100%;">
												<div class="divider-demo-content">
													<h4 class="m-0 text-sm font-semibold">User Interface Tier</h4>
													<p class="text-xs text-muted m-0">General configuration options and layout properties.</p>
												</div>
												<Divider />
												<div class="divider-demo-content">
													<h4 class="m-0 text-sm font-semibold">Advanced API Controls</h4>
													<p class="text-xs text-muted m-0">Fine-grained token overrides and runtime bindings.</p>
												</div>
											</div>
										{:else if activeName === 'Drawer'}
											<div class="stage-flow-column ycenter gap-3">
												<Button variant="brand" onclick={() => (drawerOpen = true)}>
													Open Side Drawer
												</Button>
												<span class="text-xs text-muted">Click to open the slide-out navigation panel</span>

												<Drawer bind:open={drawerOpen} label="Quick Navigation" placement="end">
													<div class="drawer-inner-content">
														<p class="text-sm">Explore component categories:</p>
														<ul class="drawer-nav-list">
															<li><button type="button" class="drawer-link" onclick={() => { drawerOpen = false; }}>Actions (Buttons & Controls)</button></li>
															<li><button type="button" class="drawer-link" onclick={() => { drawerOpen = false; }}>Forms & Inputs</button></li>
															<li><button type="button" class="drawer-link" onclick={() => { drawerOpen = false; }}>Overlays & Floating UI</button></li>
														</ul>
													</div>
												</Drawer>
											</div>
										{:else if activeName === 'Dropdown'}
											<div class="stage-flow-column ycenter">
												<Dropdown>
													{#snippet trigger()}
														<Button variant="brand">
															Component Actions ▾
														</Button>
													{/snippet}
													<DropdownItem value="inspect">Inspect Tokens</DropdownItem>
													<DropdownItem value="duplicate">Duplicate Specimen</DropdownItem>
													<DropdownItem value="export">Export Svelte Code</DropdownItem>
													<DropdownItem value="delete" disabled>Delete (Disabled)</DropdownItem>
												</Dropdown>
												<span class="text-xs text-muted mt-3">Click trigger button to open the floating menu</span>
											</div>
										{:else if activeName === 'Include'}
											<div class="stage-flow-column">
												<Include src="data:text/html,<div style='padding: 16px; border: 1px dashed var(--border); border-radius: 8px; font-family: monospace; font-size: 13px; color: var(--text-primary);'><strong style='color: var(--theme-color);'>wa-include active:</strong> Remote HTML snippet asynchronously fetched and injected into DOM.</div>" />
											</div>
										{:else if activeName === 'Input'}
											<div class="stage-flow-column gap-3">
												<Input
													label="Developer Handle"
													placeholder="e.g. amrit"
													hint="Your public namespace for mandala packages"
													value="amrit"
													withClear
												/>
												<Input
													label="Access Token"
													type="password"
													placeholder="••••••••••••••••"
													hint="Click eye icon to toggle visibility"
													value="wa_live_tok_991823"
													passwordToggle
												/>
											</div>
										{:else if activeName === 'Option'}
											<div class="stage-flow-column">
												<span class="text-xs text-muted mb-2 font-semibold uppercase">Option Items in Container</span>
												<div class="option-preview-box">
													<Option value="opt-1" selected>Active / Selected Option</Option>
													<Option value="opt-2">Standard Option Item</Option>
													<Option value="opt-3" disabled>Disabled Option Item</Option>
												</div>
											</div>
										{:else if activeName === 'Popover'}
											<div class="stage-flow-column ycenter">
												<div style="position: relative; display: inline-block;">
													<Button id="popover-demo-anchor" variant="brand">
														Popover Anchor
													</Button>
													<Popover for="popover-demo-anchor" placement="bottom" bind:open={popoverOpen}>
														<div class="popover-card">
															<h4 class="popover-card-title">Interactive Popover</h4>
															<p class="popover-card-desc">Floating UI card anchored dynamically with arrow affordance.</p>
															<Button size="s" variant="brand" onclick={() => (popoverOpen = false)}>Dismiss</Button>
														</div>
													</Popover>
												</div>
												<span class="text-xs text-muted mt-3">Click anchor to toggle popover card</span>
											</div>
										{:else if activeName === 'Popup'}
											<div class="stage-flow-column ycenter">
												<div style="position: relative; display: inline-block;">
													<Button id="popup-anchor-demo" variant="neutral">
														Floating Anchor Target
													</Button>
													<Popup anchor="popup-anchor-demo" placement="bottom" active arrow distance={8}>
														<div class="popup-specimen-card">
															<span>Anchored Popup Overlay</span>
														</div>
													</Popup>
												</div>
												<span class="text-xs text-muted mt-3">Popup positioning engine attached to anchor</span>
											</div>
										{:else if activeName === 'Scroller'}
											<div class="stage-flow-column">
												<span class="text-xs text-muted mb-2 font-semibold uppercase">Horizontal Card Scroller</span>
												<div class="scroller-boundary">
													<Scroller orientation="horizontal">
														<div class="scroller-strip">
															{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as n}
																<div class="scroller-card-item">
																	<span class="card-num">#{n}</span>
																	<span class="card-title">Card #{n}</span>
																</div>
															{/each}
														</div>
													</Scroller>
												</div>
												<span class="text-xs text-muted text-center mt-2">Scroll horizontally to observe edge fade shadows</span>
											</div>
										{:else if activeName === 'Select'}
											<div class="stage-flow-column gap-3">
												<Select label="Preferred UI Framework" placeholder="Choose a framework..." bind:value={selectValue}>
													<Option value="svelte">Svelte 5 (Runes)</Option>
													<Option value="kit">SvelteKit 2</Option>
													<Option value="vite">Vite 6</Option>
													<Option value="ts">TypeScript</Option>
												</Select>

												<Select label="Select Multiple Tags" placeholder="Pick tags..." multiple bind:value={selectMultiple}>
													<Option value="svelte">Svelte 5</Option>
													<Option value="kit">SvelteKit</Option>
													<Option value="vite">Vite</Option>
													<Option value="css">Indented Sass</Option>
												</Select>
											</div>
										{:else if activeName === 'SplitPanel'}
											<div class="stage-flow-column">
												<div class="split-panel-stage-box">
													<SplitPanel bind:position={splitPos}>
														{#snippet start()}
															<div class="split-side split-left">
																<h4 class="m-0 text-sm font-semibold">Source Editor</h4>
																<p class="text-xs text-muted mt-1">Left split panel container with fluid resizing</p>
															</div>
														{/snippet}
														{#snippet end()}
															<div class="split-side split-right">
																<h4 class="m-0 text-sm font-semibold">Live Specimen</h4>
																<p class="text-xs text-muted mt-1">Right split panel container</p>
															</div>
														{/snippet}
													</SplitPanel>
												</div>
												<span class="text-xs text-muted text-center mt-2">Drag the vertical divider bar left or right</span>
											</div>
										{:else if activeName === 'Tab'}
											<div class="stage-flow-column">
												<span class="text-xs text-muted mb-2 font-semibold uppercase">Tab Items</span>
												<div class="tab-leaf-container">
													<Tab panel="1" active>Active Tab</Tab>
													<Tab panel="2">Second Tab</Tab>
													<Tab panel="3" disabled>Disabled Tab</Tab>
												</div>
											</div>
										{:else if activeName === 'TabGroup'}
											<div class="stage-flow-column">
												<TabGroup placement="top" active="overview">
													{#snippet nav()}
														<Tab panel="overview">Overview</Tab>
														<Tab panel="components">Components</Tab>
														<Tab panel="tokens">Design Tokens</Tab>
													{/snippet}
													<TabPanel name="overview">
														<div class="tab-panel-content">
															<h4 class="m-0 text-sm font-semibold">Web Awesome Component Library</h4>
															<p class="text-xs text-muted mt-1">Full suite of accessible, themeable UI components ported natively to Svelte 5 runes.</p>
														</div>
													</TabPanel>
													<TabPanel name="components">
														<div class="tab-panel-content">
															<h4 class="m-0 text-sm font-semibold">58+ Native Svelte Components</h4>
															<p class="text-xs text-muted mt-1">Actions, forms, containers, navigation, overlays, data display, media, and layout utilities.</p>
														</div>
													</TabPanel>
													<TabPanel name="tokens">
														<div class="tab-panel-content">
															<h4 class="m-0 text-sm font-semibold">Semantic Token Cascade</h4>
															<p class="text-xs text-muted mt-1">Single source of truth for colors, elevations, borders, and typography scale.</p>
														</div>
													</TabPanel>
												</TabGroup>
											</div>
										{:else if activeName === 'Toast'}
											<div class="stage-flow-column gap-3">
												<div class="row justify-between ycenter">
													<span class="text-xs text-muted font-semibold uppercase">Toast Notifications (Bottom-Right)</span>
													<Button variant="brand" size="s" onclick={triggerSampleToast}>Trigger Toast</Button>
												</div>

												<div class="toast-preview-card border pad-4 rounded">
													<p class="text-xs text-muted m-0">
														The toast viewport is fixed at the <strong>bottom-right corner</strong> of your screen. Click the button above to trigger live toasts into the bottom-right notification stack.
													</p>
												</div>

												<!-- Also render active fixed bottom-right Toast container on screen -->
												<Toast placement="bottom-end">
													{#each activeToastList as t (t.id)}
														<ToastItem variant={t.variant} duration={6000} onclose={() => (activeToastList = activeToastList.filter(item => item.id !== t.id))}>
															<span>{t.text}</span>
														</ToastItem>
													{/each}
												</Toast>
											</div>
										{:else if activeName === 'ToastItem'}
											<div class="stage-flow-column gap-2">
												<ToastItem variant="brand" duration={0}>
													<span><strong>Standalone Toast:</strong> Web Awesome notification specimen.</span>
												</ToastItem>
											</div>
										{:else if activeName === 'Tooltip'}
											<div class="stage-flow-column ycenter gap-3">
												<div style="position: relative; display: inline-block;">
													<Button id="tooltip-stage-anchor" variant="brand">
														Hover or Focus Me
													</Button>
													<Tooltip for="tooltip-stage-anchor" placement="top" bind:open={tooltipOpen}>
														Web Awesome Tooltip Content
													</Tooltip>
												</div>
												<span class="text-xs text-muted">Hover or focus the button to reveal the tooltip</span>
											</div>
										{:else if activeName === 'Tree'}
											<div class="stage-flow-column">
												<span class="text-xs text-muted mb-2 font-semibold uppercase">Hierarchical File Tree</span>
												<div class="tree-preview-box">
													<Tree selection="single">
														<TreeItem text="src" expanded>
															<TreeItem text="lib" expanded>
																<TreeItem text="components" expanded>
																	<TreeItem text="Button.svelte" />
																	<TreeItem text="Dialog.svelte" />
																	<TreeItem text="Popover.svelte" />
																</TreeItem>
																<TreeItem text="styles" expanded>
																	<TreeItem text="index.sass" />
																	<TreeItem text="_tokens.sass" />
																</TreeItem>
															</TreeItem>
															<TreeItem text="routes" expanded>
																<TreeItem text="+layout.svelte" />
																<TreeItem text="+page.svelte" selected />
															</TreeItem>
														</TreeItem>
														<TreeItem text="package.json" />
														<TreeItem text="tsconfig.json" />
													</Tree>
												</div>
											</div>
										{:else if activeName === 'TreeItem'}
											<div class="stage-flow-column">
												<span class="text-xs text-muted mb-2 font-semibold uppercase">Standalone Tree Items</span>
												<div class="tree-preview-box">
													<TreeItem text="Root Folder Item" expanded>
														<TreeItem text="Child File 1" selected />
														<TreeItem text="Child File 2" />
														<TreeItem text="Disabled Node" disabled />
													</TreeItem>
												</div>
											</div>
										{:else}
											<!-- Default fallback for standard leaf components (Button, Badge, Avatar, Switch, Card, etc.) -->
											<ActiveComponent {...activeProps}>
												{#snippet children()}
													{#if activeName === 'Breadcrumb'}
														<a href="#home">Home</a>
														<a href="#components">Components</a>
														<span>Breadcrumb</span>
													{:else if activeName === 'RadioGroup'}
														<label style="display: flex; gap: 8px; align-items: center;"><input type="radio" name="rg" checked /> Professional Tier</label>
														<label style="display: flex; gap: 8px; align-items: center;"><input type="radio" name="rg" /> Enterprise Tier</label>
													{:else if activeName === 'ButtonGroup'}
														<Button variant="brand">First</Button>
														<Button variant="neutral">Second</Button>
														<Button variant="neutral">Third</Button>
													{:else}
														<span>{activeName} Content</span>
													{/if}
												{/snippet}
											</ActiveComponent>
										{/if}
									</div>
									{#snippet failed(error, reset)}
										{@const err = (error instanceof Error ? error : new Error(String(error)))}
										<div class="stage-error pad-4 border">
											<div class="text-danger font-semibold mb-1">Runtime Render Error</div>
											<pre class="error-pre text-xs">{err.message}</pre>
											{#if err.stack}
												<details class="mt-2">
													<summary class="text-xs text-muted cursor-pointer">View Call Stack</summary>
													<pre class="error-pre text-xs mt-1">{err.stack}</pre>
												</details>
											{/if}
											<button class="tool-btn mt-3" onclick={reset}>Reset Component</button>
										</div>
									{/snippet}
								</svelte:boundary>
							</div>
						{/key}
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	/* All backgrounds strictly use var(--bg) only */
	.playground-wrapper {
		display: flex;
		width: 100%;
		min-height: 100vh;
		background: var(--bg);
		color: var(--text-primary);
	}

	.playground-sidebar {
		width: 290px;
		min-width: 290px;
		max-width: 290px;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: sticky;
		top: 0;
		box-sizing: border-box;
		border-right: 1px solid var(--border);
	}

	.sidebar-header {
		background: var(--bg);
		flex-shrink: 0;
		padding: 12px;
		border-bottom: 1px solid var(--border);
	}

	.playground-search {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 6px 10px;
		font-size: 12px;
		color: var(--text-primary);
		outline: none;
		box-sizing: border-box;
	}

	.playground-search:focus {
		border-color: var(--theme-color);
	}

	.category-select-wrapper {
		width: 100%;
		margin-top: 8px;
	}

	.category-select {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 11px;
		color: var(--text-primary);
		outline: none;
		cursor: pointer;
	}

	.category-select:focus {
		border-color: var(--theme-color);
	}

	.count-badge {
		font-size: 10px;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 9999px;
		padding: 1px 7px;
	}

	.sidebar-scrollable {
		flex: 1;
		overflow-y: auto;
		background: var(--bg);
		padding: 6px;
	}

	.component-nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.component-nav-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 10px;
		background: var(--bg);
		border: 1px solid transparent;
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 12px;
		cursor: pointer;
		text-align: left;
		transition: all 0.1s ease;
	}

	.component-nav-btn:hover {
		color: var(--text-primary);
		border-color: var(--border);
	}

	.component-nav-btn.active {
		background: var(--bg);
		border-color: var(--theme-color);
		color: var(--theme-color);
		font-weight: 600;
	}

	.category-tag {
		font-size: 9px;
		text-transform: uppercase;
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 1px 5px;
		color: var(--text-muted);
	}

	.playground-main {
		flex: 1;
		min-width: 0;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.playground-stage-toolbar {
		background: var(--bg);
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border);
	}

	.file-path-tag {
		font-family: monospace;
		padding: 2px 6px;
		border: 1px solid var(--border);
		border-radius: 3px;
	}

	.tool-btn {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 11px;
		padding: 4px 8px;
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.tool-btn:hover {
		border-color: var(--text-primary);
		color: var(--text-primary);
	}

	.tool-btn.active {
		border-color: var(--theme-color);
		color: var(--theme-color);
		font-weight: 600;
	}

	.divider-v {
		width: 1px;
		height: 16px;
		background: var(--border);
	}

	.stage-viewport-container {
		flex: 1;
		background: var(--bg);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		overflow-y: auto;
		padding: 24px;
	}

	.stage-frame {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		min-height: 400px;
		transition: width 0.2s ease;
		box-sizing: border-box;
		position: relative;
	}

	.stage-frame.with-grid {
		background-color: var(--bg);
		background-image: radial-gradient(var(--border) 1px, transparent 1px);
		background-size: 16px 16px;
	}

	.component-mount-boundary {
		width: 100%;
		min-height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 32px;
	}

	.stage-error {
		background: var(--bg);
		border: 1px solid var(--danger, #ef4444);
		border-radius: 6px;
		padding: 16px;
		margin: 16px;
		color: var(--text-primary);
	}

	.error-pre {
		background: var(--bg);
		border: 1px solid var(--border);
		padding: 8px;
		border-radius: 4px;
		overflow-x: auto;
		color: var(--danger, #ef4444);
		font-family: monospace;
	}

	.stage-placeholder {
		margin: auto;
		padding: 48px;
		text-align: center;
	}

	.row {
		display: flex;
	}

	.ycenter {
		align-items: center;
	}

	.justify-between {
		justify-content: space-between;
	}

	.wrap {
		flex-wrap: wrap;
	}

	.gap-1 {
		gap: 4px;
	}

	.gap-2 {
		gap: 8px;
	}

	.mb-2 {
		margin-bottom: 8px;
	}

	.mt-2 {
		margin-top: 8px;
	}

	.mt-3 {
		margin-top: 12px;
	}

	.m-0 {
		margin: 0;
	}

	.text-xs {
		font-size: 11px;
	}

	.text-base {
		font-size: 14px;
	}

	.font-semibold {
		font-weight: 600;
	}

	.font-bold {
		font-weight: 700;
	}

	.uppercase {
		text-transform: uppercase;
	}

	.tracking-wider {
		letter-spacing: 0.05em;
	}

	.text-muted {
		color: var(--text-muted);
	}

	.text-danger {
		color: var(--danger, #ef4444);
	}

	/* Stage content wrapper & component fixtures */
	.stage-content-wrapper {
		width: 100%;
		max-width: 580px;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		box-sizing: border-box;
	}

	.stage-flow-column {
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
	}

	.carousel-slide-card {
		height: 220px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		padding: 24px;
		text-align: center;
		box-sizing: border-box;
		position: relative;
	}

	.slide-num {
		position: absolute;
		top: 12px;
		left: 14px;
		font-size: 11px;
		font-family: monospace;
		font-weight: 700;
		color: var(--theme-color);
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 2px 6px;
	}

	.slide-text h4 {
		margin: 0 0 6px 0;
		font-size: 16px;
		font-weight: 600;
	}

	.slide-text p {
		margin: 0;
		font-size: 12px;
		color: var(--text-muted);
	}

	.comparison-container {
		width: 100%;
		height: 240px;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--bg);
	}

	.comparison-panel {
		width: 100%;
		height: 240px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		font-weight: 600;
		background: var(--bg);
	}

	.before-panel {
		background: var(--bg);
		border-right: 1px dashed var(--border);
	}

	.after-panel {
		background: var(--bg);
	}

	.comparison-label {
		position: absolute;
		top: 10px;
		font-size: 10px;
		letter-spacing: 0.08em;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 3px;
		border: 1px solid var(--border);
		color: var(--text-muted);
	}

	.before-panel .comparison-label {
		left: 10px;
	}

	.after-panel .comparison-label {
		right: 10px;
		color: var(--theme-color);
		border-color: var(--theme-color);
	}

	.panel-inner {
		font-size: 14px;
	}

	.copy-button-demo-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 8px 14px;
		background: var(--bg);
		width: 100%;
		box-sizing: border-box;
	}

	.copy-code-text {
		font-family: monospace;
		font-size: 13px;
		color: var(--text-primary);
	}

	.details-body-p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.dialog-body-text {
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-secondary);
		margin: 8px 0 16px 0;
	}

	.divider-demo-content {
		padding: 4px 0;
	}

	.drawer-inner-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.drawer-nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.drawer-link {
		width: 100%;
		text-align: left;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 12px;
		color: var(--text-primary);
		cursor: pointer;
		transition: border-color 0.15s ease;
	}

	.drawer-link:hover {
		border-color: var(--theme-color);
		color: var(--theme-color);
	}

	.option-preview-box {
		width: 100%;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 6px;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-sizing: border-box;
	}

	.popover-card {
		padding: 8px;
		min-width: 240px;
		background: var(--bg);
	}

	.popover-card-title {
		margin: 0 0 6px 0;
		font-size: 14px;
		font-weight: 600;
	}

	.popover-card-desc {
		margin: 0 0 12px 0;
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.popup-specimen-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 10px 16px;
		font-size: 12px;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		color: var(--text-primary);
	}

	.scroller-boundary {
		width: 100%;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg);
	}

	.scroller-strip {
		display: flex;
		gap: 12px;
		width: max-content;
		padding: 16px;
	}

	.scroller-card-item {
		width: 110px;
		height: 80px;
		border: 1px solid var(--border);
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		background: var(--bg);
		flex-shrink: 0;
	}

	.card-num {
		font-size: 11px;
		font-family: monospace;
		font-weight: 700;
		color: var(--theme-color);
	}

	.card-title {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.split-panel-stage-box {
		width: 100%;
		height: 240px;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg);
	}

	.split-side {
		padding: 16px;
		height: 100%;
		box-sizing: border-box;
		background: var(--bg);
	}

	.tab-leaf-container {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid var(--border);
		padding-bottom: 4px;
		width: 100%;
	}

	.tab-panel-content {
		padding: 16px 4px;
	}
</style>