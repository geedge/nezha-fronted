<template>
  <div class="backups-table">
    <el-table :data="isConfigurations ? tableData : tableData2" border>
      <el-table-column
        class="table-column__head"
        v-for="(item, index) in customTableTitle"
        :key="`col-${index}-${item.prop}`"
        :width="`${item.width}`"
        :min-width="`${item.minWidth}`"
        :label="item.label"
        :prop="item.prop"
        :resizable="true"
      >
        <template slot="header">
          <span class="data-column__span">{{ item.label }}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop === 'schedule'">
            {{ tableData[0].schedule && changeType(tableData[0].schedule.type)? changeType(tableData[0].schedule.type):''}}
          </span>
          <span v-if="item.prop === 'retention'">
            {{ tableData[0].retention }}
          </span>
          <span v-if="item.prop === 'state'">
            <el-switch class="switch" v-model="tableData[0].state" disabled> </el-switch>
          </span>
          <span v-if="item.prop === 'time'">
            {{ scope.row.time ? changeDate(scope.row.time ) : "" }}
          </span>
          <span v-if="item.prop === 'size'">
            {{ scope.row.size ? getNum(scope.row.size) : "" }}
          </span>
          <span v-if="item.prop === 'fileName'"> {{ scope.row.fileName }} </span>
          <span v-if="item.prop === 'remark'"> {{ scope.row.remark }} </span>
        </template>
      </el-table-column>
      <el-table-column :resizable="false" fixed="right"
      width="165px"
      >
        <div  slot-scope="scope">
          <div
            v-if="isConfigurations"
            class="table-operation-items"
          >
            <button class="table-operation-button" @click="backupNow(scope.row)" :title="$t('config.backup')">
              <i class="nz-icon-beifen nz-icon"></i>
            </button>
            <button class="table-operation-edit" style="cursor: pointer" @click="edit(scope.row)" :title="$t('backup.edit')">
              <i class="nz-icon-gear nz-icon"></i>
            </button>
          </div>
          <div v-if="!isConfigurations" class="table-operation-items">
            <button class="table-operation-item" :title="$t('overall.download')" v-has="'backup_download'" @click="downloadBackup(scope.row)"><i class="nz-icon nz-icon-download"></i></button>
            <el-dropdown size="medium" v-has="['backup_restore','backup_del']" trigger="click" @command="tableOperation">
              <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
                <i class="nz-icon nz-icon-more3"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <el-dropdown-item v-has="'backup_restore'" :command="['restore', scope.row]"><i class="nz-icon-shujubeifenhuifu nz-icon"></i><span>{{$t('backup.recovery')}}</span></el-dropdown-item>
                <el-dropdown-item v-has="'backup_del'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true,from:'backup'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-table-column>
      <template slot="empty">
          <div v-if="!loading" class="table-no-data">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#nz-icon-no-data-list"></use>
            </svg>
            <div class="table-no-data__title">No results found</div>
          </div>
          <div v-else>&nbsp;</div>
        </template>
    </el-table>
    <!-- backup -->
    <el-dialog
      class="backup-dialog"
      width="580px"
      :title='$t("config.backup")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="backupDialog"
      @close="closeBackup"
    >
      <div class="backup-tip">
        <i class="nz-icon nz-icon-jinggao"></i>
        <div>
          <p>{{$t('backup.backupData')}}</p>
          <p>{{$t('backup.backupWait')}}</p>
        </div>
      </div>
      <p class="backup-text" style="margin-top:20px;margin-bottom:6px;">{{$t('overall.remark')}}</p>
      <el-input
        v-model="backupForm.remark"
        maxlength="256"
        size="small"
        show-word-limit
        type="textarea">
      </el-input>
      <div slot="footer">
        <button class="nz-btn nz-btn-size-normal nz-btn-style-light margin-r-10" @click="closeBackup">{{$t("overall.cancel")}}</button>
        <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="backupConfirm">{{$t('backup.backup')}}</button>
      </div>
    </el-dialog>
    <!-- restore -->
    <el-dialog
      class="backup-dialog"
      width="580px"
      :title='$t("backup.confirmRecovery")'
      destroy-on-close
      :modal-append-to-body="false"
      :visible.sync="restoreDialog"
      @close="closeRestore"
    >
      <p class="backup-text">{{$t('backup.restorePoint')}}</p>
      <div class="backup-pre">
        <p>
          <span>{{$t('overall.time')}}：</span>
          <span>{{utcTimeToTimezoneStr(restoreForm.file.time)}}</span>
        </p>
        <p>
          <span>{{$t('backup.File')}}：</span>
          <span>{{restoreForm.file.fileName}}</span>
        </p>
        <p>
          <span>{{$t('overall.remark')}}：</span>
          <span>{{restoreForm.file.remark}}</span>
        </p>
      </div>
      <p class="backup-text">{{$t('backup.enterPassword')}}</p>
      <el-input :placeholder="$t('login.pin')" v-model="restoreForm.pin" show-password size="small"></el-input>
      <div class="backup-tip">
        <i class="nz-icon nz-icon-jinggao1"></i>
        <div>
          <p>{{$t('backup.restoreData')}}</p>
          <p>{{$t('backup.restoreRestart')}}</p>
        </div>
      </div>
      <div slot="footer">
        <button class="nz-btn nz-btn-size-normal nz-btn-style-light margin-r-10" @click="closeRestore">{{$t("overall.cancel")}}</button>
        <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" :class="{'nz-btn-disabled': prevent_opt.save||!restoreForm.pin}" :disabled="prevent_opt.save||!restoreForm.pin" @click="restoreConfirm">{{$t('backup.recovery')}}</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { post, put } from '@/http'
import axios from 'axios'
import bus from '@/libs/bus'

export default {
  name: 'backupsTable',
  mixins: [],
  props: {
    loading: Boolean,
    customTableTitle: Array,
    isConfigurations: Boolean,
    tableData: Array,
    tableData2: Array
  },
  data () {
    return {
      singleDelete: [],
      restoreDialog: false,
      restoreForm: {
        pin: '',
        file: {}
      },
      backupDialog: false,
      backupForm: {
        remark: ''
      }
      // tableData: [
      //   {
      //     retention: '',
      //     state: '',
      //     schedule: {
      //       repeat: '',
      //       stime: '',
      //       type: '',
      //       nums: []
      //     }
      //   }
      // ],
      // tableData2: [
      //   {
      //     fileName: '',
      //     time: '',
      //     size: ''
      //   }
      // ]
    }
  },
  computed: {},

  methods: {
    changeType (item) {
      if (item == 1) {
        return this.$t('backup.only')
      } else if (item == 2) {
        return this.$t('backup.Daily')
      } else if (item == 3) {
        return this.$t('backup.Weekly')
      } else {
        return this.$t('backup.Monthly')
      }
    },
    backupConfirm () {
      this.$store.dispatch('dispatchHomeLoading', true)
      this.$post('/sys/backup', this.backupForm).then((res) => {
        this.$store.dispatch('dispatchHomeLoading', false)
        if (res.code == 200) {
          this.$message.success(this.$t('backup.backupNow'))
          bus.$emit('backupNow')
        } else {
          this.$message.error(res.msg)
        }
      })
      this.closeBackup()
    },
    closeBackup () {
      this.backupDialog = false
      this.backupForm = {
        remark: ''
      }
    },
    backupNow () {
      this.backupDialog = true
    },
    restoreConfirm () {
      this.prevent_opt.save = true
      const param = {
        pin: this.restoreForm.pin,
        filename: this.restoreForm.file.fileName
      }
      put('/sys/backup/restore', param).then(res => {
        if (res.code == 200) {
          this.closeRestore()
          this.$emit('getTableData', 'recent')
          this.$message.success(this.$t('backup.recoverySuccess'))
        } else {
          this.$message.error(res.msg)
        }
        this.prevent_opt.save = false
      })
    },
    closeRestore () {
      this.restoreDialog = false
      this.restoreForm = {
        pin: '',
        file: {}
      }
    },
    restore (row) {
      this.restoreDialog = true
      this.restoreForm.file = row
    },
    changeDate (item) {
      const time = this.utcTimeToTimezoneStr(item)
      const time1 = this.timeFormate(time)
      return time1
    },
    getNum (item) {
      return bus.getNumStr(item)
    },
    edit () {
      this.$emit('edit', this.tableData[0])
    },
    tableOperation ([command, row, param]) {
      switch (command) {
        case 'delete-rel': {
          row.name = row.fileName
          this.$store.dispatch('deleteTableRel', {
            row: row,
            url: '/sys/backup',
            ...param
          })
          break
        }
        case 'restore': {
          this.restore(row)
          break
        }
        default:
          break
      }
    },
    downloadBackup (backup) {
      this.$store.dispatch('dispatchHomeLoading', true)
      axios.get('/sys/backup/download?filename=' + backup.fileName, { responseType: 'blob' }).then(data => {
        let fileName = new Date().getTime() + '.txt'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
        this.$store.dispatch('dispatchHomeLoading', false)
      })
    }
  },
  watch: {
  }
}
</script>
