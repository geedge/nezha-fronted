<template>
  <div>
    <!-- 显示进度 -->
    <div class="file-state-panel" v-show="fileStateBox && fileList.length" :style="{'top': position.top + 'px', right: '10px'}" ref="fileStatePanel" :class="position.top>0? 'translationOriginDown': 'translationOriginUp'">
      <div class="file-state-panel-header">
        <span class="file-state-panel-title">{{$t('terminal.filetransfer')}}</span>
        <i class="nz-icon nz-icon-Clear" @click="clearFileList"></i>
      </div>
      <div class="file-state-panel-content" v-if="fileList.length">
        <div v-for="item in fileList" :key="item.myId" class="file-state-panel-item">
          <div class="item-icon"> <i class="nz-icon" :class="{'nz-icon-upload':item.type === 'upload','nz-icon-download1':item.type === 'download'}"/></div>
          <div class="item-progress">
            <div class="item-progress-top text-ellipsis">{{item.name}}</div>
            <div class="item-progress-middle">
              <el-progress :show-text="false" :percentage="item.done" :color="customColorMethod(item.done, item)"></el-progress>
            </div>
            <div class="item-progress-bottom">
              <span>{{bytes(item.total, 0, 0)}}</span>
              <span v-if="!item.isFinish && !item.isError">{{item.speed}}</span>
              <span v-if="item.isFinish">Completed</span>
              <span v-if="item.isError">Error</span>
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
    <!-- 上传文件 -->
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
    <!-- 确认覆盖弹窗 -->
    <el-dialog
      class="nz-dialog snapshot-dialog no-style-class"
      width="472px"
      :title="$t('deleteButton.confirm')"
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="checkDialog"
      @close="checkDialog = false"
    >
      <div style="display: flex; align-items: center" >{{$t('terminal.replace')}}</div>
      <div slot="footer">
        <div class="el-message-box__btns">
          <button class="nz-btn el-button el-button--small el-button--default" @click="checkDialog = false" >
            <span>{{$t('tip.no')}}</span>
          </button>
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="checkConfirm">
            <span style="text-transform:Capitalize">{{$t('tip.yes')}}</span>
          </button>
        </div>
      </div>
    </el-dialog>
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
      position: {
        top: 50,
        right: 0
      },
      fileStateBox: false,
      chunkSize: 10 * 1024 * 1024, // 每个分片大小为10MB
      importFileList: [],
      checkDialog: false
    }
  },
  watch: {
    fileList: {
      immediate: true,
      handler (n) {
        if (!n.length) {
          this.fileStateBox = false
        }
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
    customColorMethod (percentage, item) {
      if (item.isError) {
        return '#EC7F66'
      }
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
          item.done = (item.fileLength / item.total) * 100
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
        item.isError = true
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
    async importChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadItem.importFileList = [fileList[fileList.length - 1]]
      }
      const params = {
        uuid: this.uploadItem.uuid,
        path: this.uploadItem.path,
        fileName: file.name
      }
      const res = await this.$get('/terminal/sftp/upload/check', params)
      if (res.code === 200) { // 存在同名文件
        this.checkDialog = true
      } else { // 不存在同名文件
        this.$store.dispatch('dispatchAddFileList', this.uploadItem)
      }
    },
    checkConfirm () {
      this.$store.dispatch('dispatchAddFileList', this.uploadItem)
      this.checkDialog = false
    },
    async upload (item) {
      const file = item.importFileList[0].raw
      item.name = file.name
      // 计算总共有多少个分片
      const totalChunks = Math.ceil(file.size / this.chunkSize)
      const chunks = this.sliceFile(file, totalChunks)
      this.uploadChunk(item, file, chunks)
    },
    // 分片上传
    async uploadChunk (item, file, chunks) {
      const self = this
      const CancelToken = axios.CancelToken
      for (const chunk of chunks) {
        const findIndex = this.fileList.findIndex(subItem => item.myId == subItem.myId)
        if (findIndex == -1) { // 上传被取消时 终止循环
          return
        }
        item.cancel = CancelToken.source()
        const form = new FormData()
        form.append('uuid', item.uuid)
        form.append('path', item.path)
        form.append('fileName', file.name)
        form.append('replace', 1)
        form.append('totalSize', file.size)
        form.append('chunkSize', chunk.file.size)
        form.append('chunkStart', chunk.chunkStart)
        form.append('chunkFile', chunk.file)
        try {
          const response = await axios({
            url: '/terminal/sftp/upload',
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form,
            cancelToken: item.cancel.token,
            onUploadProgress: function (progressEvent) {
              // 处理原生进度事件
              item.total = file.size
              const loaded = item.fileLength + progressEvent.loaded
              item.speed = loaded / ((new Date().getTime() - item.startTime) / 1000)
              item.speed = self.bytes(item.speed, 0, 0) + '/s'
              item.done = Math.min((loaded / item.total) * 100, 100)
            }
          })
          const res = response.data
          if (res.code == 200) {
            item.fileLength += res.data.uploadSize
          } else {
            item.isError = true
            this.$message.error(res.msg)
            return false
          }
        } catch (error) {
          item.isError = true
          this.$message.error(error)
          return false
        }
      }
      item.isFinish = true
      this.$store.dispatch('upDateConsole', item.uuid)
    },
    sliceFile (file, totalChunks) {
      if (totalChunks == 0) { // file为0字节时
        return [{
          file: file,
          chunkStart: 0
        }]
      }
      // 定义一个数组存放所有的分片
      const chunks = []
      // 遍历所有的分片
      for (let i = 0; i < totalChunks; i++) {
        // 利用slice方法获取每个分片
        const start = i * this.chunkSize
        const end = Math.min(start + this.chunkSize, file.size)
        const blob = file.slice(start, end)
        // 将每个分片添加到数组中
        chunks.push({
          file: blob,
          chunkStart: start
        })
      }
      return chunks
    },
    removeRecord (item) {
      if (!item.isFinish) {
        item.cancel.cancel('operation canceled by the user.')
      }
      this.$store.dispatch('dispatchDelFileList', item)
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
      this.fileList.forEach(item => {
        this.removeRecord(item)
      })
      setTimeout(() => {
        this.$store.dispatch('dispatchFileList', [])
      })
    }
  }
}
</script>
