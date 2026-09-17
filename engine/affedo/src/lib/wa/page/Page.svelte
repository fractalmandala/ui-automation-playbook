<script lang="ts">
	import type { Snippet } from 'svelte';
	import './page.css';

	interface Props {
		/** Width of the left navigation/menu area. */
		menuWidth?: string;
		/** Width of the center main area. */
		mainWidth?: string;
		/** Width of the right aside area. */
		asideWidth?: string;
		/** Optional banner across the very top. */
		banner?: Snippet;
		/** Page header below banner. */
		header?: Snippet;
		/** Subheader below header. */
		subheader?: Snippet;
		/** Navigation sidebar content. */
		navigation?: Snippet;
		/** Navigation sidebar header. */
		navigationHeader?: Snippet;
		/** Navigation sidebar footer. */
		navigationFooter?: Snippet;
		/** Header above main content. */
		mainHeader?: Snippet;
		/** Footer below main content. */
		mainFooter?: Snippet;
		/** Aside sidebar content. */
		aside?: Snippet;
		/** Full-width page footer at the bottom. */
		footer?: Snippet;
		/** Main content. */
		children?: Snippet;
	}

	let {
		menuWidth = 'auto',
		mainWidth = '1fr',
		asideWidth = 'auto',
		banner,
		header,
		subheader,
		navigation,
		navigationHeader,
		navigationFooter,
		mainHeader,
		mainFooter,
		aside,
		footer,
		children
	}: Props = $props();
</script>

<div
	class="wa-page"
	style:--menu-width={menuWidth}
	style:--main-width={mainWidth}
	style:--aside-width={asideWidth}
>
	<div part="base" class="base">
		{#if banner}
			<header part="banner" class="banner">
				{@render banner()}
			</header>
		{/if}

		{#if header}
			<header part="header" class="header">
				{@render header()}
			</header>
		{/if}

		{#if subheader}
			<div part="subheader" class="subheader">
				{@render subheader()}
			</div>
		{/if}

		<div part="body" class="body">
			{#if navigation || navigationHeader || navigationFooter}
				<aside part="menu" class="menu">
					<nav part="navigation" class="navigation">
						{#if navigationHeader}
							<div part="navigation-header">
								{@render navigationHeader()}
							</div>
						{/if}

						{#if navigation}
							{@render navigation()}
						{/if}

						{#if navigationFooter}
							<div part="navigation-footer">
								{@render navigationFooter()}
							</div>
						{/if}
					</nav>
				</aside>
			{/if}

			<main part="main" class="main">
				{#if mainHeader}
					<div part="main-header" class="main-header">
						{@render mainHeader()}
					</div>
				{/if}

				<div part="main-content" class="main-content">
					{@render children?.()}
				</div>

				{#if mainFooter}
					<div part="main-footer" class="main-footer">
						{@render mainFooter()}
					</div>
				{/if}
			</main>

			{#if aside}
				<aside part="aside" class="aside">
					{@render aside()}
				</aside>
			{/if}
		</div>

		{#if footer}
			<footer part="footer" class="footer">
				{@render footer()}
			</footer>
		{/if}
	</div>
</div>
