<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
    >
      <div class="system-chart-config" v-loading="loading">
        <div class="system-chart-config-left">
          <ul>
            <li
              v-for="(item,index) in systemData"
              :key="index"
              class="system-chart-item"
              :class="item.name === chartConfig.param.system ? 'is-select' : ''"
              @click="changeSystem(item)"
            >{{item.name}}</li>
          </ul>
        </div>
        <div class="system-chart-config-right">
          <div class="form-items--half-width-group">
            <el-form-item
              :label="$t('dashboard.panel.chartForm.dimension')"
              class="form-item--half-width"
              prop="param.systemGroup"
            >
              <el-select size="small" v-model="chartConfig.param.systemGroup" multiple collapse-tags :placeholder="$t('el.select.placeholder')">
                  <el-option v-for="item in groupList" :value="item.name" :key="item.name" :label="item.name"/>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="selectList.length"
              :label="$t('dashboard.panel.chartForm.select')"
              class="form-item--half-width"
              prop="param.systemSelect"
            >
              <el-select size="small" v-model="chartConfig.param.systemSelect" :placeholder="$t('el.select.placeholder')">
                <el-option v-for="item in selectList" :value="item.name" :key="item.name" :label="item.name"/>
              </el-select>
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
              :label="$t('dashboard.panel.chartForm.result')"
              class="form-item--half-width"
              prop="param.limit"
            >
              <el-input :controls="false" v-model.number="chartConfig.param.limit" :placeholder="$t('placeholder.system.limit')"  size="small"/>
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
          style="display: none"
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

      <!--      valueMapping  -->
      <div v-if="isShowValueMapping(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
          <el-switch
            v-model="chartConfig.param.valueMapping.show"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.valueMapping.show">
            <div
              v-for="(item,index) in chartConfig.param.valueMapping.mapping"
              :key="index"
            >
              <div class="chart-title chart-title-config">
                <span class="endpoint-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showMapping(index)"></i>
                  <span v-show="!item.show" class="title-content-left">
                    <span v-if="item.type === 'value'">
                      {{item.value}}
                    </span>
                    <span v-if="item.type === 'range'">
                      {{item.from}} -> {{item.to}}
                    </span>
                    <span v-if="item.type === 'regx'">
                      {{item.regx}}
                    </span>
                     <div :style="{background:item.color.bac}" class="prev-mapping-box">
                        <span :style="{color:item.color.text}">
                          {{item.display || "T"}}
                        </span>
                      </div>
                  </span>
                </span>
                <span>
                  <span @click="addMapping('')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                  </span>
                  <span class="nz-icon-copy">
                      <i @click="copyMapping(index)" class="nz-icon nz-icon-override"></i>
                  </span>
                  <span class="nz-icon-minus-medium">
                      <i @click="removeMapping(index)" class="nz-icon nz-icon-minus"></i>
                  </span>
                </span>
              </div>
              <transition-group appear tag="div" name="el-zoom-in-top">
                <el-row
                  v-show="item.show"
                  :key="1"
                  class="thresholds-item"
                >
                  <div>
                    <el-select
                      v-model="item.type"
                      size="small"
                      style="width: 100px"
                      @change="(val)=>{mappingItemChange(index,val)}"
                    >
                      <el-option
                        v-for="item in mappingTypeList"
                        :value="item.value"
                        :label="item.label"
                        :key="item.value"/>
                    </el-select>
                  </div>
                  <el-form-item
                    v-if="item.type === 'value'"
                    :prop="'param.valueMapping.mapping.' + index + '.value'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      :controls="false"
                      size="small"
                      v-model.number="item.value"
                      placeholder="value"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.mapping.' + index + '.from'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      :controls="false"
                      size="small"
                      v-model.number="item.from"
                      placeholder="from"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.mapping.' + index + '.to'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      :controls="false"
                      size="small"
                      v-model.number="item.to"
                      placeholder="to"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'regx'"
                    :prop="'param.valueMapping.mapping.' + index + '.regx'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      size="small"
                      v-model="item.regx"
                      placeholder="regx"
                    ></el-input>
                  </el-form-item>
                </el-row>
                <el-row v-show="item.show" :key="2" class="thresholds-item">
                  <div>
                    <div class='mapping-display'>Display</div>
                  </div>
                  <el-form-item :prop="'param.valueMapping.mapping.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item">
                    <el-input v-model="item.display"  style="margin-right: 10px" size="small"/>
                  </el-form-item>
                  <nezhaColor :color-val="item.color" :single="false" :value-arr="[{name:'bac',value:item.color.bac,key:'bac'},{name:'text',value:item.color.text,key:'text'}]" @colorChange="(val,key)=>{colorChange(val, key, index)}"/>
                </el-row>
              </transition-group>
            </div>
            <div @click="addMapping" class="thresholds-add">
              Add valueMapping
            </div>
          </el-row>
        </transition>
      </div>

      <!--      table column-->
      <div v-if="isTable(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
        </div>
        <div v-for="(item,index) in chartConfig.param.columns" :key="index">
          <div class="chart-title chart-title-config">
                <span class="endpoint-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showColumns(index)"></i>
                  <span v-show="!item.show" class="title-content-left">
                    <span>
                      {{item.value}}
                    </span>
                  </span>
                </span>
            <span>
                  <span @click="addColumns('')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                  </span>
                  <span class="nz-icon-copy">
                      <i @click="copyColumns(index)" class="nz-icon nz-icon-override"></i>
                  </span>
                  <span class="nz-icon-minus-medium">
                      <i @click="removeColumns(index)" class="nz-icon nz-icon-minus"></i>
                  </span>
                </span>
          </div>
          <transition-group appear tag="div" name="el-zoom-in-top">
            <el-row class="thresholds-item" v-show="item.show" :key="1">
              <div>
                <div class='mapping-display'>Title</div>
              </div>
              <el-form-item :prop="'param.columns.' + index + 'title'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item" style="flex: 1">
                <el-input size="small" v-model="item.title" placeholder="regx"></el-input>
              </el-form-item>
              <div>
                <div class='mapping-display'>Unit</div>
              </div>
              <el-cascader :id="'columns-unit' + index" v-model="item.unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                           placeholder=""
                           popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                           size="small"
                           style="flex: 1"
                           @change="unitSelected"
              >
              </el-cascader>
            </el-row>
            <el-row class="thresholds-item" v-show="item.show" :key="2">
              <div>
                <div class='mapping-display'>Display</div>
              </div>
              <el-form-item :prop="'param.columns.' + index + 'display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item">
                <el-input v-model="item.display"  style="margin-right: 10px" size="small"/>
              </el-form-item>
            </el-row>
          </transition-group>
        </div>
        <div @click="addColumns" class="thresholds-add">
          Add Colums
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import nezhaColor from '@/components/common/nezhaColor'
export default {
  name: 'systemChartConfig',
  mixins: [publicConfig, chartTypeShow],
  components: {
    nezhaColor
  },
  data () {
    return {
      systemData: [],
      loading: false,
      rules: {},
      groupList: [],
      selectList: [],
      oldType: '',
      chartTypeList: [
        {
          id: 'stat',
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
        {
          id: 'guage',
          name: this.$t('dashboard.panel.chartForm.typeVal.guage.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.panel.chartForm.typeVal.treemap.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        }
      ]
    }
  },
  watch: {
    selectList (n) {
      if (n.length === 1 && !this.chartConfig.param.systemSelect) {
        this.chartConfig.param.systemSelect = this.selectList[0].name
      }
    }
  },
  methods: {
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      this.oldType = this.chartConfig.type
    },
    getSystemData () {
      this.loading = true
      this.$get('/sys/config/key/stat_query_json').then(res => {
        this.loading = false
        if (res.code === 200) {
          this.systemData = JSON.parse(res.data.paramValue)
          if (this.systemData.length) {
            if (!this.chartConfig.param.system) {
              this.chartConfig.param.system = this.systemData[0].name
              this.groupList = this.systemData[0].group
              this.selectList = this.systemData[0].select
            } else {
              const system = this.systemData.find(item => item.name === this.chartConfig.param.system)
              this.chartConfig.param.system = system.name
              this.groupList = system.group
              this.selectList = system.select
            }
            this.$refs.chartForm.clearValidate()
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    chartTypeChange (type) {
      switch (type) {
        case 'stat':
        case 'bar':
        case 'pie':
        case 'guage':
        case 'treemap':
          if (this.oldType !== 'table') {
            break
          }
          this.chartConfig.param.valueMapping = {
            show: true,
            mapping: []
          }
          this.chartConfig.param.refer = 0
          delete this.chartConfig.param.columns
          break
        case 'table':
          this.chartConfig.param.columns = []
          this.chartConfig.param.refer = 0
          delete this.chartConfig.param.valueMapping
          break
      }
      this.oldType = type
      this.change()
    },
    changeSystem (item) {
      this.chartConfig.param.system = item.name
      this.chartConfig.param.systemGroup = ''
      this.chartConfig.param.systemSelect = ''
      this.groupList = item.group
      this.selectList = JSON.parse(JSON.stringify(item.select))
    }
  },
  created () {
    this.init()
  },
  mounted () {
    this.getSystemData()
  }
}
</script>

<style scoped>

</style>
