npm install uplot-react uplot<template>
  <div>
    <input v-model="metrics" @change="getData"/>
    <div id="uPlot">
<!--      <UplotVue-->
<!--        :data="data"-->
<!--        :options="options"-->
<!--        :target="target"-->
<!--        @create="onCreate"-->
<!--        @delete="onDelete"-->
<!--      />-->
    </div>
    <div>
      <div id="chart"/>
    </div>
  </div>
</template>

<script>
import uPlot from 'uplot'
// import UplotVue from 'uplot-vue'
// import 'uplot/dist/uPlot.min.css'
export default {
  name: 'uPlot',
  components: {
    // UplotVue
  },
  data () {
    return {
      metrics: '',
      data: {},
      options: {},
      target: {}
    }
  },
  mounted () {
    this.uPlotInit()
    this.chartInit()
  },
  methods: {
    onCreate () {

    },
    onDelete () {

    },
    chartInit () {

    },
    uPlotInit () {

    },
    getData () {
      let url = '/prom/api/v1/query_range?'
      const nowTime = new Date().getTime()
      const start = this.start ? this.start : nowTime - 60 * 60 * 10000
      const end = this.end ? this.end : nowTime
      console.log(start, end)
      url += `start=${start}&end=${end}&step=15s&nullType=zero`
      url += `&query=${encodeURIComponent(this.metrics)}`
      this.$get(url).then(res => {
        console.log(res)
        this.oldData = res.data
      })
    }
  }
}
</script>

<style scoped>

</style>
