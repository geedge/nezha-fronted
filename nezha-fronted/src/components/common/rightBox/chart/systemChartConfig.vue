<template>
  <el-form
    ref="chartForm"
    :model="chartConfig"
    :rules="rules"
    label-position= "top"
    label-width="120px"
  >
    content
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
      rules: {
        height: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      },
      chartTypeList: [
        {
          id: 'url',
          name: this.$t('dashboard.panel.chartForm.typeVal.url.label')
        },
        {
          id: 'text',
          name: this.$t('dashboard.panel.chartForm.typeVal.text.label')
        },
        {
          id: 'diagram',
          name: this.$t('dashboard.panel.chartForm.typeVal.diagram.label')
        },
        {
          id: 'group',
          name: this.$t('dashboard.panel.chartForm.typeVal.group.label')
        }
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
  }
}
</script>

<style scoped>

</style>
