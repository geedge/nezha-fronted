import { getChart } from './common'
import MessageBox from 'element-ui/packages/message-box/src/main'
import i18n from '../i18n'
import bus from '@/libs/bus'
import moment from 'moment-timezone'
/* 弹窗点击外部后关闭 */
const exceptClassName = ['prevent-clickoutside', 'config-dropdown', 'nz-pop', 'el-picker', 'chart-box-dropdown', 'metric-dropdown', 'el-cascader__dropdown', 'no-style-class', 'el-message-box', 'nz-dashboard-dropdown', 'el-autocomplete-suggestion', 'nz-temp-box', 'el-time-panel', 'el-dropdown-menu', 'el-select-dropdown', 'no-close'] // clickoutside排除的class(白名单)  no-style-class：没有任何样式的class
export const clickoutside = {
  // 初始化指令
  bind (el, binding, vnode) {
    setTimeout(() => {
      if (!binding.expression) return
      const unsavedChange = localStorage.getItem('nz-unsaved-change')
      try {
        el.__oldValue__ = JSON.parse(JSON.stringify(binding.value.obj))
        el.__newValue__ = el.__oldValue__
      } catch (e) {

      }
      function documentHandler (e) {
        if (el.contains(e.target)) {
          return false
        } else {
          let flag = true
          const path = e.path || (e.composedPath && e.composedPath())
          // eslint-disable-next-line no-labels
          top: for (let i = 0; i < path.length; i++) {
            for (let j = 0; j < exceptClassName.length; j++) {
              if (path[i].className && path[i].className.indexOf && path[i].className.indexOf(exceptClassName[j]) !== -1) {
                flag = false
                // eslint-disable-next-line no-labels
                break top
              }
            }
          }
          if (!flag) {
            return false
          }
          if (el.__oldValue__) {
            // const newValue = JSON.parse(JSON.stringify(binding.value.obj))
            if (unsavedChange == 'on' && !isEqual(el.__oldValue__, el.__newValue__) && !el.isShow) {
              el.isShow = true
              MessageBox.confirm(i18n.t('tip.confirmCancel'), {
                confirmButtonText: i18n.t('tip.yes'),
                cancelButtonText: i18n.t('tip.no'),
                type: 'warning'
              }).then(() => {
                el.isShow = false
                if (binding.value.func) {
                  binding.value.func()
                }
              }).catch(err => {
                el.isShow = false
              })
            } else if (!el.isShow) {
              binding.value.func()
            }
          } else {
            if (binding.arg) {
              binding.value(e, binding.arg)
            } else {
              if (binding.value) {
                binding.value(e)
              }
            }
          }
        }
      }

      // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
      el.__vueClickOutside__ = documentHandler
      document.addEventListener('mousedown', documentHandler)
    }, 100)
  },
  update (el, binding, vnode) {
    if (binding.arg && binding.arg != 'stable') {
      if (binding.value.obj.datasource !== '0') {
        el.__oldValue__ = JSON.parse(JSON.stringify(binding.value.obj))
      }
    }
    el.__newValue__ = binding.value.obj
  },
  unbind (el, binding) {
    // 解除事件监听
    document.removeEventListener('mousedown', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  }
}
function isEqual (o1, o2) {
  var isEqualForInner = function (obj1, obj2) {
    const o1 = obj1 instanceof Object
    const o2 = obj2 instanceof Object
    if (!o1 || !o2) {
      return obj1 === obj2
    }
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }

    for (const attr of Object.keys(obj1)) {
      const t1 = obj1[attr] instanceof Object
      const t2 = obj2[attr] instanceof Object
      if (t1 && t2) {
        if (!isEqualForInner(obj1[attr], obj2[attr])) {
          return false
        }
      } else if (obj1[attr] !== obj2[attr]) {
        return false
      }
    }
    return true
  }
  return isEqualForInner(o1, o2)
}
export const myLoading = {
  // v-my-loading:circle3.scaleMin.icon= flag
  // 参数 circle3 为对应的class 名 需要添加div的 在bind内处理。
  // 后续可跟多个参数 scaleMin 缩小0.5 scaleMax 放大2倍
  // icon 为box 没有宽高 、icon 以及flex内的小块使用
  bind: myLoadingFunction,
  update: myLoadingFunctionUpdate,
  unbind: function (el, binding) {
    let divBox = ''
    el.children.forEach((item) => {
      if (item.className.indexOf('my-loading-box') !== -1) {
        divBox = item
      }
    })
    if (el && divBox) {
      el.removeChild(divBox)
    }
  }
}
function myLoadingFunction (el, binding, vnode) {
  const className = binding.arg || 'bars1'
  const ds = el.getElementsByClassName(className)[0]
  let dsBox = ''
  el.children.forEach((item) => {
    if (item.className.indexOf('my-loading-box') !== -1) {
      dsBox = item
    }
  })
  if (dsBox) {
    return
  }
  //  若果是true创建一个div
  const divBox = document.createElement('div')
  divBox.setAttribute('class', 'my-loading-box')
  if (binding.modifiers.icon) {
    divBox.setAttribute('class', 'my-loading-box')
  }
  divBox.style.textAlign = 'center'
  if (binding.modifiers.scaleMin) {
    divBox.style.transform = 'scale(0.5)'
  }
  if (binding.modifiers.scaleMax) {
    divBox.style.transform = 'scale(2)'
  }
  if (binding.modifiers.dark) {
    divBox.style.background = 'rgba(0, 0, 0, 0.7)'
  }
  const div = document.createElement('div')
  div.setAttribute('class', className + ' my-loading')
  if (className === 'bars1') {
    const newDiv1 = document.createElement('span')
    const newDiv2 = document.createElement('span')
    const newDiv3 = document.createElement('span')
    const newDiv4 = document.createElement('span')
    const newDiv5 = document.createElement('span')
    div.appendChild(newDiv1)
    div.appendChild(newDiv2)
    div.appendChild(newDiv3)
    div.appendChild(newDiv4)
    div.appendChild(newDiv5)
  }
  // if (className === 'circle3') {
  //
  // }
  divBox.appendChild(div)
  //  插入到被绑定的元素内部
  el.appendChild(divBox)
  //  div内部加入内容
  // div.innerHTML = '加载中...'
  //  el 元素设置相对定位   div设置绝对定位
  myLoadingFunctionUpdate(el, binding, vnode)
}
function myLoadingFunctionUpdate (el, binding, vnode) {
  let divBox = ''
  el.children.forEach((item) => {
    if (item.className.indexOf('my-loading-box') !== -1) {
      divBox = item
    }
  })
  // const divBox = el.getElementsByClassName('my-loading-box')[0]
  let elClassname = el.className.split(' ')
  if (binding.value) {
    divBox.style.display = 'block'
    if (elClassname.indexOf('my-loading-parent--relative') === -1) {
      elClassname.push('my-loading-parent--relative')
      if (binding.modifiers.icon) {
        elClassname.push('my-loading-parent-icon')
      }
      el.setAttribute('class', elClassname.join(' '))
    }
  } else {
    divBox.style.display = 'none'
    //  去掉div  去掉样式  去掉定位
    if (elClassname.indexOf('my-loading-parent--relative') !== -1) {
      elClassname = elClassname.filter(item => item !== 'my-loading-parent--relative' && item !== 'my-loading-parent-icon')
      el.setAttribute('class', elClassname.join(' '))
    }
  }
}
export const cancelWithChange = {
  bind: function (el, binding) {
    setTimeout(() => {
      if (!binding.value || !binding.value.obj) return
      const unsavedChange = localStorage.getItem('nz-unsaved-change')
      el.__oldValue__ = JSON.parse(JSON.stringify(binding.value.obj))
      el.__newValue__ = el.__oldValue__
      function domClick (e) {
        if (unsavedChange == 'on' && !isEqual(el.__oldValue__, el.__newValue__)) {
          MessageBox.confirm(i18n.t('tip.confirmCancel'), {
            confirmButtonText: i18n.t('tip.yes'),
            cancelButtonText: i18n.t('tip.no'),
            type: 'warning'
          }).then(() => {
            if (binding.value.func) {
              binding.value.func()
            }
          })
        } else {
          binding.value.func()
        }
      }
      el.__vueDomClick__ = domClick
      el.addEventListener('click', domClick)
    }, 100)
  },
  update (el, binding, vnode) {
    if (binding.arg && binding.arg != 'stable') {
      el.__oldValue__ = JSON.parse(JSON.stringify(binding.value.obj))
    }
    el.__newValue__ = binding.value.obj
  },
  unbind: function (el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueDomClick__)
    delete el.__vueDomClick__
  }
}
// 底部上滑框窗口控制
export const bottomBoxWindow = {
  // 鼠标拖动二级列表
  listResize (vm, e, cb) {
    window.resizing = true
    const mainListDom = document.querySelector('.main-list') // 主列表
    const subBoxDom = document.querySelector('.sub-box') // 副列表
    const subListDom = document.querySelector('.sub-list') // 副列表
    const contentRightDom = document.querySelector('.list-page') // 右侧内容区
    const resizeBarHeight = 9 // resize横条高度
    const minHeight = 15 // 主、副列表最小高度限制为15
    const contentHideHeight = 100 // 主、副列表高度低于100时隐藏内容
    const mainModalDom = document.querySelector('.main-modal') // 主列表遮罩
    const resizeModalDom = document.querySelector('.resize-modal') // 副列表遮罩
    const resizeBarDom = document.querySelector('.sub-list-resize') // 拖动条

    const contentRightHeight = contentRightDom.offsetHeight// 可视高度
    // 点击时俩dom的初始高度：
    const subInitialHeight = subListDom.offsetHeight + resizeBarHeight

    mainModalDom.style.display = 'block'
    resizeModalDom.style.cssText = `height: ${subInitialHeight}px; display: block;`
    resizeBarDom.style.display = 'none'
    let resizeModalEndHeight
    // 点击时鼠标的Y轴位置
    const mouseInitialY = e.clientY

    document.onmousemove = (e) => {
      window.resizing = true
      e.preventDefault()
      // 得到鼠标拖动的距离
      const mouseMoveY = e.clientY - mouseInitialY
      resizeModalEndHeight = subInitialHeight - mouseMoveY

      // 主、副列表高度限制
      if (resizeModalEndHeight > contentRightHeight - minHeight) {
        resizeModalEndHeight = contentRightHeight - minHeight
      }
      if (resizeModalEndHeight < minHeight) {
        resizeModalEndHeight = minHeight
      }
      resizeModalDom.style.height = `${resizeModalEndHeight}px`
    }
    document.onmouseup = () => {
      window.resizing = false
      mainListDom.style.height = `${contentRightHeight - resizeModalEndHeight}px`
      subBoxDom.style.height = `${resizeModalEndHeight}px`
      subListDom.style.height = `${resizeModalEndHeight - resizeBarHeight}px`
      resizeModalDom.style.display = 'none'
      mainModalDom.style.display = 'none'
      resizeBarDom.style.display = ''

      // 当主副列表可视区域小于一定值时，不展示内容
      if (contentRightHeight - resizeModalEndHeight <= contentHideHeight) {
        if (vm.bottomBox.mainResizeShow) {
          vm.bottomBox.mainResizeShow = false
        }
      } else {
        if (!vm.bottomBox.mainResizeShow) {
          vm.bottomBox.mainResizeShow = true
        }
      }
      if (resizeModalEndHeight < contentHideHeight) {
        if (vm.bottomBox.subResizeShow) {
          vm.bottomBox.subResizeShow = false
        }
      } else {
        if (!vm.bottomBox.subResizeShow) {
          vm.bottomBox.subResizeShow = true
        }
      }

      document.onmousemove = null
      document.onmouseup = null
      if (cb) {
        cb()
      }
    }
  },
  exitFullScreen (vm) {
    window.resizing = true
    const contentRightDom = document.querySelector('.list-page') // 右侧内容区
    const contentRightHeight = contentRightDom.offsetHeight// 可视高度
    // 主列表
    document.querySelector('.main-list-with-sub').style.height = vm.bottomBox.mainListHeight ? vm.bottomBox.mainListHeight + 'px' : 'calc(50% - 4px)'

    // 副列表
    document.querySelector('.sub-list').style.height = vm.bottomBox.mainListHeight ? contentRightHeight - vm.bottomBox.mainListHeight - 9 + 'px' : 'calc(50% - 4px)'
    document.querySelector('.sub-list').style.top = 9 + 'px'
    setTimeout(() => {
      if (document.querySelector('.main-list-with-sub').offsetHeight >= 100) {
        vm.bottomBox.mainResizeShow = true
      }
      if (document.querySelector('.sub-list').offsetHeight >= 100) {
        vm.bottomBox.subResizeShow = true
      }
      vm.bottomBox.isFullScreen = false
      window.resizing = false
      vm.$nextTick(() => {
        const table = vm.$refs.dataTable || vm.$parent.$refs.dataTable
        table.$refs.dataTable.doLayout()
      })
    }, 210)
  },
  fullScreen (vm) {
    window.resizing = true
    const contentRightDom = document.querySelector('.list-page') // 右侧内容区
    // const contentRightHeight = contentRightDom.offsetHeight // 可视高度
    vm.bottomBox.isFullScreen = true
    // 主列表
    vm.bottomBox.mainListHeight = document.querySelector('.main-list-with-sub').offsetHeight // 记录全屏前主列表的高度
    document.querySelector('.main-list-with-sub').style.height = '0'
    vm.bottomBox.mainResizeShow = false
    // 副列表
    document.querySelector('.sub-list').style.height = '100%'
    document.querySelector('.sub-list').style.top = 0 + 'px'
    window.resizing = false
  },
  showSubListWatch (vm, n) {
    vm.bottomBox.inTransform = n
    if (!n) {
      vm.mainTableHeight = vm.$tableHeight.normal // 重置table的高度
      vm.tools.toTopBtnTop = vm.$tableHeight.toTopBtnTop
      vm.bottomBox.isFullScreen = false
      // 移动分页组件的位置
      /* const paginationTop = document.querySelector('.pagination-top')
      const paginationBottom = document.querySelector('.pagination-bottom')
      paginationTop.classList.remove('display-none')
      if (paginationTop.classList.contains('pagination-top-show')) {
        paginationTop.classList.remove('pagination-top-show')
      }
      if (!paginationTop.classList.contains('pagination-top-hide')) {
        paginationTop.classList.add('pagination-top-hide')
      }
      setTimeout(() => {
        paginationTop.classList.add('display-none')
        paginationBottom.appendChild(paginationTop.removeChild(document.querySelector('.pagination')))
      }, 210) */

      // 主列表恢复全屏
      vm.bottomBox.mainResizeShow = vm.bottomBox.subResizeShow = true
      document.querySelector('.main-list').style.height = ''
      // 副列表高度清空
      document.querySelector('.sub-list').style.height = ''
    } else {
      vm.mainTableHeight = vm.$tableHeight.openSubList.mainList // 重置table高度
      vm.tools.toTopBtnTop = vm.$tableHeight.openSubList.toTopBtnTop
      // 移动分页组件的位置
      /* const paginationTop = document.querySelector('.pagination-top')
      paginationTop.appendChild(document.querySelector('.pagination-bottom').removeChild(document.querySelector('.pagination')))
      paginationTop.classList.remove('display-none')
      setTimeout(() => {
        if (paginationTop.classList.contains('pagination-top-hide')) {
          paginationTop.classList.remove('pagination-top-hide')
        }
        if (!paginationTop.classList.contains('pagination-top-show')) {
          paginationTop.classList.add('pagination-top-show')
        }
      }, 210) */
    }
    vm.$nextTick(() => {
      const table = vm.$refs.dataTable || vm.$parent.$refs.dataTable
      table.$refs.dataTable.doLayout()
    })
  }
}
export function stringTimeParseToUnix (stringTime) {
  let time = new Date(stringTime).getTime()
  let offset = localStorage.getItem('nz-sys-timezone')
  offset = moment.tz(offset).format('Z')
  offset = Number.parseInt(offset)
  const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
  time = time + localOffset - offset * 60 * 60 * 1000
  return parseInt(time / 1000)
}
export function stringTimeParseToUnixMs (stringTime) {
  let time = new Date(stringTime).getTime()
  let offset = localStorage.getItem('nz-sys-timezone')
  offset = moment.tz(offset).format('Z')
  offset = Number.parseInt(offset)
  const localOffset = new Date().getTimezoneOffset() * 60 * 1000 * -1 // 默认 一分钟显示时区偏移的结果
  time = time + localOffset - offset * 60 * 60 * 1000
  return parseInt(time)
}
export function getTime (size, unit) { // 计算时间
  const now = new Date(bus.computeTimezone(new Date().getTime()))
  if (unit) {
    switch (unit) {
      case 'y':
        now.setFullYear(now.getFullYear() + size)
        break
      case 'M':
        now.setMonth(now.getMonth() + size)
        break
      case 'd':
        now.setDate(now.getDate() + size)
        break
      case 'h':
        now.setHours(now.getHours() + size)
        break
      case 'm':
        now.setMinutes(now.getMinutes() + size)
        break
      case 's':
        now.setSeconds(now.getSeconds() + size)
        break
      default:
        console.error('unit error')
    }
  } else {
    now.setSeconds(now.getSeconds() + size)
  }
  const year = now.getFullYear()
  let month = now.getMonth() + 1
  month = month < 10 ? '0' + month : month
  let day = now.getDate()
  day = day < 10 ? '0' + day : day
  let hour = now.getHours()
  hour = hour < 10 ? '0' + hour : hour
  let minute = now.getMinutes()
  minute = minute < 10 ? '0' + minute : minute
  let second = now.getSeconds()
  second = second < 10 ? '0' + second : second
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
}
export function calcDurationByStringTime (startTime, endTime) {
  const durationSecond = stringTimeParseToUnix(endTime) - stringTimeParseToUnix(startTime)
  let result = `${durationSecond % 60}s`
  if (durationSecond > 60) {
    result = `${(Math.floor(durationSecond / 60)) % 60}m ${result}`
  }
  if (durationSecond > 60 * 60) {
    result = `${Math.floor(durationSecond / (60 * 60))}h ${result}`
  }
  return result
}
export function calcDurationByStringTimeB (startTime, endTime) {
  const durationSecond = stringTimeParseToUnix(endTime) - stringTimeParseToUnix(startTime)
  let result = `${durationSecond % 60}s`
  if (durationSecond >= 60 * 60 * 24) {
    result = `${(Math.floor(durationSecond / 3600)) % 24}h`
    result = `${Math.floor(durationSecond / (60 * 60 * 24))}d ${result}`
  } else if (durationSecond >= 60 * 60) {
    result = `${(Math.floor(durationSecond / 60)) % 60}m`
    result = `${Math.floor(durationSecond / (60 * 60))}h ${result}`
  } else if (durationSecond >= 60) {
    result = `${(Math.floor(durationSecond / 60)) % 60}m ${result}`
  }

  return result
}
export function calcDurationByStringTimeMs (startTime, endTime) {
  let durationSecond = stringTimeParseToUnixMs(endTime) - stringTimeParseToUnixMs(startTime)
  let result = ''
  if (durationSecond < 1000) {
    result = `${durationSecond % 1000}ms`
    return result
  } else {
    durationSecond = durationSecond / 1000
  }
  result = `${durationSecond % 60}s`
  if (durationSecond >= 60 * 60 * 24) {
    result = `${(Math.floor(durationSecond / 3600)) % 24}h`
    result = `${Math.floor(durationSecond / (60 * 60 * 24))}d ${result}`
  } else if (durationSecond >= 60 * 60) {
    result = `${(Math.floor(durationSecond / 60)) % 60}m`
    result = `${Math.floor(durationSecond / (60 * 60))}h ${result}`
  } else if (durationSecond >= 60) {
    result = `${(Math.floor(durationSecond / 60)) % 60}m ${result}`
  }

  return result
}
export function unixTimeParseToString (unixTime, fmt = 'YYYY-MM-DD HH:mm:ss') {
  const date = new Date(unixTime * 1000)
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  }
  return fmt
}

// chart-resize工具
export const chartResizeTool = {
  minHeight: 200, // 图表最小高度
  chartBlankHeight: 10, // 图表空白占位高度(padding-bottom + border)
  chartTableBlankHeight: 6, // 表格型图表额外空白占位高度
  chartBlankWidth: 10, // 图表空白占位宽度(padding-right)
  containerBlankWidth: 30, // 容器空白占位宽度（#listContainer的padding）
  titleHeight: 40, // 标题dom高度
  timeouter: null,
  stepWidth (containerWidth) { // 单元宽度，参数为容器总宽度
    return Math.floor((containerWidth - this.containerBlankWidth) / 12)
  },
  start (vm, originalData, event, chartIndexs) {
    const $self = this
    const data = JSON.parse(JSON.stringify(originalData)) // 将初始对象复制，后续操作使用复制对象
    const shadow = vm.$refs.resizeShadow ? vm.$refs.resizeShadow : vm.$refs[0].resizeShadow // 缩放时底部阴影dom
    const box = vm.$refs.resizeBox ? vm.$refs.resizeBox : vm.$refs[0].resizeBox // 图表内容dom
    const chartBlankWidth = this.chartBlankWidth
    const chartBlankHeight = this.chartBlankHeight
    const titleHeight = this.titleHeight
    const containerWidth = data.groupId ? document.getElementById('listContainer' + data.groupId).offsetWidth + 40 : document.getElementById('listContainer').offsetWidth
    const step = this.stepWidth(containerWidth)
    const mouseOriginalX = event.clientX // 鼠标初始坐标
    const mouseOriginalY = event.clientY
    const originalWidth = step * data.span // 图表、阴影初始宽高
    let shadowNewWidth = originalWidth
    const originalHeight = step * data.height
    let shadowNewHeight = originalHeight

    // 1.激活背景阴影
    shadow.classList.add('resize-shadow-active')
    // 2.鼠标移动时调整resize-box的宽高，同时监听宽高的变化，变化量每达到step的50%时改变resize-shadow的尺寸并重绘resize-box内容
    document.addEventListener('mousemove', moveListener)
    // 3.鼠标松开，将resize-box宽高改为resize-shadow宽高，结束
    document.addEventListener('mouseup', mouseupListener)

    function moveListener (e) {
      const mouseX = e.clientX
      const mouseY = e.clientY
      const w = `${Math.floor(originalWidth + (mouseX - mouseOriginalX) - chartBlankWidth)}px`
      const h = `${Math.floor(originalHeight + (mouseY - mouseOriginalY) - chartBlankHeight)}px`
      box.style.width = w
      box.style.height = h
      // 调整resize-box的宽高。减去chartBlankWidth、chartBlankHeight是为了对齐
      // box.style.width = `${Math.floor(originalWidth + (mouseX - mouseOriginalX) - chartBlankWidth)}px`
      // box.style.height = `${Math.floor(originalHeight + (mouseY - mouseOriginalY) - chartBlankHeight)}px`
      // 监听宽高的变化，变化量每达到step的50%时改变resize-shadow的尺寸并重绘resize-box内容
      const remainderWidth = (box.offsetWidth + chartBlankWidth - shadowNewWidth) % step // 宽的余数
      const remainderHeight = (box.offsetHeight + chartBlankHeight - shadowNewHeight) % step // 高的余数
      boxStepHandler(remainderWidth, remainderHeight)
    }
    function mouseupListener (e) {
      data.span = Math.round((shadow.offsetWidth + chartBlankWidth) / step)
      data.height = Math.round((shadow.offsetHeight + chartBlankHeight) / step)
      box.style.width = `${Math.floor(data.span * step) - chartBlankWidth}px`
      box.style.height = `${Math.floor(data.height * step) - chartBlankHeight}px`
      // 请求后台，保存变更
      if (data.height != originalData.height || data.span != originalData.span) {
        originalData.height = data.height
        originalData.span = data.span
        vm.$put('/visual/dashboard/chart/modify', originalData)
      }
      // 关闭背景阴影
      shadow.classList.remove('resize-shadow-active')

      document.removeEventListener('mousemove', moveListener)
      document.removeEventListener('mouseup', mouseupListener)
    }
    function boxStepHandler (width, height, chartIndex) { // param: 宽高变化量，大于0放大，小于0缩小
      let widthChange = false
      let heightChange = false
      if (width > step / 2) { // 放大shadow宽
        widthChange = true
        // 判断是否因为百分数计算的宽度有小数的原因导致宽度超过当前行，使图表错误换行
        const currentWidth = shadow.offsetWidth + step // 增大一阶后的宽度
        const currentSpan = Math.round((currentWidth + chartBlankWidth) / step) // 根据width计算span
        const calcWidth = currentSpan * step - chartBlankWidth // 不会换行的宽度
        shadow.style.width = `${calcWidth}px`
      } else if (width <= 0 - (step / 2)) { // 缩小shadow宽
        widthChange = true
        const currentWidth = shadow.offsetWidth - step // 减小一阶
        const currentSpan = Math.round((currentWidth + chartBlankWidth) / step) // 根据width计算span
        const calcWidth = currentSpan * step - chartBlankWidth // 不会换行的宽度
        shadow.style.width = `${calcWidth}px`
      }
      if (widthChange) {
        shadowNewWidth = shadow.offsetWidth
      }
      if (height > step / 2) { // 放大shadow高
        heightChange = true
        const currentHeight = shadow.offsetHeight + step // 增大一阶后的宽度
        const currentHeightSpan = Math.round((currentHeight + chartBlankHeight) / step) // 根据width计算span
        const calcHeight = currentHeightSpan * step - chartBlankHeight // 不会换行的宽度
        shadow.style.height = `${calcHeight}px`
      } else if (height <= 0 - (step / 2)) { // 缩小shadow高
        heightChange = true
        const currentHeight = shadow.offsetHeight - step // 增大一阶后的宽度
        const currentHeightSpan = Math.round((currentHeight + chartBlankHeight) / step) // 根据width计算span
        const calcHeight = currentHeightSpan * step - chartBlankHeight // 不会换行的宽度
        shadow.style.height = `${calcHeight}px`
      }
      if (heightChange) {
        shadowNewHeight = shadow.offsetHeight
      }

      if (widthChange || heightChange) {
        clearTimeout($self.timeouter)
        $self.timeouter = setTimeout(() => {
          // step时chart重绘
          if (box.classList.contains('resize-box-echarts')) { // echarts类型
            getChart(chartIndexs).resize({ width: shadow.offsetWidth - 16, height: shadow.offsetHeight - titleHeight - vm.$refs.legendArea.offsetHeight })
          }
        }, 500)
        // chart外层宽高调整
        const outerBox = document.getElementById(`chart-${data.id}`)
        outerBox.style.height = `${shadow.offsetHeight + chartBlankHeight}px`
        outerBox.style.width = `${parseFloat(shadow.style.width.split('px')[0]) + chartBlankWidth}px`
      }
    }
  }
}

// table 方法
export const tableSet = {
  // 是否需要排序
  sortableShow (prop, from) {
    switch (prop) {
      case 'state': {
        if (from === 'operationlog' || from === 'alertSilence') {
          return false
        }
        break
      }
      case 'startAt': {
        if (from === 'alertSilence') {
          return false
        }
        break
      }
      case 'id':
      case 'alertRule':
      case 'severity':
      case 'endAt':
      case 'ID':
      case 'HOST':
      case 'SN':
      case 'assetType':
      case 'purchaseDate':
      case 'pingStatus':
      case 'dataCenter':
      case 'cabinet':
      case 'model':
      case 'principal':
      case 'asset':
      case 'port':
      case 'project':
      case 'module':
      case 'type':
      case 'name':
      case 'area':
      case 'vendor':
      case 'filename':
      case 'updateAt':
      case 'username':
      case 'ip':
      case 'operation':
      case 'createDate':
      case 'time':
      case 'host':
      case 'protocol':
      case 'user':
      case 'cmd':
      case 'alertName':
      case 'threshold':
      case 'idc':
      case 'alertNum':
      case 'gname':
        return 'custom'
      default : return false
    }
  },
  // prop字段
  propTitle (prop, from) {
    switch (from) {
      case 'asset':
        switch (prop) {
          case 'ID': return 'ass.id'
          case 'HOST': return 'ass.host'
          case 'SN': return 'ass.sn'
          case 'assetType': return 'sdtt.value'
          case 'purchaseDate': return 'ass.purchase_date'
          case 'state': return 'ass.state'
          case 'pingStatus': return 'assp.rtt'
          case 'dataCenter': return 'idc.name'
          case 'cabinet': return 'cab.name'
          case 'model': return 'mo.name'
          case 'vendor': return 'sdt.value'
          case 'principal': return 'su.username'
          default : return prop
        }

      case 'alertMessage':
        switch (prop) {
          case 'id': return 'am.id'
          case 'state': return 'am.state'
          case 'alertRule': return 'ar.alert_name'
          case 'severity': return 'am.severity'
          case 'startAt': return 'am.start_at'
          case 'endAt': return 'am.end_at'
          default : return prop
        }

      case 'project':
        switch (prop) {
          case 'id': return 'e.id'
          case 'asset': return 'a.host'
          case 'port': return 'e.port'
          case 'project': return 'p.name'
          case 'module': return 'm.name'
          case 'type': return 'm.type'
          case 'state' :return 'es.state'
          // case 'path': return'e.path';
          default : return prop
        }

      case 'dc':
        switch (prop) {
          case 'id': return 'i.id'
          case 'name': return 'i.name'
          case 'area': return 'sa.name'
          default : return prop
        }

      case 'endpointTab':
        switch (prop) {
          case 'id': return 'e.id'
          case 'asset': return 'a.host'
          case 'port': return 'e.port'
          case 'project': return 'p.name'
          case 'module': return 'm.name'
          case 'type': return 'm.type'
          case 'state' :return 'es.state'
          // case 'path': return'e.path';
          default : return prop
        }
      case 'model':
        switch (prop) {
          case 'id': return 'mo.id'
          case 'name': return 'mo.name'
          case 'type': return 'dictt.value'
          case 'vendor': return 'dict.value'
          default : return prop
        }
      case 'promServer':
        switch (prop) {
          case 'id': return 'id'
          case 'idc': return 'idc_id'
          case 'host': return 'host'
          case 'port': return 'port'
          case 'type': return 'type'
          default : return prop
        }
      case 'mib':
        switch (prop) {
          case 'id': return 'sm.id'
          case 'name': return 'sm.name'
          case 'filename': return 'sm.file_name'
          case 'updateAt': return 'sm.update_at'
          default : return prop
        }
      case 'operationlog':
        switch (prop) {
          case 'id': return 'sl.id'
          case 'username': return 'su.username'
          case 'ip': return 'sl.ip'
          case 'operation': return 'sl.operation'
          case 'type': return 'sl.type'
          case 'createDate': return 'sl.create_date'
          case 'time': return 'sl.time'
          default : return prop
        }
      case 'temrminallog':
        switch (prop) {
          case 'protocol': return 'protocol'
          case 'startTime': return 'startTime'
          default : return prop
        }
      case 'alertRules':
        switch (prop) {
          case 'id': return 'ar.id'
          case 'alertName': return 'ar.alert_name'
          case 'threshold': return 'ar.threshold'
          case 'severity': return 'ar.severity'
          default : return prop
        }
      case 'exprTemp':
        switch (prop) {
          case 'id': return 'id'
          case 'name': return 'name'
          case 'gname': return 'gname'
          default : return prop
        }
      default: return prop
    }
  },
  // 本地正序
  asce (prop) {
    return function (obj1, obj2) {
      let val1 = obj1[prop]
      let val2 = obj2[prop]
      if (prop === 'value') {
        val1 = obj1.oldValue
        val2 = obj2.oldValue
      }
      if (!isNaN(val1) && !isNaN(val2) && prop === 'value') {
        val1 = Number(val1)
        val2 = Number(val2)
      }
      if (prop === 'time') {
        val1 = tableSet.strTodate(val1)
        val2 = tableSet.strTodate(val2)
      }
      if (prop === 'element') {
        if (val1.alias) {
          val1 = JSON.stringify(obj1[prop].alias).replace(/\s*/g, '')
        } else {
          val1 = JSON.stringify(obj1[prop].element).replace(/\s*/g, '')
        }
        if (val2.alias) {
          val2 = JSON.stringify(obj2[prop].alias).replace(/\s*/g, '')
        } else {
          val2 = JSON.stringify(obj2[prop].element).replace(/\s*/g, '')
        }
      }
      if (val1 < val2) {
        return -1
      } else if (val1 > val2) {
        return 1
      } else {
        return 0
      }
    }
  },
  // 本地倒序
  desc (prop) {
    return function (obj1, obj2) {
      let val1 = obj1[prop]
      let val2 = obj2[prop]
      if (prop === 'value') {
        val1 = obj1.oldValue
        val2 = obj2.oldValue
      }
      if (!isNaN(Number(val1)) && !isNaN(Number(val2)) && prop === 'value') {
        val1 = Number(val1)
        val2 = Number(val2)
      }
      if (prop === 'time') {
        val1 = tableSet.strTodate(val1)
        val2 = tableSet.strTodate(val2)
      }
      if (prop === 'element') {
        if (val1.alias) {
          val1 = JSON.stringify(obj1[prop].alias).replace(/\s*/g, '')
        } else {
          val1 = JSON.stringify(obj1[prop].element).replace(/\s*/g, '')
        }
        if (val2.alias) {
          val2 = JSON.stringify(obj2[prop].alias).replace(/\s*/g, '')
        } else {
          val2 = JSON.stringify(obj2[prop].element).replace(/\s*/g, '')
        }
      }
      if (val1 < val2) {
        return 1
      } else if (val1 > val2) {
        return -1
      } else {
        return 0
      }
    }
  },
  // 转化时间字符串为时间戳
  strTodate (str) {
    let date = str.trim()
    date = date.substring(0, 19)
    date = date.replace(/-/g, '/') // 必须把日期'-'转为'/'
    return new Date(date).getTime()
  }
}

export function getMetricTypeValue (queryItem, type) {
  let copy = JSON.parse(JSON.stringify(queryItem))
  switch (type) {
    case 'min': {
      let min = copy.sort((x, y) => {
        const x1 = isNaN(x[1]) && !x[1] ? 0 : x[1]
        const y1 = isNaN(y[1]) && !y[1] ? 0 : y[1]
        return x1 - y1
      })[0][1]
      if (isNaN(min)) {
        min = 0
      }
      return min
    }
    case 'max': {
      let max = copy.sort((x, y) => {
        const x1 = isNaN(x[1]) && !x[1] ? 0 : x[1]
        const y1 = isNaN(y[1]) && !y[1] ? 0 : y[1]
        return y1 - x1
      })[0][1]
      if (isNaN(max)) {
        max = 0
      }
      return max
    }
    case 'avg': {
      copy = copy.map(t => {
        const t1 = isNaN(t[1]) && !t[1] ? 0 : t[1]
        return parseFloat(t1)
      })
      const sum = eval(copy.join('+'))
      const avg = sum / copy.length
      return avg
    }
    case 'last': {
      const last = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[0][1]
      return last
    }
    case 'first': {
      const first = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[copy.length - 1][1]
      return first
    }
    case 'total': {
      copy = copy.map(t => {
        const t1 = isNaN(t[1]) && !t[1] ? 0 : t[1]
        return parseFloat(t1)
      })
      const total = eval(copy.join('+'))
      return total
    }
    case 'range': {
      let min = copy.sort((x, y) => {
        const x1 = isNaN(x[1]) && !x[1] ? 0 : x[1]
        const y1 = isNaN(y[1]) && !y[1] ? 0 : y[1]
        return x1 - y1
      })[0][1]
      if (isNaN(min)) {
        min = 0
      }
      let max = copy.sort((x, y) => {
        const x1 = isNaN(x[1]) && !x[1] ? 0 : x[1]
        const y1 = isNaN(y[1]) && !y[1] ? 0 : y[1]
        return y1 - x1
      })[0][1]
      if (isNaN(max)) {
        max = 0
      }
      return max - min
    }
    case 'different': {
      const last = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[0][1]
      const first = copy.sort((x, y) => { return parseFloat(y[0]) - parseFloat(x[0]) })[copy.length - 1][1]
      return last - first
    }
  }
}

export function blankPromise () {
  return new Promise(resolve => { resolve() })
}

export function clickLegend (echart, legendName, index) {
  if (echart) {
    //
  }
}

export function showTableTooltip (content, show = true, e) {
  if (show) {
    const dom = document.querySelector('.table-tooltip')
    dom.innerHTML = content
    dom.setAttribute('style', `visibility: visible; top: ${e.clientY - e.offsetY + e.target.offsetHeight * 0.5 - dom.offsetHeight * 0.5}px; left: ${e.clientX - e.offsetX + e.target.offsetWidth}px`)
  }
}
export function hideTableTooltip () {
  const dom = document.querySelector('.table-tooltip')
  dom.setAttribute('style', 'visibility: hidden;')
  dom.innerHTML = ''
}

/* 数字转换保留小数，数字很小时转为科学计数法, dot为保留几位小数 */
export function formatScientificNotation (value, dot = 2) {
  let val = value ? parseFloat(Number(value).toFixed(dot)) : 0
  if (val === 0) {
    val = Number(value).toPrecision(dot + 1)
  }
  return val
}
/* function getTdDom(dom) {
  let tagName = dom.tagName;
  if (tagName.toLowerCase() === 'td') {
    return dom;
  } else {
    return getTdDom(dom.parentElement);
  }
} */
/* 处理legend的别名 */
export function dealLegendAlias (legend, expression) {
  if (/\{\{.+\}\}/.test(expression)) {
    const labelValue = expression.replace(/(\{\{.+?\}\})/g, function (i) {
      const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
      const reg = new RegExp('\\b' + label + '=".+?"')
      let value = null
      if (reg.test(legend)) {
        const find = legend.match(reg)[0]
        value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
      }
      return value || label
    })
    return labelValue
  } else {
    return expression
  }
}
