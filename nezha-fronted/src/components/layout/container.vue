<template>
  <div class="container">
    <router-view v-if="isRouteLive"/>
  </div>
</template>

<script>
export default {
  name: 'container',
  computed: {
    isRouteLive () {
      return this.$store.getters.getIsRouteLive
    }
  }
}
</script>
