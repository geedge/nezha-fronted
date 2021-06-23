<style>
  @import "./L5/css/iconfont.css";
  @import "./L5/css/props.css";
</style>
<template>
  <div class="project-box list-page" v-loading="topologyLoading" v-has="'topo_list'">
    <div class="main-list">
      <div class="main-container" :class="fromOverView?'from-overview':'from-project'">
        <div v-if="editTopologyFlag" class="edit-topologyLine top-tools" style="padding-left: 20px;width: calc(100% - 20px);">
          <!--工具栏-->
          <span class="project-topology-tool">
          <el-dropdown trigger="click" size="small" placement="bottom-start" v-has="'topo_icon_list'">
            <span class="el-dropdown-title"><i class="iconfont icon-cube"></i> <i
              class="nz-icon nz-icon-arrow-down"></i></span>
            <el-dropdown-menu slot="dropdown" @click="dropdownClick">
              <div style="height: 450px"  v-loading="imgageLoading">
                <el-card shadow="hover" style="height:420px;width:284px;overflow-y: auto"
                         class="project-topology-add-node">
                <!--<div class="drag-header">——</div>-->
                <el-collapse v-model="activeNames" v-for="(item, index) in tools" :key="index" class="collapse-box">
                  <el-collapse-item :title="item.group" :name="item.group">
                    <template slot="title">
                      <div style="display: flex;width: 100%;">
                        <i class="nz-icon nz-icon-caret-right"></i> <div style="flex: 1">{{item.group}}</div> <i class="nz-icon nz-icon-delete title-delete" @click="tooltipDeleteTitle(item)"></i>
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
                    <g fill="none" stroke="black" stroke-width="1">
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
                    <g fill="none" :stroke="(lineName==item.name)?'#ee9d3f':'black'" stroke-width="1">
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
          <button @click="previewTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new"
                  style="margin-right: 20px"
          >
             {{$t('project.topology.preview')}}
           </button>
           <button @click="saveTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new"
                   :disabled="prevent_opt.save"
                   :class="{'nz-btn-disabled':prevent_opt.save}"
                   style="margin-right: 20px">
             {{$t('project.topology.save')}}
           </button>
           <button @click="cancelTopology" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" style="margin-right: 20px">
             {{$t('project.topology.exit')}}
           </button>
         </span>
        </div>
        <div v-if="!editTopologyFlag&&!fromOverView" class="top-tools" style="padding-left: 10px">
          <div>{{topologyInfo.name}}</div>
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
            <button v-has="'project_topo_update'" class="top-tool-btn margin-r-10" type="button" @click="editTopology">
              <i :title="$t('project.topology.edit')" class="nz-icon nz-icon-edit"></i>
            </button>
            <button class="top-tool-btn" type="button" @click="changeScreen">
              <i :class="topoScreen?'nz-icon-exit-full-screen':'nz-icon-full-screen'" class="nz-icon"></i>
            </button>
          </div>
        </div>
        <div class="nz-table2">
          <!--悬浮network部分-->
          <div class="network-info">
            <div v-if="popDataShow.main">
              <popDataMain :moduleId="moduleId" :projectId="projectInfo.id"></popDataMain>
            </div>
            <div v-if="popDataShow.info">
              <popDataInfo :moduleId="moduleId" :projectId="projectInfo.id"></popDataInfo>
            </div>
          </div>
          <div :class="['page',fromOverView?'overview-page':'']" :style="`border: 1px solid ${theme.rightBoxBorderColor};`">
            <!--画布部分-->
            <div :id="'topology-canvas' + topologyIndexF" :ref="'topology-canvas'+ topologyIndexF" class="full"></div>
            <!--设置属性-->
            <div v-if="editTopologyFlag&&toolShow.attr" class="props">
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
            <!--所有节点上的小图标-->
            <div v-for="(item,index) in nodesArr" v-if="!editTopologyFlag&&item.data.iconToolState&&!fromPrev"
                 :key="index"
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
                 :style="{position:'absolute',top:tooltipPosition.top+'px',left:tooltipPosition.left+'px','z-index':10,height:tooltipPosition.height+'px'}"
                 @mouseout="tooltipOut"
                 @mouseover="tooltipOver"
            >
              <topoTooltip :chartDataParent="chartData" :filterTime="filterTime"/>
            </div>
          </div>
          <!--endpoint-->
          <transition name="right-box">
            <endpointTable v-if="popDataShow.endpoint" :moduleId="moduleId" :moduleName="moduleName" :projectId="projectInfo.id"
                           @close="popDataShowUpdate('',true)">endpoint
            </endpointTable>
          </transition>
          <div v-if="!fromOverView&&!editTopologyFlag&&!fromPrev" class="right-bottom-zoom">
            <div class="zoom-option" style="border-bottom: 1px solid #c5c8cb;" @click="zoomMap(0.25)"><span><i class="nz-icon nz-icon-enlarge"></i></span></div>
            <div class="zoom-option" @click="zoomMap(-0.25)"><span><i class="nz-icon nz-icon-narrow"></i></span></div>
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
    <!--preview-->
    <el-dialog
      :visible.sync="previewShow"
      :width="'80%'"
      :before-close="previewBeforeClose"
    >
      <div style="width: calc(80vw - 40px);height: 80vh">
        <topologyPrev
          v-if="previewShow"
          :obj="obj"
          :topoPrevDataS="topoPrevData"
          :fromOverView="false"
          :fromPrev="true"
          :topologyIndexF="1">
        </topologyPrev>
      </div>
    </el-dialog>
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
               <button @click="uploadPicShow=false" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" style="margin-right: 20px">
             {{$t('project.topology.exit')}}
           </button>

              <button @click="imgUpload" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new"
                      v-has="'topo_icon_save'" :disabled="prevent_opt.save"
                      :class="{'nz-btn-disabled':prevent_opt.save}"
                      style="margin-right: 20px">
             {{$t('project.topology.save')}}
           </button>
            </span>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import { Topology, registerNode } from '@topology/core'
import imgDefault from '@/components/common/project/L5/services/img'
import {
  Tools,
  canvasRegister,
  imageTemp,
  myShape,
  myAnchors,
  myIconRect,
  myTextRect,
  onChangeAnimate,
  onChangeAnimateLine,
  myCubec,
  myCubeAnchors
} from './L5/services/canvas.js'
import { getTopology, setTopology } from '../js/common'
import CanvasProps from './L5/CanvasProps'
import topologyTopTool from './L5//topologyTopTool'
import popDataMain from './popData/Main'
import popDataInfo from './popData/Info'
import alertTable from './popData/alertTable'
import assetTable from './popData/assetTable'
import endpointTable from './popData/endpointTable'
import topoTooltip from './L5/topoTooltip'
import { getMetricTypeValue } from '../js/tools'
import bus from '../../../libs/bus'
import topologyPrev from './topologyPrev'
// 注册到画布
registerNode('rectangleImg', myShape, myAnchors, myIconRect, myTextRect)
registerNode('myCube', myCubec, myCubeAnchors, null, null)

const canvasOptions = {
  rotateCursor: '/img/rotate.cur',
  translateKey: 'None',
  disableEmptyLine: true,
  autoExpandDistance: 0,
  minScale: 0.01
}
export default {
  name: 'topologyL5',
  data () {
    return {
      title: this.$t('overall.customPicture'),
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
        bus.timeFormate(bus.getOffsetTimezoneData(-1), 'yyyy-MM-dd hh:mm:ss'),
        bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss')
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
        { top: '-40px', left: '19px', className: 'nz-icon-asset', id: 'asset', title: this.$t('project.topology.asset') },
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
        height: 400
      },
      chartData: {},
      chartGetData: [],
      penLineType: [
        { d: 'M5 19 a50,100 0 0,1 40,0', 'stroke-dasharray': '', name: this.$t('project.topology.curve'), id: 'curve' },
        { d: 'M5 8 l20 0 l0 12 l20 0', 'stroke-dasharray': '', name: this.$t('project.topology.polyline'), id: 'polyline' },
        { d: 'M5 14 l40 0', 'stroke-dasharray': '', name: this.$t('project.topology.line'), id: 'line' }
        // {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
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
      topoScreenState: '' // 记录编辑前的 $store.ShowTopoScreen 结束编辑后返回
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
    topologyPrev
  },
  props: {
    topologyIndexF: {
      type: Number,
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
      handler (n) {
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
    }
  },
  computed: {
    topoScreen () {
      return this.$store.getters.getShowTopoScreen
    }
  },
  created () {
    canvasRegister()
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
  },
  methods: {
    init () {
      canvasOptions.on = this.onMessage
      this.reload()
    },

    reload () {
      this.topologyLoading = true
      this.getTopologyData().then((data) => {
        this.openTopologyData(data).then(() => {
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
          const endTime = this.filterTime[1]
          const startTime = this.filterTime[0]
          const step = bus.getStep(startTime, endTime)
          data.pens && data.pens.forEach((item, index) => {
            this.chartGetData.push({ id: item.id, res: [] })
            const arr = item.data.expressArr.map((ele) => {
              let query = ele
              if (!query) {
                return new Promise(resolve => {
                  resolve({ data: '', status: 'no query' })
                })
              }
              query += '&nullType=' + 'connected'
              return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
            })
            axiosArr.push({ item, arr })
            promiseArr.push(pensPromise(item, arr, index))
          })
          Promise.all(promiseArr).then((res) => {
            getTopology(this.topologyIndex).open(data)
            getTopology(this.topologyIndex).lock(1)
            this.objChange = false
            let flag = false
            const position = {
              x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth,
              y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight
            }
            this.oldScale = getTopology(this.topologyIndex).data.scale
            getTopology(this.topologyIndex).data.pens.forEach(item => {
              if (flag) {
                return
              }
              if (item.rect.ex > position.x || item.rect.ey > position.y) {
                if (this.fromOverView) {
                  getTopology(this.topologyIndex).fitView(20)
                }
                flag = true
              }
            })
            getTopology(this.topologyIndex).resize()
            getTopology(this.topologyIndex).centerView()
            this.penToolTipScale = getTopology(this.topologyIndex).data.scale
            setTimeout(() => {
              getTopology(this.topologyIndex).data.pens.forEach(item => {
                if (item.animatePlay) {
                  item.stopAnimate()
                  setTimeout(() => {
                    item.startAnimate()
                  })
                }
              }, 100)
            })
            // if(this.fromPrev){
            //   getTopology(this.topologyIndex).scaleTo(data.scale/2)
            // }
            // getTopology(this.topologyIndex).fitView();
            this.oldTopologyData = JSON.stringify(getTopology(this.topologyIndex).data)
            this.getNodesArr()
          })
        })
      })
    },

    dateChange () {
      // const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      // this.setSearchTime(nowTimeType.type, nowTimeType.value)
      this.searchTime = bus.getTimezontDateRange()
      this.filterTime[0] = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filterTime[1] = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      this.reload()
    },
    setSearchTime (type, val) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())), 'yyyy-MM-dd hh:mm:ss')
        this.$set(this.searchTime, 0, startTime)
        this.$set(this.searchTime, 1, endTime)
        this.$set(this.searchTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.searchTime
    },
    // 打开topology数据
    openTopologyData (data) {
      return new Promise(resolve => {
        if (!getTopology(this.topologyIndex)) {
          const canvas = new Topology('topology-canvas' + this.topologyIndexF, canvasOptions)
          canvas.open(data)
          setTopology(this.topologyIndex, canvas)
        } else {
          getTopology(this.topologyIndex).open(data)
        }
        this.topologyLoading = false
        if (!getTopology(this.topologyIndex).data.name) {
          getTopology(this.topologyIndex).data.name = this.obj.name
        }
        getTopology(this.topologyIndex).data.projectId = this.obj.id
        getTopology(this.topologyIndex).lock(1)

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
          let data = res.data.topo
          // data = JSON.parse(localStorage.getItem('topoData'))
          if (!res.data.topo || !data.pens) {
            data = {
              bkColor: '#FFFFFF',
              gridSize: 10,
              gridColor: '#ededed',
              lineWidth: 1,
              ruleColor: '#4e4e4e'
            }
            this.projectInfoShow = true
            this.projectAlertShow = true
            this.saveData = { ...data }
            this.topologyInfo.name = this.obj.name
            resolve(data)
          } else {
            this.topologyInfo = {
              fontSize: data.data.fontSize,
              align: data.data.align,
              fontColor: data.data.fontColor,
              opacity: data.data.opacity,
              name: data.name
            }
            if (this.fromOverView) { // 优化从首页来的加载速度
              const arr = data.pens.filter(item => !item.type)
              this.addNodeInit(arr)
            }
            const timer = setInterval(() => {
              if (!this.imgInit) {
                return
              }
              clearInterval(timer)
              const promiseArr = []
              const self = this
              for (let i = 0; i < data.pens.length; i++) {
                const line = data.pens[i]
                if (line.type === 1) {
                  if (!data.pens.find(item => item.id === line.from.id) || !data.pens.find(item => item.id === line.to.id)) {
                    data.pens.splice(i, 1)
                    i--
                  }
                }
              }
              data.pens.forEach(item => {
                if (item.type === 0 && item.data.imageId) {
                  // console.log(item,item.data.imageId,this.iconArray.find(item1 => item1.id == 44))
                  const img = this.iconArray.find(item1 => item1.id == item.data.imageId)
                  item.image = img ? img.image : imgDefault
                }
                if (item.type === 0) {
                  promiseArr.push(this.$get('stat/module/abnormal',{moduleId: item.data.moduleId}))
                  item.data.state = {}
                  item.data.state.asset = false
                  item.data.state.endpoint = false
                  item.data.state.alert = false
                } else {
                  promiseArr.push({ type: 1 })
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
              Promise.all(promiseArr).then(res => {
                // console.log(res)
                res.forEach((response, index) => {
                  const item = data.pens[index]
                  if (item.type === 0) {
                    item.data.state.error = item.data.error = !res[index].data.list[0].state
                    item.data.state.asset = !!res[index].data.list[0].asset
                    item.data.state.alert = !!res[index].data.list[0].alert
                    item.data.state.endpoint = !!res[index].data.list[0].endpoint
                  }
                })
                self.saveData = { ...data }
                resolve(data)

              })
            }, 100)
          }
        })
      })
    },
    // 赋值动画
    setAnimation (pen, res) { // 根据所有res的状态 赋值动画
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
            pen.fontColor = selLevel.color.text
            pen.fillStyle = selLevel.color.fill
            pen.strokeStyle = selLevel.color.line
            pen.bkType = 0
          }
          onChangeAnimate(pen, selLevel.animateType, selLevel.color.fill, selLevel.color.line)
        } else if (pen.type === 1) { // 判断valueMapping 给相应的状态
          const selLevel = pen.data.valueMapping.find(item => item.level === maxLevel)
          if (selLevel) {
            pen.animateColor = selLevel.color.fill
            pen.strokeStyle = selLevel.color.line
            pen.animateType = selLevel.animateType
            pen.fontColor = selLevel.color.text
          }
          onChangeAnimateLine(pen, pen.animateType)
        }
      } else {
        if (pen.type === 0 && pen.animatePlay) { // 判断valueMapping 给相应的状态
          onChangeAnimate(pen, pen.animateType)
        } else if (pen.type === 1 && pen.animatePlay) { // 判断valueMapping 给相应的状态
          onChangeAnimateLine(pen, pen.animateType)
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
                let alias = this.dealLegendAlias(host, pen.data.legends[innerPos])
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
    dealLegendAlias: function (legend, expression) {
      if (/\{\{.+\}\}/.test(expression)) {
        const labelValue = expression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          const reg = new RegExp(label + '=".+?"')
          let value = null
          if (reg.test(legend)) {
            const find = legend.match(reg)[0]
            value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
          }
          return value || label
        })
        return labelValue
      } else {
        return expression
      }
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
      return this.$CONSTANTS.alertMessage.severityData.find(s => { return s.value == key }).label
    },
    // 获取module
    getModule () {
      this.projectInfo.loading = true
      this.$get('/monitor/module?pageSize=-1&projectIds=' + this.obj.id).then(response => {
        if (response.code === 200) {
          this.projectInfo.loading = false
          this.allModules = response.data.list
          this.modulesDiff()
        }
      })
    },

    getNodesArr () {
      const arr = []
      if (!getTopology(this.topologyIndex)) return
      this.nodesArr = getTopology(this.topologyIndex).data.pens.filter(item => {
        if (!item.data) {
          item.data = {
            moduleId: '',
            moduleName: '',
            show: false,
            error: false,
            expressArr: [],
            state:{}
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
      if (getTopology(this.topologyIndex).data.pens) {
        getTopology(this.topologyIndex).data.pens.forEach(item => {
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
    onDrag (event, node) {
      this.dragFlag = false
      setTimeout(() => {
        this.dragFlag = true
      }, 100)
      event.dataTransfer.setData('Text', JSON.stringify({ ...node.data, data: { imageId: node.data.imageId } }))
    },
    dragFlagChange (node) {
      getTopology(this.topologyIndex).addNode(
        {
          ...node.data,
          rect: {
            ...node.data.rect,
            x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth / 2 - 50,
            y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight / 2 - 50
          },
          data: { imageId: node.data.imageId }
        })
      setTimeout(() => {
        this.dragFlag = true
      }, 100)
    },

    onMessage (event, data, e) {
      // console.log('onMessage', event, data)
      // console.log(getTopology(this.topologyIndex))
      // this.notModuleIDArr=[];
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
          data.data = {
            ...data.data,
            moduleId: '',
            moduleName: '',
            show: false,
            error: false,
            animatePlay: false,
            fillStyle: data.fillStyle,
            strokeStyle: data.strokeStyle,
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
            legends: [''],
            tooltipShow: true,
            panelName: 'topologyName',
            unit: 2,
            type: 'line',
            displayChart: true,
            aggregation: 'last',
            title: '',
            url: ''
          }
        } else if (data.type == 1 && !data.data) {
          // 连线是否自动计算锚点
          // data.manualCps=true;
          data.animateColor = '#FA901C'
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
            legends: [''],
            tooltipShow: true,
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
          setTimeout(() => {
            this.tooltipPosition.show = true
            const ePosition = window.ePosition
            const boxWidth = document.getElementsByClassName('page')[0].offsetWidth
            const boxHeight = document.getElementsByClassName('page')[0].offsetHeight
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
            })
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
      setTimeout(() => {
        switch (event) {
          case 'node':
          case 'addNode':
            this.modulesDiff(data)
            if (data.data.expressArr.length === 0 && event !== 'node') {
              data.data.expressArr.push('')
              data.data.legends.push('')
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
            this.$refs.CanvasProps.loading = true
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
            this.$refs.CanvasProps.loading = true
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
            const domRect = document.getElementById('topology-canvas' + this.topologyIndexF).getBoundingClientRect()
            if (getTopology(this.topologyIndex)) {
              getTopology(this.topologyIndex).canvasPos = domRect
            }
            break
          }
          case 'scale': {
            if (this.$refs.topTool) {
              this.$refs.topTool.scaleNum = parseInt(data * 100)
            }
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

    onUpdateProps (node) {
      // 如果是node属性改变，需要传入node，重新计算node相关属性值
      // 如果是line属性改变，无需传参
      getTopology(this.topologyIndex).updateProps(node)
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
          this.dealImg(`monitor/project/topo/icon/${res.data.id}/1`).then((data, header) => {
            const group = this.tools.find(tool => tool.group === this.uploadPic.unit)
            if (group) {
              group.children.push({
                ...imageTemp,
                data: {
                  ...imageTemp.data,
                  text: res.data.imageName,
                  image: data,
                  imageId: res.data.id,
                  unit: this.uploadPic.unit
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
                    image: data,
                    imageId: res.data.id,
                    unit: this.uploadPic.unit
                  }
                }]
              })
            }
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
          const imgArr = []
          const promiseArr = []
          res.data.list.forEach((item, index) => {
            item.imageName = item.name
            delete item.name
            promiseArr.push(this.dealImg(`monitor/project/topo/icon/${item.id}/1`))
            imgArr.push({ ...item })
          })
          Promise.all(promiseArr).then((res2, header) => {
            this.iconArray = [...res.data.list]
            this.iconArray.forEach((item, index) => {
              item.image = res2[index]
              const group = this.tools.find(tool => tool.group === item.unit)
              if (group) {
                group.children.push({
                  ...imageTemp,
                  data: {
                    ...imageTemp.data,
                    text: item.imageName,
                    image: res2[index],
                    imageId: item.id,
                    unit: item.unit
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
                      image: res2[index],
                      imageId: item.id,
                      unit: item.unit
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
          imgidList.forEach((item, index) => {
            if (item.data.imageId && imageAllId.data.list.find(image => item.data.imageId === image.id)) {
              promiseArr.push(this.dealImg(`monitor/project/topo/icon/${item.data.imageId}/1`))
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
                item.image = res2[index]
              }
            })
            this.imgInit = true
            this.imgageLoading = false
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
              return {
                data: ('data:image/jpeg;base64,' + res.data)
              }
            })
            .then(data => {
              resolve(data.data, data.header)
              // changeImage(data,(img)=>{
              //   resolve(img)
              // })
            })
            .catch(err => {
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
      this.topoScreenState = JSON.parse(JSON.stringify(this.topoScreen))
      this.$store.commit('setShowTopoScreen', true)
      setTimeout(() => {
        getTopology(this.topologyIndex).lock(0)
        getTopology(this.topologyIndex).data.pens.forEach((item, index) => { // 停止动画 以及赋值默认data
          if (item.animatePlay) {
            item.stopAnimate()
          }
          if (!item.data.expressArr.length) {
            item.data.expressArr = ['']
            item.data.legends = ['']
          }
          item.animateType = item.data.animateType
          if (item.type === 0) {
            item.fillStyle = item.data.fillStyle
            item.strokeStyle = item.data.strokeStyle
            item.animatePlay = false
            item.fontColor = '#000000'
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
            item.fontColor = '#000000'
          }
        })
        getTopology(this.topologyIndex).caches = {
          index: 0,
          list: [JSON.parse(JSON.stringify(getTopology(this.topologyIndex).data))]
        }
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
      const dataOption = getTopology(this.topologyIndex).data
      dataOption[key] = this.lineName
      getTopology(this.topologyIndex).render()
    },
    notModuleIDArrChange (id) {
      this.notModuleIDArr = this.notModuleIDArr.filter(item => item.id !== id)
    },
    // 保存
    saveTopology () {
      const topologyData = getTopology(this.topologyIndex).pureData()
      // console.log(JSON.stringify(topologyData))
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
        })
        if (this.penToolTipScale == getTopology(this.topologyIndex).data.scale) {
          getTopology(this.topologyIndex).data.scale = this.oldScale
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
              const domRect = document.getElementById('topology-canvas' + this.topologyIndexF).getBoundingClientRect()
              getTopology(this.topologyIndex).canvasPos = domRect
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
      this.editTopologyFlag = false
      this.$nextTick(() => {
        getTopology(this.topologyIndex).lock(1)
        const domRect = document.getElementById('topology-canvas' + this.topologyIndexF).getBoundingClientRect()
        getTopology(this.topologyIndex).canvasPos = domRect
        this.$store.commit('setShowTopoScreen', this.topoScreenState)
      })
      this.reload()
    },
    // 预览
    previewTopology () {
      const data = JSON.parse(JSON.stringify(getTopology(this.topologyIndex).data))
      data.pens.forEach((item) => {
        item.animatePlay = item.data.animatePlay
      })
      this.topoPrevData = JSON.parse(JSON.stringify(data))
      this.topoPrevData.rule = false
      this.topoPrevData.grid = false
      this.previewShow = true
    },

    // 联动 project
    changeProjectTitle () {
      const data = getTopology(this.topologyIndex).data
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
      setTimeout(() => {
        const domRect = document.getElementById('topology-canvas' + this.topologyIndex).getBoundingClientRect()
        getTopology(this.topologyIndex).canvasPos = domRect
        if (this.fromOverView) {
          getTopology(this.topologyIndex).open(this.oldTopologyData)
        }
        let flag = false

        const position = {
          x: this.$refs['topology-canvas' + this.topologyIndexF].offsetWidth,
          y: this.$refs['topology-canvas' + this.topologyIndexF].offsetHeight
        }
        getTopology(this.topologyIndex).data.pens.forEach(item => {
          if (flag) {
            return
          }
          if (item.rect.ex > position.x || item.rect.ey > position.y) {
            // getTopology(this.topologyIndex).fitView(20)
            flag = true
          }
        })
        getTopology(this.topologyIndex).centerView()
        this.getNodesArr()
      }, 100)
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
      getTopology(this.topologyIndex).scaleTo(getTopology(this.topologyIndex).data.scale + num)
    },
    penToBottom () {
      getTopology(this.topologyIndex).bottom()
    },
    changeScreen () {
      this.$store.commit('setShowTopoScreen', !this.topoScreen)
    }
  },
  destroyed () {
    if (getTopology(this.topologyIndex)) {
      getTopology(this.topologyIndex).destroy()
      setTopology(this.topologyIndex, null)
    }
    if (document.getElementById('topology-canvas' + this.topologyIndexF)) {
      document.getElementById('topology-canvas' + this.topologyIndexF).removeEventListener('mousemove', this.canvasMove)
    }
    window.removeEventListener('resize', this.winResize)
  }
}
</script>
<style lang="scss">
  .el-dropdown-menu {
    .project-topology-add-node {
      .el-collapse-item__header {
        padding: 0 10px;
        background-color: #ffffff;
        height: 32px;
      }

      .el-collapse-item__header.is-active {
        background: #F6F6F6;
        ont-family: Roboto-Bold;
        font-size: 14px;
        color: #FA901C;
        font-weight: 700;

        el-collapse-item__arrow {
          color: #666;
        }
      }

      .el-collapse-item__wrap {
        padding: 0 10px;
        background-color: #ffffff;
      }

      .el-collapse-item__content {
        padding: 12px 0px;
        display: flex;
        flex-wrap: wrap;
        /*justify-content: space-around;*/
      }

      .el-card__body {
        padding: 0;
        height: 100%;
      }

      .handle {
        position: absolute;
        z-index: 2;
      }

      .buttons {
        padding: 11px;
        display: inline-block;
        position: relative;
        vertical-align: middle;
        width: 26px;

        .delIcon {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 10px;
          font-size: 16px;
          line-height: 16px;
          text-align: center;
          right: 2px;
          top: 2px;
          color: #fa901c;
          display: none;
          cursor: pointer;
        }

        a {
          display: inline-block;
          color: #314659;
          width: 26px;
          height: 26px;
          text-align: center;
          text-decoration: none !important;
          cursor: pointer;
          line-height: 26px;

          .iconfont {
            font-size: 24px;
          }

          img {
            max-width: 26px;
            max-height: 26px;
          }

          &:hover {
            color: #1890ff;
          }
        }

        .upload-icon-box {
          .el-icon-plus {
            font-size: 14px;
            margin-bottom: 10px;
          }

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }
      }
      .buttons{
        border: 1px solid transparent;
      }
      .buttons:hover {
        border-color: #fa901c;
        .delIcon {
          display: inline-block;
        }
      }
    }

    .avatar-uploader {
      line-height: 30px;

      .el-icon-plus {
        font-size: 12px;
        color: #FA901C;
        margin: 0 8px 0 15px;
      }

      .el-upload--picture-card {
        width: 100%;
        height: 100%;
        border: none;
        color: #666;
        font-size: 14px;
        line-height: 30px;
        text-align: left;
      }

      .el-upload--picture-card:hover, .el-upload:focus {
        color: #666;
      }
    }

    .avatar-uploader:active el-upload--picture-card {
      color: #DB8B8B;
    }

    .avatar-uploader:active .el-upload--picture-card:hover, .avatar-uploader:active .el-upload:focus {
      color: #DB8B8B;
    }
  }
</style>
<style lang="scss" scoped>
  /deep/ .el-collapse-item  .is-active .nz-icon-caret-right{
    transform: rotate(90deg);
    color: #FA901C;
  }
  /deep/ .el-collapse-item .title-delete{
    display: none;
  }
  /deep/ .el-collapse-item .nz-icon-caret-right{
    transition: transform .3s;
    color: #BEBEBE;
    margin-right: 5px;
  }
  /deep/ .el-collapse-item:hover{
    .el-collapse-item__header{
      color: #FA901C;
    }
    .nz-icon-caret-right{
      color: #FA901C;
    }
    .title-delete{
      display: block;
      color: #FA901C;
    }
  }
  .project-box{
    @keyframes model-error-animation {
      0% {
        transform: scale(0.7);
      }
      50% {
        transform: scale(1);
      }
      100% {
        transform: scale(0.7);
      }
    }

    @keyframes model-icon-animation {
      0% {
        transform: scale(1.2) translateX(1px);
      }
      50% {
        transform: scale(0.9) translateX(0px);
      }
      100% {
        transform: scale(1.2) translateX(1px);
      }
    }

    .nz-icon-shuidi {
      position: absolute;
      font-size: 48px;
      color: rgba(190, 233, 222, 0.45);
      border-radius: 50%;
      height: 48px;
      width: 48px;
      line-height: 48px;
    }

    .model-error.nz-icon-shuidi {
      color: #FADED7;
      animation: model-error-animation .6s infinite ease-in-out;
      animation-direction: normal;
    }

    .model-error-active.nz-icon-shuidi {
      color: #FADED7;
    }

    .nz-icon-model {
      color: #23BF9A;
      position: absolute;
      top: -4px;
      left: 15px;
      font-size: 18px;
      line-height: 48px;
    }

    .model-error .nz-icon-model {
      color: #EC7F66;
      animation: model-icon-animation .6s infinite ease-in-out;
      animation-direction: normal;
    }

    .model-error-active .nz-icon-model {
      color: #EC7F66;
    }

    .scaleTool-enter-active {
      animation: scaleTool-in .15s;
    }

    .scaleTool-leave-active {
      animation: scaleTool-in .15s reverse;
    }

    @keyframes scaleTool-in {
      from {
        top: 0px;
        left: 0px;
        transform: scale(0.5);
      }
    }

    .moduleIdRect{
      /*border: 4px dashed #FA901C;*/
    }
    .module-rect-top{
      border-top: 4px dashed #ff8c0a;
      position: absolute;
    }
    .module-rect-right{
      border-right: 4px dashed #ff8c0a;
      position: absolute;
    }
    .module-rect-bottom{
      border-bottom: 4px dashed #ff8c0a;
      position: absolute;
    }
    .module-rect-left{
      border-left: 4px dashed #ff8c0a;
      position: absolute;
    }

    .network-pop .nz-icon-hexagonBorder{
      position: absolute;
      font-size: 48px;
      color: #84d5c2;
      height: 48px;
      width: 48px;
      line-height: 48px;
    }

    .network-pop .nz-icon-hexagonBorder:hover {
      transform: scale(1.1);
      color: #4BB49B;
    }

    .network-pop .nz-icon-hexagonBorder.error-model-stat {
      color: #F5BAAC;
    }

    .network-pop .nz-icon-hexagonBorder.error-model-stat:hover {
      color: #EC7F66;
    }

    .network-pop .nz-icon-liubianxing {
      color: #e2f3ef;
      font-size: 44px;
      position: absolute;
      top: 1px;
      left: 2px;
      transform: scale(0.95);
      z-index: 0;
    }

    .network-pop .error-model-stat .nz-icon-liubianxing {
      color: #FADED7;
    }

    .network-pop .nz-icon.noMove {
      position: absolute;
      left: 14px;
      font-size: 20px;
      color: #27c09c;
    }

    .network-pop .error-model-stat .nz-icon.noMove {
      color: #EC7F66;
    }

    .network-pop .no-selPop {
      color: #999 !important;
    }

    .network-pop .no-selPop .nz-icon-liubianxing {
      color: rgb(218, 218, 218);
    }

    .network-pop .no-selPop .nz-icon-chart {
      color: #999;
    }

    .network-info {
      position: absolute;
      right: 0;
      top: 50px;
      z-index: 1;
    }

    .facade-top{
      min-height: 138px;
      display: flex;
      margin: 4px 0;
      height: calc(16% - 40px);
      font-size: 12px;
      z-index: 10;
      padding-left: 15px;
    }
    .facade-top > div{
      width: 18%;
      min-width: 315px;
      background: #FFFFFF;
      margin-right: 9px;
      padding: 20px;
      border: 1px solid #FFFFFF;
      box-shadow: 1px 2px 4px 0 rgba(0,0,0,0.12), -1px 1px 9px -1px rgba(205,205,205,0.77);
    }
    .facade-top-title{
      font-size: 16px;
      color: #333333;
      font-weight: bold;
      padding: 5px 0;
    }
    .facade-top-left{
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
    .special.label{
      margin-left: 30px;
    }
    .facade-top .facade-top-right{
      width: auto;
      min-width: 100px;
    }
    .facade-top-right-content{
      display: flex;
      justify-content: space-around;
      justify-items: center;
      flex-direction: column;
      height: calc(100% - 30px);
      align-items:flex-start;
    }
    .facade-top-right-content > div{
      min-width: 84px;
      height: 22px;
      display: flex;
      justify-content: space-between;
      color: #fff;
      text-align: center;
      margin-bottom: 5px;
      line-height: 22px;
    }
    .facade-top-right-content > div > div:last-child{
      text-align: center;
      border-radius: 0 4px 4px 0;
      flex: 1;
      height: calc(100% - 2px);
      padding: 0 8px;
      min-width: 40px;
    }
    .content-P1-title{
      background: #F2866E;
      border-radius: 4px 0 0 4px;
      width: 40px;
      height: 100%;
    }
    .content-P1-title + div{
      border: 1px solid #F4907A;
      font-size: 12px;
      color: #F4907A;
    }

    .content-P2-title{
      background: #F89984;
      border-radius: 4px 0 0 4px;
      width: 40px;
      height: 100%;
    }
    .content-P2-title + div{
      border: 1px solid #F9A28F;
      font-size: 12px;
      color: #F9A28F;
    }

    .content-P3-title{
      background: #F7BA78;
      border-radius: 4px 0 0 4px;
      width: 40px;
      height: 100%;
    }
    .content-P3-title + div{
      border: 1px solid #F7BA78;
      font-size: 12px;
      color: #F7BA78;
    }

    .right-content-P1{
      border: 1px solid ;
    }
    .align--center{
      text-align: center;
    }
  }
  .project-topology-tool {
    display: inline-flex;
    height: 30px;
  }

  .el-dropdown-title {
    background: #FFFFFF;
    border: 1px solid $--primary-border-color;
    border-radius: 2px;
    width: 66px;
    height: 28px;
    display: inline-block;
    line-height: 28px;

    .icon-cube {
      margin-left: 15px;
    }
  }

  .project-box {
    width: 100%;
    position: relative;
    border-radius: 2px;
    overflow: visible;
    background: #fff;
    .pickTime{
      margin-right: 10px;
    }
    .project-title {
      height: 55px;
      padding-bottom: 0px;
    }

    .drag-header {
      cursor: move;
      background: #1a1a1a;
      color: #fff;
    }

    .left-bottom {
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
  }

  .page {
    display: flex;
    height: calc(100% - 1px);
    width: 100%;
/*
    height: calc(100% - 65px);
    width: calc(100% - 10px);
    margin: 5px;
*/
    position: relative;

    .tools {
      width: 300px;
      height: calc(100% - 1px);
      border: none;
      position: absolute;
      z-index: 1 !important;
      left: 20px;
      background-color: #f9f9f9;

      .title {
        float: left;
      }
    }

    .full {
      flex: 1;
      overflow: unset !important;
    }

    .props {
      width: 500px;
      height: 100%;
      border: none;
      position: absolute;
      z-index: 1 !important;
      right: 0;
      top: 0;
      background: #FFFFFF;
      box-shadow: inset 1px 0 0 0 rgba(0, 0, 0, 0.09);
      border-radius: 0px;
    }
  }
  .overview-page{
    height: 100%;
  }
  .special-select svg {
    width: 75px;
    height: 30px;
  }

  .special-select .el-select.el-select--small {
    width: 100%;
  }

  .special-select /deep/ .el-select-dropdown {
    width: 130px !important;

    .el-select-dropdown__item {
      padding: 0 0 0 10px;
    }
  }

  .special-select /deep/ .el-input.el-input--prefix.el-input--suffix, .line-width /deep/ .el-input.el-input--prefix.el-input--suffix {
    border: 1px solid #DCDFE6;
    height: 28px;
  }

  .special-select /deep/ .el-input__inner, .line-width /deep/ .el-input__inner {
    display: none;
  }

  .special-select /deep/ .el-input__prefix, .line-width /deep/ .el-input__prefix {
    height: 28px;
    line-height: 28px;
    color: #899FB7;
    width: 100%;
  }

  .special-select /deep/ .el-input__prefix > div {
    width: 100%;
    height: 100%;
  }

  .upload-pic-row{
    width: 420px;
    margin-bottom: 10px;
    .upload-pic-label{
      text-align: right;
      font-size: 14px;
      color: #666666;
      letter-spacing: 0;
      font-weight: 400;
      height: 30px;
      line-height: 30px;
      padding-right: 8px;
    }
    /deep/ .el-upload--text{
      width: 100%;
      .el-upload-dragger{
        width: 100%;
      }
    }
  }
  .upload-pic-box{
    width: 284px;
    height: 30px;
    text-align: center;
    font-size: 14px;
    color: #666666;
    font-weight: 400;
    line-height: 30px;
    cursor: pointer;
    .el-icon-plus{
      color: #FA901C;
    }
  }
  .top-tool-btn{
    height: 32px;
    width: 32px;
    border: 1px solid $--primary-border-color;
    outline: none;
    border-radius: 2px;
    background-color: #F9F9F9;
    -webkit-transition: background-color linear .1s;
    transition: background-color linear .1s;
    padding: 0;
  }
  .top-tool-btn:hover{
    background-color: #fff;
  }
  .top-tool-btn:focus{
    background-color: #fff;
    border-color: #FBCEA4;
  }
  .top-tool-btn:focus .nz-icon{
    color: #FBCEA4;
  }
  .right-bottom-zoom{
    position: absolute;
    bottom: 30px;
    right: 40px;
    height: 90px;
    width: 35px;
    border: 1px solid #E7EAED;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
    .zoom-option{
      width: 100%;
      height: 50%;
      opacity: 0.42;
      background: #FFF;
      align-items: center;
      display: flex;
      justify-content: center;
    }
    .zoom-option:hover{
      cursor: pointer;
    }
  }
  .from-overview{
    padding:0 !important;
    width: calc(100% - 2px);
    height: calc(100% - 2px) !important;
    .nz-table2{
      padding: 0 !important;
      height: 100%;
    }
  }
  .from-project{
    padding-left: 0;
    .nz-table2{
      padding: 0 5px 10px 5px;
      box-sizing: content-box;
    }
  }
  /deep/ .el-collapse-item__arrow{
    display: none;
  }
</style>
