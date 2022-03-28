<template>
  <div v-show="showLoading" style="text-align: center" class="my-loading-box">
    <div class="bars1 my-loading">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    loading: Boolean
  },
  data () {
    return {
      showLoading: false
    }
  },
  methods: {
    startLoading () {
      this.showLoading = true
    },
    endLoading () {
      this.showLoading = false
    }
  },
  watch: {
    loading (n) {
      this.showLoading = n
    }
  }
}
</script>
