<template>
  <div :ref="`chart-canvas-${chartId}`" style="height: 100%;width: 100%;overflow: hidden">
    <div :id="`chart-canvas-${chartId}`" class="chart__canvas chart-svg"></div>
    <div class="graph-icon-info-box">
      <div v-for="(item,index) in graphIconArr" :key="index">
        <div class="graph-icon-content" @mouseenter="graphIconEnter(item)" @mouseleave="graphIconLeave(item)">
          <i :class="item.class"/><span class="graph-icon-label">{{item.label}}</span>
        </div>
      </div>
    </div>
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
import lodash from 'lodash'
import { systemIcon } from '@/components/common/js/constants'
export default {
  name: 'chartTopologyD3',
  components: {
    alertLabel
  },
  mixins: [chartMixin, chartFormat, alertLabelMixin],
  props: {
    parentId: {
      type: String,
      default: ''
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
      severityDataWeight: this.$store.getters.severityDataWeight,
      distanceArr: [80, 130, 170, 210, 230, 260],
      isDrag: false,
      highlightId: '',
      highlightAll: [],
      radiusArr: [14, 20, 27],
      graphIconArr: [],
      nzIcon: [
        { class: 'nz-icon nz-icon-overview-project', type: 'asset', label: this.$t('overall.asset') },
        { class: 'nz-icon nz-icon-Datacenter2', type: 'datacenter', label: this.$t('overall.dc') },
        { class: 'nz-icon nz-icon-project', type: 'project', label: this.$t('overall.project') },
        { class: 'nz-icon nz-icon-overview-module', type: 'module', label: this.$t('overall.module') },
        { class: 'nz-icon nz-icon-overview-endpoint', type: 'endpoint', label: this.$t('asset.endpoint') }
      ]
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
          nodeStrength: -30,
          distanceNum: 150
          // distanceMin: -100
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
      linkStrokeWidth = 2, // given d in links, returns a stroke width in pixels
      linkStrokeLinecap = 'round', // link stroke linecap
      linkStrength,
      distanceMin,
      distanceMax,
      distanceNum,
      colors = d3.schemeTableau10, // an array of color strings, for the node groups
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      invalidation // when this promise resolves, stop the simulation
    } = {}) {
      const self = this
      const icon = {
        ...systemIcon
      }
      // Compute values.
      const circleAll = ''
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
      links = d3.map(links, (_, i) => ({ ...links[i], source: LS[i], target: LT[i] }))
      // Compute default domains.
      if (G && nodeGroups === undefined) nodeGroups = d3.sort(G)

      // Construct the scales.
      const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors)

      // Construct the forces.
      const forceNode = d3.forceManyBody()
      const forceLink = d3.forceLink(links).id(({ index: i }) => N[i])
      if (nodeStrength !== undefined) forceNode.strength(nodeStrength)
      // if (distanceMin !== undefined) forceNode.strength(distanceMin)
      // if (distanceMax !== undefined) forceNode.strength(distanceMax)
      if (distanceNum !== undefined) {
        forceLink.distance(function (d) {
          if (!d.random) {
            d.random = Math.floor(Math.random() * (5 + 1))
          }
          return self.distanceArr[d.random]
        })
      }
      const zoom = d3.zoom()
        .scaleExtent([0.3, 4])
        .on('zoom', zoomed)
      // const forceCollide = d3.forceCollide()
      //   .radius(function (d) { return d.radius })
      const simulation = d3.forceSimulation(nodes)
        .force('link', forceLink)
        .force('charge', forceNode)
        // .force('collide', forceCollide)
        .alpha(1)
        .alphaMin(0.3)
        .alphaDecay(0)
        .on('tick', ticked)

      const svgBox = d3.create('svg')
        .attr('id', 'svgHex' + this.chartId)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('style', 'max-width: 100%; height: 100%;')
        .on('click', reset)
      const svg = svgBox.append('g')
      // 箭头
      const arrowPath = 'M2,2 L8,4 L2,6 L2,2'
      const defs = svg.append('defs')
      self.radiusArr.forEach(radiusItem => {
        defs.append('marker')
          .attr('id', `arrow${radiusItem}`)
          .attr('markerUnits', 'strokeWidth')
          .attr('markerWidth', '60')
          .attr('markerHeight', '60')
          .attr('viewBox', '0 0 60 60')
          .attr('refX', radiusItem / 2 + 8)
          .attr('refY', '4')
          .attr('orient', 'auto')
          .append('path')
          .attr('d', arrowPath)
          .attr('fill', '#000')
      })
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
        .attr('class', 'node animation')
        .attr('id', function (d) {
          return 'node' + d.id
        })
        .attr('style', function (d) {
          let str = 'opacity:'
          str += 1
          return str + ';cursor:pointer'
        })
        .call(drag(simulation))
        .on('mouseleave', nodeMouseout)
        .on('click', showChildren)
      render()
      if (W) linkCopy.attr('stroke-width', ({ index: i }) => W[i])
      if (L) linkCopy.attr('stroke', ({ index: i }) => L[i])
      if (G) node.attr('fill', ({ index: i }) => color(G[i]))
      // if (T) node.append('title').text(({ index: i }) => T[i])

      function intern (value) {
        return value !== null && typeof value === 'object' ? value.valueOf() : value
      }

      function ticked () {
        linkCopy
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
          .attr('marker-end', function (d) {
            return `url(#arrow${d.target.radius})`
          })
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
          if (self.timer2) {
            clearTimeout(self.timer2)
            self.timer2 = null
          }
          self.isDrag = true
          if (!event.active) simulation.restart()
          // event.subject.fx = event.subject.x
          // event.subject.fy = event.subject.y
        }

        function dragged (event, d) {
          // event.subject.fx = event.x
          // event.subject.fy = event.y
          self.isDrag = false
          d3.select(this).raise().attr('x', d.x = event.x).attr('y', d.y = event.y)
          d3.select(this).raise().attr('fx', d.fx = event.x).attr('fy', d.fy = event.y)
        }

        function dragended (event) {
          self.isDrag = false
          if (self.timer2) {
            clearTimeout(self.timer2)
            self.timer2 = null
          }
          simulation.alphaTarget(0)
          simulation.stop()
          // self.timer2 = setTimeout(() => {
          //   if (!event.active) simulation.alphaTarget(0)
          //   simulation.stop()
          // }, 5000)
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      }

      function highlightNode (id) {
        self.highlightAll.push(id)
        links.forEach(item => {
          if (item.source.id === id) {
            self.highlightAll.push(item.target.id)
          }
          if (item.target.id === id) {
            self.highlightAll.push(item.source.id)
          }
        })
        node.transition().attr('style', function (d) {
          let str = 'opacity:'
          if (self.highlightAll.indexOf(d.id) !== -1) {
            str += 1
          } else {
            str += 0.05
          }
          return str + ';cursor:pointer'
        }).duration(300)
        linkCopy.transition().attr('style', function (d) {
          let str = 'opacity:'
          if (d.target.id === id || d.source.id === id) {
            str += 1
          } else {
            str += 0.05
          }
          return str + ''
        }).duration(300)
        d3.selectAll('.circle-topology').transition()
          .attr('r', function (d) {
            if (d.id === id) {
              return d.radius * 1.2
            }
            return d.radius
          })
          .attr('fill', function (d) {
            if (d.id === id) {
              switch (d.color) {
                case '#eb1010':
                  return '#FF1010'
                case '#f89984':
                  return '#FF9984'
                case '#f7ba78':
                  return '#FFBA78'
                case '#23bf9a':
                  return '#63FFDA'
              }
            }
            return d.color
          })
          .duration(300)
      }

      function clearHighlight () {
        self.highlightAll = []
        self.highlightId = ''
        node.transition().attr('style', function (d) {
          let str = 'opacity:'
          str += 1
          return str + ';cursor:pointer'
        }).duration(300)
        linkCopy.transition().attr('style', function (d) {
          let str = 'opacity:'
          str += 1
          return str + ''
        }).duration(300)
        d3.selectAll('.circle-topology')
          .transition()
          .attr('r', function (d) { return d.radius })
          .attr('fill', function (d) { return d.color })
          .duration(300)
        // circleAll.transition()
        //   .attr('r', function (d) { return d.radius })
        //   .attr('fill', function (d) { return d.color })
        //   .duration(300)
      }

      function nodeMouseover (event, d) {
        if (self.isDrag) {
          self.alertLabelShow = false
          return
        }
        const paramsId = d.id.split('-')[1]
        highlightNode(d.id)
        if (self.alertLabelId === paramsId) {
          return
        }
        self.alertLabelObj = {
          position: {
            left: event.x,
            top: event.y,
            width: 50
          },
          loading: true,
          id: '',
          type: 'chartTopology'
        }
        if (self.timer) {
          clearTimeout(self.timer)
          self.timer = null
        }
        self.timer = setTimeout(() => {
          self.alertLabelId = paramsId
          self.alertLabelObj.id = paramsId
          self.alertLabelType = d.type === 'datacenter' ? 'dc' : d.type
          self.alertLabelShow = true
        }, 200)
      }

      function nodeMouseout (event, d) {
        clearTimeout(self.timer)
        clearHighlight()
        self.timer = null
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
        self.alertLabelType = d.type === 'datacenter' ? 'dc' : d.type
      }

      function showChildren (event, d, a) {
        window.event ? window.event.cancelBubble = true : event.stopPropagation()
        // if (event.path[0].className.baseVal !== 'topology-button') {
        //   return
        // }
        d3.select('#node' + d.id).attr('x', d.x).attr('y', d.y)
        d3.select('#node' + d.id).attr('fx', d.x).attr('fy', d.y)
        d.fx = d.x
        d.fy = d.y
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
        setTimeout(() => {
          self.$get('/stat/rel', params).then(res => {
            const parentId = d.id
            const prevParentId = d.parentId ? d.parentId[d.parentId.length - 1] : ''
            res.data.nodes = res.data.nodes.filter(item => item.id !== parentId) // 处理连线 node 重复的问题
            res.data.nodes = res.data.nodes.filter(item => item.id !== prevParentId)
            res.data.links = res.data.links.filter(item => item.source !== prevParentId)
            res.data.links = res.data.links.filter(item => item.target !== prevParentId)
            res.data.nodes.forEach(item => {
              item.hasChildren = false
              item.parentId = JSON.parse(JSON.stringify(d.parentId))
              item.parentId.push(parentId)
              item.radius = self.getRadius(item) // 需要计算 分三级
              item.color = self.getColor(item) // 需要计算 分三级
            })
            nodes.push(...res.data.nodes)
            nodes = lodash.uniqBy(nodes, 'id')
            self.data.nodes = nodes
            simulation.stop()
            node = node
              .data(nodes)
              .join(
                enter => enter.append('g').attr('class', 'node')
                  .attr('id', function (child) {
                    return 'node' + child.id
                  }
                  )
                  .call(drag(simulation))
                  .on('mouseleave', nodeMouseout)
                  .on('click', showChildren),
                update => update,
                exit => exit.remove()
              )
            render()
            const reslinks = res.data.links.map((item, index) => {
              return {
                index: links.length + index,
                source: nodes.find(child => child.id === item.source),
                target: nodes.find(child => child.id === item.target),
                id: item.source + '-' + item.target
              }
            })
            links.push(...reslinks)
            links = lodash.uniqBy(links, 'id')
            links = links.map(d => Object.assign({}, d))
            linkCopy = linkCopy
              .data(links)
              .join('line')
            simulation.nodes(nodes)
            simulation.force('link').links(links)
            simulation.restart().tick()
          })
        }, 100)
      }

      function hideChildren (d) {
        // 创建一个数组 隐藏所有相关联的 节点 连线
        if (d.id) {
          d.hasChildren = false
          const prevParentId = d.parentId ? d.parentId[d.parentId.length - 1] : ''
          simulation.stop()
          nodes = nodes.filter(child => child.parentId.indexOf(d.id) === -1)
          node = node
            .data(nodes)
            .join(
              enter => enter.append('g').attr('class', 'node')
                .attr('id', function (child) {
                  return 'node' + child.id
                })
                .call(drag(simulation))
                .on('mouseleave', nodeMouseout)
                .on('click', showChildren),
              update => update,
              exit => exit.remove()
            )
          render()
          links = links.filter(child => (child.source.parentId.indexOf(d.id) === -1))
          links = links.filter(child => (child.target.parentId.indexOf(d.id) === -1))
          links = links.filter(child => {
            if (child.source.id === d.id) {
              return child.target.id === prevParentId
            }
            return true
          })
          links = links.filter(child => {
            if (child.target.id === d.id) {
              return child.source.id === prevParentId
            }
            return true
          })
          links = links.map(d => Object.assign({}, d))
          linkCopy = linkCopy
            .data(links)
            .join('line')
          simulation.nodes(nodes)
          simulation.force('link').links(links)
          simulation.restart().tick()
          self.data.nodes = nodes
        }
      }

      function render () {
        node.nodes().forEach(item => {
          const box = d3.select(item)
          const d = box.data()[0]
          if (document.getElementById('#circle' + d.id)) {
            return
          }
          box.attr('id', 'node' + d.id)
          if (document.getElementById('node' + d.id)) {
            document.getElementById('node' + d.id).innerHTML = ''
          }
          box.append('circle')
            .attr('r', d.radius)
            .attr('fill', d.color)
            .attr('id', '#circle' + d.id)
            .attr('class', 'circle-topology')
            .on('mouseenter', nodeMouseover)
          box.append('image')
            .attr('xlink:href', icon[d.type])
            .attr('width', d.radius + 'px')
            .attr('height', d.radius + 'px')
            .attr('x', d.radius * 1 / 2 * -1)
            .attr('y', d.radius * 1 / 2 * -1)
            .on('mouseenter', nodeMouseover)
          // box.append('rect')
          //   .attr('width', function (d) { return nodeRadius * 2 + 40 + 'px' })
          //   .attr('height', '22px')
          //   .attr('x', function (d) { return nodeRadius * -1 - 20 })
          //   .attr('y', function (d) { return d.radius * 1 + 5 })
          //   .attr('style', 'cursor:pointer')
          //   .attr('class', function (d) { return d.hasChildren ? 'toggle-nodes' : 'hide' })
          //   .style('fill', '#ffffff')
          //   .attr('stroke', '#DEDEDE')
          //   .attr('stroke-width', 1)
          //   .attr('rx', '4')
          //   .attr('ry', '4')
          // box.append('foreignObject')
          //   .attr('width', function (d) { return nodeRadius * 2 + 15 + 'px' })
          //   .attr('height', '20px')
          //   .attr('x', function (d) { return nodeRadius * -1 - 14 })
          //   .attr('y', function (d) { return d.radius * 1 + 5 })
          //   .append('xhtml:div')
          //   .text(function (d) {
          //     return d.name
          //   })
          //   .attr('style', 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;width: 100%;color: #666 ;font-size:14px;line-height:20px')
          //   .attr('font-size', 14)
          // box.append('rect')
          //   .attr('x', function (d) { return nodeRadius * 1 - 2 })
          //   .attr('y', function (d) { return d.radius * 1 + 5 })
          //   .attr('height', '22px')
          //   .attr('width', '22px')
          //   .style('fill', function (d) { return d.hasChildren ? '#f9f9f9' : '#ffffff' })
          //   .attr('stroke', function (d) { return d.hasChildren ? '#DEDEDE' : '#FA901C' })
          //   .attr('stroke-width', 1)
          //   .attr('rx', '4')
          //   .attr('ry', '4')
          //   .attr('class', 'topology-button')
          //   .on('click', showChildren)
          // const button = box.append('svg')
          //   .attr('width', '14px')
          //   .attr('height', '14px')
          //   .attr('x', function (d) { return nodeRadius * 1 + 2 })
          //   .attr('y', function (d) { return d.radius * 1 + 9 })
          //   .attr('style', 'cursor:pointer')
          //   .attr('class', function (d) { return d.hasChildren ? 'toggle-nodes topology-button' : 'hide topology-button' })
          //   .attr('viewBox', '0 0 512 512')
          // button.append('polygon')
          //   .attr('points', '508.3,204.302 508.3,94.372 232.104,94.372 232.104,119.163 2.128,119.163 2.128,148.02 103.282,148.02   103.282,395.751 104.073,395.751 104.073,395.879 231.416,395.879 231.416,433.091 507.612,433.091 507.612,323.161   231.416,323.161 231.416,365.65 135.572,365.65 135.572,148.02 232.104,148.02 232.104,204.302 ')
          //   .attr('fill', function (d) { return d.hasChildren ? '#666666' : '#FA901C' })
          //   .attr('class', 'topology-button')
          //   .on('click', showChildren)
          //   .off('click', showChildren.bind(this, '2'))
          //   .on('click', showChildren.bind(this, '2'))
          box.attr('class', 'node')
          box.attr('fixed', false)
        })
        if (self.timer2) {
          clearTimeout(self.timer2)
          self.timer2 = null
        }
        self.timer2 = setTimeout(() => {
          simulation.stop()
          // node.attr('fx', function (d) {
          //   d.fx = d.x
          //   return d.fx
          // }).attr('fy', function (d) {
          //   d.fy = d.y
          //   return d.fy
          // })
        }, 1500)
      }

      function reset () {
        // svg.transition().duration(750).call(
        //   zoom.transform,
        //   d3.zoomIdentity,
        //   d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        // )
      }

      function zoomed (event) {
        const { transform } = event
        svg.attr('transform', transform)
        svg.attr('stroke-width', 1 / transform.k)
      }

      setTimeout(() => {
        self.firstInit = false
      }, 1000)
      svgBox.call(zoom)
      return Object.assign(svgBox.node(), { scales: { color } })
    },
    getRadius (item) {
      let sum = 0
      item.alert && item.alert.forEach(alert => {
        sum += alert.num
      })
      if (sum === 0) {
        return this.radiusArr[0]
      } else if (sum <= 10) {
        return this.radiusArr[1]
      } else {
        return this.radiusArr[2]
      }
    },
    getColor (item) {
      // const arr = []
      let color = ''
      // item.alert && item.alert.forEach(alert => {
      //   arr.push(alert.priority)
      // })
      this.severityDataWeight.forEach(severity => {
        const num = item.alert.find(alert => alert.priority === severity.name)
        if (num && !color && num.num > 0) {
          color = severity.color
        }
      })
      if (!color) {
        color = '#23bf9a'
      }
      return color
    },
    upDate () {

    },
    graphIconEnter (item) {
      const svg = d3.select('#svgHex' + this.chartId)
      const node = svg.selectAll('.node')
      const linkCopy = svg.selectAll('line')
      node.transition().attr('style', function (d) {
        let str = 'opacity:'
        if (d.type === item.type) {
          str += 1
        } else {
          str += 0.05
        }
        return str + ';cursor:pointer'
      }).duration(300)
      linkCopy.transition().attr('style', function (d) {
        let str = 'opacity:'
        str += 0.05
        return str + ';cursor:pointer'
      }).duration(300)
    },
    graphIconLeave (item) {
      const svg = d3.select('#svgHex' + this.chartId)
      const node = svg.selectAll('.node')
      const linkCopy = svg.selectAll('line')
      node.transition().attr('style', function (d) {
        let str = 'opacity:'
        str += 1
        return str + ';cursor:pointer'
      }).duration(300)
      linkCopy.transition().attr('style', function (d) {
        let str = 'opacity:'
        str += 1
        return str + ';cursor:pointer'
      }).duration(300)
    }
  },
  watch: {
    'data.nodes': {
      handler (n) {
        this.graphIconArr = []
        this.data.nodes.forEach(item => {
          if (this.graphIconArr.indexOf(item.type) === -1) {
            this.graphIconArr.push(item.type)
          }
        })
        this.graphIconArr = this.graphIconArr.map(item => {
          return this.nzIcon.find(nzIcon => nzIcon.type === item)
        })
      },
      // deep: true,
      immediate: true
    },
    chartData: {
      immediate: true,
      handler (n) {
        this.initChart()
      }
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
