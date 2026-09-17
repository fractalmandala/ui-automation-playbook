export type Mode = 'light' | 'dark';

export const MODE_STORAGE_KEY = 'futils.mode';

function getStoredMode(): Mode | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(MODE_STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
	} catch {
		/* localStorage blocked or unavailable */
	}
	return null;
}

function getSystemMode(): Mode {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

class ModeManager {
	current = $state<Mode>('dark');
	initialized = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			this.current = getStoredMode() ?? getSystemMode();
		}
	}

	init() {
		if (typeof window === 'undefined' || this.initialized) return;
		this.initialized = true;
		const preferred = getStoredMode() ?? getSystemMode();
		this.apply(preferred, false);
	}

	apply(targetMode: Mode, withTransition = true) {
		if (typeof document === 'undefined') {
			this.current = targetMode;
			return;
		}

		this.current = targetMode;
		const root = document.documentElement;

		const mutate = () => {
			root.setAttribute('data-mode', targetMode);
			root.classList.add('wa-theme-default');
			root.classList.toggle('wa-dark', targetMode === 'dark');
			root.classList.toggle('wa-light', targetMode === 'light');
			try {
				localStorage.setItem(MODE_STORAGE_KEY, targetMode);
			} catch {
				/* storage unavailable */
			}
		};

		const supportsVT =
			withTransition &&
			'startViewTransition' in document &&
			!window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (supportsVT) {
			root.setAttribute('data-mode-switch', '');
			try {
				(document as any)
					.startViewTransition(() => {
						mutate();
					})
					.finished.finally(() => {
						root.removeAttribute('data-mode-switch');
					});
			} catch {
				mutate();
				root.removeAttribute('data-mode-switch');
			}
		} else {
			mutate();
		}
	}

	toggle(): Mode {
		const next: Mode = this.current === 'dark' ? 'light' : 'dark';
		this.apply(next, true);
		return next;
	}

	set(m: Mode) {
		this.apply(m, true);
	}
}

export const mode = new ModeManager();
export const toggleMode = () => mode.toggle();
export const setMode = (m: Mode) => mode.set(m);
export const initMode = () => mode.init();
