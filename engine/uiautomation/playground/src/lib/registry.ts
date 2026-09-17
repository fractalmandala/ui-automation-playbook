// The playground shell, driven by the pipeline's own output.
//
// Everything structural is discovered at build time from files the pipeline
// writes: which components exist (generated/plan/*.json), what each one resolved
// to (same file), the Sass it emitted (generated/styles/components/*.sass) and
// how many gate findings it has (report.json). The only hand-written data is
// META - the sidebar's grouping and one sentence per component - because no
// compiler writes copy. A recipe with no META entry still appears, under
// "Ungrouped", so the sidebar cannot silently drift from what was generated.
import type { Component } from 'svelte';
import report from '$pipeline/report.json';

export type DemoComponent = Component<{ values: Record<string, string> }>;

export type Plan = {
	axes: Record<string, { default: string; values: string[] }>;
	component: string;
	passthrough: { exportName: string; partName: string; reason: string }[];
	parts: {
		className: string;
		declarations: {
			base: [string, string][];
			states: { declarations: [string, string][]; selector: string }[];
			when: { attribute: string; declarations: [string, string][]; modifier: string }[];
		};
		exportName: string;
		file: string;
		hasAxes: string[];
		partName: string;
		props: Record<string, { bindable?: boolean; required?: boolean; type?: string }>;
		roles: string[];
		snippets: string[];
		states: string[];
		tag: string;
	}[];
	recipe: string;
	slug: string;
	source: string;
	unstyled: Record<string, string[]>;
};

type Finding = { gate: string; level: 'error' | 'warning'; message: string };

/** Grouping and one-liners. The only hand-written part of the shell. */
const META: Record<string, { blurb: string; group: string }> = {
	accordion: { blurb: 'Disclosure list where each item owns its open state.', group: 'Disclosure' },
	collapsible: { blurb: 'The smallest disclosure: one trigger, one panel.', group: 'Disclosure' },
	dialog: { blurb: 'Modal dialog with an overlay, focus trap and scroll lock.', group: 'Overlay' },
	tooltip: { blurb: 'Hover label positioned by the headless floating layer.', group: 'Overlay' },
	checkbox: { blurb: 'Tri-state box; the glyph is authored children.', group: 'Inputs' },
	'radio-group': { blurb: 'Single choice from a list, arrow-key navigable.', group: 'Inputs' },
	slider: { blurb: 'Value from a range, with ticks and labels from the root snippet.', group: 'Inputs' },
	switch: { blurb: 'Boolean toggle where the thumb reacts to an ancestor state.', group: 'Inputs' },
	toggle: { blurb: 'Pressable button that keeps its pressed state.', group: 'Inputs' },
	'toggle-group': { blurb: 'A row of toggles sharing one value.', group: 'Inputs' },
	avatar: { blurb: 'Image that degrades to initials on error.', group: 'Display' },
	button: { blurb: 'One part that renders a button or an anchor from props.', group: 'Display' },
	pagination: { blurb: 'Page links where the current page is a state overlay.', group: 'Display' },
	separator: { blurb: 'A rule. One part, one role, no axes.', group: 'Display' },
	tabs: { blurb: 'Tab list with roving focus and panel content.', group: 'Display' }
};

const GROUP_ORDER = ['Disclosure', 'Overlay', 'Inputs', 'Display', 'Ungrouped'];

const planModules = import.meta.glob('$generated/plan/*.json', { eager: true, import: 'default' });
const sassModules = import.meta.glob('$generated/styles/components/*.sass', { eager: true, query: '?raw', import: 'default' });
const demoModules = import.meta.glob('./demos/*.svelte', { eager: true });

const basename = (path: string, extension: string) => path.split('/').pop()!.replace(new RegExp(`${extension}$`), '');

const plans = new Map<string, Plan>(
	Object.entries(planModules).map(([path, plan]) => [basename(path, '.json'), plan as Plan])
);
const styles = new Map<string, string>(
	Object.entries(sassModules).map(([path, text]) => [basename(path, '.sass'), text as string])
);
const demos = new Map(
	Object.entries(demoModules).map(([path, module]) => [
		basename(path, '.svelte'),
		(module as { default: never }).default
	])
);

// report.json keeps errors and warnings in separate arrays; a finding's level is
// attached here once so no panel has to re-derive it from the gate tally.
const allFindings: Finding[] = [
	...report.errors.map((finding) => ({ ...finding, level: 'error' as const })),
	...report.warnings.map((finding) => ({ ...finding, level: 'warning' as const }))
];

/** A finding belongs to a component if it names its recipe or its Sass file. */
const findingsFor = (slug: string) =>
	allFindings.filter((finding) => finding.message.startsWith(`${slug}:`) || finding.message.includes(`/${slug}.sass`));

export type Entry = {
	axes: { attribute: string; name: string; values: string[]; default: string }[];
	blurb: string;
	demo: DemoComponent | null;
	errors: number;
	findings: Finding[];
	group: string;
	plan: Plan;
	sass: string;
	slug: string;
	title: string;
	warnings: number;
};

export const entries: Entry[] = [...plans.entries()]
	.map(([slug, plan]) => {
		const meta = META[slug] ?? { blurb: '', group: 'Ungrouped' };
		const findings = findingsFor(slug);
		return {
			// One entry per axis the recipe declares, in authored order. The attribute
			// name is derived here so the demo frame can label a column
			// `data-size="sm"` without knowing which axis it is showing - and the parts
			// that actually respond to it are already visible in the plan table.
			axes: Object.entries(plan.axes).map(([name, axis]) => ({
				attribute: `data-${name}`,
				default: axis.default,
				name,
				values: axis.values
			})),
			blurb: meta.blurb,
			demo: demos.get(slug) ?? null,
			errors: findings.filter((finding) => finding.level === 'error').length,
			findings,
			group: meta.group,
			plan,
			sass: styles.get(slug) ?? '',
			slug,
			title: plan.component.replace(/([a-z])([A-Z])/g, '$1 $2'),
			warnings: findings.filter((finding) => finding.level === 'warning').length
		};
	})
	.sort((a, b) => a.title.localeCompare(b.title));

export const grouped = GROUP_ORDER.map((group) => ({
	group,
	entries: entries.filter((entry) => entry.group === group)
})).filter((group) => group.entries.length);

/**
 * Every token this component's resolved declarations reach, read back out of the
 * plan. Derived rather than looked up so the panel cannot disagree with the plan
 * table next to it - both are reading the same object.
 */
export function usedTokens(plan: Plan): string[] {
	const names = new Set<string>();
	const collect = (value: string) => {
		for (const match of value.matchAll(/var\(--([a-z0-9-]+)\)/g)) names.add(match[1]);
	};
	for (const part of plan.parts) {
		for (const [, value] of part.declarations.base) collect(value);
		for (const state of part.declarations.states) for (const [, value] of state.declarations) collect(value);
		for (const when of part.declarations.when) for (const [, value] of when.declarations) collect(value);
	}
	return [...names].sort();
}

/** Findings that belong to no component: the adapter-wide gates. */
export const globalFindings = allFindings.filter(
	(finding) => !entries.some((entry) => entry.findings.some((candidate) => candidate.message === finding.message))
);

export const gates = report.gates;
export const summary = report.summary;
export const generatedCount = report.generated.length;
export const demoCount = entries.filter((entry) => entry.demo).length;
