import { register as registerFlow } from '@topology/flow-diagram'
import { register as registerActivity } from '@topology/activity-diagram'
import { register as registerSequence } from '@topology/sequence-diagram'
import { Node, Rect, Point, Direction } from '@topology/core'
// import { register as registerClass } from './class-diagram/index'
export let canvas

export function canvasRegister () {
  registerFlow()
  registerActivity()
  registerSequence()
  // registerChart()
  // registerClass()
}

export const Tools = [
  {
    group: 'General',
    children: [
      {
        name: 'rectangle',
        icon: 'icon-cube',
        data: {
          rect: {
            width: 100,
            height: 100
          },
          is3D: true,
          z: 20,
          zRotate: 15,
          name: 'myCube',
          iconFamily: 'topology',
          iconColor: '#777',
          iconSize: 30
        }
      },
      {
        name: 'rectangle',
        icon: 'icon-rect',
        data: {
          text: 'rect',
          rect: {
            width: 100,
            height: 100
          },
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
          name: 'rectangle'
        }
      },
      {
        name: 'rectangle',
        icon: 'icon-rectangle',
        data: {
          text: 'rectangle',
          rect: {
            width: 200,
            height: 50
          },
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 0.1,
          name: 'rectangle'
          // icon: '\ue680',
          // iconFamily: 'nz-icon',
          // iconColor: ''
        }
      },
      {
        name: 'circle',
        icon: 'icon-circle',
        data: {
          text: 'circle',
          rect: {
            width: 100,
            height: 100
          },
          name: 'circle',
          textMaxLine: 1
        }
      },
      {
        name: 'triangle',
        icon: 'icon-triangle',
        data: {
          text: 'triangle',
          rect: {
            width: 100,
            height: 100
          },
          name: 'triangle'
        }
      },
      {
        name: 'diamond',
        icon: 'icon-diamond',
        data: {
          text: 'diamond',
          rect: {
            width: 100,
            height: 100
          },
          name: 'diamond'
        }
      },
      {
        name: 'pentagon',
        icon: 'icon-pentagon',
        data: {
          text: 'pentagon',
          rect: {
            width: 100,
            height: 100
          },
          name: 'pentagon'
        }
      },
      {
        name: 'hexagon',
        icon: 'icon-hexagon',
        data: {
          text: 'hexagon',
          rect: {
            width: 100,
            height: 100
          },
          paddingTop: 10,
          paddingBottom: 10,
          name: 'hexagon'
        }
      },
      {
        name: 'pentagram',
        icon: 'icon-pentagram',
        data: {
          text: 'pentagram',
          rect: {
            width: 100,
            height: 100
          },
          name: 'pentagram'
        }
      }
    ]
  }
]

export const imageTemp = {
  name: 'rectangleImg',
  icon: 'icon-image',
  data: {
    type: 0,
    rect: {
      x: 922,
      y: 406,
      width: 100,
      height: 100
    },
    imageRatio: false,
    lineWidth: 0,
    rotate: 0,
    offsetRotate: 0,
    globalAlpha: 1,
    dash: 0,
    strokeStyle: '#000000',
    animatePos: 0,
    name: 'rectangleImg',
    lineDashOffset: 0,
    text: '',
    textOffsetX: 0,
    textOffsetY: 0,
    visible: true,
    zRotate: 0,
    animateDuration: 0,
    animateFrames: [],
    animateFrame: 0,
    borderRadius: 0,
    icon: '',
    image: '',
    imageAlign: 'center',
    bkType: 0,
    gradientAngle: 0,
    gradientRadius: 0.01,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingLeftNum: 5,
    paddingRightNum: 5,
    paddingTopNum: 5,
    paddingBottomNum: 5,
    fullIconRect: { width: 80, height: 90, center: { x: 972, y: 456 }, ex: 1012, ey: 496 }
  }
}
export const imageTemp2 = {
  name: 'rectangleImg2',
  icon: 'icon-image',
  data: {
    type: 0,
    rect: {
      x: 922,
      y: 406,
      width: 100,
      height: 100
    },
    imageRatio: false,
    lineWidth: 0,
    rotate: 0,
    offsetRotate: 0,
    globalAlpha: 1,
    dash: 0,
    strokeStyle: '#000000',
    animatePos: 0,
    name: 'rectangleImg2',
    lineDashOffset: 0,
    text: '',
    textOffsetX: 0,
    textOffsetY: 0,
    visible: true,
    zRotate: 0,
    animateDuration: 0,
    animateFrames: [],
    animateFrame: 0,
    borderRadius: 0,
    icon: '',
    image: '',
    imageAlign: 'center',
    bkType: 0,
    gradientAngle: 0,
    gradientRadius: 0.01,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingLeftNum: 5,
    paddingRightNum: 5,
    paddingTopNum: 5,
    paddingBottomNum: 5,
    fullIconRect: { width: 80, height: 90, center: { x: 972, y: 456 }, ex: 1012, ey: 496 }
  }
}
/* 自定义图片组件 */
export function myShape (ctx, node) { // 自定义图片组件
  ctx.beginPath()

  ctx.rect(node.rect.x, node.rect.y, node.rect.width, node.rect.height)
  if (node.data && node.data.lineWidth <= 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0)'
  }
  // 必须判空再填充
  (node.fillStyle || node.bkType) && ctx.fill()
  ctx.stroke()
}
export function myAnchors (node) {
  node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left))
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up))
  node.anchors.push(new Point(node.rect.x + node.rect.width, node.rect.y + node.rect.height / 2, Direction.Right))
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height, Direction.Bottom))
}
export function myIconRect (node) {
  node.iconRect = new Rect(node.rect.x + node.paddingLeft, node.rect.y + node.paddingTop, node.rect.width - (node.paddingLeft + node.paddingRight), node.rect.height - 20 - (node.paddingTop + node.paddingBottom))
  node.fullIconRect = node.rect
}
export function myTextRect (node) {
  node.textRect = new Rect(
    node.rect.x + node.paddingLeft,
    node.rect.y + node.rect.height - 20 - node.paddingBottom,
    node.rect.width - (node.paddingLeft + node.paddingRight),
    20
  )
  node.fullTextRect = node.rect
}
export function myIconRect2 (node) {
  node.iconRect = node.rect
  node.fullIconRect = node.rect
}
export function myTextRect2 (node) {
  node.textRect = new Rect(
    node.rect.x + node.paddingLeft,
    node.rect.y + node.rect.height + 10,
    node.rect.width - (node.paddingLeft + node.paddingRight),
    20
  )
  node.fullTextRect = node.rect
}
/* 自定义图片组件 */

/* 自定义立方体 */
export function myCubec (ctx, node) {
  // 立方体
  // ctx.rect(node.rect.x,node.rect.y,node.rect.width,node.rect.height);
  const x = node.rect.x + 10; const y = node.rect.y + 10; const w = node.rect.width - 20; const h = node.rect.height - 20

  // LINE MODE
  ctx.lineJoin = 'round'

  // center face
  ctx.beginPath()
  ctx.moveTo(x, y + h / 3)
  ctx.lineTo(x + w * 2 / 3, y + h / 3)
  ctx.lineTo(x + w * 2 / 3, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fillStyle = node.fillStyle
  ctx.strokeStyle = node.strokeStyle
  ctx.stroke();
  (node.fillStyle || node.bkType) && ctx.fill()

  // top face
  ctx.beginPath()
  ctx.moveTo(x, y + h / 3)
  ctx.lineTo(x + w / 3, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w * 2 / 3, y + h / 3)
  ctx.closePath()
  ctx.fillStyle = node.fillStyle
  ctx.strokeStyle = node.strokeStyle
  ctx.stroke();
  (node.fillStyle || node.bkType) && ctx.fill()

  // right face
  ctx.beginPath()
  ctx.moveTo(x + w * 2 / 3, y + h / 3)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + h * 2 / 3)
  ctx.lineTo(x + w * 2 / 3, y + h)
  ctx.closePath()
  ctx.fillStyle = node.fillStyle
  ctx.strokeStyle = node.strokeStyle
  ctx.stroke();
  (node.fillStyle || node.bkType) && ctx.fill()

  // 必须判空再填充
}
export function myCubeAnchors (node) { // 立方体锚点
  node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left))
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up))
  node.anchors.push(new Point(node.rect.x + node.rect.width, node.rect.y + node.rect.height / 2, Direction.Right))
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height, Direction.Bottom))
}
/* 自定义立方体 */

export function onChangeAnimate (node, animateType, fillStyle, strokeStyle) {
  node.animateType = animateType
  if (node.animateType === 'custom') {
    return
  }

  node.animateFrames = []
  const state = Node.cloneState(node)
  switch (animateType) {
    case 'upDown':
      state.rect.y -= 10
      state.rect.ey -= 10
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(node)
      })
      node.animateFrames.push({
        duration: 200,
        linear: true,
        state: Node.cloneState(state)
      })
      break
    case 'leftRight':
      state.rect.x -= 10
      state.rect.ex -= 10
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(state)
      })
      state.rect.x += 20
      state.rect.ex += 20
      node.animateFrames.push({
        duration: 80,
        linear: true,
        state: Node.cloneState(state)
      })
      state.rect.x -= 20
      state.rect.ex -= 20
      node.animateFrames.push({
        duration: 50,
        linear: true,
        state: Node.cloneState(state)
      })
      state.rect.x += 20
      state.rect.ex += 20
      node.animateFrames.push({
        duration: 30,
        linear: true,
        state: Node.cloneState(state)
      })
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(node)
      })
      break
    case 'heart':
      state.rect.x -= 5
      state.rect.ex += 5
      state.rect.y -= 5
      state.rect.ey += 5
      state.rect.width += 5
      state.rect.height += 10
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      node.animateFrames.push({
        duration: 400,
        linear: true,
        state: Node.cloneState(node)
      })
      break
    case 'success':
      state.strokeStyle = strokeStyle || '#237804'
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(node)
      })
      state.strokeStyle = '#237804'
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(node)
      })
      state.strokeStyle = strokeStyle || '#237804'
      state.fillStyle = fillStyle || '#389e0d22'
      node.animateFrames.push({
        duration: 3000,
        linear: true,
        state
      })
      break
    case 'warning':
      state.strokeStyle = strokeStyle || '#fa8c16'
      state.fillStyle = fillStyle || '#fa8c16'
      state.lineWidth = 5
      state.dash = 2
      node.animateFrames.push({
        duration: 500,
        linear: true,
        state
      })
      state.strokeStyle = strokeStyle || '#fa8c16'
      state.dash = 0
      state.lineWidth = 1
      state.fillStyle = '#ffffff'
      node.animateFrames.push({
        duration: 500,
        linear: true,
        state: Node.cloneState(state)
      })
      state.strokeStyle = strokeStyle || '#fa8c16'
      state.dash = 2
      state.lineWidth = 5
      state.fillStyle = fillStyle || '#fa8c16'
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      break
    case 'error':
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = fillStyle || '#cf132222'
      state.lineWidth = 5
      state.dash = 2
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = '#ffffff'
      state.dash = 0
      state.lineWidth = 1
      node.animateFrames.push({
        duration: 500,
        linear: true,
        state: Node.cloneState(state)
      })
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = fillStyle || '#cf132222'
      state.dash = 2
      state.lineWidth = 5
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      break
    case 'show':
      state.strokeStyle = strokeStyle || '#fa541c'
      state.rotate = -5
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(state)
      })
      state.rotate = 5
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(state)
      })
      state.rotate = 0
      node.animateFrames.push({
        duration: 100,
        linear: true,
        state: Node.cloneState(state)
      })
      break
    case 'fade':
      state.strokeStyle = strokeStyle || '#fa541c'
      state.globalAlpha = 0.3
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      state.globalAlpha = 0.5
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      state.globalAlpha = 0.8
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      state.globalAlpha = 1
      node.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      break
  }
  node.animatePlay = true
}
export function onChangeAnimateLine (line, type) {
  line.animateType = type
  line.animatePlay = true
}
export function changeImage (dataImg, callback) {
  // const base64Img = document.createElement('base64Img')
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  // 创建新图片
  const img = new Image()
  img.src = dataImg
  img.addEventListener(
    'load',
    function () {
      // 绘制图片到canvas上
      canvas.width = img.width
      canvas.height = img.height
      context.drawImage(img, 0, 0)

      // 将canvas的透明背景设置成白色
      const imageData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      )
      for (let i = 0; i < imageData.data.length; i += 4) {
        // rgb大于250的透明度y均设置成0
        if (
          imageData.data[i] > 0 &&
          imageData.data[i + 1] > 0 &&
          imageData.data[i + 2] > 0
        ) {
          imageData.data[i + 3] = 200
        }
      }
      context.putImageData(imageData, 0, 0)
      const baseImg = canvas.toDataURL('image/png')// 返回base64
      if (typeof callback !== 'undefined') {
        if (callback) callback(baseImg)
      }
      img.remove()
    },
    false
  )
}
