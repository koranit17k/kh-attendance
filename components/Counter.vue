<script setup>
const { data: count } = await useFetch('/api/counter')
</script>

<template>
  <div>
    <h1>{{ count?.value ?? 0 }}</h1>
  </div>
</template>