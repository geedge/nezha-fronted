<template>
  <div class="alert-days-info">
<!--    {{timestampStr(item.time, 'YYYY-MM-DD')}} {{item.P1+' '+item.P2+' '+item.P3}}-->
    <div v-for="item in daysData" :key="item.time" :style="showPriority(item)">

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
  watch: {
    alertDaysData: {
      immediate: true,
      handler () {
        this.getWeeksTime()
      }
    }
  },
  methods: {
    getWeeksTime () {
      const localOffset = new Date().getTimezoneOffset() // 默认 显示时区偏移的结果 单位分钟
      const now = new Date(new Date().toLocaleDateString()).getTime() - localOffset * 60 * 1000
      const arr = []
      for (let i = 0; i < 7; i++) {
        const obj = {
          time: now - i * 24 * 60 * 60 * 1000
        }
        this.severityDataWeight.forEach(item => {
          obj[item.name] = 0
        })
        console.log(obj)
        arr.unshift(obj)
      }
      this.alertDaysData.forEach(item => {
        item.values.forEach(time => {
          const findItem = arr.find(days => days.time == time[0])
          // console.log(item)
          if (findItem) {
            findItem[item.metric.priority] = time[1]
          }
        })
      })
      this.daysData = arr
    },
    showPriority (daysData) {
      let style = ''
      this.severityDataWeight.forEach(item => {
        if (daysData[item.name] && !style) {
          style = {
            background: item.color
          }
        }
      })
      console.log(daysData,style)
      return style
    }
  }
}
</script>

<style scoped>

</style>
