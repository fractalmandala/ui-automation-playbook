export { default as Icon } from './Icon.svelte';
export type { IconAnimation, IconCanvas } from './Icon.svelte';
export {
	getDefaultIconFamily,
	getIconFolder,
	getIconLibrary,
	registerIconLibrary,
	setBasePath,
	getBasePath,
	setDefaultIconFamily,
	setIconPath,
	getIconPath,
	setKitCode,
	getKitCode,
	unregisterIconLibrary,
	unwatchIcon,
	watchIcon,
	systemIcons
} from './library.js';
export type { IconHost, IconLibrary, IconLibraryMutator, IconLibraryResolver } from './library.js';
