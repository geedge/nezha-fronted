import { Node } from '@topology/core'
export function alignNodes (pens, rect, align) {
  for (let _i = 0, pens_1 = pens; _i < pens_1.length; _i++) {
    const item = pens_1[_i]
    if (!(item instanceof Node)) {
      continue
    }
    switch (align) {
      case 'left':
        item.rect.x = rect.x
        break
      case 'right':
        item.rect.x = rect.ex - item.rect.width
        break
      case 'top':
        item.rect.y = rect.y
        break
      case 'bottom':
        item.rect.y = rect.ey - item.rect.height
        break
      case 'center':
        item.rect.x = rect.center.x - item.rect.width / 2
        break
      case 'middle':
        item.rect.y = rect.center.y - item.rect.height / 2
        break
    }
    item.rect.floor()
    item.rect.calcCenter()
    item.init()
    item.calcChildrenRect()
  }
}
export function spaceBetween (pens, width) {
  let space = 0
  let cnt = 0
  for (let _i = 0, pens_2 = pens; _i < pens_2.length; _i++) {
    var item = pens_2[_i]
    if (!(item instanceof Node)) {
      continue
    }
    space += item.rect.width
    ++cnt
  }
  space = (width - space) / (cnt - 1)
  let left = 0
  for (let _a = 0, pens_3 = pens; _a < pens_3.length; _a++) {
    var item = pens_3[_a]
    if (!(item instanceof Node)) {
      continue
    }
    if (!left) {
      left = item.rect.x
    }
    item.rect.x = left
    left += item.rect.width + space
    item.rect.floor()
    item.rect.calcCenter()
    item.init()
    item.calcChildrenRect()
  }
}
// # sourceMappingURL=align.js.map
