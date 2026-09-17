<script lang="ts" module>
	const CACHEABLE_ERROR = Symbol('cacheable-error');
	const RETRYABLE_ERROR = Symbol('retryable-error');

	type CachedValue = string | typeof CACHEABLE_ERROR | typeof RETRYABLE_ERROR;

	/** Shared fetch cache keyed by URL. Port of WA's module-level `iconCache`. */
	const iconCache = new Map<string, Promise<CachedValue>>();
</script>

<script lang="ts">
	import {
		getDefaultIconFamily,
		getIconLibrary,
		unwatchIcon,
		watchIcon
	} from './library.js';
	import './icon.css';

	export type IconAnimation =
		| 'beat'
		| 'fade'
		| 'beat-fade'
		| 'bounce'
		| 'flip'
		| 'flip-360'
		| 'shake'
		| 'spin'
		| 'spin-pulse'
		| 'spin-reverse'
		| 'spin-snap'
		| 'spin-snap-4'
		| 'spin-snap-8'
		| 'buzz'
		| 'wag'
		| 'float'
		| 'swing'
		| 'jello';

	export type IconCanvas = 'fixed' | 'auto' | 'square' | 'roomy';

	interface Props {
		/** The name of the icon to draw. Available names depend on the icon library being used. */
		name?: string;
		/**
		 * The family of icons to choose from. For Font Awesome Free, valid options include
		 * `classic` and `brands`. Falls back to the registered default family (`classic`).
		 */
		family?: string;
		/**
		 * The name of the icon's variant. For Font Awesome, valid options include `thin`,
		 * `light`, `regular`, and `solid`. Falls back to `solid` in the resolver.
		 */
		variant?: string;
		/**
		 * Sets the icon canvas — the box the icon is centered within. Unset renders as
		 * `fixed` (1.25em × 1em); `auto` hugs the icon's width; `square` is 1.25em × 1.25em;
		 * `roomy` is 1.5em × 1.5em.
		 */
		canvas?: IconCanvas;
		/**
		 * Sets the width of the icon to match the cropped SVG viewBox.
		 * @deprecated Use `canvas="auto"` instead.
		 */
		autoWidth?: boolean;
		/** Swaps the opacity of duotone icons. */
		swapOpacity?: boolean;
		/**
		 * An external URL of an SVG file. Be sure you trust the content you are including, as it
		 * will be executed as code and can result in XSS attacks.
		 */
		src?: string;
		/**
		 * An alternate description for assistive devices. When omitted the icon is
		 * presentational (`aria-hidden="true"`); when set the host gets
		 * `role="img"` + `aria-label`, exactly like WA's `handleLabelChange`.
		 */
		label?: string;
		/** The name of a registered custom icon library. */
		library?: string;
		/** Sets the rotation degree of the icon. */
		rotate?: number;
		/** Sets the flip direction along the `x`, `y`, or `both` axes. */
		flip?: 'x' | 'y' | 'both';
		/** Sets the animation for the icon. */
		animation?: IconAnimation;
		/** Emitted when the icon has loaded. Not emitted for `spriteSheet` libraries (per WA docs). */
		onload?: () => void;
		/** Emitted when the icon fails to load. Not emitted for `spriteSheet` libraries. */
		onerror?: () => void;
		/** Extra class merged onto the root (lets consumers set `font-size`, `color`, `--*` via a wrapper class). */
		class?: string;
		/** Extra inline style forwarded to the root (e.g. `style="font-size: 2em; --beat-scale: 1.5"`). */
		style?: string;
	}

	let {
		name,
		family,
		variant,
		canvas,
		autoWidth = false,
		swapOpacity = false,
		src,
		label = '',
		library = 'default',
		rotate = 0,
		flip,
		animation,
		onload,
		onerror,
		class: extraClass,
		style: extraStyle
	}: Props = $props();

	// Rendered content. `svgHtml` holds the fetched SVG's outerHTML (with
	// `part="svg"` already applied); `spriteHref` holds the `<use>` href for
	// `spriteSheet: true` libraries. Both null renders WA's SSR placeholder.
	let svgHtml = $state<string | null>(null);
	let spriteHref = $state<string | null>(null);
	// Bumped on every successful load so the `{#key}` block remounts. This is the
	// Svelte equivalent of WA's `cloneNode(true)` fresh copy: the duotone mutator
	// guards on `data-duotone-initialized`, so re-applying it to the same DOM node
	// after a `swapOpacity` / `family` change would be a no-op without a remount.
	let contentKey = $state(0);
	let svgContainer = $state<HTMLElement | undefined>(undefined);

	// Monotonic guard so a slow fetch that resolves after props changed cannot
	// overwrite the newer icon. Complements the URL comparison below (WA's
	// `sourceAfterFetch` check). Plain counter — nothing renders from it.
	let requestCounter = 0;

	const hasLabel = $derived(typeof label === 'string' && label.length > 0);

	async function getIconSource(): Promise<{ url?: string; fromLibrary: boolean }> {
		const lib = getIconLibrary(library);
		const effectiveFamily = family ?? getDefaultIconFamily();
		const effectiveVariant = variant ?? 'solid';

		if (name && lib) {
			// `canvas="auto"` is the modern equivalent of the deprecated `autoWidth`.
			const effectiveAutoWidth = canvas === 'auto' || autoWidth;
			try {
				const url = await lib.resolver(name, effectiveFamily, effectiveVariant, effectiveAutoWidth);
				return { url, fromLibrary: true };
			} catch {
				return { url: undefined, fromLibrary: true };
			}
		}
		return { url: src, fromLibrary: false };
	}

	/** Fetches `url` and returns its outerHTML (with `part="svg"`), or an error symbol. */
	async function resolveIconHtml(url: string): Promise<CachedValue> {
		let response: Response;
		try {
			response = await fetch(url, { mode: 'cors' });
			if (!response.ok) return response.status === 410 ? CACHEABLE_ERROR : RETRYABLE_ERROR;
		} catch {
			return RETRYABLE_ERROR;
		}
		try {
			const text = await response.text();
			const holder = document.createElement('div');
			holder.innerHTML = text;
			const svg = holder.firstElementChild;
			if (!svg || svg.tagName.toLowerCase() !== 'svg') return CACHEABLE_ERROR;
			// Port of `svgEl.part.add('svg')` — append without clobbering an existing part.
			const existing = svg.getAttribute('part');
			if (existing) {
				if (!existing.split(/\s+/).includes('svg')) svg.setAttribute('part', `${existing} svg`);
			} else {
				svg.setAttribute('part', 'svg');
			}
			return svg.outerHTML;
		} catch {
			return CACHEABLE_ERROR;
		}
	}

	// Port of WA's `@watch([...], { waitUntilFirstUpdate: true }) setIcon()`.
	async function setIcon(): Promise<void> {
		if (typeof document === 'undefined' || typeof fetch === 'undefined') return;
		const mine = ++requestCounter;
		const { url, fromLibrary } = await getIconSource();
		if (mine !== requestCounter) return;
		const lib = fromLibrary ? getIconLibrary(library) : undefined;

		if (!url) {
			svgHtml = null;
			spriteHref = null;
			return;
		}

		// Sprite-sheet libraries render `<svg><use href>` with no fetch and no
		// load/error events, per the WA docs on `wa-load` / `wa-error`.
		if (lib?.spriteSheet) {
			if (mine !== requestCounter) return;
			spriteHref = url;
			svgHtml = null;
			contentKey += 1;
			return;
		}

		let pending = iconCache.get(url);
		if (!pending) {
			pending = resolveIconHtml(url);
			iconCache.set(url, pending);
		}
		const result = await pending;
		if (result === RETRYABLE_ERROR) {
			iconCache.delete(url);
		}
		// If the source changed while fetching, ignore this stale request.
		const afterFetch = await getIconSource();
		if (url !== afterFetch.url || mine !== requestCounter) return;

		if (result === RETRYABLE_ERROR || result === CACHEABLE_ERROR) {
			svgHtml = null;
			spriteHref = null;
			onerror?.();
			return;
		}
		svgHtml = result;
		spriteHref = null;
		contentKey += 1;
		onload?.();
	}

	// Port of `connectedCallback` / `disconnectedCallback` + `watchIcon` /
	// `unwatchIcon`: the registry redraws this instance when libraries register
	// or the default family changes.
	$effect(() => {
		const redraw = () => {
			void setIcon();
		};
		watchIcon(redraw);
		return () => {
			unwatchIcon(redraw);
		};
	});

	// Port of `@watch(['family', 'name', 'library', 'variant', 'src',
	// 'autoWidth', 'canvas', 'swapOpacity'])`. `$effect` only runs in the browser,
	// which is WA's `waitUntilFirstUpdate` equivalent.
	$effect(() => {
		void name;
		void family;
		void variant;
		void library;
		void src;
		void canvas;
		void autoWidth;
		void swapOpacity;
		void setIcon();
	});

	// Port of `updated()`'s mutator re-application: race-proof re-runs on the
	// live `<svg>` also cover SSR->hydration cases where the fetch resolved
	// before the container mounted.
	$effect(() => {
		void svgHtml;
		void spriteHref;
		void contentKey;
		void family;
		void variant;
		void swapOpacity;
		void library;
		if (!svgContainer) return;
		const svg = svgContainer.querySelector('svg');
		if (!svg) return;
		const lib = getIconLibrary(library);
		try {
			lib?.mutator?.(svg as SVGElement, { family, variant, swapOpacity });
		} catch {
			/* a custom mutator must never break rendering */
		}
	});
</script>

<span
	class="wa-icon {extraClass ?? ''}"
	data-canvas={canvas}
	data-auto-width={autoWidth ? '' : undefined}
	data-rotate={rotate ? '' : undefined}
	data-flip={flip}
	data-animation={animation}
	style:--rotate-angle={`${rotate}deg`}
	style={extraStyle}
	role={hasLabel ? 'img' : undefined}
	aria-label={hasLabel ? label : undefined}
	aria-hidden={hasLabel ? undefined : 'true'}
>
	{#if spriteHref}
		{#key contentKey}
			<span bind:this={svgContainer} style:display="contents">
				<svg part="svg"><use part="use" href={spriteHref}></use></svg>
			</span>
		{/key}
	{:else if svgHtml}
		{#key contentKey}
				<span bind:this={svgContainer} style:display="contents">{@html svgHtml}</span>
		{/key}
	{:else}
		<svg part="svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"></svg>
	{/if}
</span>
