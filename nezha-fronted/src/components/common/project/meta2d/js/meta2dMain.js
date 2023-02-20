import { Meta2d, registerNode } from '@meta2d/core'
import { flowPens } from '@meta2d/flow-diagram'
import { activityDiagram } from '@meta2d/activity-diagram'
import { classPens } from '@meta2d/class-diagram'
import { sequencePens, sequencePensbyCtx } from '@meta2d/sequence-diagram'
// import { chartsPens } from '@meta2d/le5le-charts'
import {
  Tools,
  canvasRegister,
  imageTemp,
  onChangeAnimate,
  onChangeAnimateLine,
  myCubec,
  myCubeAnchors
} from '../../L5/services/canvas.js'
import { getTopology, setTopology, dealImg, topologyImg } from '@/components/common/js/common'
export default {
  data () {
    return {
      selectPens: [],
      editFlag: false,
      prevFlag: false,
      meta2dLoading: true
    }
  },
  mounted () {
  },
  methods: {
    init () {
      const meta2dOptions = {}
      const meta2d = new Meta2d(this.meta2dId, meta2dOptions)
      meta2d.register(flowPens())
      meta2d.register(activityDiagram())
      meta2d.register(classPens())
      meta2d.register(sequencePens())
      meta2d.registerCanvasDraw(sequencePensbyCtx())
      // meta2d.registerCanvasDraw(formPens())
      // meta2d.registerCanvasDraw(chartsPens())
      /* 画布绑定事件 */
      meta2d.beforeAddPens = (pens) => { // 添加画笔前
        if (pens.length === 1) {
          if (!pens[0].type) {
            this.nodeInit(pens[0])
          } else {
            this.lineInit(pens[0])
          }
        }
        return true
      }
      // getTopology(this.topoData)).on('translate', this.topTranslate) // 平移·
      meta2d.on('active', this.pensActive) // 选中·
      // meta2d.on('scale', this.topoScale) // 缩放·
      // meta2d.on('translatePens', () => {}) // 移动画笔结束·
      // meta2d.on('translatingPens', () => {}) // 移动画笔进行中·
      meta2d.on('enter', this.penEnter) // 移入画笔·
      meta2d.on('leave', this.penLeave) // 移出画笔·
      // meta2d.on('add', this.appPen) // 添加新画笔·
      meta2d.on('click', this.topoClick) // click画笔·
      setTopology(this.meta2dId, meta2d)
    },
    reload () {
      const endTime = new Date().getTime()
      const startTime = endTime - 60 * 5 * 1000
      this.getQueryValues(this.querysArray, startTime, endTime).then((arr) => {
        this.clacTopoData(this.topoData, arr).then((data) => {
          console.log(data)
          getTopology(this.meta2dId).resize()
          getTopology(this.meta2dId).open(data)
          getTopology(this.meta2dId).centerView()
          getTopology(this.meta2dId).lock(1)
        })
      })
    },
    clacTopoData (data, queryValues) { // 主要处理 属性为原始属性 处理动画属性对原始属性的影响
      return new Promise(resolve => {
        if (!data.pens) {
          data.pens = []
        }
        data.pens.forEach(pen => {
          if (pen.isNz) {
            if (pen.data.legend) {

            }
          } else {
            // 处理加载数据
          }
        })
        resolve(data)
      })
    },
    nodeInit (pen) { // 初始化节点参数
      pen.data = {
        params: { // 用于编辑时 重置为节点初始状态
          background: '#22222200',
          color: '#222222ff',
          textColor: '#222222ff',
          image: ''
        },
        imageId: '',
        valueMapping: [],
        legend: '',
        statistic: '',
        enable: {
          valueMapping: true,
          tooltip: true
        },
        tooltip: {
          title: '',
          titleShow: true,
          chartType: 'line',
          content: '',
          legends: [] // {legend: '' , alias}
        }
      }
      pen.isNz = true
      pen.background = '#22222200'
      pen.textAlign = 'center'
      pen.textBaseline = 'middle'
      pen.color = '#222222ff'
      pen.textColor = '#222222ff'
      pen.image = ''
      pen.imageId = ''
      pen.imageRatio = false
      pen.ratio = false
      pen.rotate = 0
      pen.globalAlpha = 1
      pen.borderType = 0
      pen.lineWidth = 1
      pen.lineDash = []
      pen.borderRadius = 0
      pen.paddingTop = 5
      pen.paddingBottom = 5
      pen.paddingLeft = 5
      pen.paddingRight = 5
    },
    lineInit (pen) { // 初始化连线参数
      pen.data = {
        params: {
          animateColor: '#FA901CFF',
          borderColor: '#22222200',
          color: '#222222FF'
        },
        valueMapping: [],
        legend: '',
        statistic: '',
        enable: {
          valueMapping: true,
          tooltip: true
        },
      }
      pen.disableInput = true
      pen.lineAnimateType = 0
      pen.animateSpan = 1
      pen.animateReverse = false
      pen.fromArrow = ''
      pen.animateColor = '#FA901CFF'
      pen.borderColor = '#22222200'
      pen.borderWidth = 0
      pen.color = '#222222ff'
      pen.toArrow = ''
      pen.borderType = 0
      pen.lineWidth = 1
      pen.lineDash = []
      pen.isNz = true
    },
    pensActive (pens, e) { // 选中节点
      this.selectPens = pens
    },
    topoClick (params, e) { // 点击节点
      if (!params.pen && this.$refs.meta2dProps) {
        this.$refs.meta2dProps.activeName = 'canvas'
        this.selectPens = []
      }
    },
    penEnter (pens) { // 移入节点
      // console.log(pens)
    },
    penLeave (pens) { // 移出节点
      // console.log(pens)
    },
    updatePens (pen, key) { // 更新对应的节点
      // meta2d.setValue({ id: pen.id, text: 'new text' }, { render: false });
      const obj = { id: pen.id }
      obj[key] = pen[key]
      if (key === 'lineName') {
        getTopology(this.meta2dId).updateLineType(pen, pen[key])
      }
      getTopology(this.meta2dId).setValue(obj)
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
      if (isRefresh) {
        this.$emit('reload')
      }
    }
  }
}
