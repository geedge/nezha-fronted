import { rectInRect } from '@topology/core'
export let canvas

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
export function rectangleImg (ctx, pen) {
  ctx.beginPath()

  ctx.rect(pen.x, pen.y, pen.width, pen.height)
  if (pen.data && pen.data.lineWidth <= 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0)'
  }
  // 必须判空再填充
  (pen.fillStyle || pen.bkType) && ctx.fill()
  pen.iconHeight = pen.height - 30
  console.log(pen)
  // pen.iconRect = new Rect(pen.x + pen.paddingLeft, pen.y + pen.paddingTop, pen.width - (pen.paddingLeft + pen.paddingRight), pen.height - 20 - (pen.paddingTop + pen.paddingBottom))
  // pen.fullIconRect = { width: 80, height: 90, center: { x: 972, y: 456 }, ex: 1012, ey: 496 }
  ctx.stroke()
}
export function rectangleImgAnchors (pen) {
  const anchors = []
  // console.log(pen)
  anchors.push({
    id: '0',
    penId: pen.id,
    x: pen.x,
    y: pen.y + pen.height / 4
  })
  anchors.push({
    id: '1',
    penId: pen.id,
    x: pen.x + pen.width / 2,
    y: pen.y
  })
  anchors.push({
    id: '2',
    penId: pen.id,
    x: pen.x + pen.width,
    y: pen.y + pen.height / 2
  })
  anchors.push({
    id: '3',
    penId: pen.id,
    x: pen.x + pen.width / 2,
    y: pen.y + pen.height
  })
  return anchors
  // pen.anchors.push(new Point(pen.x, pen.y + pen.height / 2, Direction.Left))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y, Direction.Up))
  // pen.anchors.push(new Point(pen.x + pen.width, pen.y + pen.height / 2, Direction.Right))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y + pen.height, Direction.Bottom))
}
/* 自定义图片组件 */
// export function myShape (ctx, node) { // 自定义图片组件
//   ctx.beginPath()
//
//   ctx.rect(pen.x, pen.y, pen.width, pen.height)
//   if (pen.data && pen.data.lineWidth <= 0) {
//     ctx.strokeStyle = 'rgba(0,0,0,0)'
//   }
//   // 必须判空再填充
//   (pen.fillStyle || pen.bkType) && ctx.fill()
//   ctx.stroke()
// }
// export function myAnchors (node) {
//   pen.anchors.push(new Point(pen.x, pen.y + pen.height / 2, Direction.Left))
//   pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y, Direction.Up))
//   pen.anchors.push(new Point(pen.x + pen.width, pen.y + pen.height / 2, Direction.Right))
//   pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y + pen.height, Direction.Bottom))
// }
// export function myIconRect (node) {
//   pen.iconRect = new Rect(pen.x + pen.paddingLeft, pen.y + pen.paddingTop, pen.width - (pen.paddingLeft + pen.paddingRight), pen.height - 20 - (pen.paddingTop + pen.paddingBottom))
//   pen.fullIconRect = pen.rect
// }
// export function myTextRect (node) {
//   pen.textRect = new Rect(
//     pen.x + pen.paddingLeft,
//     pen.y + pen.height - 20 - pen.paddingBottom,
//     pen.width - (pen.paddingLeft + pen.paddingRight),
//     20
//   )
//   pen.fullTextRect = pen.rect
// }
// export function myIconRect2 (node) {
//   pen.iconRect = pen.rect
//   pen.fullIconRect = pen.rect
// }
// export function myTextRect2 (node) {
//   pen.textRect = new Rect(
//     pen.x + pen.paddingLeft,
//     pen.y + pen.height + 10,
//     pen.width - (pen.paddingLeft + pen.paddingRight),
//     20
//   )
//   pen.fullTextRect = pen.rect
// }
// /* 自定义图片组件 */
//
// /* 自定义立方体 */
// export function myCubec (ctx, node) {
//   // 立方体
//   // ctx.rect(pen.x,pen.y,pen.width,pen.height);
//   const x = pen.x + 10; const y = pen.y + 10; const w = pen.width - 20; const h = pen.height - 20
//
//   // LINE MODE
//   ctx.lineJoin = 'round'
//
//   // center face
//   ctx.beginPath()
//   ctx.moveTo(x, y + h / 3)
//   ctx.lineTo(x + w * 2 / 3, y + h / 3)
//   ctx.lineTo(x + w * 2 / 3, y + h)
//   ctx.lineTo(x, y + h)
//   ctx.closePath()
//   ctx.fillStyle = pen.fillStyle
//   ctx.strokeStyle = pen.strokeStyle
//   ctx.stroke();
//   (pen.fillStyle || pen.bkType) && ctx.fill()
//
//   // top face
//   ctx.beginPath()
//   ctx.moveTo(x, y + h / 3)
//   ctx.lineTo(x + w / 3, y)
//   ctx.lineTo(x + w, y)
//   ctx.lineTo(x + w * 2 / 3, y + h / 3)
//   ctx.closePath()
//   ctx.fillStyle = pen.fillStyle
//   ctx.strokeStyle = pen.strokeStyle
//   ctx.stroke();
//   (pen.fillStyle || pen.bkType) && ctx.fill()
//
//   // right face
//   ctx.beginPath()
//   ctx.moveTo(x + w * 2 / 3, y + h / 3)
//   ctx.lineTo(x + w, y)
//   ctx.lineTo(x + w, y + h * 2 / 3)
//   ctx.lineTo(x + w * 2 / 3, y + h)
//   ctx.closePath()
//   ctx.fillStyle = pen.fillStyle
//   ctx.strokeStyle = pen.strokeStyle
//   ctx.stroke();
//   (pen.fillStyle || pen.bkType) && ctx.fill()
//
//   // 必须判空再填充
// }
// export function myCubeAnchors (node) { // 立方体锚点
//   pen.anchors.push(new Point(pen.x, pen.y + pen.height / 2, Direction.Left))
//   pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y, Direction.Up))
//   pen.anchors.push(new Point(pen.x + pen.width, pen.y + pen.height / 2, Direction.Right))
//   pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y + pen.height, Direction.Bottom))
// }
// /* 自定义立方体 */
//
// export function onChangeAnimate (node, animateType, fillStyle, strokeStyle) {
//   pen.animateType = animateType
//   if (pen.animateType === 'custom') {
//     return
//   }
//
//   pen.animateFrames = []
//   const state = Node.cloneState(node)
//   switch (animateType) {
//     case 'upDown':
//       state.rect.y -= 10
//       state.rect.ey -= 10
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state
//       })
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(node)
//       })
//       pen.animateFrames.push({
//         duration: 200,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       break
//     case 'leftRight':
//       state.rect.x -= 10
//       state.rect.ex -= 10
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.rect.x += 20
//       state.rect.ex += 20
//       pen.animateFrames.push({
//         duration: 80,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.rect.x -= 20
//       state.rect.ex -= 20
//       pen.animateFrames.push({
//         duration: 50,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.rect.x += 20
//       state.rect.ex += 20
//       pen.animateFrames.push({
//         duration: 30,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(node)
//       })
//       break
//     case 'heart':
//       state.rect.x -= 5
//       state.rect.ex += 5
//       state.rect.y -= 5
//       state.rect.ey += 5
//       state.rect.width += 5
//       state.rect.height += 10
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state
//       })
//       pen.animateFrames.push({
//         duration: 400,
//         linear: true,
//         state: Node.cloneState(node)
//       })
//       break
//     case 'success':
//       state.strokeStyle = strokeStyle || '#237804'
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state
//       })
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(node)
//       })
//       state.strokeStyle = '#237804'
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state
//       })
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(node)
//       })
//       state.strokeStyle = strokeStyle || '#237804'
//       state.fillStyle = fillStyle || '#389e0d22'
//       pen.animateFrames.push({
//         duration: 3000,
//         linear: true,
//         state
//       })
//       break
//     case 'warning':
//       state.strokeStyle = strokeStyle || '#fa8c16'
//       state.fillStyle = fillStyle || '#fa8c16'
//       state.lineWidth = 5
//       state.dash = 2
//       pen.animateFrames.push({
//         duration: 500,
//         linear: true,
//         state
//       })
//       state.strokeStyle = strokeStyle || '#fa8c16'
//       state.dash = 0
//       state.lineWidth = 1
//       state.fillStyle = '#ffffff'
//       pen.animateFrames.push({
//         duration: 500,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.strokeStyle = strokeStyle || '#fa8c16'
//       state.dash = 2
//       state.lineWidth = 5
//       state.fillStyle = fillStyle || '#fa8c16'
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       break
//     case 'error':
//       state.strokeStyle = strokeStyle || '#cf1322'
//       state.fillStyle = fillStyle || '#cf132222'
//       state.lineWidth = 5
//       state.dash = 2
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state
//       })
//       state.strokeStyle = strokeStyle || '#cf1322'
//       state.fillStyle = '#ffffff'
//       state.dash = 0
//       state.lineWidth = 1
//       pen.animateFrames.push({
//         duration: 500,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.strokeStyle = strokeStyle || '#cf1322'
//       state.fillStyle = fillStyle || '#cf132222'
//       state.dash = 2
//       state.lineWidth = 5
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       break
//     case 'show':
//       state.strokeStyle = strokeStyle || '#fa541c'
//       state.rotate = -5
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.rotate = 5
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.rotate = 0
//       pen.animateFrames.push({
//         duration: 100,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       break
//     case 'fade':
//       state.strokeStyle = strokeStyle || '#fa541c'
//       state.globalAlpha = 0.3
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.globalAlpha = 0.5
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.globalAlpha = 0.8
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       state.globalAlpha = 1
//       pen.animateFrames.push({
//         duration: 300,
//         linear: true,
//         state: Node.cloneState(state)
//       })
//       break
//   }
//   pen.animatePlay = true
// }
// export function onChangeAnimateLine (line, type) {
//   line.animateType = type
//   line.animatePlay = true
// }
// export function changeImage (dataImg, callback) {
//   // const base64Img = document.createElement('base64Img')
//   const canvas = document.createElement('canvas')
//   const context = canvas.getContext('2d')
//   // 创建新图片
//   const img = new Image()
//   img.src = dataImg
//   img.addEventListener(
//     'load',
//     function () {
//       // 绘制图片到canvas上
//       canvas.width = img.width
//       canvas.height = img.height
//       context.drawImage(img, 0, 0)
//
//       // 将canvas的透明背景设置成白色
//       const imageData = context.getImageData(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//       )
//       for (let i = 0; i < imageData.data.length; i += 4) {
//         // rgb大于250的透明度y均设置成0
//         if (
//           imageData.data[i] > 0 &&
//           imageData.data[i + 1] > 0 &&
//           imageData.data[i + 2] > 0
//         ) {
//           imageData.data[i + 3] = 200
//         }
//       }
//       context.putImageData(imageData, 0, 0)
//       const baseImg = canvas.toDataURL('image/png')// 返回base64
//       if (typeof callback !== 'undefined') {
//         if (callback) callback(baseImg)
//       }
//       img.remove()
//     },
//     false
//   )
// }
