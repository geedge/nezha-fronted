<template>
  <chart-detail v-if="chartInfo.type === 'assetInfo'" :chart-detail="chartData"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
export default {
  name: 'chartAssetInfo',
  components: {
    chartDetail
  },
  props: {
    chartInfo: Object,
    chartData: Object
  },
  data () {
    return {

    }
  },
  methods: {

  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        console.log(n)
      }
    }
  }
}
</script>

<style scoped>

</style>
