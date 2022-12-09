<template>
  <div class="webTerminal">
    <div class="web-terminal-header">
      <div>  <img alt="loading..." height="26" :src="logo?logo:require('../../assets/img/logo1-2.png')"/>Web terminal</div>
      <div>
        <div class="console-title-icon" style='right: 106px;display: inline;position: absolute' @click="showFileState" v-show="fileList.length">
          <i class="nz-icon nz-icon-a-filetransfer" :title="$t('terminal.filetransfer')"></i>
          <span v-show="fileList.length>0" class="right-tip">{{fileList.length<=99?fileList.length:'99+'}}</span>
        </div>
        {{name}}</div>
    </div>
    <fileListState v-clickoutside="hideFileState" ref="fileListState"/>
    <webSSHNew ref="websshNew" />
    <el-input :placeholder="'发送文本到所有SSH终端'" size="small"  class="shell-input" v-model="message"/>
  </div>
</template>

<script>
import webSSHNew from '@/components/cli/webSSHNew'
import fileListState from './fileListState'
export default {
  name: 'terminal',
  components: {
    webSSHNew,
    fileListState
  },
  data () {
    return {
      logo: '',
      fileListStateType: '',
      message: '',
      name: ''
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
      console.log(e)
      if (e.data) {
        try {
          const data = JSON.parse(e.data)
          self.$get('asset/asset/' + data.id).then(res => {
            const asset = res.data
            self.$refs.websshNew.addConsole(asset.id, asset.manageIp, '', '', 'asset')
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
  },
  methods: {
    showFileState () {
      let type = 'down'
      this.fileListStateType = type = 'down'
      this.$refs.fileListState.fileStateShow(!this.$refs.fileListState.fileStateBox, type)
    },
    hideFileState () {
      this.$refs.fileListState.fileStateShow(false, this.fileListStateType)
    }
  },
  beforeDestroy  () {

  }
}
</script>

<style scoped lang="scss">

</style>
