// Ported verbatim from webawesome/src/internal/dismissible-stack.ts.
// Shared Escape-key coordination for dismissibles (tooltip, and later
// popover/dropdown/dialog/drawer/select/color-picker): each open dismissible
// registers itself, and only the topmost one responds to Escape so nested
// dismissibles don't all close at once.
const dismissibleStack: object[] = [];

/**
 * Registers a dismissible as open. Call this when the dismissible becomes visible.
 * The most recently registered dismissible is at the top.
 */
export function registerDismissible(key: object): void {
	// Move an already registered dismissible to the top instead of duplicating it. This can happen when a prevented hide
	// event reverts a dismissible back to open.
	unregisterDismissible(key);
	dismissibleStack.push(key);
}

/**
 * Unregisters a dismissible. Call this when the dismissible closes or is removed from the DOM.
 */
export function unregisterDismissible(key: object): void {
	for (let i = dismissibleStack.length - 1; i >= 0; i--) {
		if (dismissibleStack[i] === key) {
			dismissibleStack.splice(i, 1);
			break;
		}
	}
}

/**
 * Returns true if the given key is the topmost registered dismissible.
 * Use this to guard Escape key handling so only the topmost dismissible responds.
 */
export function isTopDismissible(key: object): boolean {
	return dismissibleStack.length > 0 && dismissibleStack[dismissibleStack.length - 1] === key;
}
