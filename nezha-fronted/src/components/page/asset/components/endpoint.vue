<template>
  <el-tooltip effect="light" placement="right">
    <template slot="content">
      {{translation('asset.down')}} / {{translation('asset.suspended')}} / {{translation('asset.total')}}
    </template>
    <span :class="color" class="link" style="padding: 2px 8px" @click="showEndpoint">{{model.endpointDownNum}}/{{model.endpointSuspendedNum}}/{{model.endpointNum}}</span>
  </el-tooltip>
</template>

<script>
import bus from '../../../../libs/bus'

export default {
  name: 'endpoint',
  props: ['rowIndex', 'model', 'prop', 'data', 'column'],
  computed: {
    color () {
      if (this.model.state == 3) {
        return 'suspended'
      } else {
        if (this.model.endpointDownNum > 0) {
          return 'danger'
        } else {
          return 'success'
        }
      }
    }
  },
  methods: {
    showEndpoint () {
      bus.$emit('show-endpoint', this.model)
    }
  }
}
</script>