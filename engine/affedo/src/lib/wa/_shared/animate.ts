// Ported verbatim from webawesome/src/internal/animate.ts.
// Kept as-is: the accordion's stylesheet selects on `.animating`, so the
// hand-driven Web Animations path is load-bearing, not incidental.

/** Same as `el.animate()`, except the promise does not throw when the animation is canceled. */
export async function animate(el: Element, keyframes: Keyframe[], options?: KeyframeAnimationOptions) {
	return el.animate(keyframes, options).finished.catch(() => {
		/* suppress errors in Safari */
	});
}

/** Parses a CSS duration and returns the number of milliseconds. */
export function parseDuration(duration: number | string) {
	duration = duration.toString().toLowerCase();
	if (duration.indexOf('ms') > -1) return parseFloat(duration) || 0;
	if (duration.indexOf('s') > -1) return (parseFloat(duration) || 0) * 1000;
	return parseFloat(duration) || 0;
}

/** Tells if the user has enabled the "reduced motion" setting in their browser or OS. */
export function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Applies a class to the specified element to animate it. The class is removed after the animation finishes and then
 * the promise resolves. (Verbatim from webawesome/src/internal/animate.ts — was missing from the first port;
 * tooltip/popover/dropdown show/hide with the `show-with-scale` classes depend on it.)
 */
export function animateWithClass(el: Element, className: string) {
	return new Promise<void>(resolve => {
		const controller = new AbortController();
		const { signal } = controller;

		if (el.classList.contains(className)) {
			return;
		}
		el.classList.add(className);

		let resolved = false;
		let onEnd = () => {
			if (resolved) {
				return;
			}
			resolved = true;
			el.classList.remove(className);
			resolve();
			controller.abort();
		};

		el.addEventListener('animationend', onEnd, { once: true, signal });
		el.addEventListener('animationcancel', onEnd, { once: true, signal });

		// if there are no animations or animation is set to 0ms, end immediately
		requestAnimationFrame(() => {
			if (!resolved && el.getAnimations().length === 0) {
				onEnd();
			}
		});
	});
}
