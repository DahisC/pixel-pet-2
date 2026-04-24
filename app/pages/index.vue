<template>
  <div class="stage">
    <PixelPet />
    <nav class="nav">
      <NuxtLink to="/canvas" class="nav-btn">編輯器</NuxtLink>
      <NuxtLink to="/docs" class="nav-btn">Docs</NuxtLink>
    </nav>
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

.nav {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  color: #94a3b8;
  text-decoration: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid #0f3460;
  border-radius: 4px;
  transition: color 0.15s, border-color 0.15s;
}

.nav-btn:hover {
  color: #e2e8f0;
  border-color: #4ade80;
}
</style>
