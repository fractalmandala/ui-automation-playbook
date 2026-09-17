<script lang="ts">
  interface Props {
    page?: number;
    totalPages?: number;
    siblingCount?: number;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    showEdges?: boolean;
    onchange?: (page: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    page = $bindable(1),
    totalPages = 10,
    siblingCount = 1,
    size = 'md',
    disabled = false,
    showEdges = false,
    onchange,
    class: className = '',
    ...restProps
  }: Props = $props();

  let safeTotal = $derived(Math.max(1, Math.floor(totalPages)));

  function goTo(target: number) {
    if (disabled) return;
    const next = Math.min(safeTotal, Math.max(1, target));
    if (next !== page) {
      page = next;
      onchange?.(next);
    }
  }

  function buildRange(current: number, total: number, siblings: number): (number | string)[] {
    const totalSlots = siblings * 2 + 5;
    if (total <= totalSlots) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const startPage = Math.max(2, current - siblings);
    const endPage = Math.min(total - 1, current + siblings);
    const range: (number | string)[] = [1];
    if (startPage > 2) range.push('ellipsis-start');
    for (let p = startPage; p <= endPage; p++) range.push(p);
    if (endPage < total - 1) range.push('ellipsis-end');
    range.push(total);
    return range;
  }

  let items = $derived(buildRange(page, safeTotal, siblingCount));
</script>

<nav
  class="cui-pagination-root {className}"
  data-slot="pagination-root"
  data-size={size}
  data-disabled={disabled ? '' : undefined}
  aria-label="Pagination"
  {...restProps}
>
  {#if showEdges}
    <button
      type="button"
      class="cui-pagination-nav"
      data-slot="pageFirst"
      aria-label="First page"
      disabled={disabled || page <= 1}
      onclick={() => goTo(1)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
    </button>
  {/if}

  <button
    type="button"
    class="cui-pagination-nav"
    data-slot="pagePrev"
    aria-label="Previous page"
    disabled={disabled || page <= 1}
    onclick={() => goTo(page - 1)}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>

  <div class="cui-pagination-list" data-slot="list">
    {#each items as item (String(item))}
      {#if typeof item === 'number'}
        <button
          type="button"
          class="cui-pagination-page"
          data-slot="pageItem"
          data-active={item === page ? '' : undefined}
          aria-current={item === page ? 'page' : undefined}
          aria-label={'Page ' + item}
          disabled={disabled}
          onclick={() => goTo(item)}
        >
          {item}
        </button>
      {:else}
        <span class="cui-pagination-ellipsis" data-slot="ellipsis" aria-hidden="true">…</span>
      {/if}
    {/each}
  </div>

  <button
    type="button"
    class="cui-pagination-nav"
    data-slot="pageNext"
    aria-label="Next page"
    disabled={disabled || page >= safeTotal}
    onclick={() => goTo(page + 1)}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>

  {#if showEdges}
    <button
      type="button"
      class="cui-pagination-nav"
      data-slot="pageLast"
      aria-label="Last page"
      disabled={disabled || page >= safeTotal}
      onclick={() => goTo(safeTotal)}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    </button>
  {/if}
</nav>
