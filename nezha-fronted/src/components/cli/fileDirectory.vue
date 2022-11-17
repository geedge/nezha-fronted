<template>
  <div class="fileDirectory">
    <div class="file-directory-header">
      <span style="color: #fff">SFTP <span style="color: #B7B7B7">{{fileDirectory}}</span></span>
      <span  style="color: #fff">
          <i class="nz-icon nz-icon-a-newfolder" @click="newFolderBoxShow = true"></i>
          <i class="nz-icon nz-icon-upload" @click="uploadFile"></i>
          <i class="nz-icon nz-icon-close" @click="$emit('close')"></i>
        </span>
    </div>
    <div class="file-directory-content">
      <div v-if="fileDirectory !== '/'" @click="backFileDirectory" class="file-item"><i class="nz-icon nz-icon-a-upperlevel"/>上一级</div>
      <div v-for="(item,index) in fileList" :key="index" class="file-item" @click="selectFile(item)">
        <span>
          <i class="nz-icon" :class="selIcon(item)"/>
          {{item.name}}
        </span>
        <span>
          <i class="nz-icon nz-icon-download1" v-if="!item.isDir" @click="downloadFile(item)"></i>
          <i class="nz-icon nz-icon-delete" v-if="!item.isDir" @click="delFile(item)"></i>
        </span>
      </div>
    </div>
    <el-dialog
      title='新建文件夹'
      :visible.sync="newFolderBoxShow"
      :modal-append-to-body="false"
      :append-to-body="false"
      width="30%"
      >
      <div>
        <el-input v-model="folder" size="small"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newFolder(false)">取 消</el-button>
        <el-button type="primary" @click="newFolder(true)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'fileDirectory',
  props: {
    uuid: {}
  },
  data () {
    return {
      fileDirectory: '/',
      fileList: [],
      newFolderBoxShow: false,
      folder: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
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
        console.log(res)
        this.newFolderBoxShow = false
        this.getSftpPath(this.fileDirectory)
      })
    },
    backFileDirectory () {
      const arr = this.fileDirectory.split('/')
      arr.pop()
      console.log(arr, this.fileDirectory.split('/').pop())
      const path = arr.join('/')
      console.log(path)
      this.getSftpPath(path || '/')
    },
    getSftpPath (path) {
      const params = {
        uuid: this.uuid,
        path: path
      }
      this.$post('/terminal/sftp/ls', params).then(res => {
        this.fileDirectory = res.data.path
        this.fileList = res.data.list
        console.log(res)
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
        axios: ''
      }
      this.$store.dispatch('uploadFile', params)
    },
    downloadFile (item) {
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
 .fileDirectory {
   height: 80%;
   position: absolute;
   bottom: 0;
   background: #1E1E1E;
   box-shadow: 5px 0 3px 0 #5E5E5E;
   width: 100%;
   z-index: 10;
   /deep/ .el-menu::-webkit-scrollbar-thumb {
     background-color: #fff;
     border-radius: 3px;
   }
   /deep/  .el-menu::-webkit-scrollbar-thumb:hover {
     background-color: #fff;
     border-radius: 3px;
   }
   .file-directory-header{
     display: flex;
     width: 100%;
     justify-content: space-between;
     padding: 0 10px;
     background: #1E1E1E;
     box-sizing: border-box;
     color: #ffffff;
     i {
       margin-right: 22px;
     }
   }
   .file-directory-content{
     height: calc(100% - 26px);
     overflow: auto;
   }
   .file-item{
     font-family: Roboto-Regular;
     font-size: 14px;
     color: #B7B7B7;
     line-height: 21px;
     font-weight: 400;
     margin-top: 8px;
   }
   .file-item:hover{
     background: rgba(255,134,0,0.50);
     font-family: Roboto-Regular;
     font-size: 14px;
     color: #FF9230;
     line-height: 21px;
     font-weight: 400;
   }
 }
</style>
