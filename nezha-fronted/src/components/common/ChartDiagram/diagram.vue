<style>
  @import "../project/L5/css/iconfont.css";
  @import "../project/L5/css/props.css";
</style>
<template>
  <div class="project-box list-page" v-my-loading="topologyLoading">
    <div class="main-list" style="overflow: hidden">
      <div class="main-container" :class="fromOverView?'from-overview':'from-project'">
        <div v-if="(editTopologyFlag || isPreview)&&!fromChart" class="edit-topologyLine top-tools" style="padding-left: 20px;width: calc(100% - 20px);display: inline-block">
          <!--工具栏-->
          <span v-if="!isPreview" class="project-topology-tool">
          <el-dropdown trigger="click" size="small" placement="bottom-start" class="no-style-class">
            <span class="el-dropdown-title"><i class="iconfont icon-cube"></i> <i
              class="nz-icon nz-icon-arrow-down"></i></span>
            <el-dropdown-menu slot="dropdown" @click="dropdownClick">
              <div style="height: 450px"  v-my-loading="imgageLoading">
                <el-card shadow="hover" style="height:420px;width:284px;overflow-y: auto"
                         class="project-topology-add-node">
                <!--<div class="drag-header">——</div>-->
                <el-collapse v-model="activeNames" v-for="(item, index) in tools" :key="index" class="collapse-box">
                  <el-collapse-item :title="item.group" :name="item.group">
                    <template slot="title">
                      <div style="display: flex;width: 100%;">
                        <i class="nz-icon nz-icon-caret-right"></i> <div style="flex: 1">{{item.group}}</div> <i class="nz-icon nz-icon-delete title-delete" @click="tooltipDeleteTitle(item)" :title="$t('overall.delete')"></i>
                      </div>
                    </template>
                    <div v-for="(btn, i) in item.children" :key="'info2'+'-'+index+'-'+i" class="buttons"  :title="btn.data.text">
                      <a
                        :key="i"
                        :draggable="btn.data"
                        @dragstart.stop="onDrag($event, btn)"
                        @mousedown="dragFlag=false"
                        @mouseup="dragFlagChange(btn)"
                        class="btn"
                      >
                        <img :src="btn.data.image" v-if="btn.data.image">
                        <i v-else-if="btn.data.iconName" f :class="`nz-icon ${btn.data.iconName}`"></i>
                        <i v-else :class="`iconfont ${btn.icon}`"></i>
                      </a>
                      <i v-if="item.group!=='General'" class="delIcon nz-icon nz-icon-delete" @click="tooltipDelete(btn)"  :title="$t('overall.delete')"></i>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
                <div class="upload-pic-box" @click="uploadPicChange" v-has="'topo_icon_save'">
                  <i class="el-icon-plus"></i>
                  <span>
                     {{ $t('overall.uploadCustomPicture') }}
                  </span>
                </div>
              </div>
            </el-dropdown-menu>
          </el-dropdown>

          <div class="flex middle special-select mb10"
               style="width: 75px;height: 28px;display: inline-block;margin: 0 40px 0 20px;background: #fff">
            <div class="full pr10">
              <el-select v-model="lineName" size="small"
                         :popper-append-to-body="false"
                         @change="changeTopologyOpt(lineName,'lineName')">
               <div slot="prefix">
                <div class="icon-item" style="width: 100%;padding: 0">
                  <svg>
                    <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                      <path
                        :d="penLineType.find((item,i)=>item.id==lineName).d"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
              </div>
                <el-option :disabled="true" :value="false">{{$t('project.topology.defaultLineType')}}</el-option>
                <el-option v-for="(item,index) in penLineType" :value="item.id" :key="index">
                  <div class="icon-item" style="position: relative;width: 100%;padding: 0">
                    <svg>
                    <g fill="none" :stroke="(lineName==item.name)?'#ee9d3f': item.strokeColor " stroke-width="1">
                    <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                    </g>
                    </svg>
                    <span style="position: absolute;left:60px;top: 0;">{{item.name}}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <topology-top-tool
            v-if="editTopologyFlag&&toolShow.topTool"
            :selection.sync="props"
            @del="delPen"
            :index="topologyIndex"
            ref="topTool"
            @toolShowChange="toolShowChange"
            :cachesIndex="cachesIndex"
            :redoIndexChange="redoIndexChange"
            :toolShow="toolShow">
          </topology-top-tool>

        </span>
          <span class="float-right">
          <button type="button" @click="previewTopology" v-if="!isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light"
                  style="margin-right: 20px"
          >
             {{$t('overall.preview')}}
           </button>
            <button type="button" v-if="isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="previewExit"
                    style="margin-right: 20px"
            >
             {{$t('project.topology.previewExit')}}
           </button>
           <button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="saveTopology"
                   :disabled="prevent_opt.save"
                   :class="{'nz-btn-disabled':prevent_opt.save}"
                   style="margin-right: 20px">
             {{$t('overall.save')}}
           </button>
           <button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-right: 20px" @click="cancelTopology">
             {{$t('project.topology.exit')}}
           </button>
         </span>
        </div>
        <div v-if="(!editTopologyFlag&&!fromOverView)&&!fromChart" class="top-tools" style="padding-left: 10px">
        </div>
        <div class="nz-table-list" :class="fromChart ? 'h100': ''">
          <!--悬浮network部分-->
          <div class="network-info">
            <div v-if="popDataShow.main">
              <popDataMain :moduleId="moduleId" :projectId="projectInfo.id"></popDataMain>
            </div>
            <div v-if="popDataShow.info">
              <popDataInfo :moduleId="moduleId" :projectId="projectInfo.id"></popDataInfo>
            </div>
          </div>
          <div :class="['page topo-page',fromOverView?'overview-page':'']">
            <!--画布部分-->
            <div :id="'topology-canvas' + topologyIndexF" :ref="'topology-canvas'+ topologyIndexF" class="full"  @contextmenu="onContextMenu($event)"></div>
            <!--设置属性-->
            <div v-if="editTopologyFlag&&toolShow.attr" class="props">
              <canvas-props ref="CanvasProps"
                            :index="topologyIndex"
                            :imgArr = 'tools'
                            :modules="modules"
                            :selection.sync="props"
                            :fromDiagram="true"
                            @animate="animateCanvas"
                            @change="onUpdateProps"
                            @changeProjectTitle="changeProjectTitle"
                            @del="delPen"
                            @notModuleIDArrChange="notModuleIDArrChange">
              </canvas-props>
            </div>
            <div class="context-menu" v-if="contextmenu.left && editTopologyFlag" :style="this.contextmenu">
              <CanvasContextMenu :index="topologyIndexF" :props.sync="props"></CanvasContextMenu>
            </div>
            <!--所有节点上的小图标-->
            <div v-for="(item,index) in nodesArr" v-if="!editTopologyFlag&&item.data.iconToolState&&!fromPrev"
                 :key="index"
                 v-show="(item.rect.y - (48*(fromOverView?penToolTipScale:1)) > -10) && (item.rect.center.x - (24*(fromOverView?penToolTipScale:1)) > - 10)"
                 :style="{position: 'absolute',top:item.rect.y - (48*(fromOverView?penToolTipScale:1))+'px',left:item.rect.center.x - (24*(fromOverView?penToolTipScale:1)) +'px',transform:'scale('+(fromOverView?penToolTipScale:1)+')'}"
                 class="network-pop"
            >

              <i
                :ref="'modelTopId'+index"
                :class="{'nz-icon':true, 'nz-icon-shuidi':true,'model-error':item.data.state&&item.data.state.error&&!item.data.show,'model-error-active':item.data.state&&item.data.state.error&&item.data.show}"
                @click="showNodeTools(index,item)"
              >
                <i class="nz-icon nz-icon-model"></i>
              </i>
              <!--'selpop':selpopIs(item),'no-selPop':!selpopIs(item),'error-model-stat':modelPopError(item)  @click="popClick(item.id)" -->
              <div v-for="(item1, index) in popData" :key="index">
                <transition name="scaleTool">
                  <i v-if="item.data.show"
                     :class="{'nz-icon':true,'nz-icon-hexagonBorder':true,'error-model-stat':item.data.state[item1.id],'selpop':selpopIs(item,item1),'no-selPop':!selpopIs(item,item1),}"
                     :style="{top:item1.top,left:item1.left}"
                     :title="item1.title"
                     @click="nodeTools(item,item1)"
                  >
                    <i class="nz-icon nz-icon-liubianxing"></i>
                    <i :class="[item1.className,{'nz-icon':item1.className},'noMove']"></i>
                  </i>
                </transition>
              </div>
            </div>
            <!--提示未添加module id的块-->
            <div v-for="(item, index) in notModuleIDArr"
                 v-if="editTopologyFlag&&!fromPrev"
                 :key="index"
                 :style="{
             position: 'absolute',
             top:item.rect.y- 10 +'px',
             left:item.rect.x - 10+'px',
             transform:'scale('+(fromOverView?penToolTipScale:1)+')',
           }"
            >
              <div :style="{top:0,left:0,width:item.rect.width+15+'px',height:0}" class="module-rect-top"></div>
              <div :style="{top:0,left:item.rect.width+15+'px',width:0,height:item.rect.height+15+'px'}" class="module-rect-right"></div>
              <div :style="{top:item.rect.height+15 +'px',left:0,width:item.rect.width+15+'px',height:0}" class="module-rect-bottom"></div>
              <div :style="{top:0,left:0,width:0,height:item.rect.height+15+'px'}" class="module-rect-left"></div>
            </div>
            <!--节点连线相关的 tooltip-->
            <div v-if="tooltipPosition.show&&!editTopologyFlag"
                 ref="topoTooltip"
                 :style="{position:isScreen?'fixed' : 'absolute',top:tooltipPosition.top+'px',left:tooltipPosition.left+'px','z-index':10,height:tooltipPosition.height+'px'}"
                 @mouseout="tooltipOut"
                 @mouseover="tooltipOver"
            >
              <topoTooltip class="nz-tooltip-bac" :chartDataParent="chartData" :filterTime="filterTime" :isPanel="isPanel"/>
            </div>
          </div>
          <!--endpoint-->
          <transition name="right-box">
            <endpointTable v-if="popDataShow.endpoint" :moduleId="moduleId" :moduleName="moduleName" :projectId="projectInfo.id"
                           @close="popDataShowUpdate('',true)">endpoint
            </endpointTable>
          </transition>
          <div v-if="!fromOverView&&!editTopologyFlag&&!fromPrev&&!fromChartBox" class="right-bottom-zoom">
            <div class="zoom-option" style="border-bottom: 1px solid #c5c8cb;" @click="zoomMap(0.25)" :title="$t('overall.enlargement')"><span><i class="nz-icon nz-icon-enlarge"></i></span></div>
            <div class="zoom-option" @click="zoomMap(-0.25)" :title="$t('overall.shrink')"><span><i class="nz-icon nz-icon-narrow"></i></span></div>
          </div>
        </div>
      </div>
    </div>
    <!--<div class="left-bottom" v-if="editTopologyFlag">-->
    <!--<div class="title">小提示</div>-->
    <!--<ul class="group">-->
    <!--<li>编辑时：</li>-->
    <!--<li>1.Ctrl + 鼠标移动：移动整个画布</li>-->
    <!--<li>2.Ctrl + 鼠标滚轮：缩放</li>-->
    <!--<li>3.选中元素 按下Delete键或者Backspace可以删除元素</li>-->
    <!--</ul>-->
    <!--</div>-->
    <!--asset-->
    <transition name="right-box">
      <assetTable v-if="popDataShow.asset" :moduleId="moduleId" :moduleName="moduleName" :projectId="projectInfo.id"
                  @close="popDataShowUpdate('',true)">alert
      </assetTable>
    </transition>
    <!--alert-->
    <transition name="right-box">
      <alertTable v-if="popDataShow.alert" :moduleId="moduleId" :moduleName="moduleName" :projectId="projectInfo.id"
                  @close="popDataShowUpdate('',true)">alert
      </alertTable>
    </transition>
    <!--Custom picture-->
    <el-dialog
      :title="title"
      :visible.sync="uploadPicShow"
      width="auto"
      class="no-style-class"
      :append-to-body="true"
      @close="uploadPicShow = false"
      destroy-on-close>
      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label">{{ $t('overall.name') }}</el-col>
        <el-col :span="20">
          <el-input maxlength="64" show-word-limit v-model="uploadPic.name" size="small"  :placeholder="$t('project.topology.placeholderImg')"></el-input>
        </el-col>
      </el-row>
      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label">{{ $t('overall.folder') }}</el-col>
        <el-col :span="20">
          <el-autocomplete
            :maxlength="64" show-word-limit
            class="inline-input"
            v-model="uploadPic.unit"
            :fetch-suggestions="querySearch"
            size="small"
          ></el-autocomplete>
        </el-col>
      </el-row>

      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label"> </el-col>
        <el-col :span="20">
          <div class="upload-body">
            <el-upload
              drag
              class="upload-demo"
              action=" "
              :show-file-list="true"
              :on-change="beforeAvatarUpload"
              :auto-upload="false"
              accept=".jpg,.png"
              :limit="1"
              :id="'upload-pic-show'">
              <!--<div slot="tip" class="el-upload__tip" >{{$t('overall.importTipImg')}}</div>-->
              <i class="nz-icon nz-icon-upload"></i>
              <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <div class="upload-pic-row" style="text-align: center">
            <span>
               <button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-right: 20px" @click="uploadPicShow=false">
             {{$t('project.topology.exit')}}
           </button>

              <button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="imgUpload"
                      v-has="'topo_icon_save'" :disabled="prevent_opt.save"
                      :class="{'nz-btn-disabled':prevent_opt.save}"
                      style="margin-right: 20px">
             {{$t('overall.save')}}
           </button>
            </span>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import { Topology } from '@topology/core'
import { Store as le5leStore } from 'le5le-store'
import {
  flowPens
} from '@topology/flow-diagram'
import {
  activityDiagram
} from '@topology/activity-diagram'
import {
  classPens
} from '@topology/class-diagram'
import {
  sequencePens,
  sequencePensbyCtx
} from '@topology/sequence-diagram'
import { formPens } from '@topology/form-diagram'
// import { Topology, registerNode } from '@topology/core'
import imgDefault from '@/components/common/project/L5/services/img'
import {
  Tools,
  imageTemp2,
  rectangleImg2,
  rectangleImgAnchors2,
  disposeTopoOldData,
  onChangeAnimate,
  onChangeAnimateLine
} from '@/components/common/project/L5/services/canvas.js'
import { getTopology, setTopology, dealImg, topologyImg } from '../js/common'

import CanvasProps from '@/components/common/project/L5/CanvasProps'
import topologyTopTool from '@/components/common/project//L5//topologyTopTool'
import CanvasContextMenu from '@/components/common/project//L5/CanvasContextMenu'
import popDataMain from '@/components/common/project/popData/Main'
import popDataInfo from '@/components/common/project/popData/Info'
import alertTable from '@/components/common/project/popData/alertTable'
import assetTable from '@/components/common/project/popData/assetTable'
import endpointTable from '@/components/common/project/popData/endpointTable'
import topoTooltip from '@/components/common/project/L5/topoTooltip'
import { getMetricTypeValue, dealLegendAlias } from '../js/tools'
import bus from '../../../libs/bus'
import topologyMixin from '@/components/common/project/topologyMixin'

export default {
  name: 'diagram',
  mixins: [topologyMixin],
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      theme,
      title: this.$t('overall.uploadCustomPicture'),
      objChange: false, // project 变化 用于判断 init是否执行完成 执行完成 才可以执行下次变化
      chartDataInfo: {},
      topoPrevData: {}, // 预览数据
      imgInit: false, // 判断图片是否加载完成
      toolGroup: '基本形状',
      editFlag: true,
      tools: [
        ...Tools,
        {
          group: 'Diagram',
          children: [
            {
              name: 'rectangleImg2',
              icon: 'icon-rect',
              data: {
                text: 'rect',
                rect: {
                  width: 100,
                  height: 100
                },
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
                name: 'rectangleImg2',
                icon: '\ue730',
                iconFamily: 'nz-icon',
                iconName: 'nz-icon-rectangle1',
                iconColor: '#0c62e3'
              }
            },
            {
              name: 'rectangleImg2',
              icon: 'icon-rect',
              data: {
                text: 'rect',
                rect: {
                  width: 100,
                  height: 100
                },
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
                name: 'rectangleImg2',
                icon: '\ue731',
                iconFamily: 'nz-icon',
                iconName: 'nz-icon-EMAC1',
                iconColor: '#0c62e3'
              }
            },
            {
              name: 'rectangleImg2',
              icon: 'icon-rect',
              data: {
                text: 'rect',
                rect: {
                  width: 100,
                  height: 100
                },
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
                name: 'rectangleImg2',
                icon: '\ue62f',
                iconFamily: 'nz-icon',
                iconName: 'nz-icon-circle',
                iconColor: '#0c62e3'
              }
            }
          ]
        }
      ],
      props: {},
      topologyLoading: false,
      contextmenu: {
        left: null,
        top: null,
        bottom: null
      },
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1), 'YYYY-MM-DD HH:mm:ss'),
        bus.timeFormate(bus.getOffsetTimezoneData(), 'YYYY-MM-DD HH:mm:ss')
      ],
      topologyInfo: {
        fontSize: 14,
        align: 'left',
        fontColor: '#000000',
        opacity: 1,
        name: ''
      },
      saveData: {},
      oldTopologyData: '',
      redoIndex: 0,
      dataLength: 0,
      editTopologyFlag: false,
      searchTime: bus.getTimezontDateRange(),
      activeNames: [],
      topologyIndex: 0,
      iconArray: [],
      imgageLoading: false,
      imageSave: false,
      toolShow: {
        node: true,
        attr: true,
        topTool: true,
        nodeCord: [0, 0],
        attrCord: [0, 0],
        height: 500
      },
      dragFlag: true,
      modules: [],
      allModules: [],
      projectInfo: {
        title: '',
        id: '',
        remark: '',
        alertStat: [1, 2, 3],
        moduleMum: 6,
        loading: true
      },
      timer: null, // 处理project短时间呢频繁变更的定时器
      timer2: null, // 处理平移画布显示iconState的定时器
      timer3: null, // 处理tooltip的显示定时器
      nodesArr: [],
      notModuleIDArr: [],
      popData: [
        {
          top: '-40px',
          left: '-21px',
          className: 'nz-icon-endpoint',
          id: 'endpoint',
          title: this.$t('project.topology.endpoint')
        },
        { top: '-40px', left: '19px', className: 'nz-icon-asset', id: 'asset', title: this.$t('asset.asset') },
        { top: '-4px', left: '40px', className: '', id: 'other', title: '' },
        { top: '30px', left: '19px', className: '', id: 'other', title: '' },
        { top: '30px', left: '-21px', className: 'nz-icon-info-normal', id: 'info', title: this.$t('project.topology.info') },
        { top: '-4px', left: '-40px', className: 'nz-icon-gaojing', id: 'alert', title: this.$t('project.topology.alert') }
      ],
      popDataShow: {
        endpoint: false,
        asset: false,
        total: false,
        other: false,
        info: false,
        alert: false,
        main: false
      },
      moduleId: '',
      moduleName: '',
      tooltipPosition: {
        top: 0,
        left: 0,
        show: false,
        height: 250
      },
      chartData: {},
      chartGetData: [],
      penLineType: [
        { d: 'M5 19 a50,100 0 0,1 40,0', 'stroke-dasharray': '', name: this.$t('project.topology.curve'), id: 'curve', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 8 l20 0 l0 12 l20 0', 'stroke-dasharray': '', name: this.$t('project.topology.polyline'), id: 'polyline', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 14 l40 0', 'stroke-dasharray': '', name: this.$t('project.topology.line'), id: 'line', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' }
        // {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind', strokeColor: theme == 'light' ? 'black' : '#BEBEBE'},
      ],
      lineName: 'curve',
      cachesIndex: 0,
      projectInfoShow: false,
      projectAlertShow: false,
      previewShow: false,
      penId: undefined,
      penToolTipScale: 1,
      oldScale: 1,
      uploadPicShow: false,
      imgWidth: 0,
      imgHeight: 0,
      uploadPic: {
        name: '',
        unit: ''
      },
      unitArr: [],
      isPreview: false,
      previewData: ''
    }
  },
  components: {
    'canvas-props': CanvasProps,
    topologyTopTool,
    popDataMain,
    popDataInfo,
    alertTable,
    assetTable,
    endpointTable,
    topoTooltip,
    CanvasContextMenu
  },
  props: {
    topologyIndexF: {
      default: 0
    },
    obj: {},
    showTopTools: {
      type: Boolean,
      default: true
    },
    fromOverView: {
      type: Boolean,
      default: false
    },
    fromPrev: {
      type: Boolean,
      default: false
    },
    topoPrevDataS: {

    },
    topoData: {},
    chartInfo: {},
    fromChartBox: {
      type: Boolean,
      default: false
    },
    fromChart: {
      type: Boolean,
      default: false
    },
    fromTopologyDialog: {
      type: Boolean,
      default: false
    },
    isPanel: {
      type: Boolean,
      default: false
    },
    isScreen: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    topologyIndexF: {
      immediate: true,
      handler (n) {
        this.topologyIndex = n
      }
    },
    topoData: {
      immediate: true,
      deep: true,
      handler (n) {
        this.topologyLoading = true
        setTimeout(() => {
          this.init()
        }, 100)
      }
    }
  },
  computed: {
  },
  created () {
    if (process.client) {
      document.onclick = event => {
        this.contextmenu = {
          left: null,
          top: null,
          bottom: null
        }
      }
    }
  },
  mounted () {
    if (!this.fromOverView) { // 从overview来的 加载相应图片 优化首页加载速度
      this.addNodeInit()
    }
    document.getElementById('topology-canvas' + this.topologyIndexF).addEventListener('mousemove', this.canvasMove)
    window.addEventListener('resize', this.winResize)
    window.addEventListener('click', this.contextmenuNone)
  },
  methods: {
    init () {
      this.reload()
    },

    reload () {
      this.topologyLoading = true
      this.getTopologyData().then((data) => {
        this.openTopologyData(data).then(() => {
          this.initPens(data)
        })
      })
    },
    initPens (data) {
      // 获取对应的值 给节点 连线添加对应动画
      this.lineName = data.lineName ? data.lineName : this.lineName
      this.chartGetData = []
      const axiosArr = []
      const promiseArr = []
      const self = this
      const pensPromise = (pen, arr, index) => {
        return new Promise(function (resolve, reject) {
          Promise.all(arr).then((res) => {
            self.chartGetData[index].res = self.computeData(res, pen.data.aggregation, pen)
            self.setAnimation(pen, self.chartGetData[index].res)
            resolve()
          })
        })
      }
      const panelTime = localStorage.getItem('panelTime') ? JSON.parse(localStorage.getItem('panelTime')) : ['', '']
      const endTime = panelTime[1] || this.filterTime[1]
      const startTime = panelTime[0] || this.filterTime[0]
      const step = bus.getStep(startTime, endTime)
      data.pens && data.pens.forEach((item, index) => {
        this.chartGetData.push({ id: item.id, res: [] })
        let arr = []
        if (item.data.valueMappingShow) {
          arr = item.data.expressArr.map((ele) => {
            let query = ele
            if (!query) {
              return new Promise(resolve => {
                resolve({ data: '', status: 'no query' })
              })
            }
            query = encodeURIComponent(query)
            query += '&nullType=' + 'null'
            return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
          })
        }
        axiosArr.push({ item, arr })
        promiseArr.push(pensPromise(item, arr, index))
      })
      if (this.fromTopologyDialog && !this.isPreview) {
        setTimeout(() => {
          this.topologyLoading = false
          getTopology(this.topologyIndex).open(data)
          getTopology(this.topologyIndex).centerView()
          getTopology(this.topologyIndex).resize()
          this.editTopology()
        }, 100)
      } else {
        Promise.all(promiseArr).then((res) => {
          if (!getTopology(this.topologyIndex)) {
            return
          }
          getTopology(this.topologyIndex).open(data)
          getTopology(this.topologyIndex).lock(1)
          this.objChange = false
          let flag = false
          const position = {
            x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth,
            y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight
          }
          this.oldScale = getTopology(this.topologyIndex).data().scale
          getTopology(this.topologyIndex).data().pens.forEach(item => {
            if (flag) {
              return
            }
            if (item.x + item.width > position.x || item.y + item.height > position.y) {
              if (this.fromOverView) {
                getTopology(this.topologyIndex).fitView(20)
              }
              flag = true
            }
          })
          getTopology(this.topologyIndex).resize()
          getTopology(this.topologyIndex).centerView()
          if (this.fromChartBox || this.fromChart) { // 是否来自panel 和 chartBox
            getTopology(this.topologyIndex).fitView(20)
            if (this.chartInfo && this.chartInfo.param && this.chartInfo.param.lock) { // 判断节点 以及画布 是否可以拖动
              getTopology(this.topologyIndex).lock(2)
            }
          }
          this.topologyLoading = false
          this.penToolTipScale = getTopology(this.topologyIndex).data().scale
          setTimeout(() => {
            getTopology(this.topologyIndex).data().pens.forEach(item => {
              if (item.animatePlay) {
                item.stopAnimate()
                setTimeout(() => {
                  item.startAnimate()
                })
              }
            })
          })
          // if(this.fromPrev){
          //   getTopology(this.topologyIndex).scaleTo(data.scale/2)
          // }
          // getTopology(this.topologyIndex).fitView();
          this.oldTopologyData = JSON.stringify(getTopology(this.topologyIndex).data())
          this.getNodesArr()
        })
      }
    },
    dateChange () {
      // const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      // this.setSearchTime(nowTimeType.type, nowTimeType.value)
      this.searchTime = bus.getTimezontDateRange()
      this.filterTime[0] = bus.timeFormate(this.searchTime[0], 'YYYY-MM-DD HH:mm:ss')
      this.filterTime[1] = bus.timeFormate(this.searchTime[1], 'YYYY-MM-DD HH:mm:ss')
      this.reload()
    },
    setSearchTime (type, val) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), 'YYYY-MM-DD HH:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'YYYY-MM-DD HH:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
    },
    // 打开topology数据
    openTopologyData (data) {
      return new Promise((resolve, reject) => {
        if (!document.getElementById('topology-canvas' + this.topologyIndexF)) {
          return
        }
        data = this.$loadsh.cloneDeep(data)
        const canvasOptions = {
          rotateCursor: '/static/roteCursor.cur',
          disableEmptyLine: true,
          autoExpandDistance: 0,
          minScale: 0.2,
          scaleKey: -1,
          keydown: 1,
          gridSize: 40
        }
        canvasOptions.ruleColor = this.theme == 'light' ? '#4e4e4e' : '#f6f6f6'
        canvasOptions.gridColor = this.theme == 'light' ? '#4e4e4e' : '#BEBEBE'
        if (!getTopology(this.topologyIndex)) {
          let canvas = new Topology('topology-canvas' + this.topologyIndexF, canvasOptions)
          // canvas.open(data)
          setTopology(this.topologyIndex, canvas)
          canvas = null
        } else {
          // getTopology(this.topologyIndex).open(data)
        }
        this.topologyLoading = false
        getTopology(this.topologyIndex).register(flowPens())
        getTopology(this.topologyIndex).register(activityDiagram())
        getTopology(this.topologyIndex).register(classPens())
        getTopology(this.topologyIndex).register(sequencePens())
        getTopology(this.topologyIndex).registerCanvasDraw(sequencePensbyCtx())
        getTopology(this.topologyIndex).registerCanvasDraw(formPens())
        getTopology(this.topologyIndex).registerCanvasDraw({ rectangleImg2: rectangleImg2 })
        getTopology(this.topologyIndex).registerAnchors({ rectangleImg2: rectangleImgAnchors2 })
        getTopology(this.topologyIndex).on('translate', this.topTranslate) // 平移·
        getTopology(this.topologyIndex).on('active', this.pensActive) // 选中·
        getTopology(this.topologyIndex).on('scale', this.topoScale) // 缩放·
        getTopology(this.topologyIndex).on('translatePens', () => {}) // 移动画笔结束·
        getTopology(this.topologyIndex).on('translatingPens', () => {}) // 移动画笔进行中·
        getTopology(this.topologyIndex).on('enter', this.penEnter) // 移入画笔·
        getTopology(this.topologyIndex).on('leave', this.penLeave) // 移出画笔·
        getTopology(this.topologyIndex).on('add', this.appPen) // 添加新画笔·
        getTopology(this.topologyIndex).on('click', this.topoClick) // click画笔·
        getTopology(this.topologyIndex).store.options.autoAnchor = true
        resolve()
      })
    },
    // 获取topology数据
    getTopologyData () {
      return new Promise(resolve => {
        if (this.fromPrev) {
          resolve(this.topoPrevDataS)
        }
        const res = {
          data: {
            topo: this.previewData || JSON.parse(JSON.stringify(this.topoData))
          }
        }
        let data = res.data.topo
        // data = JSON.parse(localStorage.getItem('topoData'))
        if (!res.data.topo || !data.pens) {
          data = {
            bkColor: '#FFFFFF00',
            gridSize: 10,
            gridColor: '#ededed',
            lineWidth: 1,
            ruleColor: '#4e4e4e'
          }
          this.projectInfoShow = true
          this.projectAlertShow = true
          this.saveData = { ...data }
          this.topologyInfo.name = ''
          data.ruleColor = this.theme == 'light' ? '#4e4e4e' : '#BEBEBE'
          resolve(data)
        } else {
          data.ruleColor = this.theme == 'light' ? '#4e4e4e' : '#BEBEBE'
          if (data.data) {
            this.topologyInfo = {
              fontSize: data.data.fontSize,
              align: data.data.align,
              fontColor: data.data.fontColor,
              opacity: data.data.opacity,
              name: data.name
            }
          } else {
            this.topologyInfo = {
              fontSize: 14,
              align: 'left',
              fontColor: '#000000',
              opacity: 1,
              name: ''
            }
          }
          if (this.fromOverView || this.fromChartBox) { // 优化从首页来的加载速度
            const arr = data.pens.filter(item => !item.type)
            this.imgInit = false
            this.addNodeInit(arr)
          }
          const timer = setInterval(() => {
            if (!this.imgInit) {
              return
            }
            clearInterval(timer)
            for (let i = 0; i < data.pens.length; i++) {
              const line = data.pens[i]
              if (line.type === 1) {
                // if (!data.pens.find(item => item.id === line.from.id) || !data.pens.find(item => item.id === line.to.id)) {
                //   data.pens.splice(i, 1)
                //   i--
                // }
              }
            }
            data.pens.forEach(item => {
              if (item.type === 0 && item.data.imageId) {
                const img = this.iconArray.find(item1 => item1.id == item.data.imageId)
                item.image = img ? img.image : imgDefault
              }
              if (item.type === 0) {
                item.data.state = {}
                item.data.state.asset = false
                item.data.state.endpoint = false
                item.data.state.alert = false
              } else {
                item.data.state = {}
                item.data.state.asset = false
                item.data.state.endpoint = false
                item.data.state.alert = false
              }
            })

            if (!data.data) {
              this.projectInfoShow = true
              this.projectAlertShow = true
            } else if (!JSON.stringify(data.data.projectInfo)) {
              this.projectInfoShow = true
              this.projectAlertShow = true
            } else {
              this.projectInfoShow = data.data.projectInfo
              this.projectAlertShow = data.data.alertInfo
            }
            if (!data.bkImage) {
              data.bkImage = undefined
            }
            if (data.bkColor === '#FFFFFF') {
              data.bkColor = '#FFFFFF00'
            }
            if (!res.data.topo.newData) {
              data.pens = this.$loadsh.orderBy(data.pens, 'type', 'desc') // 先处理线 再处理点 因为新版本 将连线开始结束放在的 点上控制
              data.pens = data.pens.map(item => {
                if (item.type === 0) {
                  item = disposeTopoOldData(item, data.pens)
                } else {
                  // promiseArr.push({ type: 1 })
                  if (item.from) {
                    const find = data.pens.find(item1 => item1.id == item.from.id)
                    if (!find.connectedLines) {
                      find.connectedLines = []
                    }
                    find.connectedLines.push({
                      anchor: item.from.anchorIndex + '',
                      lineAnchor: item.id + '-0',
                      lineId: item.id
                    })
                  }
                  if (item.to) {
                    const find = data.pens.find(item1 => item1.id == item.to.id)
                    if (!find.connectedLines) {
                      find.connectedLines = []
                    }
                    find.connectedLines.push({
                      anchor: item.to.anchorIndex + '',
                      lineAnchor: item.id + '-1',
                      lineId: item.id
                    })
                  }
                  item = disposeTopoOldData(item, data.pens)
                }
                return item
              })
              data.pens = this.$loadsh.orderBy(data.pens, 'type', 'asc')
            }
            resolve(data)
          }, 100)
        }
      })
    },
    // 赋值动画
    setAnimation (pen, res, isOldData) { // 根据所有res的状态 赋值动画
      let maxLevel = 0
      if (res.length > 0) {
        res.forEach((response, innerPos) => {
          if (response.status !== 'success') {
            return
          }
          if (response.data.result) {
            response.data.result.forEach((queryItem, resIndex) => {
              pen.data.valueMapping.forEach((item, index) => {
                if (item.value === 'base') { return }
                if (queryItem.showValue > item.value) {
                  queryItem.level = item.level
                  if (maxLevel < item.level) {
                    maxLevel = item.level
                  }
                }
              })
            })
          }
        })
      }
      if (maxLevel !== 0) {
        if (pen.type === 0) { // 判断valueMapping 给相应的状态
          const selLevel = pen.data.valueMapping.find(item => item.level === maxLevel)
          if (selLevel) {
            pen.textColor = selLevel.color.text
            pen.background = selLevel.color.fill
            pen.color = selLevel.color.line
            pen.bkType = 0
          }
          onChangeAnimate(pen, selLevel.animateType, selLevel.color.fill, selLevel.color.line, selLevel.color.text)
        } else if (pen.type === 1) { // 判断valueMapping 给相应的状态
          const selLevel = pen.data.valueMapping.find(item => item.level === maxLevel)
          if (selLevel) {
            pen.animateColor = selLevel.color.fill
            pen.color = selLevel.color.line
            pen.lineAnimateType = selLevel.animateType
            pen.fontColor = selLevel.color.text
          }
          onChangeAnimateLine(pen, selLevel.animateType, isOldData)
        }
      } else {
        if (pen.type === 0 && pen.animatePlay) { // 判断valueMapping 给相应的状态
          onChangeAnimate(pen, pen.animateType)
        } else if (pen.type === 1 && pen.animatePlay) { // 判断valueMapping 给相应的状态
          onChangeAnimateLine(pen, pen.animateType, isOldData)
        }
      }
    },
    computeData (res, type, pen) { // 处理别名 以及 根据type显示对应的值
      if (res.length > 0) {
        res.forEach((response, innerPos) => {
          if (response.status !== 'success') {
            return
          }

          if (response.data.result) {
            response.data.result.forEach((queryItem, resIndex) => {
              // 图表中每条线的名字,后半部分
              let host = ''// up,
              if (queryItem.metric.__name__) {
                host = `${queryItem.metric.__name__}{`// up,
              }
              const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
              // 设置时间-数据格式对
              let dpsArr = []
              dpsArr = Object.entries(queryItem.values)// [ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
              dpsArr = dpsArr.map(item => {
                return [item[0], [item[1][0], Number(item[1][1])]]
              })
              // 判断是否有数据, && tagsArr.length > 0
              if (dpsArr.length) {
                tagsArr.forEach((tag, i) => {
                  if (tag !== '__name__') {
                    host += `${tag}="${queryItem.metric[tag]}",`
                  }
                })
                if (host.endsWith(',')) {
                  host = host.substr(0, host.length - 1)
                }
                if (queryItem.metric.__name__) {
                  host += '}'
                }
                if (!host || host === '') {
                  host = pen.data.expressArr[innerPos]
                }
                // 处理legend别名
                let alias = dealLegendAlias(host, pen.data.legends[innerPos])
                if (!alias || alias === '') {
                  alias = host
                }
                queryItem.legend = { name: host + '-' + pen.data.legends[innerPos] + '-' + resIndex, alias: alias }
                queryItem.showValue = getMetricTypeValue(queryItem.values, type)
                // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
              }
            })
          }
        })
      }
      return res
    },
    // Severity Label
    returnSeverityLabel (key) {
      return this.$t(this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label)
    },
    getNodesArr () {
      const arr = []
      if (!getTopology(this.topologyIndex)) return
      this.nodesArr = getTopology(this.topologyIndex).data().pens.filter(item => {
        if (!item.data) {
          item.data = {
            moduleId: '',
            moduleName: '',
            show: false,
            error: false,
            expressArr: [],
            state: {}
          }
        }
        return item.type === 0
      })
      // 打开动画 是否更新顶部图标
      this.nodesArr = JSON.parse(JSON.stringify(this.nodesArr))
    },

    modelTopClick (item, index) {

    },
    // 摘除已选择的module
    modulesDiff (data) {
      this.modules = this.allModules
      if (getTopology(this.topologyIndex).data().pens) {
        getTopology(this.topologyIndex).data().pens.forEach(item => {
          if (item.type == 0) {
            this.modules = this.modules.filter(item1 => item.data.moduleId !== item1.id)
          }
        })
      }
      if (data && data.data && data.data.moduleId) {
        this.modules.unshift({ id: data.data.moduleId, name: data.data.moduleName })
      }
    },

    // 显示module的工具
    showNodeTools (index, pen) {
      this.nodesArr.forEach((item, i) => {
        item.data.show = i === index
      })
    },

    // 具体内容点击
    nodeTools (node, tool) {
      this.moduleId = node.data.moduleId
      this.moduleName = node.data.moduleName
      if (tool.id === 'total') {
        this.popDataShowUpdate('', false, node)
        return
      }
      setTimeout(() => {
        this.popDataShowUpdate(tool.id, false, node)
      }, 100)
    },

    popDataShowUpdate (key, flag, node) { // key 显示对应的弹窗 flag是否不显示工具栏
      this.popDataShow = {
        endpoint: false,
        asset: false,
        total: false,
        other: false,
        info: false,
        alert: false,
        main: false
      }
      if (key === 'total') {
        this.chartDataInfo = { ...node.data, ...this.chartGetData.find(item => item.id === node.id) }
      }
      this.$nextTick(() => {
        this.popDataShow[key] = true
      })
      if (flag) { // 处理关闭后 缩放后显示工具按钮的问题
        this.moduleId = ''
        this.showNodeTools('')
      }
      if (key === 'asset' || key === 'alert' || key === 'endpoint') {
        this.showNodeTools('')
      }
    },

    /* topology 方法 */
    /* topology 方法 */
    onDrag (event, node) {
      console.log(event, node)
      this.dragFlag = false
      const timer = setTimeout(() => {
        this.dragFlag = true
        clearTimeout(timer)
      }, 100)
      event.dataTransfer.setData('Text', JSON.stringify({ ...node.data, data: { imageId: node.data.imageId } }))
    },
    dragFlagChange (node) {
      console.log(node)
      getTopology(this.topologyIndex).addPen(
        {
          ...node.data,
          ...node.data.rect,
          x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth / 2 - 50,
          y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight / 2 - 50,
          data: { imageId: node.data.imageId }
        })
      const timer = setTimeout(() => {
        this.dragFlag = true
        clearTimeout(timer)
      }, 100)
    },
    getLocked (data) {
      let locked = true
      if (data.nodes && data.nodes.length) {
        for (const item of data.nodes) {
          if (!item.locked) {
            locked = false
            break
          }
        }
      }
      if (locked && data.lines) {
        for (const item of data.lines) {
          if (!item.locked) {
            locked = false
            break
          }
        }
      }

      return locked
    },

    onUpdateProps (node) {
      getTopology(this.topologyIndex).setValue(node)
    },

    handleAvatarSuccess () {

    },
    beforeAvatarUpload (file, fileList) {
      const this_ = this
      const isJPG = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png')
      const isLt2M = (file.size / 1024 / 1024) < 2
      if (!isJPG) {
        this.$message.error(this_.$t('project.topology.imgFormat'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      if (!isLt2M) {
        this.$message.error(this_.$t('project.topology.imgSize'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      const isSize = new Promise(function (resolve, reject) {
        const width = 0
        const height = 0
        const _URL = window.URL || window.webkitURL
        const img = new Image()
        img.onload = function () {
          const valid = img.width > width && img.height > height
          this_.imgWidth = img.width
          this_.imgHeight = img.height
          valid ? resolve() : reject()
        }
        img.src = _URL.createObjectURL(file.raw)
      }).then(() => {
        if (isJPG) {
          this.file = file.raw
        }
        return file.raw
      }, () => {
        this.$message.error(this_.$t('project.topology.imgMeasure'))
        return Promise.reject()
      })
      return false
    },

    toolShowChange (attr) {
      this.toolShow[attr] = !this.toolShow[attr]
    },
    /* topology 方法 */
    end (v) {

    },
    /* tools 方法 */

    imgUpload () {
      const this_ = this
      if (!this.imageSave) {
        this.imageSave = true
      }
      if (!this.uploadPic.unit) {
        this.$message({
          message: this_.$t('project.topology.unitError'),
          type: 'error'
        })
        return
      }
      if (!this.file) {
        this.$message({
          message: this_.$t('project.topology.imgError'),
          type: 'error'
        })
        return
      }
      this.upload()
    },
    upload () {
      const form = new FormData()
      form.append('file', this.file)
      if (this.uploadPic.name) {
        form.append('name', this.uploadPic.name)
      } else {
        form.append('name', this.file.name.substring(0, this.file.name.lastIndexOf('.')))
      }
      form.append('unit', this.uploadPic.unit)
      form.append('width', this.imgWidth)
      form.append('height', this.imgHeight)
      this.$post('monitor/project/topo/icon', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        this.imageSave = false
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.uploadPicShow = false
          this.$get('monitor/project/topo/icon', { id: res.data.id }).then(iconInfo => {
            dealImg(`monitor/project/topo/icon/${res.data.id}/1`, res.data.id).then((data, header) => {
              const group = this.tools.find(tool => tool.group === this.uploadPic.unit)
              this.iconArray.push({
                ...iconInfo.data.list[0],
                image: data.data
              })
              if (group) {
                group.children.push({
                  ...imageTemp2,
                  data: {
                    ...imageTemp2.data,
                    text: res.data.imageName,
                    image: data.data,
                    imageId: res.data.id,
                    unit: this.uploadPic.unit
                  }
                })
              } else {
                this.tools.push({
                  group: this.uploadPic.unit,
                  children: [{
                    ...imageTemp2,
                    data: {
                      ...imageTemp2.data,
                      text: res.data.imageName,
                      image: data.data,
                      imageId: res.data.id,
                      unit: this.uploadPic.unit
                    }
                  }]
                })
              }
            })
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    delImg (item) {
      this.$delete('monitor/project/topo/icon?ids=' + item.data.imageId).then(res => {
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          this.addNodeInit()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    delCollpseTitle (item) {
      this.$delete('monitor/project/topo/iconUnit?unit=' + item.group).then(res => {
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          this.addNodeInit()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    tooltipDelete (item) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.delImg(item)
      })
    },
    tooltipDeleteTitle (item) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.delCollpseTitle(item)
      })
    },
    addNodeInit (imgidList) {
      if (!this.fromOverView) {
        this.$get('monitor/project/topo/icon').then(res => {
          this.imgageLoading = true
          this.tools = [...Tools, {
            group: 'Diagram',
            children: [
              {
                name: 'rectangleImg2',
                icon: 'icon-rect',
                data: {
                  text: 'rect',
                  width: 30,
                  height: 20,
                  type: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                  name: 'rectangleImg2',
                  icon: '\ue730',
                  iconFamily: 'nz-icon',
                  iconName: 'nz-icon-rectangle1',
                  iconColor: '#0c62e3'
                }
              },
              {
                name: 'rectangleImg2',
                icon: 'icon-rect',
                data: {
                  text: 'rect',
                  width: 30,
                  height: 30,
                  type: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                  name: 'rectangleImg2',
                  icon: '\ue731',
                  iconFamily: 'nz-icon',
                  iconName: 'nz-icon-EMAC1',
                  iconColor: '#0c62e3'
                }
              },
              {
                name: 'rectangleImg2',
                icon: 'icon-rect',
                data: {
                  text: 'rect',
                  width: 100,
                  height: 100,
                  type: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                  name: 'rectangleImg2',
                  icon: '\ue62f',
                  iconFamily: 'nz-icon',
                  iconName: 'nz-icon-circle',
                  iconColor: '#0c62e3'
                }
              }
            ]
          }]
          const imgArr = []
          const promiseArr = []
          res.data.list.forEach((item, index) => {
            item.imageName = item.name
            delete item.name
            promiseArr.push(topologyImg['img' + item.id] || dealImg(`monitor/project/topo/icon/${item.id}/1`, item.id))
            imgArr.push({ ...item })
          })
          Promise.all(promiseArr).then((res2, header) => {
            this.iconArray = [...res.data.list]
            this.iconArray.forEach((item, index) => {
              item.image = res2[index].data
              const group = this.tools.find(tool => tool.group === item.unit)
              if (group) {
                group.children.push({
                  ...imageTemp2,
                  data: {
                    ...imageTemp2.data,
                    text: item.imageName,
                    image: res2[index].data,
                    imageId: item.id,
                    unit: item.unit,
                    rect: {
                      width: res2[index].width === -1 ? 100 : res2[index].width,
                      height: res2[index].height === -1 ? 100 : res2[index].height
                    }
                  }
                })
              } else {
                this.tools.push({
                  group: item.unit,
                  children: [{
                    ...imageTemp2,
                    data: {
                      ...imageTemp2.data,
                      text: item.imageName,
                      image: res2[index].data,
                      imageId: item.id,
                      unit: item.unit,
                      rect: {
                        width: res2[index].width === -1 ? 100 : res2[index].width,
                        height: res2[index].height === -1 ? 100 : res2[index].height
                      }
                    }
                  }]
                })
              }
            })

            this.imgInit = true
            this.imgageLoading = false
          })
        })
      } else {
        this.imgageLoading = true
        this.$get('monitor/project/topo/icon').then((imageAllId) => {
          const promiseArr = []
          if (!imageAllId || !imageAllId.data) {
            return
          }
          imgidList.forEach((item, index) => {
            if (item.data.imageId && imageAllId.data.list.find(image => item.data.imageId === image.id)) {
              promiseArr.push(topologyImg['img' + item.data.imageId] || dealImg(`monitor/project/topo/icon/${item.data.imageId}/1`, item.data.imageId))
            } else if (item.data.imageId) {
              promiseArr.push(imgDefault)
            } else {
              promiseArr.push('')
            }
          })
          Promise.all(promiseArr).then((res2) => {
            this.iconArray = imgidList.map(item => {
              return {
                id: item.data.imageId
              }
            })
            this.iconArray.forEach((item, index) => {
              if (item.id) {
                item.image = res2[index].data
              }
            })
            this.imgInit = true
            this.imgageLoading = false
          })
        })
      }
    },

    delPen (obj) { // 删除元素
      getTopology(this.topologyIndex).delete(obj)
      this.props = {
        node: null,
        line: null,
        multi: false,
        nodes: null,
        locked: false,
        pen: null,
        pens: null
      }
    },

    editTopology (val) {
      this.editTopologyFlag = true
      setTimeout(() => {
        getTopology(this.topologyIndex).lock(0)
        getTopology(this.topologyIndex).data().pens.forEach((item, index) => { // 停止动画 以及赋值默认data
          if (item.animatePlay) {
            item.stopAnimate()
          }
          if (!item.data.expressArr.length) {
            item.data.expressArr = ['']
            item.data.legends = ['']
          }
          if (!item.data.expressAllArr.length) {
            item.data.expressAllArr = ['']
            item.data.legendsAll = ['']
          }
          item.animateType = item.data.animateType
          if (item.type === 0) {
            item.fillStyle = item.data.fillStyle
            if (item.iconFamily) {
              item.fillStyle = 'transparent'
              item.iconColor = item.data.iconColor || item.data.fillStyle || '#bae7ff'
            }
            item.strokeStyle = item.data.strokeStyle
            item.animatePlay = false
            item.fontColor = item.data.fontColor || '#222222'
            item.gradientType = item.data.gradientType ? item.data.gradientType : 0
            if (!item.data.gradientColor) {
              item.data.gradientType = 0
              item.data.gradientColor = '#bae7ff'
            }
            if (item.data.gradientType === 0) {
              item.bkType = 0
            } else {
              item.bkType = 1
            }
          } else if (item.type === 1) {
            item.animateColor = item.data.animateColor
            item.strokeStyle = item.data.strokeStyle
            item.arrowColor = item.data.arrowColor
            item.fromArrowColor = item.data.arrowColor
            item.toArrowColor = item.data.arrowColor
            item.animatePlay = false
            item.fontColor = item.data.fontColor || '#22222'
          }
        })
        getTopology(this.topologyIndex).caches = {
          index: 0,
          list: [JSON.parse(JSON.stringify(getTopology(this.topologyIndex).data()))]
        }
        getTopology(this.topologyIndex).resize()
        getTopology(this.topologyIndex).centerView()
      }, 100)
    },

    animateCanvas () {
      getTopology(this.topologyIndex).render()
      getTopology(this.topologyIndex).animate()
    },

    refreshTopology () {
      // canvas.open()
    },

    dropdownClick () {

    },

    changeTopologyOpt (val, key) {
      // this.topologyData.data[key]=this.colorRGBtoHex(val);
      // getTopology(this.index).data[key]=val;
      // getTopology(this.index).render();
      const dataOption = getTopology(this.topologyIndex).data()
      dataOption[key] = this.lineName
      getTopology(this.topologyIndex).render()
    },
    notModuleIDArrChange (id) {
      this.notModuleIDArr = this.notModuleIDArr.filter(item => item.id !== id)
    },
    // 保存
    saveTopology () {
      this.previewData = ''
      this.isPreview = false
      this.editTopologyFlag = true
      this.showNoData = false
      const topologyData = getTopology(this.topologyIndex).data()
      topologyData.newData = 1
      this.editTopologyFlag = false
      topologyData.rule = false
      topologyData.grid = false
      topologyData.gridSize = 10
      topologyData.pens.forEach(item => {
        item.animatePlay = item.data.animatePlay
        item.data.animateType = item.animateType
        if (item.type === 0 && JSON.stringify(item.data.imageId)) {
          item.image = ''
          item.animateFrames = []
          item.animateReady = null
          delete item.img
          delete item.lastImage
        }
        item.data.expressArr = item.data.expressArr.filter((expression, i) => {
          if (!expression) {
            item.data.legends.splice(i, 1)
            return false
          } else {
            return true
          }
        })
        item.data.expressAllArr = item.data.expressAllArr.filter((expression, i) => {
          if (!expression) {
            item.data.legendsAll.splice(i, 1)
            return false
          } else {
            return true
          }
        })
      })
      if (this.penToolTipScale == getTopology(this.topologyIndex).data().scale) {
        getTopology(this.topologyIndex).data().scale = this.oldScale
      }
      this.$emit('change', false, topologyData)
    },
    // 取消
    cancelTopology () {
      this.editTopologyFlag = false
      this.$nextTick(() => {
        this.$emit('change', false)
      })
      this.reload()
    },
    // 预览
    previewTopology () {
      const topologyData = getTopology(this.topologyIndex).data()
      this.previewData = topologyData
      this.isPreview = true
      this.editTopologyFlag = false
      topologyData.rule = false
      topologyData.grid = false
      topologyData.gridSize = 10
      topologyData.pens.forEach(item => {
        item.animatePlay = item.data.animatePlay
        item.data.animateType = item.animateType
        if (item.type === 0 && JSON.stringify(item.data.imageId)) {
          item.animateFrames = []
          item.animateReady = null
          delete item.img
          delete item.lastImage
        }
        item.data.expressArr = item.data.expressArr.filter((expression, i) => {
          if (!expression) {
            item.data.legends.splice(i, 1)
            return false
          } else {
            return true
          }
        })
        item.data.expressAllArr = item.data.expressAllArr.filter((expression, i) => {
          if (!expression) {
            item.data.legendsAll.splice(i, 1)
            return false
          } else {
            return true
          }
        })
      })
      if (this.penToolTipScale == getTopology(this.topologyIndex).data().scale) {
        getTopology(this.topologyIndex).data().scale = this.oldScale
      }
      this.$nextTick(() => {
        this.previewData = topologyData
        getTopology(this.topologyIndex).lock(1)
        const dom = document.getElementById('topology-canvas' + this.topologyIndexF)
        const domRect = dom ? dom.getBoundingClientRect() : {}
        getTopology(this.topologyIndex).canvasPos = domRect
        this.initPens(topologyData)
        // this.reload()
      })
    },
    previewExit () { // 继续编辑
      this.isPreview = false
      this.editTopology()
    },
    // 联动 project
    changeProjectTitle () {
      const data = getTopology(this.topologyIndex).data()
      this.topologyInfo = {
        fontSize: data.data.fontSize,
        align: data.data.align,
        fontColor: data.data.fontColor,
        opacity: data.data.opacity,
        name: data.name
      }
    },
    /* tools 方法 */

    winResize () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        const dom = document.getElementById('topology-canvas' + this.topologyIndex)
        const domRect = dom ? dom.getBoundingClientRect() : {}
        getTopology(this.topologyIndex).canvasPos = domRect
        if (this.fromOverView) {
          getTopology(this.topologyIndex).open(this.oldTopologyData)
        }
        let flag = false
        const position = {
          x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth,
          y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight
        }
        getTopology(this.topologyIndex) && getTopology(this.topologyIndex).data().pens.forEach(item => {
          if (flag) {
            return
          }
          if (item.x + item.width > position.x || item.y + item.height > position.y) {
            // getTopology(this.topologyIndex).fitView(20)
            flag = true
          }
        })
        getTopology(this.topologyIndex).resize()
        if (this.isPanel) {
          getTopology(this.topologyIndex).fitView()
        } else {
          getTopology(this.topologyIndex).centerView()
        }
        clearTimeout(this.timer)
        this.timer = null
        // this.getNodesArr()
      }, 100)
    },
    contextmenuNone () {
      this.contextmenu = {
        left: null,
        top: null,
        bottom: null
      }
    },
    canvasMove (e) { // 画布上的移动 确定tooltip的位置
      if (this.tooltipPosition.show) {
        return
      }
      window.ePosition = e
    },
    tooltipOver () {
      clearTimeout(this.timer3)
      this.timer3 = null
    },
    tooltipOut () {
      this.timer3 = setTimeout(() => {
        this.tooltipPosition.show = false
        this.timer3 = null
      }, 50)
    },
    nodeDefaultWidth (nodeName) {
      switch (nodeName) {
        case 'myCube':
        case 'rectangleImg2':
          return 0
        default:
          return 1
      }
    },
    previewBeforeClose (done) {
      this.$emit('changeTopologyIndexF')
      done()
    },
    selpopIs (pen, state) { // 判断是否有图表
      let flag = true
      if (state.id === 'other') {
        flag = false
      }
      if (state.id === 'total' && pen.data.expressArr.length === 0) {
        flag = false
      }
      return flag
    },
    modelPopError (pen, state) {
      if (item.id === 'asset' && this.activeModelItem.assetError) {
        return true
      }
      if (item.id === 'alert' && this.activeModelItem.alertError) {
        return true
      }
      if (item.id === 'endpoint' && this.activeModelItem.endpointError) {
        return true
      }
      return false
    },
    redoIndexChange (index) {
      this.redoIndex = index
    },
    querySearch (queryString, cb) {
      const restaurants = this.unitArr
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    uploadPicChange () {
      this.unitArr = []
      this.tools.forEach((item, index) => {
        if (index > 0) {
          this.unitArr.push({
            value: item.group
          })
        }
      })
      this.uploadPic.name = ''
      this.uploadPic.unit = ''
      this.file = null
      this.uploadPicShow = true
    },
    zoomMap (num) {
      getTopology(this.topologyIndex).scale(getTopology(this.topologyIndex).data().scale + num)
    },
    penToBottom () {
      getTopology(this.topologyIndex).bottom()
    },
    onContextMenu (event) {
      event.preventDefault()
      event.stopPropagation()

      if (event.clientY + 360 < document.body.clientHeight) {
        this.contextmenu = {
          left: event.clientX + 'px',
          top: event.clientY + 'px'
        }
      } else {
        this.contextmenu = {
          left: event.clientX + 'px',
          bottom: document.body.clientHeight - event.clientY + 'px'
        }
      }
    }
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.timer4) {
      clearInterval(this.timer4)
      this.timer4 = null
    }
    if (getTopology(this.topologyIndex)) {
      getTopology(this.topologyIndex).off('translate', this.topTranslate) // 平移·
      getTopology(this.topologyIndex).off('active', this.pensActive) // 选中·
      getTopology(this.topologyIndex).off('scale', this.topoScale) // 缩放·
      getTopology(this.topologyIndex).off('translatePens', () => {}) // 移动画笔结束·
      getTopology(this.topologyIndex).off('translatingPens', () => {}) // 移动画笔进行中·
      getTopology(this.topologyIndex).off('enter', this.penEnter) // 移入画笔·
      getTopology(this.topologyIndex).off('leave', this.penLeave) // 移出画笔·
      getTopology(this.topologyIndex).off('add', this.appPen) // 添加新画笔·
      getTopology(this.topologyIndex).off('click', this.topoClick) // click画笔·
      getTopology(this.topologyIndex).destroy()
      const StoreData = le5leStore.get()
      Object.keys(StoreData).forEach(key => {
        const id = key.split('-')[0]
        if (getTopology(this.topologyIndex).id == id) {
          le5leStore.set(key, null)
          delete StoreData[key]
        }
      })
      Object.keys(getTopology(this.topologyIndex)).forEach(key => {
        getTopology(this.topologyIndex)[key] = null
      })
      setTopology(this.topologyIndex, null)
    }
    if (document.getElementById('topology-canvas' + this.topologyIndexF)) {
      document.getElementById('topology-canvas' + this.topologyIndexF).removeEventListener('mousemove', this.canvasMove)
    }
    window.removeEventListener('resize', this.winResize)
    window.removeEventListener('click', this.contextmenuNone)
  }
}
</script>
