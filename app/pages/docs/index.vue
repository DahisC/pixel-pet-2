<template>
  <div class="docs-index">
    <nav class="docs-nav">
      <NuxtLink to="/" class="nav-back">← 首頁</NuxtLink>
      <NuxtLink to="/canvas" class="nav-back">編輯器</NuxtLink>
    </nav>

    <main class="docs-main">
      <h1 class="title">Docs</h1>
      <div class="doc-list">
        <NuxtLink to="/docs/project-brief" class="doc-card">
          <span class="doc-icon">📋</span>
          <span class="doc-name">Project Brief</span>
          <span class="doc-desc">專案目標、核心概念與背景</span>
        </NuxtLink>
        <NuxtLink to="/docs/pm-spec" class="doc-card">
          <span class="doc-icon">🗂</span>
          <span class="doc-name">PM 企畫書</span>
          <span class="doc-desc">各階段目標、功能範疇與驗收標準</span>
        </NuxtLink>
        <NuxtLink to="/docs/engineer-tasks" class="doc-card">
          <span class="doc-icon">⚙️</span>
          <span class="doc-name">工程師任務</span>
          <span class="doc-desc">任務拆解與開發進度</span>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.docs-index {
  min-height: 100vh;
  background: #1a1a2e;
  color: #e2e8f0;
  font-family: 'Courier New', Courier, monospace;
}

.docs-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.75rem 2rem;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  display: flex;
  gap: 1.5rem;
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

.docs-main {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.title {
  font-size: 1.5rem;
  color: #a78bfa;
  margin-bottom: 2rem;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-card {
  display: grid;
  grid-template-columns: 2rem 1fr;
  grid-template-rows: auto auto;
  gap: 0 0.75rem;
  padding: 1rem 1.25rem;
  background: #16213e;
  border: 1px solid #0f3460;
  border-radius: 6px;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.doc-card:hover {
  border-color: #6d28d9;
  background: #1e2a4a;
}

.doc-icon {
  grid-row: 1 / 3;
  align-self: center;
  font-size: 1.25rem;
}

.doc-name {
  color: #e2e8f0;
  font-size: 0.95rem;
  font-weight: 600;
}

.doc-desc {
  color: #64748b;
  font-size: 0.8rem;
}
</style>
