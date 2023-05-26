<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
    >
      <!--title-->
      <div class="form__sub-title">
        <span>{{$t('dashboard.dashboard.chartForm.displayConfig')}}</span>
      </div>
      <div class="form-items--half-width-group">
        <!-- type -->
        <el-form-item
          :label="$t('overall.type')"
          class="form-item--half-width"
          prop="type"
        >
        <!-- group 类型编辑时，类型不允许修改 -->
          <el-select
            id="chart-box-type"
            v-model="chartConfig.type"
            :disabled="!!(chartConfig.type==='group'&&chartConfig.id)"
            :placeholder="$t('el.select.placeholder')"
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartType"
            @change="chartTypeChange">
            <el-option
              v-for="item in chartTypeList"
              :key="item.id"
              :disabled="item.id==='group' && !!chartConfig.groupId"
              :label="item.name"
              :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!--Default collapse-->
        <el-form-item class="form-item--half-width" v-if="isGroup(chartConfig.type)" :label='$t("dashboard.dashboard.chartForm.collapse")' prop="param.collapse">
          <el-switch
            id="chart-box-collapse"
            v-model="chartConfig.param.collapse"
            :active-value="true"
            :inactive-value="false"
            @change="change"
            size="small"/>
        </el-form-item>
      </div>
      <div class="form-items--half-width-group" v-if="!isGroup(chartConfig.type)">
        <!--width-->
        <el-form-item
          :label="$t('dashboard.dashboard.chartForm.width')"
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
          :label="$t('dashboard.dashboard.chartForm.high')"
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

        <!-- timeType -->
        <el-form-item
          :label="$t('dashboard.dashboard.chartForm.timeType')"
          class="form-item--half-width"
          v-if="chartConfig.type === 'clock'"
          prop="type"
        >
          <el-select
            id="chart-box-type"
            v-model="chartConfig.param.timeType"
            :disabled="chartConfig.type === 'group'"
            :placeholder="$t('el.select.placeholder')"
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartType"
            @change="change">
            <el-option
              v-for="item in timeType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <span class="panel-dropdown-label-txt" >{{item.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <!--content-->
      <div v-if="contentShow(chartConfig.type)" class="form__sub-title">
        <span>{{$t('dashboard.dashboard.chartForm.content')}}</span>
        <span style="cursor: pointer" v-if="isDiagram(chartConfig.type)"><i class="nz-icon nz-icon-edit" @click="topologyDialogChange(true)"></i></span>
      </div>
      <!--url-->
      <el-form-item v-if="isUrl(chartConfig.type)" :label='$t("dashboard.dashboard.chartForm.url")' :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }" prop="param.url">
        <el-input id="chart-box-url" v-model="chartConfig.param.url" maxlength="1024" show-word-limit size="small" :rows="2" type="textarea" @change="change"></el-input>
      </el-form-item>
      <!--topoData-->
      <el-form-item v-if="isDiagram(chartConfig.type)" >
        <div class="topology-box">
          <div class="topology-mc"></div>
          <diagram :topoData="chartConfig.param.topo" :fromChartBox="true" :topologyIndexF="-1"/>
        </div>
      </el-form-item>
      <!--topplogy-->
      <diagram :topoData="chartConfig.param.topo" class="topology-dialog" v-if="topologyDialog" @change="topologyDialogChange" :topologyIndexF="-2" ref="topologyDialog" :fromTopologyDialog="true"/>
      <!--text-->
      <el-form-item  v-if="isText(chartConfig.type)"  :rules="{ required: true,  message: $t('validate.required'), trigger: 'change' }" prop="param.text">
        <rich-text-editor ref="richTextEditor" :edit-data="chartConfig.param.text" @textChange="textChange"></rich-text-editor>
      </el-form-item>

      <!-- visibility -->
      <div v-if="params.type === 'group'">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.showHidden')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.visibility"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.visibility"
            class="form-items--half-width-group"
          >
            <!-- Variable name -->
            <el-form-item
              :label="$t('dashboard.dashboard.variableName')"
              class="form-item--half-width"
              prop="param.visibility.varName"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.varName"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="item in variables"
                  :key="item.name"
                  :label="$t(item.name)"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- Operator -->
            <el-form-item
              :label="$t('alert.config.operator')"
              class="form-item--half-width"
              prop="param.visibility.operator"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.operator"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                  v-for="item in operatorList"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- Value -->
            <el-form-item
              :label="$t('overall.value')"
              class="form-item--half-width"
              prop="param.visibility.varValue"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-input
                :placeholder="$t('overall.placeHolder')"
                size="small"
                v-model="chartConfig.param.visibility.varValue"
                @change="change">
              </el-input>
            </el-form-item>
            <!-- Result -->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.result')"
              class="form-item--half-width"
              prop="param.visibility.result"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.result"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option :label="$t('overall.show')" value="show">{{$t('overall.show')}}</el-option>
                <el-option :label="$t('overall.hidden')" value="hidden">{{$t('overall.hidden')}}</el-option>
              </el-select>
            </el-form-item>
          </div>
        </transition>
      </div>
      <!-- repeat -->
      <div v-if="params.type === 'group'">
        <div class="form__sub-title">
          <span>{{$t('dashboard.repeat')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.repeat"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.repeat"
            class="form-items--half-width-group"
          >
            <!-- variable -->
            <el-form-item
              :label="$t('dashboard.dashboard.variableName')"
              class="form-item--half-width"
              prop="param.repeat.variable"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.repeat.variable"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                  v-for="item in variables"
                  :key="item.name"
                  :label="$t(item.name)"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </transition>
      </div>

      <!--Data link-->
      <template v-if="chartConfig.type!=='group'">
        <div class="form__sub-title" >
          <span>{{$t('dashboard.dashboard.chartForm.dataLink')}}</span>
        </div>
        <draggable
          v-model="chartConfig.param.dataLink"
          @start="start"
          @end="onEnd"
          :scroll-sensitivity="150"
          :options="{
          dragClass:'drag-dataLink-class',
          fallbackClass:'fallback-class',
          forceFallback:true,
          ghostClass:'chart-ghost',
          chosenClass:'choose-class',
          scroll:true,
          filter: '.drag-disabled',
          animation: 150,
          handle: '.drag-sort'
        }">
          <div v-for="(item,index) in chartConfig.param.dataLink" :key="index" :class="item.error? 'is-item-box-error' : ''">
            <div class="chart-title chart-title-config">
              <span class="chart-title-content">
                <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showDataLink(index)"></i>
                <span v-show="!item.show" class="title-content-left">
                  <span>
                    {{item.title}}
                  </span>
                </span>
              </span>
              <span>
                <span @click="addDataLink()" :title="$t('tip.add')">
                  <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                </span>
                <span style="margin-right: 5px" :title="$t('overall.duplicate')">
                  <i @click="copyDataLink(index)" class="nz-icon nz-icon-override"></i>
                </span>
                <span style="margin-right: 5px" class="nz-icon-minus-medium" :title="$t('overall.delete')">
                  <i @click="removeDataLink(index)" class="nz-icon nz-icon-minus"></i>
                </span>
                <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                  <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
                </span>
              </span>
            </div>
            <transition-group appear tag="div" name="el-zoom-in-top">
              <el-row class="thresholds-item" v-show="item.show" :key="1">
                <div>
                  <div class='mapping-display'>{{$t("dashboard.dashboard.chartForm.title")}}</div>
                </div>
                <!-- Title -->
                <el-form-item :prop="'param.dataLink.' + index + '.title'" class="thresholds-from-item">
                  <el-input size="small" v-model="item.title" @change="change"></el-input>
                </el-form-item>
                <div>
                  <div class='mapping-display'>{{$t('dashboard.dashboard.chartForm.openIn')}}</div>
                </div>
                <!-- Open in -->
                <el-form-item :prop="'param.dataLink.' + index + '.openIn'" class="thresholds-from-item">
                  <el-select
                    v-model="item.openIn"
                    size="small"
                    @change="change"
                  >
                    <el-option value="newTab" :label="$t('dashboard.dashboard.chartForm.newTab')"></el-option>
                    <el-option value="currentTab" :label="$t('dashboard.dashboard.chartForm.currentTab')"></el-option>
                  </el-select>
                </el-form-item>
              </el-row>
              <el-row class="thresholds-item" v-show="item.show" :key="2">
                <div>
                  <div class='mapping-display'>{{$t('dashboard.dashboard.chartForm.dataLinkUrl')}}</div>
                </div>
                <!-- url -->
                <el-form-item :prop="'param.dataLink.' + index + '.url'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                  <el-input v-model="item.url" size="small"  @change="change('dataLink',index)"/>
                </el-form-item>
              </el-row>
            </transition-group>
          </div>
        </draggable>
        <div @click="addDataLink" class="thresholds-add">
          {{$t('overall.addDataLink')}}
        </div>
      </template>

    </el-form>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import diagram from '@/components/common/ChartDiagram/diagram'
import richTextEditor from '@/components/chart/richTextEditor'
import draggable from 'vuedraggable'
export default {
  name: 'otherChartConfig',
  mixins: [publicConfig, chartTypeShow],
  components: {
    diagram,
    richTextEditor,
    draggable
  },
  watch: {
    // 'chartConfig.param.text': {
    //   handler (n) {
    //     console.log(n)
    //     this.change()
    //   }
    // }
  },
  data () {
    return {
      rules: {},
      topologyDialog: false,
      chartTypeList: [
        {
          id: 'url',
          name: this.$t('dashboard.dashboard.chartForm.url')
        },
        {
          id: 'text',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.text.label')
        },
        {
          id: 'diagram',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.diagram.label')
        },
        {
          id: 'group',
          name: this.$t('dashboard.dashboard.chartForm.group')
        },
        {
          id: 'map',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.map.label')
        },
        {
          id: 'topology',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.topology.label')
        },
        {
          id: 'clock',
          name: this.$t('dashboard.dashboard.chartForm.typeVal.clock.label')
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
          this.chartConfig.span = 12
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            collapse: true,
            enable: {
              visibility: false,
              repeat: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            repeat: {
              variable: ''
            },
            dataLink: this.chartConfig.param.dataLink
          }
          break
        case 'text':
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            text: '',
            enable: {
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: this.chartConfig.param.dataLink
          }
          break
        case 'diagram':
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            topo: '',
            enable: {
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: this.chartConfig.param.dataLink
          }
          break
        case 'url':
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            url: '',
            enable: {
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: this.chartConfig.param.dataLink
          }
          break
        case 'clock':
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            timeType: 'local',
            enable: {
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: this.chartConfig.param.dataLink
          }
          break
      }
      this.change()
    },
    topologyDialogChange (flag, data) {
      this.topologyDialog = flag
      if (data) {
        this.chartConfig.param.topo = data
        this.change()
      }
    },
    textChange (val) {
      const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${val}</div></div>`
      this.chartConfig.param.text = html
      this.$refs.chartForm.validateField('param.text')
      this.change()
    },
    start () {
      document.body.classList.add('isDrag')
    },
    onEnd () {
      this.change()
      document.body.classList.remove('isDrag')
    }
  },
  created () {
    this.init()
  }
}
</script>
