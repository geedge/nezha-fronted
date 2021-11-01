<template>
  <el-tooltip :content="row.alertNum+' '+ translation('overall.active')" :disabled="row.alertNum < 99" effect="light" placement="top">
    <span :id="'asset-alerts-'+row.id" :class="color" class="link" @click="jumpToAlertMsg">
      {{(row.alertNum < 99 ? row.alertNum : 99)}}
        <sup v-if="row.alertNum > 99" class="linkSup">+</sup>
      {{' ' + translation('overall.active')}}
    </span>
  </el-tooltip>
</template>

<script>
import bus from '../../../../libs/bus'

export default {
  name: 'alert',
  props: ['rowIndex', 'model', 'prop', 'data', 'column'],
  data () {
    return {
      row: {}
    }
  },
  computed: {
    color () {
      if (this.row.alertNum > 0) {
        return 'danger'
      } else {
        return 'success'
      }
    }
  },
  methods: {
    jumpToAlertMsg () {
      bus.$emit('show-alert', this.row)
    }
  },
  watch: {
    model: {
      immediate: true,
      deep: true,
      handler (n) {
        this.row = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>
