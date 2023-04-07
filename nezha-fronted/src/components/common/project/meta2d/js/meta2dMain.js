import { registerNode, s8 } from '@meta2d/core'
import { flowPens } from '@meta2d/flow-diagram'
import { activityDiagram } from '@meta2d/activity-diagram'
import { classPens } from '@meta2d/class-diagram'
import { sequencePens, sequencePensbyCtx } from '@meta2d/sequence-diagram'
// import { chartsPens } from '@meta2d/le5le-charts'
import {
  disposeTopoOldData
} from '../../L5/services/canvas.js'
import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
import bus from '@/libs/bus'
import topoUtil from '@/components/common/project/meta2d/js/topoUtil'
import lineData from '@/components/common/project/meta2d/js/defaultPenLineData'
export default {
  data () {
    return {
      selectPens: [],
      editFlag: false,
      prevFlag: false,
      meta2dLoading: true,
      position: {
        top: 50,
        left: 0,
        show: false
      },
      timer3: null,
      chartParams: {
        chartType: 'line',
        content: '',
        legends: [],
        title: '',
        titleShow: true
      },
      contextmenu: {
        left: null,
        top: null,
        bottom: null
      },
      popDataShow: {
        endpoint: false,
        asset: false,
        total: false,
        other: false,
        info: false,
        alert: false,
        main: false
      },
      projectInfo: {
        title: '',
        id: '',
        remark: '',
        alertStat: [1, 2, 3],
        moduleMum: 6,
        loading: true
      },
      setContextmenu: true,
      modules: [],
      allModules: [],
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
      nodesArr: [],
      offsetX: 0,
      offsetY: 0,
      moduleId: '',
    }
  },
  mixins: [topoUtil],
  methods: {
    init: function () {
      const meta2dOptions = {
        minScale: 0.25,
        maxScale: 2,
        autoAnchor: false
      }
      const meta2d = new window.Meta2d(this.meta2dId, meta2dOptions)
      meta2d.register(flowPens())
      meta2d.register(activityDiagram())
      meta2d.register(classPens())
      meta2d.register(sequencePens())
      meta2d.registerCanvasDraw(sequencePensbyCtx())
      // meta2d.registerCanvasDraw(formPens())
      // meta2d.registerCanvasDraw(chartsPens())
      /* 画布绑定事件 */
      meta2d.beforeAddPens = (pens) => { // 添加画笔前
        bus.$emit('changeDrawState')
        const name = 'elements-' + meta2d.store.data.pens.length
        if (pens.length === 1) {
          if (!pens[0].type) {
            this.nodeInit(pens[0], name)
          } else {
            this.lineInit(pens[0], name)
          }
        }
        return true
      }
      meta2d.beforeRemovePens = async (pens) => {
        bus.$emit('changeSelectPens', [])
        // 返回 true 允许 remove
        return true
      }
      meta2d.on('translate', this.topTranslate) // 平移·
      meta2d.on('scale', this.topoScale) // 缩放·
      meta2d.on('active', this.pensActive) // 选中·
      // meta2d.on('translatePens', () => {}) // 移动画笔结束·
      // meta2d.on('translatingPens', () => {}) // 移动画笔进行中·
      meta2d.on('enter', this.penEnter) // 移入画笔·
      meta2d.on('leave', this.penLeave) // 移出画笔·
      // meta2d.on('add', this.appPen) // 添加新画笔·
      meta2d.on('click', this.topoClick) // click画笔·
      setTopology(this.meta2dId, meta2d)
      this.reload()
    },
    reload () {
      this.position.show = false
      const endTime = new Date().getTime()
      const startTime = endTime - 60 * this.params.timeType * 1000
      this.getQueryValues(this.querysArray, startTime, endTime).then((arr) => {
        this.clacTopoData(this.topoData, arr).then((data) => {
          if (!getTopology(this.meta2dId)) {
            return
          }
          this.getModule()
          getTopology(this.meta2dId).resize()
          getTopology(this.meta2dId).open(data)
          if (this.isChart) {
            getTopology(this.meta2dId).fitView(true, 20)
          } else {
            getTopology(this.meta2dId).centerView()
          }
          getTopology(this.meta2dId).lock(1)
          this.getNodesArr()
        })
      })
    },
    nodeInit (pen, name) { // 初始化节点参数
      if (pen.data && pen.data.params) {
        return
      }
      if (name && !pen.text) {
        pen.text = name
      }
      if (pen.data && pen.data.imageId) {
        const imageInfo = this.iconArray.find(item => item.id === pen.data.imageId)
        pen.imageId = pen.data.imageId
        if (imageInfo) {
          pen.image = `/topology/icon/0/${imageInfo.unit}/${imageInfo.name}`
        }
      }
      pen.data = {
        params: { // 用于编辑时 重置为节点初始状态
          background: pen.background || '#22222200',
          color: pen.color || '#222222ff',
          textColor: pen.textColor || '#222222ff'
        },
        imageId: '',
        valueMapping: [],
        legend: '',
        statistic: 'last',
        parent: '',
        value: '',
        source: 'text',
        textParent: '',
        textLegend: '',
        text: pen.text || '',
        textValue: '',
        enable: {
          valueMapping: false,
          tooltip: false
        },
        tooltip: {
          title: '',
          titleShow: true,
          chartType: 'line',
          content: '',
          legends: [] // {legend: '' , alias}
        }
      }
      pen.nzName = name
      pen.moduleId = ''
      pen.iconFamily = 'nz-icon'
      pen.disableInput = pen.disableInput || true
      pen.background = pen.background || '#22222200'
      pen.textAlign = pen.textAlign || 'center'
      pen.textBaseline = pen.textBaseline || 'middle'
      pen.color = pen.color || '#222222ff'
      pen.textColor = pen.textColor || '#222222ff'
      pen.image = pen.image || ''
      pen.imageId = pen.imageId || ''
      pen.imageRatio = pen.imageRatio || false
      pen.ratio = pen.ratio || false
      pen.rotate = pen.rotate || 0
      pen.globalAlpha = pen.globalAlpha || 1
      pen.borderType = pen.borderType || 0
      pen.lineWidth = pen.lineWidth || 1
      pen.lineDash = pen.lineDash || []
      pen.borderRadius = pen.borderRadius || 0
      pen.paddingTop = 5
      pen.paddingBottom = 5
      pen.paddingLeft = 5
      pen.paddingRight = 5
      pen.visible = pen.visible || true
      pen.isNz = true
      pen.locked = pen.locked || 0
      pen.isBottom = false
      if (pen.rect) {
        pen.x = pen.rect.x
        pen.y = pen.rect.y
        pen.height = pen.rect.height
        pen.width = pen.rect.width
        delete pen.rect
        delete pen.textRect
      }
    },
    lineInit (pen, name) { // 初始化连线参数
      if (pen.data && pen.data.params) {
        return
      }
      if (pen.from && pen.to) {
        const width = pen.from.x - pen.to.x
        const height = pen.from.y - pen.to.y
        const from = pen.from
        const to = pen.to
        pen.lineName = pen.name
        pen.name = 'line'
        pen.borderType = 0
        pen.anchors = lineData.anchors
        const penId = pen.id
        pen.anchors[0].connectTo = from.id
        pen.anchors[1].connectTo = to.id
        pen.anchors[0].anchorId = from.anchorIndex + ''
        pen.anchors[1].anchorId = to.anchorIndex + ''
        pen.anchors[0].id = s8()
        pen.anchors[1].id = s8()
        pen.anchors[0].penId = penId
        pen.anchors[1].penId = penId
        pen.x = width > 0 ? to.x : from.x
        pen.y = height > 0 ? to.y : from.y
        pen.width = Math.abs(to.x - from.x)
        pen.height = Math.abs(to.y - from.y)
      }
      pen.data = {
        params: {
          animateColor: pen.animateColor || '#FA901CFF',
          borderColor: pen.borderColor || '#22222200',
          color: pen.color || '#222222FF'
        },
        valueMapping: [],
        legend: '',
        statistic: 'last',
        parent: '',
        value: '',
        enable: {
          valueMapping: false,
          tooltip: false
        }
      }
      pen.nzName = name
      pen.moduleId = ''
      pen.disableInput = pen.disableInput || true
      pen.lineAnimateType = pen.lineAnimateType || 0
      pen.animateSpan = pen.animateSpan || 1
      pen.animateReverse = pen.animateReverse || false
      pen.fromArrow = pen.fromArrow || ''
      pen.animateColor = pen.animateColor || '#FA901CFF'
      pen.borderColor = pen.borderColor || '#22222200'
      pen.borderWidth = pen.borderWidth || 0
      pen.color = pen.color || '#222222ff'
      pen.toArrow = pen.toArrow || ''
      pen.borderType = pen.borderType || 0
      pen.lineWidth = pen.lineWidth || 1
      pen.lineDash = pen.lineDash || []
      pen.isNz = pen.isNz || true
      pen.visible = pen.visible || true
      pen.locked = pen.locked || 0
      pen.isBottom = false
      pen.autoPlay = false
    },
    pensActive (pens, e) { // 选中节点
      this.selectPens = pens
      this.modulesDiff(pens[0])
      setTimeout(() => {
        this.$refs.meta2dProps && (this.$refs.meta2dProps.isUpdate = true)
      })
    },
    topoClick (params, e) { // 点击节点
      if (!params.pen && this.$refs.meta2dProps) {
        this.$refs.meta2dProps.activeName = 'canvas'
        this.selectPens = []
      }
      this.showNodeTools()
      this.popDataShowUpdate('', true)
    },
    topTranslate () {
      this.setContextmenu = false
      this.offsetX = getTopology(this.meta2dId).store.data.x
      this.offsetY = getTopology(this.meta2dId).store.data.y
      this.showNodeTools()
      this.popDataShowUpdate('', true)
    },
    topoScale () {
      this.offsetX = getTopology(this.meta2dId).store.data.x
      this.offsetY = getTopology(this.meta2dId).store.data.y
      this.showNodeTools()
      this.popDataShowUpdate('', true)
    },
    penEnter (pen, e) { // 移入节点
      if (this.timer3) {
        clearTimeout(this.timer3)
        this.timer3 = null
      }
      this.position.show = false
      if (!pen.type && pen.data.enable.tooltip) {
        if (!pen.data.tooltip.legends.length) {
          return
        }
        let positionShow = false
        pen.data.tooltip.legends.forEach(item => {
          if (item.legend) {
            positionShow = true
          }
        })
        if (!positionShow) {
          return
        }
        this.chartParams = {
          ...pen.data.tooltip,
          unit: this.params.unit,
          statistic: this.params.statistic
        }
        this.timer3 = setTimeout(() => {
          let ePosition = window.ePosition
          let boxWidth = this.$refs.meta2dBox.offsetWidth
          let boxHeight = this.$refs.meta2dBox.offsetHeight
          this.position.left = ePosition.layerX
          this.position.top = ePosition.layerY
          this.$nextTick(() => {
            if ((boxWidth / 2) > ePosition.layerX) {
              this.position.left = ePosition.layerX + 20
            } else {
              this.position.left = ePosition.layerX - 20 - 400
            }
            if (boxHeight > (ePosition.layerY + 300)) {
              this.position.top = ePosition.layerY + 50
            } else {
              this.position.top = ePosition.layerY - 300
            }
            ePosition = null
            boxWidth = null
            boxHeight = null
          })
          this.position.show = true
          // this.$refs.meta2dTooltip.$refs.panelChart && (this.$refs.meta2dTooltip.$refs.panelChart.loading = false)
          clearTimeout(this.timer3)
        }, 100)
      }
    },
    penLeave () {
      if (!this.timer3) {
        this.timer3 = setTimeout(() => {
          this.position.show = false
          this.timer3 = null
        }, 50)
      } else {
        clearTimeout(this.timer3)
        this.timer3 = null
        this.timer3 = setTimeout(() => {
          this.position.show = false
          this.timer3 = null
        }, 50)
      }
    },
    tooltipOver () {
      clearTimeout(this.timer3)
      this.timer3 = null
    },
    tooltipOut () {
      this.timer3 = setTimeout(() => {
        this.position.show = false
        this.timer3 = null
      }, 50)
    },
    updatePens (pen, key) { // 更新对应的节点
      // meta2d.setValue({ id: pen.id, text: 'new text' }, { render: false });
      const obj = { id: pen.id }
      obj[key] = pen[key]
      if (key === 'lineName') {
        getTopology(this.meta2dId).updateLineType(pen, pen[key])
      }
      if (key === 'lineAnimateType') {
        if (!pen[key]) {
          obj.autoPlay = false
        } else {
          obj.autoPlay = true
        }
      }
      if (key === 'x' || key === 'y' || key === 'width' || key === 'height') {
        const findPen = getTopology(this.meta2dId).getPenRect(pen)
        obj[key] = findPen[key]
      }
      if (key === 'image') {
        obj.imageId = pen[key]
        obj.icon = ''
      }
      if (key === 'icon') {
        obj.imageId = pen[key]
        obj.image = ''
      }
      getTopology(this.meta2dId).setValue(obj) // 更新pen
      if (key === 'lineAnimateType') {
        if (!pen[key]) {
          getTopology(this.meta2dId).stopAnimate(pen.id)
          return
        }
        getTopology(this.meta2dId).startAnimate(pen.id)
      }
    },
    exitEdit (isRefresh) {
      this.editFlag = false
      this.position.show = false
      if (isRefresh) {
        this.$emit('reload')
      }
    },
    beforeEdit () {
      this.editFlag = true
      this.contextmenu = {
        left: null,
        top: null,
        bottom: null
      }
      this.position.show = false
    },
    onContextMenu (event) {
      if (!this.setContextmenu) {
        return
      }
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
    },
    contextmenuNone () {
      this.contextmenu = {
        left: null,
        top: null,
        bottom: null
      }
    },
    // 获取module
    getModule () {
      this.projectInfo.loading = true
      this.$get('/monitor/module?pageSize=-1&projectIds=' + this.project.id).then(response => {
        if (response.code === 200) {
          this.projectInfo.loading = false
          this.allModules = JSON.parse(JSON.stringify(response.data.list))
          // this.modulesDiff()
        }
      })
    },
    // 摘除已选择的module 置灰
    modulesDiff (pen) {
      this.modules = this.allModules
      if (getTopology(this.meta2dId) && getTopology(this.meta2dId).store.data.pens) {
        getTopology(this.meta2dId).store.data.pens.forEach(item => {
          if (!item.type && item.moduleId) {
            const findItem = this.modules.find(item1 => item.moduleId == item1.id)
            if (findItem && pen && findItem.id !== pen.moduleId) {
              findItem.disabled = true
            } else {
              findItem.disabled = false
            }
          }
        })
      }
    },
    // 显示module的工具
    showNodeTools (index, pen) {
      this.nodesArr.forEach((item, i) => {
        item.moduleData.show = i == index
      })
    },
    // 具体内容点击
    nodeTools (node, tool) {
      this.moduleId = node.moduleId
      this.moduleName = node.moduleName
      if (tool.id === 'total') {
        this.popDataShowUpdate('', false, node)
        return
      }
      const timer = setTimeout(() => {
        this.popDataShowUpdate(tool.id, false, node)
        clearTimeout(timer)
      }, 100)
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
    getNodesArr () {
      if (!getTopology(this.meta2dId)) return
      this.offsetX = getTopology(this.meta2dId).data().x
      this.offsetY = getTopology(this.meta2dId).data().y
      this.nodesArr = getTopology(this.meta2dId).store.data.pens.filter(item => {
        item.moduleData = {
          moduleId: '',
          moduleName: '',
          show: false,
          error: false,
          expressArr: [],
          expressAllArr: [],
          state: {
            error: false,
            asset: 0,
            alert: 0,
            endpoint: 0
          }
        }
        if (!item.type && item.moduleId) {
          this.$get('stat/module/abnormal', { moduleId: item.moduleId }).then(res => {
            if (res.code == 200) {
              const module = res.data.list[0]
              item.moduleData.state.error = item.moduleData.error = !module.state
              item.moduleData.state.asset = !!module.asset
              item.moduleData.state.alert = !!module.alert
              item.moduleData.state.endpoint = !!module.endpoint
            }
          })
        }
        return !item.type && item.moduleId
      })
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
        this.showNodeTools()
      }
      if (key === 'asset' || key === 'alert' || key === 'endpoint') {
        this.showNodeTools()
      }
    }
  },
  beforeDestroy () {
  }
}
