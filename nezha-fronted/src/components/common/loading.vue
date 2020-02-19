<style scoped lang="scss">
  .loading-font{
    color:#232f3e !important;
  }
</style>
<template>
  <div v-show="showLoading" class="el-loading-mask" style="background-color: rgba(0, 0, 0, 0);">
    <div class="el-loading-spinner">
      <img width="42px" height="42px"  src="../../assets/img/loading.gif"/>
      <p class="el-loading-text loading-font">loading</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "loading",
  props: {

  },
  data() {
    return {
      showLoading:false,
    };
  },
  methods: {
    startLoading(){
      this.showLoading = true;
    },
    endLoading(){
      this.showLoading = false;
    },
  }
};
</script>


