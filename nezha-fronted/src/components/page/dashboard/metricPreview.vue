<style scoped>
  .metricPreview {
    height: 100%;
  }
</style>
<template>
    <div class="metricPreview">
        <div class="content-left">
            <div class="sidebar-title">{{$t('dashboard.title')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
                <div class="sidebar-info-item sidebar-info-item-active">{{$t('dashboard.metricPreview.title')}}</div>
            </div>
        </div>
        <div class="content-right">

        </div>

    </div>

</template>
<script>
export default {
  name: "metricPreview",
  data() {
    return {

    }
  },
  methods: {
    jumpTo(data,id) {
      this.$store.state.assetData.moduleData = data;
      this.$store.state.assetData.selectedData = id;
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    }
  },
  mounted: function() {

  },
  watch: {

  }
}
</script>
