export type TreeSelection = 'single' | 'multiple' | 'leaf' | 'leaf-multiple';

export interface TreeItemHandle {
	id: string;
	value?: string;
	disabled: boolean;
	expanded: boolean;
	selected: boolean;
	depth: number;
	setExpanded: (expanded: boolean) => void;
	setSelected: (selected: boolean) => void;
}

export interface TreeContextOptions {
	selection?: TreeSelection;
	selectItem: (handle: TreeItemHandle) => void;
	registerItem: (handle: TreeItemHandle) => void;
	unregisterItem: (id: string) => void;
	isSelected: (value?: string, id?: string) => boolean;
}

export class TreeContext {
	#options: () => TreeContextOptions;

	constructor(options: () => TreeContextOptions) {
		this.#options = options;
	}

	get selection() {
		return this.#options().selection ?? 'single';
	}

	selectItem(handle: TreeItemHandle) {
		this.#options().selectItem(handle);
	}

	registerItem(handle: TreeItemHandle) {
		this.#options().registerItem(handle);
	}

	unregisterItem(id: string) {
		this.#options().unregisterItem(id);
	}

	isSelected(value?: string, id?: string) {
		return this.#options().isSelected(value, id);
	}
}

export const TREE_KEY = Symbol('wa-tree');
export const TREE_DEPTH_KEY = Symbol('wa-tree-depth');
