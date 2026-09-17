<script module lang="ts">
  export type ThemePreset = 'createui' | 'neobrutalist' | 'terminal' | 'cyber' | 'editorial';
  export type ColorMode = 'light' | 'dark';
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  let currentTheme: ThemePreset = $state('createui');
  let currentMode: ColorMode = $state('dark');

  const themes: { id: ThemePreset; name: string; dotColor: string }[] = [
    { id: 'createui', name: 'CreateUI Modern', dotColor: '#2563eb' },
    { id: 'neobrutalist', name: 'Neo-Brutalist', dotColor: '#ffde00' },
    { id: 'terminal', name: 'Terminal Mono', dotColor: '#10b981' },
    { id: 'cyber', name: 'Cyber Neon', dotColor: '#8b5cf6' },
    { id: 'editorial', name: 'Stone Editorial', dotColor: '#b45309' }
  ];

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') as ThemePreset | null;
    const urlMode = params.get('mode') as ColorMode | null;

    const savedTheme = (urlTheme && ['createui', 'neobrutalist', 'terminal', 'cyber', 'editorial'].includes(urlTheme))
      ? urlTheme
      : ((localStorage.getItem('cui-theme') as ThemePreset) || 'createui');

    const savedMode = (urlMode && ['light', 'dark'].includes(urlMode))
      ? urlMode
      : ((localStorage.getItem('cui-mode') as ColorMode) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    setTheme(savedTheme);
    setMode(savedMode);
  });

  function setTheme(t: ThemePreset) {
    currentTheme = t;
    localStorage.setItem('cui-theme', t);
    document.documentElement.dataset.theme = t;
  }

  function setMode(m: ColorMode) {
    currentMode = m;
    localStorage.setItem('cui-mode', m);
    document.documentElement.dataset.mode = m;
  }

  function toggleMode() {
    setMode(currentMode === 'dark' ? 'light' : 'dark');
  }
</script>

<div class="theme-switcher-bar">
  <!-- Theme Preset Selector -->
  <div class="theme-selector-group" role="group" aria-label="Theme Preset Selection">
    {#each themes as t}
      <button
        type="button"
        class="theme-chip"
        data-active={currentTheme === t.id ? '' : undefined}
        onclick={() => setTheme(t.id)}
      >
        <span class="theme-dot" style="background-color: {t.dotColor}"></span>
        <span class="theme-name">{t.name}</span>
      </button>
    {/each}
  </div>

  <div class="theme-divider-v"></div>

  <!-- Mode Toggle (Sun/Moon) -->
  <button
    type="button"
    class="mode-toggle-btn"
    onclick={toggleMode}
    title="Switch between Light and Dark mode"
  >
    {#if currentMode === 'dark'}
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <span>Light</span>
    {:else}
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <span>Dark</span>
    {/if}
  </button>
</div>

<style>
  .theme-switcher-bar {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background-color: var(--bg-weaker);
    border: 1px solid var(--stroke-weakest);
    border-radius: var(--radius-md);
    padding: 3px;
  }

  .theme-selector-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .theme-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
  }

  .theme-chip:hover {
    background-color: var(--state-hover);
    color: var(--text-primary);
  }

  .theme-chip[data-active] {
    background-color: var(--bg);
    color: var(--text-primary);
    border-color: var(--stroke-weakest);
    box-shadow: var(--shadow-xs);
    font-weight: 600;
  }

  .theme-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .theme-divider-v {
    width: 1px;
    height: 1.25rem;
    background-color: var(--stroke-weakest);
    margin: 0 2px;
  }

  .mode-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
  }

  .mode-toggle-btn:hover {
    background-color: var(--state-hover);
    color: var(--text-primary);
  }
</style>
