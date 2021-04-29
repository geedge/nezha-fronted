<template>
  <div class="top-tool-btn-group">
    <button
      :id="id+'-open-select'"
      class="top-tool-btn top-tool-btn--text"
      style="border-radius: 2px 0 0 2px; border-right: none;"
      @click="openSeletor"
    >{{$t('dashboard.panel.chartForm.unit')}}</button>
    <el-cascader :id="id+'-unit-input'" ref="unitSelector" v-model="unit"
                 :options="chartUnits"
                 :props="{ expandTrigger: 'click' ,emitPath:false}"
                 :show-all-levels="false"
                 class="chart-unit"
                 placeholder=""
                 popper-class="prevent-clickoutside unit-pop-class"
                 size="small"
                 style="border-radius: 0 2px 2px 0;"
                 @change="unitSelected"
    >
    </el-cascader>
  </div>
</template>

<script>
import chartDataFormat from '../charts/chartDataFormat'
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

<style lang="scss">

  .chart-unit{
    width: 100px;
    margin: 0 20px 0 0;
  }
  .chart-unit.el-cascader .el-input.is-focus .el-input__inner {
    border-color: #FBCEA4;
  }
  .chart-unit .el-input__suffix-inner {
    color: #aaa;
  }
  .unit-pop-class .el-cascader-panel{
    height: 200px;
    background-color: #FFF;
  }
  .input-prepend{
    height: 26px;
    margin-top: 1px;
    padding:0 5px !important;
    border-bottom-right-radius: 0px !important;
    border-top-right-radius: 0px !important;
  }
  .chart-unit .el-input__inner{
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
</style>
