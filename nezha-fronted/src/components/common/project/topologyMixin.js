import { getTopology } from '@/components/common/js/common'

export default {
  data () {
    return {}
  },
  methods: {
    appPen (pen) {
      console.log(pen)
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
      getTopology(this.topologyIndex).setValue(data)
    },
    pensActive (pens) {
      console.log(pens)
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
      if (!pens.length) return
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
      this.moduleId = ''
      getTopology(this.topologyIndex).centerView()
      this.showNodeTools('')
      this.popDataShowUpdate('', false)
      if (!this.editTopologyFlag) {
        getTopology(this.topologyIndex)
      }
      if (this.$refs.topTool) {
        this.$refs.topTool.scaleNum = parseInt(num * 100)
      }
      this.getNodesArr()
    },
    topoClick (pointAndPen) {
      this.showNodeTools('')
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
    toCenter () {
      if (getTopology(this.topologyIndex)) {
        getTopology(this.topologyIndex).resize()
      }
    }
  }
}
