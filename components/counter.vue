<script setup>
const { data: count } = await useFetch('/api/counter')
</script>

<template>
  <div>
    <h1>{{ count }}</h1>
  </div>
</template>

<style>
</style>