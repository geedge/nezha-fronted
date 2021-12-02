<template>
  <div v-show="showLoading" class="el-loading-mask">
    <div class="el-loading-spinner">
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
