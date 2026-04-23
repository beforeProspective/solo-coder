<template>
  <div class="app-container">
    <h1 class="title">浮力互动模拟器</h1>
    <p class="subtitle">探究物体在液体中的浮沉条件</p>
    <BuoyancySimulator />
  </div>
</template>

<script setup>
import BuoyancySimulator from './components/BuoyancySimulator.vue'
</script>

<style scoped>
.app-container {
  text-align: center;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 1.1rem;
  color: #34495e;
  margin-bottom: 30px;
}
</style>
