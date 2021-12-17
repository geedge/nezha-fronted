<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
    >
      <div class="chart-title chart-title-config">
       <span class="chart-title-content el-form-item" :class="{
              'is-error' : systemNameShow[0].error,
              'hide-input': systemNameShow[0].hideInput
            }">
              <i class="nz-icon nz-icon-arrow-down" :class="systemNameShow[0].show?'':'is-active'" @click.stop="showSystemNameShow(0)"></i>
              <el-input
                @mousedown.stop
                v-model="chartConfig.param.datasource[0].name"
                size="small"
                @input="(val)=>{systemNameInput(val,0)}"
                @change="systemNameChange(0)" style="width: 120px"
                @focus.stop="showsystemInput(0,false)"
                @blur="showsystemInput(0,true)"
              />
              <div v-if="systemNameShow[0].error"  class="el-form-item__error" style="top: 10px;left: 164px"> {{systemNameShow[0].error}}</div>
        </span>
      </div>
      <div class="system-chart-config" v-loading="loading" v-for="(item, index) in chartConfig.param.datasource " :key="index">
        <div class="system-chart-config-left">
          <ul>
            <li
              v-for="(system,index1) in systemData"
              :key="index1"
              class="system-chart-item"
              :class="item.type === system.system ? 'is-select' : ''"
              @click="changeSystem(system, index)"
            >{{system.name}}</li>
          </ul>
        </div>
        <div class="system-chart-config-right">
          <div class="form-items--half-width-group">
            <el-form-item
              :label="$t('dashboard.panel.chartForm.dimension')"
              class="form-item--half-width"
              prop="param.systemGroup"
            >
              <el-select size="small" v-model="item.systemGroup" multiple collapse-tags :placeholder="$t('el.select.placeholder')" @change="systemGroupChange(index)">
                  <el-option v-for="group in groupList" :value="group.name" :key="group.name" :label="group.name"/>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="selectList.length"
              :label="$t('dashboard.panel.chartForm.select')"
              class="form-item--half-width"
              prop="param.systemSelect"
            >
              <el-select size="small" v-model="item.systemSelect" :placeholder="$t('el.select.placeholder')" @change="systemSelectChange(index)">
                <el-option v-for="selectItem in selectList" :value="selectItem.name" :key="selectItem.name" :label="selectItem.name"/>
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
                v-model="item.sort"
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
            >
              <el-input-number :controls="false" v-model.number="item.limit" :placeholder="$t('placeholder.system.limit')"  size="small" @change="change"/>
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
        <!-- index -->
        <el-form-item
          v-show="isTable(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.tableIndex')"
          class="form-item--half-width"
          prop="param.index"
        >
          <vue-tags-input
            v-model="tag"
            :maxlength="32"
            :placeholder="$t('overall.addParameter')"
            :tags="chartConfig.param.tags"
            @tags-changed="(newTags)=>{tagsChange(newTags)}"
          />
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

      <!--      table column-->
      <div v-if="isTable(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.columns')}}</span>
        </div>
        <div v-for="(item,index) in chartConfig.param.columns" :key="index">
          <div class="chart-title chart-title-config">
                <span class="chart-title-content">
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
              <el-form-item :prop="'param.columns.' + index + '.title'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item" style="flex: 1">
                <el-input size="small" v-model="item.title" placeholder="regx" @change="change"></el-input>
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
              <el-form-item :prop="'param.columns.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                <el-input v-model="item.display"  style="margin-right: 10px" size="small"  @change="change"/>
              </el-form-item>
            </el-row>
          </transition-group>
        </div>
        <div @click="addColumns" class="thresholds-add">
          Add Colums
        </div>
      </div>

      <!--      valueMapping  -->
      <div v-if="isShowValueMapping(chartConfig.type) || isTable(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.valueMapping"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.enable.valueMapping">
            <div
              v-for="(item,index) in chartConfig.param.valueMapping"
              :key="index"
            >
              <div class="chart-title chart-title-config">
                <span class="chart-title-content">
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
                  <span @click="addMapping('')" style="margin-right: 5px">
                      <i class="nz-icon nz-icon-create-square"></i>
                  </span>
                  <span @click="copyMapping(index)" style="margin-right: 5px">
                      <i  class="nz-icon nz-icon-override"></i>
                  </span>
                  <span @click="removeMapping(index)" style="margin-right: 5px">
                      <i  class="nz-icon nz-icon-minus"></i>
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
                    :prop="'param.valueMapping.' + index + '.value'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model.number="item.value"
                      placeholder="value"
                      @change="change"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.' + index + '.from'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model.number="item.from"
                      placeholder="from"
                      @change="change"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.' + index + '.to'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model.number="item.to"
                      @change="change"
                      placeholder="to"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'regx'"
                    :prop="'param.valueMapping.' + index + '.regx'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      size="small"
                      v-model="item.regx"
                      placeholder="regx"
                      @change="change"
                    ></el-input>
                  </el-form-item>
                </el-row>
                <el-row v-show="item.show" :key="2" class="thresholds-item">
                  <div v-if="isTable(chartConfig.type)">
                    <div class='mapping-display'>Columns</div>
                  </div>
                  <el-form-item v-if="isTable(chartConfig.type)" :prop="'param.valueMapping.' + index + '.column'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                    <el-input v-model="item.column"  style="margin-right: 10px" :placeholder="$t('placeholder.chart.column')" size="small" @change="change"/>
                  </el-form-item>
                  <div>
                    <div class='mapping-display'>Display</div>
                  </div>
                  <el-form-item :prop="'param.valueMapping.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                    <el-input v-model="item.display"  style="margin-right: 10px" :placeholder="$t('placeholder.chart.display')" size="small" @change="change"/>
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
    </el-form>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import nezhaColor from '@/components/common/nezhaColor'
import VueTagsInput from '@johmun/vue-tags-input'
export default {
  name: 'systemChartConfig',
  mixins: [publicConfig, chartTypeShow],
  components: {
    nezhaColor,
    VueTagsInput
  },
  data () {
    return {
      systemData: [],
      loading: false,
      rules: {},
      systemNameShow: [{
        error: false,
        hideInput: true,
        show: true,
        oldName: ''
      }],
      groupList: [],
      selectList: [],
      oldType: '',
      tag: '',
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
      if (n.length === 1 && !this.chartConfig.param.datasource[0].systemSelect) {
        this.chartConfig.param.datasource[0].systemSelect = this.selectList[0].name
        this.systemSelectChange(0)
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
              this.chartConfig.param.datasource[0].type = this.systemData[0].name
              this.groupList = this.systemData[0].group
              this.selectList = this.systemData[0].select
            } else {
              const system = this.systemData.find(item => item.name === this.chartConfig.param.datasource[0].type)
              this.chartConfig.param.system = system.name
              this.groupList = system.group
              this.selectList = system.select
            }
            this.$refs.chartForm && this.$refs.chartForm.clearValidate()
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
          this.chartConfig.param = {
            refer: 1,
            nullType: 'null',
            statistics: 'last',
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false
            },
            datasource: [{
              name: 'System',
              type: '',
              systemGroup: '',
              systemSelect: '',
              group: '',
              select: '',
              limit: 100,
              sort: 'desc'
            }
            ]
          }
          break
        case 'table':
          this.chartConfig.param = {
            refer: 1,
            system: '',
            indexs: '',
            tags: [],
            nullType: 'null',
            statistics: 'last',
            columns: [],
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false
            },
            datasource: [{
              name: 'System',
              type: '',
              systemGroup: '',
              systemSelect: '',
              group: '',
              select: '',
              limit: 100,
              sort: 'desc'
            }
            ]
          }
          break
      }
      this.chartConfig.param.datasource[0].type = this.systemData[0].name
      this.groupList = this.systemData[0].group
      this.selectList = this.systemData[0].select
      this.oldType = type
      this.systemNameShow = [{
        error: false,
        hideInput: true,
        show: true,
        oldName: this.chartConfig.param.datasource[0].name
      }]
      this.change()
    },
    changeSystem (item) {
      this.chartConfig.param.datasource[0].type = item.name
      this.chartConfig.param.datasource[0].systemGroup = ''
      this.chartConfig.param.datasource[0].systemSelect = ''
      this.chartConfig.param.datasource[0].group = ''
      this.chartConfig.param.datasource[0].select = ''
      this.groupList = item.group
      this.selectList = JSON.parse(JSON.stringify(item.select))
    },
    systemGroupChange (index) {
      this.chartConfig.param.datasource[index].group = this.chartConfig.param.datasource[index].systemGroup.map(item => {
        const obj = this.groupList.find(group => group.name === item)
        return obj
      })
      this.change()
    },
    systemSelectChange (index) {
      this.chartConfig.param.datasource[index].select = this.selectList.find(item => item.name === this.chartConfig.param.datasource[index].systemSelect)
      this.change()
    },
    showSystemNameShow (index) {
      this.systemNameShow[index].show = !this.systemNameShow[index].show
      this.$set(this.systemNameShow, index, this.systemNameShow[index])
    },
    systemNameInput (val, index) {
      const findIndex = this.systemNameShow.indexOf(val)
      const lastIndex = this.systemNameShow.lastIndexOf(val)
      if (findIndex !== -1 && lastIndex != -1 && lastIndex !== findIndex) {
        this.systemNameShow[index].error = this.$t('error.nameDuplicate')
      } else if (!val) {
        this.systemNameShow[index].error = this.$t('validate.required')
      } else {
        this.systemNameShow[index].error = ''
      }
    },
    systemNameChange (index) {
      if (this.systemNameShow[index].error) {
        this.expressionName[index] = this.systemNameShow[index].oldName
        this.systemNameShow[index].error = ''
      } else if (!this.expressionName[index]) {
        this.expressionName[index] = this.systemNameShow[index].oldName
      } else {
        this.systemNameShow[index].oldName = this.expressionName[index]
      }
      this.change()
    },
    showsystemInput (index, flag) {
      this.systemNameShow[index].hideInput = flag
    }
  },
  created () {
    this.init()
  },
  mounted () {
    this.systemNameShow = [{
      error: false,
      hideInput: true,
      show: true,
      oldName: this.chartConfig.param.datasource[0].name
    }]
    this.getSystemData()
  }
}
</script>

<style scoped>

</style>
