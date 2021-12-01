<template>
  <div ref="legendArea" class='legend-container'>
    <!-- 带统计的是table形式 -->
    <template v-if="isStatistics">
      <div class="legend--table">
        <div class="legend--table-row table-header">
          <div class="legend--table-cell"></div>
          <div v-for="statistics in chartInfo.param.legend.values" :key="statistics" class="legend--table-cell">{{statistics}}</div>
        </div>
        <div v-for="(item, index) in legends"
             :key="index"
             :class="{'row--inactive': isGrey[index]}"
             class="legend--table-row"
             @click="clickLegend(item.name, index)"
        >
          <div :title="item.alias ? item.alias : item.name" class="legend--table-cell">
            <span :style="{background: item.color}" class="legend-shape"></span>{{item.alias ? item.alias : item.name}}
          </div>
          <div v-for="(statistics, index) in item.statistics" :key="index" :class="{'legend-item--inactive': isGrey[index]}" class="legend--table-cell">{{statistics.value}}</div>
        </div>
      </div>
    </template>
    <!-- 否则是普通形式 -->
    <template v-else>
      <div
        v-for="(item, index) in legends"
        :key="index"
        :class="{'legend-item--inactive': isGrey[index]}"
        :title="item.alias ? item.alias : item.name"
        class="legend-item"
        @click="clickLegend(item.name, index)"
      >
        <span :style="{background: item.color}" class="legend-shape"></span>{{item.alias ? item.alias : item.name}}
      </div>
    </template>
  </div>
</template>

<script>
import lodash from 'lodash'
import { getChart } from '@/components/common/js/common'
export default {
  name: 'chartLegend',
  props: {
    chartInfo: Object,
    chartData: Array,
    legends: Array,
    isFullscreen: Boolean
  },
  data () {
    return {
      isGrey: [],
      legendDefaultCount: 20, // 初始显示的legend条数
      showLegends: [], // 要显示的legend；若legend数量过多，初始时这个数据里只有前20条legend
      chartId: ''
    }
  },
  computed: {
    isStatistics () {
      return !lodash.isEmpty(this.chartInfo.param.legend.values)
    }
  },
  methods: {
    clickLegend (legendName, index) {
      /* 点击legend
          * 1.当前如果是全高亮状态，则全部置灰，只留被点击的legend高亮
          * 2.如果点击的是唯一高亮的legend，则变为全高亮状态
          * 3.否则只改变被点击的legend状态
          * */
      let highlightNum = 0 // 高亮数量
      this.isGrey.forEach(g => {
        if (!g) {
          highlightNum++
        }
      })
      const hasGrey = highlightNum < this.isGrey.length // 是否有置灰的
      const curIsGrey = this.isGrey[index] // 当前legend的状态
      const currentIsTheOnlyOneHighlight = !curIsGrey && highlightNum === 1 // 当前legend是否是目前唯一高亮的
      const echarts = getChart(this.chartId)
      if (echarts) {
        if (!hasGrey) { // 1.除当前legend外全置灰
          echarts.dispatchAction({
            type: 'legendInverseSelect'
          })
          echarts.dispatchAction({
            type: 'legendSelect',
            name: legendName
          })
          this.isGrey = this.isGrey.map((g, i) => i !== index)
        } else if (currentIsTheOnlyOneHighlight) { // 2.全高亮
          echarts.dispatchAction({
            type: 'legendAllSelect'
          })
          this.isGrey = this.isGrey.map(() => false)
        } else {
          const type = curIsGrey ? 'legendSelect' : 'legendUnSelect'
          echarts.dispatchAction({
            type: type,
            name: legendName
          })
          this.$set(this.isGrey, index, !this.isGrey[index])
        }
      }
    }
  },
  watch: {
    legends (n) {
      this.isGrey = n.map(() => false)
    }
  },
  mounted () {
    this.chartId = `${this.chartInfo.id}${this.isFullscreen ? '-fullscreen' : ''}`
  }
}
</script>

<style scoped>

</style>
