// Live token overrides, as module state rather than component state: they write
// to :root, and switching components must not silently drop them. Nothing
// re-renders when a token changes - the generated stylesheet only ever names
// var(--token), so every part follows the new value on its own.
export const overrides = $state<Record<string, string>>({});

export function applyToken(name: string, value: string) {
	overrides[name] = value;
	document.documentElement.style.setProperty(name, value);
}

export function resetTokens() {
	for (const name of Object.keys(overrides)) {
		document.documentElement.style.removeProperty(name);
		delete overrides[name];
	}
}
