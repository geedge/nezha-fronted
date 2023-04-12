<template>
  <el-popover
    :content="formatPingTime(model.pingLastUpdate)"
    placement="bottom"
    trigger="hover"
    width="200"
  >
    <div slot="reference" style="width: 100%">
      <div :class="{'active-icon green':model.pingState == 1,'active-icon red':model.pingState == 0}"></div><span>{{model.pingRtt ? model.pingRtt+'ms':''}}</span>
    </div>
  </el-popover>
</template>

<script>
import bus from '../../../../libs/bus'
export default {
  name: 'ping',
  props: ['rowIndex', 'model', 'prop', 'data', 'column'],
  methods: {
    formatPingTime (str) {
      if (!str || str == '') {
        return this.translation('asset.assetStatPre') + this.translation('asset.assetStatDown')
      }
      const ds = '-'
      const ts = ':'
      const time = new Date(bus.UTCTimeToConfigTimezone(str))
      const year = time.getFullYear()
      const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : ('0' + (time.getMonth() + 1))
      const day = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
      const hours = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
      const seconds = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
      return this.translation('asset.assetStatPre') + year + ds + month + ds + day + ' ' + hours + ts + minutes + ts + seconds
    }
  }
}
</script>
