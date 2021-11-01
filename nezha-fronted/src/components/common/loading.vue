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
  }
}
</script>
