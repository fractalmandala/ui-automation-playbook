<script lang="ts">
	import * as Toggle from '$generated/components/Toggle';

	let bold = $state(true);
</script>

<div class="pg-row">
	<Toggle.Root bind:pressed={bold} aria-label="Bold"><strong>B</strong></Toggle.Root>
	<Toggle.Root pressed={true} aria-label="Italic"><em>I</em></Toggle.Root>
	<Toggle.Root disabled aria-label="Underline"><span style="text-decoration: underline">U</span></Toggle.Root>
</div>

<p class="pg-note">
	<code>data-state</code> is <code>on</code> or <code>off</code>, never both, so the pressed treatment
	and the hover treatment never collide by accident - the only tie the checker reports for a toggle is
	the intended one where <code>[data-state="on"]</code> outranks <code>:hover</code>.
</p>
