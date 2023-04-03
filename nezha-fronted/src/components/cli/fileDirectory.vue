<template>
  <div class="fileDirectory">
    <div class="file-directory-header">
        {{$t('terminal.sftp')}}
        <span class="header-option">
<!--          <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>-->
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
      <span v-show="editPathShow" style="display: inline-block;flex: 1;padding-right: 40px">
        <el-input  v-model="editPath" size="mini" @keyup.enter.native="goEditPath">
          <span slot="suffix">
            {{$t('terminal.confirm')}}
          </span>
        </el-input>
      </span>
      <div class="path-option margin-r-15">
        <span style="margin-right: 5px">{{$t('terminal.showFile')}}: </span>
        <el-switch  v-model="showHideFile"/>
        <i class="nz-icon nz-icon-a-newfolder" @click="newFolderBoxShow = true"></i>
        <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
      </div>

    </div>
    <div style="padding: 0 20px;height: calc(100% - 50px)" v-my-loading="fileDirectoryLoading">
      <div class="directory-content-header">
        <div class="text-ellipsis file-name">
          <div class="file-arrow-header" style="cursor: pointer"  @click.stop="orderBy('nameOrderType','' , 'name')">
            <div>
              {{$t('overall.name')}}
            </div>
            <div class="nz-arrow-box">
              <div class="nz-arrow-up" :class="{
            'is-select': nameOrderType === 'asc'
            }" @click.stop="orderBy('nameOrderType','asc' , 'name')"></div>
              <div class="nz-arrow-down" :class="{
            'is-select': nameOrderType === 'desc'
            }" @click.stop="orderBy('nameOrderType','desc', 'name')"></div>
            </div>
          </div>
        </div>
        <div class="text-ellipsis file-size">
          <div class="file-arrow-header" style="cursor: pointer"  @click.stop="orderBy('sizeOrderType','' , 'size')">
            <div>
              {{$t('backup.size')}}
            </div>
            <div class="nz-arrow-box">
              <div class="nz-arrow-up" :class="{
            'is-select': sizeOrderType === 'asc'
            }" @click.stop="orderBy('sizeOrderType','asc' , 'size')"></div>
              <div class="nz-arrow-down" :class="{
            'is-select': sizeOrderType === 'desc'
            }" @click.stop="orderBy('sizeOrderType','desc', 'size')"></div>
            </div>
          </div>
        </div>
        <div class="text-ellipsis file-date">
          <div class="file-arrow-header" style="cursor: pointer"  @click.stop="orderBy('dateOrderType','' , 'cts')">
            <div>
              {{$t('issue.createTime')}}
            </div>
            <div class="nz-arrow-box" style="">
              <div class="nz-arrow-up" :class="{
            'is-select': dateOrderType === 'asc'
            }" @click.stop="orderBy('dateOrderType','asc', 'cts')"></div>
              <div class="nz-arrow-down" :class="{
            'is-select': dateOrderType === 'desc'
            }" @click.stop="orderBy('dateOrderType','desc', 'cts')"></div>
            </div>
          </div>
        </div>
        <div class="text-ellipsis file-opt">
          {{$t('overall.option')}}
        </div>
      </div>
      <div class="file-directory-content"
           onselectstart="return false;"
           style="-moz-user-select:none;">
        <div v-if="fileDirectory !== '/'" @dblclick.prevent="backFileDirectory" class="file-item">
          <div class="text-ellipsis file-name">
            <svg class="icon" aria-hidden="true">
              <use xlink:href='#nz-icon-muluwenjian'></use>
            </svg>
            ..
<!--            {{$t('terminal.back')}}-->
          </div>
        </div>
        <div
          v-for="(item,index) in fileList"
          v-show="showHideFile || !item.isHide"
          :key="index" class="file-item"
          onselectstart="return false;"
          style="-moz-user-select:none;"
          @dblclick.prevent="selectFile(item)"
        >
          <div class="text-ellipsis file-name">
<!--            <i class="nz-icon" :class=""/>-->
            <svg class="icon" aria-hidden="true">
              <use :xlink:href='selIcon(item)'></use>
            </svg>
            {{item.name}} <span v-if="item.isLink">-> {{item.linkName}}</span>
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
          <svg class="icon" aria-hidden="true">
            <use :xlink:href='selIcon(fileInfo)'></use>
          </svg>
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
      sizeOrderType: 0,
      dateOrderType: 0,
      nameOrderType: 0,
      breadcrumb: [],
      fileList: [],
      oldFileList: [],
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
        { name: 'dashboard.dashboard.chartForm.group', key: 'group' },
        { name: 'config.menus.perms', key: 'permissionsString' }

      ],
      oldRenameStr: ''
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
      return false
    },
    showFileInfo (item) {
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
        if (res.code === 200) {
          this.newFolderBoxShow = false
          this.getSftpPath(this.fileDirectory)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    backFileDirectory () {
      const arr = this.fileDirectory.split('/')
      arr.pop()
      const path = arr.join('/')
      this.getSftpPath(path || '/')
      return false
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
          res.data.list.forEach(item => {
            if (item.name[0] === '.') {
              item.isHide = true
            }
          })
          this.fileList = res.data.list
          this.oldFileList = res.data.list
          this.editPath = ''
          this.breadcrumb = res.data.path.split('/').filter(item => item)
          if (this.nameOrderType) {
            this.orderBy('nameOrderType', this.nameOrderType, 'name')
          }
          if (this.sizeOrderType) {
            this.orderBy('sizeOrderType', this.sizeOrderType, 'size')
          }
          if (this.dateOrderType) {
            this.orderBy('dateOrderType', this.dateOrderType, 'cts')
          }
        } else {
          this.fileDirectoryLoading = false
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
      const params = {
        uuid: this.uuid,
        oldPath: this.fileDirectory + '/' + this.oldRenameStr,
        newPath: this.fileDirectory + '/' + this.renameStr
      }
      this.$put('/terminal/sftp/rename', params).then(res => {
        this.renameBox = false
        if (res.code == 200) {
          this.getSftpPath(this.fileDirectory)
        } else {
          this.$message.error(res.msg)
        }
      })
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
      let str = ''
      if (item.isDir) {
        str = '#nz-icon-muluwenjian'
      }
      if (item.isReg) {
        str = '#nz-icon-putongwenjian'
      }
      if (item.isFifo) {
        str = '#nz-icon-guandaowenjian1'
      }
      if (item.isSock) {
        str = '#nz-icon-taojieziwenjian'
      }
      if (item.isBlk) {
        str = '#nz-icon-zifushebeiwenjian1'
      }
      if (item.isLink) {
        str += 'lianjie'
      }
      if (str) {
        return str
      }
      return '#nz-icon-muluwenjian'
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
      //   { name: 'dashboard.dashboard.chartForm.group', key: 'group' },
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
        return item.uid
      }
      if (key === 'group') {
        return item.gid
      }
      if (key === 'permissionsString') {
        return item.permissionsString
      }
      return '-'
    },
    resetState (type) {
      if (type == 'sizeOrderType') {
        this.dateOrderType = 0
        this.nameOrderType = 0
      }
      if (type == 'dateOrderType') {
        this.sizeOrderType = 0
        this.nameOrderType = 0
      }
      if (type == 'nameOrderType') {
        this.sizeOrderType = 0
        this.dateOrderType = 0
      }
    },
    orderBy (key, type, order) {
      let orderType = type
      if (!orderType) {
        orderType = this[key] === 'asc' ? 'desc' : 'asc'
      }
      this.resetState(key)
      if (this[key] == orderType) {
        this[key] = 0
        this.fileList = this.oldFileList
      } else if (orderType == 'nameOrderType') {
        this[key] = orderType
        let isDirArr = this.oldFileList.filter(item => item.isDir)
        let isRegArr = this.oldFileList.filter(item => !item.isDir)
        isDirArr = this.$loadsh.orderBy(isDirArr, [user => user.name.toLowerCase()], [orderType])
        isRegArr = this.$loadsh.orderBy(isRegArr, [user => user.name.toLowerCase()], [orderType])
        this.fileList = []
        if (orderType === 'asc') {
          this.fileList = this.fileList.concat(isDirArr, isRegArr)
        } else {
          this.fileList = this.fileList.concat(isRegArr, isDirArr)
        }
      } else {
        this[key] = orderType
        let isDirArr = this.oldFileList.filter(item => item.isDir)
        let isRegArr = this.oldFileList.filter(item => !item.isDir)
        isDirArr = this.$loadsh.orderBy(isDirArr, order, orderType)
        isRegArr = this.$loadsh.orderBy(isRegArr, order, orderType)
        this.fileList = []
        if (orderType === 'asc') {
          this.fileList = this.fileList.concat(isDirArr, isRegArr)
        } else {
          this.fileList = this.fileList.concat(isRegArr, isDirArr)
        }
      }
    },
    tableOperation ([command, row, param]) {
      switch (command) {
        case 'rename':
          this.renameStr = row.name
          this.oldRenameStr = row.name
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
