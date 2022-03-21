<template>
  <div :ref="`chart-canvas-${chartId}`" style="height: 100%;width: 100%;overflow: hidden">
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas chart-svg"></div>
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
  </div>
</template>

<script>
import * as d3 from 'd3'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import '@svgdotjs/svg.panzoom.js'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'chartHexagonD3',
  components: {
    alertLabel
  },
  mixins: [chartMixin, chartFormat, alertLabelMixin],
  props: {
    parentId: {
      type: String,
      default: 'asset-1'
    }
  },
  data () {
    return {
      timer: null,
      HexagonData: [],
      boxWidth: 0,
      boxHeight: 0,
      boxPadding: 5,
      tooltip: {
        x: 0,
        y: 0,
        title: 0,
        value: 0,
        show: false
      },
      svgDom: null,
      spaceBetweenHexa: 3,
      hexagonTimer: null,
      data: {
        nodes: [],
        links: []
      },
      firstInit: true,
      severityData: this.$store.getters.severityData,
      severityDataWeight: this.$store.getters.severityDataWeight
    }
  },
  methods: {
    initChart () {
      this.initHexagon()
    },
    initHexagon () {
      this.data.links.push(...this.chartData[0].links)
      this.data.nodes.push(...this.chartData[0].nodes)
      setTimeout(() => {
        const dom = document.getElementById(`chart-canvas-${this.chartId}`)
        dom.append(this.ForceGraph({ nodes: this.data.nodes, links: this.data.links }, {
          width: dom.offsetWidth,
          height: dom.offsetHeight,
          nodeStrength: -80,
          distanceNum: 150
        }))
        const svg = document.getElementById('svgHex' + this.chartId)
        svg.setAttribute('width', '100%')
        svg.setAttribute('height', '100%')
        // const bbox = svg.getBBox()
        // svg.setAttribute('viewBox', (bbox.x - 10) + ' ' + (bbox.y - 10) + ' ' + (bbox.width + 20) + ' ' + (bbox.height + 20))
      }, 100)
    },
    ForceGraph ({
      nodes, // an iterable of node objects (typically [{id}, …])
      links // an iterable of link objects (typically [{source, target}, …])
    }, {
      nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
      nodeGroup, // given d in nodes, returns an (ordinal) value for color
      nodeGroups, // an array of ordinal values representing the node groups
      nodeTitle, // given d in nodes, a title string
      nodeFill = 'currentColor', // node stroke fill (if not using a group color encoding)
      nodeStroke = '#fff', // node stroke color
      nodeStrokeWidth = 1.5, // node stroke width, in pixels
      nodeStrokeOpacity = 1, // node stroke opacity
      nodeRadius = 35, // node radius, in pixels
      nodeStrength,
      linkSource = ({ source }) => source, // given d in links, returns a node identifier string
      linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
      linkStroke = '#999', // link stroke color
      linkStrokeOpacity = 0.6, // link stroke opacity
      linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
      linkStrokeLinecap = 'round', // link stroke linecap
      linkStrength,
      distanceNum,
      colors = d3.schemeTableau10, // an array of color strings, for the node groups
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      invalidation // when this promise resolves, stop the simulation
    } = {}) {
      const self = this
      const icon = {
        asset: 'data:image/png;base64,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',
        endpoint: 'data:image/png;base64,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',
        datacenter: 'data:image/png;base64,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',
        project: 'data:image/png;base64,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',
        module: 'data:image/png;base64,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'
      }
      // Compute values.
      const N = d3.map(nodes, nodeId).map(intern)
      const LS = d3.map(links, linkSource).map(intern)
      const LT = d3.map(links, linkTarget).map(intern)
      if (nodeTitle === undefined) nodeTitle = (_, i) => N[i]
      const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle)
      const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern)
      const W = typeof linkStrokeWidth !== 'function' ? null : d3.map(links, linkStrokeWidth)
      const L = typeof linkStroke !== 'function' ? null : d3.map(links, linkStroke)

      // Replace the input nodes and links with mutable objects for the simulation.
      nodes = d3.map(nodes, (_, i) => ({ id: N[i], ...nodes[i] }))
      links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }))

      // Compute default domains.
      if (G && nodeGroups === undefined) nodeGroups = d3.sort(G)

      // Construct the scales.
      const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors)

      // Construct the forces.
      const forceNode = d3.forceManyBody()
      const forceLink = d3.forceLink(links).id(({ index: i }) => N[i])
      if (nodeStrength !== undefined) forceNode.strength(nodeStrength)
      if (distanceNum !== undefined) forceLink.distance(distanceNum)
      const simulation = d3.forceSimulation(nodes)
        .force('link', forceLink)
        .force('charge', forceNode)
        .alpha(1)
        .on('tick', ticked)

      const svg = d3.create('svg')
        .attr('id', 'svgHex' + this.chartId)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('style', 'max-width: 100%; height: 100%;')

      const link = svg.append('g')
        .attr('stroke', typeof linkStroke !== 'function' ? linkStroke : null)
        .attr('stroke-opacity', linkStrokeOpacity)
        .attr('stroke-width', typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : null)
        .attr('stroke-linecap', linkStrokeLinecap)
        .selectAll('line')
      let linkCopy = link
        .data(links)
        .join('line')

      const nodeAll = svg.append('g')
        .attr('fill', nodeFill)
        .attr('stroke', nodeStroke)
        .attr('stroke-opacity', nodeStrokeOpacity)
        .attr('stroke-width', nodeStrokeWidth)
        .selectAll('.node')
      let node = nodeAll.data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('id', function (d) { return 'node' + d.id })
        .attr('style', 'cursor:pointer')
        .call(drag(simulation))
        .on('mouseenter', nodeMouseover)// no i18n
        .on('mouseleave', nodeMouseout)// no i18n
        .on('click', showChildren)
      render()
      if (W) linkCopy.attr('stroke-width', ({ index: i }) => W[i])
      if (L) linkCopy.attr('stroke', ({ index: i }) => L[i])
      if (G) node.attr('fill', ({ index: i }) => color(G[i]))
      if (T) node.append('title').text(({ index: i }) => T[i])
      function intern (value) {
        return value !== null && typeof value === 'object' ? value.valueOf() : value
      }

      function ticked () {
        linkCopy
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node
          .attr('transform', function (d) {
            if (d.id === self.parentId && self.firstInit) {
              d.fx = 0
              d.fy = 0
              d.x = 0
              d.y = 0
            }
            return 'translate(' + d.x + ',' + d.y + ')'
          })
      }

      function drag (simulation) {
        function dragstarted (event) {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          // event.subject.fx = event.subject.x
          // event.subject.fy = event.subject.y
        }

        function dragged (event, d) {
          // event.subject.fx = event.x
          // event.subject.fy = event.y
          d3.select(this).raise().attr('x', d.x = event.x).attr('y', d.y = event.y)
          d3.select(this).raise().attr('fx', d.fx = event.x).attr('fy', d.fy = event.y)
        }

        function dragended (event) {
          if (!event.active) simulation.alphaTarget(0)
          // event.subject.fx = null
          // event.subject.fy = null
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      }

      function nodeMouseover (event, d) {
        const paramsId = d.id.split('-')[1]
        d.highlight = true
        if (self.alertLabelId === paramsId) {
          return
        }
        console.log(event, d, 'nodeMouseover')
        self.alertLabelObj = {
          position: {
            left: event.x,
            top: event.y,
            width: 50
          },
          loading: true,
          id: ''
        }
        if (self.timer) {
          clearTimeout(self.timer)
          self.timer = null
        }
        self.timer = setTimeout(() => {
          self.alertLabelId = paramsId
          self.alertLabelObj.id = paramsId
          self.alertLabelType = d.type
          self.alertLabelShow = true
        }, 200)
      }

      function nodeMouseout (event, d) {
        // console.log(d, 'nodeMouseout')
        clearTimeout(self.timer)
        self.timer = null
        d.highlight = false
        self.alertLabelShow = false
        self.alertLabelId = ''
        self.alertLabelObj = {
          position: {
            left: event.x,
            top: event.y,
            width: 50
          },
          loading: false,
          id: ''
        }
        self.alertLabelType = d.type
      }
      function showChildren (event, d, a) {
        console.log(event, d, a, 'showChildren')
        console.log(event.path[0].className.baseVal)
        if (event.path[0].className.baseVal !== 'topology-button') {
          return
        }
        if (d.hasChildren) {
          hideChildren(d)
          return
        }
        d.hasChildren = true
        const params = {
          type: d.type,
          id: d.id
        }
        params.id = params.id.split('-')[1]
        self.$get('/stat/rel', params).then(res => {
          const parentId = d.id
          res.data.nodes = res.data.nodes.filter(item => item.id !== parentId) // 处理连线 node 重复的问题
          res.data.nodes = res.data.nodes.filter(item => item.id !== d.parentId)
          res.data.links = res.data.links.filter(item => item.source !== d.parentId)
          res.data.links = res.data.links.filter(item => item.target !== d.parentId)
          res.data.nodes.forEach(item => {
            item.hasChildren = false
            if (!item.parentId) {
              item.parentId = parentId
            }
            item.radius = self.getRadius(item) // 需要计算 分三级
            item.color = self.getColor(item) // 需要计算 分三级
          })
          nodes.push(...res.data.nodes)
          simulation.stop()
          node = node
            .data(nodes)
            .join(
              enter => enter.append('g').attr('class', 'node')
                .attr('id', function (d) { return 'node' + d.id })
                .call(drag(simulation))
                .on('click', showChildren),
              update => update,
              exit => exit.remove()
            )
          render()
          const reslinks = res.data.links.map((item, index) => {
            return {
              index: links.length + index,
              source: nodes.find(child => child.id === item.source),
              target: nodes.find(child => child.id === item.target)
            }
          })
          links.push(...reslinks)
          links = links.map(d => Object.assign({}, d))
          linkCopy = linkCopy
            .data(links)
            .join('line')
          simulation.nodes(nodes)
          simulation.force('link').links(links)
          simulation.alphaTarget(1).restart().tick()
        })
      }
      function hideChildren (d) {
        console.log(d, 'hideChildren')
        // 创建一个数组 隐藏所有相关联的 节点 连线
        if (d.id) {
          simulation.stop()
          nodes = nodes.filter(child => child.parentId !== d.id)
          node = node
            .data(nodes)
            .join(
              enter => enter.append('g').attr('class', 'node')
                .attr('id', function (d) { return 'node' + d.id })
                .call(drag(simulation))
                .on('click', showChildren),
              update => update,
              exit => exit.remove()
            )
          render()
          links = links.filter(child => (child.source.parentId !== d.id))
          links = links.filter(child => (child.target.parentId !== d.id))
          links = links.map(d => Object.assign({}, d))
          linkCopy = linkCopy
            .data(links)
            .join('line')
          simulation.nodes(nodes)
          simulation.force('link').links(links)
          simulation.alphaTarget(1).restart().tick()
          d.hasChildren = false
        }
      }
      function render () {
        node.append('circle')
          .attr('r', function (d) { return d.radius })
          .attr('fill', function (d) { return d.color })
        node.append('image')// no i18n
          .attr('xlink:href', function (d) { return icon[d.type] }) // No i18n
          .attr('width', function (d) { return d.radius + 'px' })
          .attr('height', function (d) { return d.radius + 'px' })
          .attr('x', function (d) { return d.radius * 1 / 2 * -1 })
          .attr('y', function (d) { return d.radius * 1 / 2 * -1 })
        node.append('rect')
          .attr('width', function (d) { return nodeRadius * 2 + 40 + 'px' })
          .attr('height', '22px')
          .attr('x', function (d) { return nodeRadius * -1 - 20 })
          .attr('y', function (d) { return d.radius * 1 + 5 })
          .attr('style', 'cursor:pointer')
          .attr('class', function (d) { return d.hasChildren ? 'toggle-nodes' : 'hide' })
          .style('fill', '#ffffff')
          .attr('stroke', '#DEDEDE')
          .attr('stroke-width', 1)
          .attr('rx', '4')
          .attr('ry', '4')
        node.append('foreignObject')
          .attr('width', function (d) { return nodeRadius * 2 + 15 + 'px' })
          .attr('height', '20px')
          .attr('x', function (d) { return nodeRadius * -1 - 14 })
          .attr('y', function (d) { return d.radius * 1 + 5 })
          .append('xhtml:div')
          .text(function (d) {
            return d.name
          })
          .attr('style', 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;width: 100%;color: #666 ;font-size:14px;line-height:20px')
          // .attr('font-size', 14)
          // .attr('stroke', '#6666')
          // .attr('stroke-width', 1)
        // .attr('width', nodeRadius * 2 + 10 + 'px')
          // .attr('height', '5px')
        node.append('rect')
          .attr('x', function (d) { return nodeRadius * 1 - 2 })
          .attr('y', function (d) { return d.radius * 1 + 5 })
          .attr('height', '22px')
          .attr('width', '22px')
          .style('fill', function (d) { return d.hasChildren ? '#f9f9f9' : '#ffffff' })
          .attr('stroke', function (d) { return d.hasChildren ? '#DEDEDE' : '#FA901C' })
          .attr('stroke-width', 1)
          .attr('rx', '4')
          .attr('ry', '4')
          .attr('class', 'topology-button')
        const button = node.append('svg')
          .attr('width', '14px')
          .attr('height', '14px')
          .attr('x', function (d) { return nodeRadius * 1 + 2 })
          .attr('y', function (d) { return d.radius * 1 + 9 })
          .attr('style', 'cursor:pointer')
          .attr('class', function (d) { return d.hasChildren ? 'toggle-nodes topology-button' : 'hide topology-button' })
          .attr('viewBox', '0 0 512 512')
        button.append('polygon')
          .attr('points', '508.3,204.302 508.3,94.372 232.104,94.372 232.104,119.163 2.128,119.163 2.128,148.02 103.282,148.02   103.282,395.751 104.073,395.751 104.073,395.879 231.416,395.879 231.416,433.091 507.612,433.091 507.612,323.161   231.416,323.161 231.416,365.65 135.572,365.65 135.572,148.02 232.104,148.02 232.104,204.302 ')
          .attr('fill', function (d) { return d.hasChildren ? '#666666' : '#FA901C' })
          .attr('class', 'topology-button')
          // .off('click', showChildren.bind(this, '2'))
          // .on('click', showChildren.bind(this, '2'))
        node.attr('class', function (d) {
          let cl = 'node'
          if (d.hasChildren && (d.expanded == undefined || (d.expanded != undefined && d.expanded == false))) {
            cl += ' closed'
          }
          return cl
        })
        node.attr('fixed', false)
      }
      setTimeout(() => {
        self.firstInit = false
      }, 1000)
      return Object.assign(svg.node(), { scales: { color } })
    },
    setPosition (e) {
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      const box = document.getElementById(`chart-canvas-tooltip-${this.chartId}`)
      if (box) {
        const boxWidth = box.offsetWidth
        const boxHeight = box.offsetHeight
        if (e.pageX < (windowWidth / 2)) { // 说明鼠标在左边放不下提示框
          this.tooltip.x = e.pageX + 15
        } else {
          this.tooltip.x = e.pageX - boxWidth - 15
        }
        if (e.pageY + 50 + boxHeight < windowHeight) { // 说明鼠标上面放不下提示框
          this.tooltip.y = e.pageY + 15
        } else {
          this.tooltip.y = e.pageY - boxHeight - 10
        }
      } else {
        this.tooltip.y = e.pageY + 15
        this.tooltip.x = e.pageX + 15
      }
    },
    showChildren () {
      this.upDate()
    },
    getRadius (item) {
      let sum = 0
      item.alert && item.alert.forEach(alert => {
        sum += alert.num
      })
      if (sum === 0) {
        return 15
      } else if (sum <= 10) {
        return 25
      } else {
        return 35
      }
    },
    getColor (item) {
      const arr = []
      let color = ''
      item.alert && item.alert.forEach(alert => {
        arr.push(alert.priority)
      })
      this.severityDataWeight.forEach(severity => {
        if (arr.indexOf(severity.name) !== -1 && !color && severity.num > 0) {
          color = severity.color
        }
      })
      if (!arr.length || !color) {
        color = '#23bf9a'
      }
      return color
    },
    upDate () {

    }
  },
  created () {
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>

<style scoped>

</style>
