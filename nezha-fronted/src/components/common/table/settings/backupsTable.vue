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

      <div slot-scope="scope" v-else class="table-operation-items">
        <button class="table-operation-button" @click="Restore(scope.row)" v-if="scope.row" :title="$t('backup.RestoreNow')">
         <i class="nz-icon-shujubeifenhuifu nz-icon"></i>
        </button>
        <div v-if="scope.row" @click="tableOperation(scope.row)">
           <delete-button
            ref="deleteButton"
            :forceDeleteShow="false"
            id="backup-delete"
            :from="'backup'"
            :type="'btn'"
            :api="'/sys/backup'"
            :single="true"
            :delete-objs="singleDelete"
            @before="delFlag=true"
            ></delete-button>
          </div>
        <!-- <button class="table-operation-edit" @click="del(scope.row)" v-if="scope.row" :title="$t('overall.delete')">
          <i class="nz-icon nz-icon-delete" style="font-size='12px'"></i>
        </button> -->
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
import lodash from 'lodash'
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
    // del (row) {
    //   this.$delete('/sys/backup?filename=' + row.fileName).then(res => {
    //     if (res.code == 200) {
    //       this.$emit('getTableData', 'recent')
    //     } else {
    //       this.$message.error(res.msg)
    //     }
    //   })
    // },
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
    tableOperation (row) {
      this.$set(row, 'name', row.fileName)
      if (this.singleDelete.length === 0) {
        this.singleDelete.push(row)
      } else {
        this.singleDelete = []
        this.singleDelete.push(row)
      }
      console.log(this.singleDelete)
    }
  },

  watch: {
  }
}
</script>
<style lang='' scoped>
</style>
