<template>
<div class="backups-table">
  <el-table :data="isConfigurations ? tableData : tableData2" border>
    <el-table-column
      class="table-column__head"
      v-for="(item, index) in customTableTitle"
      :key="`col-${index}`"
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
      </template>
    </el-table-column>
    <el-table-column :resizable="false" fixed="right"
    width="165px"
    >
      <div
        slot-scope="scope"
        class="table-operation-items"
        v-if="isConfigurations"
      >
        <button class="table-operation-button" @click="backupNow(scope.row)" :title="$t('config.backup')">
         <i class="nz-icon-beifen nz-icon"></i>
        </button>
        <button class="table-operation-edit" @click="edit(scope.row)" :title="$t('backup.edit')">
         <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>

       <div slot-scope="scope" class="table-operation-items" v-else>
        <button class="table-operation-item" :title="$t('overall.download')" v-has="'backup_download'" @click="downloadBackup(scope.row)"><i class="nz-icon nz-icon-download"></i></button>
        <el-dropdown size="medium" v-has="['backup_restore','backup_del']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'backup_restore'" :command="['restore', scope.row]" disabled><i class="nz-icon-shujubeifenhuifu nz-icon"></i><span>{{$t('backup.RestoreNow')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'backup_del'" :command="['delete', scope.row]">
                  <delete-button
                    ref="deleteButton"
                    :forceDeleteShow="false"
                    id="backup-delete"
                    :from="'backup'"
                    :type="'link'"
                    :title="$t('overall.delete')"
                    :api="'/sys/backup'"
                    :single="true"
                    :delete-objs="singleDelete"
                    @before="delFlag=true"
                    ></delete-button>
              </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
     <template slot="empty">
        <div  v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
  </el-table>
</div>
</template>

<script>
import { post, put } from '@/http'
import axios from 'axios'
import bus from '@/libs/bus'
import deleteButton from '@/components/common/deleteButton'

export default {
  name: 'backupsTable',
  mixins: [],
  components: { deleteButton },
  props: {
    loading: Boolean,
    customTableTitle: Array,
    isConfigurations: Boolean,
    tableData: Array,
    tableData2: Array
  },
  data () {
    return {
      singleDelete: []
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
    Restore (row) {
      let ts = true
      if (ts) {
        ts = false
        setTimeout(() => {
          ts = true
          put('/sys/backup/restore', { filename: row.fileName }).then(res => {
            if (res.code == 200) {
              this.$emit('getTableData', 'recent')
              this.$message.success(this.$t('backup.Restore'))
            } else {
              this.$message.error(res.msg)
            }
          })
        }, 400)
      }
    },
    changeDate (item) {
      const time = this.utcTimeToTimezoneStr(item)
      const time1 = this.timeFormate(time)
      return time1
    },
    getNum (item) {
      return bus.getNumStr(item)
    },
    backupNow (item) {
      post('/sys/backup').then((res) => {
        if (res.code == 200) {
          this.$message.success(this.$t('backup.backupNow'))
          bus.$emit('backupNow')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    edit () {
      this.$emit('edit', this.tableData[0])
    },
    tableOperation ([command, row]) {
      switch (command) {
        case 'delete': {
          this.$set(row, 'name', row.fileName)
          if (this.singleDelete.length === 0) {
            this.singleDelete.push(row)
          } else {
            this.singleDelete = []
            this.singleDelete.push(row)
          }
          break
        }
        case 'restore': {
          this.Restore(row)
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
<style lang='' scoped>
</style>
