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
const exceptClassName = ["config-dropdown", "nz-pop", "el-picker", "chart-box-dropdown", 'metric-dropdown', 'el-cascader__dropdown', "asset-dropdown", "no-style-class", 'el-message-box']; //clickoutside排除的class(白名单)  no-style-class：没有任何样式的class
export const clickoutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      if (el.contains(e.target)) {
        return false;
      } else {
        //console.info(e)
        let flag = true;
        top: for (let i = 0; i < e.path.length; i++) {
          for (let j = 0; j < exceptClassName.length; j++) {
            if (e.path[i].className && e.path[i].className.indexOf(exceptClassName[j]) != -1) {
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
      el = el.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    } else if (arg == "legend") {
      el = el.querySelector(".legend-container");
      !el && console.warn("未发现className为legend-container的dom");
    }

    // 启用x轴后不让原生滚动条出来作乱
    vnode.context.$nextTick(() => {
      if (arg === "xterm") {
        el = el.querySelector(".xterm-viewport");
        !el && console.warn("未发现className为xterm-viewport的dom");
      }
      el.classList.add("ps");
      el.addEventListener("ps-scroll-y", () =>
        el.classList.add("ps")
      );
      el.addEventListener("ps-scroll-x", () =>
        el.classList.add("ps")
      );
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
  },
  componentUpdated(el, binding, vnode, oldVnode) {
    const { arg } = binding;
    if (arg === "el-table") {
      el = el.querySelector(".el-table__body-wrapper");
      !el && console.warn("未发现className为el-table__body-wrapper的dom");
    } else if (arg === "el-dropdown") {
      el = el.querySelector(".el-dropdown-menu");
      !el && console.warn("未发现className为el-dropdown-menu的dom");
    }else if (arg === "xterm") {
      el = el.querySelector(".xterm-viewport");
      !el && console.warn("未发现className为xterm-viewport的dom");
    }
    setTimeout(() => {
      el.classList.add("ps");
      el.classList.add("ps--active-y");
      el._ps_.update();
    }, 1500)

    try {
      vnode.context.$nextTick(() => {
        el_scrollBar(el);
      });
    } catch (error) {
      console.error(error);
      el_scrollBar(el);
    }
  },
};
