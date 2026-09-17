const locks = new Set<HTMLElement | object>();

/** Returns the width of the document's scrollbar */
function getScrollbarWidth() {
	const documentWidth = document.documentElement.clientWidth;
	return Math.abs(window.innerWidth - documentWidth);
}

/**
 * Used in conjunction with `scrollbarWidth` to set proper body padding in case the user has padding already on the `<body>` element.
 */
function getExistingBodyPadding() {
	const padding = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ''));
	if (isNaN(padding) || !padding) {
		return 0;
	}
	return padding;
}

/**
 * Prevents body scrolling. Keeps track of which elements requested a lock so multiple levels of locking are possible
 * without premature unlocking.
 */
export function lockBodyScrolling(lockingEl: HTMLElement | object) {
	if (typeof document === 'undefined') return;
	locks.add(lockingEl);

	// When the first lock is created, set the scroll lock size to match the scrollbar's width to prevent content from
	// shifting. We only do this on the first lock because the scrollbar width will measure zero after overflow is hidden.
	if (!document.documentElement.classList.contains('wa-scroll-lock')) {
		const scrollbarWidth = getScrollbarWidth() + getExistingBodyPadding();

		let scrollbarGutterProperty = getComputedStyle(document.documentElement).scrollbarGutter;

		if (!scrollbarGutterProperty || scrollbarGutterProperty === 'auto') {
			scrollbarGutterProperty = 'stable';
		}

		if (scrollbarWidth < 2) {
			scrollbarGutterProperty = '';
		}
		document.documentElement.style.setProperty('--wa-scroll-lock-gutter', scrollbarGutterProperty);
		document.documentElement.classList.add('wa-scroll-lock');
		document.documentElement.style.setProperty('--wa-scroll-lock-size', `${scrollbarWidth}px`);
	}
}

/**
 * Unlocks body scrolling. Scrolling will only be unlocked once all elements that requested a lock call this method.
 */
export function unlockBodyScrolling(lockingEl: HTMLElement | object) {
	if (typeof document === 'undefined') return;
	locks.delete(lockingEl);

	if (locks.size === 0) {
		document.documentElement.classList.remove('wa-scroll-lock');
		document.documentElement.style.removeProperty('--wa-scroll-lock-size');
		document.documentElement.style.removeProperty('--wa-scroll-lock-gutter');
	}
}
