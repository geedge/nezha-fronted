<template>
  <div>
<!--    显示进度-->
    <div class="file-state-panel" v-show="fileStateBox" :style="{'top': position.top + 'px', right: '10px'}">
      <div class="file-state-panel-header">
        <span class="file-state-panel-title">File transfers</span>
        <i class="nz-icon nz-icon-delete"></i>
      </div>
      <div class="file-state-panel-content" v-if="fileList.length">
        <div v-for="item in fileList" :key="item.myId" class="file-state-panel-item">
          <div class="item-icon"> <i class="nz-icon" :class="{'nz-icon-upload':item.type === 'upload','nz-icon-download1':item.type === 'download'}"/></div>
          <div class="item-progress">
            <div class="item-progress-top text-ellipsis">{{item.name}}</div>
            <div class="item-progress-middle">
              <el-progress :show-text="false" :percentage="(item.fileLength/item.total) * 100" :color="customColorMethod"></el-progress>
            </div>
            <div class="item-progress-bottom">
              <span>{{bytes(item.total, 0, 0)}}</span>
              <span>{{item.speed}}</span>
            </div>
          </div>
          <div class="item-state">
            <i v-if="item.isFinish" class="nz-icon nz-icon-check" @click="removeRecord(item)"/>
            <i v-else class="nz-icon nz-icon-close" @click="removeRecord(item)"/>
          </div>
        </div>
      </div>
      <div v-else class="file-nodata">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div class="table-no-data__title">No results found</div>
      </div>
    </div>
    <!--    上传文件-->
    <div style="display: none">
      <el-upload
        :ref="'upload'"
        :auto-upload="false"
        :on-change="importChange"
        :multiple="false"
        :file-list="importFileList"
        action=""
        class="upload-demo"
        drag>
      </el-upload>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'fileListState',
  computed: {
    fileList () {
      return this.$store.getters.getFileList
    },
    uploadItem () {
      return this.$store.getters.getUploadItem
    }
  },
  data () {
    return {
      myFileList: [],
      importFileList: [],
      position: {
        top: 10,
        right: 0
      },
      fileStateBox: false
    }
  },
  watch: {
    fileList: {
      immediate: true,
      handler (n) {
        n.forEach(item => {
          console.log(item.isStart)
          if (!item.isStart) {
            item.total = 1
            item.fileLength = 0
            item.startTime = new Date().getTime()
            item.speed = '0b/s'
            if (item.type === 'download') {
              item.isStart = true
              this.download(item)
            }
            if (item.type === 'upload') {
              item.isStart = true
              this.upload(item)
            }
          }
        })
      }
    },
    uploadItem: {
      handler (n) {
        if (n && n.myId) {
          console.log(this.$refs.upload)
          this.$refs.upload.$children[0].$refs.input.click()
        }
      }
    }
  },
  methods: {
    bytes: chartDataFormat.getUnit(7).compute,
    customColorMethod (percentage) {
      if (percentage < 100) {
        return '#3B92F1'
      } else {
        return '#21BF9A'
      }
    },
    download (item) {
      const self = this
      const CancelToken = axios.CancelToken
      item.cancel = CancelToken.source()
      item.startTime = new Date().getTime()
      const params = {
        uuid: item.uuid,
        path: item.path
      }
      axios.post('/terminal/sftp/download', {
        ...params
      }, {
        responseType: 'blob',
        cancelToken: item.cancel.token,
        onDownloadProgress: function (progressEvent) {
          // 处理原生进度事件
          item.total = progressEvent.total
          item.fileLength = progressEvent.loaded
          item.speed = item.fileLength / ((new Date().getTime() - item.startTime) / 1000)
          item.speed = self.bytes(item.speed, 0 , 0) + '/s'
          // this.$set(this.fileList, 0,item)
        }
      }).then(res => {
        item.isFinish = true
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, item.name)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = item.name
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    importChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadItem.importFileList = [fileList[fileList.length - 1]]
      }
      if (this.uploadItem.importFileList.length) {
        this.$store.dispatch('dispatchAddFileList', this.uploadItem)
      }
    },
    removeRecord (item) {
      if (!item.isFinish) {
        item.cancel.cancel('operation canceled by the user.')
      }
      this.$store.dispatch('dispatchDelFileList', item)
    },
    upload (item) {
      const self = this
      const CancelToken = axios.CancelToken
      item.cancel = CancelToken.source()
      const form = new FormData()
      const importFile = item.importFileList[0]
      item.name = importFile.name
      form.append('file', importFile.raw)
      form.append('uuid', item.uuid)
      form.append('path', item.path)
      axios({
        url: '/terminal/sftp/upload',
        method: 'PUT',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: form,
        cancelToken: item.cancel.token,
        onUploadProgress: function (progressEvent) {
          // 处理原生进度事件
          item.total = progressEvent.total
          item.fileLength = progressEvent.loaded
          item.speed = item.fileLength / ((new Date().getTime() - item.startTime) / 1000)
          item.speed = self.bytes(item.speed, 0, 0) + '/s'
        }

      }).then(response => {
        console.log(response)
        item.isFinish = true
        if (response.code == 200) {
          this.$message.success(response.msg)
          // todo 上传成功后 刷新对应terminal
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    fileStateShow (flag, type) {
      this.fileStateBox = flag
      if (flag) {
        // if (type === 'top') {
        //   this.position = {
        //     top: '',
        //     right: ''
        //   }
        // } else {
        //   this.position = {
        //     top: '',
        //     right: ''
        //   }
        // }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.file-state-panel{
  position: absolute;
  z-index: 10;
  right:0;
  top:-100px;
  max-height: 194px;
  min-width: 96px;
  width: 308px;
  background: #222329;
  box-shadow: 1px 1px 4px -1px #1E1E1E;
  border-radius: 2px;
  /deep/ .file-state-panel-content::-webkit-scrollbar-thumb {
    background-color: #fff;
    border-radius: 3px;
  }
  /deep/  .file-state-panel-content::-webkit-scrollbar-thumb:hover {
    background-color: #fff;
    border-radius: 3px;
  }
  .file-state-panel-header{
    height: 48px;
    background: #222329;
    box-shadow: 0 1px 0 0 #19191C;
    padding: 0 20px;
    line-height: 48px;
  }
  .file-state-panel-title{
    font-size: 14px;
    color: #E7EAED;
    letter-spacing: 0;
    font-weight: 500;
  }
  .file-state-panel-content {
    min-height: 50px;
    max-height: 146px;
    line-height: 48px;
    width: 100%;
    overflow-y: auto;
    .file-state-panel-item{
      height: 48px;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px 0px 20px;
      display: flex;
      justify-content: space-around;
      .item-icon{
        width: 28px;
        height: 28px;
        background: #19191C;
        border-radius: 2px;
        color: #fff;
        display: flex;
        justify-items: center;
        justify-content: center;
        align-items: center;
        flex-shrink:0;
      }
      .item-progress{
        width: calc(100% - 86px);
        flex: 1;
        margin: 0 10px;
        display: flex;
        flex-direction: column;
        .item-progress-top{
          width: 100%;
          color: #fff;
          height: 15px;
          line-height: 15px;
          font-size: 12px;
          font-weight: 400;
        }
        .item-progress-middle{
        }
        .item-progress-bottom{
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #B7B7B7;
          line-height: 12px;
          font-weight: 400;
        }
      }
      .item-state{
        flex-shrink:0;
        width: 28px;
        height: 28px;
        color: #fff;
        line-height: 28px;
      }
    }
  }
  .file-nodata{
    text-align: center;
    color: #b7b7b7;
    padding-top: 20px;
    padding-bottom: 15px;
    .table-no-data__title{
      text-align: center;
      color: #b7b7b7;
    }
  }
}
</style>
