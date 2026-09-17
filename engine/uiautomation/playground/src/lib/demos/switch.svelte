<script lang="ts">
	import * as Switch from '$generated/components/Switch';

	// Starts checked so the thumb's resting position is visible: it moves because the
	// thumb role answers the root's data-state, and nothing here tells it where to sit.
	let on = $state(true);
</script>

<div class="pg-stack">
	<label class="pg-label">
		<Switch.Root bind:checked={on}>
			<Switch.Thumb />
		</Switch.Root>
		Rooms
	</label>

	<label class="pg-label">
		<Switch.Root disabled>
			<Switch.Thumb />
		</Switch.Root>
		Disabled
	</label>

	<p class="pg-note">
		The thumb is its own part and its own role, and it moves because
		<code>control.switch-thumb</code> answers an ancestor's state:
		<code>[data-state="checked"] &amp; { '{' } inset-inline-start: ... { '}' }</code> compiles to a descendant
		selector on the root. Nothing in the demo tells the thumb where to sit.
	</p>
</div>
