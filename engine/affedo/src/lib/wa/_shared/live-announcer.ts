/**
 * Ported from webawesome/src/internal/live-announcer.ts (verbatim — the module
 * is already framework-free).
 *
 * Live regions rendered inside a shadow root are not reliably announced, so WA
 * maintains a single visually-hidden live region appended to `document.body`
 * (light DOM) and updates it imperatively. The Svelte port keeps the same
 * behaviour: one shared region per politeness, one fresh node per announcement
 * (so repeats still announce), nodes removed after a delay.
 */
type Politeness = 'polite' | 'assertive';

let politeLog: HTMLElement | null = null;
let assertiveLog: HTMLElement | null = null;

/** How long an announcement node lingers before it's removed, in milliseconds. */
const CLEAR_DELAY = 7_000;

function createLog(politeness: Politeness): HTMLElement {
	const log = document.createElement('div');
	log.setAttribute('role', 'log');
	log.setAttribute('aria-live', politeness);
	log.setAttribute('aria-relevant', 'additions');

	// Visually hidden, but not removed from the accessibility tree (which `display: none` / `hidden` would do).
	Object.assign(log.style, {
		position: 'absolute',
		width: '1px',
		height: '1px',
		margin: '-1px',
		padding: '0',
		border: '0',
		overflow: 'hidden',
		clip: 'rect(0 0 0 0)',
		clipPath: 'inset(50%)',
		whiteSpace: 'nowrap'
	} satisfies Partial<CSSStyleDeclaration>);

	return log;
}

function getLog(politeness: Politeness): HTMLElement {
	if (politeness === 'assertive') {
		assertiveLog ??= document.body.appendChild(createLog('assertive'));
		return assertiveLog;
	}

	politeLog ??= document.body.appendChild(createLog('polite'));
	return politeLog;
}

/**
 * Announces a message to assistive technology via a shared light-DOM live region.
 *
 * @param message - The text to announce. Empty strings are ignored.
 * @param politeness - Whether to announce politely (default) or assertively.
 */
export function announce(message: string, politeness: Politeness = 'polite') {
	if (!message) return;

	const log = getLog(politeness);
	const node = document.createElement('div');
	node.textContent = message;
	log.appendChild(node);

	setTimeout(() => node.remove(), CLEAR_DELAY);
}
