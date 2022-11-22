<template>
  <div class="fileDirectory" style="width: 100% !important;transform: scale(1) !important;">
    <div class="file-directory-header">
      <span style="color: #fff">{{$t('terminal.sftp')}} <span style="color: #B7B7B7">{{fileDirectory}}</span></span>
      <span  style="color: #fff">
          <i class="nz-icon nz-icon-a-newfolder" @click="newFolderBoxShow = true"></i>
          <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
          <i class="nz-icon nz-icon-close" @click="$emit('close')"></i>
        </span>
    </div>
    <div class="file-directory-content" v-my-loading="fileDirectoryLoading">
      <div v-if="fileDirectory !== '/'" @click="backFileDirectory" class="file-item"><i class="nz-icon nz-icon-a-upperlevel"/>{{$t('terminal.back')}}</div>
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
      :title='$t("overall.newFolder")'
      :visible.sync="newFolderBoxShow"
      :modal-append-to-body="true"
      :append-to-body="true"
      :width="'400px'"
      >
      <div style="display: flex; align-items: center">
        <div style="width: 100px;flex-shrink: 1">{{$t('overall.folderName')}}</div>
        <el-input v-model="folder" size="small" style="flex: 1"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newFolder(false)" size="small">{{$t('overall.cancel')}}</el-button>
        <el-button type="primary" @click="newFolder(true)" size="small">{{$t('overall.create')}}</el-button>
      </span>
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
      fileList: [],
      newFolderBoxShow: false,
      folder: '',
      fileDirectoryLoading: false
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
    getSftpPath (path) {
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
      const params = {
        uuid: this.uuid,
        path: this.fileDirectory + '/' + item.name
      }
      this.$post('/terminal/sftp/rm', params).then(res => {
        if (res.code == 200) {
          this.getSftpPath(this.fileDirectory)
        } else {
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
