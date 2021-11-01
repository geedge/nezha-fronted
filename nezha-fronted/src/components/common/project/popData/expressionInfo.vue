<template>
  <div class="expression-info">
    <div class="expression-info-title">{{filterTime[1]}}</div>
    <div class="expression-info-content" v-if="expressionInfoData.length===0">No Data</div>
    <div class="expression-info-content" v-if="expressionInfoData.length>0">
      <el-row v-for="(item,index) in expressionInfoData" :key="index" v-if="index<20">
        <el-col class="info-title" :span="18" :title="item.legend.name">{{item.legend.alias}}</el-col>
        <el-col class="info-content" :span="6" :style="{background:computeData(item).fill,color:computeData(item).text}">{{item.showValue}}</el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'expressionInfo',
  props: {
    chartData: {

    },
    filterTime: {}
  },
  watch: {
    chartData () {
      this.expressionInfoData = []
      if (this.chartData.res.length > 0) {
        this.chartData.res.forEach((item, index) => {
          if (item.status === 'success') {
            this.expressionInfoData = this.expressionInfoData.concat(item.data.result)
          }
        })
      }
    }
  },
  data () {
    return {
      expressionInfoData: []
    }
  },
  mounted () {
    if (this.chartData.res.length > 0) {
      this.chartData.res.forEach((item, index) => {
        if (item.status === 'success') {
          this.expressionInfoData = this.expressionInfoData.concat(item.data.result)
        }
      })
    }
  },
  methods: {
    computeData (item) {
      if (item.level) {
        return this.chartData.valueMapping.find((item2) => item.level === item2.level).color
      } else {
        return {
          fill: '#ffffff',
          text: '#000000'
        }
      }
    }
  },
  beforeDestroy () {

  }
}
</script>
