export type SelectSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

export interface OptionHandle {
	id: string;
	value: string;
	label: string;
	disabled: boolean;
	getLabel: () => string;
	focus: () => void;
}

export interface SelectContextOptions {
	size?: SelectSize;
	multiple?: boolean;
	disabled?: boolean;
	isSelected: (value: string) => boolean;
	isCurrent: (value: string) => boolean;
	selectOption: (value: string, label?: string) => void;
	registerOption: (handle: OptionHandle) => void;
	unregisterOption: (id: string) => void;
}

export class SelectContext {
	#options: () => SelectContextOptions;

	constructor(options: () => SelectContextOptions) {
		this.#options = options;
	}

	get size() {
		return this.#options().size ?? 'm';
	}

	get multiple() {
		return this.#options().multiple ?? false;
	}

	get disabled() {
		return this.#options().disabled ?? false;
	}

	isSelected(value: string) {
		return this.#options().isSelected(value);
	}

	isCurrent(value: string) {
		return this.#options().isCurrent(value);
	}

	selectOption(value: string, label?: string) {
		this.#options().selectOption(value, label);
	}

	registerOption(handle: OptionHandle) {
		this.#options().registerOption(handle);
	}

	unregisterOption(id: string) {
		this.#options().unregisterOption(id);
	}
}

export const SELECT_KEY = Symbol('wa-select');
