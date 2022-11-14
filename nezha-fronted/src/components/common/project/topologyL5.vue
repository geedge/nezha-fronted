<style>
  @import "./L5/css/iconfont.css";
  @import "./L5/css/props.css";
</style>
<template>
  <div class="project-box list-page" v-my-loading="topologyLoading">
    <div class="main-list" :style="{height: fromOverView ?'100%' : 'calc(100% - 30px)'}">
      <div class="main-container" :class="fromOverView?'from-overview':'from-project'">
        <div v-if="(editTopologyFlag || isPreview)&&!fromChart" class="edit-topologyLine top-tools" style="padding-left: 20px;width: calc(100% - 40px);display: inline-block">
          <!--工具栏-->
          <span v-if="!isPreview" class="project-topology-tool">
          <el-dropdown trigger="click" size="small" placement="bottom-start">
            <span class="el-dropdown-title"><i class="iconfont icon-cube"></i> <i
              class="nz-icon nz-icon-arrow-down"></i></span>
            <el-dropdown-menu slot="dropdown" @click="dropdownClick" class="right-box-select-top right-public-box-dropdown-top">
              <div style="height: 450px"  v-my-loading="imgageLoading">
                <el-card shadow="hover" style="height:420px;width:284px;overflow-y: auto"
                         class="project-topology-add-node">
                <!--<div class="drag-header">——</div>-->
                <el-collapse v-model="activeNames" v-for="(item, index) in tools" :key="index" class="collapse-box">
                  <el-collapse-item :title="item.group" :name="item.group">
                    <template slot="title">
                      <div style="display: flex;width: 100%;">
                        <i class="nz-icon nz-icon-arrow-right"></i> <div style="flex: 1">{{item.group}}</div> <i class="nz-icon nz-icon-delete title-delete" @click="tooltipDeleteTitle(item)" :title="$t('overall.delete')"></i>
                      </div>
                    </template>
                    <div v-for="(btn, i) in item.children" :key="'info2'+'-'+index+'-'+i" class="buttons">
                      <a
                        :key="i"
                        :title="btn.data.text"
                        :draggable="btn.data"
                        @dragstart.stop="onDrag($event, btn)"
                        @mousedown="dragFlag=false"
                        @mouseup="dragFlagChange(btn)"
                        class="btn"
                      >
                        <img :src="btn.data.image" v-if="btn.data.image">
                        <i v-else :class="`iconfont ${btn.icon}`"></i>
                      </a>
                      <i v-if="item.group!=='General'" class="delIcon nz-icon nz-icon-delete" @click="tooltipDelete(btn)"></i>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
                <div class="upload-pic-box" @click="uploadPicChange">
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
                         popper-class="right-box-select-top"
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
          <button @click="previewTopology" v-if="!isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light"
                  style="margin-right: 20px"
          >
             {{$t('overall.preview')}}
           </button>
            <button v-if="isPreview" class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="previewExit"
                    style="margin-right: 20px"
            >
             {{$t('project.topology.previewExit')}}
           </button>
           <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="saveTopology"
                   :disabled="prevent_opt.save"
                   :class="{'nz-btn-disabled':prevent_opt.save}"
                   style="margin-right: 20px">
             {{$t('overall.save')}}
           </button>
           <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-right: 20px" @click="cancelTopology">
             {{$t('project.topology.exit')}}
           </button>
         </span>
        </div>
        <div v-if="(!editTopologyFlag&&!fromOverView) && !isPreview" class="top-tools" style="padding-left: 10px">
          <div>{{obj.name}}</div>
          <div v-if="!editTopologyFlag&&!fromPrev&&!fromOverView" class="top-tool-right">
            <pick-time
              v-show="!editTopologyFlag"
              ref="pickTime"
              v-model="searchTime"
              :refresh-data-func="dateChange"
              :showTimePicker="false"
              :use-chart-unit="false"
              class="pickTime margin-r-10">
            </pick-time>
            <button v-has="'project_edit'" class="top-tool-btn margin-r-10" type="button" @click="editTopology" :title="$t('overall.edit')">
              <i class="nz-icon nz-icon-edit"></i>
            </button>
            <button class="top-tool-btn" type="button" @click="changeScreen" :title="topoScreen? $t('dashboard.screen.exit') : $t('dashboard.screen')">
              <i :class="topoScreen?'nz-icon-exit-full-screen':'nz-icon-full-screen'" class="nz-icon"></i>
            </button>
          </div>
        </div>
        <div class="nz-table-list">
          <!--悬浮network部分-->
          <div class="network-info">
            <div v-if="popDataShow.main">
              <popDataMain :moduleId="moduleId" :projectId="projectInfo.id"></popDataMain>
            </div>
            <div v-if="popDataShow.info">
              <popDataInfo :moduleId="moduleId" :projectId="projectInfo.id"></popDataInfo>
            </div>
          </div>
          <div :class="['page topo-page',fromOverView?'overview-page':'']" :style="{
            border: fromOverView ? 'none' :`1px solid $--color-text-regular`
          }">
            <!--画布部分-->
            <div :id="'topology-canvas' + topologyIndexF" :ref="'topology-canvas'+ topologyIndexF" class="full" @contextmenu="onContextMenu($event)"></div>
            <!--设置属性-->
            <div v-if="editTopologyFlag&&toolShow.attr && !fromOverView" class="props">
              <canvas-props ref="CanvasProps"
                            :index="topologyIndex"
                            :imgArr = 'tools'
                            :modules="modules"
                            :selection.sync="props"
                            @animate="animateCanvas"
                            @change="onUpdateProps"
                            @changeProjectTitle="changeProjectTitle"
                            @del="delPen"
                            @notModuleIDArrChange="notModuleIDArrChange">
              </canvas-props>
            </div>
            <div class="context-menu" v-if="contextmenu.left && editTopologyFlag && !fromOverView" :style="this.contextmenu">
              <CanvasContextMenu :index="topologyIndexF" :props.sync="props"></CanvasContextMenu>
            </div>
            <!--所有节点上的小图标-->
            <div v-for="(item,index) in nodesArr" v-if="!editTopologyFlag&&!fromPrev"
                 :key="index"
                 v-show="(item.y + offsetY  - (48*(fromOverView?penToolTipScale:1)) > -10) && (item.x + item.width/2 + offsetX - (24*(fromOverView?penToolTipScale:1)) > - 10)"
                 :style="{position: 'absolute',top:item.y + offsetY  - (48*(fromOverView?penToolTipScale:1))+'px',left:item.x + item.width/2 + offsetX - (24*(fromOverView?penToolTipScale:1)) +'px',transform:'scale('+(fromOverView?penToolTipScale:1)+')'}"
                 class="network-pop"
            >

              <i
                :ref="'modelTopId'+index"
                :class="{'nz-icon':true, 'nz-icon-shuidi':true,'model-error':item.data.state&&item.data.state.error&&!item.data.show,'model-error-active':item.data.state&&item.data.state.error&&item.data.show}"
                @click="showNodeTools(index,item)"
              >
                <i style="cursor: pointer" class="nz-icon nz-icon-model"></i>
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
             top:item.y + offsetY - 10 +'px',
             left:item.x + offsetX - 10+'px',
             transform:'scale('+(fromOverView?penToolTipScale:1)+')',
           }"
            >
              <div :style="{top:0,left:0,width:item.width+15+'px',height:0}" class="module-rect-top"></div>
              <div :style="{top:0,left:item.width+15+'px',width:0,height:item.height+15+'px'}" class="module-rect-right"></div>
              <div :style="{top:item.height+15 +'px',left:0,width:item.width+15+'px',height:0}" class="module-rect-bottom"></div>
              <div :style="{top:0,left:0,width:0,height:item.height+15+'px'}" class="module-rect-left"></div>
            </div>
            <!--节点连线相关的 tooltip-->
            <div v-if="tooltipPosition.show&&!editTopologyFlag"
                 ref="topoTooltip"
                 :style="{position:'absolute',top:tooltipPosition.top+'px',left:tooltipPosition.left+'px','z-index':10,height:tooltipPosition.height+'px'}"
                 @mouseout="tooltipOut"
                 @mouseover="tooltipOver"
            >
              <topoTooltip  class="nz-tooltip-bac" :chartDataParent="chartData" :filterTime="filterTime"/>
            </div>
            <div v-show="showNoData" class="topo-noData">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#nz-icon-no-data-project"></use>
              </svg>
              <div class="content">No data</div>
            </div>
          </div>
          <!--endpoint-->
          <transition name="right-box">
            <endpointTable v-if="popDataShow.endpoint" :moduleId="moduleId" :moduleName="moduleName" :projectId="projectInfo.id"
                           @close="popDataShowUpdate('',true)">endpoint
            </endpointTable>
          </transition>
          <div v-if="!fromOverView&&!editTopologyFlag&&!fromPrev" class="right-bottom-zoom">
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
            popper-class="right-box-select-top right-public-box-dropdown-top"
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
               <button class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-right: 20px" @click="uploadPicShow=false">
             {{$t('project.topology.exit')}}
           </button>

              <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="imgUpload" :disabled="prevent_opt.save"
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
  imageTemp,
  rectangleImg,
  rectangleImgAnchors,
  disposeTopoOldData,
  // myShape,
  // myAnchors,
  // myIconRect,
  // myTextRect,
  onChangeAnimate,
  onChangeAnimateLine
  // myCubec,
  // myCubeAnchors
} from './L5/services/canvas.js'
import { getTopology, setTopology, dealImg, topologyImg } from '../js/common'

import CanvasProps from './L5/CanvasProps'
import topologyTopTool from './L5//topologyTopTool'
import CanvasContextMenu from './L5/CanvasContextMenu'
import popDataMain from './popData/Main'
import popDataInfo from './popData/Info'
import alertTable from './popData/alertTable'
import assetTable from './popData/assetTable'
import endpointTable from './popData/endpointTable'
import topoTooltip from './L5/topoTooltip'
import { getMetricTypeValue, dealLegendAlias } from '../js/tools'
import bus from '../../../libs/bus'
import topologyMixin from '@/components/common/project/topologyMixin'
// 注册到画布

// registerNode('rectangleImg', myShape, myAnchors, myIconRect, myTextRect)
// registerNode('myCube', myCubec, myCubeAnchors, null, null)

export default {
  name: 'topologyL5',
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
      tools: [...Tools],
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
      showNoData: false,
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
      timer4: null,
      nodesArr: [],
      notModuleIDArr: [],
      popData: [
        {
          top: '-41px',
          left: '-23px',
          className: 'nz-icon-endpoint',
          id: 'endpoint',
          title: this.$t('project.topology.endpoint')
        },
        { top: '-41px', left: '22px', className: 'nz-icon-asset', id: 'asset', title: this.$t('asset.asset') },
        { top: '-2px', left: '45px', className: '', id: 'other', title: '' },
        { top: '37px', left: '22px', className: '', id: 'other', title: '' },
        { top: '37px', left: '-23px', className: 'nz-icon-info-normal', id: 'info', title: this.$t('project.topology.info') },
        { top: '-2px', left: '-45px', className: 'nz-icon-gaojing', id: 'alert', title: this.$t('project.topology.alert') }
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
      topoScreenState: '', // 记录编辑前的 $store.ShowTopoScreen 结束编辑后返回
      isPreview: false,
      previewData: '',
      offsetX: 0,
      offsetY: 0,
      prevData: null
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
    fromChart: {
      type: Boolean,
      default: false
    },
    topoPrevDataS: {

    }
  },
  watch: {
    topologyIndexF: {
      immediate: true,
      handler (n) {
        this.topologyIndex = n
      }
    },
    obj: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n && n.id) {
          // if (getTopology(this.topologyIndex)) {
          //   getTopology(this.topologyIndex).destroy()
          //   setTopology(this.topologyIndex, null)
          // }
          if (!this.objChange) {
            this.editTopologyFlag = false
            this.topologyLoading = true
            this.projectInfoShow = false
            this.projectAlertShow = false
            if (n.id) {
              this.getProjectData(n)
            }
            this.topologyLoading = true
            this.init()
            this.timer = null
            this.objChange = true
          } else {
            if (!this.timer) {
              this.timer = setInterval(() => {
                if (this.objChange) { return }
                this.editTopologyFlag = false
                this.topologyLoading = true
                this.projectInfoShow = false
                this.projectAlertShow = false
                if (n.id) {
                  this.getProjectData(n)
                }
                clearTimeout(this.timer)
                this.timer = null
                this.objChange = true
                this.topologyLoading = true
                this.init()
              }, 100)
            } else {
              clearTimeout(this.timer)
              this.timer = setInterval(() => {
                if (this.objChange) { return }
                this.editTopologyFlag = false
                this.topologyLoading = true
                this.projectInfoShow = false
                this.projectAlertShow = false
                if (n.id) {
                  this.getProjectData(n)
                }
                clearTimeout(this.timer)
                this.timer = null
                this.objChange = true
                this.topologyLoading = true
                this.init()
              }, 100)
            }
          }
        }
      }
    },
    topoScreen (n) {
      getTopology(this.topologyIndex).resize()
      getTopology(this.topologyIndex).centerView()
      // getTopology(this.topologyIndex).fitView(30)
    },
    shrink (n) {
      const timer = setTimeout(() => {
        const domRect = document.getElementById('topology-canvas' + this.topologyIndex).getBoundingClientRect()
        getTopology(this.topologyIndex).canvasPos = domRect
        getTopology(this.topologyIndex).resize()
        getTopology(this.topologyIndex).centerView()
        clearTimeout(timer)
      }, 500)
    }
  },
  computed: {
    topoScreen () {
      return this.$store.getters.getShowTopoScreen
    },
    shrink () {
      return this.$store.getters.getIsShrink
    }
  },
  created () {
    // canvasRegister()
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
      // canvasOptions.on = this.onMessage
      clearTimeout(this.timer3)
      this.timer3 = null
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
      let pensPromise = (pen, arr, index) => {
        return new Promise((resolve, reject) => {
          Promise.all(arr).then((res) => {
            this.chartGetData[index].res = JSON.parse(JSON.stringify(this.computeData(res, pen.data.aggregation, pen)))
            this.setAnimation(pen, this.chartGetData[index].res, !data.newData)
            resolve()
          })
        })
      }
      const endTime = this.filterTime[1]
      const startTime = this.filterTime[0]
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
      Promise.all(promiseArr).then((res) => {
        if (!getTopology(this.topologyIndex)) {
          return
        }
        if (!data.pens) {
          data.pens = []
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
              getTopology(this.topologyIndex).centerView()
            } else {
              getTopology(this.topologyIndex).centerView()
            }
            flag = true
          }
        })
        if (!flag) {
          setTimeout(() => {
            getTopology(this.topologyIndex).centerView()
          })
        }
        getTopology(this.topologyIndex).resize()
        this.penToolTipScale = getTopology(this.topologyIndex).data().scale
        const timer = setTimeout(() => {
          getTopology(this.topologyIndex) && getTopology(this.topologyIndex).data().pens.forEach(item => {
            if (item.animatePlay) {
              getTopology(this.topologyIndex).stopAnimate(item.id)
              const timer1 = setTimeout(() => {
                getTopology(this.topologyIndex).startAnimate(item.id)
                clearTimeout(timer1)
              })
            }
          })
          clearTimeout(timer)
        }, 100)
        this.oldTopologyData = JSON.stringify(getTopology(this.topologyIndex).data())
        this.getNodesArr()
        pensPromise = null
      })
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
        getTopology(this.topologyIndex).registerCanvasDraw({ rectangleImg: rectangleImg })
        getTopology(this.topologyIndex).registerAnchors({ rectangleImg: rectangleImgAnchors })
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
        this.getModule()// 获取module
        resolve()
      })
    },
    // 获取topology数据
    getTopologyData () {
      return new Promise(resolve => {
        if (this.fromPrev) {
          resolve(this.topoPrevDataS)
        }
        this.$get('monitor/project/topo', { projectId: this.obj.id }).then(res => {
          if (!res.data) {
            return
          }
          let data = JSON.parse(JSON.stringify(res.data.topo))
          if (!res.data.topo || !res.data.topo.pens.length) {
            this.showNoData = true
          } else {
            this.showNoData = false
          }
          if (this.isPreview) {
            data = this.previewData
          }
          // data = JSON.parse(localStorage.getItem('topoData'))
          if (!res.data.topo || !data.pens) {
            data = {
              background: '#FFFFFF00',
              gridSize: 10,
              gridColor: '#ededed',
              lineWidth: 1,
              ruleColor: '#4e4e4e'
            }
            this.projectInfoShow = true
            this.projectAlertShow = true
            this.saveData = JSON.parse(JSON.stringify(data))
            this.topologyInfo.name = this.obj.name
            data.ruleColor = this.theme == 'light' ? '#4e4e4e' : '#f9f9f9'
            data.gridColor = this.theme == 'light' ? '#ededed' : '#090909'
            data.grid = false
            data.rule = false
            resolve(data)
            data = null
          } else {
            delete data.origin
            data.ruleColor = this.theme == 'light' ? '#4e4e4e' : '#f9f9f9'
            data.gridColor = this.theme == 'light' ? '#ededed' : '#090909'
            data.grid = false
            data.rule = false
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
            if (this.fromOverView) { // 优化从首页来的加载速度
              const arr = data.pens.filter(item => !item.type)
              this.addNodeInit(arr)
            }
            this.timer4 = setInterval(() => {
              if (!this.imgInit) {
                return
              }
              const promiseArr = []
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
                  // promiseArr.push(this.$get('stat/module/abnormal', { moduleId: item.data.moduleId }))
                  item.data.state = {}
                  item.data.state.asset = false
                  item.data.state.endpoint = false
                  item.data.state.alert = false
                } else {
                  // promiseArr.push({ type: 1 })
                  item.data.state = {}
                  item.data.state.asset = false
                  item.data.state.endpoint = false
                  item.data.state.alert = false
                }
              })
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
              if (data.background === '#FFFFFF') {
                data.background = '#FFFFFF00'
              }
              Promise.all(promiseArr).then(res => {
                res[0].data.list.forEach((module, index) => {
                  const item = data.pens.find(pens => module.id === pens.data.moduleId)
                  if (item.type === 0 && item.data.state && res[index].data.list.length) {
                    item.data.state.error = item.data.error = !module.state
                    item.data.state.asset = !!module.asset
                    item.data.state.alert = !!module.alert
                    item.data.state.endpoint = !!module.endpoint
                  } else {
                    item.data.state = {
                      error: false,
                      asset: 0,
                      alert: 0,
                      endpoint: 0
                    }
                  }
                })
                this.saveData = JSON.parse(JSON.stringify(data))
                resolve(data)
                clearInterval(this.timer4)
                this.timer4 = null
              }).catch(res => {
                this.saveData = JSON.parse(JSON.stringify(data))
                resolve(data)
                clearInterval(this.timer4)
                this.timer4 = null
              })
            }, 2000)
          }
        })
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
    // 获取project Info
    getProjectData (n) {
      // 获取projectInfo
      this.projectInfo.loading = true
      this.$get('monitor/project/' + n.id).then(response => {
        if (response.code === 200) {
          this.projectInfo.loading = false
          this.projectInfo = { ...this.projectInfo, ...response.data }
          this.projectInfo.total = this.projectInfo.alertStat[0] + this.projectInfo.alertStat[1] + this.projectInfo.alertStat[2]
          if (!this.projectInfo.total) {
            this.projectInfo.total = 0
          }
        }
      })
    },
    // Severity Label
    returnSeverityLabel (key) {
      return this.$t(this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label)
    },
    // 获取module
    getModule () {
      this.projectInfo.loading = true
      this.$get('/monitor/module?pageSize=-1&projectIds=' + this.obj.id).then(response => {
        if (response.code === 200) {
          this.projectInfo.loading = false
          this.allModules = JSON.parse(JSON.stringify(response.data.list))
          this.modulesDiff()
        }
      })
    },

    getNodesArr () {
      if (!getTopology(this.topologyIndex)) return
      let arr = []
      this.offsetX = getTopology(this.topologyIndex).data().x
      this.offsetY = getTopology(this.topologyIndex).data().y
      arr = getTopology(this.topologyIndex).data().pens.filter(item => {
        if (!item.data) {
          item.data = {
            moduleId: '',
            moduleName: '',
            show: false,
            error: false,
            expressArr: [],
            expressAllArr: [],
            state: {}
          }
        }
        return item.type === 0
      })
      // 打开动画 是否更新顶部图标
      this.nodesArr = arr.map(item => {
        return {
          x: item.x,
          y: item.y,
          width: item.width,
          data: item.data
        }
      })
      this.nodesArr = JSON.parse(JSON.stringify(this.nodesArr))
      arr = null
    },

    modelTopClick (item, index) {

    },
    // 摘除已选择的module
    modulesDiff (data) {
      this.modules = this.allModules
      if (getTopology(this.topologyIndex) && getTopology(this.topologyIndex).data().pens) {
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
      const timer = setTimeout(() => {
        this.popDataShowUpdate(tool.id, false, node)
        clearTimeout(timer)
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
    onDrag (event, node) {
      this.dragFlag = false
      const timer = setTimeout(() => {
        this.dragFlag = true
        clearTimeout(timer)
      }, 100)
      event.dataTransfer.setData('Text', JSON.stringify({ ...node.data, ...node.data.rect, data: { imageId: node.data.imageId } }))
    },
    dragFlagChange (node) {
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

    onMessage (event, data, e) {
      // console.log('onMessage', event, data)
      // console.log(getTopology(this.topologyIndex))
      this.notModuleIDArr = []
      // this.toolShow.attr = false
      // this.toolShow.topTool = false
      // this.$nextTick(() => {
      //   this.toolShow.attr = true
      //   this.toolShow.topTool = true
      // })
      if (data) {
        this.notModuleIDArr.forEach(item => {
          if (item.id === data.id) {
            item.rect = data.rect
          }
        })
      }
      if (!Array.isArray(data) && data) { // 判断不是数组 提前个data配置好节点属性
        if (data.type === 0 && !data.data.moduleId) {
          if (!data.fillStyle) {
            data.fillStyle = '#FFFFFF00'
          }
          data.data = {
            moduleId: '',
            moduleName: '',
            show: false,
            error: false,
            animatePlay: false,
            fillStyle: data.fillStyle || '#ffffff',
            strokeStyle: data.strokeStyle || '#ffffff',
            gradientColor: '#bae7ff',
            gradientType: 0,
            lineWidth: this.nodeDefaultWidth(data.name),
            iconToolState: true,
            // chart 配置项
            valueMapping: [{
              color: {
                line: '#000000',
                fill: '#ffffff',
                text: '#000000'
              },
              value: 'base',
              animateType: 'base',
              level: 0,
              base: true
            }],
            valueMappingSort: 'asc',
            expressArr: [''],
            expressAllArr: [''],
            legends: [''],
            legendsAll: [''],
            tooltipShow: true,
            valueMappingShow: true,
            panelName: 'topologyName',
            unit: 2,
            type: 'line',
            displayChart: true,
            aggregation: 'last',
            title: '',
            url: '',
            ...data.data
          }
        } else if (data.type == 1 && !data.data) {
          // 连线是否自动计算锚点
          // data.manualCps=true;
          data.animateColor = '#FA901C'
          data.toArrowColor = '#000000'
          data.data = {
            animatePlay: false,
            strokeStyle: data.strokeStyle,
            animateColor: data.animateColor,
            arrowColor: '#000000',
            fromArrowColor: '#000000',
            toArrowColor: '#000000',
            lineWidth: 1,
            // chart 配置项
            valueMapping: [{
              color: {
                line: '#000000',
                fill: '#ffffff',
                text: '#000000'
              },
              value: 'base',
              animateType: 'base',
              level: 0,
              base: true
            }],
            valueMappingSort: 'asc', /* desc */
            expressArr: [''],
            expressAllArr: [''],
            legends: [''],
            legendsAll: [''],
            tooltipShow: true,
            valueMappingShow: true,
            panelName: 'topologyName',
            unit: 2,
            type: 'line',
            displayChart: true,
            aggregation: 'last',
            title: '',
            moduleName: '',
            url: ''
          }
        }
        if (data.type === 0 || data.type === 1) {
          data.lineWidth = data.data.lineWidth
        }
      }

      switch (event) {
        case 'moveInNode':
        case 'moveInLine':
          if (this.timer3) {
            clearTimeout(this.timer3)
            this.timer3 = null
          }
          this.chartData = { ...data.data, ...this.chartGetData.find(item => item.id === data.id) }
          this.tooltipPosition.show = false
          const timer = setTimeout(() => {
            this.tooltipPosition.show = true
            let ePosition = window.ePosition
            let boxWidth = document.getElementsByClassName('page')[0].offsetWidth
            let boxHeight = document.getElementsByClassName('page')[0].offsetHeight
            this.tooltipPosition.left = ePosition.layerX + 20
            this.tooltipPosition.top = ePosition.layerY
            this.$nextTick(() => {
              if (this.$refs.topoTooltip) {
                if ((boxWidth / 2) > ePosition.layerX) {
                  this.tooltipPosition.left = ePosition.layerX + 20
                } else {
                  this.tooltipPosition.left = ePosition.layerX - 20 - this.$refs.topoTooltip.offsetWidth
                }
                if (boxHeight > (ePosition.layerY + this.$refs.topoTooltip.offsetHeight)) {
                  this.tooltipPosition.top = ePosition.layerY
                } else {
                  this.tooltipPosition.top = ePosition.layerY - this.$refs.topoTooltip.offsetHeight
                }
              }
              ePosition = null
              boxWidth = null
              boxHeight = null
            })
            clearTimeout(timer)
          }, 100)
          break
        case 'moveOutNode':
        case 'moveOutLine':
          // this.tooltipPosition.show=false;
          // return
          if (!this.timer3) {
            this.timer3 = setTimeout(() => {
              this.tooltipPosition.show = false
              this.timer3 = null
            }, 50)
          } else {
            clearTimeout(this.timer3)
            this.timer3 = setTimeout(() => {
              this.tooltipPosition.show = false
              this.timer3 = null
            }, 50)
          }
          break
      }
      // 右侧输入框编辑状态时点击编辑区域其他元素，onMessage执行后才执行onUpdateProps方法，通过setTimeout让onUpdateProps先执行
      const timer = setTimeout(() => {
        switch (event) {
          case 'node':
          case 'addNode':
            this.modulesDiff(data)
            if (data.data.expressArr.length === 0 && event !== 'node') {
              data.data.expressArr.push('')
              data.data.legends.push('')
            }
            if (data.data.expressAllArr.length === 0 && event !== 'node') {
              data.data.expressAllArr.push('')
              data.data.legendsAll.push('')
            }
            this.props = {
              node: data,
              line: null,
              multi: false,
              expand: this.props.expand,
              nodes: null,
              locked: data.locked,
              pen: data,
              pens: null
            }
            this.$nextTick(() => {
              if (this.$refs.CanvasProps) {
                if (this.penId !== data.id) {
                  this.$refs.CanvasProps.tab = '1'
                }
                this.penId = data.id
              }
            })
            this.$refs.CanvasProps && (this.$refs.CanvasProps.loading = true)
            break
          case 'line':
          case 'addLine':
            this.props = {
              node: null,
              line: data,
              multi: false,
              nodes: null,
              locked: data.locked,
              pen: data,
              pens: null
            }
            this.$nextTick(() => {
              if (this.$refs.CanvasProps) {
                if (this.penId !== data.id) {
                  this.$refs.CanvasProps.tab = '1'
                }
                this.penId = data.id
              }
            })
            this.$refs.CanvasProps && (this.$refs.CanvasProps.loading = true)
            break
          case 'multi':
            this.props = {
              node: null,
              line: null,
              multi: true,
              nodes: data.length > 1 ? data : null,
              locked: this.getLocked({ nodes: data }),
              pen: null,
              pens: data.length > 1 ? data : null
            }
            break
          case 'space':
            this.penId = undefined
            this.props = {
              node: null,
              line: null,
              multi: false,
              nodes: null,
              locked: false,
              pen: null,
              pens: null
            }
            break
          case 'moveOut':
            break
          case 'moveNodes':
          case 'resizeNodes':
            if (data.length > 1) {
              this.props = {
                node: null,
                line: null,
                multi: true,
                nodes: data,
                locked: this.getLocked({ nodes: data }),
                pen: null,
                pens: null
              }
            } else {
              this.props = {
                node: data[0],
                line: null,
                multi: false,
                nodes: null,
                locked: false,
                pen: data[0],
                pens: null
              }
            }
            break
          case 'resize': {
            let dom = document.getElementById('topology-canvas' + this.topologyIndexF)
            let domRect = dom ? dom.getBoundingClientRect() : {}
            if (getTopology(this.topologyIndex)) {
              getTopology(this.topologyIndex).canvasPos = domRect
            }
            dom = null
            domRect = null
            break
          }
          case 'scale': {
            let dom = document.getElementById('topology-canvas' + this.topologyIndexF)
            let domRect = dom ? dom.getBoundingClientRect() : {}
            if (getTopology(this.topologyIndex)) {
              getTopology(this.topologyIndex).canvasPos = domRect
            }
            dom = null
            domRect = null
            break
          }
          case 'locked': {
            this.props = {
              node: null,
              line: null,
              multi: false,
              nodes: null,
              locked: false,
              pen: null,
              pens: null
            }
            break
          }
          case 'delete': {
            this.props = {
              node: null,
              line: null,
              multi: false,
              nodes: null,
              locked: false,
              pen: null,
              pens: null
            }
            break
          }
        }
        switch (event) {
          case 'node':
          case 'line':
          case 'space':
          case 'scale':
          case 'translate':
            this.moduleId = ''
            this.showNodeTools('')
            this.popDataShowUpdate('', false)
            if (!this.editTopologyFlag) {
              getTopology(this.topologyIndex)
            }
            break
        }
        switch (event) {
          case 'space':
          case 'scale':
          case 'translate':
            this.getNodesArr()
            // if(!this.timer2){
            //   this.timer2=setTimeout(()=>{
            //     this.getNodesArr();
            //     this.timer2=null
            //   },300)
            // }else{
            //   clearTimeout(this.timer2);
            //   this.timer2=setTimeout(()=>{
            //     this.getNodesArr();
            //     this.timer2=null
            //   },300)
            // }
            break
        }
        clearTimeout(timer)
      }, 0)
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

    onUpdateProps (node) { // 更新pen
      const obj = this.$loadsh.cloneDeep(node)
      delete obj.x
      delete obj.y
      delete obj.center
      delete obj.ex
      delete obj.ey
      delete obj.width
      delete obj.height
      getTopology(this.topologyIndex).setValue(obj)
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
      new Promise(function (resolve, reject) {
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
                  ...imageTemp,
                  data: {
                    ...imageTemp.data,
                    text: res.data.imageName,
                    image: data.data,
                    imageId: res.data.id,
                    unit: this.uploadPic.unit,
                    rect: {
                      width: data.width,
                      height: data.height
                    }
                  }
                })
              } else {
                this.tools.push({
                  group: this.uploadPic.unit,
                  children: [{
                    ...imageTemp,
                    data: {
                      ...imageTemp.data,
                      text: res.data.imageName,
                      image: data.data,
                      imageId: res.data.id,
                      unit: this.uploadPic.unit,
                      rect: {
                        width: data.width,
                        height: data.height
                      }
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
          this.tools = [...Tools]
          let imgArr = []
          let promiseArr = []
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
                  ...imageTemp,
                  data: {
                    ...imageTemp.data,
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
                    ...imageTemp,
                    data: {
                      ...imageTemp.data,
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
            imgArr = null
            promiseArr = null
          })
        })
      } else {
        this.imgageLoading = true
        this.$get('monitor/project/topo/icon').then((imageAllId) => {
          let promiseArr = []
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
            imgidList = null
            promiseArr = null
          })
        })
      }
    },

    dealImg (url) {
      // 处理后端传过来的图片流乱码问题
      if (url) {
        return new Promise((resolve, reject) => {
          this.$axios
            .get(url)
            .then((res) => {
              const imageInfo = {
                data: ('data:image/jpeg;base64,' + res.data),
                // width: res.headers.width === -1 ? 100 : (res.headers.width > 900 ? 900 : res.headers.width),
                // height: res.headers.height === -1 ? 100 : (res.headers.height > 900 ? 900 : res.headers.height)
                width: res.headers.width === -1 ? 100 : Number(res.headers.width),
                height: res.headers.height === -1 ? 100 : Number(res.headers.height)
              }
              if (imageInfo.width > 900 || imageInfo.height > 900) {
                if (imageInfo.height > imageInfo.width) {
                  imageInfo.width = imageInfo.width * 900 / imageInfo.height
                  imageInfo.height = 900
                } else if (imageInfo.height < imageInfo.width) {
                  imageInfo.height = imageInfo.height * 900 / imageInfo.width
                  imageInfo.width = 900
                } else {
                  imageInfo.height = 900
                  imageInfo.width = 900
                }
              }
              return imageInfo
            })
            .then(data => {
              resolve(data)
              // changeImage(data,(img)=>{
              //   resolve(img)
              // })
            })
            .catch()
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
      this.showNoData = false
      this.topoScreenState = JSON.parse(JSON.stringify(this.topoScreen))
      this.$store.commit('setShowTopoScreen', true)
      const timer = setTimeout(() => {
        getTopology(this.topologyIndex).lock(0)
        getTopology(this.topologyIndex).store.data.pens.forEach((item, index) => { // 停止动画 以及赋值默认data
          if (item.animatePlay) {
            getTopology(this.topologyIndex).stopAnimate(item.id)
          }
          if (!item.data.expressArr.length) {
            item.data.expressArr = ['']
            item.data.legends = ['']
          }
          if (!item.data.expressAllArr || !item.data.expressAllArr.length) {
            item.data.expressAllArr = ['']
            item.data.legendsAll = ['']
          }
          item.animateType = item.data.animateType
          if (item.type === 0) {
            item.background = item.data.background || item.data.fillStyle
            item.color = item.data.color || item.data.strokeStyle
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
            item.data.animateNeedLine = false
          } else if (item.type === 1) {
            item.animateColor = item.data.animateColor
            item.color = item.data.color || item.data.strokeStyle
            item.arrowColor = item.data.arrowColor
            item.fromArrowColor = item.data.arrowColor
            item.toArrowColor = item.data.arrowColor
            item.animatePlay = false
            item.fontColor = item.data.fontColor || '#222222'
          }
          getTopology(this.topologyIndex)._setValue(item)
        })
        getTopology(this.topologyIndex).render(true)
        getTopology(this.topologyIndex).centerView()
        clearTimeout(timer)
      })
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
      getTopology(this.topologyIndex).setOptions({ drawingLineName: val })
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
      let flag = true
      const arr = []
      this.notModuleIDArr = []
      topologyData.pens.forEach(item => {
        if (item.type === 0 && ((!item.data) || (item.data && !item.data.moduleId))) {
          arr.push(item)
          this.props = {
            node: null,
            line: null,
            multi: false,
            nodes: null,
            locked: false,
            pen: null,
            pens: null
          }
          flag = false
        }
      })
      if (!flag) {
        this.notModuleIDArr = arr
      }
      if (flag) {
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
        this.$put('monitor/project/topo', { topo: JSON.stringify(topologyData), projectId: this.projectInfo.id }).then(res => {
          this.prevent_opt.save = false
          if (res.code === 200) {
            this.$message({
              message: this.$t('tip.saveSuccess'),
              type: 'success'
            })
            this.$store.commit('setShowTopoScreen', this.topoScreenState)
            this.$nextTick(() => {
              getTopology(this.topologyIndex).lock(1)
              getTopology(this.topologyIndex).resize()
              this.reload()
            })
          }
        }).catch(res => {
          this.prevent_opt.save = false
          this.$message({
            message: res.msg,
            type: 'error'
          })
        })
      } else {
        this.$message({
          showClose: true,
          message: this.$t('project.topology.selMod'),
          type: 'warning'
        })
      }
    },
    // 取消
    cancelTopology () {
      this.isPreview = false
      this.previewData = ''
      this.editTopologyFlag = false
      this.$nextTick(() => {
        getTopology(this.topologyIndex).lock(1)
        getTopology(this.topologyIndex).resize()
        getTopology(this.topologyIndex).centerView()
        this.$store.commit('setShowTopoScreen', this.topoScreenState)
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
        getTopology(this.topologyIndex).resize()
        getTopology(this.topologyIndex).centerView()
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
      // this.topologyInfo = {
      //   fontSize: data.data.fontSize,
      //   align: data.data.align,
      //   fontColor: data.data.fontColor,
      //   opacity: data.data.opacity,
      //   name: data.name
      // }
    },
    /* tools 方法 */

    winResize () {
      const timer = setTimeout(() => {
        let domRect = document.getElementById('topology-canvas' + this.topologyIndex).getBoundingClientRect()
        getTopology(this.topologyIndex).canvasPos = domRect
        if (this.fromOverView) {
          try {
            const obj = JSON.parse(this.oldTopologyData)
            if (obj && !obj.pens) {
              obj.pens = []
            }
            getTopology(this.topologyIndex).open(obj)
          } catch (e) {
            console.log(e)
          }
        }
        let flag = false

        const position = {
          x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth,
          y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight
        }
        getTopology(this.topologyIndex).data().pens.forEach(item => {
          if (flag) {
            return
          }
          if (item.ex > position.x || item.ey > position.y) {
            // getTopology(this.topologyIndex).fitView(20)
            flag = true
          }
        })
        getTopology(this.topologyIndex).resize()
        getTopology(this.topologyIndex).centerView()
        this.getNodesArr()
        domRect = null
        clearTimeout(timer)
      }, 500)
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
        case 'rectangleImg':
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
    changeScreen () {
      this.$store.commit('setShowTopoScreen', !this.topoScreen)
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
      const arr = []
      Object.keys(StoreData).forEach(key => {
        const id = key.split('-')[0]
        arr.push(id)
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
  },
  destroyed () {
  }
}
</script>
