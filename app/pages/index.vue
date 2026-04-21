<template>
  <div class="stage">
    <PixelPet />
    <NuxtLink to="/docs" class="docs-btn">📄 Docs</NuxtLink>
  </div>
</template>

<style scoped>
.stage {
  width: 100vw;
  height: 100vh;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.docs-btn {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid #0f3460;
  border-radius: 4px;
  transition: color 0.15s, border-color 0.15s;
}

.docs-btn:hover {
  color: #e2e8f0;
  border-color: #6d28d9;
}
</style>
