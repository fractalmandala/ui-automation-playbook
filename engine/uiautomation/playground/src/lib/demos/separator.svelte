<script lang="ts">
	import * as Separator from '$generated/components/Separator';
</script>

<div class="pg-stack">
	<p class="pg-note">Above the rule. One part, one role, no axes, no states.</p>
	<Separator.Root />
	<p class="pg-note">
		Below the rule. The role draws its top border on a zero-height box, so a 1px rule stays 1px
		instead of becoming two stacked borders.
	</p>
	<Separator.Root />
</div>
