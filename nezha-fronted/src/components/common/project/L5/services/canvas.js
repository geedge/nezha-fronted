import { s16, s8 } from '@topology/core'
export let canvas

export const Tools = [
  {
    group: 'General',
    children: [
      // {
      //   name: 'rectangle',
      //   icon: 'icon-cube',
      //   data: {
      //     rect: {
      //       width: 100,
      //       height: 100
      //     },
      //     is3D: true,
      //     z: 20,
      //     zRotate: 15,
      //     name: 'myCube',
      //     iconFamily: 'topology',
      //     iconColor: '#777',
      //     iconSize: 30
      //   }
      // },
      {
        name: 'rectangle',
        icon: 'icon-rect',
        type: 0,
        data: {
          text: 'rect',
          type: 0,
          width: 100,
          height: 100,
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
        type: 0,
        data: {
          text: 'rectangle',
          type: 0,
          width: 200,
          height: 50,
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
        type: 0,
        data: {
          text: 'circle',
          type: 0,
          width: 100,
          height: 100,
          name: 'circle',
          textMaxLine: 1
        }
      },
      {
        name: 'triangle',
        icon: 'icon-triangle',
        type: 0,
        data: {
          text: 'triangle',
          type: 0,
          width: 100,
          height: 100,
          name: 'triangle'
        }
      },
      {
        name: 'diamond',
        icon: 'icon-diamond',
        type: 0,
        data: {
          text: 'diamond',
          type: 0,
          width: 100,
          height: 100,
          name: 'diamond'
        }
      },
      {
        name: 'pentagon',
        icon: 'icon-pentagon',
        type: 0,
        data: {
          text: 'pentagon',
          type: 0,
          width: 100,
          height: 100,
          name: 'pentagon'
        }
      },
      {
        name: 'hexagon',
        icon: 'icon-hexagon',
        type: 0,
        data: {
          text: 'hexagon',
          type: 0,
          width: 100,
          height: 100,
          paddingTop: 10,
          paddingBottom: 10,
          name: 'hexagon'
        }
      },
      {
        name: 'pentagram',
        icon: 'icon-pentagram',
        type: 0,
        data: {
          text: 'pentagram',
          type: 0,
          width: 100,
          height: 100,
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
    x: 922,
    y: 406,
    width: 100,
    height: 100,
    imageRatio: false,
    lineWidth: 0,
    rotate: 0,
    offsetRotate: 0,
    globalAlpha: 1,
    lineDash: [],
    color: '#000000',
    background: '#ffffff00',
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
    x: 922,
    y: 406,
    width: 100,
    height: 100,
    imageRatio: false,
    lineWidth: 0,
    rotate: 0,
    offsetRotate: 0,
    globalAlpha: 1,
    lineDash: [],
    color: '#000000',
    background: '#ffffff00',
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
  if (pen.data && !pen.data.animateNeedLine) {
    if (pen.data && pen.data.lineWidth <= 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0)'
    }
  }
  // 必须判空再填充
  (pen.background || pen.bkType) && ctx.fill()
  pen.calculative.worldIconRect = {
    height: pen.height - 10 - 20,
    rotate: 0,
    width: pen.width - 10,
    x: pen.x + 5,
    y: pen.y + 5
  }
  pen.calculative.worldTextRect = {
    height: 20,
    width: pen.width - 10,
    x: pen.x + 5,
    y: pen.y + pen.height - 5 - 20
  }
  // pen.iconRect = new Rect(pen.x + pen.paddingLeft, pen.y + pen.paddingTop, pen.width - (pen.paddingLeft + pen.paddingRight), pen.height - 20 - (pen.paddingTop + pen.paddingBottom))
  // pen.fullIconRect = { width: 80, height: 90, center: { x: 972, y: 456 }, ex: 1012, ey: 496 }
  ctx.stroke()
}
export function rectangleImgAnchors (pen) {
  const anchors = []
  anchors.push({
    id: '0',
    penId: pen.id,
    x: pen.x,
    y: pen.y + pen.height / 2
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
  anchors.push({
    id: '4',
    penId: pen.id,
    x: pen.x,
    y: pen.y + pen.height / 8
  })
  return anchors
  // pen.anchors.push(new Point(pen.x, pen.y + pen.height / 2, Direction.Left))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y, Direction.Up))
  // pen.anchors.push(new Point(pen.x + pen.width, pen.y + pen.height / 2, Direction.Right))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y + pen.height, Direction.Bottom))
}
export function rectangleImg2 (ctx, pen) {
  ctx.beginPath()

  ctx.rect(pen.x, pen.y, pen.width, pen.height)
  if (pen.data && !pen.data.animateNeedLine) {
    if (pen.data && pen.data.lineWidth <= 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0)'
    }
  }
  // 必须判空再填充
  (pen.background || pen.bkType) && ctx.fill()
  pen.calculative.worldIconRect = {
    height: pen.height - 10,
    rotate: 0,
    width: pen.width - 10,
    x: pen.x + 5,
    y: pen.y + 5
  }
  pen.calculative.worldTextRect = {
    height: 20,
    width: pen.width - 10,
    x: pen.x + 5,
    y: pen.y + pen.height
  }
  // pen.iconRect = new Rect(pen.x + pen.paddingLeft, pen.y + pen.paddingTop, pen.width - (pen.paddingLeft + pen.paddingRight), pen.height - 20 - (pen.paddingTop + pen.paddingBottom))
  // pen.fullIconRect = { width: 80, height: 90, center: { x: 972, y: 456 }, ex: 1012, ey: 496 }
  ctx.stroke()
}
export function rectangleImgAnchors2 (pen) {
  const anchors = []
  anchors.push({
    id: '0',
    penId: pen.id,
    x: pen.x,
    y: pen.y + pen.height / 2
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
  anchors.push({
    id: '4',
    penId: pen.id,
    x: pen.x,
    y: pen.y + pen.height / 8
  })
  return anchors
  // pen.anchors.push(new Point(pen.x, pen.y + pen.height / 2, Direction.Left))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y, Direction.Up))
  // pen.anchors.push(new Point(pen.x + pen.width, pen.y + pen.height / 2, Direction.Right))
  // pen.anchors.push(new Point(pen.x + pen.width / 2, pen.y + pen.height, Direction.Bottom))
}
export function disposeTopoOldData (pen, allPen) { // 处理旧数据
  let obj = {}
  if (pen.type === 0) {
    obj = {
      id: pen.id,
      data: pen.data,
      keepDecimal: 2,
      scale: 1,
      valueMapping: pen.valueMapping,
      tags: [

      ],
      type: 0,
      name: pen.name,
      icon: pen.icon,
      iconColor: pen.iconColor,
      iconFamily: pen.iconFamily,
      iconName: pen.iconName,
      iconSize: pen.iconSize ? pen.iconSize : 12,
      x: pen.rect.x,
      y: pen.rect.y,
      ex: pen.rect.ex,
      ey: pen.rect.ey,
      width: pen.rect.width,
      height: pen.rect.height,
      paddingLeft: pen.paddingLeft,
      paddingRight: pen.paddingRight,
      paddingTop: pen.paddingTop,
      paddingBottom: pen.paddingBottom,
      color: pen.strokeStyle,
      lineWidth: pen.lineWidth,
      borderWidth: null,
      borderColor: pen.strokeStyle,
      rotate: pen.rotate,
      visible: true,
      background: pen.fillStyle,
      lineHeight: pen.lineHeight,
      fontSize: pen.fontSize,
      fontFamily: pen.fontFamily,
      fontStyle: pen.fontStyle,
      fontWeight: pen.fontWeight,
      text: pen.text,
      textColor: pen.fontColor,
      textAlign: pen.textAlign,
      textBaseline: pen.textBaseline,
      textBackground: pen.textBackground,
      lineAnimateType: pen.lineAnimateType,
      textLeft: pen.textOffsetX,
      textTop: pen.textOffsetY,
      animateType: '',
      frames: [

      ],
      autoPlay: pen.autoPlay,
      globalAlpha: pen.globalAlpha,
      bkType: pen.bkType,
      gradientAngle: pen.gradientAngle,
      gradientRadius: pen.gradientRadius,
      borderRadius: pen.borderRadius,
      events: [

      ],
      anchors: [
        {
          id: '0',
          penId: pen.id,
          x: 0,
          y: 0.5
        },
        {
          id: '1',
          penId: pen.id,
          x: 0.5,
          y: 0
        },
        {
          id: '2',
          penId: pen.id,
          x: 1,
          y: 0.5
        },
        {
          id: '3',
          penId: pen.id,
          x: 0.5,
          y: 1
        }
      ],
      // connectedLines: [
      //   {
      //     anchor: '1',
      //     lineAnchor: '9a5fccf',
      //     lineId: '3e3a3d'
      //   }
      // ]
      connectedLines: pen.connectedLines || [],
      image: pen.image
    }
  } else {
    const width = pen.from.x - pen.to.x
    const height = pen.from.y - pen.to.y
    obj = {
      id: pen.id,
      keepDecimal: 2,
      tags: [

      ],
      name: 'line',
      scale: 1,
      lineName: pen.name,
      type: pen.type,
      autoPolyline: true,
      fromArrow: pen.fromArrow,
      toArrow: pen.toArrow,
      x: width > 0 ? pen.to.x : pen.from.x,
      y: height > 0 ? pen.to.y : pen.from.y,
      width: Math.abs(pen.to.x - pen.from.x),
      height: Math.abs(pen.to.y - pen.from.y),
      data: pen.data,
      valueMapping: pen.valueMapping,
      anchors: [
        {
          anchorId: pen.from.anchorIndex + '',
          id: pen.id + '-0',
          penId: pen.id,
          connectTo: pen.from.id,
          prevNextType: undefined,
          x: 0,
          y: 0,
          prev: {
            penId: pen.id,
            connectTo: pen.from.id,
            x: -0.2,
            y: 0
          },
          next: {
            penId: pen.id,
            connectTo: pen.from.id,
            x: 0.2,
            y: 0
          }
        },
        {
          anchorId: pen.to.anchorIndex + '',
          id: pen.id + '-1',
          penId: pen.id,
          connectTo: pen.to.id,
          prevNextType: undefined,
          hidden: undefined,
          x: 1,
          y: 1,
          prev: {
            penId: pen.id,
            connectTo: pen.to.id,
            x: 0.8,
            y: 1
          },
          next: {
            penId: pen.id,
            connectTo: pen.to.id,
            x: 1.2,
            y: 1
          }
        }
      ],
      color: pen.strokeStyle,
      lineWidth: pen.lineWidth,
      lineDashOffset: pen.lineDashOffset,
      lineDash: pen.dash ? (pen.dash == 1 ? [5, 5] : ((pen.dash == 2 ? [10, 10] : [10, 10, 2, 10]))) : [],
      borderColor: pen.borderColor,
      borderWidth: pen.borderWidth,
      rotate: pen.rotate,
      visible: true,
      background: '',
      lineHeight: pen.lineHeight,
      fontSize: pen.fontSize,
      fontFamily: pen.fontFamily,
      fontStyle: pen.fontStyle,
      fontWeight: pen.fontWeight,
      textColor: '',
      textAlign: pen.textAlign,
      textBaseline: pen.textBaseline,
      textBackground: pen.textBackground,
      textLeft: pen.textOffsetX,
      textTop: pen.textOffsetY,
      animateSpan: pen.animateSpan,
      animateColor: pen.animateColor,
      lineAnimateType: 0,
      animateDotSize: pen.animateDotSize,
      frames: [

      ],
      autoPlay: false,
      globalAlpha: 1,
      events: [

      ]
    }
    if (width > 0 && height > 0) {
      obj.anchors[0].x = 1
      obj.anchors[0].y = 1
      obj.anchors[1].x = 0
      obj.anchors[1].y = 0
    } else if (width > 0 && height < 0) {
      obj.anchors[0].x = 1
      obj.anchors[0].y = 0
      obj.anchors[1].x = 0
      obj.anchors[1].y = 1
    } else if (width < 0 && height > 0) {
      obj.anchors[0].x = 0
      obj.anchors[0].y = 1
      obj.anchors[1].x = 1
      obj.anchors[1].y = 0
    } else if (width < 0 && height < 0) {
      obj.anchors[0].x = 0
      obj.anchors[0].y = 0
      obj.anchors[1].x = 1
      obj.anchors[1].y = 1
    }
    if (pen.name === 'polyline') {
      obj.anchors.splice(1, 0, {
        id: s8(),
        penId: pen.id,
        x: 0.1,
        y: 0
      }, {
        id: s8(),
        penId: pen.id,
        x: 0.5,
        y: 0
      },
      {
        id: s8(),
        penId: pen.id,
        x: 0.5,
        y: 1
      },
      {
        id: s8(),
        penId: pen.id,
        x: 0.9,
        y: 1
      }
      )
    }
    pen.data.valueMapping.forEach(item => {
      if (item.animateType == 1) {
        item.animateType = 'flow'
      } else if (item.animateType == 'comet') {
        item.animateType = 'dot'
      }
    })
  }
  return obj
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
export function onChangeAnimate (pen, animateType, fillStyle, strokeStyle) {
  pen.animateType = animateType
  if (pen.animateType === 'custom') {
    return
  }

  pen.animateFrames = []
  // const state = Node.cloneState(pen)
  const state = {}
  switch (animateType) {
    case 'upDown':
      pen.frames = [
        {
          duration: 200,
          y: 20
        },
        {
          duration: 200,
          y: 0
        },
        {
          duration: 200,
          y: -20
        }
      ]
      break
    case 'leftRight':
      pen.frames = [
        {
          duration: 200,
          x: 20
        },
        {
          duration: 200,
          x: 0
        },
        {
          duration: 200,
          x: -20
        }
      ]
      break
    case 'heart':
      pen.frames = [
        {
          duration: 300,
          scale: 1.2
        },
        // {
        //   duration: 300,
        //   x: 0,
        //   y: 0,
        //   width: 0,
        //   height: 0
        // },
        {
          duration: 300,
          scale: 0.8
        },
        {
          duration: 300,
          scale: 1
        }
      ]
      break
    case 'success':
      pen.frames = [
        {
          duration: 200,
          color: strokeStyle || '#237804'
        },
        {
          duration: 200,
          color: strokeStyle || '#237804',
          backGround: fillStyle || '#389e0d22'
        }
      ]
      break
    case 'warning':
      pen.data.animateNeedLine = true
      pen.frames = [
        {
          duration: 500,
          color: strokeStyle || '#fa8c16',
          background: fillStyle || '#fa8c16',
          lineWidth: 5,
          lineDash: [5, 5]
        },
        {
          duration: 500,
          color: strokeStyle || '#fa8c16',
          background: '#ffffff',
          lineWidth: 1,
          lineDash: []
        }
      ]
      break
    case 'error':
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = fillStyle || '#cf132222'
      state.lineWidth = 5
      state.dash = 2
      pen.animateFrames.push({
        duration: 100,
        linear: true,
        state
      })
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = '#ffffff'
      state.dash = 0
      state.lineWidth = 1
      pen.animateFrames.push({
        duration: 500,
        linear: true,
        state: Node.cloneState(state)
      })
      state.strokeStyle = strokeStyle || '#cf1322'
      state.fillStyle = fillStyle || '#cf132222'
      state.dash = 2
      state.lineWidth = 5
      pen.animateFrames.push({
        duration: 300,
        linear: true,
        state: Node.cloneState(state)
      })
      break
    case 'show':
      pen.frames = [
        {
          duration: 100,
          rotate: -5
        },
        {
          duration: 100,
          rotate: 0
        },
        {
          duration: 100,
          rotate: 5
        },
        {
          duration: 100,
          rotate: 0
        }
      ]
      break
    case 'fade':
      state.globalAlpha = 0.3
      pen.frames = [
        {
          duration: 500,
          globalAlpha: 0.3
        },
        {
          duration: 500,
          globalAlpha: 1
        }
      ]
      break
  }
  pen.animatePlay = true
}
export function onChangeAnimateLine (line, type, isOldData) {
  // { id: 'flow', name: this.$t('project.topology.flow') },
  // { id: 'beads', name: this.$t('project.topology.beads') },
  // { id: 'dot', name: this.$t('project.topology.dot') },
  let animateType = type
  if (type === 'dot') {
    animateType = 2
  }
  if (type === 'beads') {
    animateType = 1
  }
  if (type === 'custom') {
    delete line.lineAnimateType
    return
  }
  line.lineAnimateType = animateType
  line.animatePlay = true
}
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
