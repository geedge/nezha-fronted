<template>
  <transition name="el-message-fade" @after-leave="handleAfterLeave">
    <div
      :class="[
        'el-message',
        type && !iconClass ? `el-message--${ type }` : '',
        center ? 'is-center' : '',
        showClose ? 'is-closable' : '',
        customClass
      ]"
      :style="positionStyle"
      v-show="visible"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      role="alert">
      <i :class="iconClass" v-if="iconClass"></i>
      <i :class="typeClass" v-else></i>
      <slot>
        <p v-if="!dangerouslyUseHTMLString" class="el-message__content">{{ message }}</p>
        <p v-else v-html="message" class="el-message__content"></p>
      </slot>
      <i v-if="showClose" class="el-message__closeBtn el-icon-close" @click="close"></i>
      <div v-if="duration&&!showClose" :style="{'width':messageWidth+'%',background:progressColor[type]}" class="progress"></div>
    </div>
  </transition>
</template>

<script type="text/babel">
const typeMap = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error'
}

function create (f) {
  const blob = new Blob(['(' + f + ')()'])
  const url = window.URL.createObjectURL(blob)
  const worker = new Worker(url)
  return worker
}

const createWorker = (callback, time) => {
  const pollingWorker = create(`function (e) {
    setInterval(function () {
      this.postMessage(null)
    }, ${time})
  }`)
  pollingWorker.onmessage = callback
  return pollingWorker
}

const stopWorker = (vm) => {
  try {
    vm && vm.terminate()
  } catch (err) {
    console.log(err)
  }
}

export default {
  data () {
    return {
      visible: false,
      message: '',
      duration: 3000,
      type: 'info',
      iconClass: '',
      customClass: '',
      onClose: null,
      showClose: false,
      closed: false,
      verticalOffset: 20,
      worker: null,
      dangerouslyUseHTMLString: false,
      center: false,
      // 进度条颜色
      progressColor: {
        success: '#77DABE',
        info: '',
        warning: '',
        error: '#FBBAAF'
      },
      // 进度条宽度
      messageWidth: 0
    }
  },

  computed: {
    typeClass () {
      return this.type && !this.iconClass
        ? `el-message__icon el-icon-${typeMap[this.type]}`
        : ''
    },
    positionStyle () {
      return {
        top: `${this.verticalOffset}px`
      }
    }
  },

  watch: {
    closed (newVal) {
      if (newVal) {
        this.visible = false
      }
    }
  },

  methods: {
    handleAfterLeave () {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },

    close () {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    },

    clearTimer () {
      stopWorker(this.worker)
    },

    startTimer () {
      if (this.duration > 0) {
        // 开启进度条定时器
        const part = 100 / (this.duration / 10)
        this.worker = createWorker(() => {
          this.messageWidth += part
          if (this.messageWidth > 100) {
            this.clearTimer()
            if (!this.closed) {
              this.close()
            }
          }
        }, 10)
      }
    },
    keydown (e) {
      if (e.keyCode === 27) { // esc关闭消息
        if (!this.closed) {
          this.close()
        }
      }
    }
  },
  mounted () {
    this.startTimer()
    document.addEventListener('keydown', this.keydown)
  },
  beforeDestroy () {
    this.clearTimer()
    document.removeEventListener('keydown', this.keydown)
  }
}
</script>

<style scoped>

.el-message{
  min-width: 180px;
}

.progress{
  height: 4px;
  position: absolute;
  left: 0;
  bottom: -1px;
}

</style>
