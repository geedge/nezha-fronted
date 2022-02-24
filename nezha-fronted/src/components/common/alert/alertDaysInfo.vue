<template>
  <div class="alert-days-info">
<!--    {{timestampStr(item.time, 'YYYY-MM-DD')}} {{item.P1+' '+item.P2+' '+item.P3}}-->
    <div v-for="item in alertDaysData" :key="item.time" :style="showPriority(item)" @mouseenter="tooltipHover(item,true, $event)" @mouseleave="tooltipHover(item,false, $event)">
      <div v-if="item.tooltipShow" class="alert-days-info-tooltip" :style="{left: item.position.left + 'px',top:item.position.top + 'px'}">
        <div class="tooltip-title severity-time">{{timestampStr(item.time, 'YYYY-MM-DD')}}</div>
        <div v-for="(severity,index) in severityDataWeight" :key="index" class="severity-info">
          <div class="severity-block" :style="{background: severity.color}"></div>
          <div class="severity-name">{{severity.name}}</div>
          <div class="severity-value">{{item[severity.name]}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertDaysInfo',
  props: {
    alertDaysData: Array
  },
  data () {
    return {
      daysData: [],
      severityData: this.$store.getters.severityData,
      severityDataWeight: this.$store.getters.severityDataWeight
    }
  },
  // watch: {
  //   alertDaysData: {
  //     immediate: true,
  //     handler () {
  //       this.getWeeksTime()
  //     }
  //   }
  // },
  methods: {
    showPriority (daysData) {
      let style = {}
      // let sum = 0
      this.severityDataWeight.forEach(item => {
        // sum += Number(daysData[item.name])
        if (daysData[item.name] && !style.background) {
          style = {
            background: item.color
          }
        }
      })
      // const height = sum > 0 ? (sum < 10 ? 20 : 24) : 16
      // console.log(sum, height)
      // style.height = (height + 'px')
      return style
    },
    tooltipHover (item, flag, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        item.position.left = position.left
        if (position.top > window.innerHeight / 2) {
          item.position.top = position.top - 100
        } else {
          item.position.top = position.top + 30
        }
      }
      item.tooltipShow = flag
    }
  }
}
</script>

<style scoped>

</style>
