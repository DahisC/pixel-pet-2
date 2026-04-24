<script setup lang="ts">
import PixelPet from '~/components/PixelPet.vue'
</script>

<template>
  <div class="pet-window">
    <PixelPet />
  </div>
</template>

<style>
html, body {
  background: transparent !important;
}
</style>

<style scoped>
.pet-window {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}
</style>
