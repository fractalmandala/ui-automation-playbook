/**
 * Default mock props for Web Awesome components to ensure they render
 * with sensible, visible content when activated in the playground.
 */
export const COMPONENT_DEFAULT_PROPS: Record<string, Record<string, any>> = {
	Accordion: {
		appearance: 'outlined',
		mode: 'multiple'
	},
	AccordionItem: {
		text: 'Accordion Section Header',
		expanded: true
	},
	Avatar: {
		label: 'Amrit Vance',
		initials: 'AV',
		shape: 'circle'
	},
	Badge: {
		variant: 'brand',
		size: 'm'
	},
	Breadcrumb: {
		label: 'Breadcrumb Navigation'
	},
	BreadcrumbItem: {
		href: '#'
	},
	Button: {
		variant: 'brand',
		size: 'm'
	},
	ButtonGroup: {
		label: 'Control Actions'
	},
	Callout: {
		variant: 'brand',
		appearance: 'accent'
	},
	Card: {
		appearance: 'outlined'
	},
	Carousel: {
		pagination: true,
		navigation: true
	},
	CarouselItem: {},
	Checkbox: {
		label: 'Enable notifications',
		checked: true
	},
	CheckboxGroup: {
		label: 'Notification preferences'
	},
	ColorPicker: {
		label: 'Accent Color',
		value: '#6366f1'
	},
	Comparison: {
		position: 50
	},
	CopyButton: {
		value: 'npm install @webawesome/svelte'
	},
	Details: {
		summary: 'Click to expand details',
		open: true
	},
	Dialog: {
		label: 'Dialog Window',
		open: false
	},
	Divider: {
		orientation: 'horizontal'
	},
	Drawer: {
		label: 'Side Drawer Panel',
		open: false
	},
	Dropdown: {},
	DropdownItem: {
		value: 'item-1'
	},
	FormatDate: {
		date: new Date()
	},
	FormatNumber: {
		value: 1234567.89
	},
	Icon: {
		name: 'gear'
	},
	Include: {
		src: "data:text/html,<div style='padding: 14px; border: 1px dashed var(--border); border-radius: 6px; font-family: monospace; font-size: 13px;'><strong>wa-include:</strong> Loaded HTML fragment via fetch</div>"
	},
	Input: {
		label: 'Username',
		placeholder: 'Enter your username...',
		value: 'amrit'
	},
	KnownDate: {
		date: new Date()
	},
	Markdown: {
		content: '# Web Awesome\n\nNative Svelte 5 runes component suite.'
	},
	NumberInput: {
		label: 'Quantity',
		value: 42,
		min: 0,
		max: 100
	},
	Option: {
		value: 'opt-1',
		label: 'Web Awesome Option',
		selected: true
	},
	Page: {},
	Pagination: {
		page: 1,
		total: 10
	},
	Popover: {
		open: true
	},
	Popup: {
		active: true
	},
	ProgressBar: {
		value: 65,
		label: 'Storage Used'
	},
	ProgressRing: {
		value: 75,
		label: 'Sync Progress'
	},
	Radio: {
		value: 'radio-1',
		label: 'Standard Plan'
	},
	RadioGroup: {
		label: 'Subscription Tier',
		value: 'radio-1'
	},
	RandomContent: {},
	RelativeTime: {
		date: new Date(Date.now() - 1000 * 60 * 18)
	},
	Scroller: {},
	Select: {
		label: 'Framework Selection',
		placeholder: 'Choose framework...'
	},
	Slider: {
		label: 'Volume',
		value: 60,
		min: 0,
		max: 100
	},
	SplitPanel: {
		position: 50
	},
	Switch: {
		label: 'Dark Mode Sync',
		checked: true
	},
	Tab: {
		panel: 'general'
	},
	TabGroup: {
		placement: 'top'
	},
	TabPanel: {
		name: 'general'
	},
	Tag: {
		variant: 'brand',
		size: 'm',
		removable: true
	},
	Textarea: {
		label: 'Biography',
		placeholder: 'Enter a short summary...',
		rows: 3
	},
	TimeInput: {
		label: 'Meeting Time',
		value: '14:30'
	},
	Toast: {},
	ToastItem: {
		variant: 'brand'
	},
	Tooltip: {
		content: 'Web Awesome Tooltip Content'
	},
	Tree: {},
	TreeItem: {
		selected: true
	}
};

export function getDefaultProps(componentName: string): Record<string, any> {
	return COMPONENT_DEFAULT_PROPS[componentName] ?? {};
}

export const WA_CATEGORIES: Record<string, string> = {
	// Actions
	Button: 'Actions',
	ButtonGroup: 'Actions',
	CopyButton: 'Actions',

	// Forms & Inputs
	Checkbox: 'Forms',
	CheckboxGroup: 'Forms',
	ColorPicker: 'Forms',
	Input: 'Forms',
	NumberInput: 'Forms',
	Option: 'Forms',
	Radio: 'Forms',
	RadioGroup: 'Forms',
	Select: 'Forms',
	Slider: 'Forms',
	Switch: 'Forms',
	Textarea: 'Forms',
	TimeInput: 'Forms',

	// Containers & Disclosure
	Accordion: 'Containers',
	AccordionItem: 'Containers',
	Card: 'Containers',
	Details: 'Containers',

	// Feedback & Status
	Badge: 'Feedback',
	Callout: 'Feedback',
	ProgressBar: 'Feedback',
	ProgressRing: 'Feedback',
	Toast: 'Feedback',
	ToastItem: 'Feedback',

	// Navigation
	Breadcrumb: 'Navigation',
	BreadcrumbItem: 'Navigation',
	Pagination: 'Navigation',
	Tab: 'Navigation',
	TabGroup: 'Navigation',
	TabPanel: 'Navigation',

	// Overlays
	Dialog: 'Overlays',
	Drawer: 'Overlays',
	Dropdown: 'Overlays',
	DropdownItem: 'Overlays',
	Popover: 'Overlays',
	Popup: 'Overlays',
	Tooltip: 'Overlays',

	// Data Display
	Avatar: 'Data Display',
	FormatDate: 'Data Display',
	FormatNumber: 'Data Display',
	KnownDate: 'Data Display',
	RelativeTime: 'Data Display',
	Tag: 'Data Display',
	Tree: 'Data Display',
	TreeItem: 'Data Display',

	// Media & Content
	Carousel: 'Media & Content',
	CarouselItem: 'Media & Content',
	Comparison: 'Media & Content',
	Icon: 'Media & Content',
	Markdown: 'Media & Content',

	// Layout & Utilities
	Divider: 'Layout',
	Page: 'Layout',
	Scroller: 'Layout',
	SplitPanel: 'Layout',
	Include: 'Utilities',
	RandomContent: 'Utilities'
};
