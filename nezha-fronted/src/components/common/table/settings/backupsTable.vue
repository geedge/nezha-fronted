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
        <button class="table-operation-button" @click="backupNow(scope.row)">
         <i class="nz-icon-beifen nz-icon"></i>
        </button>
        <button class="table-operation-edit" @click="edit(scope.row)">
         <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>

      <div slot-scope="scope" v-else class="table-operation-items">
        <button class="table-operation-button" @click="Restore(scope.row)">
         <i class="nz-icon-shujubeifenhuifu nz-icon"></i>
        </button>
        <button class="table-operation-edit" @click="del(scope.row)">
          <i class="nz-icon nz-icon-delete" style="font-size='12px'"></i>
        </button>
      </div>
    </el-table-column>
  </el-table>
</div>
</template>

<script>
import { post, put } from '@/http'
import lodash from 'lodash'
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

  components: {},

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
      put('/sys/backup/restore', { filename: row.fileName }).then(res => {
        if (res.code == 200) {
          this.$emit('getTableData', 'recent')
          this.$message.success(this.$t('backup.Restore'))
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    del (row) {
      this.$delete('/sys/backup?filename=' + row.fileName).then(res => {
        if (res.code == 200) {
         this.$emit("getTableData", 'recent')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    changeDate (item) {
      const time = Date.parse(item)
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
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    edit () {
      this.$emit('edit', this.tableData[0])
    }
  },

  watch: {
  }
}
</script>
<style lang='' scoped>
</style>
