import { getTopology } from '@/components/common/js/common'

export default {
  data () {
    return {}
  },
  methods: {
    appPen (pen) {
      this.modulesDiff()
      const data = pen[0]
      if (data.type === 0 && !data.data.moduleId) {
        data.background = '#FFFFFF00'
        data.color = '#333333'
        data.borderColor = '#333333'
        data.textColor = '#333333'
        data.fontSize = 12
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
          url: ''
        }
      } else if (data.type == 1) {
        // 连线是否自动计算锚点
        // data.manualCps=true;
        data.background = '#FFFFFF00'
        data.color = '#333333'
        data.borderColor = '#333333'
        data.textColor = '#333333'
        data.fontSize = 12
        data.autoPolyline = true
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
      const obj = this.$loadsh.cloneDeep(data)
      delete obj.x
      delete obj.y
      delete obj.center
      delete obj.ex
      delete obj.ey
      delete obj.width
      delete obj.height
      getTopology(this.topologyIndex).setValue(obj)
    },
    pensActive (pens) {
      this.props = {
        node: null,
        line: null,
        multi: false,
        expand: null,
        nodes: null,
        locked: null,
        pen: null,
        pens: null
      }
      if (!pens.length || !this.editTopologyFlag) return
      this.$nextTick(() => {
        if (pens.length == 1) {
          this.modulesDiff && this.modulesDiff(pens[0])
          if (pens[0].data.expressArr.length === 0) {
            pens[0].data.expressArr.push('')
            pens[0].data.legends.push('')
          }
          if (pens[0].data.expressAllArr.length === 0) {
            pens[0].data.expressAllArr.push('')
            pens[0].data.legendsAll.push('')
          }
          this.props = {
            line: null,
            multi: false,
            expand: this.props.expand,
            nodes: null,
            locked: pens[0].locked,
            pen: pens[0],
            pens: pens
          }
        } else {
          this.props = {
            line: null,
            multi: false,
            expand: this.props.expand,
            nodes: null,
            locked: false,
            pen: null,
            pens: pens
          }
        }
      })
      return pens
    },
    topTranslate () {
      this.moduleId = ''
      this.showNodeTools('')
      this.popDataShowUpdate('', false)
      if (!this.editTopologyFlag) {
        getTopology(this.topologyIndex)
      }
      this.getNodesArr()
    },
    topoScale (num) {
      if (this.$refs.topTool) {
        this.$refs.topTool.scaleNum = parseInt(num * 100)
      }
    },
    topoClick (pointAndPen) {
      this.showNodeTools('')
      this.tooltipPosition.show = false
      if (!pointAndPen.pen) {
        this.props = {
          node: null,
          line: null,
          multi: false,
          expand: null,
          nodes: null,
          locked: null,
          pen: null,
          pens: null
        }
      }
    },
    penEnter (pen) {
      if (this.timer3) {
        clearTimeout(this.timer3)
        this.timer3 = null
      }
      this.chartData = { ...pen.data, ...this.chartGetData.find(item => item.id === pen.id) }
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
    },
    penLeave (pen) {
      if (!this.timer3) {
        this.timer3 = setTimeout(() => {
          this.tooltipPosition.show = false
          this.timer3 = null
        }, 50)
      } else {
        this.timer3 = setTimeout(() => {
          this.tooltipPosition.show = false
          this.timer3 = null
        }, 50)
      }
    },
    toCenter () {
      if (getTopology(this.topologyIndex)) {
        getTopology(this.topologyIndex).resize()
      }
    }
  }
}
