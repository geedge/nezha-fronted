<template>
  <div class="webTerminal">
    <div class="web-terminal-header">
      <div>  <img alt="loading..." height="26" :src="logo?logo:imageUrl"/>{{$t('terminal.title')}}</div>
      <div>
        <div class="console-title-icon" style='right: 106px;display: inline;position: absolute' @click="showFileState" v-show="fileList.length">
          <i class="nz-icon nz-icon-a-filetransfer" :title="$t('terminal.filetransfer')"></i>
          <span v-show="fileList.length>0" class="right-tip">{{fileList.length<=99?fileList.length:'99+'}}</span>
        </div>
        <div class="personal" id="personal">
          <el-dropdown trigger="click">
            <div class="personal-avatar"><span>{{name ? name.substr(0, 1) : ''}}</span>&nbsp;<i class="nz-icon nz-icon-arrow-down"></i></div>
            <el-dropdown-menu  slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top" style="width: 142px; line-height: 36px;">
              <div class="personal-dropdown">
                <div class="personal-dropdown__username" :title="name">{{name}}</div>
                <div class="personal-dropdown__name" :title="name">@{{name}}</div>
              </div>
              <el-dropdown-item>
                <div id="header-to-personalization" @click="showPersonalization"><i class="nz-icon nz-icon-personalization"></i>{{$t('terminal.personal')}}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="header-to-logout" @click="logout"><i class="nz-icon nz-icon-exit"></i>{{$t('overall.signOut')}}</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <fileListState v-clickoutside="hideFileState" ref="fileListState"/>
    <webSSHNew ref="websshNew" :terminalSetting="terminalSetting" />
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
                <span class="terminal-history-text" :title="item">{{item}}</span>
              </li>
            </ul>
          </div>
          <div v-else class="terminal-history-empty">{{$t('terminal.noHistoricalRecord')}}</div>
        </div>
      </transition>
    </div>
    <!--弹窗-->
    <el-dialog :modal-append-to-body='false' :z-index="1000" :show-close="true" :visible.sync="personalization" @close="personalization = false" class="nz-dialog webshell-selectAsset" width="650px">
      <div slot="title">{{$t('terminal.personal')}}</div>
      <div>
        <el-form v-model="newTerminalSetting" label-width="180px" size="small" ref="terminalForm"  :validate-on-rule-change="false">
          <div class="system-title" style="padding-top: 15px">{{$t('terminal.render')}}</div>
          <el-form-item :label="$t('terminal.waterMaker')" prop="watermark">
            <el-switch v-model="newTerminalSetting.watermark" :active-value='true' :inactive-value='false' id="terminal-setting-watermark_change" size="small">
            </el-switch>
            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.waterMakerInfo')}}</div>
          </el-form-item>
          <el-form-item :label="$t('terminal.scrollbackLines')" prop="scrollbackLines">
            <el-input-number :min="1" :precision="0" :controls="false" :placeholder="'默认25000'" v-model="newTerminalSetting.scrollbackLines" size="small">
            </el-input-number>
            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.scrollbackLinesInfo')}}</div>
          </el-form-item>
          <div class="system-title system-title-border" style="width: 100%;margin-top: 50px">{{$t('terminal.mouse')}}</div>
          <el-form-item :label="$t('terminal.rightClick')" prop="rightClick">
            <el-radio-group  v-model="newTerminalSetting.rightClick" size="small">
              <el-radio-button label="none">{{$t('project.topology.none')}}</el-radio-button>
              <el-radio-button label="menu">{{$t('terminal.menu')}}</el-radio-button>
              <el-radio-button label="paste">{{$t('terminal.paste')}}</el-radio-button>
            </el-radio-group>
            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.rightClickInfo')}}</div>
          </el-form-item>
          <el-form-item :label="$t('terminal.wordSeparator')" prop="wordSeparator">
            <el-input size="small" v-model="newTerminalSetting.wordSeparator">
            </el-input>
            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.wordSeparatorInfo')}}</div>
          </el-form-item>
          <div class="system-title system-title-border" style="width: 100%;margin-top: 50px">{{$t('terminal.clipboard')}}</div>
          <el-form-item :label="$t('terminal.copySelect')" prop="copyOnSelect">
            <el-switch v-model="newTerminalSetting.copyOnSelect" :active-value='true' :inactive-value='false' id="terminal-setting-watermark_change">
            </el-switch>
<!--            <div class="el-form-item__tip" style="margin: 0">{{$t('config.system.basic.pinPolicyValue')}}</div>-->
          </el-form-item>
          <el-form-item :label="$t('terminal.copyFormatting')" prop="copyWithFormatting">
            <el-switch v-model="newTerminalSetting.copyWithFormatting" :active-value='true' :inactive-value='false' id="terminal-setting-watermark_change">
            </el-switch>
<!--            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.copyFormattingInfo')}}</div>-->
          </el-form-item>
          <el-form-item :label="$t('terminal.copyTrimEnd')" prop="copyTrimEnd">
            <el-switch v-model="newTerminalSetting.copyTrimEnd" :active-value='true' :inactive-value='false' id="terminal-setting-watermark_change">
            </el-switch>
            <div class="el-form-item__tip" style="margin: 0">{{$t('terminal.copyTrimEndInfo')}}</div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <button class="footer__btn footer__btn--light" @click="personalization = false">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button class="footer__btn" :disabled="prevent_opt.save" @click.prevent="savePersonalization">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import webSSHNew from '@/components/cli/webSSHNew'
import fileListState from './fileListState'
import imageUrl from '@/assets/img/logo1-2.png'
import bus from '@/libs/bus'
import { mapActions } from 'vuex'
export default {
  name: 'terminal',
  components: {
    webSSHNew,
    fileListState
  },
  provide () {
    return {
      terminalSetting: this.terminalSetting
    }
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
      historyArr: [],
      showPaste: false,
      personalization: false,
      newTerminalSetting: {},
      terminalSetting: {
        watermark: true,
        scrollbackLines: 25000,
        rightClick: 'menu',
        wordSeparator: "\\ :;~`!@#$%^&*()-=+|[]{}'\",.<>/?",
        copyOnSelect: false,
        copyWithFormatting: true,
        copyTrimEnd: false
      }
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
    this.username = localStorage.getItem('nz-username')
    this.showPaste = navigator.clipboard
    this.initTerminalSetting()
    window.opener.name = 'parent'
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
    ...mapActions(['logoutSuccess']),
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
    }, 100),
    logout () {
      window.open('', window.opener.name)
      const opener = window.opener
      opener.postMessage(
        JSON.stringify({
          close: true,
          isLogout: true
        })
      )
    },
    showPersonalization () {
      this.personalization = true
      this.newTerminalSetting = this.$lodash.cloneDeep(this.terminalSetting)
    },
    savePersonalization () {
      this.$put('/sys/user/preference', { terminal: JSON.stringify(this.newTerminalSetting) }).then(res => {
        if (res.code === 200) {
          this.terminalSetting = this.$lodash.cloneDeep(this.newTerminalSetting)
          this.$nextTick(() => {
            this.$refs.websshNew.renderTerminalSetting()
            this.personalization = false
          })
          this.$message.success(this.$t('tip.saveSuccess'))
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    initTerminalSetting () {
      this.$get('/sys/user/preference', { key: 'terminal' }).then(res => {
        if (res.code === 200) {
          if (res.data.terminal) {
            let terminal = {}
            try {
              terminal = JSON.parse(res.data.terminal)
            } catch (e) {}
            this.terminalSetting = {
              ...this.terminalSetting,
              ...terminal
            }
          }
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    }
  }
}
</script>
