<template>
    <div style="display: flex;justify-content: flex-start">
      <button class="input-prepend nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend" @click="openSeletor" :id="id+'-open-select'">{{$t('dashboard.panel.chartForm.unit')}}</button>
      <el-cascader placeholder="" popper-class="no-style-class unit-pop-class" size="mini"
                   :id="id+'-unit-input'"
                   :options="chartUnits"
                   class="chart-unit"
                   :props="{ expandTrigger: 'click' ,emitPath:false}"
                   :show-all-levels="false"
                   v-model="unit"
                   @change="unitSelected"
                   ref="unitSelector"
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

<style >
  .chart-unit{
    width: 100px;
    margin: 0 20px 0 0;
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
