<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
      @submit.native.prevent
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
        <el-form-item class="form-item--half-width" v-if="isGroup(chartConfig.type)" :label='$t("dashboard.dashboard.chartForm.collapseState")' prop="param.collapse">
          <el-select
            id="chart-box-collapse"
            v-model="chartConfig.param.collapse"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option :label="$t('overall.expand')" :value="false"></el-option>
            <el-option :label="$t('overall.collapse')"  :value="true"></el-option>
          </el-select>
        </el-form-item>
        <!--Editor type-->
        <el-form-item class="form-item--half-width" v-if="isText(chartConfig.type)" :label='$t("dashboard.dashboard.chartForm.editorType")' prop="param.editorType">
          <el-select
            id="chart-box-collapse"
            v-model="chartConfig.param.editorType"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="editorTypeChange"
          >
            <el-option :label="$t('dashboard.dashboard.chartForm.richText')" value="richText"></el-option>
            <el-option :label="$t('dashboard.dashboard.chartForm.markDown')" value="markdown"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="form-items--half-width-group" v-if="!isGroup(chartConfig.type)">
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
<!--          <diagram :topoData="chartConfig.param.topo" :fromChartBox="true" :topologyIndexF="-1"/>-->
          <meta2dMain v-if="iconArrayLoad" :showHeader="false" :meta2dId="'rightBoxChart'" :topoData="chartConfig.param.topo" :querysArray="querysArray" :params="{timeType: 5}" :iconArray="iconArray" @reload="reloadTopo" :isChart="true"/>
        </div>
      </el-form-item>
      <!--topplogy-->
      <meta2dMain
        @save="saveTopo"
        class="topology-dialog"
        v-if="topologyDialog"
        ref="rightBoxChartEdit"
        :meta2dId="'rightBoxChartEdit'"
        :topoData="chartConfig.param.topo"
        :querysArray="querysArray"
        :params="{timeType: 5}"
        :iconArray="iconArray"
        @reload="reloadTopo"
        @exit="topologyDialogChange"
        :isChart="true"
      />
      <!--text-->
      <el-form-item v-if="isText(chartConfig.type)" :rules="{ required: true,  message: $t('validate.required'), trigger: 'change' }" prop="param.text">
        <markdownEditor v-if="chartConfig.param.editorType==='markdown'" :edit-data="chartConfig.param.text" @textChange="textChange"></markdownEditor>
        <rich-text-editor v-else ref="richTextEditor" :edit-data="chartConfig.param.text" @textChange="textChange"></rich-text-editor>
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
                allow-create :maxlength="64"
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

    </el-form>
    <el-dialog
      :title="this.chartConfig.name || 'Chart'"
      :visible.sync="isPreview.show"
      fullscreen
      class="no-transform-dialog"
      custom-class="nz-new-dialog meta2d-preview"
      :append-to-body="false"
      :modal-append-to-body="false"
      @close="isPreview.show = false"
      destroy-on-close
    >
      <div v-if="isPreview.show" style="width: 100%;height: 100%">
        <meta2dMain
          :meta2dId="'projectIdIsPreview'"
          :is-preview="true"
          :name="'preview'"
          :topoData="isPreview.topoData"
          :querysArray="isPreview.querysArray"
          :project="isPreview.currentProject"
          :params="isPreview.params"
          :iconArray="iconArray"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import richTextEditor from '@/components/chart/richTextEditor'
import markdownEditor from '@/components/chart/markdownEditor'
import beforeMeta2d from '@/components/common/mixin/beforeMeta2d'
import meta2dMain from '@/components/common/project/meta2d/meta2dMain'
import { clearTopology } from '@/components/common/js/common'
import bus from '@/libs/bus'
export default {
  name: 'otherChartConfig',
  mixins: [publicConfig, chartTypeShow],
  components: {
    richTextEditor,
    markdownEditor,
    meta2dMain
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
      ],
      topoData: {},
      querysArray: [],
      meta2dType: '',
      iconArray: [],
      iconArrayLoad: false,
      isPreview: {
        show: false,
        topoData: {},
        querysArray: {},
        currentProject: {},
        params: {}
      }
    }
  },
  methods: {
    editorTypeChange () {
      this.chartConfig.param.text = undefined
      this.change()
    },
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      this.reloadTopo()
      bus.$on('showMeta2dPreview', (params) => {
        this.isPreview = params
      })
    },
    chartTypeChange (type) {
      switch (type) {
        case 'group':
          this.chartConfig.span = 12
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            collapse: false,
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
            }
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
            editorType: 'richText'
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
            }
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
            }
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
            }
          }
          break
      }
      this.change()
    },
    topologyDialogChange (flag, data) {
      this.topologyDialog = flag
      // if (flag) {
      //   setTimeout(() => {
      //     this.$refs.rightBoxChartEdit.$refs.header.editMeta2d()
      //   }, 500)
      // }
      if (data) {
        this.iconArrayLoad = false
        this.$nextTick(() => {
          this.iconArrayLoad = true
          this.chartConfig.param.topo = data
          this.change()
        })
      }
    },
    saveTopo (topo) {
      this.topologyDialogChange(false, topo)
    },
    textChange (val) {
      if (this.$lodash.get(this.chartConfig, 'param.editorType', 'richText') === 'richText') {
        const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${val}</div></div>`
        this.chartConfig.param.text = html
      } else {
        this.chartConfig.param.text = val
      }
      this.$refs.chartForm && this.$refs.chartForm.validateField('param.text')
      this.change()
    },
    reloadTopo () {
      const res = {
        data: this.chartConfig.param
      }
      if (res.data && res.data.topo) {
        this.topoData = res.data.topo || {}
        if (res.data.topo.topo) {
          this.topoData = res.data.topo.topo || {}
        }
        this.querysArray = res.data.topo.elements || []
        // this.params = {
        //   timeType: res.data.topo.timeType || 5
        // }
      } else {
        this.topoData = {}
        this.querysArray = []
        // this.params = {
        //   timeType: 5
        // }
      }
    }
  },
  created () {
    this.init()
    this.$get('/topology/icon').then(res => {
      this.iconArray = [...res.data.list]
      this.iconArrayLoad = true
    })
  },
  destroyed () {
    clearTopology()
    bus.$off('showMeta2dPreview')
  }
}
</script>
