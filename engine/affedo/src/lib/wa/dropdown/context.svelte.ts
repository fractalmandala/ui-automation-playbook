export const DROPDOWN_KEY = Symbol('wa-dropdown');

export type DropdownSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface DropdownItemHandle {
	value?: string;
	disabled?: boolean;
	focus: () => void;
}

export interface DropdownContextOptions {
	size?: DropdownSize;
	selectItem: (item: { value?: string; text: string }) => void;
	close: () => void;
	hasCheckbox?: boolean;
}

export class DropdownContext {
	#options: () => DropdownContextOptions;

	constructor(options: () => DropdownContextOptions) {
		this.#options = options;
	}

	get size() {
		return this.#options().size;
	}

	selectItem(item: { value?: string; text: string }) {
		this.#options().selectItem(item);
	}

	close() {
		this.#options().close();
	}
}
