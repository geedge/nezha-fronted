<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
    >
      <div class="system-chart-config">
        <div class="system-chart-config-left">
          <ul>
            <li v-for="(item,index) in mockData" :key="index" class="system-chart-item" :class="''">{{item.name}}</li>
          </ul>
        </div>
        <div class="system-chart-config-right">
          <div class="form-items--half-width-group">
            <el-form-item
              :label="$t('dashboard.panel.chartForm.group')"
              class="form-item--half-width"
              prop="param.systemGroup"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
            >
              <el-select size="small">

              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('dashboard.panel.chartForm.select')"
              class="form-item--half-width"
              prop="param.stack"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
            >
              <el-input  size="small"/>
            </el-form-item>
          </div>
          <div class="form-items--half-width-group">
            <el-form-item
              :label="$t('dashboard.panel.chartForm.sort')"
              class="form-item--half-width"
              prop="param.sort"
            >
              <el-select
                id="chart-box-height"
                v-model="chartConfig.param.sort"
                placeholder=""
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                value-key="chartSpan"
                @change="change"
              >
                <el-option :value="'desc'" :label="$t('dashboard.explore.descending')">
                </el-option>
                <el-option :value="'asc'" :label="$t('dashboard.explore.ascending')">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('dashboard.panel.chartForm.limit')"
              class="form-item--half-width"
              prop="param.limit"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
            >
              <el-input-number :controls="false" v-model="chartConfig.param.limit"  size="small"/>
            </el-form-item>
          </div>
        </div>
      </div>
      <!--title-->
      <div class="form__sub-title">
        <span>{{$t('dashboard.panel.chartForm.displayConfig')}}</span>
      </div>
      <div class="form-items--half-width-group">
        <!-- type -->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.type')"
          class="form-item--half-width"
          prop="type"
        >
          <el-select
            id="chart-box-type"
            v-model="chartConfig.type"
            :disabled="chartConfig.type==='group'&&chartConfig.children&&chartConfig.children.length"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartType"
            @change="chartTypeChange">
            <el-option
              v-for="item in chartTypeList"
              :key="item.id"
              :disabled="item.id==='group' && chartConfig.isGroup"
              :label="item.name"
              :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!--refer-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.refer')"
          class="form-item--half-width"
          prop="param.stack"
        >
          <el-select
            id="chart-box-height"
            v-model="chartConfig.param.refer"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option :value="1" label="true">
            </el-option>
            <el-option :value="0" label="false">
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="form-items--half-width-group">
        <!--width-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.width')"
          class="form-item--half-width"
          prop="span">
          <el-select
            id="chart-box-span"
            v-model="chartConfig.span"
            :disabled="chartConfig.type === 'group'"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option
              v-for="item in spanList"
              :key="item"
              :label="'span-' + item"
              :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--height-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.high')"
          class="form-item--half-width"
          prop="height">
          <!-- 由px改为span -->
          <el-select
            id="chart-box-height"
            v-model="chartConfig.height"
            :disabled="chartConfig.type === 'group'"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option
              v-for="item in spanList"
              :key="item"
              :label="'span-' + item"
              :value="item"
            >
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import mockData from './systemConfigJson'
export default {
  name: 'systemChartConfig',
  mixins: [publicConfig, chartTypeShow],
  data () {
    return {
      mockData,
      rules: {},
      chartTypeList: [
        {
          id: 'singleStat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
      ]
    }
  },
  methods: {
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
    },
    chartTypeChange (type) {
      switch (type) {
        case 'group':
          this.chartConfig.height = ''
          this.chartConfig.span = 12
          this.chartConfig.param = {
            collapse: false
          }
          break
        case 'text':
          this.chartConfig.param = {
            text: ''
          }
          break
        case 'diagram':
          this.chartConfig.param = {
            topo: ''
          }
          break
        case 'url':
          this.chartConfig.param = {
            url: ''
          }
          break
      }
      this.change()
    },
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>

</style>
