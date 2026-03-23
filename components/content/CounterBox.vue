<script setup>
import { ref } from 'vue'

const count = ref(0)

function increase() {
  count.value++
}

function decrease() {
  // if (count.value > 0) {
    count.value--
  // }
}
</script>

<template>
  <div class="counter-box">
    <button @click="decrease">-</button>
    <span>{{ count }}</span>
    <button @click="increase">+</button>
  </div>
</template>

<style scoped>
.counter-box {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

button {
  width: 36px;
  height: 36px;
  font-size: 20px;
  border: 1px solid #000000;
  border-radius: 8px;
  color: #000000;
  background: #f7f7f7;
  cursor: pointer;
}

button:hover {
  background: #eee;
}

span {
  min-width: 28px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}
</style>