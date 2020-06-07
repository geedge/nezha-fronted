import PerfectScrollbar from "perfect-scrollbar";

//top置顶按钮公共方法
export function toTop(type, wrap) {
  if (type == 'el') {
    let currentTop = wrap.scrollTop;
    let interval = currentTop/10;
    let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
      if (currentTop == 0) {
        clearInterval(intervalFunc);
      } else {
        currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
        wrap.scrollTop = currentTop;
      }
    }, 20);
  } else {
    let els = document.querySelectorAll(".el-table__body-wrapper");
    if (wrap || wrap == 0) { //指定index的table__body
      let currentTop = els[wrap].scrollTop;
      let interval = currentTop/10;
      let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
        if (currentTop == 0) {
          clearInterval(intervalFunc);
        } else {
          currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
          els[wrap].scrollTop = currentTop;
        }
      }, 20);
    } else { //所有table__body
      for (let i = 0; i < els.length; i++) {
        let currentTop = els[i].scrollTop;
        let interval = currentTop/10;
        let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
          if (currentTop == 0) {
            clearInterval(intervalFunc);
          } else {
            currentTop = (currentTop - interval) < interval*0.5 ? 0 : currentTop - interval;
            els[i].scrollTop = currentTop;
          }
        }, 20);
      }
    }
  }
}

/*弹窗点击外部后关闭*/
const exceptClassName = ["config-dropdown", "nz-pop", "el-picker", "chart-box-dropdown", 'metric-dropdown', 'el-cascader__dropdown', "asset-dropdown", "no-style-class", 'el-message-box','nz-dashboard-dropdown']; //clickoutside排除的class(白名单)  no-style-class：没有任何样式的class
export const clickoutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      if (el.contains(e.target)) {
        return false;
      } else {
        let flag = true;
        let path = e.path || (e.composedPath && e.composedPath());
        top: for (let i = 0; i < path.length; i++) {
          for (let j = 0; j < exceptClassName.length; j++) {
            if (path[i].className && path[i].className.indexOf(exceptClassName[j]) != -1) {
              flag = false;
              break top;
            }
          }
        }
        if (!flag) {
          return false;
        }
      }
      // 判断指令中是否绑定了函数
      if (binding.expression) {
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
        if (binding.arg) {
          binding.value(e, binding.arg);
        } else {
          binding.value(e);
        }

      }
    }

    // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
    el.__vueClickOutside__ = documentHandler;
    document.addEventListener('mousedown', documentHandler);
  },
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener('mousedown', el.__vueClickOutside__);
    delete el.__vueClickOutside__;
  },
};

/*el-table自定义滚动条*/
const el_scrollBar = el => {
  if (el._ps_ instanceof PerfectScrollbar) {
    el._ps_.update();
  } else {
    //el上挂一份属性
    el._ps_ = new PerfectScrollbar(el, {minScrollbarLength: 25});
  }
};
export const scrollBar = {
  inserted(el, binding, vnode) {
    const { arg } = binding;
    if (arg === "el-table") {
      el = el.querySelector(".el-table__body-wrapper");
      !el && console.warn("未发现className为el-table__body-wrapper的dom");
    } else if (arg === "el-dropdown") {
      el = document.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    } else if (arg == "legend") {
      el = el.querySelector(".legend-container");
      !el && console.warn("未发现className为legend-container的dom");
    }

    // 启用x轴后不让原生滚动条出来作乱
    if (el) {
      vnode.context.$nextTick(() => {
        if (arg === "xterm") {
          el = el.querySelector(".xterm-viewport");
          !el && console.warn("未发现className为xterm-viewport的dom");
        }
        if(arg==="metric-label-cascader"){
          el = el.querySelector(".el-cascader__tags");
          !el && console.warn("未发现className为el-cascader__tags的dom");
        }
        el.classList.add("ps");
        el.addEventListener("ps-scroll-y", () => {
          el.classList.add("ps");
        });
        el.addEventListener("ps-scroll-x", () => {
          el.classList.add("ps");
        });
        //el上挂一份属性
        el_scrollBar(el);
      });

      const rules = ["fixed", "absolute", "relative"];
      if (!rules.includes(window.getComputedStyle(el, null).position)) {
        console.error(
          `perfect-scrollbar所在的容器的position属性必须是以下之一：${rules.join(
            "、"
          )}`
        );
      }
    }
  },
  componentUpdated(el, binding, vnode, oldVnode) {
    const { arg, value } = binding;
    if (arg === "el-table") {
      el = el.querySelector(".el-table__body-wrapper");
      !el && console.warn("未发现className为el-table__body-wrapper的dom");
    } else if (arg === "el-dropdown") {
      el = document.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    }else if (arg === "xterm") {
      el = el.querySelector(".xterm-viewport");
      !el && console.warn("未发现className为xterm-viewport的dom");
    }else if(arg==="metric-label-cascader"){
      el = el.querySelector(".el-cascader__tags");
      !el && console.warn("未发现className为el-cascader__tags的dom");
    }
    setTimeout(() => {
      el.classList.add("ps");
      el.classList.add("ps--active-y");
      el._ps_.update();
    }, 1500)

    try {
      vnode.context.$nextTick(() => {
        el_scrollBar(el);
        if (value) {
          el.querySelector(".ps__rail-x").classList.add("ps-scroll-" + value);
          el.querySelector(".ps__rail-y").classList.add("ps-scroll-" + value);
        }
      });
    } catch (error) {
      console.error(error);
      el_scrollBar(el);
    }
  },
};

// 底部上滑框窗口控制
export const bottomBoxWindow = {
  // 鼠标拖动二级列表
  listResize(vm, e) {
    window.resizing = true;
    let mainListDom = document.querySelector(".main-list-with-sub"); //主列表
    let subListDom = document.querySelector(".sub-list"); //副列表
    let contentRightDom = document.querySelector(".content-right"); //右侧内容区
    let contentRightHeight = contentRightDom.offsetHeight;//可视高度
    //得到点击时俩dom的初始高度：
    let mainInitialHeight = mainListDom.offsetHeight;
    let subInitialHeight = subListDom.offsetHeight;
    //点击时鼠标的Y轴位置
    let mouseInitialY = e.clientY;

    document.onmousemove = (e) => {
      window.resizing = true;
      mainListDom.classList.remove('main-and-sub-transition');
      subListDom.classList.remove('main-and-sub-transition');
      e.preventDefault();
      //得到鼠标拖动的距离
      let mouseMoveY = Math.abs(e.clientY - mouseInitialY);

      //往上方拖动：
      if (e.clientY < mouseInitialY) {
        vm.toTopBtnTop = mainInitialHeight-mouseMoveY+20+'px';
        mainListDom.style.height = mainInitialHeight-mouseMoveY+'px';
        subListDom.style.height = subInitialHeight+mouseMoveY+'px';
      }
      //往下方拖动：
      if (e.clientY > mouseInitialY) {
        vm.toTopBtnTop = mainInitialHeight+mouseMoveY+20+'px';
        mainListDom.style.height = mainInitialHeight+mouseMoveY+'px';
        subListDom.style.height = subInitialHeight-mouseMoveY+'px';
      }

      // 主、副列表最小高度限制为15px; 23是因为拖动区域有8的高度
      if(parseInt(mainListDom.style.height) > contentRightHeight-23){
        vm.toTopBtnTop = contentRightHeight+5+'px';
        mainListDom.style.height = contentRightHeight-23+'px';
      }
      if(parseInt(mainListDom.style.height) <= 15){
        vm.toTopBtnTop = '35px';
        mainListDom.style.height = '15px';
      }
      if(parseInt(subListDom.style.height) > contentRightHeight-23){
        subListDom.style.height = contentRightHeight-23+'px';
      }
      if(parseInt(subListDom.style.height) <= 15){
        subListDom.style.height = '15px';
      }
      //当主副列表可视区域小于一定值时，不展示内容
      if(parseInt(mainListDom.style.height) <= 100){
        if (vm.mainResizeShow) {
          vm.mainResizeShow = false;
        }
      } else {
        if (!vm.mainResizeShow) {
          vm.mainResizeShow = true;
        }
      }
      if(parseInt(subListDom.offsetHeight) <= 100){
        if (vm.subResizeShow) {
          vm.subResizeShow = false;
        }
      } else {
        if (!vm.subResizeShow) {
          vm.subResizeShow = true;
        }
      }
    };
    document.onmouseup = () => {
      window.resizing = false;
      mainListDom.classList.add('main-and-sub-transition');
      subListDom.classList.add('main-and-sub-transition');
      document.onmousemove = null;
    }
  },
  exitFullScreen(vm) {
    window.resizing = true;
    let contentRightDom = document.querySelector(".content-right"); //右侧内容区
    let contentRightHeight = contentRightDom.offsetHeight;//可视高度
    //主列表
    document.querySelector(".main-list-with-sub").style.height = vm.mainListHeight ? vm.mainListHeight + 'px' : 'calc(50% - 4px)';

    //副列表
    document.querySelector(".sub-list").style.height = vm.mainListHeight ? contentRightHeight-vm.mainListHeight-9 + 'px' : 'calc(50% - 4px)';
    setTimeout(() => {
      vm.isFullScreen = false;
      if (document.querySelector(".main-list-with-sub").offsetHeight >= 100) {
        vm.mainResizeShow = true;
      }
      if (document.querySelector(".sub-list").offsetHeight >= 100) {
        vm.subResizeShow = true;
      }
      window.resizing = false;
    }, 210);
  },
  fullScreen(vm) {
    window.resizing = true;
    let contentRightDom = document.querySelector(".content-right"); //右侧内容区
    let contentRightHeight = contentRightDom.offsetHeight;//可视高度
    vm.isFullScreen = true;
    //主列表
    vm.mainListHeight = document.querySelector(".main-list-with-sub").offsetHeight; //记录全屏前主列表的高度
    document.querySelector(".main-list-with-sub").style.height = '0';
    vm.mainResizeShow = false;
    //副列表
    document.querySelector(".sub-list").style.height = contentRightHeight + 'px';
    window.resizing = false;
  },
  showSubListWatch(vm, n) {
    vm.inTransform = n;
    if (!n) {
      vm.mainTableHeight = vm.$tableHeight.normal; //重置table的高度
      vm.toTopBtnTop = vm.$tableHeight.toTopBtnTop;
      vm.isFullScreen = false;
      //移动分页组件的位置
      let paginationTop = document.querySelector(".pagination-top");
      let paginationBottom = document.querySelector(".pagination-bottom");
      paginationTop.classList.remove("display-none");
      if (paginationTop.classList.contains("pagination-top-show")) {
        paginationTop.classList.remove("pagination-top-show");
      }
      if (!paginationTop.classList.contains("pagination-top-hide")) {
        paginationTop.classList.add("pagination-top-hide");
      }
      setTimeout(() => {
        paginationTop.classList.add("display-none");
        paginationBottom.appendChild(paginationTop.removeChild(document.querySelector(".pagination")));
      }, 210);

      // 主列表恢复全屏
      vm.mainResizeShow = vm.subResizeShow = true;
      document.querySelector('.main-list').style.height = "";
      //副列表高度清空
      document.querySelector(".sub-list").style.height = '';
    } else {
      vm.mainTableHeight = vm.$tableHeight.openSubList.mainList; //重置table高度
      vm.toTopBtnTop = vm.$tableHeight.openSubList.toTopBtnTop;
      //移动分页组件的位置
      let paginationTop = document.querySelector(".pagination-top");
      paginationTop.appendChild(document.querySelector(".pagination-bottom").removeChild(document.querySelector(".pagination")));
      paginationTop.classList.remove("display-none");
      setTimeout(() => {
        if (paginationTop.classList.contains("pagination-top-hide")) {
          paginationTop.classList.remove("pagination-top-hide");
        }
        if (!paginationTop.classList.contains("pagination-top-show")) {
          paginationTop.classList.add("pagination-top-show");
        }
      }, 210);
    }
  }
};
export function stringTimeParseToUnix(stringTime){
  let time=new Date(stringTime).getTime();
  return time/1000;
}

export function unixTimeParseToString(unixTime,fmt='yyyy-MM-dd hh:mm:ss'){
  let date=new Date(unixTime * 1000);
  var o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}

//chart-resize工具
export const chartResizeTool = {
  minHeight: 200, //图表最小高度
  chartPaddingTop: 20, //图表padding-top
  chartBlankHeight: 22, //图表空白占位高度(padding-top + border)
  chartTableBlankHeight: 6, //表格型图表额外空白占位高度
  chartBlankWidth: 20, //图表空白占位宽度
  containerBlankWidth: 25, //容器空白占位宽度（#listContainer的padding）
  titleHeight: 28, //标题dom高度
  stepHeight: 50, //单元高度
  stepWidth(containerWidth) { //单元宽度，参数为容器总宽度
    return (containerWidth-this.containerBlankWidth)/12;
  },
  calculateHeight(original) {
    let height = Math.floor(original/this.stepHeight)*this.stepHeight;
    if (height < this.minHeight) {
      height = this.minHeight;
    }
    return height-this.chartBlankHeight;
  },
  start(vm, originalData, event) {
    let data = JSON.parse(JSON.stringify(originalData)); //将初始对象复制，后续操作使用复制对象
    let shadow = vm.$refs.resizeShadow; //缩放时底部阴影dom
    if (!shadow) {
      shadow = vm.$refs[0].resizeShadow;
    }
    let box = vm.$refs.resizeBox; //图表内容dom
    if (!box) {
      box = vm.$refs[0].resizeBox;
    }
    let chartPaddingTop = this.chartPaddingTop;
    let chartBlankWidth = this.chartBlankWidth;
    let chartBlankHeight = this.chartBlankHeight;
    let titleHeight = this.titleHeight;
    let stepWidth = this.stepWidth(document.getElementById('listContainer').offsetWidth);
    let stepHeight = this.stepHeight;

    let mouseOriginalX = event.clientX; //鼠标初始坐标
    let mouseOriginalY = event.clientY;
    let originalWidth = stepWidth*data.span; //图表、阴影初始宽高
    let shadowNewWidth = originalWidth;
    let originalHeight = data.height;
    let shadowNewHeight = originalHeight;

    //1.激活背景阴影
    shadow.classList.add("resize-shadow-active");
    //2.鼠标移动时调整resize-box的宽高，同时监听宽高的变化，变化量每达到step的50%时改变resize-shadow的尺寸并重绘resize-box内容
    document.addEventListener("mousemove", moveListener);
    //3.鼠标松开，将resize-box宽高改为resize-shadow宽高，结束
    document.addEventListener("mouseup", mouseupListener);


    function moveListener(e) {
      let mouseX = e.clientX;
      let mouseY = e.clientY;
      //调整resize-box的宽高
      box.style.width = `${originalWidth+(mouseX-mouseOriginalX)-chartBlankWidth}px`;
      box.style.height = `${originalHeight+(mouseY-mouseOriginalY)-chartBlankHeight}px`;
      //监听宽高的变化，变化量每达到step的50%时改变resize-shadow的尺寸并重绘resize-box内容
      let remainderWidth = (box.offsetWidth+chartBlankWidth-shadowNewWidth)%stepWidth; //宽的余数
      let remainderHeight = (box.offsetHeight+chartBlankHeight-shadowNewHeight)%stepHeight; //高的余数
      boxStepHandler(remainderWidth, remainderHeight);
    }
    function mouseupListener(e) {
      //将resize-box的宽高设为resize-shadow的宽高
      box.style.width = `${shadow.offsetWidth}px`;
      box.style.height = `${Math.round(shadow.offsetHeight/10)*10}px`;
      data.height = Math.round((box.offsetHeight+chartPaddingTop)/stepHeight)*stepHeight;
      data.span = Math.round((box.offsetWidth+chartBlankWidth)/stepWidth);
      //请求后台，保存变更
      if (data.height != originalData.height || data.span != originalData.span) {

        originalData.height = data.height;
        originalData.span = data.span;
        vm.$put("panel/" + vm.panelIdInner + "/charts/modify", originalData);
      }
      //关闭背景阴影
      shadow.classList.remove("resize-shadow-active");

      document.removeEventListener("mousemove", moveListener);
      document.removeEventListener("mouseup", mouseupListener);
    }
    function boxStepHandler(width, height) { //param: 宽高变化量，大于0放大，小于0缩小
      let widthChange = false;
      let heightChange = false;
      if (width > stepWidth/2) { //放大shadow宽
        widthChange = true;
        //判断是否因为百分数计算的宽度有小数的原因导致宽度超过当前行，使图表错误换行
        let currentWidth = shadow.offsetWidth+stepWidth;
        let currentSpan = Math.round((currentWidth+chartBlankWidth)/stepWidth);
        let calcWidth = currentSpan*stepWidth-chartBlankWidth; //不会换行的宽度
        shadow.style.width = `${calcWidth}px`;
      } else if (width <= 0-(stepWidth/2)) { //缩小shadow宽
        widthChange = true;
        let currentWidth = shadow.offsetWidth-stepWidth;
        let currentSpan = Math.round(currentWidth/stepWidth);
        let calcWidth = currentSpan*stepWidth-chartBlankWidth; //不会换行的宽度
        shadow.style.width = `${calcWidth}px`;
      }
      if (widthChange) {
        shadowNewWidth = shadow.offsetWidth;
      }
      if (height > stepHeight/2) { //放大shadow高
        heightChange = true;
        shadow.style.height = `${Math.round(shadow.offsetHeight/10)*10+stepHeight}px`;
      } else if (height <= 0-(stepHeight/2)) { //缩小shadow高
        heightChange = true;
        shadow.style.height = `${Math.round(shadow.offsetHeight/10)*10-stepHeight}px`;
      }
      if (heightChange) {
        shadowNewHeight = shadow.offsetHeight+chartBlankHeight;
      }

      if (widthChange || heightChange) {
        //step时chart重绘
        if (box.classList.contains("resize-box-echarts")) { //echarts类型
          vm.echartStore.resize({width: shadow.offsetWidth-16, height: shadow.offsetHeight-titleHeight-vm.$refs.legendArea.offsetHeight});
        }
        //chart外层宽高调整
        let outerBox = document.getElementById(`chart-${data.id}`);
        outerBox.style.height = `${shadow.offsetHeight+chartPaddingTop}px`;
        outerBox.style.width = `${parseFloat(shadow.style.width.split("px")[0])+chartBlankWidth}px`;
      }
    }
  }
}
