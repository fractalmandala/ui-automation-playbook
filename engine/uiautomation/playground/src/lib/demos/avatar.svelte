<script lang="ts">
	import * as Avatar from '$generated/components/Avatar';

	// A 1x1 lime square, inlined so the demo needs no network and no asset.
	const swatch = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23C0FF00'/%3E%3C/svg%3E";
</script>

<div class="pg-row">
	<Avatar.Root>
		<Avatar.Image src={swatch} alt="A lime square" />
		<Avatar.Fallback>AK</Avatar.Fallback>
	</Avatar.Root>

	<!-- A src that 404s: the headless layer flips data-status to error, the frame
	     role tints its border, and the fallback renders. -->
	<Avatar.Root>
		<Avatar.Image src="/missing-avatar.png" alt="Broken source" />
		<Avatar.Fallback>404</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.Root>
		<Avatar.Fallback>JS</Avatar.Fallback>
	</Avatar.Root>
</div>
