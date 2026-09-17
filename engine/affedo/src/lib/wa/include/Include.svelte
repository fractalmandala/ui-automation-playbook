<script lang="ts">
	import './include.css';

	interface Props {
		/** The location of the content to include (URL or #id). */
		src?: string;
		/** The fetch mode to use. */
		mode?: 'cors' | 'no-cors' | 'same-origin';
		/** Allows included scripts to be executed. */
		allowScripts?: boolean;
		/** Called when the included file is loaded. */
		onload?: () => void;
		/** Called when the included file fails to load. */
		onerror?: (status: number) => void;
	}

	let {
		src = '',
		mode = 'cors',
		allowScripts = false,
		onload,
		onerror
	}: Props = $props();

	let containerEl = $state<HTMLElement>();

	$effect(() => {
		if (!src || !containerEl || typeof window === 'undefined') return;

		let cancelled = false;

		async function load() {
			try {
				if (src.startsWith('#')) {
					const id = decodeURIComponent(src.slice(1));
					const el = document.getElementById(id);
					if (el && containerEl) {
						containerEl.innerHTML = el instanceof HTMLTemplateElement ? el.innerHTML : el.outerHTML;
						onload?.();
					} else {
						onerror?.(404);
					}
					return;
				}

				const url = new URL(src, document.baseURI);
				const fragmentId = url.hash.slice(1);

				const response = await fetch(src, { mode });
				if (!response.ok) {
					onerror?.(response.status);
					return;
				}

				const html = await response.text();
				if (cancelled || !containerEl) return;

				if (fragmentId) {
					const parser = new DOMParser();
					const doc = parser.parseFromString(html, 'text/html');
					const target = doc.getElementById(decodeURIComponent(fragmentId));
					if (target) {
						containerEl.innerHTML = target.innerHTML;
					} else {
						onerror?.(404);
						return;
					}
				} else {
					containerEl.innerHTML = html;
				}

				if (allowScripts) {
					const scripts = containerEl.querySelectorAll('script');
					for (const script of scripts) {
						const newScript = document.createElement('script');
						for (const attr of script.attributes) {
							newScript.setAttribute(attr.name, attr.value);
						}
						newScript.textContent = script.textContent;
						script.parentNode?.replaceChild(newScript, script);
					}
				}

				onload?.();
			} catch (err) {
				onerror?.(500);
			}
		}

		load();

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="wa-include" bind:this={containerEl}></div>
