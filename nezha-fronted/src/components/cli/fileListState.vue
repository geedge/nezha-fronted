<template>
  <div>
<!--    显示进度-->
    <div class="file-state-panel" v-show="fileStateBox && fileList.length" :style="{'top': position.top + 'px', right: '10px'}" ref="fileStatePanel" :class="position.top>0? 'translationOriginDown': 'translationOriginUp'">
      <div class="file-state-panel-header">
        <span class="file-state-panel-title">{{$t('terminal.filetransfer')}}}</span>
        <i class="nz-icon nz-icon-Clear" @click="clearFileList"></i>
      </div>
      <div class="file-state-panel-content" v-if="fileList.length">
        <div v-for="item in fileList" :key="item.myId" class="file-state-panel-item">
          <div class="item-icon"> <i class="nz-icon" :class="{'nz-icon-upload':item.type === 'upload','nz-icon-download1':item.type === 'download'}"/></div>
          <div class="item-progress">
            <div class="item-progress-top text-ellipsis">{{item.name}}</div>
            <div class="item-progress-middle">
              <el-progress :show-text="false" :percentage="item.done" :color="customColorMethod"></el-progress>
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
        top: 50,
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
          item.speed = self.bytes(item.speed, 0, 0) + '/s'
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
        if (item.done || (item.fileLength === item.total)) { // 取消 上传 50-100
          clearInterval(item.timer)
          this.$delete('/terminal/sftp/cancel/' + item.tid).then(res => {
            if (res.code === 200) {
            } else {
              this.$message.error(res.msg)
            }
          })
        }
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
          item.done = (item.fileLength / (item.total * 2)) * 100
        }

      }).then(response => {
        const res = response.data
        // item.isFinish = true
        if (res.code == 200) {
          self.nextUpload(item, res.data.tid)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    nextUpload (item, tid){
      // this.$message.success(response.msg)
      item.timer = setInterval(() => { // 上传 50-100
        item.tid = tid
        this.$get('/terminal/sftp/process/' + tid).then((res) => {
          item.done = 50 + parseInt(res.data.done) / 2
          item.speed = (item.fileLength + (item.done * 0.01 * item.total)) / ((new Date().getTime() - item.startTime) / 1000)
          item.speed = this.bytes(item.speed, 0, 0) + '/s'
          if (item.done === 100) {
            item.isFinish = true
            clearInterval(item.timer)
            // todo 上传成功后 刷新对应terminal
          }
        })
      }, 200)
    },
    fileStateShow (flag, type) {
      if (JSON.stringify(flag) == JSON.stringify(this.fileStateBox)) {
        return
      }
      if (flag) {
        this.fileStateBox = flag
        if (type === 'down') {
          this.position = {
            top: 45,
            right: 0
          }
        } else {
          this.position = {
            top: -195,
            right: 0
          }
        }
      }
      let animationClass = ''
      animationClass = flag ? 'zoomIn' : 'zoomOut'
      this.animateCSS(this.$refs.fileStatePanel, animationClass).then((message) => {
        this.fileStateBox = flag
      })
    },
    clearFileList () {
      const arr = this.fileList.filter(item => !item.isFinish)
      this.$store.dispatch('dispatchFileList', arr)
    }
  }
}
</script>

<style scoped lang="scss">

</style>
