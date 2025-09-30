<template>
  <section :class="{ 'app-main': true, [route.name?.replace('/', '_')]: true }">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </section>
</template>

<script setup>
const route = useRoute();
</script>

<style lang="scss" scoped>
.app-main {
  display: flex;
  flex-grow: 1;
  position: relative;
}
</style>

<style lang="scss"></style>
