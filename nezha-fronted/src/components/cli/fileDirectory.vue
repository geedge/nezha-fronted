<template>
  <div class="fileDirectory">
    <div class="file-directory-header">
        {{$t('terminal.sftp')}}
        <span class="header-option">
          <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
          <i class="nz-icon nz-icon-close" @click="$emit('close')"></i>
        </span>
    </div>
    <div class="file-directory-path" v-clickoutside="hideEditPath">
      <span v-show="!editPathShow" class="breadcrumb-box">
          <span @click="getSftpPath('/')" class="breadcrumb-item breadcrumb-action"><i class="nz-icon nz-icon-home"/></span>
          <span v-for="(item,index) in breadcrumb" :key="index" class="breadcrumb-item">
            /<span class="breadcrumb-action" @click="gotoPath(item,index)">{{item}}</span>
          </span>
          <i class="nz-icon nz-icon-edit" @click="showEditPath"/>
        </span>
      <span v-show="editPathShow">
        <el-input  v-model="editPath" size="small" @keyup.enter.native="goEditPath"/>
      </span>
      <div class="path-option">
        <span style="margin-right: 5px">Show hide File: </span>
        <el-switch  v-model="showHideFile"/>
        <i class="nz-icon nz-icon-a-newfolder" @click="newFolderBoxShow = true"></i>
        <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
      </div>

    </div>
    <div style="padding: 0 20px;height: calc(100% - 50px)" v-my-loading="fileDirectoryLoading">
      <div class="directory-content-header">
        <div class="text-ellipsis file-name">
          {{$t('overall.name')}}
        </div>
        <div class="text-ellipsis file-size">
          {{$t('backup.size')}}
        </div>
        <div class="text-ellipsis file-date">
          {{$t('issue.createTime')}}
        </div>
        <div class="text-ellipsis file-opt">
          {{$t('overall.option')}}
        </div>
      </div>
      <div class="file-directory-content">
        <div v-if="fileDirectory !== '/'" @click="backFileDirectory" class="file-item">
          <div class="text-ellipsis file-name">
            <i class="nz-icon nz-icon-a-upperlevel" style="margin-right: 10px"/>
            {{$t('terminal.back')}}
          </div>
        </div>
        <div v-for="(item,index) in fileList" :key="index" class="file-item" @click="selectFile(item)">
          <div class="text-ellipsis file-name">
            <i class="nz-icon" :class="selIcon(item)"/>
            {{item.name}}
          </div>
          <div class="text-ellipsis file-size">
            <span v-if="!item.isDir">{{bytes(item.size, 0, 0)}}</span>
          </div>
          <div class="text-ellipsis file-date">
            <span>{{momentTz(item.cts * 1000)}}</span>
          </div>
          <div class="text-ellipsis file-opt">
            <i class="nz-icon nz-icon-shuxing" @click.stop="showFileInfo(item)"/>
            <el-dropdown size="medium" trigger="click" @command="tableOperation">
              <div class="table-operation-item table-operation-item--more" @click.stop="" :title="$t('overall.moreOperations')">
                <i class="nz-icon nz-icon-more3"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <el-dropdown-item
                  :command="['rename', item]">
                  <i class="nz-icon nz-icon-edit"></i>
                  <span class="operation-dropdown-text">
                    {{$t('terminal.rename')}}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="item.isDir"
                  :command="['download', item]">
                  <i class="nz-icon nz-icon-download1"></i>
                  <span class="operation-dropdown-text">
                    {{$t('overall.download')}}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="item.isDir"
                  :command="['del', item]">
                  <i class="nz-icon nz-icon-delete"></i>
                  <span class="operation-dropdown-text">
                    {{$t('overall.delete')}}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
<!--            <i class="nz-icon nz-icon-download1" v-if="!item.isDir" @click="downloadFile(item)"></i>-->
<!--            <i class="nz-icon nz-icon-delete" v-if="!item.isDir" @click="delFile(item)"></i>-->
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title='$t("overall.newFolder")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="newFolderBoxShow"
      @close="newFolder(false)"
    >
      <div style="display: flex; align-items: center">
        <div style="width: 100px;flex-shrink: 1;text-transform: capitalize">{{$t('overall.folderName')}}</div>
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
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title='$t("terminal.rename")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="renameBox"
      @close="renameBox = false"
    >
      <div style="display: flex; align-items: center">
        <div style="width: 100px;flex-shrink: 1;text-transform: capitalize">{{$t('overall.name')}}</div>
        <el-input v-model="renameStr" size="small" style="flex: 1"/>
      </div>
      <div slot="footer">
        <div class="el-message-box__btns">
          <button class="nz-btn el-button el-button--small el-button--default" @click="renameBox = false">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="setRename">
            <span style="text-transform:Capitalize">{{$t('overall.save')}}</span>
          </button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title='$t("overall.delete")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="delDialog"
      @close="delDialog = false"
    >
      <div style="display: flex; align-items: center" v-if="delObj">
       {{$t('terminal.delinfo',{fileName: delObj.name})}}
      </div>
      <div slot="footer">
        <div class="el-message-box__btns">
          <button class="nz-btn el-button el-button--small el-button--default" @click="delDialog = false" >
            <span>{{$t('tip.no')}}</span>
          </button>
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="delFile">
            <span style="text-transform:Capitalize">{{$t('tip.yes')}}</span>
          </button>
        </div>
      </div>
    </el-dialog>

<!--    fileInfo-->
    <el-dialog
      class="nz-dialog snapshot-dialog"
      width="472px"
      :title='$t("overall.labels")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="fileInfoShow"
      @close="fileInfoShow = false"
    >
      <div v-if="fileInfo">
        <div class="file-info-item-header">
          <i class="nz-icon" :class="selIcon(fileInfo)"/>
          {{fileInfo.name}}
        </div>
        <div v-for="item in fileAttr" :key="item.name" class="file-info-item">
          <div class="file-info-item-left" :class="{'is-disabled': fileInfo.isDir && item.key =='size'}">
            {{$t(item.name)}} :
          </div>
          <div class="file-info-item-right">
            {{selInfo(fileInfo, item.key)}}
          </div>
        </div>
      </div>
      <div slot="footer">
        <div class="el-message-box__btns">
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="fileInfoShow = false">
            <span style="text-transform:Capitalize">{{$t('overall.close')}}</span>
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
    fileDirectoryShow: {},
    host: {}
  },
  data () {
    return {
      fileDirectory: '/',
      breadcrumb: [],
      fileList: [],
      newFolderBoxShow: false,
      folder: '',
      fileDirectoryLoading: false,
      timer: '',
      editPathShow: false,
      editPath: '',
      showHideFile: false,
      delObj: '',
      delDialog: false,
      renameBox: false,
      renameStr: '',
      fileInfo: '',
      fileInfoShow: false,
      fileAttr: [
        { name: 'overall.type', key: 'isDir' },
        { name: 'config.operationlog.ip', key: 'ip' },
        { name: 'asset.location', key: 'location' },
        { name: 'backup.size', key: 'size' },
        { name: 'terminal.modifyTime', key: 'uts' },
        { name: 'Owner', key: 'Owner' },
        { name: 'dashboard.panel.chartForm.group', key: 'group' },
        { name: 'config.menus.perms', key: 'permissionsString' }

      ]
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
    showEditPath () {
      this.editPath = this.fileDirectory
      this.editPathShow = true
    },
    hideEditPath () {
      this.editPath = ''
      this.editPathShow = false
    },
      goEditPath () {
      console.log('123123123')
      this.getSftpPath(this.editPath)
      setTimeout(() => {
        this.editPath = ''
        this.editPathShow = false
      })
    },
    selectFile (item) {
      if (item.isDir) {
        const path = this.fileDirectory == '/' ? '' : this.fileDirectory
        this.getSftpPath(path + '/' + item.name)
      }
    },
    showFileInfo (item) {
      console.log(item)
      this.fileInfo = item
      this.fileInfoShow = true
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
      const params = {
        uuid: this.uuid,
        path: path,
        showHideFile: this.showHideFile
      }
      this.fileDirectoryLoading = true
      this.$post('/terminal/sftp/ls', params).then(res => {
        if (res.code === 200) {
          this.fileDirectoryLoading = false
          this.fileDirectory = res.data.path
          this.fileList = res.data.list
          this.editPath = ''
          this.breadcrumb = res.data.path.split('/').filter(item => item)
        } else {
          this.$message.error(res.msg)
          this.editPath = ''
        }
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
        isError: false,
        importFileList: [],
        total: '',
        speed: '',
        fileLength: '',
        startTime: '',
        cancel: '',
        axios: '',
        timer: '',
        done: 0,
        delObj: ''
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
          isError: false,
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
    setRename () {
      this.renameBox = false
    },
    delFile () {
      const item = this.delObj
      const path = this.fileDirectory == '/' ? '' : this.fileDirectory
      const params = {
        uuid: this.uuid,
        path: path + '/' + item.name
      }
      this.$post('/terminal/sftp/rm', params).then(res => {
        if (res.code == 200) {
          this.delDialog = false
          this.getSftpPath(this.fileDirectory)
        } else {
          this.delDialog = false
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
    },
    selInfo (item, key) {
      if (key === 'isDir') {
        if (item.isDir) {
          return this.$t('terminal.catalogueFile')
        } else {
          return this.$t('backup.File')
        }
      }
      if (key === 'ip') {
        return this.host
      }
      // fileAttr: [
      //   { name: 'overall.type', key: 'isDir' },
      //   { name: 'config.operationlog.ip', key: 'ip' },
      //   { name: 'asset.location', key: 'location' },
      //   { name: 'backup.size', key: 'size' },
      //   { name: 'terminal.modifyTime', key: 'uts' },
      //   { name: 'Owner', key: 'Owner' },
      //   { name: 'dashboard.panel.chartForm.group', key: 'group' },
      //   { name: 'config.menus.perms', key: 'permissionsString' }
      //
      // ]
      if (key === 'location') {
        return this.fileDirectory
      }
      if (key === 'size' && !item.isDir) {
        return this.bytes(item.size, 0, 0)
      } else if (key === 'size' && item.isDir) {
        return ''
      }
      if (key === 'uts') {
        return this.momentTz(item.uts * 1000)
      }
      if (key === 'Owner') {
        return 'Owner'
      }
      if (key === 'group') {
        return 'group'
      }
      if (key === 'permissionsString') {
        return item.permissionsString
      }
      return '-'
    },
    tableOperation ([command, row, param]) {
      switch (command) {
        case 'rename':
          this.renameStr = row.name
          this.renameBox = true
          break
        case 'download':
          this.downloadFile(row)
          break
        case 'del':
          this.delObj = row
          this.delDialog = true
          // this.delFile(row)
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
