<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    appearance?: 'outlined' | 'filled' | 'elevated';
    orientation?: 'vertical' | 'horizontal';
    children?: Snippet;
    media?: Snippet;
    header?: Snippet;
    headerActions?: Snippet;
    footer?: Snippet;
    footerActions?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    appearance = 'outlined',
    orientation = 'vertical',
    children,
    media,
    header,
    headerActions,
    footer,
    footerActions,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-card {className}"
  data-slot="card-root"
  data-appearance={appearance}
  data-orientation={orientation}
  {...restProps}
>
  {#if media}
    <div class="cui-card-media" data-slot="media">
      {@render media()}
    </div>
  {/if}
  <div class="cui-card-content-wrap">
    {#if header || headerActions}
      <div class="cui-card-header" data-slot="header">
        <div class="cui-card-header-main">
          {@render header?.()}
        </div>
        {#if headerActions}
          <div class="cui-card-header-actions" data-slot="header-actions">
            {@render headerActions()}
          </div>
        {/if}
      </div>
    {/if}
    {#if children}
      <div class="cui-card-body" data-slot="body">
        {@render children()}
      </div>
    {/if}
    {#if footer || footerActions}
      <div class="cui-card-footer" data-slot="footer">
        <div class="cui-card-footer-main">
          {@render footer?.()}
        </div>
        {#if footerActions}
          <div class="cui-card-footer-actions" data-slot="footer-actions">
            {@render footerActions()}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
