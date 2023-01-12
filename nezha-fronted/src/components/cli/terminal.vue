<template>
  <div class="webTerminal">
    <div class="web-terminal-header">
      <div>  <img alt="loading..." height="26" :src="logo?logo:imageUrl"/>{{$t('terminal.title')}}</div>
      <div>
        <div class="console-title-icon" style='right: 106px;display: inline;position: absolute' @click="showFileState" v-show="fileList.length">
          <i class="nz-icon nz-icon-a-filetransfer" :title="$t('terminal.filetransfer')"></i>
          <span v-show="fileList.length>0" class="right-tip">{{fileList.length<=99?fileList.length:'99+'}}</span>
        </div>
        {{name}}</div>
    </div>
    <fileListState v-clickoutside="hideFileState" ref="fileListState"/>
    <webSSHNew ref="websshNew" />
    <div class="shell-input">
      <el-input ref="shellInput" :placeholder="placeholder" size="small" v-model="message" @keyup.enter.native="sendMessage" @focus="placeholderChange('focus')"  @blur="placeholderChange('blur')">
        <i slot="suffix" class="nz-icon nz-icon-history no-style-class" :class="{'active':visible}" :title="$t('terminal.history')" @click="toggleHistory"></i>
      </el-input>
      <transition name="el-zoom-in-bottom">
        <div class="web-terminal-history no-style-class" v-show="visible" v-clickoutside="clickout">
          <div class="terminal-history-header">
            <span>{{$t('terminal.history')}}</span>
            <i class="nz-icon nz-icon-close" @click="visible=false"></i>
          </div>
          <div class="terminal-history-list-wrap" v-if="historyArr.length">
            <!-- 历史命令记录 -->
            <ul class="terminal-history-list">
              <li class="terminal-history-item" v-for="(item,index) in historyArr" :key="index" @click="historyClick(item)">
                <span class="terminal-history-num">{{index+1}}</span>
                <span class="terminal-history-text">{{item}}</span>
              </li>
            </ul>
          </div>
          <div v-else class="terminal-history-empty">{{$t('terminal.noHistoricalRecord')}}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import webSSHNew from '@/components/cli/webSSHNew'
import fileListState from './fileListState'
import imageUrl from '@/assets/img/logo1-2.png'
import bus from '@/libs/bus'
export default {
  name: 'terminal',
  components: {
    webSSHNew,
    fileListState
  },
  data () {
    return {
      imageUrl,
      logo: '',
      fileListStateType: '',
      message: '',
      name: '',
      placeholder: this.$t('terminal.placeholder'),
      visible: false,
      // 历史命令记录
      historyArr: []
    }
  },
  computed: {
    language () { return this.$store.getters.getLanguage },
    fileList () {
      return this.$store.getters.getFileList
    }
  },
  created () {
    const self = this
    window.addEventListener('setItemEvent', function (e) {
      if (e.key == 'nz-sys-logo' && e.value) {
        self.logo = e.value
      }
    })
    this.logo = localStorage.getItem('nz-sys-logo')
    this.getHistory()
  },
  mounted () {
    const self = this
    this.name = localStorage.getItem('nz-username')
    window.onbeforeunload = () => {
      const opener = window.opener
      opener.postMessage(
        JSON.stringify({
          close: true
        })
      )
    }
    window.addEventListener('message', function (e) {
      if (e.data) {
        try {
          const data = JSON.parse(e.data)
          self.$get('asset/asset/' + data.id).then(res => {
            const asset = res.data
            self.$refs.websshNew.addConsole(asset.id, asset.manageIp, '', '', 'asset', asset, 'father')
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
  },
  methods: {
    clickout () {
      this.visible = false
    },
    showFileState () {
      let type = 'down'
      this.fileListStateType = type = 'down'
      this.$refs.fileListState.fileStateShow(!this.$refs.fileListState.fileStateBox, type)
    },
    hideFileState () {
      this.$refs.fileListState.fileStateShow(false, this.fileListStateType)
    },
    placeholderChange (type) {
      if (type == 'focus') {
        this.placeholder = ''
      } else {
        this.placeholder = this.$t('terminal.placeholder')
      }
    },
    sendMessage () {
      this.$refs.websshNew.sendMessage(this.message)
      setTimeout(() => {
        this.message = ''
      })
    },
    // 获取历史输入命令
    getHistory () {
      const length = localStorage.getItem('nz-history-size') || 100
      let historyArr = JSON.parse(localStorage.getItem('nz-history-terminal') || '[]')
      // 截取最后n条
      historyArr = historyArr.slice(-length)
      this.historyArr = historyArr
    },
    // 切换历史记录显示隐藏
    toggleHistory () {
      this.visible = !this.visible
    },
    // 点击历史记录
    historyClick (value) {
      this.visible = false
      this.message = value
      this.$nextTick(() => {
        this.$refs.shellInput.focus()
      })
    },
    // 新增历史记录
    historyChange: bus.debounce(function (message) {
      const historyArr = JSON.parse(localStorage.getItem('nz-history-terminal') || '[]')
      const lastItem = historyArr[historyArr.length - 1]
      // 上一个命令 和 当前命令 trim 后内容完全一致，则不记录
      if (!lastItem || (lastItem && lastItem.trim() != message.trim())) {
        historyArr.push(message)
      }
      localStorage.setItem('nz-history-terminal', JSON.stringify(historyArr))
      this.getHistory()
    }, 100)
  }
}
</script>
