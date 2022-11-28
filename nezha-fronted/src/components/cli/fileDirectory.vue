<template>
  <div class="fileDirectory" style="width: 100% !important;transform: scale(1) !important;">
    <div class="file-directory-header">
      <span style="color: #fff">
        {{$t('terminal.sftp')}}
        <span style="color: #B7B7B7;margin-left: 10px">
          <span @click="getSftpPath('/')" class="breadcrumb-item breadcrumb-action"><i class="nz-icon nz-icon-Computer"/></span>
          <span v-for="(item,index) in breadcrumb" :key="index" class="breadcrumb-item">
            /<span class="breadcrumb-action" @click="gotoPath(item,index)">{{item}}</span>
          </span>
        </span>
      </span>
      <span  style="color: #fff" class="header-option">
          <i class="nz-icon nz-icon-a-newfolder" @click="newFolderBoxShow = true"></i>
          <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
          <i class="nz-icon nz-icon-close" @click="$emit('close')"></i>
        </span>
    </div>
    <div class="file-directory-content" v-my-loading="fileDirectoryLoading">
      <div v-if="fileDirectory !== '/'" @click="backFileDirectory" class="file-item"><i class="nz-icon nz-icon-a-upperlevel" style="margin-right: 10px"/>{{$t('terminal.back')}}</div>
      <div v-for="(item,index) in fileList" :key="index" class="file-item" @click="selectFile(item)">
        <div class="text-ellipsis file-name">
          <i class="nz-icon" :class="selIcon(item)"/>
          {{item.name}}
        </div>
        <div class="file-feature" v-if="!item.isDir">
          <i class="nz-icon nz-icon-download1" v-if="!item.isDir" @click="downloadFile(item)"></i>
          <i class="nz-icon nz-icon-delete" v-if="!item.isDir" @click="delFile(item)"></i>
        </div>
        <div class="file-date">
          <span>{{momentTz(item.cts * 1000)}}</span>
          <span v-if="!item.isDir">{{bytes(item.size, 0, 0)}}</span>
        </div>
      </div>
    </div>
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title='$t("overall.newFolder")'
      destroy-on-close
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :visible.sync="newFolderBoxShow"
      @close="newFolder(false)"
    >
      <div style="display: flex; align-items: center">
        <div style="width: 100px;flex-shrink: 1">{{$t('overall.folderName')}}</div>
        <el-input v-model="folder" size="small" style="flex: 1"/>
      </div>
      <div slot="footer">
        <div class="el-message-box__btns">
          <button class="nz-btn el-button el-button--small el-button--default" @click="newFolder(false)">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="newFolder(true)">
            <span style="text-transform:Capitalize">{{$t('overall.create')}}</span>
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'fileDirectory',
  props: {
    uuid: {},
    fileDirectoryShow: {}
  },
  data () {
    return {
      fileDirectory: '/',
      breadcrumb: [],
      fileList: [],
      newFolderBoxShow: false,
      folder: '',
      fileDirectoryLoading: false,
      timer: ''
    }
  },
  computed: {
    updateUuid () {
      return this.$store.getters.getUpdateUuid
    },
    updateIndex () {
      return this.$store.getters.getUpdateIndex
    }
  },
  mounted () {
    // this.init()
  },
  watch: {
    fileDirectoryShow (n) {
      if (n) {
        this.init()
      }
    },
    updateIndex (n) {
      if (this.updateUuid == this.uuid) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          this.getSftpPath(this.fileDirectory)
          this.timer = null
        }, 200)
      }
    }
  },
  methods: {
    bytes: chartDataFormat.getUnit(7).compute,
    init () {
      this.getSftpPath(this.fileDirectory)
    },
    selectFile (item) {
      if (item.isDir) {
        const path = this.fileDirectory == '/' ? '' : this.fileDirectory
        this.getSftpPath(path + '/' + item.name)
      }
    },
    newFolder (flag) {
      if (!flag) {
        this.newFolderBoxShow = false
        this.folder = ''
        return
      }
      const path = this.fileDirectory == '/' ? '' : this.fileDirectory
      const params = {
        uuid: this.uuid,
        path: path + '/' + this.folder
      }
      this.$post('/terminal/sftp/mkdir', params).then(res => {
        this.newFolderBoxShow = false
        this.getSftpPath(this.fileDirectory)
      })
    },
    backFileDirectory () {
      const arr = this.fileDirectory.split('/')
      arr.pop()
      const path = arr.join('/')
      this.getSftpPath(path || '/')
    },
    gotoPath (item, index) {
      const path = '/' + this.breadcrumb.slice(0, index + 1).join('/')
      this.getSftpPath(path || '/')
    },
    getSftpPath (path) {
      this.breadcrumb = path.split('/').filter(item => item)
      const params = {
        uuid: this.uuid,
        path: path
      }
      this.fileDirectoryLoading = true
      this.$post('/terminal/sftp/ls', params).then(res => {
        this.fileDirectoryLoading = false
        this.fileDirectory = res.data.path
        this.fileList = res.data.list
      })
    },
    uploadFile () {
      const params = {
        uuid: this.uuid,
        path: this.fileDirectory,
        myId: 'upload' + this.uuid + new Date().getTime(),
        type: 'upload',
        isStart: false,
        isFinish: false,
        importFileList: [],
        total: '',
        speed: '',
        fileLength: '',
        startTime: '',
        cancel: '',
        axios: '',
        timer: '',
        done: 0
      }
      this.$store.dispatch('uploadFile', params)
    },
    downloadFile (item) {
      if (item.timer) {
        clearTimeout(item.timer)
      }
      item.timer = setTimeout(() => {
        const path = this.fileDirectory == '/' ? '' : this.fileDirectory
        const params = {
          ...item,
          uuid: this.uuid,
          path: path + '/' + item.name,
          myId: 'download' + this.uuid + new Date().getTime(),
          type: 'download',
          isStart: false,
          isFinish: false,
          total: '',
          speed: '',
          fileLength: '',
          startTime: '',
          cancel: '',
          axios: ''
        }
        this.$store.dispatch('dispatchAddFileList', params)
      }, 300)
    },
    delFile (item) {
      const path = this.fileDirectory == '/' ? '' : this.fileDirectory
      const params = {
        uuid: this.uuid,
        path: path + '/' + item.name
      }
      this.$post('/terminal/sftp/rm', params).then(res => {
        if (res.code == 200) {
          this.getSftpPath(this.fileDirectory)
        } else {
          this.getSftpPath(this.fileDirectory)
          this.$message.error(res.msg)
        }
      })
    },
    selIcon (item) {
      // console.log(item)
      const hz = item.name.split('.')[1]
      if (item.isDir) {
        return 'nz-icon-Folder colorFA901C'
      }
      if (item.isReg) {
        return 'nz-icon-File'
      }
      return 'nz-icon-File'
    }
  }
}
</script>

<style scoped lang="scss">

</style>
