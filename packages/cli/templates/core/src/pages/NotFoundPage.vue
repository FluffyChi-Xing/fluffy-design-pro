<template>
  <main class="not-found">
    <div class="empty-card"><p class="eyebrow">{{ $t('notFound.eyebrow') }}</p><h1>{{ $t('notFound.title') }}</h1><p>{{ $t('notFound.description') }}</p><RouterLink class="action" to="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>{{ $t('notFound.action') }}</RouterLink></div>
  </main>
</template>

<style scoped>
.not-found{align-items:center;display:flex;justify-content:center;min-height:100vh;padding:24px}.empty-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);max-width:460px;padding:32px;width:100%}.eyebrow{color:var(--primary);font-size:11px;font-weight:750;letter-spacing:.08em;margin:0 0 10px;text-transform:uppercase}.empty-card h1{font-size:28px;letter-spacing:-.04em;margin:0}.empty-card p:not(.eyebrow){color:var(--muted-foreground);font-size:14px;line-height:1.6;margin:12px 0 24px}.action{align-items:center;background:var(--primary);border-radius:var(--radius-md);color:var(--primary-foreground);display:inline-flex;font-size:13px;font-weight:700;gap:8px;padding:10px 13px;text-decoration:none;transition:background-color 140ms ease,scale 140ms ease}.action:hover{background:var(--primary-hover)}.action:active{scale:.96}.action svg{fill:none;height:16px;stroke:currentColor;stroke-linecap:round;stroke-width:1.8;width:16px}
</style>
