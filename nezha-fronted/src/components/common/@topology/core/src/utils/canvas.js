import { Point } from '../models/point'
export function flatNodes (nodes) {
  const result = {
    nodes: [],
    lines: []
  }
  for (let _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
    const item = nodes_1[_i]
    if (item.type) {
      result.lines.push(item)
      continue
    }
    result.nodes.push(item)
    if (item.children) {
      result.nodes.push.apply(result.nodes, flatNodes(item.children).nodes)
      result.lines.push.apply(result.lines, flatNodes(item.children).lines)
    }
  }
  return result
}
export function find (idOrTag, pens) {
  const result = []
  pens.forEach(function (item) {
    if (item.id === idOrTag || item.tags.indexOf(idOrTag) > -1) {
      result.push(item)
    }
    if (item.children) {
      result.push.apply(result, find(idOrTag, item.children))
    }
  })
  return result
}
export function del (idOrTag, pens) {
  const deleted = []
  for (let i = 0; i < pens.length; i++) {
    if (pens[i].id === idOrTag || pens[i].tags.indexOf(idOrTag) > -1) {
      deleted.push(pens[i])
      pens.splice(i, 1)
      --i
    } else if (pens[i].children) {
      deleted.push.apply(deleted, del(idOrTag, pens[i].children))
    }
  }
  return deleted
}
export function getParent (pens, child) {
  let parent
  for (let _i = 0, pens_1 = pens; _i < pens_1.length; _i++) {
    const item = pens_1[_i]
    if (item.type) {
      continue
    }
    if (!item.children) {
      continue
    }
    for (let _a = 0, _b = item.children; _a < _b.length; _a++) {
      const subItem = _b[_a]
      if (subItem.id === child.id) {
        return item
      }
      if (subItem.type) {
        continue
      }
      if (subItem.children) {
        parent = getParent(subItem.children, child)
        if (parent) {
          return parent
        }
      }
    }
  }
  return parent
}
export function pointInRect (point, vertices) {
  if (vertices.length < 3) {
    return false
  }
  let isIn = false
  let last = vertices[vertices.length - 1]
  for (let _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
    const item = vertices_1[_i]
    if (((last.y > point.y) !== (item.y > point.y))) {
      if (item.x + ((point.y - item.y) * (last.x - item.x)) / (last.y - item.y) > point.x) {
        isIn = !isIn
      }
    }
    last = item
  }
  return isIn
}
export function pointInLine (point, from, to, padding) {
  if (padding === void 0) { padding = 1 }
  const angle = Math.atan2(from.y - to.y, to.x - from.x)
  padding = padding > 5 ? padding : 5
  const x = Math.sin(angle) * padding
  const y = Math.cos(angle) * padding
  const points = [
    new Point(from.x - x, from.y - y),
    new Point(to.x - x, to.y - y),
    new Point(to.x + x, to.y + y),
    new Point(from.x + x, from.y + y)
  ]
  return pointInRect(point, points)
}
export function lineLen (from, to) {
  const len = Math.sqrt(Math.pow(Math.abs(from.x - to.x), 2) + Math.pow(Math.abs(from.y - to.y), 2))
  return len | 0
}
export function curveLen (from, cp1, cp2, to) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M' + from.x + ' ' + from.y + ' C' + cp1.x + ' ' + cp1.y + ' ' + cp2.x + ' ' + cp2.y + ' ' + to.x + ' ' + to.y)
  return path.getTotalLength() | 0
}
// # sourceMappingURL=canvas.js.map
