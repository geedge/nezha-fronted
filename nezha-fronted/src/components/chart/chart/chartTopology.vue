<template>
  <div :ref="`chart-canvas-${chartId}`" style="height: 100%;width: 100%">
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas chart-svg"></div>
    <div :class="`chart-canvas-tooltip-${chartId}`" :id="`chart-canvas-tooltip-${chartId}`" class="chart-canvas-tooltip" :style="{left:tooltip.x+'px',top:tooltip.y+'px'}" v-if="tooltip.show">
      <div class="chart-canvas-tooltip-title tooltip-title">
        {{tooltip.title}}
      </div>
      <div class="chart-canvas-tooltip-content">
        <div>value</div>
        <div>{{tooltip.value}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import '@svgdotjs/svg.panzoom.js'
export default {
  name: 'chartHexagonD3',
  mixins: [chartMixin, chartFormat],
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
      }
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
        console.log(dom, `chart-canvas-${this.chartId}`)
        dom.append(this.ForceGraph({ nodes: this.data.nodes, links: this.data.links }))
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
      nodeRadius = 5, // node radius, in pixels
      nodeStrength,
      linkSource = ({ source }) => source, // given d in links, returns a node identifier string
      linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
      linkStroke = '#999', // link stroke color
      linkStrokeOpacity = 0.6, // link stroke opacity
      linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
      linkStrokeLinecap = 'round', // link stroke linecap
      linkStrength,
      colors = d3.schemeTableau10, // an array of color strings, for the node groups
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      invalidation // when this promise resolves, stop the simulation
    } = {}) {
      console.log(nodes, nodeId)
      const self = this
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
      nodes = d3.map(nodes, (_, i) => ({ id: N[i] }))
      links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }))

      // Compute default domains.
      if (G && nodeGroups === undefined) nodeGroups = d3.sort(G)

      // Construct the scales.
      const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors)

      // Construct the forces.
      const forceNode = d3.forceManyBody()
      const forceLink = d3.forceLink(links).id(({ index: i }) => N[i])
      // if (nodeStrength !== undefined) forceNode.strength(nodeStrength)
      const simulation = d3.forceSimulation(nodes)
        .force('link', forceLink)
        .force('charge', forceNode)
        .on('tick', ticked)

      const svg = d3.create('svg')
        .attr('id', 'svgHex' + this.chartId)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

      const link = svg.append('g')
        .attr('stroke', typeof linkStroke !== 'function' ? linkStroke : null)
        .attr('stroke-opacity', linkStrokeOpacity)
        .attr('stroke-width', typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : null)
        .attr('stroke-linecap', linkStrokeLinecap)
        .selectAll('line')
        .data(links)
        .join('line')

      const node = svg.append('g')
        .attr('fill', nodeFill)
        .attr('stroke', nodeStroke)
        .attr('stroke-opacity', nodeStrokeOpacity)
        .attr('stroke-width', nodeStrokeWidth)
        .selectAll('.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('id', function (d) { return 'node' + d.id })
        .call(drag(simulation))
      node.append('circle')
        .attr('r', nodeRadius)
      node.append('svg') // no i18n
        .attr('width', '5px')// No i18n
        .attr('height', '5px')// No i18n
        .attr('x', 5)// No i18n
        .attr('y', 5)// No i18n
        .attr('style', 'cursor:pointer')// No i18n
        .attr('class', function (d) { return d.hasChildren ? 'toggle-nodes' : 'hide' })// No i18n
        .attr('viewBox', '0 0 512 512') // No i18n
        .append('polygon').attr('points', '508.3,204.302 508.3,94.372 232.104,94.372 232.104,119.163 2.128,119.163 2.128,148.02 103.282,148.02   103.282,395.751 104.073,395.751 104.073,395.879 231.416,395.879 231.416,433.091 507.612,433.091 507.612,323.161   231.416,323.161 231.416,365.65 135.572,365.65 135.572,148.02 232.104,148.02 232.104,204.302 ') // no i18n
        .on('click', showChildren) // no i18n
      node.attr('class', function (d) {
        let cl = 'node'
        if (d.hasChildren && (d.expanded == undefined || (d.expanded != undefined && d.expanded == false))) {
          cl += ' closed'
        }
        return cl
      })
      node.attr('fixed', false)
      if (W) link.attr('stroke-width', ({ index: i }) => W[i])
      if (L) link.attr('stroke', ({ index: i }) => L[i])
      if (G) node.attr('fill', ({ index: i }) => color(G[i]))
      if (T) node.append('title').text(({ index: i }) => T[i])
      function intern (value) {
        return value !== null && typeof value === 'object' ? value.valueOf() : value
      }

      function ticked () {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        node
          .attr('transform', function (d) {
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

      function nodeMouseover (d) {
        console.log(d, 'nodeMouseover')
      }

      function nodeMouseout (d) {
        console.log(d, 'nodeMouseout')
      }
      function showChildren (event, d) {
        console.log(event,d)
      }
      return Object.assign(svg.node(), { scales: { color } })
    },
    update (nodes, links) {
      const force = d3.forceSimulation()
      force.nodes(nodes)
      force.force('link').links(links)//
    },
    hexagonOver (that, e) { // 移入六边形
      this.tooltip.title = that.alias
      this.tooltip.value = that.showValue
      this.tooltip.show = true
      this.setPosition(e)
    },
    hexagonMove (e) { // 六边形内移动
      if (this.tooltip.show) {
        this.setPosition(e)
      }
    },
    hexagonOut (that) {
      this.tooltip.show = false
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
