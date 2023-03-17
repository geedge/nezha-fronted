<template>
  <div class="top-tool-btn-group">
    <button
      :id="id+'-open-select'"
      class="top-tool-btn top-tool-btn--text"
      style="border-radius: 2px 0 0 2px; border-right: none;"
      @click="openSeletor"
    >{{$t('dashboard.dashboard.chartForm.unit')}}</button>
    <el-cascader :id="id+'-unit-input'" ref="unitSelector" v-model="unit"
                 :options="chartUnits"
                 :props="{ expandTrigger: 'click' ,emitPath:false}"
                 :show-all-levels="false"
                 class="chart-unit"
                 placeholder=""
                 popper-class="prevent-clickoutside unit-pop-class right-box-select-top right-public-box-dropdown-top"
                 size="small"
                 style="border-radius: 0 2px 2px 0;"
                 @change="unitSelected"
    >
    </el-cascader>
  </div>
</template>

<script>
import chartDataFormat from '../chart/chartDataFormat'
export default {
  name: 'chartUnit',
  model: {
    event: 'change',
    prop: 'postUnit'
  },
  props: {
    postUnit: {},
    id: { type: String, default: 'chart-unit' }
  },
  data () {
    return {
      chartUnits: chartDataFormat.unitOptions(),
      visibel: false,
      unit: 0
    }
  },
  created () {
    this.unit = this.postUnit
  },
  methods: {
    unitSelected: function (value) {
      this.unit = value
      this.$emit('change', this.unit)
    },
    openSeletor: function () {
      this.$refs.unitSelector.toggleDropDownVisible(!this.$refs.unitSelector.dropDownVisible)
    }
  }
}
</script>
