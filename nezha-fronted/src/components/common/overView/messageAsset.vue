<template>
  <div style="width: 100%;height: 100%" v-my-loading="loading">
    <hexagonBox
      ref="hexagonBox"
      :hexData="data"
      :col="col"
      :length="length"
      :colorFrom="'level'"
      :colorSet="colorSet"
      :infoSet="infoSet"
      :infoShow="infoShow"
      :infoHide="infoHide"
      :hexagonEdge="hexagonEdge"
      :from="from"
      :hexagonSvgID="hexagonSvgID"
      :showTooltip="showTooltip"
      @changeAsset="changeAsset"
      @assetMove="assetMove"
      @closeAsset="closeAsset"
    />
    <alertLabel
      v-if="showTooltip&&assetData.show"
      v-my-loading="assetData.loading"
      ref="alertLabel"
      :id="assetData.id"
      :that="assetData"
      :type="fromType"
      :LRTriangle="LRTriangle"
      :style="{
        'transform-origin': `0px 300px`,
        transform:`scale(${assetData.rate})`
      }"
    ></alertLabel>
  </div>
</template>

<script>
import hexagonBox from '../honeycomb/hexagonFigureSvg'
import alertLabel from '../alert/alertLabel2'
function textMouseDown (e) {
  window.event ? window.event.cancelBubble = true : e.stopPropagation()
}
// eslint-disable-next-line no-unused-vars
function textMouseEnter (e) {
  window.event ? window.event.cancelBubble = true : e.stopPropagation()
}
// eslint-disable-next-line no-unused-vars
function textMouseLeave (e) {
  window.event ? window.event.cancelBubble = true : e.stopPropagation()
}
export default {
  name: 'messageAsset',
  components: {
    hexagonBox,
    alertLabel
  },
  props: {
    data: {},
    col: {},
    length: {},
    from: {},
    hexagonSvgID: {
      type: String
    },
    showTooltip: {
      type: Boolean,
      default: false
    },
    fromType: {
      type: String
    }
  },
  watch: {
    data: {
      immediate: false,
      deep: true,
      handler () {
      }
    },
    col: {
      immediate: false,
      deep: true,
      handler () {
      }
    },
    length: {
      immediate: false,
      deep: true,
      handler () {
      }
    }

  },
  data () {
    return {
      hexagonEdge: 90,
      loading: false,
      assetData: {
        id: '',
        loading: false,
        show: false,
        rate: 1,
        position: {
          top: 0,
          left: 0,
          mt: 0
        }
      },
      boxWidth: '',
      LRTriangle: true, // true 左三角 false 右
      timer: null
    }
  },
  methods: {
    colorSet (item) { // 设置方块颜色
      // let color = item.level==='P1'?'#FAAFAF':(item.level==='P2'?'#FFCF92':'#99D7C2');
      // let color = level ==='P1'?'#FAAFAF':(level==='P2'?'#FFCF92':'#99D7C2');
      const alert = item.alert[0]
      if (alert.P1 > 0) {
        return {
          color: '#DA4D4D',
          hoverColor: '#E87F7F'
        }
      } else if (alert.P2 > 0) {
        return {
          color: '#FFAB99',
          hoverColor: '#FABEB2'
        }
      } else if (alert.P3 > 0) {
        return {
          color: '#FFCF92',
          hoverColor: '#FFE0B8'
        }
      } else {
        return { color: '#99D7C2', hoverColor: '#B2ECD9' }
      }
    },
    infoSet (group, allHexagonRect, allHexagonText, data, item, fontSize, that) {
      // 设置内部文本
      // group 对应六边形所在的组。allHexagonRect吧所有文本框放入，方便控制显示隐藏。data 六边形的相关数 data.center 中心点。that 子组件实例
      const rgbColor = '0,0,0'
      let str = ''
      let textPaddingWidth = ''
      let textPaddingHeight = ''
      const rect0 = group.rect(that.hexagonEdge + 20, that.hexagonEdge / 3)
        .attr({
          x: data.center[0] - that.hexagonEdge / 2 - 10,
          y: data.center[1] - that.hexagonEdge,
          rx: 5,
          ry: 5
        }).fill({ color: `rgba(${rgbColor},0)` }).data({ color: rgbColor })
      str = this.from === 'asset' ? item.name : item.name
      str += ''
      if (str.length >= 15) {
        str = str.slice(0, 12) + '...'
      }
      const text0 = group.text(str).attr({ x: 0, y: 0, style: 'cursor:text' }).font({ size: fontSize }).fill({ opacity: 0, color: '#fff', weight: 600, cursor: 'text' })
      textPaddingWidth = (that.hexagonEdge + 20) - (text0.bbox().width)
      textPaddingHeight = (that.hexagonEdge / 3) - (text0.bbox().height)
      text0.attr({
        x: data.center[0] - that.hexagonEdge / 2 - 10 + textPaddingWidth / 2,
        y: data.center[1] - that.hexagonEdge + textPaddingHeight / 2 - 4
      }).hide()
      allHexagonRect.push(rect0)
      allHexagonText.push(text0)
      text0.on('mousedown', textMouseDown)

      const rect1 = group.rect(that.hexagonEdge + 20, that.hexagonEdge / 3)
        .attr({
          x: data.center[0] - that.hexagonEdge / 2 - 10,
          y: data.center[1] - that.hexagonEdge / 2 - 7.5,
          rx: 6,
          ry: 6
        }).fill({ color: `rgba(${rgbColor},0)` }).data({ color: rgbColor })
      str = 'P1 : ' + item.alert[0].P1
      if (str.length >= 15) {
        str = str.slice(0, 12) + '...'
      }
      const text1 = group.text(str).attr({ x: 0, y: 0, style: 'cursor:default' }).font({ size: fontSize }).fill({ opacity: 0, color: '#fff', weight: 600, cursor: 'default' })
      textPaddingWidth = (that.hexagonEdge + 20) - (text1.bbox().width)
      textPaddingHeight = (that.hexagonEdge / 3) - (text1.bbox().height)
      text1.attr({
        x: data.center[0] - that.hexagonEdge / 2 - 10 + textPaddingWidth / 2,
        y: data.center[1] - that.hexagonEdge / 2 - 7.5 + textPaddingHeight / 2 - 4
      }).hide()

      allHexagonRect.push(rect1)
      allHexagonText.push(text1)

      const rect2 = group.rect(that.hexagonEdge + 20, that.hexagonEdge / 3).attr({
        x: data.center[0] - that.hexagonEdge / 2 - 10,
        y: data.center[1] - that.hexagonEdge / 2 + that.hexagonEdge / 3 + 0.5,
        rx: 6,
        ry: 6
      }).fill({ color: `rgba(${rgbColor},0)` }).data({ color: rgbColor })
      str = 'P2 : ' + item.alert[0].P2
      if (str.length >= 15) {
        str = str.slice(0, 12) + '...'
      }
      const text2 = group.text(str).attr({ x: 0, y: 0, style: 'cursor:default' }).font({ size: fontSize }).fill({ opacity: 0, color: '#fff', weight: 600, cursor: 'default' })
      textPaddingWidth = (that.hexagonEdge + 20) - (text2.bbox().width)
      textPaddingHeight = (that.hexagonEdge / 3) - (text2.bbox().height)
      text2.attr({
        x: data.center[0] - that.hexagonEdge / 2 - 10 + textPaddingWidth / 2,
        y: data.center[1] - that.hexagonEdge / 2 + that.hexagonEdge / 3 + 0.5 + textPaddingHeight / 2 - 4
      }).hide()
      allHexagonRect.push(rect2)
      allHexagonText.push(text2)

      const rect3 = group.rect(that.hexagonEdge + 20, that.hexagonEdge / 3)
        .attr({
          x: data.center[0] - that.hexagonEdge / 2 - 10,
          y: data.center[1] - that.hexagonEdge / 2 + that.hexagonEdge / 3 * 2 + 5.5,
          rx: 6,
          ry: 6
        }).fill({ color: `rgba(${rgbColor},0)` }).data({ color: rgbColor })
      str = 'P3 : ' + item.alert[0].P3
      if (str.length >= 15) {
        str = str.slice(0, 12) + '...'
      }
      const text3 = group.text(str).attr({ x: 0, y: 0, style: 'cursor:default' }).font({ size: fontSize }).fill({ opacity: 0, color: '#fff', weight: 600, cursor: 'default' })
      textPaddingWidth = (that.hexagonEdge + 20) - (text3.bbox().width)
      textPaddingHeight = (that.hexagonEdge / 3) - (text3.bbox().height)
      text3.attr({
        x: data.center[0] - that.hexagonEdge / 2 - 10 + textPaddingWidth / 2,
        y: data.center[1] - that.hexagonEdge / 2 + that.hexagonEdge / 3 * 2 + 5.5 + textPaddingHeight / 2 - 4
      }).hide()

      allHexagonRect.push(rect3)
      allHexagonText.push(text3)
    },
    infoShow (allHexagonRect, allHexagonText) {
      allHexagonRect.forEach(item => {
        const rgbColor = item.data('color')
        item.fill({ color: `rgba(${rgbColor},0.2)` })
      })
      allHexagonText.forEach(item => {
        item.fill({ opacity: 1 }).show()
      })
    },
    infoHide (allHexagonRect, allHexagonText) {
      allHexagonRect.forEach(item => {
        const rgbColor = item.data('color')
        item.fill({ color: `rgba(${rgbColor},0)` })
      })
      allHexagonText.forEach(item => {
        item.fill({ opacity: 0 }).hide()
      })
    },
    changeAsset (data, e) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.assetData.id = data
      const boxWidth = document.getElementsByClassName('list-page')[0].offsetWidth
      this.boxWidth = boxWidth
      // this.assetData.rate=window.screen.height/1297;
      this.$nextTick(() => {
        this.assetData.show = true
        this.$nextTick(() => {
          this.calcPosition(e)
        })
      })
    },
    assetMove (e) {
      if (!this.assetData.show) { return }
      this.calcPosition(e)
    },
    calcPosition (e) {
      const boxWidth = this.boxWidth
      const distance = this.fromType === 'asset' ? 300 : 50
      const minus = (e.pageY - distance) + this.$refs.alertLabel.$el.offsetHeight - window.innerHeight
      // window.innerHeight
      if (minus <= 0) {
        this.assetData.position.top = e.pageY - distance
        this.assetData.position.mt = distance
      } else if (minus > 0) {
        this.assetData.position.top = window.innerHeight - this.$refs.alertLabel.$el.offsetHeight
        this.assetData.position.mt = e.pageY - (window.innerHeight - this.$refs.alertLabel.$el.offsetHeight)
      }
      if (boxWidth / 2 > e.pageX - 200) {
        this.assetData.position.left = e.pageX + 35
        this.assetData.position.right = 0
        this.LRTriangle = true
      } else {
        this.assetData.position.right = window.innerWidth - (e.pageX - 35)
        this.assetData.position.left = 0
        this.LRTriangle = false
      }
    },
    closeAsset () {
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.assetData.show = false
          this.timer = null
        }, 100)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.assetData.show = false
          this.timer = null
        }, 100)
      }
    },
    endLoading () {
      this.loading = false
    },
    startLoading () {
      this.loading = true
    }
  }
}
</script>
