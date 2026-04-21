<script setup lang="ts">
const route = useRoute()
const slug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s.join('/') : (s ?? '')
})

const { data: doc } = await useAsyncData(
  `docs-${slug.value}`,
  () => queryCollection('docs').path(`/docs/${slug.value}`).first()
)
</script>

<template>
  <div class="docs-page">
    <nav class="docs-nav">
      <NuxtLink to="/" class="nav-back">← 返回</NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/docs/pm-spec" class="nav-link">企畫書</NuxtLink>
        <NuxtLink to="/docs/engineer-tasks" class="nav-link">工程任務</NuxtLink>
      </div>
    </nav>

    <main class="docs-main">
      <template v-if="doc">
        <ContentRenderer :value="doc" class="prose" />
      </template>
      <template v-else>
        <p class="not-found">找不到文件。</p>
      </template>
    </main>
  </div>
</template>

<style scoped>
.docs-page {
  min-height: 100vh;
  background: #1a1a2e;
  color: #e2e8f0;
  font-family: 'Courier New', Courier, monospace;
}

.docs-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 2rem;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
}

.nav-back {
  color: #a78bfa;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.15s;
}

.nav-back:hover {
  color: #c4b5fd;
}

.nav-links {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #e2e8f0;
  background: #0f3460;
}

.docs-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.not-found {
  color: #94a3b8;
  text-align: center;
  margin-top: 4rem;
}

/* prose 樣式 */
.prose :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  color: #a78bfa;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #0f3460;
  letter-spacing: 0.02em;
}

.prose :deep(h2) {
  font-size: 1.375rem;
  font-weight: 600;
  color: #c4b5fd;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
}

.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ddd6fe;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}

.prose :deep(p) {
  line-height: 1.75;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  line-height: 1.7;
  margin-bottom: 0.25rem;
  color: #cbd5e1;
}

.prose :deep(li > ul),
.prose :deep(li > ol) {
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.prose :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875em;
  background: #0f3460;
  color: #93c5fd;
  padding: 0.15em 0.4em;
  border-radius: 3px;
}

.prose :deep(pre) {
  background: #0d1b2a;
  border: 1px solid #0f3460;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin-bottom: 1.25rem;
}

.prose :deep(pre code) {
  background: transparent;
  color: #e2e8f0;
  padding: 0;
  font-size: 0.875rem;
}

.prose :deep(blockquote) {
  border-left: 3px solid #6d28d9;
  padding-left: 1rem;
  margin-left: 0;
  color: #94a3b8;
  font-style: italic;
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.prose :deep(th) {
  background: #16213e;
  color: #a78bfa;
  padding: 0.5rem 0.75rem;
  text-align: left;
  border: 1px solid #0f3460;
}

.prose :deep(td) {
  padding: 0.5rem 0.75rem;
  border: 1px solid #0f3460;
  color: #cbd5e1;
}

.prose :deep(tr:nth-child(even) td) {
  background: #16213e40;
}

.prose :deep(a) {
  color: #818cf8;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose :deep(a:hover) {
  color: #a5b4fc;
}

.prose :deep(hr) {
  border: none;
  border-top: 1px solid #0f3460;
  margin: 2rem 0;
}

.prose :deep(strong) {
  color: #e2e8f0;
  font-weight: 600;
}

.prose :deep(em) {
  color: #94a3b8;
}
</style>
